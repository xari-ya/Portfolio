/* One lease for the existing Kira instance. A distance cursor lets him move
   between the room's centre and the Skills bench without restarting a route. */
(function(root){'use strict';
 const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a)),distance=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 class LabKiraRoute{
  constructor(){this.path=null;this.lengths=[];this.cumulative=[];this.cursor=0;this.segment=0;this.u=0;this.heading=0;this.speed=0;this.direction=1;this.arrived=false;this.reactions=0;this.reactionAt=-Infinity;this.revision=-1;this.attentionUntil=0;this.goal=[0,2.2,-12];this.targetMode='';}
  begin(p,heading){
   this.path=[[p[0],p[2]],[p[0],5.5],[8.9,5.5],[8.9,-7.15],[0,-7.15],[0,-12.1],(root.EngineeringLabLayout?.kiraOverview||[0,-17.6]),...(root.EngineeringLabLayout?[root.EngineeringLabLayout.kiraPark]:[[-1.55,-21.35],[-3.3,-22.2]])].filter((v,i,a)=>!i||distance(v,a[i-1])>.02);
   this.lengths=this.path.slice(1).map((p,i)=>distance(this.path[i],p));this.cumulative=[0];for(const len of this.lengths)this.cumulative.push(this.cumulative.at(-1)+len);
   this.branch='skills';this.cursor=0;this.segment=0;this.u=0;this.heading=heading;this.originalHeading=heading;this.speed=0;this.position=this.path[0].slice();this.arrived=false;this.targetMode='';
  }
  target(state,wanted){
   const L=root.EngineeringLabLayout,mode=state?.mode;
   const requested=mode==='communications'?'communications':L&&mode==='experience'?'experience':L&&mode==='overview'&&state.kiraDestination?.startsWith('peek-')?state.kiraDestination:'skills';
   if(this.branch!==requested&&Math.abs(this.cursor-this.cumulative[6])<.03){
    const next=requested==='communications'?[[0,-23.6],[0,-26.1],[0,-27.05],[1.75,-27.1],[1.75,-34.95],[-.3,-35]]:requested==='experience'?[L.kiraArchive]:requested.startsWith('peek-')?[[requested==='peek-left'?-.65:.65,-21.4]]:L?[L.kiraPark]:[[-1.55,-21.35],[-3.3,-22.2]];
    this.path=this.path.slice(0,7).concat(next);this.lengths=this.path.slice(1).map((p,i)=>distance(this.path[i],p));this.cumulative=[0];for(const len of this.lengths)this.cumulative.push(this.cumulative.at(-1)+len);this.branch=requested;
   }
   if(this.branch!==requested)return this.cumulative[6];if(!wanted)return 0;
   return ['skills','communications'].includes(mode)||L&&mode==='experience'||requested.startsWith('peek-')?this.cumulative.at(-1):this.cumulative[6]??this.cumulative.at(-1);
  }
  locate(d){let i=0;while(i<this.lengths.length-1&&d>=this.cumulative[i+1]-1e-5)i++;const t=this.lengths[i]?Math.max(0,Math.min(1,(d-this.cumulative[i])/this.lengths[i])):0,a=this.path[i],b=this.path[i+1];return {i,u:t*this.lengths[i],p:[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]};}
  update(dt,wanted,p,heading,state,ms,reduced=false){
   dt=Math.min(.05,Math.max(0,dt));if(reduced){if(this.path){this.path=null;this.arrived=false;this.speed=0;}return null;}
   if(!this.path){if(!wanted)return null;this.begin(p,heading);}
   if(wanted&&state?.active&&state.progress>=.68&&root.EngineeringLabLayout&&this.position?.[1]>-9.7){this.cursor=this.cumulative[6];const landing=this.locate(this.cursor);this.position=landing.p;this.heading=0;this.speed=0;}
   const requestedMode=['skills','communications','experience'].includes(state?.mode)?state.mode:state.kiraDestination?.startsWith('peek-')?state.kiraDestination:'centre',target=this.target(state,wanted);this.targetMode=requestedMode;
   const delta=target-this.cursor;
   if(Math.abs(delta)<.008){this.cursor=target;const atStart=!wanted&&target===0;this.speed=0;this.arrived=!atStart;
    if(!atStart){this.attend(state,ms);const desired=requestedMode==='skills'?0:requestedMode==='communications'?Math.PI/2:0,error=wrap(desired-this.heading),turn=Math.sign(error)*Math.min(Math.abs(error),dt*1.5);this.heading+=turn;if(Math.abs(error)<.035)this.heading=desired;this.arrived=Math.abs(wrap(desired-this.heading))<.035;}
    else{const error=wrap(this.originalHeading-this.heading),turn=Math.sign(error)*Math.min(Math.abs(error),dt*1.6);this.heading+=turn;if(Math.abs(error)<.035){this.heading=this.originalHeading;const at=this.locate(0);this.position=at.p;this.path=null;return null;}}
    const at=this.locate(this.cursor);this.position=at.p;this.segment=at.i;this.u=at.u;this.direction=0;
    return {x:this.position[0],z:this.position[1],heading:this.heading,parked:this.arrived,attention:this.attention(ms)};
   }
   this.arrived=false;const direction=Math.sign(delta);this.direction=direction;
   const at=this.locate(this.cursor);let segment=at.i;if(direction<0&&segment>0&&Math.abs(this.cursor-this.cumulative[segment])<1e-4)segment--;
   this.segment=segment;this.u=this.cursor-this.cumulative[segment];
   const a=this.path[segment],b=this.path[segment+1],targetHeading=Math.atan2((b[0]-a[0])*direction,(b[1]-a[1])*direction),error=wrap(targetHeading-this.heading),turn=Math.sign(error)*Math.min(Math.abs(error),dt*1.7);this.heading+=turn;
   const boundary=direction>0?this.cumulative[segment+1]-this.cursor:this.cursor-this.cumulative[segment],remaining=Math.min(Math.abs(delta),boundary),speedLimit=this.segment>=6&&this.branch.startsWith('peek-')?.45:state?.progress>=.68?2.75:1.55,goal=Math.abs(error)>.16?0:Math.min(speedLimit,Math.sqrt(Math.max(0,remaining)*2*1.9));this.speed+=(goal-this.speed)*(1-Math.exp(-dt*5));let step=Math.abs(error)>.16?0:Math.min(remaining,this.speed*dt);if(remaining<.012)step=remaining;
   this.cursor+=direction*step;const next=this.locate(this.cursor);this.position=next.p;this.segment=next.i;this.u=next.u;if(step>=remaining-1e-4)this.speed=0;
   this.attend(state,ms);return {x:this.position[0],z:this.position[1],heading:this.heading,parked:false,attention:this.attention(ms)};
  }
  attend(state,ms){if(!state?.active)return;if(state.revision!==this.revision){this.revision=state.revision;if(ms-this.reactionAt>6500){this.reactionAt=ms;this.attentionUntil=ms+2800;this.reactions++;const local=({software:[-4.20,2.1,-21.02],embedded:[-4.75,1.95,-21.00],robotics:[-4.20,2,-21.28],design:[-4.25,2,-21.05]})[state.category];this.goal=local&&root.EngineeringLabLayout?.stationPoint?root.EngineeringLabLayout.stationPoint(local):[0,2.2,-12];}}}
  attention(ms){return {target:ms<this.attentionUntil?this.goal:[0,2.2,-12],mood:ms<this.attentionUntil?'curious':'neutral'};}
  getState(){return {leased:!!this.path,arrived:this.arrived,position:this.position?.slice()||null,heading:this.heading,speed:this.speed,direction:this.direction,segment:this.segment,cursor:this.cursor,targetMode:this.targetMode,reactions:this.reactions,path:this.path?.map(p=>p.slice())||null};}
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={LabKiraRoute};else root.LabKiraRoute=LabKiraRoute;
})(typeof window!=='undefined'?window:globalThis);
