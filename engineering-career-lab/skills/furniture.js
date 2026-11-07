/* Skills Station furniture and its two procedural displays. The display art is
   shared with the HTML instrument panel so the physical screen and its readable
   projection show the same Engineering Domains record. */
(()=>{'use strict';
 const rr=(c,x,y,w,h,r)=>{r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();};
 function lineWrap(c,text,maxWidth,maxLines){const words=String(text).split(/\s+/),lines=[];let line='';for(const word of words){const test=line?line+' '+word:word;if(!line||c.measureText(test).width<=maxWidth)line=test;else{lines.push(line);line=word;if(maxLines&&lines.length>=maxLines-1)break;}}if(line)lines.push(line);return maxLines?lines.slice(0,maxLines):lines;}
 function icon(c,type,x,y,s,color){c.save();c.translate(x,y);c.strokeStyle=color;c.lineWidth=Math.max(2,s*.072);c.lineCap='round';c.lineJoin='round';const u=s/24;c.scale(u,u);c.lineWidth=1.55;c.beginPath();
  if(type==='chip'){rr(c,6.2,6.2,11.6,11.6,1.6);c.stroke();rr(c,9.4,9.4,5.2,5.2,.8);c.stroke();for(const v of [9,12,15]){c.moveTo(v,2.2);c.lineTo(v,6.2);c.moveTo(v,17.8);c.lineTo(v,21.8);c.moveTo(2.2,v);c.lineTo(6.2,v);c.moveTo(17.8,v);c.lineTo(21.8,v);}c.stroke();}
  else if(type==='robot'){c.moveTo(4.2,20.8);c.lineTo(19.8,20.8);c.moveTo(6.8,20.8);c.lineTo(6.8,17.4);c.lineTo(13.2,12.3);c.lineTo(6.8,6.1);c.moveTo(13.2,12.3);c.lineTo(18.4,6.9);c.lineTo(14.3,2.9);c.lineTo(7.1,5.9);c.moveTo(18.4,6.9);c.lineTo(21.1,9.8);c.lineTo(18.4,12.7);c.stroke();c.beginPath();c.arc(6.8,6.1,1.8,0,Math.PI*2);c.stroke();c.beginPath();c.arc(13.2,12.3,1.7,0,Math.PI*2);c.stroke();}
  else if(type==='code'){c.moveTo(8,5.8);c.lineTo(2.3,12);c.lineTo(8,18.2);c.moveTo(16,5.8);c.lineTo(21.7,12);c.lineTo(16,18.2);c.moveTo(14.1,3.1);c.lineTo(9.9,20.9);c.stroke();}
  else{c.rect(2.6,3.4,18.8,13.2);c.stroke();c.beginPath();c.moveTo(6,9.7);c.lineTo(7.8,9.7);c.lineTo(9.2,13.9);c.lineTo(11.4,7.7);c.lineTo(13.4,12.2);c.lineTo(14.7,9.7);c.lineTo(18,9.7);c.moveTo(8.6,20.6);c.lineTo(15.4,20.6);c.moveTo(12,16.6);c.lineTo(12,20.6);c.stroke();}
  c.restore();}
 function paintDomains(c,v,time=0,selected='embedded'){
  if(window.LabRefinement?.paintDomain(c,v))return;
  if(window.EngineeringLab&&!EngineeringLab.getState().category)selected=null;
  const W=v.width,H=v.height,list=window.EngineeringSkillsData?.categories||[],cat=list.find(x=>x.id===selected)||list[0];
  c.fillStyle='#050e11';c.fillRect(0,0,W,H);const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#101f23');g.addColorStop(.52,'#081316');g.addColorStop(1,'#040b0d');c.fillStyle=g;c.fillRect(0,0,W,H);
  c.strokeStyle='#142428';c.lineWidth=2;c.strokeRect(9,9,W-18,H-18);
  // Header: outlined red square, tracked title, page dots.
  c.strokeStyle='#ff4327';c.lineWidth=2.4;c.strokeRect(31,25,13,13);c.strokeRect(35,29,5,5);
  c.fillStyle='#ecefe8';c.font='700 21px "Arial Narrow",Arial,sans-serif';if('letterSpacing' in c)c.letterSpacing='2px';c.fillText('ENGINEERING DOMAINS',57,39);if('letterSpacing' in c)c.letterSpacing='0px';
  c.fillStyle='#97a5a5';c.font='20px monospace';c.fillText('···',W-62,39);
  const gridX=28,gridY=62,gridW=Math.round(W*.635),gridH=H-gridY-40,gap=14,cardW=(gridW-gridX-gap*3)/4,detailX=gridX+gridW+12,detailW=W-detailX-28;
  for(let i=0;i<list.length;i++){const item=list[i],x=gridX+i*(cardW+gap),on=item.id===selected;
   const grad=c.createLinearGradient(x,gridY,x+cardW,gridY+gridH);grad.addColorStop(0,on?'rgba(93,27,18,.64)':'rgba(17,27,31,.78)');grad.addColorStop(.62,on?'rgba(41,14,11,.82)':'rgba(8,14,17,.9)');grad.addColorStop(1,'rgba(5,10,12,.95)');c.fillStyle=grad;rr(c,x,gridY,cardW,gridH,6);c.fill();
   if(on){c.shadowColor='#ff3d21';c.shadowBlur=22;}c.strokeStyle=on?'#ff4327':'#253339';c.lineWidth=on?3:2;rr(c,x,gridY,cardW,gridH,6);c.stroke();c.shadowBlur=0;
   icon(c,item.icon,x+cardW/2-33,gridY+gridH*.29,66,on?'#ff4a2b':'#e6e9e2');
   c.fillStyle=on?'#f1f2ec':'#cbd2ce';c.font='600 21px "Workshop Condensed","Arial Narrow",Arial,sans-serif';c.textAlign='center';const lines=lineWrap(c,item.name,cardW-18,2);lines.forEach((t,j)=>c.fillText(t,x+cardW/2,gridY+gridH*.68+j*24));c.textAlign='left';
  }
  if(!selected){c.fillStyle='#eef0e9';c.font='600 27px "Workshop Condensed",sans-serif';c.fillText('SELECT A DOMAIN',detailX,gridY+35);c.font='18px Arial';c.fillStyle='#b7c1be';lineWrap(c,'Explore the tools, technologies and capabilities behind my projects.',detailW-8,5).forEach((t,i)=>c.fillText(t,detailX,gridY+80+i*27));return;}
  // Selected-domain detail column, separated by a hairline like the reference.
  c.strokeStyle='#1d2b2f';c.lineWidth=2;c.beginPath();c.moveTo(detailX-10,gridY);c.lineTo(detailX-10,H-46);c.stroke();
  c.fillStyle='#eef0e9';c.font='700 20px "Arial Narrow",Arial,sans-serif';c.fillText(cat.name.toUpperCase(),detailX,gridY+22);
  c.fillStyle='#92a09f';c.font='19px monospace';c.fillText('···',W-55,gridY+22);
  c.fillStyle='#b7c1be';c.font='15px/1.45 Arial,sans-serif';lineWrap(c,cat.description,detailW-8,5).forEach((t,j)=>c.fillText(t,detailX,gridY+60+j*22));
  c.fillStyle='#ff6844';c.font='700 13px Arial,sans-serif';if('letterSpacing' in c)c.letterSpacing='1px';c.fillText('KEY TECHNOLOGIES',detailX,gridY+210);if('letterSpacing' in c)c.letterSpacing='0px';
  let chipX=detailX,chipY=gridY+226;c.font='14px Arial,sans-serif';
  for(const tool of cat.tools){const tw=c.measureText(tool).width+22;if(chipX+tw>detailX+detailW){chipX=detailX;chipY+=42;}c.fillStyle='rgba(118,36,25,.40)';rr(c,chipX,chipY,tw,32,5);c.fill();c.strokeStyle='#74392d';c.lineWidth=1.5;rr(c,chipX,chipY,tw,32,5);c.stroke();c.fillStyle='#d8d7cf';c.fillText(tool,chipX+11,chipY+21);chipX+=tw+7;}
 }
 function paintJourney(c,v,time=0,active='achievements'){LabRefinement.paintArchive(c,v,active);}
 function paintStationSign(c,v,number,title,subtitle,titleX= .34,numX= .11,opts={}){
  const W=v.width,H=v.height;c.fillStyle='#080b0c';c.fillRect(0,0,W,H);c.fillStyle='#ff3d21';c.fillRect(0,0,W*.006,H);
  const ns=opts.numScale||1,ts=opts.titleScale||1,tsx=opts.titleSX||1;
  c.fillStyle='#f04428';c.font='600 '+Math.round(H*.60*ns)+'px "Workshop Condensed","Arial Narrow",sans-serif';c.fillText(number,W*numX,H*.73);
  c.fillStyle='#dedbd0';c.font='600 '+Math.round(H*.44*ts)+'px "Workshop Condensed","Arial Narrow",sans-serif';c.save();c.translate(W*titleX,0);c.scale(tsx,1);c.fillText(title,0,H*.66);c.restore();
  c.fillStyle='#b3beb9';c.font=Math.round(H*.172)+'px "Workshop Condensed","Arial Narrow",sans-serif';if('letterSpacing' in c)c.letterSpacing=Math.round(H*.012)+'px';c.fillText(subtitle,W*(titleX+.002),H*.855);if('letterSpacing' in c)c.letterSpacing='0px';
  c.strokeStyle='#c33a24';c.lineWidth=Math.max(2,Math.round(H*.012));const last=subtitle.split(' // ').at(-1);const underlineX=W*(titleX+.002)+c.measureText(subtitle.slice(0,subtitle.length-last.length)).width;c.beginPath();c.moveTo(underlineX,H*.935);c.lineTo(underlineX+c.measureText(last).width,H*.935);c.stroke();
 }
 window.paintLabDomainIcon=icon;window.paintEngineeringDomains=paintDomains;window.paintExperienceJourney=paintJourney;window.paintLabStationSign=paintStationSign;

 window.buildSkillsWorkbench=function(k,parent){const {G,B,R,Y,C}=k,root=G(parent,[-5.25,0,-21.55]);
 R(root,9.35,.18,2.85,C.darkSteel,[0,1.18,0],.04,'steel');B(root,9.40,.075,2.92,[.055,.072,.078],[0,1.305,0],'rubber');B(root,9.40,.045,.10,C.silver,[0,1.29,1.49],'steel');
 for(const x of [-3.50,0,3.50]){R(root,1.65,1.08,2.45,C.graphite,[x,.58,-.08],.035);for(let i=0;i<4;i++){const y=.20+i*.25;R(root,1.50,.20,.09,[.075,.090,.10],[x,y,1.20],.015);B(root,.66,.03,.075,C.silver,[x,y+.035,1.27],'steel');}for(const dx of [-.62,.62])B(root,.16,.12,2.25,C.black,[x+dx,0,-.08],'rubber');}
 for(const x of [-4.42,4.42]){B(root,.15,1.19,2.45,C.darkSteel,[x,.58,-.08]);B(root,.30,.08,2.60,C.steel,[x,-.02,-.08],'steel');}
 // Ground the interchangeable assembly on a single precision work plate.
 const plate=G(root,[.95,1.365,.45]);R(plate,3.40,.025,2.05,[.022,.030,.033],[0,0,0],.025,'graphite');
 for(const x of [-1.66,1.66])for(const z of [-.975,.975]){B(plate,.22,.006,.015,C.red,[x+(x<0?.08:-.08),.018,z],'light',.66);B(plate,.015,.006,.18,C.red,[x,.018,z+(z<0?.08:-.08)],'light',.66);Y(plate,.018,.006,C.silver,[x,.019,z]);}
 B(root,5.4,.018,1.55,[.025,.105,.095],[-.20,1.345,.25],'rubber');B(root,8.95,.055,.16,C.graphite,[0,1.45,-1.28]);B(root,8.82,.018,.075,[1,.84,.66],[0,1.49,-1.18],'light',.68);
 B(root,8.98,.022,.035,C.red,[0,1.18,1.48],'paint');
 return {root,bounds:[[-9.95,0,-23.0],[-.55,1.37,-20.05]]};};
 window.buildSkillsReturnBench=function(k,parent){const {G,B,R,Y,C}=k,root=G(parent,[-9.48,0,-20.45],[0,-Math.PI/2,0]);
 R(root,3.45,.18,1.80,C.darkSteel,[0,1.18,0],.04,'steel');B(root,3.50,.075,1.85,[.055,.072,.078],[0,1.305,0],'rubber');R(root,2.55,1.12,1.58,C.graphite,[0,.57,0],.035);B(root,2.4,.16,1.45,C.black,[0,0,0]);
 for(let i=0;i<4;i++){const y=.20+i*.25;B(root,2.38,.20,.08,[.075,.090,.10],[0,y,.83]);B(root,.80,.03,.07,C.silver,[0,y+.04,.89],'steel');}
 const supply=G(parent,[-6.70,1.68,-21.0]);supply.s=[1.25,1.25,1.25];R(supply,1.02,.50,.73,[.22,.25,.24],[0,0,0],.045,'paint');B(supply,.94,.40,.035,C.graphite,[0,.015,.38]);
 k.screen(supply,.58,.22,[-.12,.08,.405],(c,v)=>{c.fillStyle='#061513';c.fillRect(0,0,v.width,v.height);c.fillStyle='#a4e9cd';c.font='48px monospace';c.fillText('05.00 V',12,52);c.fillStyle='#7bbaa7';c.font='32px monospace';c.fillText('0.12 A  CV',14,98);},{width:320,height:120});
 for(const x of [-.34,.34]){B(supply,.16,.07,.50,C.black,[x,-.285,0],'rubber');Y(supply,.065,.055,C.steel,[x,-.04,.42],[Math.PI/2,0,0]);}
 for(const [x,col] of [[-.28,C.red],[-.10,C.black]]){Y(supply,.045,.045,col,[x,-.16,.425],[Math.PI/2,0,0],'rubber');Y(supply,.020,.05,C.silver,[x,-.16,.44],[Math.PI/2,0,0]);}
 for(let i=0;i<5;i++)B(supply,.013,.27,.06,C.black,[.525,.02,-.24+i*.11]);
 // Plugged red/black leads bend onto the bench and end in parked probes.
 for(const [x,col] of [[-.28,C.red],[-.10,C.black]])Y(supply,.018,.10,col,[x,-.16,.50],[Math.PI/2,0,0],'rubber');
 SkillsCraft.wire(k,parent,[[-7.05,1.48,-20.3125],[-7.05,1.44,-20.12],[-6.77,1.366,-20.15],[-6.50,1.366,-20.17],[-6.24,1.366,-20.19],[-6.02,1.40,-20.28],[-5.80,1.41,-20.28]],.012,C.red);
 SkillsCraft.wire(k,parent,[[-6.825,1.48,-20.3125],[-6.82,1.43,-20.18],[-6.60,1.366,-20.30],[-6.36,1.366,-20.34],[-6.08,1.3855,-20.38],[-5.98,1.41,-20.43],[-5.71,1.41,-20.43]],.012,C.black);
 for(const [x,z,col] of [[-5.65,-20.28,C.red],[-5.56,-20.43,C.black]]){Y(parent,.025,.30,col,[x,1.41,z],[0,0,-Math.PI/2],'rubber');Y(parent,.006,.12,C.silver,[x+.20,1.41,z],[0,0,-Math.PI/2],'steel');Y(parent,.035,.018,col,[x+.12,1.41,z],[0,0,-Math.PI/2],'rubber');}
 SkillsCraft.label(k,supply,.72,.033,[0,.206,.407],'PRECISION DC / CV - CC');
 for(const x of [-.43,.43])for(const y of [-.18,.20])Y(supply,.012,.012,C.silver,[x,y,.405],[Math.PI/2,0,0]);
 for(let i=0;i<7;i++){const a=i*Math.PI/3.5;B(supply,.006,.012,.004,C.ivory,[.34+.088*Math.cos(a),-.04+.088*Math.sin(a),.407]);}
 const indicator=k.indicator(root,[.75,1.37,.52],C.mint);return {root,supply,indicator};};
 window.buildSkillsDisplay=function(k,parent){const {G,B,Y,C}=k,L=EngineeringLabLayout.screen,root=G(parent,L.center),W=L.size[0],H=L.size[1];
  // Built-in dark joinery with a recessed bezel and a deep, shadowed reveal.
  k.R(root,W+.48,H+.54,.26,[.008,.010,.011],[0,.03,-.24],.065);
  B(root,W+.30,H+.38,.12,[.016,.019,.020],[0,.02,-.13]);
  B(root,W+.16,H+.22,.065,C.darkSteel,[0,.01,-.048]);
  B(root,W+.07,H+.11,.03,C.black,[0,0,.010],'glass');
  for(const x of [-(W/2+.20),W/2+.20])B(root,.055,H+.30,.12,C.darkSteel,[x,0,-.035]);
  for(const x of [-(W/2+.17),W/2+.17])B(root,.014,H-.03,.024,C.red,[x,0,.015],'light',.34);
  for(const y of [-(H/2+.16),H/2+.16])B(root,W+.30,.030,.040,C.darkSteel,[0,y,-.02]);
  for(const x of [-W/2-.08,W/2+.08])for(const y of [-H/2-.08,H/2+.08])Y(root,.018,.012,C.steel,[x,y,.055],[Math.PI/2,0,0]);
  const substrate=k.screen(root,W,H,[0,0,.045],(c,v)=>paintDomains(c,v,0,'embedded'),{width:1200,height:513,dynamic:true});
  // A shallow canopy hides the screen's practical strip: a narrow warm lens
  // and one hot red edge, not a neon outline around the whole panel.
  B(root,W+.38,.10,.18,[.014,.017,.018],[0,H/2+.25,0]);
  B(root,W+.22,.016,.060,[1,.65,.36],[0,H/2+.195,.14],'light',.56);
  B(root,W+.40,.016,.030,C.red,[0,H/2+.225,.15],'light',.9);
  for(const x of [-2.55,2.55])B(root,.075,.06,.28,[.020,.023,.024],[x,-H/2-.15,.12]);
  // Header sign sits directly above the display, inside the same dark joinery.
  const header=G(parent,[L.center[0]-1.89,6.30,L.center[2]+.01]);B(header,10.5,1.04,.20,[.012,.015,.016],[1.59,0,-.12]);B(header,9.7,1.04,.22,[.013,.016,.017],[1.59,0,-.07]);B(header,9.4,.018,.042,[1,.42,.22],[1.59,-.49,.12],'light',.46);
  const sign=k.screen(header,9.2,.90,[1.59,0,.11],(c,v)=>paintStationSign(c,v,'05','SKILLS STATION','TECHNICAL CAPABILITIES // TOOLS // APPLICATIONS',.235,.075,{titleScale:1.38,titleSX:.80,numScale:1.06}),{width:2382,height:233});
  return {root,substrate,sign,bounds:[[-9.85,1.8,-23.6],[-.9,6.6,-22.95]]};};
 window.buildSkillsEquipmentRack=function(k,parent){const {G,B,Y,R,C}=k,root=G(parent,[-10.38,0,-23]);
 for(const x of [-.66,.66])B(root,.10,5.85,.13,C.darkSteel,[x,2.86,0]);
 B(root,1.44,5.52,.08,[.080,.058,.038],[0,2.90,-.60]);
 for(let i=0;i<6;i++){const y=.18+i*.96;
  B(root,1.50,.10,1.28,C.graphite,[0,y,0]);
  B(root,1.42,.018,.06,[1,.58,.30],[0,y+.075,.58],'light',.74);
  B(root,1.42,.010,.022,[.34,.10,.05],[0,y+.048,.61],'light',.34);
  if(i<5){const cy=y+.34;
   // Cream benchtop instrument face, dark display and a warm/red readout.
   B(root,.92+(i%2)*.20,.32+(i%3)*.06,.46,i%2?C.graphite:[.30,.31,.285],[0,cy,-.06],'paint');
   B(root,.74,.27,.035,[.018,.026,.028],[0,cy+.02,.17],'glass');
   B(root,.55,.016,.008,[.94,.58,.24],[0,cy+.08,.192],'light',.55);
   B(root,.34,.05,.010,[.82,.26,.10],[0,cy-.08,.193],'light',.48);
   for(const x of [-.37,.37]){Y(root,.048,.034,C.darkSteel,[x,cy-.04,.20],[Math.PI/2,0,0],'paint');Y(root,.024,.038,C.silver,[x,cy-.04,.205],[Math.PI/2,0,0]);}
   for(let j=0;j<4;j++)B(root,.085,.018,.025,j===i%4?C.mint:C.darkSteel,[-.30+j*.16,cy-.14,.20],'light',.28);
   SkillsCraft.label(k,root,.60,.036,[0,cy+.16,.192],'BENCH / CALIBRATED');
   for(const x of [-.44,.44])B(root,.025,.20,.045,C.steel,[x,cy,.19],'steel');
   // Stack a second cream unit on alternating shelves.
   if(i%2===0){B(root,.60,.20,.34,[.26,.27,.25],[.12,cy+.31,-.12],'paint');B(root,.44,.10,.02,[.02,.03,.032],[.12,cy+.32,.06],'glass');B(root,.20,.012,.006,[.92,.52,.22],[.12,cy+.34,.075],'light',.4);}
  }
 }
 for(const x of [-.45,-.15,.15,.45]){B(root,.20,.30,.28,C.graphite,[x,5.27,.14]);B(root,.12,.045,.02,C.silver,[x,5.27,.29]);}
 return {root};};
window.buildSkillsTaskLighting=function(k,parent){const {G,B,R,Y,C}=k,root=G(parent);
 R(root,8.25,.12,.32,C.graphite,[-5.25,2.24,-23.18],.025);B(root,8.02,.018,.22,[1,.87,.68],[-5.25,2.175,-23.10],'light',.92);
 for(const x of [-10.10]){B(root,.13,.10,.35,C.darkSteel,[x,1.39,-21.1]);Y(root,.035,1.05,C.steel,[x,1.925,-21.1]);const head=G(root,[x+(x<-5?.32:-.32),2.50,-19.75],[0,0,x<-5?-.1:.1]);R(head,.78,.12,.42,C.graphite,[0,0,0],.035);B(head,.66,.018,.30,[1,.88,.70],[0,-.067,0],'light',.92);B(root,.065,.065,1.42,C.steel,[x,2.50,-20.42],'steel');B(root,.65,.065,.065,C.steel,[x+(x<-5?.30:-.30),2.50,-19.75],'steel');}
 return {root};};
 window.buildSkillsShowcase=function(k,parent){const {G,B,R,Y,C}=k,root=G(parent,[-1.45,1.38,-22.10]);root.s=[1.05,.62,1.05];const orange=[.72,.24,.085],gold=[.72,.48,.16];
  // The compact enclosure rests directly on the existing worktop.
  B(root,1.58,.12,1.12,C.graphite,[0,0,0]);B(root,1.48,.04,1.0,[.12,.15,.15],[0,.08,0],'paint');B(root,1.20,.016,.045,[1,.87,.65],[0,1.69,.30],'light',.9);for(const x of [-.76,.76]){const glass=B(root,.012,1.74,1.10,[.34,.45,.48],[x,.94,0],'glass');glass.alpha=.065;}const glazing=B(root,1.52,1.74,.012,[.34,.45,.48],[0,.94,-.548],'glass');glazing.alpha=.045;
  const frontGlass=B(root,1.50,1.70,.008,[.34,.45,.48],[0,.94,.548],'glass');frontGlass.alpha=.035;
  for(const x of [-.76,.76])for(const z of [-.55,.55])B(root,.045,1.75,.045,C.steel,[x,.9,z]);
  for(const y of [.04,1.78])for(const z of [-.55,.55])B(root,1.55,.045,.045,C.steel,[0,y,z]);
  for(const x of [-.76,.76])for(const y of [.04,1.78])B(root,.045,.045,1.12,C.steel,[x,y,0]);
  B(root,1.7,.06,.06,C.graphite,[0,1.82,0]);
  // Open embedded rover: chassis, controller board, four drive wheels and sensors.
  const car=k.moving(G(root,[0,.16,0]));car.s=[1.10,1.30,1.10];
  Y(root,.58,.035,C.darkSteel,[0,.13,0]);R(car,1.05,.12,.65,[.55,.57,.55],[0,.16,0],.035,'steel');
  for(const x of [-.36,.36])for(const z of [-.36,.36]){Y(car,.17,.11,C.black,[x,.16,z],[Math.PI/2,0,0],'rubber');Y(car,.095,.12,C.silver,[x,.16,z],[Math.PI/2,0,0]);}
  B(car,.61,.025,.43,[.025,.22,.13],[0,.25,0]);B(car,.21,.06,.25,C.steel,[0,.29,0]);for(let i=0;i<6;i++)for(const z of [-.17,.17])B(car,.025,.05,.025,C.silver,[-.24+i*.09,.29,z]);
  for(const x of [-.38,.38])B(car,.035,.25,.035,C.steel,[x,.36,-.23]);B(car,.82,.045,.20,C.graphite,[0,.50,-.23]);
  for(const x of [-.21,.21]){Y(car,.09,.07,C.silver,[x,.48,-.10],[Math.PI/2,0,0]);Y(car,.065,.08,C.black,[x,.48,-.09],[Math.PI/2,0,0]);}
  B(car,.04,.30,.04,C.graphite,[.30,.45,.19]);Y(car,.10,.05,C.steel,[.30,.62,.19]);k.cable(car,[[-.24,.29,.1],[-.35,.35,.2],[.27,.4,.19]],.012,C.red);
  for(const x of [-.32,.32]){B(root,.16,.07,.14,[.055,.075,.08],[x,1.72,0]);B(root,.09,.11,.03,C.red,[x,1.77,.06],'light',.8);}const glassTop=B(root,1.42,.014,1.0,[.34,.45,.48],[0,1.76,0],'glass');glassTop.alpha=.08;
  const lamp=k.indicator(root,[.56,1.78,.48],C.mint);return {root,lamp,turntable:car};};
 window.buildSkillsSoldering=function(k,parent){const {G,B,Y,C}=k,root=G(parent,[-7.05,1.32,-21.35]);B(root,.55,.06,.34,C.graphite,[0,0,0]);B(root,.32,.035,.24,[.06,.15,.11],[0,.05,0]);Y(root,.026,.18,C.steel,[.12,.14,-.02],[.2,0,-.5],'steel');Y(root,.018,.16,C.darkSteel,[.18,.25,.01],[.2,0,-.5],'rubber');B(root,.20,.06,.14,C.black,[-.16,.06,.02]);for(const x of [-.2,-.14])Y(root,.022,.05,[.72,.48,.16],[x,.08,.11],[Math.PI/2,0,0],'paint');const lamp=k.indicator(root,[.22,.06,.10],C.red);return {root,lamp};};
})();
