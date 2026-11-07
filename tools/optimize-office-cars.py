"""Offline OBJ / binary FBX ingestion and QEM reduction for the office shelves."""
from pathlib import Path
import array, collections, json, struct, zipfile, zlib
import numpy as np
import fast_simplification

ROOT = Path(__file__).resolve().parents[1]

def fbx_nodes(data):
    version = struct.unpack_from('<I', data, 23)[0]
    wide = version >= 7500
    header = '<QQQB' if wide else '<IIIB'
    size = struct.calcsize(header)
    types = {'Y':'h','C':'?','I':'i','F':'f','D':'d','L':'q'}
    arrays = {'f':'<f4','d':'<f8','i':'<i4','l':'<i8','b':'u1','c':'u1'}
    def node(at):
        end, count, length, namelen = struct.unpack_from(header, data, at)
        if not end: return None, at + size
        at += size; name = data[at:at+namelen].decode(); at += namelen; props = []
        for _ in range(count):
            t = chr(data[at]); at += 1
            if t in types:
                fmt = '<'+types[t]; props.append(struct.unpack_from(fmt,data,at)[0]); at += struct.calcsize(fmt)
            elif t in arrays:
                n, encoding, length = struct.unpack_from('<III',data,at); at += 12
                raw = data[at:at+length]; at += length
                if encoding: raw = zlib.decompress(raw)
                props.append(np.frombuffer(raw,dtype=arrays[t],count=n))
            elif t in 'SR':
                length = struct.unpack_from('<I',data,at)[0]; at += 4
                raw = data[at:at+length]; at += length
                props.append(raw.decode('utf8',errors='replace') if t=='S' else raw)
            else: raise ValueError('FBX property '+t)
        children=[]
        while at < end-size:
            child, at = node(at)
            if child: children.append(child)
        return {'name':name,'props':props,'children':children},end
    result=[]; at=27
    while at<len(data)-size:
        n,at=node(at)
        if not n: break
        result.append(n)
    return result

def child(n,name): return next((c for c in n['children'] if c['name']==name),None)
def props(n):
    p=child(n,'Properties70')
    return {c['props'][0]:c['props'][4:] for c in p['children']} if p else {}

PALETTE = {
 'body':([.68,.035,.018],.29,.45,16000),
 'dark':([.025,.028,.031],.75,.05,1400),
 'metal':([.45,.48,.50],.28,.8,1700),
 'glass':([.075,.15,.18],.19,.5,700),
 'light':([.85,.79,.62],.23,.35,350),
 'red':([.65,.018,.008],.30,.3,250),
}
def category(name,alpine=False):
    n=name.lower()
    if (alpine and n=='kyzov') or (not alpine and n=='car'): return 'body'
    if 'glass_red' in n:return 'red'
    if 'glass_fara' in n or 'light' in n or 'ligth' in n or n in ['sign_material','yellow','glass_orenj']:return 'light'
    if 'glass' in n or n=='mirror':return 'glass'
    if n in ['chrom','steel','metal','rim','metal_wheel','exhaust','reflective']:return 'metal'
    return 'dark'

