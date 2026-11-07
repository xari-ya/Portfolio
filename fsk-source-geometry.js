/* Model code extracted from project sources/FSK_Circuit_3D_Standalone.html.
 * SHA256 853e06406bfac7650dc1974ac472522c12491cc52cfbc5510f6c3c20726680cc
 * Original component constructors and documented placement are retained.
 * mesh/labelTex below create CPU descriptors; the portfolio owns all GPU resources. */
window.buildFSKSourceGeometry=function(){'use strict';
 const meshCache=new Map();
 const norm=a=>{const l=Math.hypot(...a)||1;return a.map(v=>v/l);},sub=(a,b)=>a.map((v,i)=>v-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 function mesh(verts,key){const value={verts};if(key)meshCache.set(key,value);return value;}
 function labelTex(text){return text;}
function vpush(a,p,n,u=0,v=0){a.push(p[0],p[1],p[2],n[0],n[1],n[2],u,v)}
function quad(out,a,b,c,d,n){vpush(out,a,n,0,1);vpush(out,b,n,1,1);vpush(out,c,n,1,0);vpush(out,a,n,0,1);vpush(out,c,n,1,0);vpush(out,d,n,0,0)}
function cube(w,h,d){let key=`box${w}:${h}:${d}`;if(meshCache.has(key))return meshCache.get(key);let o=[],x=w/2,y=h/2,z=d/2;quad(o,[-x,y,-z],[x,y,-z],[x,y,z],[-x,y,z],[0,1,0]);quad(o,[-x,-y,z],[x,-y,z],[x,-y,-z],[-x,-y,-z],[0,-1,0]);quad(o,[x,-y,-z],[x,-y,z],[x,y,z],[x,y,-z],[1,0,0]);quad(o,[-x,-y,z],[-x,-y,-z],[-x,y,-z],[-x,y,z],[-1,0,0]);quad(o,[-x,-y,-z],[x,-y,-z],[x,y,-z],[-x,y,-z],[0,0,-1]);quad(o,[x,-y,z],[-x,-y,z],[-x,y,z],[x,y,z],[0,0,1]);return mesh(o,key)}
function plane(w,d){let key=`plane${w}:${d}`;if(meshCache.has(key))return meshCache.get(key);let o=[],x=w/2,z=d/2;quad(o,[-x,0,-z],[x,0,-z],[x,0,z],[-x,0,z],[0,1,0]);return mesh(o,key)}
function sphere(radius,rows=9,cols=15){let key=`sphere${radius}:${rows}:${cols}`;if(meshCache.has(key))return meshCache.get(key);let o=[];function pt(a,b){let t=a*Math.PI/rows,p=b*Math.PI*2/cols;return[radius*Math.sin(t)*Math.cos(p),radius*Math.cos(t),radius*Math.sin(t)*Math.sin(p)]}for(let i=0;i<rows;i++)for(let j=0;j<cols;j++){let a=pt(i,j),b=pt(i+1,j),c=pt(i+1,j+1),d=pt(i,j+1);for(const tri of [[a,b,c],[a,c,d]])for(const p of tri)vpush(o,p,norm(p));}return mesh(o,key)}
function cyl(r,h,segments=18,rBottom=r){let key=`cyl${r}:${h}:${segments}:${rBottom}`;if(meshCache.has(key))return meshCache.get(key);let o=[];for(let j=0;j<segments;j++){let a=j*2*Math.PI/segments,b=(j+1)*2*Math.PI/segments,na=[Math.cos(a),0,Math.sin(a)],nb=[Math.cos(b),0,Math.sin(b)],p1=[rBottom*na[0],-h/2,rBottom*na[2]],p2=[rBottom*nb[0],-h/2,rBottom*nb[2]],p3=[r*nb[0],h/2,r*nb[2]],p4=[r*na[0],h/2,r*na[2]];vpush(o,p1,na);vpush(o,p2,nb);vpush(o,p3,nb);vpush(o,p1,na);vpush(o,p3,nb);vpush(o,p4,na);quad(o,[0,h/2,0],p4,p3,[0,h/2,0],[0,1,0]);quad(o,[0,-h/2,0],p2,p1,[0,-h/2,0],[0,-1,0]);}return mesh(o,key)}
function rod(a,b,r=.2,segments=8){let dir=norm(sub(b,a));let v=norm(cross(Math.abs(dir[1])<.95?[0,1,0]:[1,0,0],dir)),u=cross(dir,v),o=[];for(let j=0;j<segments;j++){let A=j*Math.PI*2/segments,B=(j+1)*Math.PI*2/segments,n1=u.map((x,i)=>x*Math.cos(A)+v[i]*Math.sin(A)),n2=u.map((x,i)=>x*Math.cos(B)+v[i]*Math.sin(B)),p1=a.map((x,i)=>x+n1[i]*r),p2=a.map((x,i)=>x+n2[i]*r),p3=b.map((x,i)=>x+n2[i]*r),p4=b.map((x,i)=>x+n1[i]*r);vpush(o,p1,n1);vpush(o,p2,n2);vpush(o,p3,n2);vpush(o,p1,n1);vpush(o,p3,n2);vpush(o,p4,n1);}return mesh(o)}
function torus(radius,tube=.3,segments=20,sides=8){let key=`torus${radius}:${tube}:${segments}:${sides}`;if(meshCache.has(key))return meshCache.get(key);let o=[];function p(t,s){let c=Math.cos(t),si=Math.sin(t),v=Math.cos(s),u=Math.sin(s);return[(radius+tube*v)*c,tube*u,(radius+tube*v)*si]}function n(t,s){return[Math.cos(t)*Math.cos(s),Math.sin(s),Math.sin(t)*Math.cos(s)]}for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){let a=i*Math.PI*2/segments,b=(i+1)*Math.PI*2/segments,c=j*Math.PI*2/sides,d=(j+1)*Math.PI*2/sides;let x=p(a,c),y=p(b,c),z=p(b,d),w=p(a,d);for(const [P,N] of [[x,n(a,c)],[y,n(b,c)],[z,n(b,d)],[x,n(a,c)],[z,n(b,d)],[w,n(a,d)]])vpush(o,P,N);}return mesh(o,key)}
const C={pcb:[.31,.20,.115],pcbEdge:[.41,.26,.16],copper:[.91,.57,.29],solder:[.75,.7,.59],black:[.047,.056,.068],black2:[.085,.095,.115],silver:[.62,.65,.68],white:[.83,.86,.8],beige:[.76,.68,.49],orange:[.8,.39,.17],blue:[.12,.31,.55],green:[.2,.54,.35],red:[.7,.18,.21],ledGreen:[.11,.49,.25],smoke:[.16,.11,.10],gold:[.79,.6,.35],glass:[.65,.32,.14],amber:[.86,.57,.3]};
const data={tx:{id:'tx',width:62.8,depth:61.2,img:[851,818],world:[-65,6,0],parts:[],name:'Transmitter'},rx:{id:'rx',width:105,depth:85.2,img:[905,739],world:[62,6,0],parts:[],name:'Receiver'}};
const allParts=[];let sourceCount={tx:0,rx:0};
function pt(b,px,py){return [(px/b.img[0]-.5)*b.width,(py/b.img[1]-.5)*b.depth]}
function part(b,ref,title,type,px,py,desc,confidence='layout'){let [x,z]=pt(b,px,py),p={board:b,ref,title,type,px,py,x,z,desc,confidence,meshes:[],index:++sourceCount[b.id],rotate:0};b.parts.push(p);allParts.push(p);return p}
function add(p,geo,color,local=[0,0,0],opts={}){p.meshes.push({geo,color,local,rotY:opts.rotY||0,tex:opts.tex||'',alpha:opts.alpha===undefined?1:opts.alpha,unlit:!!opts.unlit,emissive:opts.emissive||0,glow:opts.glow||null});}
function addCube(p,w,h,d,col,x,y,z,opts){add(p,cube(w,h,d),col,[x,y,z],opts)}
function addRod(p,a,b,r,c){add(p,rod(a,b,r),c)}
function addCylinder(p,r,h,c,x,y,z,opts={}){add(p,cyl(r,h),c,[x,y,z],opts)}
function addLabel(p,text,w,d,y=5.3){let key=labelTex(text);add(p,plane(w,d),[1,1,1],[0,y,0],{tex:key,unlit:true,alpha:.88})}
function solderPads(p,positions){for(let [x,z] of positions){add(p,torus(.45,.11,9,5),C.copper,[x,.83,z]);addCylinder(p,.14,.34,C.solder,x,.73,z)}}
function dip8(p,text){let y=3.2;addCube(p,9.65,3.0,6.55,C.black,0,y,0);addCube(p,8.85,.22,5.8,C.black2,0,y+1.52,0);addLabel(p,text,8.1,2.25,y+1.65);addCylinder(p,.45,.085,C.black2,-4.05,y+1.73,-2.15);let holes=[];for(let i=0;i<4;i++){let x=(i-1.5)*2.54;for(const side of [-1,1]){let z=side*3.81;holes.push([x,z]);addRod(p,[x,3.25,side*3.15],[x,2.1,z],.26,C.solder);addRod(p,[x,2.1,z],[x,.88,z],.23,C.solder);}}solderPads(p,holes)}
function resistor(p,bands=[C.orange,C.black2,C.red],span=8.9){addRod(p,[-span/2,.92,0],[-span/2,2.9,0],.23,C.solder);addRod(p,[span/2,.92,0],[span/2,2.9,0],.23,C.solder);addRod(p,[-span/2,2.9,0],[-2.4,2.9,0],.23,C.solder);addRod(p,[2.4,2.9,0],[span/2,2.9,0],.23,C.solder);addRod(p,[-2.42,2.9,0],[2.42,2.9,0],1.0,C.beige);bands.forEach((col,i)=>{let x=-1.55+i*.91;addRod(p,[x-.18,2.9,0],[x+.18,2.9,0],1.036,col);});solderPads(p,[[-span/2,0],[span/2,0]])}
function diode(p){addRod(p,[-4.1,.83,0],[-4.1,2.7,0],.19,C.solder);addRod(p,[4.1,.83,0],[4.1,2.7,0],.19,C.solder);addRod(p,[-4.1,2.7,0],[4.1,2.7,0],.19,C.solder);addRod(p,[-2.3,2.7,0],[2.3,2.7,0],.85,C.glass);addRod(p,[-1.85,2.7,0],[-1.35,2.7,0],.88,C.black2);solderPads(p,[[-4.1,0],[4.1,0]])}
function ceramic(p,col=C.orange){addRod(p,[-2.5,.82,0],[-2.5,3,0],.21,C.solder);addRod(p,[2.5,.82,0],[2.5,3,0],.21,C.solder);addCube(p,4.1,3.45,2.15,col,0,4.1,0);addCube(p,3.6,.16,1.95,C.amber,0,5.87,0);solderPads(p,[[-2.5,0],[2.5,0]])}
function disc(p){addRod(p,[-2.5,.83,0],[-2.5,3.3,0],.2,C.solder);addRod(p,[2.5,.83,0],[2.5,3.3,0],.2,C.solder);addCube(p,5,5.4,1.2,C.orange,0,4.4,0);solderPads(p,[[-2.5,0],[2.5,0]])}
function electro(p){addRod(p,[-1.25,.82,0],[-1.25,3,0],.22,C.solder);addRod(p,[1.25,.82,0],[1.25,3,0],.22,C.solder);addCylinder(p,2.65,7.7,C.smoke,0,5.4,0);addCylinder(p,2.57,.3,C.silver,0,9.32,0);addCylinder(p,2.0,.08,C.black2,0,9.52,0);addCube(p,.38,7.0,.6,C.beige,2.5,5.3,0);solderPads(p,[[-1.25,0],[1.25,0]])}
function led(p,color='ir'){let col=color==='red'?C.red:color==='green'?C.ledGreen:C.smoke;let glow=color==='red'?'mark':color==='green'?'space':color==='ir'?'optical':null;
for(let x of [-1.25,1.25])addRod(p,[x,.86,0],[x,2.85,0],.22,C.solder);addCylinder(p,2.5,.8,C.black2,0,3.2,0);addCylinder(p,2.4,3.5,col,0,5.24,0,{glow,emissive:.06});add(p,sphere(2.4,9,16),col,[0,7.0,0],{glow,emissive:.08});addCylinder(p,2.48,.28,C.black2,0,3.55,0);solderPads(p,[[-1.25,0],[1.25,0]])}
function trimmer(p){addCube(p,6.5,3.7,6.5,C.blue,0,2.9,0);addCube(p,5.8,.22,5.8,[.12,.37,.62],0,4.85,0);addCylinder(p,1.8,.18,C.solder,0,5.02,0);addCube(p,2.8,.1,.46,C.smoke,0,5.13,0);addCube(p,.46,.1,2.8,C.smoke,0,5.13,0);solderPads(p,[[-2.54,2.54],[2.54,2.54],[2.54,-2.54]]);for(let [x,z] of [[-2.54,2.54],[2.54,2.54],[2.54,-2.54]])addRod(p,[x,.85,z],[x,1.95,z],.24,C.solder)}
function button(p){addCube(p,7.25,2,7.1,C.black2,0,2.0,0);addCube(p,6.6,.45,6.45,C.solder,0,3.2,0);addCube(p,3.2,2.35,3.2,[.22,.22,.24],0,4.1,0);addCube(p,2.0,.35,2.0,C.beige,0,5.42,0);const pins=[[-3.2,-2.6],[-3.2,2.6],[3.2,-2.6],[3.2,2.6]];for(let [x,z] of pins)addRod(p,[x,.8,z],[x,2,z],.25,C.solder);solderPads(p,pins)}
function to92(p){addCylinder(p,2.2,4.6,C.black2,0,3.6,0);addCube(p,4.35,4.3,.8,C.black,0,3.6,-1.55);const pins=[[-1.65,1.5],[0,1.5],[1.65,1.5]];for(let [x,z] of pins)addRod(p,[x,.8,z],[x,2.2,z],.24,C.solder);solderPads(p,pins)}
function header(p,pinCount=3){addCube(p,pinCount*2.54+1.1,2.3,2.8,C.black2,0,2.0,0);let pads=[];for(let i=0;i<pinCount;i++){let x=(i-(pinCount-1)/2)*2.54;pads.push([x,0]);addRod(p,[x,.82,0],[x,5.9,0],.34,C.gold)}solderPads(p,pads)}
function terminal(p,n=2){const width=n*5.08+2;addCube(p,width,6.9,8.1,C.green,0,4.35,0);addCube(p,width-1,1.1,6.9,[.16,.45,.29],0,7.88,0);let pads=[];for(let i=0;i<n;i++){let x=(i-(n-1)/2)*5.08;pads.push([x,0]);addCylinder(p,1.25,.14,C.smoke,x,8.47,-.55);addCube(p,1.5,.16,.24,C.silver,x,8.59,-.55);addRod(p,[x,.83,0],[x,2.1,0],.4,C.solder)}solderPads(p,pads)}
function annotate(p){p.desc=p.desc||'Through-hole component positioned from the documented PCB footprint.';return p}

/* -------- TRANSMITTER: pixel positions are from the report's board art -------- */
{let b=data.tx,p;
p=part(b,'U1','NE555 astable oscillator','DIP-8',444,570,'8-pin NE555 timer in astable mode; switches the IR output between the two programmed carrier frequencies.');dip8(p,'NE555');
p=part(b,'S1','38 kHz transmit button','Push switch',703,445,'The transmitter has two push-buttons. This one is represented as the 38 kHz Mark/logic-1 command.','interpreted');button(p);
p=part(b,'S2','1 kHz transmit button','Push switch',703,613,'The second push-button activates the 1 kHz Space/logic-0 oscillator mode.','interpreted');button(p);
p=part(b,'IR1','Infrared transmitting LED','IR LED',542,89,'Emits the optical carrier pulses from the NE555 output. Exact optical package location on the unlabeled footprint is interpreted.','interpreted');led(p,'ir');
p=part(b,'Q1','Timing-capacitor switch transistor','TO-92',499,417,'Switches the 470 nF timing capacitor in parallel with the 10 nF capacitor for the lower frequency.');to92(p);
p=part(b,'Q2','Control transistor / driver','TO-92',692,90,'Three-terminal switching/driver footprint; precise transistor identification is not legible in the source artwork.','interpreted');to92(p);
for(let [ref,x,y,rot,description,bands] of [
 ['R1',343,89,0,'555 astable bias/timing resistor.',[C.red,C.red,C.red]],
 ['R2',691,227,0,'Timing-network resistor for the 555 oscillator.',[C.beige,C.red,C.red]],
 ['R3',693,296,0,'Additional control or frequency selection resistor.',[C.orange,C.black2,C.orange]],
 ['R4',500,245,Math.PI/2,'Transistor bias/control resistor.',[C.red,C.black2,C.red]]]){p=part(b,ref,`${ref} · axial resistor`,'Resistor',x,y,description,'layout');p.rotate=rot;resistor(p,bands)}
p=part(b,'C1','Timing capacitor · 10 nF','Film capacitor',426,735,'Small timing capacitor used for the high-frequency 38 kHz carrier; value and footprint pairing is inferred.','interpreted');ceramic(p,C.orange);
p=part(b,'C2','Switched timing capacitor · 470 nF','Film capacitor',333,357,'The larger switched capacitor creates the approximately 1 kHz transmitter mode.','interpreted');ceramic(p,[.78,.51,.16]);
p=part(b,'C3','Supply decoupling capacitor','Electrolytic',167,349,'Polarized radial capacitor footprint with polarity marking visible in the original PCB art.','layout');electro(p);
p=part(b,'J1','Transmitter power connector','Terminal',217,674,'Two-pole supply/connection footprint. The exact connector type is not specified in the report.','interpreted');terminal(p,2);
p=part(b,'J2','Three-pin PCB header','Header',210,496,'Three-pin through-hole footprint from the copper-layout source.','interpreted');header(p,3);
}
/* -------- RECEIVER: three op-amp DIP8 footprints + passive demodulator parts -------- */
{let b=data.rx,p;
for(let [r,x,y,mark,description] of [
 ['U1',616,324,'TL072','One of the receiver comparator / signal conditioning stages. The written report alternates LM358 and TL072; exact U1 mapping is uncertain.'],
 ['U2',477,324,'TL072','Active multiple-feedback band-pass and/or decision-stage operational amplifier.'],
 ['U3',155,324,'TL072','Dual operational amplifier package in the parallel detection/filter path.']]){p=part(b,r,`${mark} dual operational amplifier`,'DIP-8',x,y,description,'interpreted');p.rotate=Math.PI/2;dip8(p,mark);}
for(let [r,x,y,description] of [
 ['RV1',285,108,'Adjustable receiver optical threshold / sensitivity setting.'],
 ['RV2',727,113,'Second adjustable threshold or filter trim, part identity not verified.'],
 ['RV3',550,552,'Third through-hole trimmer footprint on receiver.']]){p=part(b,r,'3-terminal trimmer potentiometer','Trimmer',x,y,description,'interpreted');trimmer(p)}
p=part(b,'IR_RX','Infrared photodiode sensor','IR sensor',76,182,'Reverse-biased IR sensing element. Incident optical pulses develop a voltage across the receiver input resistor.','interpreted');led(p,'ir');
p=part(b,'LED_R','38 kHz / Mark output','Red LED',836,99,'Red channel output indicates detection of the 38 kHz Mark signal.','interpreted');led(p,'red');
p=part(b,'LED_G','1 kHz / Space output','Green LED',76,627,'Green channel output indicates detection of the 1 kHz Space signal.','interpreted');led(p,'green');
p=part(b,'P1','Receiver connector','Terminal',835,229,'Three-terminal input/power/header footprint on the right edge of the receiver PCB.','interpreted');terminal(p,3);
for(let [r,x,y,rot,desc,band] of [
 ['R1',130,144,Math.PI/2,'Optical detector / comparator input network.'],
 ['R2',260,290,Math.PI/2,'38 kHz filter resistor or threshold network.'],
 ['R3',317,283,Math.PI/2,'Active band-pass feedback resistance.'],
 ['R4',377,258,Math.PI/2,'Frequency-selective feedback resistor.'],
 ['R5',475,150,Math.PI/2,'38 kHz band-pass filter resistor.'],
 ['R6',542,156,Math.PI/2,'Comparator / filter network.'],
 ['R7',623,115,0,'Receiver bias/threshold resistor.'],
 ['R8',619,428,0,'Demodulator / envelope discharge resistor.'],
 ['R9',804,405,Math.PI/2,'Receiver output LED current-limiting resistor.'],
 ['R10',798,583,Math.PI/2,'Output threshold network resistor.'],
 ['R11',679,653,0,'1 kHz channel circuit resistor.'],
 ['R12',402,654,0,'Additional RC detection network resistor.'],
 ['R13',145,598,Math.PI/2,'Supply or channel resistance.'],
 ['R14',331,469,0,'38 kHz / 1 kHz filter stage resistor.'],
 ['R15',621,292,Math.PI/2,'Active filter-feedback resistor.'],
 ['R16',345,127,Math.PI/2,'Band-pass stage resistor.']]){
  p=part(b,r,`${r} · through-hole resistor`,'Resistor',x,y,desc,'interpreted');p.rotate=rot;resistor(p,band||[C.orange,C.black2,C.red]);
}
for(let [r,x,y,kind,desc] of [
 ['C1',524,65,'ceramic','High-frequency active filter capacitor.'],
 ['C2',616,65,'ceramic','Second small-signal band-pass capacitor.'],
 ['C3',707,432,'disc','1 kHz / 38 kHz filter and detector capacitance.'],
 ['C4',618,205,'ceramic','Channel feedback capacitor.'],
 ['C5',622,415,'ceramic','Envelope detector / filter capacitance.'],
 ['C6',338,405,'disc','Active filter coupling capacitor.'],
 ['C7',398,150,'ceramic','Band-pass RC stage.'],
 ['C8',318,412,'ceramic','Coupling / detector stage.'],
 ['C9',707,477,'ceramic','Envelope detector timing capacitor.']]){
 p=part(b,r,`${r} · ${kind==='disc'?'ceramic disc':'film/ceramic'} capacitor`,'Capacitor',x,y,desc,'interpreted');(kind==='disc'?disc:ceramic)(p,kind==='disc'?undefined:C.orange)
}
for(let [r,x,y,desc] of [
 ['D1',383,263,'1N4148-style fast switching diode used for envelope rectification.'],
 ['D2',467,444,'Second rectifier diode for the parallel frequency channel.']]){p=part(b,r,'1N4148 envelope detector diode','Diode',x,y,desc,'interpreted');diode(p)}
}


return data;
};
