/* Intent only: the shared route owns locomotion and the hall owns the pose. */
(function(root){'use strict';
 class KiraRoomBehaviour{
  constructor(){this.time=0;this.active=false;this.mode='';this.key='';this.preview=null;this.activity='waiting';this.gesture='';this.gestureAt=-100;this.helloAt=-100;this.tapAt=-100;this.nextTrip=0;this.trip=0;this.leg='wait';this.inspectAt=0;this.reactions=0;}
  react(kind){if(!this.active)return false;if(this.time-this.gestureAt<2&&((kind==='preview'&&['selection','record'].includes(this.gesture))||(kind==='hello'&&['tap','selection','record'].includes(this.gesture))))return false;if(kind==='tap'&&this.time-this.tapAt<2)return false;if(kind!=='tap'&&this.gesture==='tap'&&this.time-this.gestureAt<2){if(kind!=='preview'||!['selection','record'].includes(this.pending))this.pending=kind;return false;}if(kind==='tap')this.tapAt=this.time;this.gesture=kind;this.gestureAt=this.time;this.reactions++;return true;}
  update(s){
   if(s.hidden)return this.pose(s);
   this.time+=Math.min(.05,Math.max(0,s.dt||0));
   if(!s.active){this.active=false;this.gesture='';this.pending=null;this.leg='wait';this.mode='';return this.pose(s);}
   const entered=!this.active,changed=this.mode!==s.mode;this.active=true;
   if(entered||changed){this.mode=s.mode;this.leg='wait';this.nextTrip=this.time+6;this.gesture='';this.pendingHello=true;this.key=[s.category,s.journey].join('|');this.preview=s.preview;}
   if(this.pending&&this.time-this.gestureAt>=2){const pending=this.pending;this.pending=null;this.react(pending);}
   const key=[s.category,s.journey].join('|');if(key!==this.key){this.key=key;this.react('selection');}
   if(s.preview!==this.preview){this.preview=s.preview;if(s.preview)this.react('preview');}
   if(s.parked&&this.pendingHello){this.pendingHello=false;if(this.time-this.helloAt>=20){this.helloAt=this.time;this.react('hello');}}
   if(s.reduced){this.leg='wait';return this.pose(s);}
   if(s.mode==='overview'){
    if(this.leg==='wait'&&s.parked&&this.time>=this.nextTrip&&this.time-this.gestureAt>2){this.leg='out';this.trip++;}
    else if(this.leg==='out'&&s.parked&&s.routeMode===this.destination()){this.leg='inspect';this.inspectAt=this.time;}
    else if(this.leg==='inspect'&&this.time-this.inspectAt>=2)this.leg='return';
    else if(this.leg==='return'&&s.parked&&s.routeMode==='centre'){this.leg='wait';this.nextTrip=this.time+[16,19,22][this.trip%3];}
   }else this.leg='wait';
   return this.pose(s);
  }
  destination(){return ['out','inspect'].includes(this.leg)?(this.trip%2?'peek-left':'peek-right'):'centre';}
  pose(s={}){
   const age=this.time-this.gestureAt,engaged=!!this.gesture&&age<2,gesture=engaged?this.gesture:'',wave=engaged?Math.sin(Math.min(1,age/1.6)*Math.PI):0;
   const side=this.mode==='skills'?-.32:this.mode==='experience'?.32:this.leg==='inspect'?(this.trip%2?-.32:.32):0;
   const moving=s.moving||!s.parked,reduced=!!s.reduced;
   this.activity=!this.active?'inactive':moving?'travelling':gesture||this.leg==='inspect'?'attending':'idle';
   return {activity:this.activity,destination:this.destination(),gesture,age,reactions:this.reactions,
    yaw:reduced?0:moving?side*.25:gesture==='tap'||gesture==='hello'?0:side+.055*Math.sin(this.time*.47),
    tilt:reduced||moving?0:-.025+(gesture&&gesture!=='preview'?wave*.10:0),
    roll:reduced||moving?0:gesture==='tap'?wave*.09:0,
    mood:gesture==='tap'||gesture==='hello'||gesture==='record'?'happy':gesture||this.leg==='inspect'?'curious':'neutral',
    blink:!reduced&&gesture==='tap'&&(age>.12&&age<.23||age>.40&&age<.51)};
  }
  getState(){return {time:this.time,mode:this.mode,activity:this.activity,gesture:this.gesture,gestureAge:this.time-this.gestureAt,leg:this.leg,destination:this.destination(),reactions:this.reactions};}
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={KiraRoomBehaviour};else root.KiraRoomBehaviour=KiraRoomBehaviour;
})(typeof window!=='undefined'?window:globalThis);
