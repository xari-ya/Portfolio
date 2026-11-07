/* A fixed viewing position with bounded look angles; no free-flight camera. */
(()=>{'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 const cover=CommunicationsLayout.coverage;
 const surfaces=[[2,-3,0,-6,6,1,0,3.6],[0,-6,2,-3,3,1,0,3.6],[0,6,2,-3,3,1,0,3.6]];
 for(const y of [0,cover.ceiling]){
  surfaces.push([1,y,0,-6,6,2,cover.back,cover.front]);
  surfaces.push([1,y,0,-cover.width/2,-6,2,3,cover.front],[1,y,0,6,cover.width/2,2,3,cover.front]);
 }
 function completedView(e,yaw,pitch,projection){
  const sy=Math.sin(yaw),cy=Math.cos(yaw),sp=Math.sin(pitch),cp=Math.cos(pitch);
  const f=[sy*cp,sp,-cy*cp],r=[cy,0,sy],up=[-sy*sp,cp,cy*sp],v=Math.tan(projection.fov/2),h=v*projection.aspect;
  for(const x of [-1,0,1])for(const y of [-1,0,1]){
   const d=f.map((n,i)=>n+r[i]*x*h+up[i]*y*v);
   const scale=window.CommunicationsPhone?.roomScale||[1,1,1];
   const hit=surfaces.some(([axis,at,a,lo,hi,b,blo,bhi])=>{
    at*=scale[axis];lo*=scale[a];hi*=scale[a];blo*=scale[b];bhi*=scale[b];
    if(Math.abs(d[axis])<1e-8)return false;
    const t=(at-e[axis])/d[axis],u=e[a]+t*d[a],w=e[b]+t*d[b];
    return t>0&&u>lo+.01&&u<hi-.01&&w>blo+.01&&w<bhi-.01;
   });
   if(!hit)return false;
  }
  return true;
 }
 const camera=window.CommunicationsCamera={
  yaw:0,pitch:0,drag:null,enabled:false,inspection:0,inspectionGoal:0,
  reset(){this.cancel?.();this.yaw=0;this.pitch=0;this.inspectionGoal=0;},
  inspectCars(){if(this.enabled){this.inspectionGoal=1;CommunicationsRoom.behaviour.activity();}},
  compose(eye,target,dt,progress,projection){
   if(progress<.975){this.inspection=this.inspectionGoal=0;return {eye,target};}
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   this.inspection=reduced?this.inspectionGoal:this.inspection+(this.inspectionGoal-this.inspection)*(1-Math.exp(-Math.min(dt,.05)*6));
   if(this.inspection<.001&&this.inspectionGoal===0){this.inspection=0;return {eye,target};}
   const half=Math.tan(projection.fov/2),distance=Math.max(.90/half,1.0/(half*projection.aspect))+.30;
   const at=window.CommunicationsPhone?CommunicationsPhone.officePoint([-5.4,1.66,1.94],'workstation'):[-5.4,1.66,1.94],scale=1-(window.CommunicationsPhone?.amount||0)*.35,from=[at[0]+distance*.94*scale,at[1]+.08,at[2]+distance*.34*scale];
   const e=CommunicationsLayout.point(from),t=CommunicationsLayout.point(at),u=this.inspection;
   return {eye:eye.map((v,i)=>v+(e[i]-v)*u),target:target.map((v,i)=>v+(t[i]-v)*u)};
  },
  rotate(dx,dy,width,height){
   if(window.CommunicationsPhone?.active)return;
   this.inspectionGoal=0;
   const limit=window.CommunicationsPhone?.active?.38:1.1;
   this.yaw=clamp(this.yaw-dx/Math.max(width,1)*1.4,-limit,limit);
   this.pitch=clamp(this.pitch+dy/Math.max(height,1)*.65,-.35,.35);
  },
  apply(eye,target,amount=1,projection={fov:Math.PI/4,aspect:1}){
   if(amount<=0)return target;
   // Express the sightline in room coordinates. The viewing position never
   // moves, and its centre ray stops inside the two side-wall corners.
   const e=[-eye[2]-31.5,eye[1]+.06,eye[0]-.5];
   const t=[-target[2]-31.5,target[1]+.06,target[0]-.5];
   const depth=Math.max(.1,e[2]+2.85),baseYaw=Math.atan2(t[0]-e[0],e[2]-t[2]);
   const halfFov=Math.atan(Math.tan(projection.fov/2)*projection.aspect);
   const nearDepth=Math.max(.1,e[2]-2.8);
   // Constrain the full horizontal field of view, including its outer rays,
   // so dragging never reveals the empty space beyond a side-wall edge.
   const roomWidth=window.CommunicationsPhone?.roomScale[0]||1;
   let minYaw=Math.max(Math.atan2(-5.65*roomWidth-e[0],depth),Math.atan2(-5.8*roomWidth-e[0],nearDepth)+halfFov+.035);
   let maxYaw=Math.min(Math.atan2(5.65*roomWidth-e[0],depth),Math.atan2(5.8*roomWidth-e[0],nearDepth)-halfFov-.035);
   if(minYaw>maxYaw)minYaw=maxYaw=baseYaw;
   this.limits={minYaw,maxYaw,halfFov,nearZ:2.8};
   let yaw=clamp(baseYaw+this.yaw*amount,minYaw,maxYaw);
   // Store the clamped offset too: reversing a drag responds immediately,
   // even after a long drag against either wall.
   if(amount===1)this.yaw=yaw-baseYaw;
   const distance=depth/Math.cos(yaw),basePitch=Math.atan2(t[1]-e[1],Math.hypot(t[0]-e[0],e[2]-t[2]));
   let pitch=clamp(basePitch+this.pitch*amount,Math.atan2(.65-e[1],distance),Math.atan2(3.12-e[1],distance));
   // Corner rays also have to meet a finished floor, ceiling or wall. This
   // catches diagonal/upward views that a horizontal yaw limit alone misses.
   if(!completedView(e,yaw,pitch,projection)&&completedView(e,baseYaw,basePitch,projection)){
    let lo=0,hi=1;
    for(let i=0;i<16;i++){const u=(lo+hi)/2;if(completedView(e,baseYaw+(yaw-baseYaw)*u,basePitch+(pitch-basePitch)*u,projection))lo=u;else hi=u;}
    yaw=baseYaw+(yaw-baseYaw)*lo;pitch=basePitch+(pitch-basePitch)*lo;
   }
   if(amount===1)this.yaw=yaw-baseYaw;
   if(amount===1)this.pitch=pitch-basePitch;
   return CommunicationsLayout.point([e[0]+Math.tan(yaw)*depth,e[1]+Math.tan(pitch)*depth/Math.cos(yaw),-2.85]);
  },
  bind(canvas){
   const down=e=>{
    const phoneTouch=e.pointerType==='touch'&&window.CommunicationsPhone?.active;
    const surface=e.target===canvas||phoneTouch&&e.target.closest?.('#communicationsPanel')&&!e.target.closest('button,a');
    if(!this.enabled||!surface||e.button!==0||e.pointerType==='touch'&&!phoneTouch)return;
    if(this.drag){end();return;}
    this.drag={id:e.pointerId,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,touch:e.pointerType==='touch',started:e.pointerType!=='touch'};
    if(this.drag.started){canvas.setPointerCapture(e.pointerId);canvas.classList.add('comms-dragging');}
   };
   const move=e=>{
    if(!this.drag||this.drag.id!==e.pointerId)return;
    if(!this.enabled){end();return;}
    if(!this.drag.started){
     const dx=e.clientX-this.drag.startX,dy=e.clientY-this.drag.startY;
     if(Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>6){end();return;}
     if(Math.abs(dx)<6)return;
     this.drag.started=true;canvas.setPointerCapture(e.pointerId);canvas.classList.add('comms-dragging');
    }
    const r=canvas.getBoundingClientRect();
    this.rotate(e.clientX-this.drag.x,this.drag.touch?0:e.clientY-this.drag.y,r.width,r.height);
    CommunicationsRoom.behaviour.activity();
    this.drag.x=e.clientX;this.drag.y=e.clientY;
   };
   const end=()=>{
    const id=this.drag?.id;this.drag=null;canvas.classList.remove('comms-dragging');
    if(id!==undefined&&canvas.hasPointerCapture(id))canvas.releasePointerCapture(id);
   };
   this.cancel=end;
   document.addEventListener('pointerdown',down);document.addEventListener('pointermove',move);
   for(const event of ['pointerup','pointercancel','lostpointercapture'])document.addEventListener(event,end);
   return ()=>{end();document.removeEventListener('pointerdown',down);document.removeEventListener('pointermove',move);for(const event of ['pointerup','pointercancel','lostpointercapture'])document.removeEventListener(event,end);};
  },
  getState(){return {enabled:this.enabled,inspection:this.inspection,inspectionGoal:this.inspectionGoal,yaw:this.yaw,pitch:this.pitch,dragging:!!this.drag,wallLimits:[-5.65,5.65],limits:this.limits};}
 };
})();