def read_obj(path):
    vertices=array.array('d');groups=collections.defaultdict(lambda:array.array('i'));material='dark';count=0
    with path.open() as f:
        for line in f:
            if line.startswith('v '):vertices.extend(map(float,line.split()[1:4]))
            elif line.startswith('usemtl '):material=category(line[7:].strip())
            elif line.startswith('f '):
                ids=[int(p.split('/')[0]) for p in line.split()[1:]]
                ids=[i-1 if i>0 else len(vertices)//3+i for i in ids]
                for i in range(1,len(ids)-1):groups[material].extend((ids[0],ids[i],ids[i+1]));count+=1
    v=np.asarray(vertices).reshape(-1,3)
    return [(k,v,np.asarray(ix).reshape(-1,3)) for k,ix in groups.items()],count

def transform(p):
    def t(v):m=np.eye(4);m[:3,3]=v;return m
    def rotation(v):
        x,y,z=np.radians(v);cx,sx=np.cos(x),np.sin(x);cy,sy=np.cos(y),np.sin(y);cz,sz=np.cos(z),np.sin(z)
        return np.array([[cz,-sz,0,0],[sz,cz,0,0],[0,0,1,0],[0,0,0,1]])@np.array([[cy,0,sy,0],[0,1,0,0],[-sy,0,cy,0],[0,0,0,1]])@np.array([[1,0,0,0],[0,cx,-sx,0],[0,sx,cx,0],[0,0,0,1]])
    get=lambda k,default:p.get(k,default)
    rp=get('RotationPivot',[0,0,0]);sp=get('ScalingPivot',[0,0,0]);scale=np.diag([*get('Lcl Scaling',[1,1,1]),1])
    return t(get('Lcl Translation',[0,0,0]))@t(get('RotationOffset',[0,0,0]))@t(rp)@rotation(get('PreRotation',[0,0,0]))@rotation(get('Lcl Rotation',[0,0,0]))@rotation(get('PostRotation',[0,0,0])).T@t(-np.array(rp))@t(get('ScalingOffset',[0,0,0]))@t(sp)@scale@t(-np.array(sp))

def read_alpine():
    z=zipfile.ZipFile(ROOT/'assets/Alpine+A110.zip');nodes=fbx_nodes(z.read('Alpine A110/scenes/Alpine A110.fbx'))
    objects=next(n for n in nodes if n['name']=='Objects');connections=next(n for n in nodes if n['name']=='Connections')
    obj={n['props'][0]:n for n in objects['children']};parents={};materials=collections.defaultdict(list)
    for c in connections['children']:
        _,a,b,*_=c['props']
        if a in obj and obj[a]['name']=='Material':materials[b].append(obj[a]['props'][1].split('\0')[0])
        else:parents[a]=b
    cache={}
    def world(id):
        if id not in cache:cache[id]=(world(parents[id]) if parents.get(id) in obj else np.eye(4))@transform(props(obj[id]))
        return cache[id]
    result=[];count=0
    for g in objects['children']:
        if g['name']!='Geometry':continue
        model=obj[parents[g['props'][0]]];name=model['props'][1].split('\0')[0]
        raw=child(g,'PolygonVertexIndex')['props'][0];count+=int(len(raw)-2*np.count_nonzero(raw<0))
        # A detached projector prop and occluded cabin / engine / spare wheel
        # have no contribution to the closed shelf model's silhouette.
        if name in ['pasted__Protektor_1','Wheel_Zapaska','Engine','Pribornaj_Panel','Solon','Nisha','Bochok','Pol']:continue
        v=child(g,'Vertices')['props'][0].reshape(-1,3);p=props(model)
        geometric=transform({'Lcl Translation':p.get('GeometricTranslation',[0,0,0]),'Lcl Rotation':p.get('GeometricRotation',[0,0,0]),'Lcl Scaling':p.get('GeometricScaling',[1,1,1])})
        matrix=world(model['props'][0])@geometric;v=v@matrix[:3,:3].T+matrix[:3,3]
        layer=child(g,'LayerElementMaterial');indices=child(layer,'Materials')['props'][0] if layer else np.array([0]);polygons=collections.defaultdict(list);poly=[];j=0
        for i in raw:
            poly.append(int(i if i>=0 else -i-1))
            if i<0:
                mats=materials[model['props'][0]];mat=mats[int(indices[min(j,len(indices)-1)])] if mats else 'dark';cat=category(mat,True)
                for k in range(1,len(poly)-1):polygons[cat].append((poly[0],poly[k],poly[k+1]))
                poly=[];j+=1
        result.extend((cat,v,np.array(ix,dtype=np.int32)) for cat,ix in polygons.items())
    return result,count

def repair_winding(v,f):
    edges=collections.defaultdict(list)
    for i,face in enumerate(f):
        for a,b in zip(face,np.roll(face,-1)):edges[(min(a,b),max(a,b))].append((i,a<b))
    links=collections.defaultdict(list)
    for pair in edges.values():
        if len(pair)==2:
            (a,da),(b,db)=pair;links[a].append((b,da==db));links[b].append((a,da==db))
    flips={};center=(v.min(0)+v.max(0))/2
    for start in range(len(f)):
        if start in flips:continue
        flips[start]=False;todo=[start];component=[]
        while todo:
            a=todo.pop();component.append(a)
            for b,opposite in links[a]:
                if b not in flips:flips[b]=flips[a]^opposite;todo.append(b)
        ids=np.array(component);mask=np.array([flips[i] for i in ids]);f[ids[mask]]=f[ids[mask]][:,::-1]
        tri=v[f[ids]];normal=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]);outward=np.sum(normal*(tri.mean(1)-center))
        if outward<0:f[ids]=f[ids][:,::-1]
    return f

