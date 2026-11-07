/* Stage 02 scenery, using the hall's geometry/material/texture allocator.
 * The one existing workpiece owns the carrier; this module never moves it. */
window.createProductionStation=function({scene,workpiece,group,mat,box,quad,cylinder,C,gl,createTexture}){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const registry=WorkshopProjectRegistry,root=group(workpiece),variants={};
 const solid=(p,w,h,d,c,pos,type='graphite')=>mat(p,box(w,h,d,Math.min(.012,h*.2)),c,pos,[],type);
 // Same .54 x .43 transfer envelope and flat gripping faces as the original cartridge.
 solid(root,.54,.10,.43,C.graphite,[0,.02,0]);
 solid(root,.44,.035,.34,C.red,[0,.087,0],'paint');
 for(const x of [-.258,.258])solid(root,.023,.07,.29,C.silver,[x,.025,0],'steel');
 for(const x of [-.21,.21])for(const z of [-.16,.16])mat(root,cylinder(.014,.009,8),C.silver,[x,.076,z],[],'steel');
 const make=kind=>variants[kind]=group(root);
 const robot=make('robotics');
 solid(robot,.30,.035,.22,C.darkSteel,[0,.122,-.025],'steel');
 solid(robot,.255,.018,.19,[.07,.24,.18],[0,.178,-.025],'paint');
 for(const x of [-.148,.148])mat(robot,cylinder(.068,.035,16),C.black,[x,.155,-.025],[0,0,Math.PI/2],'rubber');
 for(const x of [-.10,.10])mat(robot,cylinder(.026,.034,12),C.silver,[x,.215,-.075],[],'steel');
 solid(robot,.10,.022,.065,C.graphite,[0,.202,-.005]);
 for(const x of [-.098,.098])solid(robot,.035,.035,.02,C.ivory,[x,.202,.067],'paint');
 const sensor=make('instrumentation');
 solid(sensor,.29,.15,.22,C.ivory,[0,.174,-.035],'paint');
 solid(sensor,.19,.008,.125,C.graphite,[0,.254,-.04]);
 solid(sensor,.13,.005,.055,[.12,.43,.41],[0,.260,-.055],'glass');
 for(const x of [-.065,0,.065])solid(sensor,.012,.008,.022,C.silver,[x,.261,.016],'steel');
 mat(sensor,cylinder(.017,.20,12),C.silver,[.19,.19,-.05],[Math.PI/2,0,0],'steel');
 const data=make('data');
 solid(data,.32,.10,.24,C.darkSteel,[0,.15,-.025],'steel');
 for(const x of [-.14,.14])solid(data,.018,.05,.20,C.red,[x,.218,-.025],'paint');
 solid(data,.25,.006,.17,C.black,[0,.204,-.025],'glass');
 // A coastline/data packet, deliberately not a manufactured JellyCast robot.
 const coast=[[.04,-.06],[.025,-.045],[.035,-.025],[.02,-.01],[.025,.01],[.005,.045],[-.02,.06]];
 for(let i=0;i<coast.length-1;i++){const a=coast[i],b=coast[i+1],dx=b[0]-a[0],dz=b[1]-a[1];const line=solid(data,.006,.004,Math.hypot(dx,dz),C.mint,[(a[0]+b[0])/2,.210,(a[1]+b[1])/2-.025],'light');line.r[1]=Math.atan2(dx,dz);}
 for(let i=0;i<3;i++)solid(data,.055+i*.012,.004,.006,C.silver,[-.064,.210,-.065+i*.035],'steel');
 const companion=make('companion');
 solid(companion,.235,.055,.185,C.ivory,[0,.144,-.025],'paint');
 for(const x of [-.134,.134])solid(companion,.045,.072,.235,C.black,[x,.143,-.025],'rubber');
 solid(companion,.16,.095,.13,C.ivory,[0,.235,-.015],'paint');
 solid(companion,.135,.065,.007,C.black,[0,.239,.054],'glass');
 for(const x of [-.036,.036])solid(companion,.026,.028,.004,C.white,[x,.244,.059],'light');
 const generic=make('generic');solid(generic,.27,.10,.21,C.silver,[0,.16,-.025],'steel');
 for(const x of [-.09,0,.09])solid(generic,.03,.012,.14,C.graphite,[x,.217,-.025]);

 function surface(w,h){const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;const ctx=canvas.getContext('2d'),texture=createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.LINEAR);for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);return {canvas,ctx,texture,upload(){gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);}};}
 const badge=surface(512,96),label=mat(root,quad(.38,.071),C.white,[0,.124,.145],[-Math.PI/2,0,0],'light',.55);label.texture=badge.texture;
 root.visible=false;
 // Cantilevered from the outside rail; neither screen nor support enters the transport envelope.
 const station=group(scene,[5.15,2.90,-3.50]);station.r[1]=Math.PI/2;
 solid(station,2.56,1.52,.12,C.graphite,[0,0,0],'steel');
 solid(station,2.44,1.40,.025,C.black,[0,0,.072],'glass');
 for(const y of [-.735,.735])solid(station,.78,.024,.035,C.red,[0,y,.075],'paint');
 for(const x of [-1.2,1.2])for(const y of [-.67,.67])mat(station,cylinder(.028,.018,10),C.silver,[x,y,.075],[Math.PI/2,0,0],'steel');
 solid(station,.075,1.15,.075,C.darkSteel,[-.56,-1.22,-.055],'steel');
 solid(station,.58,.075,.075,C.darkSteel,[-.82,-1.76,-.055],'steel');
 const screenData=surface(1024,568),screen=mat(station,quad(2.34,1.30),C.white,[0,0,.091],[],'light',.83);screen.texture=screenData.texture;
 const indicator=solid(station,.11,.025,.025,C.red,[1.02,-.69,.088],'light');
 // Projected catalogue fixtures are previews, not extra manufacturing jobs.
 // Only the selected, opaque carrier emerges from the real feeder.
 const catalogue=group(scene),slots=[],images=new Map();let projection=0,lastMs=0,atlasDirty=true,galleryOffset=0,galleryTarget=0,lastIndex=0,galleryRevision=registry.revision;
 for(let i=0;i<7;i++){
  const node=group(catalogue,[6.43,.917,2.35-i*1.5]);
  solid(node,.54,.10,.43,C.graphite,[0,.02,0]);
  for(const z of [-.21,.21])solid(node,.54,.008,.008,C.mint,[0,.078,z],'light');
  const projectionNode=group(node,[0,.85,0]);projectionNode.r[1]=Math.PI/2;
  solid(projectionNode,1.30,.020,.018,C.mint,[0,-.575,0],'light').emit=1.10;
  for(const x of [-.66,.66])solid(projectionNode,.016,1.15,.018,C.mint,[x,0,0],'light').emit=1.10;
  const image=surface(512,448),plane=mat(projectionNode,quad(1.28,1.10),C.white,[0,0,.014],[],'light',.77);plane.texture=image.texture;plane.texMode=3;
  slots.push({node,plane,image,id:null});
 }
 // Keep the complete first-view model visible. A soft image backdrop fills
 // the projection without cropping the model or erasing its darker parts.
 function projectionImage(im){
  const cv=document.createElement('canvas');cv.width=512;cv.height=336;const c=cv.getContext('2d');
  const cover=Math.max(512/im.naturalWidth,336/im.naturalHeight),fit=Math.min(512/im.naturalWidth,336/im.naturalHeight);
  c.fillStyle='#091721';c.fillRect(0,0,512,336);
  c.save();c.filter='blur(14px) brightness(.6)';c.drawImage(im,(512-im.naturalWidth*cover)/2,(336-im.naturalHeight*cover)/2,im.naturalWidth*cover,im.naturalHeight*cover);c.restore();
  c.save();c.filter='brightness(1.16)';c.drawImage(im,(512-im.naturalWidth*fit)/2,(336-im.naturalHeight*fit)/2,im.naturalWidth*fit,im.naturalHeight*fit);c.restore();
  c.fillStyle='rgba(95,210,235,.06)';c.fillRect(0,0,512,336);return cv;
 }
 const load=id=>{if(images.has(id))return images.get(id);const p=registry.get(id),im=new Image();im.crossOrigin='anonymous';images.set(id,im);im.onload=()=>{im.projection=projectionImage(im);atlasDirty=true;};im.onerror=()=>{if(im.src!==registry.fallback)im.src=registry.fallback;};im.src=p?.preview||registry.fallback;return im;};
 let labelKey='',displayKey='',lastDraw=0,draws=0;
 const phonePreviewQuery=matchMedia('(max-width:760px)');
 const onPhonePreviewChange=()=>{for(const im of images.values())if(im.complete&&im.naturalWidth)im.projection=projectionImage(im);atlasDirty=true;};phonePreviewQuery.addEventListener('change',onPhonePreviewChange);
 const names={browsing:'LINE STANDBY / SELECT PROJECT',idle:'SYSTEM READY',queued:'JOB REGISTERED / LINE CLEARING',clearing:'RETURNING CARRIER',prepared:'CARRIER PREPARED',transport:'CARRIER IN TRANSIT',detected:'PROJECT IDENTIFIED',confirmed:'POSITION CONFIRMED',transfer:'TRANSFER IN PROGRESS',ready:'READY FOR PRESENTATION'};
 function update(s,preview,active,ms){
  const job=s.job,p=s.project||{stage:'idle'};
  const dt=Math.min(.1,Math.max(0,(ms-lastMs)/1000));lastMs=ms;
  projection+=((active?1:0)-projection)*(1-Math.exp(-dt*9));catalogue.alpha=projection*.90;catalogue.visible=projection>.015;
  const projects=registry.list(),count=projects.length,index=Math.max(0,projects.findIndex(p=>p.id===preview));
  if(galleryRevision!==registry.revision){galleryRevision=registry.revision;galleryOffset=galleryTarget=index;lastIndex=index;}
  let delta=index-lastIndex;if(delta>count/2)delta-=count;if(delta< -count/2)delta+=count;galleryTarget+=delta;lastIndex=index;
  galleryOffset=reduced?galleryTarget:galleryOffset+(galleryTarget-galleryOffset)*(1-Math.exp(-dt*10));
  const first=Math.floor(galleryOffset)-3,dirty=atlasDirty;atlasDirty=false;
  for(let i=0;i<7;i++){
   const absolute=first+i,slot=slots[((absolute%7)+7)%7],relative=absolute-galleryOffset;
   const item=projects[((absolute%count)+count)%count],id=item?.id;
   slot.node.p[2]=-.65-relative*1.5;slot.node.visible=!!item&&Math.abs(relative)<=2.55;
   const key=id+'|'+(id===preview);slot.id=id;slot.plane.emit=id===preview?1.45:1.24;slot.plane.alpha=phonePreviewQuery.matches?(id===preview?.98:.64):1;
   if(slot.key===key&&!dirty)continue;slot.key=key;
   const c=slot.image.ctx,im=load(id);c.clearRect(0,0,512,448);
   if(im.projection)c.drawImage(im.projection,0,0);
   c.fillStyle='rgba(6,24,34,.42)';c.fillRect(0,337,512,111);
   c.fillStyle=id===preview?'#ffe1b8':'#f3fdff';c.font='bold 38px monospace';c.fillText((item?.shortName||'PROJECT').slice(0,22),18,365);c.fillStyle='#bddee7';c.font='19px monospace';c.fillText('PROJECT PREVIEW / SELECT',18,405);slot.image.upload();
  }
  root.visible=!!job;
  for(const [kind,n] of Object.entries(variants))n.visible=kind===(variants[job?.carrierKind]?job.carrierKind:'generic');
  const next=job?.id||'';
  if(next!==labelKey){labelKey=next;const c=badge.ctx;c.fillStyle='#11191c';c.fillRect(0,0,512,96);c.fillStyle='#f1e9db';c.font='bold 52px monospace';c.fillText((registry.get(next)?.shortName||next.toUpperCase()).slice(0,18),16,66);badge.upload();}
  indicator.emit=p.ready?.9:p.mode==='project-delivery'?.55:.15;
  screen.emit=active?.93:.73;
  const stage=p.stage,id=p.selectedId||preview||registry.featuredId,key=[stage,id,active,p.activeId,p.pendingId].join('|');
  if(key===displayKey&&ms-lastDraw<450)return;displayKey=key;lastDraw=ms;
  const project=registry.get(id),c=screenData.ctx,w=1024,h=568;
  c.fillStyle='#0d1419';c.fillRect(0,0,w,h);c.strokeStyle='#263339';c.lineWidth=1;
  for(let x=32;x<w;x+=64){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
  c.fillStyle='#e44b2f';c.fillRect(36,35,6,29);c.font='18px monospace';c.fillText('02 / PROJECT DELIVERY',57,57);
  c.fillStyle='#f0eadd';c.font='bold 47px sans-serif';c.fillText('SELECT. IDENTIFY. DELIVER.',36,130);
  c.fillStyle='#7f9399';c.font='18px monospace';c.fillText('STANDARD CARRIER / GUIDED TRANSFER',36,170);
  c.fillStyle='#e44b2f';c.fillRect(36,199,952,2);
  c.fillStyle='#f0eadd';c.font='bold 43px sans-serif';c.fillText(project?.shortName||'AVAILABLE PROJECTS',36,267);
  c.fillStyle='#b7c3c3';c.font='20px sans-serif';c.fillText(project?.category||'ENGINEERING PROJECT REGISTRY',36,305);
  c.font='19px monospace';c.fillStyle=p.ready?'#a5d5bf':'#edaa79';c.fillText(names[stage]||stage.toUpperCase(),36,371);
  c.fillStyle='#7f9399';c.font='16px monospace';c.fillText(p.explicit?'REGISTERED: '+p.selectedId.toUpperCase():'FEATURED PREVIEW / NOT DISPATCHED',36,410);
  const steps=['prepared','transport','detected','transfer','ready'],current=steps.indexOf(stage==='confirmed'?'detected':stage);
  steps.forEach((step,i)=>{const x=36+i*194;c.fillStyle=i<=current?'#d94c32':'#28363d';c.fillRect(x,455,176,4);c.font='14px monospace';c.fillStyle='#a3b0b3';c.fillText(['PREPARE','TRANSPORT','IDENTIFY','TRANSFER','READY'][i],x,487);});
  c.fillStyle='#6d7e84';c.font='14px monospace';c.fillText('SCRIPTED DELIVERY  /  DETAILED INSPECTION AT ASSEMBLY',36,539);
  screenData.upload();draws++;
 }
 update({project:{stage:'idle'}},registry.featuredId,false,0);
 return {disposePhoneUI:()=>phonePreviewQuery.removeEventListener('change',onPhonePreviewChange),root,variants,station,screen,indicator,catalogue,getHologramWeight:()=>catalogue.visible?projection:0,animated:[root,...Object.values(variants),catalogue,...slots.map(s=>s.node)],live:[label,screen,indicator,...slots.map(s=>s.plane)],update,
  pickBounds:()=>projection>.5?Object.fromEntries(slots.filter(s=>s.id&&s.node.visible).map(s=>['project:'+s.id,[[6.0,1.13,s.node.p[2]-.69],[6.86,2.40,s.node.p[2]+.69]]])):{},
  getState:()=>({activeCarrierId:labelKey,displayUpdates:draws,dimensions:[.54,.313,.43],screenPosition:station.p.slice(),staging:'existing enclosed magazine',catalogue:{projection,cardDimensions:[1.28,1.10],opacity:catalogue.alpha,selectedEmission:Math.max(0,...slots.filter(s=>s.node.visible).map(s=>s.plane.emit)),imageOpacity:1,transparentPreview:false,ids:slots.filter(s=>s.node.visible).sort((a,b)=>b.node.p[2]-a.node.p[2]).map(s=>s.id)}})};
};
