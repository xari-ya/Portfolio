/* glTF skeletal playback in the hall's existing WebGL2 context. Vertex buffers
 * stay immutable; authored Blender clips drive joint matrices and crossfades. */
(()=>{'use strict';
const I=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
const mul=(a,b)=>{const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];return o;};
function trs(t=[0,0,0],q=[0,0,0,1],s=[1,1,1]){const [x,y,z,w]=q;return new Float32Array([(1-2*y*y-2*z*z)*s[0],(2*x*y+2*z*w)*s[0],(2*x*z-2*y*w)*s[0],0,(2*x*y-2*z*w)*s[1],(1-2*x*x-2*z*z)*s[1],(2*y*z+2*x*w)*s[1],0,(2*x*z+2*y*w)*s[2],(2*y*z-2*x*w)*s[2],(1-2*x*x-2*y*y)*s[2],0,...t,1]);}
function slerp(a,b,t){if(t<=0)return a.slice();if(t>=1)return b.slice();let d=a.reduce((s,v,i)=>s+v*b[i],0),sign=d<0?-1:1;d=Math.abs(d);if(d>.9995){const q=a.map((v,i)=>v+(b[i]*sign-v)*t),l=Math.hypot(...q);return q.map(v=>v/l);}const theta=Math.acos(Math.min(1,d)),s=Math.sin(theta),u=Math.sin((1-t)*theta)/s,v=Math.sin(t*theta)/s*sign;return a.map((x,i)=>x*u+b[i]*v);}
function qmul(a,b){return [a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]];}
async function readGLB(url){
 const response=await fetch(url);if(!response.ok)throw Error('Engineer asset '+response.status+': '+url);const buffer=await response.arrayBuffer(),dv=new DataView(buffer);let json,bin;
 for(let at=12;at<buffer.byteLength;){const n=dv.getUint32(at,true),type=dv.getUint32(at+4,true);if(type===0x4e4f534a)json=JSON.parse(new TextDecoder().decode(new Uint8Array(buffer,at+8,n)));if(type===0x004e4942)bin=at+8;at+=8+n;}
 let decoder;if(json.extensionsRequired?.includes('EXT_meshopt_compression')){decoder=(await import('./character-assets/generated/vendor/meshopt_decoder.mjs')).MeshoptDecoder;await decoder.ready;}
 const views=(json.bufferViews||[]).map(v=>{const e=v.extensions?.EXT_meshopt_compression;if(!e)return new Uint8Array(buffer,bin+(v.byteOffset||0),v.byteLength);const out=new Uint8Array(e.count*e.byteStride);decoder.decodeGltfBuffer(out,e.count,e.byteStride,new Uint8Array(buffer,bin+(e.byteOffset||0),e.byteLength),e.mode,e.filter||'NONE');return out;});
 const fmt={5120:['getInt8',1,127],5121:['getUint8',1,255],5122:['getInt16',2,32767],5123:['getUint16',2,65535],5125:['getUint32',4,4294967295],5126:['getFloat32',4,1]},dims={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16};const cache=new Map();
 function acc(id){if(cache.has(id))return cache.get(id);const a=json.accessors[id],n=dims[a.type],out=new Float32Array(a.count*n);if(a.bufferView!==undefined){const v=views[a.bufferView],d=new DataView(v.buffer,v.byteOffset,v.byteLength),[method,bytes,div]=fmt[a.componentType],stride=json.bufferViews[a.bufferView].byteStride||n*bytes;for(let i=0;i<a.count;i++)for(let j=0;j<n;j++){let value=d[method]((a.byteOffset||0)+i*stride+j*bytes,true);out[i*n+j]=a.normalized?Math.max(-1,value/div):value;}}
  if(a.sparse){const sp=a.sparse,vi=views[sp.indices.bufferView],vv=views[sp.values.bufferView],[method,bytes]=fmt[sp.indices.componentType],d=new DataView(vi.buffer,vi.byteOffset,vi.byteLength),v=new DataView(vv.buffer,vv.byteOffset,vv.byteLength),[read,size,div]=fmt[a.componentType];for(let i=0;i<sp.count;i++){let index=d[method]((sp.indices.byteOffset||0)+i*bytes,true);for(let j=0;j<n;j++){const x=v[read]((sp.values.byteOffset||0)+(i*n+j)*size,true);out[index*n+j]=a.normalized?x/div:x;}}}
  cache.set(id,out);return out;}
 return {json,views,acc,bytes:buffer.byteLength};
}
class EngineerAvatar{
 constructor(asset,{reduced=false}={}){this.asset=asset;this.json=asset.json;this.reduced=reduced;this.time=0;this.age=0;this.clip=null;this.previous=null;this.blendAge=1;this.blendDuration=.32;this.active=false;this.greeted=false;try{this.greeted=sessionStorage.getItem('engineer-greeted')==='1';}catch{}this.lastAck=-10;this.nextIdle=8;this.lastActivity='';this.look=[0,0];this.lookGoal=[0,0];
  this.rest=this.json.nodes.map(n=>({t:(n.translation||[0,0,0]).slice(),r:(n.rotation||[0,0,0,1]).slice(),s:(n.scale||[1,1,1]).slice()}));this.pose=this.rest.map(n=>({t:n.t.slice(),r:n.r.slice(),s:n.s.slice()}));this.world=this.json.nodes.map(()=>I());
  this.clips=new Map((this.json.animations||[]).map(a=>[a.name,{name:a.name,duration:Math.max(...a.samplers.map(s=>asset.acc(s.input).at(-1))),channels:a.channels.map(c=>{const s=a.samplers[c.sampler];return {node:c.target.node,path:c.target.path,times:asset.acc(s.input),values:asset.acc(s.output),interpolation:s.interpolation||'LINEAR'};})}]));
  this.skins=(this.json.skins||[]).map(s=>({joints:s.joints,bind:asset.acc(s.inverseBindMatrices),matrices:new Float32Array(s.joints.length*16)}));
  if(this.skins.some(s=>s.joints.length>48))throw Error('Engineer rig exceeds 48-joint shader capacity');
  this.head=this.json.nodes.findIndex(n=>n.name==='head');this.chest=this.json.nodes.findIndex(n=>n.name==='chest');this.bodyLook=0;this.lookUntil=-1;this.lids=this.json.nodes.flatMap((n,i)=>n.name?.startsWith('lid_upper.')?[i]:[]);this.blink=0;this.blinkStart=-20;this.blinkIndex=0;this.nextBlink=2.4;this.playIdle();this.blendAge=1;this.update(0,true);
 }
 play(name,{loop=false,priority=false}={}){if(!this.clips.has(name))return false;if(!priority&&this.oneShot&&this.age<this.clip.duration-.25)return false;this.previous=this.pose.map(n=>({t:n.t.slice(),r:n.r.slice(),s:n.s.slice()}));this.clip=this.clips.get(name);this.age=0;this.loop=loop;this.oneShot=!loop;this.blendAge=0;this.lastActivity=name;if(name==='ENGINEER_WORKSTATION_CHECK')this.nextBlink=Math.min(this.nextBlink,this.time+1.7);return true;}
 playIdle(){return this.play('ENGINEER_IDLE',{loop:true,priority:true});}
 playGreeting(){if(this.greeted)return this.playAcknowledgement();this.greeted=true;try{sessionStorage.setItem('engineer-greeted','1');}catch{}return this.play('ENGINEER_GREETING',{priority:true});}
 playAcknowledgement(){if(this.reduced||this.time-this.lastAck<3||this.clip?.name==='ENGINEER_GREETING'&&this.age<this.clip.duration)return false;this.lastAck=this.time;return this.play('ENGINEER_ACKNOWLEDGE',{priority:true});}
 playWorkstationCheck(){return this.play('ENGINEER_WORKSTATION_CHECK');}
 playObservation(){return this.play('ENGINEER_OBSERVE_FACTORY');}
 playPresent(){return !this.reduced&&this.play('ENGINEER_PRESENT');}
 playExit(){this.active=false;if(this.reduced)return this.playIdle();return this.play('ENGINEER_EXIT',{priority:true});}
 lookAtTarget(x=0,y=0){this.lookGoal=[Math.max(-.26,Math.min(.26,x)),Math.max(-.10,Math.min(.10,y))];this.lookUntil=this.time+2.4;}
 resetPose(){this.lookGoal=[0,0];this.playIdle();}
 blinkNow(){if(this.reduced)return false;this.blinkStart=this.time;this.blinkIndex++;this.nextBlink=this.time+3.4+(Math.sin(this.blinkIndex*13.47)*.5+.5)*3.1;return true;}
 enter(){this.active=true;this.nextIdle=this.time+12;if(this.reduced){this.playIdle();return;}this.playGreeting();}
 update(dt,force=false){
  this.time+=dt;this.age+=dt;this.blendAge+=dt;
  if(!this.reduced&&this.time>=this.nextBlink)this.blinkNow();
  const blinkAge=this.time-this.blinkStart,long=this.clip?.name==='ENGINEER_WORKSTATION_CHECK',close=.075,hold=long?.045:.025,open=long?.17:.135;
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  this.blink=this.reduced?0:blinkAge<close?smooth(blinkAge/close):blinkAge<close+hold?1:1-smooth((blinkAge-close-hold)/open);
  if(this.reduced&&!force&&this.reducedSet)return;this.reducedSet=this.reduced;
  if(this.oneShot&&this.age>=this.clip.duration){const greeting=this.clip.name==='ENGINEER_GREETING';this.playIdle();if(greeting&&this.active){this.playPresent();this.nextIdle=this.time+14;}}
  if(!this.oneShot&&this.time>this.nextIdle&&!this.reduced){this.nextIdle=this.time+(this.active?19:14);const step=Math.floor(this.time/14)%4;this.play(['ENGINEER_WORKSTATION_CHECK','ENGINEER_OBSERVE_FACTORY','ENGINEER_RELAXED_IDLE','ENGINEER_IDLE'][step],{loop:step>=2});}
  const sample=this.reduced?0:this.loop?this.age%this.clip.duration:Math.min(this.age,this.clip.duration),pose=this.rest.map(n=>({t:n.t.slice(),r:n.r.slice(),s:n.s.slice()}));
  for(const c of this.clip.channels){const dim=c.path==='rotation'?4:3;let i=0;while(i<c.times.length-2&&sample>=c.times[i+1])i++;const u=Math.max(0,Math.min(1,(sample-c.times[i])/(c.times[i+1]-c.times[i]||1))),a=Array.from(c.values.slice(i*dim,(i+1)*dim)),b=Array.from(c.values.slice((i+1)*dim,(i+2)*dim)),key={translation:'t',rotation:'r',scale:'s'}[c.path];if(!key)continue;pose[c.node][key]=c.interpolation==='STEP'?a:key==='r'?slerp(a,b,u):a.map((v,j)=>v+(b[j]-v)*u);}
  const blend=this.reduced?1:Math.min(1,this.blendAge/this.blendDuration);if(this.previous&&blend<1)for(let i=0;i<pose.length;i++)for(const k of ['t','r','s'])pose[i][k]=k==='r'?slerp(this.previous[i][k],pose[i][k],blend):pose[i][k].map((v,j)=>this.previous[i][k][j]+(v-this.previous[i][k][j])*blend);
  const damping=1-Math.exp(-7*dt),goal=this.time<this.lookUntil?this.lookGoal:[0,0];for(let i=0;i<2;i++)this.look[i]+=(goal[i]-this.look[i])*damping;
  this.bodyLook+=(this.look[0]*.26-this.bodyLook)*(1-Math.exp(-2.1*dt));
  if(this.head>=0&&!this.oneShot&&!this.reduced){const h=(this.look[0]-this.bodyLook)/2,p=this.look[1]/2;pose[this.head].r=qmul(pose[this.head].r,qmul([0,Math.sin(h),0,Math.cos(h)],[Math.sin(p),0,0,Math.cos(p)]));if(this.chest>=0)pose[this.chest].r=qmul(pose[this.chest].r,[0,Math.sin(this.bodyLook/2),0,Math.cos(this.bodyLook/2)]);}
  for(const index of this.lids)pose[index].s[1]=.0001+.9999*this.blink;
  this.pose=pose;const visit=(id,parent)=>{const n=this.json.nodes[id],p=pose[id];this.world[id]=mul(parent,n.matrix?new Float32Array(n.matrix):trs(p.t,p.r,p.s));for(const c of n.children||[])visit(c,this.world[id]);};for(const n of this.json.scenes[this.json.scene||0].nodes)visit(n,I());
  for(const skin of this.skins)for(let i=0;i<skin.joints.length;i++)skin.matrices.set(mul(this.world[skin.joints[i]],skin.bind.subarray(i*16,i*16+16)),i*16);
 }
 getState(){return {clip:this.clip?.name,age:this.age,active:this.active,greeted:this.greeted,blink:this.blink,blinkCount:this.blinkIndex,gaze:this.look.slice(),bodyGaze:this.bodyLook,clips:[...this.clips.keys()],bones:this.skins[0]?.joints.length||0,bytes:this.asset.bytes};}
}
window.EngineerAvatar=EngineerAvatar;window.EngineerGLTF={read:readGLB,math:{I,mul,trs,slerp}};
})();
