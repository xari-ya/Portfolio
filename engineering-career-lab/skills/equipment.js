window.buildSkillsElectronicsBoard=function(k,parent){const {G,B,C}=k,root=k.moving(G(parent,[-4.75,1.39815,-21.00]));root.s=[1.18,1.18,1.18];
 SkillsCraft.board(k,root,1,{headers:false});const breadboard=G(root,[.80,.04,.02]);k.R(breadboard,.44,.055,.59,[.50,.54,.49],[0,0,0],.018,'paint');
 for(let i=0;i<10;i++)for(const x of [-.13,-.07,.07,.13])B(breadboard,.011,.003,.014,C.black,[x,.031,-.24+i*.052]);
 for(const x of [-.18,.18])B(breadboard,.006,.002,.47,x>0?C.red:[.08,.17,.26],[x,.032,0]);
 // Short jumpers connect individual PCB test pads to breadboard sockets.
 for(const [x,z] of [[.43,.12],[.48,.22]]){k.Y(root,.012,.008,[.59,.43,.18],[x,.065,z]);B(root,.018,.032,.020,C.black,[x,.083,z]);}
 for(const [x,z] of [[.73,.072],[.87,.176]])B(root,.018,.022,.020,C.black,[x,.078,z]);
 SkillsCraft.wire(k,root,[[.43,.099,.12],[.48,.195,.12],[.66,.195,.072],[.73,.089,.072]],.007,C.red);
 SkillsCraft.wire(k,root,[[.48,.099,.22],[.57,.24,.29],[.82,.24,.22],[.87,.089,.176]],.007,C.black);
 const leds=[k.indicator(root,[-.12,.085,.23],C.mint),k.indicator(root,[-.04,.085,.23],C.red)];return {root,leds};};
