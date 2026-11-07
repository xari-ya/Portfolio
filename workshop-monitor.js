/* A canvas presentation of the existing simulated arm. Every joint origin,
 * angle, matrix, jaw position and process label is supplied by the live scene. */
window.drawWorkshopMonitor=function(c,data){
 const W=1536,H=600,{cycle,joints,points,mode}=data;
 c.save();c.setTransform(c.canvas.width/W,0,0,c.canvas.height/H,0,0);
 const background=c.createLinearGradient(0,0,W,H);background.addColorStop(0,'#171b20');background.addColorStop(1,'#090c10');c.fillStyle=background;c.fillRect(0,0,W,H);
 const text=(s,x,y,size=20,color='#d7d6cd',font='monospace')=>{c.fillStyle=color;c.font=(font==='Workshop Condensed'?'600 ':'')+size+'px '+font;c.fillText(s,x,y);};
 function card(x,y,w,h,active=false){
  const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,active?'#391a16':'#1c2126');g.addColorStop(1,'#0c1014');
  c.beginPath();c.moveTo(x+8,y);c.lineTo(x+w-8,y);c.lineTo(x+w,y+8);c.lineTo(x+w,y+h-8);c.lineTo(x+w-8,y+h);c.lineTo(x+8,y+h);c.lineTo(x,y+h-8);c.lineTo(x,y+8);c.closePath();c.fillStyle=g;c.fill();c.strokeStyle=active?'#f24d2d':'#41474c';c.lineWidth=1.3;c.stroke();
 }
 c.strokeStyle='#65707914';c.lineWidth=1;for(let x=478;x<W;x+=43){c.beginPath();c.moveTo(x,90);c.lineTo(x,540);c.stroke();}
 c.fillStyle='#eb4126';c.fillRect(24,25,5,40);
 text('CONTROL / '+(mode==='twin'?'ROBOT DIGITAL TWIN':mode==='control'?'SIGNAL PATH':'WORKCELL LOGIC'),45,49,30,'#f1ece2','Workshop Condensed');
 text('SIMULATED / SCENE TRANSFORMS',45,76,15,'#9ca4a7');
 c.textAlign='right';text(cycle.id,1506,43,23,cycle.completed?'#b4c8b3':'#f5ede0','Workshop Condensed');text(cycle.project?.selectedId?('JOB / '+cycle.project.selectedId.toUpperCase()+' / '+cycle.project.stage.toUpperCase()):(cycle.partName+' / '+String(cycle.count).padStart(3,'0')),1506,72,16,'#b6aaa0');c.textAlign='left';
 c.fillStyle='#4a4e50';c.fillRect(24,89,1488,1);c.fillStyle='#f04428';c.fillRect(24,89,1488*cycle.progress,2);
 card(24,110,430,414);
 text('ARM / ISOMETRIC LIVE POSE',43,138,22,'#e8e1d6','Workshop Condensed');
 // Fixed isometric axes, fitted to the actual articulated joint origins.
 const origin=points.base,iso=p=>{const x=p[0]-origin[0],y=p[1]-origin[1],z=p[2]-origin[2];return [.84*x-.54*z,.29*x+.45*z-.92*y];};
 const positions=[points.base,...points.pivots,points.tool,...points.fingers],raw=positions.map(iso),xs=raw.map(p=>p[0]),ys=raw.map(p=>p[1]);
 const xmin=Math.min(-.65,...xs),xmax=Math.max(.65,...xs),ymin=Math.min(-2.8,...ys),ymax=Math.max(.55,...ys),scale=Math.min(88,340/(xmax-xmin+.6),302/(ymax-ymin+.4));
 const project=p=>{const q=iso(p);return [239+(q[0]-(xmin+xmax)/2)*scale,333+(q[1]-(ymin+ymax)/2)*scale];};
 const line=(a,b,color,width)=>{c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.beginPath();c.moveTo(...a);c.lineTo(...b);c.stroke();};
 const at=(x,y,z)=>[origin[0]+x,origin[1]+y,origin[2]+z];
 c.strokeStyle='#71818c24';c.lineWidth=1;
 for(let i=-2;i<=2;i++){line(project(at(i*.5,0,-1)),project(at(i*.5,0,1)),'#71818c24',1);line(project(at(-1,0,i*.5)),project(at(1,0,i*.5)),'#71818c24',1);}
 function bodyBox(center,size){
  const pts=[];for(const z of [-1,1])for(const y of [-1,1])for(const x of [-1,1])pts.push(project(center.map((n,i)=>n+[x,y,z][i]*size[i]/2)));
  for(const [face,color] of [[[0,1,3,2],'#343c43'],[[1,5,7,3],'#1b242b'],[[2,3,7,6],'#adb0a9']]){c.beginPath();face.forEach((j,i)=>i?c.lineTo(...pts[j]):c.moveTo(...pts[j]));c.closePath();c.fillStyle=color;c.fill();c.strokeStyle='#080c10';c.lineWidth=2;c.stroke();}
 }
 bodyBox(at(0,.34,0),[1.05,.42,.85]);bodyBox(at(0,.76,0),[.65,.47,.60]);
 const pivot=points.pivots.map(project);
 for(let i=1;i<pivot.length;i++){
  const a=pivot[i-1],b=pivot[i],w=i===1?24:i===2?31:i===3?25:18;
  line(a,b,'#080b0f',w+9);line(a,b,'#9dabae',w+3);line(a,b,'#303a43',w-4);line([a[0]-3,a[1]],[b[0]-3,b[1]],'#cf3b25',3);
  if(i===2||i===3){const dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1,off=[-dy/d*17,dx/d*17];c.strokeStyle='#080b0d';c.lineWidth=4;c.beginPath();c.moveTo(a[0]+off[0],a[1]+off[1]);c.bezierCurveTo(a[0]+dx*.3+off[0]*1.5,a[1]+dy*.3+off[1]*1.5,a[0]+dx*.7+off[0]*1.5,a[1]+dy*.7+off[1]*1.5,b[0]+off[0],b[1]+off[1]);c.stroke();}
 }
 pivot.forEach((p,i)=>{
  const r=i===0?15:i<3?21:i===3?16:10;
  for(const [radius,color] of [[r+3,'#070b0e'],[r,'#b9bcb5'],[r*.78,'#353f46'],[r*.58,'#db432b'],[r*.37,'#181f24']]){c.fillStyle=color;c.beginPath();c.arc(...p,radius,0,Math.PI*2);c.fill();}
  if(i>0&&i<4)for(let j=0;j<6;j++){const a=j*Math.PI/3;c.fillStyle='#d1cbbb';c.beginPath();c.arc(p[0]+Math.cos(a)*r*.83,p[1]+Math.sin(a)*r*.83,1.5,0,Math.PI*2);c.fill();}
  text('A'+(i+1),p[0]+r+6,p[1]-r,15,'#ef765a');
 });
 const jaw=points.fingers.map(project),tool=project(points.tool);line(pivot[4],tool,'#b6b9b1',9);line(jaw[0],jaw[1],'#414c55',11);for(const p of jaw)line([p[0],p[1]-9],[p[0],p[1]+10],'#d9d5c6',7);
 if(cycle.owner==='gripper'){c.fillStyle='#cf452e';c.fillRect(tool[0]-12,tool[1]-5,24,13);}
 text('TCP '+points.tool.map(n=>(n<0?'':' ')+n.toFixed(2)).join('  '),44,502,16,'#c6c5b9');
 if(mode==='twin'){
  joints.forEach((joint,i)=>{
   const x=478+(i%3)*346,y=110+Math.floor(i/3)*210,w=330;
   card(x,y,w,194);text(joint.code+' / '+joint.name,x+17,y+26,22,'#f0e8db','Workshop Condensed');
   c.textAlign='right';text((joint.angle*180/Math.PI).toFixed(1)+'°',x+w-16,y+26,19,'#f66a46');c.textAlign='left';
   text(joint.expression,x+18,y+49,14,'#a3adae');
   c.strokeStyle='#a5a5a1';c.lineWidth=1;c.beginPath();c.moveTo(x+22,y+67);c.lineTo(x+15,y+67);c.lineTo(x+15,y+177);c.lineTo(x+22,y+177);c.moveTo(x+w-22,y+67);c.lineTo(x+w-15,y+67);c.lineTo(x+w-15,y+177);c.lineTo(x+w-22,y+177);c.stroke();
   for(let row=0;row<4;row++)for(let col=0;col<4;col++){const raw=joint.matrix[col*4+row],v=Math.abs(raw)<.005?0:raw,s=(v<0?'':' ')+v.toFixed(2);text(s,x+25+col*70,y+86+row*29,20,row===3?'#74868b':col===3?'#e7b18a':'#e3e2d7');}
  });
  card(1170,320,330,194);text('TOOL / PROCESS',1187,348,22,'#f0e8db','Workshop Condensed');
  const jawState=cycle.owner==='gripper'?'HOLDING':cycle.grip<=.286?'CLOSED':cycle.phase==='grip'?'CLOSING':cycle.phase==='release'?'OPENING':'OPEN';
  text('GRIPPER  '+jawState,1187,387,17,'#d6d4c8');
  text('OPTICAL  '+(cycle.sensor?'OCCUPIED':cycle.detected?'LATCHED':'CLEAR'),1187,419,17,'#c2c9c1');
  text('CHECK    '+(cycle.completed?'PASSED':cycle.inspection?'SCANNING':'WAITING'),1187,451,17,'#c2c9c1');
  text('LOCAL 4 × 4 / COLUMN VECTORS',1187,489,13,'#929fa1');
 }else{
  const labels=mode==='control'?['OPTICAL INPUT','STATE CONTROLLER','ROBOT / OUTPUT']:['POSITION EVENT','DETERMINISTIC FSM','MOTION COMMAND'];
  const details=mode==='control'?[cycle.detected?'COMPONENT POSITION CONFIRMED':'WAITING FOR COMPONENT',cycle.id,'OWNER / '+cycle.owner.toUpperCase()]:['POSITION-TRIGGERED SENSOR',cycle.description||cycle.id,'KINEMATICS → ARTICULATED JOINTS'];
  labels.forEach((label,i)=>{const y=114+i*139;card(480,y,1020,116,i===Math.min(2,Math.floor(cycle.index/5)));text('0'+(i+1)+' / '+label,504,y+39,28,'#f0e9de','Workshop Condensed');text(details[i].length>80?details[i].slice(0,78)+'…':details[i],504,y+81,19,'#c0c6c2');});
 }
 c.fillStyle='#4a4e50';c.fillRect(24,542,1488,1);text('SCRIPTED DEMONSTRATION / NO LIVE MEASUREMENTS',26,578,17,'#a0a4a0');
 c.textAlign='right';text('PARENT-LOCAL TRANSFORMS / TRANSLATION IN SCENE UNITS',1509,578,15,'#a0a4a0');
 c.restore();
};

