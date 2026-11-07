/* Quantized static meshes, uploaded through the existing WebGL scene API. */
(()=>{'use strict';
 const cache=new Map();
 async function load(file){
  if(!cache.has(file))cache.set(file,fetch('./communications-room/assets/cars/'+file+'.car').then(r=>{if(!r.ok)throw Error('Car asset '+r.status);return r.arrayBuffer();}).then(buffer=>{
   const view=new DataView(buffer);if(view.getUint32(0,true)!==0x31524143)throw Error('Invalid car asset');const length=view.getUint32(4,true),meta=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,8,length))),base=8+length;
   meta.fileBytes=buffer.byteLength;return {meta,parts:meta.parts.map(p=>{const q=new Uint16Array(buffer,base+p.offset,p.vertices*3),ix=new Uint16Array(buffer,base+p.offset+p.vertices*6,p.triangles*3),positions=Array.from(q,(n,i)=>p.min[i%3]+n/65535*p.extent[i%3]);return {...p,positions,indices:Array.from(ix)};})};
  }));return cache.get(file);
 }
 window.CommunicationsCars={
  mount(api,k,parent,file){const state={ready:false,error:null,triangles:0,bytes:0};load(file).then(asset=>{if(window.__communicationsDisposed)return;for(const part of asset.parts){const n=api.mat(parent,api.customMesh(part.positions,part.indices),part.color,[0,0,0],[],'paint');n.rough=part.rough;n.metal=part.metal;}Object.assign(state,{ready:true,triangles:asset.meta.triangles,bytes:asset.meta.fileBytes||0});}).catch(e=>{state.error=e.message;console.error('Office car:',e);});return state;}
 };
})();
