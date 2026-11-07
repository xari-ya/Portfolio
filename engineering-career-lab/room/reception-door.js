/* One world-space portal shared by the lab and reception. Both faces and the
 * sliding panels use the same rigid assemblies; neither room stretches them. */
window.buildLabReceptionExit=function(k,root){
 const {G,B,R,Y,C}=k,D=EngineeringLabLayout.doorway,g=k.moving(G(root,D.center)),leaves=[],lamps=[];
 for(const side of [-1,1]){
  R(g,.18,3.34,.58,C.darkSteel,[side*1.33,1.67,0],.025,'steel');
  B(g,.025,3.18,.64,C.steel,[side*1.245,1.61,0],'steel');
  // Actual panel pockets are behind the opaque wall, outside the opening.
  B(g,1.28,3.18,.16,C.black,[side*1.87,1.60,0]);
 }
 R(g,2.86,.22,.58,C.darkSteel,[0,3.23,0],.025,'steel');
 B(g,4.96,.07,.14,C.steel,[0,3.17,0],'steel');
 B(g,2.48,.025,.64,C.steel,[0,.0125,0],'steel');
 for(const side of [-1,1]){
  const face=G(g,[0,0,side*.305],[0,side<0?Math.PI:0,0]);
  for(const x of [-1.33,1.33]){B(face,.025,2.66,.018,C.red,[x,1.61,0],'light',.55);const lamp=B(face,.045,.11,.020,C.red,[x,2.87,.012],'light',.75);k.live.push(lamp);lamps.push(lamp);}
  B(face,2.63,.012,.023,[1,.80,.56],[0,3.12,.015],'light',.9);
 }
 for(const side of [-1,1]){
  const leaf=k.moving(G(g,[side*D.closed,0,0]));
  R(leaf,1.22,3.10,.12,[.045,.056,.063],[0,1.56,0],.026,'steel');
  for(const facing of [-1,1]){
   const skin=G(leaf,[0,0,facing*.067],[0,facing<0?Math.PI:0,0]);
   R(skin,1.08,2.78,.018,C.graphite,[0,1.57,0],.025);
   for(const y of [.39,1.16,2.84])B(skin,1.00,.018,.018,C.steel,[0,y,.014],'steel');
   B(skin,.027,2.78,.020,C.steel,[side*facing*.49,1.57,.016],'steel');
   B(skin,.018,1.08,.018,[1,.64,.35],[-side*facing*.48,1.62,.022],'light',.60);
   R(skin,.70,.53,.025,[.024,.039,.046],[0,2.25,.017],.025,'glass');
   for(let i=0;i<5;i++)B(skin,.56,.012,.012,C.darkSteel,[0,.61+i*.055,.02],'steel');
   for(const x of [-.46,.46])for(const y of [.24,2.94])Y(skin,.013,.01,C.silver,[x,y,.025],[Math.PI/2,0,0]);
  }
  leaves.push(leaf);
 }
 // Large lab identity board above the opening. The small contact strip that
 // used to sit below it has been removed; the door itself now carries the
 // pointer hint for the communications room.
 const board=G(g,[0,4.70,.72]);R(board,2.34,1.99,.10,C.graphite,[0,0,0],.030);
 for(const x of [-.93,.93])B(board,.040,.085,.55,C.darkSteel,[x,0,-.28],'steel');
 for(const x of [-1.143,1.143])B(board,.022,1.91,.016,C.steel,[x,0,.055],'steel');
 k.screen(board,2.23,1.878,[0,0,.061],(c,v)=>{c.fillStyle='#090c0e';c.fillRect(0,0,v.width,v.height);c.fillStyle='#ece8dc';c.font='700 86px "Workshop Condensed",sans-serif';c.fillText('S',65,110);c.fillStyle='#ed2526';c.fillText('/',110,110);c.fillStyle='#ece8dc';c.fillText('D.',150,110);c.font='600 77px "Workshop Condensed",sans-serif';c.fillText('ENGINEERING',65,265);c.fillText('& CAREER LAB',65,345);c.fillStyle='#989c99';c.font='22px monospace';c.fillText('SKILLS / EXPERIENCE / GROWTH',65,400);c.strokeStyle='#ab2024';c.lineWidth=3;c.strokeRect(14,14,v.width-28,v.height-28);c.fillStyle='#e5262e';for(let i=0;i<4;i++){c.beginPath();c.moveTo(390+i*28,470);c.lineTo(408+i*28,470);c.lineTo(420+i*28,450);c.lineTo(402+i*28,450);c.fill();}},{width:640,height:540});
 g.identificationBoard=board;
 let amount=0,velocity=0,holdUntil=0,requested=false;
 g.receptionLeaves=leaves;
 g.update=function(dt,ms,{progress=0,camera,kira,kiraInReception=false,destination,reduced=false}={}){
  const near=p=>p&&Math.abs(p[0])<1.75&&Math.abs(p[2]-D.center[2])<2.65;
  const arriving=['communications','contact'].includes(destination)&&progress>.84&&progress<.976;
  const returning=['skills','experience','lab'].includes(destination)&&(progress>.915||camera&&camera[2]<D.center[2]+.3);
  const robotApproach=kiraInReception&&kira&&Math.abs(kira[0])<1.8&&kira[2]<-20.5&&kira[2]>-28.2;
  requested=arriving||returning||progress>.915&&progress<.976||near(camera)||robotApproach;
  if(requested)holdUntil=ms+900;
  const target=requested||ms<holdUntil?1:0,step=Math.min(.05,Math.max(0,dt));
  if(reduced){amount=target;velocity=0;}else{velocity+=(target-amount)*90*step;velocity*=Math.exp(-16*step);amount=Math.max(0,Math.min(1,amount+velocity*step));if(Math.abs(amount-target)<.0005&&Math.abs(velocity)<.003){amount=target;velocity=0;}}
  for(let i=0;i<leaves.length;i++)leaves[i].p[0]=(i?1:-1)*(D.closed+amount*D.travel);
  for(const lamp of lamps)lamp.color=amount>.98?[.20,.72,.54]:target?[1,.44,.15]:C.red;
 };
 Object.defineProperties(g,{openAmount:{get:()=>amount},requested:{get:()=>requested}});
 g.getDoorState=()=>({amount,velocity,requested,holdUntil,center:D.center.slice(),opening:[2.48,3.12],leaves:leaves.map(n=>n.p.slice())});
 return g;
};
