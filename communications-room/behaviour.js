/* Office intent and lifecycle only. Shared actor controllers retain pose ownership. */
(function(root){'use strict';
class OfficeBehaviour {
 constructor(){this.state='INACTIVE';this.time=0;this.previous=null;this.lastActivity=0;this.welcomed=false;this.visit=0;this.selected=-1;this.hover=-1;this.focus=-1;this.pressed=-1;this.reactionAt=-10;this.reactionUntil=0;this.ackUntil=0;this.activationAt=-10;this.activationDuration=1.6;this.docked=false;this.dockAt=-10;this.kiraState='RECEPTION_EXITING';this.engineerRequest=0;this.revision=0;this.wakeUntil=0;this.hidden=false;this.pointerUntil=0;this.playAt=-10;this.playUntil=0;this.playIndex=0;this.gesture='';this.gestureAt=-100;}
 tick(p,now,{hidden=false,blocked=false,reduced=false}={}){
  if(this.previous!==null&&!hidden&&!this.hidden)this.time+=Math.max(0,(now-this.previous)/1000);this.previous=now;this.hidden=hidden;this.reduced=reduced;
  if(hidden)return;
  if(blocked||p<.915){if(this.state!=='INACTIVE'){this.clear();this.state='INACTIVE';}return;}
  if(this.state==='INACTIVE'||this.state==='EXITING'){
   this.state='ENTERING';this.lastActivity=this.time;this.visit++;this.activationAt=-10;
  }
  if(p>=.975&&this.activationAt<0){this.activationAt=this.time;this.activationDuration=this.welcomed?.65:1.6;this.welcomed=true;this.engineerRequest++;this.state='ACTIVATING';}
  if(p<.967&&this.activationAt>=0){this.clear();this.state='EXITING';return;}
  if(this.activationAt>=0){const age=this.time-this.lastActivity;this.state=!reduced&&this.time-this.activationAt<this.activationDuration?'ACTIVATING':this.docked&&age>=90?'RESTING':age>=30?'IDLE':'ACTIVE';}
 }
 clear(){this.docked=false;this.hover=this.focus=this.pressed=this.selected=-1;this.reactionUntil=this.ackUntil=this.wakeUntil=0;this.activationAt=-10;this.pointerUntil=this.playUntil=0;this.revision++;this.gesture='';}
 exit(){this.clear();if(this.state!=='INACTIVE')this.state='EXITING';}
 activity(){if(['INACTIVE','EXITING'].includes(this.state))return;if(this.state==='RESTING')this.wakeUntil=this.time+.65;this.lastActivity=this.time;}
 contact(kind,index){if(['INACTIVE','EXITING'].includes(this.state))return;
  this.activity();if(kind==='hover')this.hover=index;if(kind==='focus')this.focus=index;if(kind==='press')this.pressed=index;
  const selected=this.pressed>=0?this.pressed:this.hover>=0?this.hover:this.focus;
  if(selected!==this.selected){this.selected=selected;this.revision++;if(selected>=0&&this.time-this.reactionAt>=.65){this.reactionAt=this.time;this.reactionUntil=this.time+2.4;}}
  if(kind==='click'){this.gesture='ack';this.gestureAt=this.time;this.ackUntil=this.time+.8;this.reactionUntil=this.time+1.8;this.revision++;}
 }
 greet(who){this.activity();this.ackUntil=this.time+1.6;if(who==='engineer')this.engineerRequest++;else{this.play();this.gesture='tap';this.gestureAt=this.time;}}
 play(){if(this.time-this.playAt<1.4)return;this.playAt=this.time;this.playUntil=this.time+2.1;this.playIndex++;}
 pointer(){this.activity();this.pointerUntil=this.time+2.5;}
 kira(route,position,heading,reduced){
  const office=!['INACTIVE','EXITING'].includes(this.state),pad=root.CommunicationsPhone?root.CommunicationsLayout.point(root.CommunicationsPhone.dockPosition):[-.3,0,-35],near=position&&Math.hypot(position[0]-pad[0],position[2]-pad[2])<.04;
  const aligned=Math.abs(Math.atan2(Math.sin(heading-Math.PI/2),Math.cos(heading-Math.PI/2)))<.04;
  const docked=!!(office&&near&&aligned&&(reduced||route?.arrived&&route.targetMode==='communications'&&route.speed<.02));
  if(docked&&!this.docked){this.dockAt=this.time;this.lastActivity=this.time;if(!root.CommunicationsPhone?.active){this.gesture='hello';this.gestureAt=this.time;}}this.docked=docked;
  this.kiraState=!office?'RECEPTION_EXITING':!docked?near?'RECEPTION_DOCKING':position?.[2]<-27?'RECEPTION_APPROACHING_DOCK':'RECEPTION_ENTERING':this.time<this.ackUntil?'RECEPTION_ACKNOWLEDGING':this.time<this.wakeUntil?'RECEPTION_WAKING':this.state==='RESTING'?'RECEPTION_RESTING':this.selected>=0||this.time<this.reactionUntil?'RECEPTION_OBSERVING':'RECEPTION_ACTIVE';
  if(docked&&!reduced&&this.state!=='RESTING'&&this.selected<0&&this.time-this.playAt>(root.CommunicationsPhone?.active?14:12+this.playIndex%3*3)&&this.time-this.dockAt>5)this.play();
  return this.snapshot();
 }
 snapshot(){const welcome=this.state==='ACTIVATING'?Math.sin(Math.min(1,(this.time-this.activationAt)/this.activationDuration)*Math.PI):0,ack=Math.max(0,Math.min(1,(this.ackUntil-this.time)/.8));const desktop=!root.CommunicationsPhone?.active,gesture=desktop&&this.time-this.gestureAt<1.8?this.gesture:'',gestureAge=this.time-this.gestureAt;return {gesture,gestureAge,gestureBlink:gesture==='tap'&&(gestureAge>.12&&gestureAge<.23||gestureAge>.40&&gestureAge<.51),state:this.state,time:this.time,visit:this.visit,selected:this.selected,pressed:this.pressed,revision:this.revision,welcome,ack,attention:this.selected>=0||this.time<this.reactionUntil,pointerActive:this.time<this.pointerUntil,playing:this.time<this.playUntil,playAge:this.time-this.playAt,playIndex:this.playIndex,docked:this.docked,dockAge:this.time-this.dockAt,kiraState:this.kiraState,engineerRequest:this.engineerRequest,waking:this.time<this.wakeUntil};}
}
if(typeof module!=='undefined'&&module.exports)module.exports={OfficeBehaviour};else root.OfficeBehaviour=OfficeBehaviour;
})(typeof window!=='undefined'?window:globalThis);
