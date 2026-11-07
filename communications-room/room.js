/* Room 03: reference-led architecture, built on the existing hall scene graph. */
(()=>{'use strict';
 const L=window.CommunicationsLayout={
  origin:[.5,-.06,-31.5],size:[12,6,3.6],point:([x,y,z])=>[.5+z,y-.06,-31.5-x],
  screen:{center:[.6,2.12,-2.845],size:[7.5,2.5]},dock:[3.5,0,-.8],
  engineer:[-2.65,0,-2.03],laptop:[1.65,.868,-1.29],laptopYaw:Math.PI/2-.22,
  scale:{desk:.8,laptop:.165,chargingStation:.75,robot:.75,engineer:1.25},
  coverage:{width:20,back:-3,front:8,ceiling:3.6},
  robotRoomAmount(z,officeJourney){const u=officeJourney?Math.max(0,Math.min(1,(-z-21.5)/1.8)):0;return u*u*(3-2*u);}
 };
 const view=(eye,at)=>{const e=L.point(eye),t=L.point(at),d=e.map((x,i)=>x-t[i]);return {target:t,yaw:Math.atan2(d[0],d[2]),pitch:Math.atan2(d[1],Math.hypot(d[0],d[2])),dist:Math.hypot(...d)};};
 window.CommunicationsRoom={
  behaviour:new OfficeBehaviour(),active:false,time:0,hover:-1,pressed:-1,resumeAvailable:true,inRange:p=>p>=.915&&!window.ProjectStudy?.active,
  viewAt(p,narrow){
   const overview=window.CommunicationsPhone?.active?view([0,CommunicationsPhone.eyeHeight,5.8],[0,CommunicationsPhone.targetHeight,CommunicationsPhone.screen.center[2]]):view(narrow?[-.3,2.05,8.5]:[-1,1.77,6.2],narrow?[0,1.8,-2]:[-.45,2.08,-2]);
   const keys=[[.915,EngineeringLabLayout.views.experience],[.935,view([-7.4,1.7,-.5],[-5,1.7,-.5])],[.95,view([-4.45,1.7,-.5],[-2,1.7,-.5])],[.967,view([-4.4,1.8,2.4],[0,1.8,-2])],[.99,overview],[1,overview]];
   let i=0;while(i<keys.length-2&&p>keys[i+1][0])i++;
   const [a,av]=keys[i],[b,bv]=keys[i+1];let u=Math.max(0,Math.min(1,(p-a)/(b-a)));u=u*u*(3-2*u);
   const out={target:av.target.map((v,j)=>v+(bv.target[j]-v)*u)};
   for(const key of ['yaw','pitch','dist']){let d=bv[key]-av[key];if(key==='yaw')d=Math.atan2(Math.sin(d),Math.cos(d));out[key]=av[key]+d*u;}
   return out;
  },
  getState(){return {active:this.active,time:this.time,phase:this.behaviour.state,behaviour:this.behaviour.snapshot(),size:L.size,sharedActors:true,style:'workshop / graphite, brushed steel, warm ivory and signal red'};}
 };
 window.buildCommunicationsRoom=function(api){
  const k=createLabGeometryKit(api),{G,B,R,Y}=k,A=CommunicationsGraphics,M=createCommunicationsMaterials(k);
  const rendererInfo=api.gl.getExtension('WEBGL_debug_renderer_info'),softwareRenderer=/swiftshader|llvmpipe|software|basic render/i.test(String(api.gl.getParameter(rendererInfo?rendererInfo.UNMASKED_RENDERER_WEBGL:api.gl.RENDERER)));
  A.loadConnections();const root=k.moving(G(api.scene,L.origin,[0,Math.PI/2,0]));root.visible=false;
  const P={black:[.018,.020,.022],dark:[.032,.035,.037],metal:[.11,.12,.12],edge:[.26,.27,.26],ivory:[.78,.71,.60],red:[1,.025,.009],warm:[1,.69,.35]};
  const b=(parent,w,h,d,col,p,type='graphite',emit=0)=>M.finish(B(parent,w,h,d,col,p,type,emit),type);
  const r=(parent,w,h,d,col,p,bevel=.025,type='graphite')=>M.finish(R(parent,w,h,d,col,p,bevel,type),type);
  const y=(parent,rad,h,col,p,rot=[],type='steel',emit=0)=>M.finish(Y(parent,rad,h,col,p,rot,type,emit),type);
  const glowGeo=api.quad(1,1);
  function halo(parent,w,h,p,color,alpha=.32,rotation=0){
   const n=api.mat(parent,glowGeo,color,p,[0,0,rotation],'light',1.4);n.s=[w,h,1];n.texture=M.glow;n.texMode=3;n.alpha=alpha;n.finish=8;return n;
  }
  function line(parent,a,z,width,depth,col,emit=0){
   const dx=z[0]-a[0],dy=z[1]-a[1],node=b(parent,Math.hypot(dx,dy),width,depth,col,[(a[0]+z[0])/2,(a[1]+z[1])/2,(a[2]+z[2])/2],emit?'light':'steel',emit);
   node.r[2]=Math.atan2(dy,dx);return node;
  }
  const corners=(w,h,c)=>[[-w/2+c,-h/2],[w/2-c,-h/2],[w/2,-h/2+c],[w/2,h/2-c],[w/2-c,h/2],[-w/2+c,h/2],[-w/2,h/2-c],[-w/2,-h/2+c]];
  function rim(parent,w,h,cut,p,col,width=.018,emit=0,glow=false){
   const pts=corners(w,h,cut).map(([x,y])=>[x+p[0],y+p[1],p[2]]);
   pts.forEach((a,i)=>{const z=pts[(i+1)%pts.length];line(parent,a,z,width,.018,col,emit);
    if(glow&&Math.hypot(z[0]-a[0],z[1]-a[1])>.3)halo(parent,Math.hypot(z[0]-a[0],z[1]-a[1])+.12,.13,[(a[0]+z[0])/2,(a[1]+z[1])/2,p[2]+.018],col,.42,Math.atan2(z[1]-a[1],z[0]-a[0]));
   });
  }
  function polygon(parent,pts,depth,col,p,type='graphite',frontZ=null){
   const v=[],uv=[],ind=[],xs=pts.map(v=>v[0]),ys=pts.map(v=>v[1]),xmin=Math.min(...xs),ymin=Math.min(...ys),w=Math.max(...xs)-xmin,h=Math.max(...ys)-ymin;
   const front=([x,y])=>[x,y,frontZ?frontZ(y):depth/2],back=([x,y])=>[x,y,-depth/2];
   for(const side of [0,1]){const start=v.length/3;for(const point of pts){v.push(...(side?back(point):front(point)));uv.push((point[0]-xmin)/w,(point[1]-ymin)/h);}for(let i=1;i<pts.length-1;i++)ind.push(start, start+(side?i+1:i),start+(side?i:i+1));}
   pts.forEach((a,i)=>{const z=pts[(i+1)%pts.length],start=v.length/3;v.push(...front(a),...back(a),...back(z),...front(z));uv.push(0,1,0,0,1,0,1,1);ind.push(start,start+1,start+2,start,start+2,start+3);});
   return M.finish(api.mat(parent,api.customMesh(v,ind,uv),col,p,[],type),type);
  }
  function decal(parent,w,h,p,paint,options={}){
   const s=k.screen(parent,w,h,p,paint,options);s.node.emit=0;s.node.finish=1;s.node.rough=.52;s.node.texMode=3;s.node.alpha=.99;return s;
  }
  // Graphite porcelain floor: fine joints, restrained scuffs and a low gloss.
  // Extend the supporting surfaces beyond the open viewing side. Dragging can
  // reveal more floor/ceiling, but never a cut edge against an empty backdrop.
  const cover=L.coverage,coverDepth=cover.front-cover.back,coverZ=(cover.front+cover.back)/2;
  const floorSurface=(parent,w,d,p)=>{const n=b(parent,w,.14,d,[.095,.087,.077],p,'steel');n.finish=7;n.texture=M.floor;n.texMode=2;n.rough=.25;n.metal=.42;return n;};
  floorSurface(root,12,coverDepth,[0,-.07,coverZ]);
  // Side aprons are visible only after arrival, when the lab is culled. They
  // cannot overlap the lab's floor or lower its ceiling during the approach.
  const aprons=k.moving(G(root));
  const wing=(cover.width-12)/2;
  for(const side of [-1,1]){
   const x=side*(6+wing/2);
   floorSurface(aprons,wing,cover.front-3,[x,-.07,(cover.front+3)/2]);
   const cap=b(aprons,wing,.09,cover.front-3,P.black,[x,cover.ceiling+.045,(cover.front+3)/2]);cap.finish=6.2;
  }
  for(const x of [-3.6,3.1])for(let z=.5;z<3;z+=.43)b(root,.045,.004,.25,P.red,[x,.006,z],'light',.9);
  const welcomeRug=k.moving(G(root));
  const welcomeCarpet=b(welcomeRug,3.10,.016,1.85,[.15,.125,.105],[0,.010,1.20],'rubber');welcomeCarpet.name='office-welcome-carpet';welcomeCarpet.texture=M.rug;welcomeCarpet.texMode=2;welcomeCarpet.rough=.99;
  for(const x of [-1.50,1.50])b(welcomeRug,.028,.002,1.76,[.27,.055,.034],[x,.019,1.20],'rubber');
  for(const z of [.32,2.08])b(welcomeRug,3.0,.002,.028,[.27,.055,.034],[0,.019,z],'rubber');
  const leftWing=k.moving(G(root)),rightWing=k.moving(G(root));
  // Recessed wall fields and substantial, dark structural posts.
  b(root,12,3.6,.16,P.black,[0,1.8,-3.08]);b(leftWing,.20,3.6,1.10,P.black,[-6,1.8,-2.45]);
  b(leftWing,.20,3.6,4.60,P.black,[-6,1.8,3.20]);b(leftWing,.20,.36,2.80,P.black,[-6,3.42,-.5]);
  for(let x=-5.8;x<6;x+=1.15){b(root,.025,3.4,.028,[.009,.01,.011],[x,1.73,-2.98]);}
  const backPosts=[];
  for(const x of [-5.82,-3.50,4.67,5.84]){
   const post=k.moving(G(root,[x,0,0]));backPosts.push({node:post,x});
   r(post,.19,3.52,.24,P.dark,[0,1.76,-2.90],.018,'steel');b(post,.29,.13,.31,P.metal,[0,.08,-2.89],'steel');
   if(Math.abs(x)<5){b(post,.026,1.45,.034,P.red,[0,2.54,-2.748],'light',2);halo(post,.16,1.63,[0,2.54,-2.72],P.red,.38);}
  }
  b(root,12,.14,.23,P.dark,[0,3.48,-2.91],'steel');b(root,12,.13,.12,P.dark,[0,.08,-2.95],'steel');
  // The shared world-space portal supplies both finished door faces.
  // Detailed open-service ceiling, light panels, ducting and a cassette vent.
  const ceilingRig=k.moving(G(root));
  const ceiling=b(root,12,.09,coverDepth,P.black,[0,cover.ceiling+.045,coverZ]);ceiling.finish=6.2;
  for(const x of [-5.4,-3.6,-1.8,0,1.8,3.6,5.4]){
   b(ceilingRig,.075,.18,5.9,P.dark,[x,3.48,0],'steel');b(ceilingRig,.16,.035,5.9,P.metal,[x,3.39,0],'steel');
  }
  for(const z of [-2.65,-.8,1.15,2.8]){
   b(ceilingRig,11.8,.17,.085,P.dark,[0,3.43,z],'steel');b(ceilingRig,11.8,.026,.17,P.metal,[0,3.34,z],'steel');
   for(const x of [-5.4,-3.6,0,3.6,5.4]){b(ceilingRig,.21,.018,.25,P.dark,[x,3.32,z],'steel');for(const dx of [-.07,.07])y(ceilingRig,.018,.018,P.edge,[x+dx,3.301,z],[],'steel');}
  }
  for(const x of [-4.9,4.95]){
   b(ceilingRig,.33,.10,5.7,P.dark,[x,3.42,0],'steel');
   for(let z=-2.7;z<2.9;z+=.18)b(ceilingRig,.35,.018,.024,P.metal,[x,3.36,z],'steel');
   y(ceilingRig,.028,5.7,P.red,[x+.26,3.47,0],[Math.PI/2,0,0],'paint');y(ceilingRig,.038,5.7,P.metal,[x+.36,3.50,0],[Math.PI/2,0,0]);
  }
  const centralCeilingFixtures=[];
  for(const [x,z] of [[-3.4,1.8],[2.8,1.8],[-3,-1.55],[0,-1.55],[3,-1.55]]){
   const fixture=x===0?k.moving(G(ceilingRig)):ceilingRig;if(x===0)centralCeilingFixtures.push(fixture);
   for(const dx of [-.62,.62])y(fixture,.008,.22,P.edge,[x+dx,3.39,z]);
   r(fixture,1.55,.085,.38,P.black,[x,3.25,z],.012,'steel');
   b(fixture,1.43,.012,.31,[1,.90,.69],[x,3.199,z],'light',1.65);
   for(const zz of [-.185,.185])b(fixture,1.55,.016,.017,P.red,[x,3.211,z+zz],'light',1.9);
  }
  const vent=G(ceilingRig,[0,3.38,.35]);r(vent,1.16,.16,.9,P.metal,[0,0,0],.035,'steel');r(vent,.94,.05,.71,P.black,[0,-.098,0],.03);
  for(let i=0;i<13;i++)b(vent,.73,.013,.022,P.edge,[0,-.128,-.28+i*.045],'steel');
  // Contact sign: chamfered casing and small corner service details.
  const touch=k.moving(G(root,[-4.39,1.99,-2.88]));
  polygon(touch,corners(1.28,2.27,.08),.10,P.black,[0,0,0],'steel');rim(touch,1.20,2.19,.07,[0,0,.06],[.24,.16,.095],.015);
  const touchDisplay=k.screen(touch,1.12,2.09,[0,0,.065],A.touch,{width:384,height:768});k.live.push(touchDisplay.node);
  for(const x of [-.55,.55])for(const yy of [-.99,.99])b(touch,.045,.012,.018,P.red,[x,yy,.079],'light',.65);
  // Main display: raised machined surround, signal-red corners and warm header.
  const displayHeader=k.moving(G(root));
  const screen=k.moving(G(root,[L.screen.center[0],L.screen.center[1],-2.96]));
  polygon(screen,corners(7.79,2.73,.15),.14,P.dark,[0,0,0],'steel');
  rim(screen,7.69,2.64,.14,[0,0,.083],P.edge,.028);
  rim(screen,7.80,2.75,.17,[0,0,.09],P.metal,.035);
  rim(screen,7.59,2.54,.09,[0,0,.11],[.26,.28,.29],.012);
  const displayCorners=[];
  for(const sx of [-1,1])for(const sy of [-1,1]){
   displayCorners.push(line(screen,[sx*3.70,sy*1.36,.12],[sx*3.88,sy*1.18,.12],.025,.026,P.red,.9));
   y(screen,.035,.017,[.34,.36,.36],[sx*3.62,sy*1.19,.13],[Math.PI/2,0,0]);
   y(screen,.018,.02,P.black,[sx*3.62,sy*1.19,.14],[Math.PI/2,0,0]);
  }
  k.live.push(displayCorners[0]);
  for(const x of [-2.6,0,2.6])b(displayHeader,.76,.015,.026,P.warm,[x,1.46,.0],'light',1.4);
  let painting={hover:-1,pressed:-1,resume:CommunicationsRoom.resumeAvailable,revision:A.revision};
  const display=k.screen(root,7.5,2.5,[.6,2.12,-2.845],(c,v)=>A.display(c,v,painting),{width:1800,height:600});
  k.moving(display.node);display.node.emit=1;display.node.finish=8;k.live.push(display.node);
  // Faceted desk, sloping ivory front, dark cantilever wings and warm plinth.
  // Extend only to the right: the left edge stays fixed; all desk lights follow.
  const desk=k.moving(G(root,[.13608,0,-1.25]));desk.s=[L.scale.desk*1.12,L.scale.desk,L.scale.desk];
  polygon(desk,[[-2.98,.16],[2.98,.16],[2.55,1.04],[-2.55,1.04]],1.04,P.dark,[0,0,0],'steel',yy=>.65-.45*yy);
  r(desk,5.48,.08,.85,P.metal,[0,1.045,-.20],.028,'steel');
  const facade=[[-2.07,.19],[2.78,.19],[2.43,.91],[-1.57,.91]],v=facade.flatMap(([x,yy])=>[x,yy,.668-.45*yy]);
  const face=api.mat(desk,api.customMesh(v,[0,1,2,0,2,3]),P.ivory,[0,0,0],[],'paint');M.finish(face,'paint',.38);
  const deskAccents=[];
  for(const [a,z] of [[[ -2.07,.19,.59],[2.78,.19,.59]],[[-1.57,.91,.27],[2.43,.91,.27]]])deskAccents.push(line(desk,a,z,.016,.018,P.warm,1.8));
  deskAccents.forEach(n=>k.live.push(n));
  b(desk,5.64,.09,1.05,P.black,[0,.09,.08],'steel');b(desk,5.35,.025,.035,P.warm,[0,.13,.625],'light',2);
  halo(desk,5.5,.24,[0,.10,.65],P.warm,.4);
  const brand=decal(desk,4.15,.60,[.35,.54,.434],A.brand,{width:1536,height:260});brand.node.r[0]=-.423;k.moving(brand.node);
  const paper=[.73,.69,.58];
  for(const [x,z] of [[-1.90,.0],[.80,-.15]]){for(let i=0;i<3;i++)b(desk,.36,.022,.25,paper,[x,1.102+i*.022,z],'paint');b(desk,.33,.018,.23,P.red,[x,1.17,z],'paint');}
  y(desk,.047,.11,P.metal,[-1.18,1.14,.05]);for(let i=0;i<5;i++)y(desk,.005,.19,i%2?P.red:P.ivory,[-1.21+i*.014,1.25,.05]);
  const pendulum=buildOfficePendulum(k,api,desk,P);
  // Charging pad and faceted, ivory equipment cabinet. The robot stays shared.
  const dock=k.moving(G(root,L.dock));dock.s=[L.scale.chargingStation,L.scale.chargingStation,L.scale.chargingStation];
  r(dock,1.42,.065,1.34,P.dark,[0,.032,0],.035,'steel');
  for(const x of [-.68,.68])b(dock,.024,.018,1.30,P.red,[x,.073,0],'light',1.7);b(dock,1.38,.018,.024,P.red,[0,.074,.65],'light',1.8);
  halo(dock,1.55,.18,[0,.054,.70],P.red,.42);for(const x of [-.28,.28])b(dock,.12,.07,.04,P.edge,[x,.09,-.5],'steel');
  const cabinet=G(dock,[.98,0,-.33]);
  polygon(cabinet,corners(.68,1.16,.085),.64,P.ivory,[0,.60,0],'paint');
  polygon(cabinet,corners(.53,1.01,.06),.035,P.black,[0,.60,.336],'steel');rim(cabinet,.54,1.02,.065,[0,.60,.36],P.red,.012,1.6);
  b(cabinet,.32,.035,.31,P.dark,[0,1.205,0],'steel');b(cabinet,.28,.015,.025,P.red,[0,1.232,.10],'light',1);
  for(let i=0;i<5;i++)b(cabinet,.32,.014,.015,P.metal,[0,.21+i*.03,.365],'steel');
  const bolt=k.screen(cabinet,.34,.60,[0,.71,.365],A.bolt,{width:128,height:256});bolt.node.texMode=3;bolt.node.alpha=.99;bolt.node.finish=8;
  const dockLED=k.indicator(cabinet,[.22,.40,.37],P.red);
  // Leather lounge: inset cushions, piping, tufting and brushed-metal feet.
  const loungeYaw=-Math.PI/2;
  const wood=(parent,w,h,d,p)=>{const n=r(parent,w,h,d,[.66,.47,.29],p,.018,'paint');n.texture=M.timber;n.texMode=2;n.rough=.43;n.metal=.02;return n;};
  const sofa=k.moving(G(root,[5.38,0,.65],[0,loungeYaw,0])),leather=[.072,.060,.048];
  const upholstered=(w,h,d,p,bevel=.045)=>{const n=r(sofa,w,h,d,leather,p,bevel,'rubber');n.texture=M.leather;n.texMode=2;n.rough=.42;n.metal=.12;return n;};
  upholstered(2.48,.28,.86,[0,.31,0]);upholstered(2.46,.52,.20,[0,.68,-.36]);
  for(const x of [-.81,0,.81]){
   upholstered(.76,.15,.66,[x,.52,.035],.04);const back=upholstered(.76,.40,.17,[x,.73,-.24]);back.r[0]=-.10;
   for(const dx of [-.18,.18]){const button=y(sofa,.018,.012,[.015,.013,.012],[x+dx,.74,-.142],[Math.PI/2,0,0],'rubber');button.rough=.5;}
   b(sofa,.70,.008,.012,[.12,.10,.08],[x,.592,.34],'rubber');
  }
  for(const x of [-1.18,1.18])upholstered(.18,.37,.86,[x,.64,0]);
  for(const x of [-1,1])for(const z of [-.28,.28])y(sofa,.023,.16,P.edge,[x,.12,z]);
  const lounge=k.moving(G(root,[4.90,0,.65],[0,loungeYaw,0]));
  const rug=b(lounge,2.95,.012,1.85,[.115,.103,.095],[0,.008,0],'rubber');rug.texture=M.rug;rug.texMode=2;rug.rough=.99;
  for(const x of [-1.43,1.43])b(lounge,.035,.002,1.77,[.27,.055,.034],[x,.015,0],'rubber');
  for(const z of [-.88,.88])b(lounge,2.86,.002,.035,[.27,.055,.034],[0,.015,z],'rubber');
  const table=k.moving(G(root,[4.32,0,.65],[0,loungeYaw,0]));
  table.name='office-tea-table';const teaTop=wood(table,1.28,.055,.60,[0,.445,0]);teaTop.name='office-tea-top';r(table,1.20,.035,.54,P.dark,[0,.402,0],.015,'steel');
  for(const x of [-.43,.43]){for(const z of [-.24,.24])r(table,.032,.36,.032,P.metal,[x,.225,z],.008,'steel');r(table,.048,.025,.54,P.metal,[x,.036,0],.009,'steel');b(table,.07,.008,.50,P.black,[x,.019,0],'rubber');}
  r(table,1.03,.025,.48,P.dark,[0,.16,0],.012,'steel');
  r(table,.53,.018,.36,P.dark,[.10,.482,.015],.025,'steel');
  for(let i=0;i<2;i++)b(table,.26,.024,.19,i?P.red:paper,[-.03,.503+i*.027,.015],'paint');
  y(table,.058,.008,P.ivory,[.26,.497,.06],[],'paint');y(table,.042,.09,P.ivory,[.26,.544,.06],[],'paint');y(table,.034,.004,P.black,[.26,.591,.06],[],'rubber');
  for(const [a,z] of [[ [.295,.52,.06],[.33,.52,.06] ],[ [.33,.52,.06],[.33,.56,.06] ],[ [.33,.56,.06],[.295,.56,.06] ]])k.tube(table,a,z,.007,P.ivory,'paint');
  // Spun-metal dome shade, copper rim, three legs and a warm practical lamp.
  const lamp=k.moving(G(root,[4.95,0,-1.30]));for(const [x,z] of [[-.19,.16],[.19,.16],[0,-.21]])k.tube(lamp,[0,1.76,0],[x,0,z],.016,P.metal,'steel');
  const domeV=[],domeI=[],steps=24,rings=8;
  for(let j=0;j<=rings;j++)for(let i=0;i<=steps;i++){const a=i/steps*Math.PI*2,t=j/rings*Math.PI/2;domeV.push(Math.cos(a)*Math.sin(t)*.25,1.78+Math.cos(t)*.23,Math.sin(a)*Math.sin(t)*.25);}
  for(let j=0;j<rings;j++)for(let i=0;i<steps;i++){const a=j*(steps+1)+i;domeI.push(a,a+1,a+steps+1,a+1,a+steps+2,a+steps+1);}
  M.finish(api.mat(lamp,api.customMesh(domeV,domeI),P.dark,[0,0,0],[],'steel'),'steel',.23);
  y(lamp,.25,.017,[.5,.21,.065],[0,1.78,0],[],'steel');y(lamp,.215,.012,P.warm,[0,1.77,0],[],'light',1.65);
  // Reuse the lab's plant mesh, pots and chair; only their placements change.
  const plantMotion=[],officePlants=[];
  for(const p of [[5.65,0,-2.2]]){
   const parts=[],plantKit={...k,leaf(...args){const n=k.leaf(...args);parts.push(n);return n;},cable(parent,...args){const before=parent.children.length;k.cable(parent,...args);parts.push(...parent.children.slice(before));}};
   const plant=k.moving(buildPreservedOfficePlant(plantKit,root,p,1.12));officePlants.push(plant);
   if(plantMotion.length<2&&!softwareRenderer&&innerWidth>=800&&navigator.hardwareConcurrency>4){const crown=k.moving(G(plant,[0,.28,0]));for(const n of parts){plant.children.splice(plant.children.indexOf(n),1);crown.children.push(n);n.parent=crown;n.p[1]-=.28;}plantMotion.push(crown);}
  }
  // Two office-only botanical silhouettes. Shared curved blades, no alpha cards.
  function blade(width,bend){const v=[],ix=[];for(let j=0;j<=9;j++){const t=j/9;for(let i=0;i<3;i++){const u=i-1;v.push(u*width*Math.pow(Math.sin(Math.PI*t),.65),t,bend*t*t+Math.abs(u)*.035*Math.sin(Math.PI*t));}}for(let j=0;j<9;j++)for(let i=0;i<2;i++){const a=j*3+i;ix.push(a,a+3,a+1,a+1,a+3,a+4);}const count=v.length/3,front=ix.slice();v.push(...v.map((x,i)=>i%3===2?x-.001:x));for(let i=0;i<front.length;i+=3)ix.push(front[i+2]+count,front[i+1]+count,front[i]+count);return api.customMesh(v,ix);}
  const broadBlade=blade(.165,.17),broadVein=blade(.007,.17),narrowBlade=blade(.044,.075),stripeBlade=blade(.012,.075);
  function pot(parent,radius,height){
   const v=[],ix=[],rings=[[radius*.78,0],[radius,height*.12],[radius,height],[radius*.88,height],[radius*.88,height*.91]];
   rings.forEach(([rr,yy])=>{for(let i=0;i<=20;i++){const a=i/20*Math.PI*2;v.push(Math.cos(a)*rr,yy,Math.sin(a)*rr);}});
   for(let j=0;j<rings.length-1;j++)for(let i=0;i<20;i++){const a=j*21+i;ix.push(a,a+1,a+21,a+1,a+22,a+21);}
   M.finish(api.mat(parent,api.customMesh(v,ix),P.dark,[0,0,0],[],'paint'),'paint',.67);
   y(parent,radius*.8,.028,P.edge,[0,.025,0]);y(parent,radius*.87,.012,P.black,[0,height*.92,0],[],'rubber');
  }
  const trough=k.moving(G(root,[-4.39,.10,-2.66]));
  r(trough,1.14,.05,.31,P.dark,[0,.025,0],.018,'steel');
  for(const z of [-.145,.145])r(trough,1.14,.23,.025,P.dark,[0,.135,z],.012,'steel');
  for(const x of [-.558,.558])r(trough,.025,.23,.29,P.dark,[x,.135,0],.012,'steel');
  b(trough,1.08,.014,.26,P.black,[0,.215,0],'rubber');
  for(let i=0;i<7;i++)for(let j=0;j<3;j++){const n=api.mat(trough,narrowBlade,[.18,.36,.095],[(i-3)*.145,.22,0],[.15+j*.16,i*2.4+j*2.1,0],'paint');n.s=[1,.22+(i%3)*.055,1];n.rough=.6;n.metal=0;n.emit=.14;}
  const bird=k.moving(G(root,[-5.53,0,-2.54]));pot(bird,.215,.37);
  for(let i=0;i<7;i++){
   const a=i*2.399,end=[Math.sin(a)*.045,.91+(i%3)*.15,Math.cos(a)*.045];
   const stem=k.tube(bird,[0,.34,0],end,.010,[.18,.36,.095],'paint');stem.rough=.6;stem.metal=0;
   const n=api.mat(bird,broadBlade,[.18,.36,.095],end,[.16,a,(i%2?1:-1)*.12],'paint');n.s=[1,.70+(i%3)*.075,1];n.rough=.6;n.metal=0;n.emit=.14;
   api.mat(n,broadVein,[.24,.37,.10],[0,0,-.002],[],'paint');
  }
  const side=k.moving(G(root,[-5.40,0,2.05],[0,Math.PI/2,0]));
  wood(side,1.62,.055,.68,[0,.825,0]);r(side,1.56,.045,.62,P.dark,[0,.775,0],.018,'steel');
  r(side,.43,.70,.56,P.dark,[-.53,.40,0],.022,'steel');b(side,.37,.055,.49,P.black,[-.53,.055,0],'steel');
  for(const yy of [.22,.42,.62]){r(side,.385,.177,.018,P.metal,[-.53,yy,.291],.009,'steel');b(side,.19,.012,.014,P.black,[-.53,yy+.045,.304],'rubber');b(side,.17,.008,.008,P.edge,[-.53,yy+.054,.309],'steel');}
  for(const z of [-.24,.24])r(side,.035,.74,.035,P.metal,[.65,.40,z],.007,'steel');r(side,.055,.03,.55,P.metal,[.65,.045,0],.008,'steel');
  b(side,1.48,.018,.018,P.warm,[0,.785,.322],'light',.55);
  r(side,.70,.49,.05,P.black,[.16,1.16,-.18],.02,'steel');let wsPhase=0;
  const workstation=k.screen(side,.64,.42,[.16,1.16,-.147],(c,v)=>CommunicationsScreens.homepage(c,v,wsPhase),{width:1024,height:640});k.live.push(workstation.node);
  if(!CommunicationsScreens.home.complete)CommunicationsScreens.home.addEventListener('load',()=>workstation.draw(),{once:true});
  const laptopScreen=k.screen(root,.01,.01,[0,-5,0],CommunicationsScreens.ubuntu,{width:1024,height:640});laptopScreen.node.visible=false;
  b(side,.18,.18,.045,P.metal,[.16,.95,-.2],'steel');b(side,.43,.018,.15,P.black,[.16,.867,.06],'rubber');
  // Supported shelves leave a separate planting pocket at the front end.
  for(const x of [-.35,.66]){r(side,.028,1.43,.028,P.metal,[x,1.53,-.285],.006,'steel');}
  for(const yy of [1.59,2.22]){wood(side,1.20,.035,.30,[.16,yy,-.14]);for(const x of [-.35,.66]){b(side,.025,.10,.27,P.dark,[x,yy-.065,-.14],'steel');}b(side,1.15,.012,.012,P.warm,[.16,yy-.025,.012],'light',.65);}
  const carStates=[];
  for(const [i,x,yy,file] of [[0,-.05,1.612,'porsche'],[1,.30,2.242,'alpine-a110']]){
   const mount=k.moving(G(side,[x,yy,-.14]));mount.name='office-car-mount-'+i;mount.s=[.52,.52,.52];
   carStates.push(CommunicationsCars.mount(api,k,mount,file));
  }
  const snake=G(side,[-.68,.855,-.15]);pot(snake,.115,.18);
  for(let i=0;i<9;i++){const a=i*2.399,p=[Math.sin(a)*.044,.16,Math.cos(a)*.044],rot=[.06+(i%3)*.08,a,0],height=.36+(i%4)*.065;
   const leaf=api.mat(snake,narrowBlade,[.18,.36,.095],p,rot,'paint');leaf.s=[1,height,1];leaf.rough=.6;leaf.metal=0;leaf.emit=.18;
   const stripe=api.mat(leaf,stripeBlade,[.24,.37,.10],[0,0,-.002],[],'paint');stripe.s=[1,1,1];
  }
  const officeChairs=[];
  if(api.chair){
   const chair=k.moving(G(root,[-4.72,0,2.12],[0,Math.PI/2,0]));officeChairs.push(chair);
   const clone=(source,parent)=>{const node=source.geometry&&!source._batched?api.mat(parent,source.geometry,source.color,source.p,source.r,'graphite',source.emit):G(parent,source.p,source.r);node.s=source.s.slice();for(const key of ['rough','metal','finish','texture','texMode','alpha'])if(source[key]!==undefined)node[key]=source[key];for(const child of source.children)clone(child,node);};
   for(const child of api.chair.children)clone(child,chair);
  }
  // Window: metal returns and slender mullions use the same aperture as daylight.
  for(const yy of [.18,3.35]){b(rightWing,.24,.36,6,P.dark,[6,yy,0],'steel');b(rightWing,.04,.022,5.9,P.edge,[5.86,yy+(yy<1?.18:-.18),0],'steel');}
  for(const z of [-2.9,-1.45,0,1.45,2.9])b(rightWing,.13,3,.055,P.dark,[6,1.75,z],'steel');
  b(rightWing,.13,.045,5.8,P.dark,[6,1.7,0],'steel');b(rightWing,.04,.018,5.75,P.warm,[5.85,3.48,0],'light',1.3);
  const {foliage}=buildCommunicationsExterior(k,rightWing);let clock=0,lastPaint=-10,lastWorkstation=-10;
  return {root,kit:k,display,dockLED,laptopScreen,pendulum,
   update(dt,ms,active,progress=1){
    root.visible=active;if(!active)return;
    aprons.visible=progress>=.975&&!(api.doorway?.openAmount>.001);
    window.CommunicationsPhone?.dress({root,leftWing,rightWing,screen,display,desk,dock,ceilingRig,centralCeilingFixtures,displayHeader,backPosts,brand,welcomeRug,sofa,lounge,table,lamp,touch,trough,bird,side,officePlants,officeChairs});
    const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;pendulum.update(dt,reduced);clock+=reduced?0:Math.min(dt,.05);CommunicationsRoom.time=clock;foliage.r[2]=(Math.sin(clock*.31)+.35*Math.sin(clock*.57))*.003;foliage.p[1]=Math.sin(clock*.23)*.005;
    const life=CommunicationsRoom.behaviour.snapshot(),low=softwareRenderer||innerWidth<800||navigator.hardwareConcurrency<=4||window.__workshopQuality==='low';
    dockLED.emit=life.docked?.65+(reduced?0:life.dockAge<.7?.18*Math.sin(life.dockAge/.7*Math.PI):.06*Math.sin(clock*.9)):life.kiraState==='RECEPTION_APPROACHING_DOCK'?.3:.12;
    for(const n of deskAccents)n.emit=1.8*(1+.12*life.welcome+(life.selected===1?.08:0)+life.ack*.03);
    touchDisplay.node.emit=.9*(1+.08*life.welcome+(life.selected===0?.1:0));
    workstation.node.emit=.9+(life.selected===2?.12:0);
    for(let i=0;i<plantMotion.length;i++)plantMotion[i].r[2]=reduced||low?0:.003*Math.sin(clock*.37+i*2.1);
    const nextWS=life.selected===2?2:!reduced&&!low&&Math.floor(clock/9)%3===1?1:0;
    if(nextWS!==wsPhase&&life.time-lastWorkstation>.5){wsPhase=nextWS;workstation.draw();lastWorkstation=life.time;}
    displayCorners[0].emit=.9+(reduced?0:.04*Math.sin(clock*.7))+.1*life.welcome;
    const paintStep=reduced||softwareRenderer?0:Math.floor(life.time*(life.state==='ACTIVATING'?8:low?1:2));
    painting.life=life;painting.motion=reduced?0:clock;
    if(lastPaint!==paintStep){lastPaint=paintStep;display.draw();}
    if(painting.hover!==CommunicationsRoom.hover||painting.pressed!==CommunicationsRoom.pressed||painting.resume!==CommunicationsRoom.resumeAvailable||painting.revision!==A.revision){painting={hover:CommunicationsRoom.hover,pressed:CommunicationsRoom.pressed,resume:CommunicationsRoom.resumeAvailable,revision:A.revision,life:CommunicationsRoom.behaviour.snapshot(),motion:reduced?0:clock};display.draw();}
   },
   getState:()=>({cars:carStates.map(s=>({...s})),pendulum:pendulum.getState(),softwareRenderer,equipment:{displayIndicator:displayCorners[0].emit,desk:deskAccents.map(n=>n.emit),panel:touchDisplay.node.emit,workstation:workstation.node.emit,workstationPhase:wsPhase,dock:dockLED.emit,plants:plantMotion.map(n=>n.r[2]),displayStep:lastPaint},geometry:k.stats(),clock,visible:root.visible,materialTextures:M.count(),display:'depth-tested canvas with accessible projected anchors',protectedModels:'unchanged'})
  };
 };
})();
