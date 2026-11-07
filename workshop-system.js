/* One authoritative, fixed-step workcell model. No DOM, renderer or wall-clock timers.
 * Coordinates are the actual hall datums. This is a scripted manufacturing demonstration.
 * CommonJS export lets the same controller and kinematics run in the verification suite.
 */
(function(root){
 'use strict';
 const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
 const ease=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10)};
 const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*ease(t));
 const D={base:[-2.1,1.61,-.25],links:[1.5,1.41],toolOffset:1.13,
  input:[6.43,.917,-5.45],sensorZ:2.35,index:[6.43,.917,3.5],
  corner:[-.62,.997,3.5],pickup:[-.62,.917,.73],stage:[.6,1.31,-.12],
  outputCorner:[3.42,1.31,-.12],output:[3.42,1.31,-5.55],
  park:[-1.15,1.70,.72],open:.41,closed:.284};
 const phases=[
  ['ready',2.8,'SYSTEM READY','The conveyor is clear. The arm waits above its safe approach.'],
  ['arrival',Infinity,'COMPONENT ARRIVAL','The roller line delivers one standardized sensor cartridge.'],
  ['detected',2.2,'OBJECT DETECTED','The optical beam was interrupted by the actual component. The line indexes to its stop.'],
  ['computer',1.5,'POSITION CONFIRMED · PICKUP READY','The control station acknowledges the indexed position and authorizes transfer.'],
  ['shuttle',8.1,'GUIDED SHUTTLE · TRANSFER','A lift-and-cross shuttle follows the rails to the robot feeder.'],
  ['pickup',3.5,'ROBOT · APPROACH & ALIGN','The open parallel gripper descends onto the cartridge housing.'],
  ['grip',.9,'ROBOT · GRIP CONFIRMED','The jaws close against the common gripping faces before lift.'],
  ['lift',1.6,'ROBOT · LIFT TO CLEARANCE','The cartridge is rigidly retained in the gripper frame.'],
  ['transport',3.7,'ROBOT · COMPONENT TRANSFER','Coordinated joints carry the cartridge above the assembly fixture.'],
  ['placement',1.5,'ASSEMBLY · ALIGNMENT','The cartridge is lowered onto the supported workholding pallet.'],
  ['release',1.3,'ASSEMBLY · CLAMP & RELEASE','The fixture supports the cartridge before the gripper opens.'],
  ['retract',2.8,'ROBOT · SAFE RETRACT','The arm clears the rotary fixture before inspection begins.'],
  ['inspection',5.5,'INSPECTION · SCRIPTED SCAN','The clamped fixture turns once beneath the inspection head.'],
  ['complete',5.5,'ASSEMBLY COMPLETE · INSPECTION PASSED','The scripted reference cartridge passes the demonstration. It remains on display.'],
  ['output',8.0,'OUTPUT · FINISHED CARTRIDGE','The supported pallet carries the cartridge into the enclosed output cassette.'],
  ['reset',8.0,'RETURN · EMPTY PALLET','After concealed unloading, the empty pallet returns along the same guarded rails.']
 ];
 const names=['SENSOR CARTRIDGE','ELECTRONICS ENCLOSURE','MOUNTING MODULE'];
 function ik(component){
  const x=component[0]-D.base[0],z=component[2]-D.base[2];
  const y=component[1]+D.toolOffset-D.base[1],r=Math.hypot(x,z),[a,b]=D.links;
  const reach=Math.hypot(r,y),c=(reach*reach-a*a-b*b)/(2*a*b);
  if(c>1.00001||c< -1.00001)throw Error('Workcell target outside robot reach: '+component);
  const elbow=-Math.acos(clamp(c,-1,1));
  const shoulder=Math.atan2(y,r)-Math.atan2(b*Math.sin(elbow),a+b*Math.cos(elbow))-Math.PI/2;
  return {base:-Math.atan2(z,x),shoulder,elbow,wrist:-(shoulder+elbow)};
 }
 function fk(pose){
  const [a,b]=D.links,s=pose.shoulder,e=s+pose.elbow;
  const r=-a*Math.sin(s)-b*Math.sin(e);
  return [D.base[0]+r*Math.cos(pose.base),D.base[1]+a*Math.cos(s)+b*Math.cos(e)-D.toolOffset,D.base[2]-r*Math.sin(pose.base)];
 }
 class Factory{
  constructor({paused=false,onEvent=()=>{}}={}){
   this.paused=paused;this.onEvent=onEvent;this.started=false;this.index=0;this.age=0;
   this.clock=0;this.totalTime=0;this.count=1;this.accumulator=0;this.z=D.input[2];this.velocity=0;
   this.travel=0;this.detected=false;this.restartRequested=false;this.events=[];
  }
  get phase(){return phases[this.index][0]}
  enter(index){
   this.index=index;this.age=0;
   const event={phase:this.phase,cycle:this.count,at:this.clock};
   this.events.push(event);if(this.events.length>64)this.events.shift();this.onEvent(event);
  }
  advance(){
   if(this.index===phases.length-1){
    this.count++;this.clock=0;this.z=D.input[2];this.velocity=0;this.detected=false;
    this.restartRequested=false;this.enter(0);
   }else this.enter(this.index+1);
  }
  tick(dt){
   if(!this.started||this.paused)return;
   this.accumulator+=clamp(dt,0,.25);
   while(this.accumulator>=1/120){this.step(1/120);this.accumulator-=1/120;}
  }
  step(dt){
   this.age+=dt;this.clock+=dt;this.totalTime+=dt;
   if(this.phase==='arrival'){
    this.velocity=Math.min(1.05,this.velocity+dt*.65);
    const previous=this.z;this.z=Math.min(D.sensorZ-.215,this.z+this.velocity*dt);
    this.travel+=this.z-previous;
    // Detection is a crossing of the workpiece's leading edge through the beam.
    if(this.z+.215>=D.sensorZ-1e-8){this.detected=true;this.advance();}
   }else if(this.age>=phases[this.index][1]){
    if(this.phase==='detected')this.travel+=D.index[2]-(D.sensorZ-.215);
    this.advance();
   }
  }
  restart(){this.restartRequested=true;this.paused=false;}
  snapshot(){
   const phase=this.phase,t=this.age,duration=phases[this.index][1],u=Number.isFinite(duration)?clamp(t/duration):0;
   let component=D.input.slice(),arm=D.park.slice(),shuttle=D.index.slice(),pallet=D.stage.slice();
   let owner='conveyor',visible=true,grip=D.open,rotation=0,clampAmount=0;
   const pickHigh=[D.pickup[0],1.65,D.pickup[2]],stageHigh=[D.stage[0],1.41,D.stage[2]];
   if(phase==='arrival')component=[D.input[0],D.input[1],this.z];
   if(phase==='detected'){
    // Cubic stop starts at the incoming roller velocity and finishes at zero.
    const start=D.sensorZ-.215,distance=D.index[2]-start,m=1.05*duration/distance;
    const q=m*u+(3-2*m)*u*u+(m-2)*u*u*u;
    component=[6.43,.917,start+distance*q];
   }
   if(phase==='computer')component=D.index.slice();
   if(phase==='shuttle'){
    owner='shuttle';
    if(t<.8)shuttle=mix(D.index,[6.43,.997,3.5],t/.8);
    else if(t<5.6)shuttle=mix([6.43,.997,3.5],D.corner,(t-.8)/4.8);
    else if(t<7.5)shuttle=mix(D.corner,[-.62,.997,.73],(t-5.6)/1.9);
    else shuttle=mix([-.62,.997,.73],D.pickup,(t-7.5)/.6);
    component=shuttle.slice();
   }
   if(phase==='pickup'){
    owner='shuttle';component=D.pickup.slice();shuttle=D.pickup.slice();
    arm=t<2?mix(D.park,pickHigh,t/2):mix(pickHigh,D.pickup,(t-2)/1.5);
   }
   if(phase==='grip'){
    owner=u<1?'shuttle':'gripper';component=D.pickup.slice();shuttle=D.pickup.slice();
    arm=D.pickup.slice();grip=D.open+(D.closed-D.open)*ease(u);
   }
   if(['lift','transport','placement'].includes(phase)){
    owner='gripper';grip=D.closed;shuttle=D.pickup.slice();
    arm=phase==='lift'?mix(D.pickup,pickHigh,u):phase==='transport'?mix(pickHigh,stageHigh,u):mix(stageHigh,D.stage,u);
    component=arm.slice();
   }
   if(phase==='release'){
    owner='stage';component=D.stage.slice();arm=D.stage.slice();
    clampAmount=ease(t/.5);grip=D.closed+(D.open-D.closed)*ease((t-.5)/.8);
   }
   if(phase==='retract'){
    owner='stage';component=D.stage.slice();clampAmount=1;
    arm=t<1.1?mix(D.stage,stageHigh,t/1.1):mix(stageHigh,D.park,(t-1.1)/1.7);
   }
   if(phase==='inspection'||phase==='complete'){
    owner='stage';component=D.stage.slice();clampAmount=1;
    rotation=phase==='inspection'?Math.PI*2*ease(u):Math.PI*2;
   }
   if(phase==='output'){
    owner='output';clampAmount=1-ease(t/.7);
    component=t<.7?D.stage.slice():t<3.7?mix(D.stage,D.outputCorner,(t-.7)/3):mix(D.outputCorner,D.output,(t-3.7)/4.3);
    pallet=component.slice();
   }
   if(phase==='reset'){
    owner='cassette';component=D.output.slice();visible=false;
    pallet=t<1.4?D.output.slice():t<5.4?mix(D.output,D.outputCorner,(t-1.4)/4):mix(D.outputCorner,D.stage,(t-5.4)/2.6);
   }
   if(this.index>=7){
    let returning=t;for(let i=7;i<this.index;i++)returning+=phases[i][1];
    if(returning<.8)shuttle=mix(D.pickup,[-.62,.997,.73],returning/.8);
    else if(returning<2.7)shuttle=mix([-.62,.997,.73],D.corner,(returning-.8)/1.9);
    else if(returning<7.5)shuttle=mix(D.corner,[6.43,.997,3.5],(returning-2.7)/4.8);
    else shuttle=mix([6.43,.997,3.5],D.index,(returning-7.5)/.6);
   }
   const sensor=Math.abs(component[2]-D.sensorZ)<=.215&&Math.abs(component[0]-6.43)<.27;
   const pose=ik(arm),tool=fk(pose);
   return {phase,id:phases[this.index][2],description:phases[this.index][3],index:this.index,
    clock:this.clock,totalTime:this.totalTime,age:t,count:this.count,component,owner,visible,arm,pose,tool,grip,shuttle,pallet,
    sensor,detected:this.detected,rotation,clampAmount,inspection:phase==='inspection',
    completed:['complete','output','reset'].includes(phase),paused:this.paused,
    restartRequested:this.restartRequested,type:(this.count-1)%3,partName:names[(this.count-1)%3],
    inputGate:phase==='arrival'?(t<3?ease(t/.6):1-ease((t-3)/.8)):0,
    outputGate:phase==='output'?(t<6.7?ease(t/.7):1-ease((t-6.7)/1.3)):
     phase==='reset'?(t<.8?0:t<1.4?ease((t-.8)/.6):t<5.4?1:1-ease((t-5.4)/1.1)):0,
    progress:(this.index+u)/phases.length,travel:this.travel,
    // Roller angle derives from displacement, including the decelerating index.
    rollerDistance:this.travel+(phase==='detected'?component[2]-(D.sensorZ-.215):0)};
  }
  seek(seconds){
   // Development only: replay the identical fixed steps, including position detection.
   const started=this.started,paused=this.paused,onEvent=this.onEvent;
   Object.assign(this,new Factory());this.started=true;this.onEvent=()=>{};
   const steps=Math.floor(clamp(Number(seconds)||0,0,180)*120);
   for(let i=0;i<steps;i++)this.step(1/120);
   this.started=started;this.paused=paused;this.onEvent=onEvent;return this.snapshot();
  }
 }
 const api={Factory,datums:D,phases,ik,fk,ease,mix};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 else root.WorkshopSystem=api;
})(typeof window!=='undefined'?window:globalThis);
