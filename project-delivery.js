/* One fixed-step workcell. Discovery owns a quiet standby; visitor selection
 * cancels the previous job instead of finishing it. The UI covers resets. */
(function(root){'use strict';
 const Base=typeof module!=='undefined'&&module.exports?require('./workshop-system.js'):root.WorkshopSystem;
 const {Factory:Autonomous,datums:D}=Base,clamp=x=>Math.max(0,Math.min(1,x));
 // Seconds per selected-project phase. Keep the existing physical paths and
 // ownership changes, with about 7.7 seconds for delivery + inspection.
 const phaseSeconds=[.12,null,.25,.12,1.70,.65,.18,.28,.70,.32,.28,.46,1.10];
 const phaseRates=phaseSeconds.map((seconds,index)=>seconds===null?3.4:(index===0 ? .8 : index===2 ? 1.4 : index===3 ? .4 : Base.phases[index][1])/seconds);
 class ProjectFactory extends Autonomous{
  constructor(options={}){super(options);this.selection=null;this.job=null;this.pendingProject=null;this.returning=null;this.projectReady=false;this.presentationRequested=false;this.discoveryHold=false;this.autonomyRequested=false;this.carrierSerial=0;this.projectRevision=0;this.registeredAt=-Infinity;this.studyReleased=false;}
  get phase(){return this.discoveryHold?'discovery':super.phase;}
  _event(type){this.projectRevision++;const e={type,phase:this.phase,projectId:this.job?.id||this.selection?.id||null,carrierId:this.job?.carrierId||null,at:this.clock,cycle:this.count};this.events.push(e);if(this.events.length>64)this.events.shift();this.onEvent?.(e);}
  _clearCell(standby){
   // Keep accumulated roller displacement; discard rather than complete work.
   this.travel=this.snapshot().rollerDistance;this.job=null;this.pendingProject=null;this.returning=null;
   this.projectReady=false;this.presentationRequested=false;this.studyReleased=false;this.autonomyRequested=false;this.restartRequested=false;
   this.index=0;this.age=0;this.clock=0;this.accumulator=0;this.z=D.input[2];this.velocity=0;this.detected=false;this.discoveryHold=standby;
  }
  enterDiscovery(){if(this.discoveryHold&&!this.job)return false;this._clearCell(true);this._event('discovery-standby');return true;}
  leavePresentation({standby=false}={}){this._clearCell(standby);this._event('presentation-cleared');}
  resumeAutonomous(){this._clearCell(false);this._event('autonomous-resumed');}
  requestProject(project,{mobile=false}={}){
   if(!project||!/^[a-z][a-z0-9-]{0,63}$/.test(project.id)||!project.name)throw Error('Invalid project job');
   if(this.job?.id===project.id&&!this.discoveryHold)return false;
   this._clearCell(false);this.selection={id:project.id,name:project.name,carrierKind:project.carrierKind||'generic'};this.registeredAt=this.totalTime;
   this.job={...this.selection,durationScale:mobile?1.25:1,carrierId:'carrier-'+(++this.carrierSerial)+'-'+project.id};
   this._event('project-selected');this._event('carrier-prepared');return true;
  }
  presentProject(){
   if(!this.job||this.job.id!==this.selection?.id)return false;this.presentationRequested=true;
   if(this.projectReady){this.projectReady=false;Autonomous.prototype.advance.call(this);this._event('presentation-started');}return true;
  }
  releaseToStudy(){
   if(!this.job||this.index!==13||this.studyReleased)return false;
   this.studyReleased=true;Autonomous.prototype.advance.call(this);this._event('study-output-started');return true;
  }
  // Skip replays only the active visitor job, under the UI's opaque cover.
  finishDelivery(){
   if(!this.job)return false;const requested=this.presentationRequested;this.presentationRequested=false;
   for(let i=0;i<120*60;i++){if(this.projectReady||this.index===13){this.presentationRequested=requested;return true;}this.step(1/120);}this.presentationRequested=requested;return false;
  }
  finishPresentation(){if(!this.finishDelivery())return false;this.presentProject();for(let i=0;i<120*60;i++){if(this.index===13)return true;this.step(1/120);}return false;}
  restart(){if(this.job||this.discoveryHold)this.resumeAutonomous();super.restart();}
  seek(seconds){this.studyReleased=false;this.selection=null;this.job=null;this.pendingProject=null;this.returning=null;this.projectReady=false;this.presentationRequested=false;this.discoveryHold=false;this.autonomyRequested=false;return super.seek(seconds);}
  advance(){
   if(this.job&&this.index===4){this.age=8.1;this.projectReady=true;this._event('transfer-ready');if(this.presentationRequested)this.presentProject();return;}
   const boundary=this.index===15;super.advance();if(boundary){const wasProject=!!this.job;this.job=null;this.studyReleased=false;if(wasProject)this._event('autonomous-resumed');}if(this.job&&this.index===2)this._event('project-identified');if(this.job&&this.index===13)this._event('presentation-completed');
  }
  step(dt){
   if(this.discoveryHold)return;
   // Scale inside the fixed step, so lower frame rates do not hit tick's
   // elapsed-time clamp and stretch the presentation back out.
   if(this.job)dt*=(phaseRates[this.index]||1.65)/(this.index<=12?this.job.durationScale:1);
   if(this.projectReady||this.job&&this.index===13){this.clock+=dt;this.totalTime+=dt;return;}
   const dwell=this.job?(this.index===0?.8:this.index===3?.4:null):null;
   if(dwell!==null){this.age+=dt;this.clock+=dt;this.totalTime+=dt;if(this.age>=dwell)this.advance();return;}
   if(this.job&&this.index===1){this.age+=dt;this.clock+=dt;this.totalTime+=dt;this.velocity=Math.min(2,this.velocity+dt*.9);const before=this.z;this.z=Math.min(D.sensorZ-.215,this.z+this.velocity*dt);this.travel+=this.z-before;if(this.z+.215>=D.sensorZ-1e-8){this.detected=true;this.advance();}return;}
   if(this.job&&this.index===2){this.age+=dt;this.clock+=dt;this.totalTime+=dt;if(this.age>=1.4){this.travel+=D.index[2]-(D.sensorZ-.215);this.advance();}return;}
   super.step(dt);
  }
  _projectState(){
   const stages={ready:'prepared',arrival:'transport',detected:'detected',computer:'confirmed',shuttle:this.projectReady?'ready':'transfer'};
   return {mode:this.discoveryHold?'discovery':this.job?'project-delivery':'autonomous',selectedId:this.selection?.id||null,selectedName:this.selection?.name||null,explicit:!!this.selection,pendingId:null,activeId:this.job?.id||null,activeName:this.job?.name||null,carrierKind:this.job?.carrierKind||null,carrierId:this.job?.carrierId||null,stage:this.discoveryHold?'browsing':this.job?stages[this.phase]||(this.index===13?'complete':this.index>=5&&this.index<=12?'presenting':'retiring'):'idle',ready:this.projectReady,identified:!!this.job&&this.detected,lineEnabled:!this.discoveryHold,revision:this.projectRevision,registrationAge:this.totalTime-this.registeredAt};
  }
  snapshot(){
   const s=super.snapshot();
   if(this.discoveryHold)Object.assign(s,{phase:'discovery',id:'PROJECT DISCOVERY · LINE STANDBY',description:'The manufacturing line is parked and empty while visitors browse. Selecting a project starts its own demonstration immediately.',visible:false,inspection:false,completed:false,sensor:false,detected:false,progress:0});
   if(this.job&&this.index===2){const start=D.sensorZ-.215,distance=D.index[2]-start,u=clamp(this.age/1.4),m=2*1.4/distance,q=m*u+(3-2*m)*u*u+(m-2)*u*u*u;s.component=[D.input[0],D.input[1],start+distance*q];s.rollerDistance=this.travel+s.component[2]-start;s.sensor=Math.abs(s.component[2]-D.sensorZ)<=.215;}
   if(this.job&&['inspection','complete'].includes(s.phase))s.rotation=Math.PI*4*(s.phase==='inspection'?Base.ease(clamp(this.age/Base.phases[12][1])):1);
   s.project=this._projectState();s.job=this.job?{...this.job}:null;
   if(this.job){s.partName=this.job.name;s.type=-1;const labels={inspection:['INSPECTION · TWO ROTATIONS','The selected carrier completes two full turns beneath the inspection head before its study opens.'],complete:['PROJECT STUDY READY','The selected carrier has completed its two-turn inspection.'],ready:['CARRIER PREPARED','The selected project carrier is supported inside the closed input magazine.'],arrival:['CARRIER IN TRANSIT','The selected carrier travels on the existing rollers toward the optical beam.'],detected:['PROJECT IDENTIFIED','The actual carrier crossed the sensor beam; the line indexes to its stop.'],computer:['POSITION CONFIRMED','The shared controller authorizes transfer of the selected project.'],shuttle:this.projectReady?['READY FOR PRESENTATION','The selected carrier is supported at the robot pickup datum.']:['CARRIER TRANSFER','The existing lift-and-cross shuttle carries the selected project to the arm.']};const label=labels[this.phase];if(label){s.id=label[0];s.description=label[1];}}
   return s;
  }
  handoff(featuredId='obsidian'){
   const p=this._projectState(),id=this.selection?.id||featuredId,matching=this.job?.id===id;
   return {projectId:id,metadataId:id,explicit:!!this.selection,featured:!this.selection,carrierId:matching?this.job.carrierId:null,preparationState:p.stage,transferStationState:p.ready&&matching?'indexed-at-pickup':p.stage==='transfer'?'moving':'not-ready',carrierReadyForPickup:!!(p.ready&&matching),factoryMode:p.mode,activeProjectId:p.activeId,pendingProjectId:null};
  }
 }
 const api={Factory:ProjectFactory};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WorkshopProjectDelivery=api;
})(typeof window!=='undefined'?window:globalThis);