/* Static embedded-electronics concept drawing, distinct from the arm monitor.
 * No measured values, input handlers or laptop-specific animation are added. */
window.createWorkshopLaptopScreen=function(){
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=640;
 const c=canvas.getContext('2d'),text=(s,x,y,size=18,col='#c5c9c8')=>{c.fillStyle=col;c.font=size+'px monospace';c.fillText(s,x,y);};
 const line=(points,col='#78978e',width=2)=>{c.strokeStyle=col;c.lineWidth=width;c.lineJoin='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.stroke();};
 c.fillStyle='#0e151b';c.fillRect(0,0,1024,640);c.fillStyle='#23292e';c.fillRect(0,0,1024,46);c.fillStyle='#e94b30';c.fillRect(0,0,5,46);
 text('EMBEDDED / SENSOR INTERFACE',22,30,24,'#f1e6d3');
 c.fillStyle='#182127';c.fillRect(0,47,214,593);text('BOARD STUDY',18,81,19,'#e58967');
 ['LAYOUT','  U1 / MCU','  U2 / SENSOR','  J1 / POWER','  J2 / I2C','  R1, R2','  C1, C2','','NETS','  +3V3','  GND','  SDA','  SCL'].forEach((s,i)=>text(s,18,120+i*29,17,i===0||i===8?'#f0e3cd':'#9bacae'));
 c.fillStyle='#1e272e';c.fillRect(229,59,775,32);text('PCB LAYOUT / TOP',245,82,18,'#e2c9aa');text('CONCEPT DRAWING',785,82,16,'#b4bebb');
 // Board, ground pour, mounting holes, chip, passives and two keyed headers.
 c.fillStyle='#263d36';c.fillRect(267,113,696,313);c.strokeStyle='#819788';c.lineWidth=2;c.strokeRect(267,113,696,313);
 for(const x of [286,944])for(const y of [132,407]){c.fillStyle='#cab980';c.beginPath();c.arc(x,y,10,0,Math.PI*2);c.fill();c.fillStyle='#0d151a';c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.fill();}
 const traces=[[[348,184],[449,184],[475,210],[542,210]],[[348,218],[421,218],[458,255],[542,255]],[[348,254],[405,254],[451,300],[542,300]],[[348,289],[384,289],[384,361],[682,361],[718,325],[813,325]],[[674,211],[735,211],[770,176],[861,176]],[[674,246],[766,246],[811,211],[861,211]],[[674,281],[742,281],[790,281],[823,247],[861,247]],[[674,316],[700,316],[729,345],[838,345]],[[523,159],[725,159],[725,129]],[[477,380],[765,380],[799,413]]];
 traces.forEach((points,i)=>line(points,i%3===0?'#b4985c':i%3===1?'#5a967b':'#638b91',4));
 for(const [x,y] of [[449,184],[458,255],[451,300],[682,361],[735,211],[766,246],[742,281],[729,345],[523,159],[477,380]]){c.fillStyle='#c4b276';c.beginPath();c.arc(x,y,5,0,Math.PI*2);c.fill();c.fillStyle='#2a473a';c.beginPath();c.arc(x,y,2,0,Math.PI*2);c.fill();}
 c.fillStyle='#11191d';c.fillRect(546,188,125,151);c.strokeStyle='#4a5555';c.strokeRect(546,188,125,151);
 for(let i=0;i<8;i++){c.fillStyle='#b5b3a0';c.fillRect(532,199+i*17,14,7);c.fillRect(671,199+i*17,14,7);}
 text('U1',583,240,22,'#d6d3bd');text('MCU',575,271,22,'#d6d3bd');
 for(const x of [320,869]){c.fillStyle='#10181a';c.fillRect(x-10,157,40,158);for(let i=0;i<4;i++){c.fillStyle='#c5b882';c.fillRect(x,171+i*35,17,17);c.fillStyle='#272e29';c.fillRect(x+5,176+i*35,7,7);}}
 text('J1',316,345,17,'#d6d6c3');text('J2 / I2C',843,346,17,'#d6d6c3');
 for(const [x,y,label] of [[460,142,'C1'],[745,315,'C2'],[760,187,'R1'],[760,223,'R2']]){c.fillStyle='#aaa48c';c.fillRect(x,y,30,11);c.fillStyle='#202929';c.fillRect(x+7,y,16,11);text(label,x-2,y-7,13,'#b8c8b8');}
 text('3V3',366,153,15,'#cad2b7');text('SDA',805,199,14,'#c5cec1');text('SCL',805,237,14,'#c5cec1');text('GND',795,392,15,'#cad2b7');
 // Static signal-path schematic, not streams of fabricated code or telemetry.
 c.fillStyle='#121c23';c.fillRect(230,448,774,146);text('I2C / SIGNAL PATH',248,476,18,'#dfbd99');
 for(const [x,label] of [[259,'MCU'],[747,'SENSOR']]){c.strokeStyle='#9ca99e';c.lineWidth=2;c.strokeRect(x,497,190,75);text(label,x+28,542,22,'#e5ddca');}
 line([[449,518],[747,518]],'#e19b69',2);line([[449,549],[747,549]],'#87aa98',2);text('SDA',561,509,16,'#d8b99b');text('SCL',561,574,16,'#abc6b9');
 line([[495,478],[686,478]],'#b1bba8',2);text('3V3',696,484,14,'#d7c5a5');
 for(const [x,netY] of [[526,518],[650,549]]){line([[x,478],[x,491]],'#b1bba8',2);line([[x,506],[x,netY]],'#b1bba8',2);c.strokeStyle='#b1bba8';c.strokeRect(x-4,491,8,15);c.fillStyle='#b1bba8';c.beginPath();c.arc(x,netY,3,0,Math.PI*2);c.fill();}
 c.fillStyle='#d64b30';c.fillRect(230,609,774,2);text('3.3 V LOGIC / BOARD-LAYOUT STUDY',245,634,16,'#acb8b8');text('ILLUSTRATION / NO LIVE DATA',717,634,14,'#c2b39f');
 return {canvas,metadata:{title:'Sensor interface PCB study',subject:'embedded electronics',interactive:false,static:true,view:'PCB layout and I2C signal path',source:'Illustrative engineering concept / no live measurements'}};
};
