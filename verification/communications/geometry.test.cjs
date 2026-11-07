const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {LabKiraRoute}=require('../../engineering-career-lab/lab-kira-route.js');
const context=vm.createContext({window:{},OfficeBehaviour:require('../../communications-room/behaviour.js').OfficeBehaviour});
vm.runInContext(fs.readFileSync('communications-room/room.js','utf8'),context);
context.CommunicationsLayout=context.window.CommunicationsLayout;
vm.runInContext(fs.readFileSync('communications-room/camera.js','utf8'),context);
const L=context.CommunicationsLayout,C=context.window.CommunicationsCamera;
test('Kira finishes shrinking before the office doorway and keeps that size through it',()=>{
 const route=new LabKiraRoute();let crossing=0,shrinking=0,lastScale=1;
 for(let i=0;i<9000;i++){
  const p=route.update(1/60,true,[3.52,.004,4.65],Math.PI,{active:true,mode:'communications',progress:.99},i*1000/60);
  const amount=L.robotRoomAmount(p.z,route.branch==='communications'),scale=1+(L.scale.robot-1)*amount;
  assert.ok(Math.abs(scale-lastScale)<.01,'Scale is continuous on the approach');lastScale=scale;
  if(scale<1&&scale>.75){shrinking++;assert.ok(p.z>-23.31,'Shrinking happens in the lab approach');}
  if(p.z<-23.31&&p.z>-26.8){crossing++;assert.equal(scale,.75,'Robot is already small before reaching the doors');}
 }
 assert.ok(crossing>100&&shrinking>10);
 assert.equal(L.robotRoomAmount(-22.2,false),0,'Skills retains its original size');
});
function covered(eye,target,projection){
 const e=[-eye[2]-31.5,eye[1]+.06,eye[0]-.5],t=[-target[2]-31.5,target[1]+.06,target[0]-.5];
 const norm=a=>{const n=Math.hypot(...a);return a.map(v=>v/n);},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const f=norm(t.map((v,i)=>v-e[i])),r=norm(cross(f,[0,1,0])),up=cross(r,f),v=Math.tan(projection.fov/2),h=v*projection.aspect,c=L.coverage;
 const planes=[[2,-3,0,-6,6,1,0,3.6],[0,-6,2,-3,3,1,0,3.6],[0,6,2,-3,3,1,0,3.6]];
 for(const y of [0,c.ceiling])planes.push([1,y,0,-6,6,2,c.back,c.front],[1,y,0,-c.width/2,-6,2,3,c.front],[1,y,0,6,c.width/2,2,3,c.front]);
 for(let x=-10;x<=10;x++)for(let y=-10;y<=10;y++){
  const d=f.map((n,i)=>n+r[i]*x/10*h+up[i]*y/10*v);
  const hit=planes.some(([axis,at,a,lo,hi,b,blo,bhi])=>{const k=(at-e[axis])/d[axis],u=e[a]+k*d[a],w=e[b]+k*d[b];return Number.isFinite(k)&&k>0&&u>=lo&&u<=hi&&w>=blo&&w<=bhi;});
  if(!hit)return {x,y,e,t};
 }
 return null;
}
for(const [w,h] of [[1920,900],[1920,819],[1440,900],[2560,1080],[3440,1440],[3840,1080],[390,844]]){
 test(`Every sampled view ray hits completed surfaces at ${w} x ${h}`,()=>{
  const narrow=w<800,eye=L.point(narrow?[-.3,2.05,8.5]:[-1,1.77,6.2]),target=L.point(narrow?[0,1.8,-2]:[-.45,2.08,-2]);
  const aspect=w/(narrow?h*.45-65:h),projection={aspect,fov:Math.min(2*Math.atan(1/aspect),(w<1040?72:58)*Math.PI/180)};
  for(const yaw of [-9,0,9])for(const pitch of [-9,0,9]){C.reset();C.yaw=yaw;C.pitch=pitch;const view=C.apply(eye,target,1,projection);assert.equal(covered(eye,view,projection),null,`yaw ${yaw}, pitch ${pitch}`);}
 });
}