window.buildSkillsOscilloscope=function(k,parent){const {G,B,Y,C}=k,root=G(parent,[-8.70,1.87,-20.70]);root.s=[1.20,1.20,1.20];
 k.R(root,1.55,.82,.64,[.25,.28,.27],[0,0,0],.055,'paint');B(root,1.44,.70,.025,C.graphite,[0,.01,.335]);B(root,.83,.55,.026,C.black,[-.20,.06,.36],'glass');for(const x of [-.56,.56])B(root,.14,.07,.45,C.black,[x,-.45,0],'rubber');
 for(const x of [.33,.58])for(const y of [-.10,.12,.29]){Y(root,y===.29?.072:.042,.055,C.steel,[x,y,.38],[Math.PI/2,0,0]);}for(const x of [-.53,-.23,.07,.38]){Y(root,.047,.06,C.black,[x,-.27,.38],[Math.PI/2,0,0]);Y(root,.029,.065,C.silver,[x,-.27,.39],[Math.PI/2,0,0]);}
 for(let i=0;i<5;i++)B(root,.04,.42,.025,C.darkSteel,[.79,.01,-.23+i*.11]);
 const display=k.screen(root,.78,.50,[-.20,.06,.384],(c,v,time=0,mode='idle')=>{c.fillStyle='#061214';c.fillRect(0,0,v.width,v.height);c.fillStyle='#0f2429';c.fillRect(12,38,488,220);c.strokeStyle='#26434a';c.lineWidth=1;for(let x=20;x<500;x+=40){c.beginPath();c.moveTo(x,38);c.lineTo(x,258);c.stroke();}for(let y=38;y<260;y+=28){c.beginPath();c.moveTo(12,y);c.lineTo(500,y);c.stroke();}
 c.strokeStyle='#56716d';c.setLineDash([2,5]);c.beginPath();c.moveTo(12,148);c.lineTo(500,148);c.stroke();c.setLineDash([]);
 for(let ch=1;ch>=0;ch--){c.strokeStyle=ch?'#58bddf':'#e0d165';c.lineWidth=ch?1.4:2.4;c.shadowColor=c.strokeStyle;c.shadowBlur=ch?0:5;c.beginPath();for(let x=14;x<500;x++){const y=ch?158+31*Math.sin(x*.035+time+.8):mode==='embedded'?140+45*(Math.sin(x*.035+time*2)>0?1:-1):140+48*Math.sin(x*.035+time)+16*Math.sin(x*.08);if(x>14)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();c.shadowBlur=0;}
 c.fillStyle='#e0d165';c.font='16px monospace';c.fillText('CH1  2.00 V',16,25);c.fillStyle='#78c5d6';c.fillText('CH2  500 mV',300,25);c.fillStyle='#a8bbb7';c.font='14px monospace';c.fillText('M 250 us    T +0.00 s    DEMO',18,284);
},{width:512,height:300,dynamic:true});
 SkillsCraft.scopeFace(k,root);
 k.cable(parent,[[-8.65,1.46,-21.25],[-8.5,1.32,-21.05],[-7.65,1.32,-21.10],[-7.4,1.38,-21.65]],.015);return {root,display};};
window.buildSkillsRoboticsMechanism=function(k,parent){const {G,C}=k,root=k.moving(G(parent,[-4.20,1.4075,-21.28]));root.s=[1.20,1.20,1.20];const yaw=k.moving(G(root)),pitch=k.moving(G(yaw));SkillsCraft.robot(k,pitch);const lamp=k.indicator(pitch,[-.47,.48,.23],C.red);return {root,yaw,pitch,lamp,limits:{yaw:[-.45,.45],pitch:[-.32,.32]}};};
window.buildSkillsInstrumentation=function(k,parent){const root=k.moving(k.G(parent,[-4.25,1.378,-21.05]));root.s=[1.60,1.30,1.45];SkillsCraft.sensor(k,root);const leds=[k.indicator(root,[.35,.18,.16],k.C.mint),k.indicator(root,[.48,.18,.16],k.C.red)];return {root,leds};};
window.buildSkillsSoftwarePreview=function(k,parent){const {G,B,R,C}=k,root=k.moving(G(parent,[-4.20,1.377,-21.02]));
 R(root,1.42,.055,.92,C.graphite,[0,.028,.05],.035);B(root,1.06,.012,.39,C.black,[0,.062,.20]);for(let j=0;j<4;j++)for(let i=0;i<10;i++)B(root,.075,.008,.055,C.darkSteel,[-.47+i*.105,.073,.06+j*.08]);
 B(root,.36,.007,.14,C.steel,[0,.063,.41]);const lid=G(root,[0,.49,-.34],[-.13,0,0]);R(lid,1.40,.87,.065,C.graphite,[0,0,0],.035);k.screen(lid,1.28,.74,[0,0,.038],(c,v)=>LabRefinement.paintTechnical(c,v,'software'),{width:640,height:370});return {root};};
window.buildSkillsLaptopScreen=function(k,parent){const root=k.G(parent,[-3.6,1.3,-21.45]);const screen=k.screen(root,.01,.01,[0,-.2,0],(c,v,time=0,mode='overview')=>{
 c.fillStyle='#0a151b';c.fillRect(0,0,v.width,v.height);c.fillStyle='#daeee9';c.font='bold 30px monospace';c.fillText(mode==='design'?'DESIGN / INTEGRATE':mode==='software'?'SOFTWARE / SIGNAL PIPELINE':'ENGINEERING WORKSPACE',36,50);c.fillStyle='#91aaa9';c.font='18px monospace';c.fillText('LOCAL DEVELOPMENT / SIMULATED DISPLAY',36,85);c.strokeStyle='#38545b';c.lineWidth=2;c.strokeRect(30,110,v.width-60,v.height-140);
 if(mode==='design'){c.strokeStyle='#cad8dd';c.lineWidth=4;c.strokeRect(250,180,430,225);c.strokeRect(320,230,290,130);for(const x of [280,650])for(const y of [210,375]){c.beginPath();c.arc(x,y,11,0,Math.PI*2);c.stroke();}c.strokeStyle='#e67c54';c.beginPath();c.moveTo(250,445);c.lineTo(680,445);c.stroke();c.font='20px monospace';c.fillStyle='#d8936c';c.fillText('PARAMETRIC ENCLOSURE / mm',280,485);}
 else{const lines=['def process_sample(sample):','    validated = validate(sample)','    calibrated = calibrate(validated)','    return filter_signal(calibrated)','','DESIGN → DEVELOP → INTEGRATE → TEST'];c.font='22px monospace';lines.forEach((t,i)=>{c.fillStyle=i===0?'#efaa7b':i===5?'#7bd4b5':'#b6d2d8';c.fillText(t,60,175+i*49);});}
 },{width:1024,height:640,dynamic:true});screen.node.visible=false;return screen;};
window.buildSkillsProps=function(k,parent){const {G,B,Y,C}=k,root=G(parent);B(root,.60,.03,.43,[.29,.19,.12],[-3.10,1.33,-22.60]);B(root,.56,.006,.39,[.74,.75,.68],[-3.10,1.35,-22.60]);for(let i=0;i<4;i++)B(root,.32,.003,.008,C.darkSteel,[-3.13,1.356,-22.7+i*.06]);B(root,.65,.06,.38,C.darkSteel,[-7.2,1.34,-22.3]);for(const x of [-7.35,-7.12]){Y(root,.03,.22,C.red,[x,1.41,-22.2],[Math.PI/2,0,.2]);Y(root,.008,.23,C.steel,[x-.045,1.41,-22.01],[Math.PI/2,0,.2]);}// Compact wire reel, probe tray and connector bins complete the working bench.
 const reel=G(root,[-7.65,1.37,-22.02]);for(const z of [-.065,.065])Y(reel,.12,.018,C.graphite,[0,.12,z],[Math.PI/2,0,0]);Y(reel,.085,.12,[.34,.19,.065],[0,.12,0],[Math.PI/2,0,0]);k.cable(root,[[-7.65,1.42,-21.96],[-7.8,1.33,-21.5],[-7.45,1.33,-21.3]],.009,C.red);
 B(root,.58,.045,.32,C.graphite,[-5,1.34,-22.26]);for(let i=0;i<3;i++){B(root,.15,.06,.25,[.09,.11,.12],[-5.18+i*.18,1.38,-22.26]);for(let j=0;j<2;j++)B(root,.035,.04,.045,j?C.ivory:C.steel,[-5.18+i*.18,1.42,-22.32+j*.10]);}
 B(root,.52,.018,.21,C.graphite,[-8.7,1.34,-21.15]);for(let i=0;i<2;i++){B(root,.035,.035,.23,i?C.red:C.black,[-8.82+i*.2,1.36,-21.15]);Y(root,.008,.12,C.silver,[-8.82+i*.2,1.36,-21.32],[Math.PI/2,0,0]);}
 return {root};};
window.populateSkillsStation=function(room){const k=room.kit,r=room.stationRoot,props=buildSkillsProps(k,r);props.soldering=buildSkillsSoldering(k,r);props.showcase=buildSkillsShowcase(k,r);
 room.station={bench:buildSkillsWorkbench(k,r),returnBench:buildSkillsReturnBench(k,r),display:buildSkillsDisplay(k,r),rack:buildSkillsEquipmentRack(k,r),lights:buildSkillsTaskLighting(k,r),board:buildSkillsElectronicsBoard(k,r),scope:buildSkillsOscilloscope(k,r),robotics:buildSkillsRoboticsMechanism(k,r),instrumentation:buildSkillsInstrumentation(k,r),software:buildSkillsSoftwarePreview(k,r),laptopScreen:buildSkillsLaptopScreen(k,r),props};
 let lastScreen=-Infinity,lastMode=null,lastFocus='';const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;room.focus={point:[-5,2,-21.7],intensity:0};
 room.environment={elapsed:0,arrival:0,visits:0,active:false,uniform:[0,1,0,0]};
 room.update=function(dt,ms,s){const env=room.environment;if(!s.active||document.hidden){env.active=false;return;}if(!env.active){env.active=true;env.arrival=0;env.visits++;}const step=Math.min(.25,Math.max(0,dt));env.elapsed+=reduced?0:step;env.arrival+=step;const activation=reduced?1:Math.min(1,env.arrival/(env.visits>1?.65:3));env.uniform=[env.elapsed,activation,s.mode==='skills'?1:0,s.mode==='experience'?1:0];
  if(!reduced){const table=room.station.props.showcase.turntable;if(table)table.r[1]=env.elapsed*Math.PI/30;}
const mode=s.category||'overview',featured=s.preview||s.category||'embedded',age=(ms-s.selectedAt)/1000,focus=s.preview||mode;
  if(!reduced&&!document.hidden){for(let i=0;i<(k.plantMotion?.length||0);i++)k.plantMotion[i].r[2]=.004*Math.sin(ms*.00035+i*1.7);}
  room.station.software.root.visible=mode==='software';room.station.robotics.root.visible=mode==='robotics';room.station.instrumentation.root.visible=mode==='design';room.station.board.root.visible=mode==='overview'||mode==='embedded';
  for(const [i,n]of room.station.board.leds.entries())n.emit=(focus==='embedded'||mode==='overview')?.55+(reduced?0:(Math.sin(env.elapsed*(i?2.13:3.71)+i*2.4)>.93?.22:0)):.18;
  room.station.scope.display.node.emit=reduced?.9:.55+.35*Math.min(1,Math.max(0,env.arrival-.5));
  room.station.display.substrate.node.emit=reduced?.9:.82+.08*Math.min(1,env.arrival);
  room.station.returnBench.indicator.emit=focus==='embedded'?.72:.12;
  for(const n of room.station.instrumentation.leds)n.emit=focus==='design'?.7:.16;
  const mechanism=room.station.robotics,amplitude=mode==='robotics'&&!reduced?Math.min(1,age/1.2)*Math.max(0,Math.min(1,(6-age)/1.5)):0,blend=1-Math.exp(-5*dt);
  mechanism.yaw.r[1]+=(Math.sin(age*1.7)*.40*amplitude-mechanism.yaw.r[1])*blend;mechanism.pitch.r[0]+=(Math.sin(age*1.4)*.035*amplitude-mechanism.pitch.r[0])*blend;mechanism.lamp.emit=mode==='robotics'?.8:.12;
  room.station.props.showcase.lamp.emit=(focus==='robotics'?.65:.30)*(reduced?1:Math.min(1,Math.max(.3,(env.arrival-1.5)/1.0)));
  room.station.props.soldering.lamp.emit=focus==='embedded'?.75:.25;
  if(featured!==lastFocus||mode!==lastMode){room.station.display.substrate.draw(0,featured);lastFocus=featured;}
  const localTarget=({embedded:[-4.75,1.95,-21.00],software:[-4.20,2.1,-21.02],robotics:[-4.20,2,-21.28],design:[-4.25,2,-21.05]})[focus],target=localTarget?EngineeringLabLayout.stationPoint(localTarget):room.hover==='skills'?[-4.4,2.6,-23.7]:room.hover==='experience'?[4.4,3,-23.7]:null;for(let i=0;i<3;i++)room.focus.point[i]+=((target||room.focus.point)[i]-room.focus.point[i])*blend;room.focus.intensity+=((target?.85:0)-room.focus.intensity)*blend;
  if(mode!==lastMode||!reduced&&ms-lastScreen>125){room.station.scope.display.draw(reduced?0:ms*.001,mode);if(mode!==lastMode)room.station.laptopScreen.draw(0,mode);lastScreen=ms;lastMode=mode;}
 };
 return room.station;
};
