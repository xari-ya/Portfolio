/* Locally authored engineering illustrations. Canvas is cached once per domain;
 * the physical models remain in the shared WebGL scene. No downloaded renders. */
(()=>{'use strict';
 const W=960,H=640;
 const stroke=(c,pts,color='#233b40',width=1)=>{c.strokeStyle=color;c.lineWidth=width;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();};
 const text=(c,s,x,y,color='#8da8ad',size=15)=>{c.font=`${size}px ui-monospace,monospace`;c.fillStyle=color;c.fillText(s,x,y);};
 function polygon(c,pts,fill,edge='#4c7779'){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=fill;c.fill();if(edge){c.strokeStyle=edge;c.lineWidth=1.2;c.stroke();}}
 function projection(cx=480,cy=370,scale=1){return ([x,y,z])=>[cx+(x*.87-z*.54)*scale,cy+(x*.27+z*.43-y)*scale];}
 function solid(c,P,x,y,z,w,h,d,col){const p=(a,b,e)=>P([x+a,y+b,z+e]),rgb=(k)=>`rgb(${col.map(v=>Math.round(v*k)).join(',')})`;
 polygon(c,[p(-w/2,0,d/2),p(w/2,0,d/2),p(w/2,h,d/2),p(-w/2,h,d/2)],rgb(.62));
 polygon(c,[p(w/2,0,-d/2),p(w/2,0,d/2),p(w/2,h,d/2),p(w/2,h,-d/2)],rgb(.42));
 polygon(c,[p(-w/2,h,-d/2),p(w/2,h,-d/2),p(w/2,h,d/2),p(-w/2,h,d/2)],rgb(1));
 }
 function grid(c,P){for(let a=-360;a<=360;a+=40){stroke(c,[P([a,-12,-280]),P([a,-12,280])],'#153033');stroke(c,[P([-360,-12,a]),P([360,-12,a])],'#153033');}}
 function board(c){const P=projection(490,355,1.17);grid(c,P);
 c.save();c.shadowColor='#000';c.shadowBlur=30;polygon(c,[[-258,0,-160],[258,0,-160],[258,0,160],[-258,0,160]].map(P),'#03100f','#174938');c.restore();
 solid(c,P,0,12,0,500,12,300,[26,100,77]);
 // Routed signal pairs leave room around components, gold plated headers.
 for(let i=0;i<28;i++){const x=-229+i*17;stroke(c,[[x,25,-135],[x,25,-80],[x+(i%2?19:-19),25,-60],[x+(i%2?19:-19),25,130]].map(P),i%4?'#3d9672':'#b39d57',1.7);}
 for(const x of [-229,229])for(const z of [-128,128]){const p=P([x,27,z]);c.beginPath();c.ellipse(...p,8,5,-.18,0,Math.PI*2);c.fillStyle='#ceb67a';c.fill();c.beginPath();c.ellipse(...p,3.5,2.3,-.18,0,Math.PI*2);c.fillStyle='#071714';c.fill();}
 solid(c,P,35,25,-35,200,12,175,[28,70,59]);solid(c,P,35,37,-48,165,27,125,[172,186,184]);
 for(let i=0;i<11;i++)solid(c,P,-45+i*16,38,41,7,8,21,[198,174,101]);
 for(let i=0;i<9;i++)stroke(c,[[-36,65,-100+i*11],[106,65,-100+i*11]].map(P),'#6f8383',.7);
 text(c,'ESP32',...P([-13,68,-34]),'#f0f4e7',22);
 solid(c,P,-110,25,45,95,19,91,[28,36,39]);
 for(let i=0;i<8;i++)for(const x of [-168,-53])solid(c,P,x,26,10+i*10,19,5,4,[188,199,185]);
 for(const z of [-131,132]){solid(c,P,-8,25,z,366,14,21,[24,29,30]);for(let i=0;i<20;i++)solid(c,P,-180+i*18,39,z,6,14,6,[220,181,105]);}
 for(let i=0;i<12;i++){const x=150+(i%3)*29,z=-75+Math.floor(i/3)*44;solid(c,P,x,25,z,18,7,10,[176,157,107]);solid(c,P,x,32,z,11,3,10,[67,63,52]);}
 solid(c,P,-207,25,0,58,33,72,[171,187,188]);solid(c,P,-228,31,0,14,17,50,[20,28,30]);
 for(const [x,z] of [[-174,-64],[-171,84],[160,99]]){solid(c,P,x,25,z,22,27,22,[66,77,76]);stroke(c,[[x-7,53,z],[x+7,53,z]].map(P),'#bbc9bb',2);}
 stroke(c,[[145,130],[236,95],[350,95]],'#698a86');text(c,'01 / RF SHIELD',173,79,'#a5beb5');
 stroke(c,[[377,478],[330,540],[157,540]],'#698a86');text(c,'02 / USB + UART',157,564,'#a5beb5');
 text(c,'MCU DEVELOPMENT ASSEMBLY',28,39,'#d7e2dc',18);text(c,'ISOMETRIC / COMPONENT STUDY',28,64,'#668b83',12);
 text(c,'ESP32  ·  GPIO  ·  I²C  ·  SPI',420,607,'#92b8a8',15);
 }
 function robot(c){const P=projection(470,350,1.10);grid(c,P);
 const tire=(x,z)=>{const p=P([x,58,z]);c.save();c.translate(...p);c.rotate(.27);c.fillStyle='#121d24';c.strokeStyle='#a5d7ed';c.lineWidth=2;c.beginPath();c.ellipse(0,0,31,70,0,0,Math.PI*2);c.fill();c.stroke();c.beginPath();c.ellipse(0,0,20,48,0,0,Math.PI*2);c.strokeStyle='#537e95';c.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6;stroke(c,[[25*Math.cos(a),59*Math.sin(a)],[34*Math.cos(a),69*Math.sin(a)]],'#81acc0',2);}c.beginPath();c.ellipse(0,0,9,20,0,0,Math.PI*2);c.fillStyle='#b7c6c5';c.fill();c.restore();};
 tire(-185,-100);solid(c,P,0,47,0,360,15,300,[121,88,54]);
 solid(c,P,-70,65,25,68,58,205,[40,49,54]);solid(c,P,15,65,25,68,58,205,[40,49,54]);
 for(const x of [-130,130])for(const z of [-111,111])solid(c,P,x,65,z,13,64,13,[189,155,90]);
 solid(c,P,0,129,0,350,12,284,[35,64,70]);
 for(let i=0;i<17;i++)stroke(c,[[-150+i*18,142,-117],[-150+i*18,142,-50],[-140+i*18,142,-30]].map(P),'#497981');
 solid(c,P,13,143,-50,98,13,120,[36,90,73]);solid(c,P,12,156,-67,73,17,68,[155,178,178]);
 solid(c,P,-75,143,45,93,12,63,[24,30,35]);polygon(c,[[-106,158,25],[-44,158,25],[-44,158,62],[-106,158,62]].map(P),'#19657a');
 for(const [x,z] of [[-178,0],[178,0],[0,-144]]){solid(c,P,x,102,z,35,35,9,[112,70,143]);solid(c,P,x,116,z+6,19,13,10,[19,26,32]);}
 tire(185,-100);const caster=P([0,28,137]);c.beginPath();c.ellipse(...caster,24,21,0,0,Math.PI*2);c.fillStyle='#a1b7bc';c.fill();c.strokeStyle='#527b87';c.stroke();
 stroke(c,[[80,142,80],[110,172,50],[120,150,-65]].map(P),'#e27450',3);
 stroke(c,[[218,178],[302,114],[462,114]],'#557d90');text(c,'ESP32 / CONTROL DECK',237,95,'#a9cbd9');
 stroke(c,[[650,367],[759,322],[899,322]],'#557d90');text(c,'N20 DRIVE',771,305,'#a9cbd9');
 text(c,'PROJECT OBSIDIAN',28,39,'#dae8ef',18);text(c,'2 DRIVE WHEELS + REAR CASTER',28,64,'#7297a9',13);text(c,'LAYOUT STUDY / PROVISIONAL GEOMETRY',28,607,'#769eae',14);
 }
 function software(c){const P=([x,z,h])=>[332+(x-z)*87,420+(x+z)*35-h*165];const h=(x,z)=>1.8*Math.exp(-((x-.2)**2+(z+.15)**2)*2)+.62*Math.exp(-((x+1.2)**2+(z-1)**2)*4);
 for(let i=0;i<=10;i++){const u=-2+i*.4;stroke(c,[P([u,-2,0]),P([u,2,0])],'#22404c');stroke(c,[P([-2,u,0]),P([2,u,0])],'#22404c');}
 // Filled cells give the surface readable shaded volume, with the mesh retained.
 for(let i=0;i<42;i++)for(let j=0;j<42;j++){const x=-2+i/10.5,z=-2+j/10.5,hv=h(x,z);polygon(c,[[x,z],[x+.095,z],[x+.095,z+.095],[x,z+.095]].map(([a,b])=>P([a,b,h(a,b)])),`hsl(${198+hv*34} 69% ${24+hv*18}%)`,null);}
 for(let i=0;i<=32;i++)for(let axis=0;axis<2;axis++){const u=-2+i/8,pts=[];for(let j=0;j<=48;j++){const v=-2+j/12,x=axis?u:v,z=axis?v:u;pts.push(P([x,z,h(x,z)]));}stroke(c,pts,'#89c9ef65',.65);}
 text(c,'FEATURE SPACE',40,81,'#85b5d2',13);text(c,'x₁',52,476);text(c,'x₂',598,477);text(c,'ŷ',336,124,'#ccb4f7',18);
 c.fillStyle='#0b141d';c.fillRect(660,75,275,467);c.strokeStyle='#2d414f';c.strokeRect(660,75,275,467);c.fillStyle='#15283a';c.fillRect(660,75,275,37);text(c,'pipeline.py',680,100,'#c2d4e0',15);
 const lines=['import numpy as np','','def infer(samples):','  clean = validate(samples)','  x = transform(clean)','  y = model.predict(x)','  return calibrate(y)','','# evaluation','mae = metric(y, target)','','status: completed','samples: 1,024','mode: demonstration'];
 lines.forEach((s,i)=>{text(c,String(i+1).padStart(2,'0'),671,143+i*26,'#456073',11);text(c,s,699,143+i*26,i===0||i===2?'#cb9ce5':i>=11?'#74cdbb':i===8?'#637c89':'#afccdb',12);});
 text(c,'DATA / MODEL WORKSPACE',28,39,'#d9e5ed',18);text(c,'ILLUSTRATIVE RESPONSE SURFACE',28,607,'#769eae',14);
 }
 function monitoring(c){text(c,'TERRAVITA / SENSOR TELEMETRY',28,39,'#e1e8e0',18);text(c,'DEMONSTRATION DATA · NO LIVE SENSOR CONNECTION',28,65,'#d28d68',12);
 const colors=['#f3aa58','#5dc4f1','#83c777'],labels=['TEMPERATURE','REL. HUMIDITY','SOIL MOISTURE'],values=['28.4 °C','63.2 %RH','42.1 %'],units=['°C','%RH','%'];
 for(let ch=0;ch<3;ch++){const y=100+ch*145;c.fillStyle='#09181c';c.fillRect(28,y,900,130);stroke(c,[[28,y],[928,y]],'#294046');text(c,'CH 0'+(ch+1)+' / '+labels[ch],44,y+24,colors[ch],13);
 for(let j=0;j<4;j++)stroke(c,[[70,y+38+j*22],[655,y+38+j*22]],'#1c343a');for(let j=0;j<9;j++)stroke(c,[[70+j*73,y+36],[70+j*73,y+111]],'#1c343a');
 for(let j=0;j<3;j++)text(c,String(([30,80,60][ch])-j*[2,20,20][ch]),38,y+45+j*30,'#66868b',10);
 const pts=[];for(let i=0;i<=160;i++){const q=i/160;const delta=13*Math.sin(i*.09+ch*1.8)+5*Math.sin(i*.43+ch)+3*Math.cos(i*1.1),trend=ch===2?q*20:0;pts.push([70+q*585,y+77-delta-trend]);}stroke(c,pts,colors[ch],2.1);
 text(c,values[ch],704,y+64,'#e7efec',30);text(c,units[ch]+' / SIMULATED',705,y+94,colors[ch],12);
 }
 for(let j=0;j<9;j++)text(c,`${String(j*5).padStart(2,'0')}:00`,65+j*73,560,'#66868b',11);text(c,'ELAPSED TIME / mm:ss',28,607,'#769eae',14);text(c,'3 CHANNELS · 1 Hz',697,607,'#769eae',14);
 }
 window.SkillsTechnicalArt={paint(c,v,id){c.save();c.scale(v.width/W,v.height/H);c.clearRect(0,0,W,H);const glow=c.createRadialGradient(460,330,20,460,330,510);glow.addColorStop(0,'#102329');glow.addColorStop(1,'#070e12');c.fillStyle=glow;c.fillRect(0,0,W,H);({embedded:board,robotics:robot,software,design:monitoring}[id]||board)(c);c.restore();}};
})();