def optimize(name,parts,original_count,source_bytes):
    merged=collections.defaultdict(lambda:[[],[],0])
    for cat,v,f in parts:
        ids,inv=np.unique(f.ravel(),return_inverse=True);v=v[ids];f=inv.reshape(-1,3)
        b=merged[cat];b[0].append(v);b[1].append(f+b[2]);b[2]+=len(v)
    allv=np.concatenate([np.concatenate(p[0]) for p in merged.values()]);lo=allv.min(0);hi=allv.max(0);length=(hi-lo)[2]
    print(name,'bounds',lo,hi,flush=True)
    payload=bytearray();meta={'name':name,'parts':[],'originalTriangles':original_count,'sourceBytes':source_bytes,'format':1}
    for cat,(vertices,faces,_) in merged.items():
        v=np.concatenate(vertices);f=np.concatenate(faces)
        v=(v-np.array([(lo[0]+hi[0])/2,lo[1],(lo[2]+hi[2])/2]))/length
        v=v[:,[2,1,0]];v[:,2]*=-1
        # Weld duplicate exported seams before QEM, keeping material boundaries.
        v,inv=np.unique(np.round(v,6),axis=0,return_inverse=True);f=inv[f]
        keep=(f[:,0]!=f[:,1])&(f[:,0]!=f[:,2])&(f[:,1]!=f[:,2]);f=f[keep]
        color,rough,metal,target=PALETTE[cat]
        if name=='Alpine A110' and cat=='body':color=[.035,.33,.66]
        if cat=='body' and len(f)>target:
            cells,inverse=np.unique(np.round(v*1000).astype(np.int32),axis=0,return_inverse=True);counts=np.bincount(inverse)
            v=np.column_stack([np.bincount(inverse,weights=v[:,j])/counts for j in range(3)]);f=inverse[f]
            keep=(f[:,0]!=f[:,1])&(f[:,0]!=f[:,2])&(f[:,1]!=f[:,2]);f=f[keep]
            _,unique=np.unique(np.sort(f,axis=1),axis=0,return_index=True);f=f[unique]
            v,f=fast_simplification.simplify(v,f.astype(np.int32),target_count=target,agg=8,preserve_border=True)
        # Dense exports contain overlapping seams and subpixel interior detail.
        # Cluster that detail before QEM so non-manifold duplicates do not pin
        # hundreds of thousands of otherwise invisible triangles in place.
        resolution=420 if cat=='body' else 220
        while cat!='body' and len(f)>target*1.1:
            cells,inverse=np.unique(np.round(v*resolution).astype(np.int32),axis=0,return_inverse=True)
            counts=np.bincount(inverse);v=np.column_stack([np.bincount(inverse,weights=v[:,j])/counts for j in range(3)]);f=inverse[f]
            keep=(f[:,0]!=f[:,1])&(f[:,0]!=f[:,2])&(f[:,1]!=f[:,2]);f=f[keep]
            _,unique=np.unique(np.sort(f,axis=1),axis=0,return_index=True);f=f[unique]
            if len(f)>target:v,f=fast_simplification.simplify(v,f.astype(np.int32),target_count=target,agg=9)
            resolution/=1.5
            if resolution<35:break
        used,inverse=np.unique(f.ravel(),return_inverse=True);v=v[used];f=inverse.reshape(-1,3)
        f=repair_winding(v,f)
        if cat in ['body','glass']:
            tri=v[f];normal=np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]);center=(v.min(0)+v.max(0))/2
            inward=np.sum(normal*(tri.mean(1)-center),axis=1)<0;f[inward]=f[inward][:,::-1]
        print('reduced',cat,len(v),len(f),flush=True)
        assert len(v)<65536 and np.isfinite(v).all()
        mn=v.min(0);extent=np.maximum(v.max(0)-mn,1e-8);q=np.round((v-mn)/extent*65535).astype('<u2');ix=f.astype('<u2')
        offset=len(payload);payload.extend(q.tobytes());payload.extend(ix.tobytes())
        meta['parts'].append({'material':cat,'color':color,'rough':rough,'metal':metal,'min':mn.tolist(),'extent':extent.tolist(),'vertices':len(v),'triangles':len(f),'offset':offset})
        print(cat,len(f),flush=True)
    meta['triangles']=sum(p['triangles'] for p in meta['parts']);header=json.dumps(meta,separators=(',',':')).encode();header+=b' '*((-len(header))%4)
    data=b'CAR1'+struct.pack('<I',len(header))+header+payload
    out=ROOT/'communications-room/assets/cars';out.mkdir(parents=True,exist_ok=True);slug='porsche' if name=='Porsche' else 'alpine-a110';(out/(slug+'.car')).write_bytes(data)
    meta['fileBytes']=len(data);meta['reductionPercent']=100*(1-meta['triangles']/original_count);return meta

if __name__=='__main__':
    path=ROOT/'assets/Car+cgtrader+obj.obj';parts,n=read_obj(path);report=[optimize('Porsche',parts,n,path.stat().st_size)]
    del parts
    parts,n=read_alpine();report.append(optimize('Alpine A110',parts,n,(ROOT/'assets/Alpine+A110.zip').stat().st_size))
    report.append({'notes':['OBJ companion MTL was not supplied; compact paint/glass/trim materials replace missing materials.','FBX textures and occluded interior geometry omitted; exterior material categories retained.','Quantized indexed geometry is uploaded once through the existing renderer.']})
    (ROOT/'communications-room/assets/cars/optimization.json').write_text(json.dumps(report,indent=2))

