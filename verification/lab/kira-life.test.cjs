const {test}=require('node:test'),assert=require('node:assert/strict');
const {KiraRoomBehaviour}=require('../../engineering-career-lab/kira-behaviour.js');
const {LabKiraRoute}=require('../../engineering-career-lab/lab-kira-route.js');
const {OfficeBehaviour}=require('../../communications-room/behaviour.js');
const state={active:true,mode:'overview',parked:true,routeMode:'centre',dt:.05};
test('arrival, bounded excursions, latest selection and direct greeting priority',()=>{
 const b=new KiraRoomBehaviour();b.update(state);assert.equal(b.pose(state).gesture,'hello');
 for(let i=0;i<125;i++)b.update(state);assert.equal(b.destination(),'peek-left');
 b.update({...state,routeMode:'peek-left'});assert.equal(b.leg,'inspect');
 for(let i=0;i<42;i++)b.update({...state,routeMode:'peek-left'});assert.equal(b.destination(),'centre');
 b.update({...state,mode:'skills',category:'embedded'});b.react('tap');b.update({...state,mode:'skills',category:'robotics'});assert.equal(b.pose(state).gesture,'tap');
 assert.equal(b.react('tap'),false);for(let i=0;i<45;i++)b.update({...state,mode:'skills',category:'software'});assert.equal(b.pose(state).gesture,'selection');
});
test('hidden clock, exit cancellation and reduced motion never schedule roaming',()=>{
 const b=new KiraRoomBehaviour();b.update(state);const t=b.time;for(let i=0;i<100;i++)b.update({...state,hidden:true});assert.equal(b.time,t);
 for(let i=0;i<1000;i++)b.update({...state,reduced:true});assert.equal(b.destination(),'centre');assert.equal(b.pose({reduced:true}).tilt,0);
 b.update({...state,active:false});assert.equal(b.getState().gesture,'');assert.equal(b.getState().activity,'inactive');
});
test('route arrival requires final alignment and resets as soon as target changes',()=>{
 const r=new LabKiraRoute();r.begin([3.52,0,4.65],0);r.cursor=r.cumulative[6];r.position=r.locate(r.cursor).p;r.heading=Math.PI;
 const s={active:true,mode:'overview',revision:0};const pose=r.update(.02,true,[0,0,-17.6],Math.PI,s,1);assert.equal(pose.parked,false);assert.equal(r.arrived,false);
 r.heading=0;r.update(.02,true,[0,0,-17.6],0,s,2);assert.equal(r.arrived,true);
 r.update(.02,true,[0,0,-17.6],0,{...s,mode:'skills'},3);assert.equal(r.arrived,false);
});
test('inspection travel is bounded at 20, 30 and 60 fps and reverses continuously',()=>{
 global.EngineeringLabLayout={kiraOverview:[0,-21],kiraPark:[-1,-22.8],kiraArchive:[1,-22.8]};
 try{for(const fps of [20,30,60]){
  const r=new LabKiraRoute();r.begin([0,0,-21],0);r.cursor=r.cumulative[6];r.position=[0,-21];let p=[0,0,-21],h=0;
  for(let i=0;i<15*fps;i++){const n=r.update(1/fps,true,p,h,{active:true,mode:'overview',progress:.7,kiraDestination:'peek-left'},i*1000/fps);assert.ok(Math.hypot(n.x-p[0],n.z-p[2])<=.45/fps+.013);p=[n.x,0,n.z];h=n.heading;}
  assert.ok(r.arrived);assert.deepEqual(r.position,[-.65,-21.4]);
  const n=r.update(1/fps,true,p,h,{active:true,mode:'skills',progress:.81},16000);assert.ok(Math.hypot(n.x-p[0],n.z-p[2])<.04);
 }}finally{delete global.EngineeringLabLayout;}
});
test('desktop dock greeting and acknowledgement preserve the existing mobile behavior',()=>{
 const office=new OfficeBehaviour();office.tick(.99,0);office.tick(.99,2000);
 office.kira({arrived:true,targetMode:'communications',speed:0},[-.3,0,-35],Math.PI/2,false);
 assert.equal(office.snapshot().gesture,'hello');office.contact('click',0);assert.equal(office.snapshot().gesture,'ack');
 global.CommunicationsPhone={active:true};try{assert.equal(office.snapshot().gesture,'');}finally{delete global.CommunicationsPhone;}
 office.exit();assert.equal(office.snapshot().gesture,'');
});
