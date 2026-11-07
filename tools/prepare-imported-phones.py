"""Flatten authored GLB transforms and batch by material, without remodelling.
Original GLBs and provenance remain in verification/showcase/phone-source.
"""
from pathlib import Path
import json,struct,hashlib,io
from PIL import Image
import numpy as np

root=Path(__file__).resolve().parents[1]
source=root/'verification/showcase/phone-source';dest=root/'assets/showcase/phones';dest.mkdir(parents=True,exist_ok=True)
formats={5120:np.int8,5121:np.uint8,5122:np.int16,5123:np.uint16,5125:np.uint32,5126:np.float32}
dimensions={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}

def process(key,filename,screen_material,cover_materials,rotate_y,provenance):
    raw=(source/filename).read_bytes();at=12;j=None;binary=None
    while at<len(raw):
        size,kind=struct.unpack_from('<II',raw,at)
        if kind==0x4e4f534a:j=json.loads(raw[at+8:at+8+size])
        elif kind==0x004e4942:binary=raw[at+8:at+8+size]
        at+=size+8
    assert j and binary and not j.get('extensionsRequired'), 'Expected an uncompressed source GLB'
    def accessor(index):
        a=j['accessors'][index];assert not a.get('sparse')
        view=j['bufferViews'][a['bufferView']];dtype=np.dtype(formats[a['componentType']]).newbyteorder('<');dim=dimensions[a['type']]
        data=np.ndarray((a['count'],dim),dtype=dtype,buffer=binary,offset=view.get('byteOffset',0)+a.get('byteOffset',0),strides=(view.get('byteStride',dtype.itemsize*dim),dtype.itemsize)).copy()
        if a.get('normalized') and a['componentType']!=5126:
            data=np.maximum(-1,data.astype(np.float64)/np.iinfo(dtype).max)
        return data
    def matrix(n):
        if 'matrix' in n:return np.asarray(n['matrix'],dtype=float).reshape((4,4),order='F')
        x,y,z,w=n.get('rotation',[0,0,0,1]);m=np.array([[1-2*y*y-2*z*z,2*x*y-2*z*w,2*x*z+2*y*w,0],[2*x*y+2*z*w,1-2*x*x-2*z*z,2*y*z-2*x*w,0],[2*x*z-2*y*w,2*y*z+2*x*w,1-2*x*x-2*y*y,0],[0,0,0,1]],dtype=float)
        m[:3,:3]*=np.array(n.get('scale',[1,1,1]))[None,:];m[:3,3]=n.get('translation',[0,0,0]);return m
    c,s=np.cos(rotate_y),np.sin(rotate_y);orientation=np.array([[c,0,s],[0,1,0],[-s,0,c]])
    parts=[]
    def visit(index,parent):
        node=j['nodes'][index];world=parent@matrix(node)
        if 'mesh' in node:
            for p in j['meshes'][node['mesh']]['primitives']:
                assert p.get('mode',4)==4
                pos=accessor(p['attributes']['POSITION']).astype(float)
                pos=(pos@world[:3,:3].T+world[:3,3])@orientation.T
                normals=accessor(p['attributes']['NORMAL']).astype(float)@np.linalg.inv(world[:3,:3])
                normals=normals@orientation.T;normals/=np.maximum(np.linalg.norm(normals,axis=1)[:,None],1e-12)
                uv=accessor(p['attributes']['TEXCOORD_0']) if 'TEXCOORD_0' in p['attributes'] else np.zeros((len(pos),2))
                indices=accessor(p['indices']).ravel().astype(np.uint32) if 'indices' in p else np.arange(len(pos),dtype=np.uint32)
                parts.append({'node':node.get('name',''),'material':p.get('material',0),'p':pos,'n':normals,'uv':uv,'i':indices})
        for child in node.get('children',[]):visit(child,world)
    for n in j['scenes'][j.get('scene',0)]['nodes']:visit(n,np.eye(4))
    all_positions=np.concatenate([p['p'] for p in parts]);low,high=all_positions.min(0),all_positions.max(0);center=(low+high)/2;height=high[1]-low[1]
    for p in parts:p['p']=(p['p']-center)/height
    screen=np.concatenate([p['p'] for p in parts if p['material']==screen_material]);screen_low,screen_high=screen.min(0),screen.max(0)
    print(key,'source dimensions',high-low,'screen bounds',screen_low,screen_high,'normal',np.mean(np.concatenate([p['n'] for p in parts if p['material']==screen_material]),axis=0))
    textures={};texture_defs=[]
    def texture(index):
        if index in textures:return textures[index]
        tex=j['textures'][index];im=j['images'][tex['source']];view=j['bufferViews'][im['bufferView']];data=binary[view.get('byteOffset',0):view.get('byteOffset',0)+view['byteLength']]
        extension={ 'image/png':'.png','image/jpeg':'.jpg','image/webp':'.webp'}[im['mimeType']];name=f'{key}-{tex["source"]}{extension}';(dest/name).write_bytes(data)
        image=Image.open(io.BytesIO(data))
        # Uniform maps need one texel; near-uniform source dithering needs no
        # 2048px GPU allocation. This records a runtime LOD, not an image edit.
        variation=max(hi-lo for lo,hi in image.convert('RGBA').getextrema())
        gpu_limit=1 if variation==0 else 64 if variation<=1 else 1024
        value=len(texture_defs);texture_defs.append({'file':name,'width':image.width,'height':image.height,'maxGPUSize':gpu_limit,'sha256':hashlib.sha256(data).hexdigest()});textures[index]=value;return value
    materials=[]
    for i,m in enumerate(j['materials']):
        p=m.get('pbrMetallicRoughness',{});mat={'name':m.get('name',str(i)),'color':p.get('baseColorFactor',[1,1,1,1]),'metal':p.get('metallicFactor',1),'rough':p.get('roughnessFactor',1),'alphaMode':m.get('alphaMode','OPAQUE'),'screen':i==screen_material,'cover':i in cover_materials}
        for field,definition in [('baseColor',p.get('baseColorTexture')),('orm',p.get('metallicRoughnessTexture')),('normal',m.get('normalTexture'))]:
            if definition and not mat['screen'] and not mat['cover']:mat[field]=texture(definition['index'])
        mat['normalScale']=m.get('normalTexture',{}).get('scale',1)
        materials.append(mat)
    groups={}
    for p in parts:groups.setdefault(p['material'],[]).append(p)
    output=bytearray();batches=[]
    for material,items in groups.items():
        verts=[];indices=[];offset=0
        for p in items:verts.append(np.column_stack((p['p'],p['n'],p['uv'])));indices.append(p['i']+offset);offset+=len(p['p'])
        vertices=np.concatenate(verts).astype('<f4');idx=np.concatenate(indices).astype('<u4');v_offset=len(output);output.extend(vertices.tobytes());i_offset=len(output);output.extend(idx.tobytes())
        batches.append({'material':material,'vertexOffset':v_offset,'vertexCount':len(vertices),'indexOffset':i_offset,'indexCount':len(idx),'nodes':[p['node'] for p in items]})
    (dest/(key+'.bin')).write_bytes(output)
    report={'source':provenance,'originalFile':filename,'originalSHA256':hashlib.sha256(raw).hexdigest(),'modifications':['Source transforms flattened; oriented display toward +Z; centered and normalized to height 1','Original vertex positions, normals, UVs and triangle topology preserved under those transforms','Batched by original material; project screenshot replaces stock display; transmissive cover layer omitted for readable UI'], 'binary':key+'.bin','binarySHA256':hashlib.sha256(output).hexdigest(),'triangles':sum(len(p['i'])//3 for p in parts),'bounds':{'min':((low-center)/height).tolist(),'max':((high-center)/height).tolist()},'screenBounds':{'min':screen_low.tolist(),'max':screen_high.tolist()},'batches':batches,'materials':materials,'textures':texture_defs}
    (dest/(key+'.json')).write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding='utf8')
    print(key,'triangles',report['triangles'],'batches',len(batches),'runtime bytes',len(output),'texture maps',len(texture_defs))

process('compact','compact-phone.glb',9,[11],0,{'title':'Compact phone','author':'Innerscene Corp','url':'https://www.innerscene.com/tools/library/3d-parts/compact-phone-5347b30a','license':'CC0-1.0','licenseURL':'https://creativecommons.org/publicdomain/zero/1.0/'})
process('iphone','apple_iphone_15_pro_max_black(2).glb',18,[16,30],np.pi,{'title':'Apple iPhone 15 Pro Max Black','author':'polyman Studio','url':'https://sketchfab.com/3d-models/apple-iphone-15-pro-max-black-df17520841214c1792fb8a44c6783ee7','license':'CC-BY-4.0','licenseURL':'https://creativecommons.org/licenses/by/4.0/'})
