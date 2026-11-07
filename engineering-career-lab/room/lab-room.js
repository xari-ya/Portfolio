/* World metres follow the hall's rear portal and flush Kira lane. The new
   rectangular room spans x ±11.4 and z -9.9…-25.5; its walkway stays clear. */
window.EngineeringLabLayout={revision:'reconstruction-20261106-final-r3',bounds:[[-8.2,-.2,-25.6],[8.2,5.9,-9.7]],floor:-.06,
 doorway:{center:[0,-.06,-25.50],closed:.61,travel:1.26,wallOpening:2.80,wallHeight:3.24},
 screen:{center:[-5.25,3.98,-23.37],size:[8.35,2.98],content:[1200,513]},
 laptop:{position:[-3.45,1.30,-20.85],yaw:-.12,scale:.40},
 views:{threshold:{yaw:0,pitch:.04,dist:4,target:[0,2,-11]},crossing:{yaw:0,pitch:.03,dist:3.1,target:[0,2,-14.4]},lab:{yaw:0,pitch:.015,dist:13.0,target:[0,3.0,-24]},skills:{yaw:.22,pitch:.035,dist:7.05,target:[-3.9,2.55,-22.5]},experience:{yaw:-.30,pitch:.045,dist:6.7,target:[4.4,2.8,-22.5]}},
 mobileViews:{lab:{yaw:.06,pitch:.035,dist:12.8,target:[0,2.65,-24]},skills:{yaw:.28,pitch:.04,dist:7.5,target:[-4.4,2.7,-22.5]},experience:{yaw:-.24,pitch:.035,dist:7.4,target:[4.4,2.85,-22.5]}},
 stationBounds:[[-8.3,0,-24.6],[-1.35,5.65,-18.8]],archiveBounds:[[1.35,0,-24.6],[8.3,5.9,-20.7]],
 kiraPark:[-.85,-23.2],kiraArchive:[.85,-23.2],kiraOverview:[0,-21]
};
// The two work areas face into the circulation route. Equipment is authored
// once in its bench coordinates; the shared transforms also drive HTML, lights,
// laptop placement, picking and camera composition.
(()=>{const L=EngineeringLabLayout;L.shellScale=[16.4/22.8,5.9/7.8,1];L.ceilingLights=[[-5.6,7.00,-21.1],[5.6,7.00,-21.1],[-5.6,7.00,-24.3],[5.6,7.00,-24.3]].map(p=>p.map((v,i)=>v*L.shellScale[i]));const Lp={position:[-4.4,0,-22.5],origin:[-5.25,0,-22],yaw:.22,scale:.65,heightScale:.78};L.stationPlacement=Lp;
 L.stationPoint=p=>{const x=(p[0]-Lp.origin[0])*Lp.scale,z=(p[2]-Lp.origin[2])*Lp.scale;return [Lp.position[0]+Math.cos(Lp.yaw)*x+Math.sin(Lp.yaw)*z,p[1]*Lp.heightScale,Lp.position[2]-Math.sin(Lp.yaw)*x+Math.cos(Lp.yaw)*z];};
 L.taskLight=L.stationPoint([-6.0,3.8,-19.75]);
 L.laptop={...L.laptop,position:L.stationPoint(L.laptop.position),yaw:L.laptop.yaw+Lp.yaw+Math.PI,scale:L.laptop.scale*Lp.scale};
 // Station views face their physical displays and include the proportional benches.
 // The archive display is a real plane in the room; the HTML instrument uses
 // these axes so its content stays locked to the physical screen.
 // Mirror the station's rendered facade, including its origin offset, so both
 // halves read as one symmetric pair across the central doorway.
 const A={position:[4.7,0,-23.0],yaw:-.22,scale:.65,heightScale:.78,local:[0,3.90,-.36],size:[6.5596,3.258]};
 L.archivePlacement=A;
 const ax=Math.cos(A.yaw),az=-Math.sin(A.yaw),sx=Math.sin(A.yaw),sz=Math.cos(A.yaw);
 L.archiveScreen={center:[A.position[0]+(ax*A.local[0]+sx*A.local[2])*A.scale,A.local[1]*A.heightScale,A.position[2]+(az*A.local[0]+sz*A.local[2])*A.scale],u:[ax,0,az],v:[0,1,0],width:A.size[0]*A.scale,height:A.size[1]*A.heightScale,content:[1200,714]};
})();
window.buildLabFloor=function(k,root){const {G,B,C}=k,g=G(root);B(g,22.8,.18,15.8,[.009,.010,.011],[0,-.18,-17.65],'light',1);
 for(let i=0;i<19;i++)for(let j=0;j<13;j++){const tile=B(g,1.184,.032,1.184,[[.057,.061,.064],[.065,.067,.068],[.051,.056,.059]][(i*7+j*5)%3],[-10.8+i*1.2,-.076,-24.8+j*1.2]);tile.rough=.53+((i*3+j)%4)*.07;tile.metal=.22;}
 // The reference floor is dark, slightly polished concrete with occasional
 // seams; red lane dashes lead the eye straight down the central aisle.
 for(const x of [-2.3,2.3]){for(let z=-25;z<-10;z+=1.15)B(g,.032,.007,.5,C.red,[x,-.052,z],'light',.62);for(let z=-24;z<-10;z+=2.2)B(g,.13,.008,.03,[.5,.24,.14],[x*.82,-.050,z],'light',.32);}
 for(const x of [-9,9])for(const z of [-13,-19,-24]){B(g,.8,.016,.6,C.graphite,[x,-.05,z]);for(const a of [-.32,.32])for(const b of [-.22,.22])k.Y(g,.025,.02,C.steel,[x+a,-.033,z+b]);}
 const route=k.moving(G(k.scene));B(route,1.25,.13,12.65,C.graphite,[8.9,-.125,-.825]);B(route,9.6,.13,1.15,C.graphite,[4.45,-.125,-7.15]);B(route,1.25,.13,3.2,C.graphite,[0,-.125,-8.4]);for(const z of [-5,-2,1,4])B(route,.28,.007,.035,C.silver,[8.9,-.055,z]);
 return g;};
window.buildLabWalls=function(k,root){const {G,B,C}=k,g=G(root),wall=[.0125,.0135,.014],panel=[.016,.017,.017],batten=[.024,.020,.015];
 const D=EngineeringLabLayout.doorway,half=D.wallOpening/(2*EngineeringLabLayout.shellScale[0]),lintel=D.wallHeight/EngineeringLabLayout.shellScale[1];
 for(const x of [-11.4,11.4])B(g,.24,7.8,15.8,wall,[x,3.75,-17.6]);
 for(const side of [-1,1])B(g,11.4-half,7.8,.24,wall,[side*(11.4+half)/2,3.75,-25.5]);
 B(g,half*2,7.65-lintel,.24,wall,[0,(7.65+lintel)/2,-25.5]);
 // Large dark wall panels with narrow seams, wide structural columns and a
 // low skirting give the room its built-in, architectural character.
 for(const side of [-1,1])for(let z=-24.6;z<-10.2;z+=1.35){const x=side*11.265;B(g,.055,7.35,.018,[.006,.0065,.007],[x,3.70,z]);B(g,.055,.035,1.18,[.030,.026,.021],[x,.07,z+.6]);}
 for(const side of [-1,1])for(let z=-24.1;z<-10.6;z+=2.7){const x=side*11.25;B(g,.04,7.1,.48,batten,[x,3.62,z]);B(g,.026,5.9,.035,C.red,[x-Math.sign(x)*.032,3.55,z],'light',.50);B(g,.022,5.9,.62,[.018,.019,.018],[x-Math.sign(x)*.033,3.55,z+1.18]);}
 for(let z=-23.35;z<-9.9;z+=1.35)B(g,22.4,.055,.025,[.006,.0065,.007],[0,7.22,z]);
 // Back wall: deep charcoal panels, a tall header rail and the red service
 // channels that frame the central sign.
 for(let x=-10.7;x<11;x+=1.55){if(Math.abs(x)<half+.04)continue;B(g,.035,7.2,.04,[.006,.0065,.007],[x,3.62,-25.36]);}
 for(let x=-10.7;x<11;x+=3.1){if(Math.abs(x)<half+.04)continue;B(g,.95,6.7,.09,batten,[x,3.45,-25.28]);B(g,.028,5.4,.035,C.red,[x+.48,3.55,-25.22],'light',.42);}
 for(const x of [-4.6,4.6]){B(g,.26,7.45,.48,C.graphite,[x,3.68,-25.52]);B(g,.030,5.5,.040,C.red,[x-Math.sign(x)*.145,3.65,-25.245],'light',.50);}
 B(g,22.55,.32,.26,C.darkSteel,[0,7.20,-25.20]);
 // Front returns meet the original portal; there is a genuine central opening.
 for(const x of [-6.7,6.7])B(g,9.2,7.8,.20,[.020,.020,.019],[x,3.75,-9.92]);B(g,4.2,3.3,.20,C.graphite,[0,6,-9.92]);
 for(const x of [-11.2,11.2])for(const z of [-12,-18,-24]){B(g,.26,7.4,.30,C.graphite,[x,3.7,z]);B(g,.35,.25,.4,C.darkSteel,[x,.08,z]);B(g,.026,4.6,.045,C.red,[x-Math.sign(x)*.15,3.6,z],'light',.42);}
 return g;};
window.buildLabCeiling=function(k,root){const {G,B,R,C}=k,g=G(root);B(g,22.7,.15,15.6,[.010,.012,.014],[0,7.65,-17.65]);
 // Two proper I-section transfer beams, with visible webs and flange shadows.
 for(const z of [-19.3,-25.1]){const lift=z<-23?.55:0;B(g,22.4,.09,.65,C.graphite,[0,7.42+lift,z]);B(g,22.2,.48,.12,C.graphite,[0,7.14+lift,z]);B(g,22.4,.09,.65,C.graphite,[0,6.86+lift,z]);}
 // Galvanized ventilation trunks over each installation replace the thin grid.
 for(const x of [-7.6,7.6]){R(g,1.12,.32,6.7,[.075,.090,.10],[x,7.50,-21.65],.07);for(const z of [-24.4,-22.2,-20.0,-18.8]){B(g,1.18,.035,.08,C.steel,[x,7.68,z],'steel');B(g,.06,.38,.09,C.darkSteel,[x-.58,7.50,z]);}}
 for(const x of [-10.2,10.2]){B(g,.70,.15,14.5,C.darkSteel,[x,7.13,-17.8]);for(let z=-24.5;z<-11;z+=1.2)B(g,.72,.035,.08,C.steel,[x,7.24,z],'steel');}
 return g;};

window.buildLabLighting=function(k,root){const {G,B,R,Y,C}=k,g=G(root);
 for(const z of [-21.1,-24.3])for(const x of [-5.6,5.6]){for(const dx of [-1.26,1.26])Y(g,.014,.37,C.steel,[x+dx,7.24,z]);R(g,3.24,.13,.30,C.graphite,[x,7.08,z],.025);B(g,2.94,.016,.18,[1,.88,.70],[x,7.00,z],'light',.90);B(g,3.16,.018,.025,C.red,[x,7.045,z+.155],'light',.52);for(const dx of [-1.57,1.57])B(g,.055,.15,.34,C.darkSteel,[x+dx,7.08,z]);}
 return g;};
window.buildArchiveShell=function(k,root){const {G,B,Y,C}=k,A=EngineeringLabLayout.archivePlacement,frame=G(root,A.position,[0,A.yaw,0]);frame.s=[A.scale,A.heightScale,A.scale];const g=G(frame),gold=[.66,.44,.16],paper=[.72,.72,.66];
 // Warm timber backboard, black structural columns and a red service line.
 B(g,10.70,7.70,.35,[.025,.033,.038],[0,3.70,-1.10]);
 for(const y of [.32,1.5,5.8,7.3])B(g,10.42,.10,.15,[.022,.025,.027],[0,y,-.30]);
 for(const x of [-5.22,5.22]){B(g,.18,7.45,.46,C.darkSteel,[x,3.72,-.12]);B(g,.030,5.90,.040,C.red,[x+(x<0?.11:-.11),3.55,.06],'light',.60);}
 // Header band with the station sign and a warm wash beneath.
 B(g,5.71,.015,.05,C.red,[0,5.71,.10],'light',.70);
 const header=G(g,[-.51,6.50,-.02]);B(header,7.77,.89,.17,[.012,.015,.016],[.51,0,-.10]);B(header,5.92,.86,.18,[.013,.016,.017],[0,0,-.05]);B(header,7.01,.022,.040,[1,.30,.12],[.26,-.44,.10],'light',.60);
 const sign=k.screen(header,5.64,.80,[0,0,.09],(c,v)=>paintLabStationSign(c,v,'06','EXPERIENCE ARCHIVES','LEADERSHIP // EXPERIENCE // ACHIEVEMENTS',.248,.095,{titleScale:1.14,titleSX:1.02,numScale:1.05}),{width:1600,height:226});
 // A deep aperture, not a solid plate with a monitor pasted onto it.
 const aperture=G(g,[0,3.90,0]);
 B(aperture,7.65,4.45,.16,[.015,.020,.024],[0,0,-.90]);
 for(const x of [-3.68,3.68]){k.R(aperture,.30,4.40,1.20,C.graphite,[x,0,-.20],.045);B(aperture,.035,4.20,.06,C.steel,[x-Math.sign(x)*.11,0,.43],'steel');B(aperture,.12,4.02,.84,C.black,[x-Math.sign(x)*.20,0,-.33]);}
 for(const y of [-2.10,2.10]){k.R(aperture,7.35,.24,1.20,C.graphite,[0,y,-.20],.045);B(aperture,7.10,.025,.06,C.steel,[0,y,.43],'steel');B(aperture,6.90,.11,.80,C.black,[0,y-Math.sign(y)*.20,-.35]);}
 B(aperture,6.78,.025,.05,[1,.83,.61],[0,1.79,-.13],'light',.78);
 B(aperture,6.78,.025,.05,[1,.83,.61],[0,-1.79,-.13],'light',.55);
 const display=k.screen(g,6.5596,3.258,[0,3.90,-.36],(c,v,time=0,active='achievements')=>paintExperienceJourney(c,v,time,active),{width:1024,height:609,dynamic:true});
 // Open archive shelving, lit by warm practical strips under every shelf.
 for(const side of [-1,1]){const x=side*4.32;
  // Full-height dark carcass and backboard: the reference shelves are a
  // built-in cabinet, not freestanding shelves against the slat wall.
  B(g,1.78,4.52,.16,[.030,.037,.042],[x,3.52,-.65]);
  for(const sx of [-.84,.84])B(g,.14,4.58,1.16,C.graphite,[x+sx,3.52,-.04]);
  B(g,1.78,.14,.76,C.graphite,[x,5.76,.06]);
  for(const y of [1.55,2.55,3.55,4.55]){B(g,1.78,.12,1.12,C.darkSteel,[x,y,.04]);B(g,1.58,.022,.09,[1,.80,.57],[x,y-.055,.40],'light',.62);}
  B(g,1.70,.09,.72,C.steel,[x,5.66,.06]);B(g,1.58,.020,.09,[1,.58,.26],[x,5.60,.40],'light',.55);
  if(side<0){
   // Upper closed equipment stack.
   for(let j=0;j<3;j++){const iy=4.78+j*.22;B(g,.96,.20,.46,C.graphite,[x,iy,.16]);B(g,.88,.09,.02,[.085,.10,.095],[x,iy,.40]);B(g,.32,.035,.006,[.92,.34,.11],[x-.22,iy,.412],'light',.60);B(g,.42,.028,.006,[.42,.14,.07],[x+.18,iy,.412],'paint');for(const kx of [-.32,.32])Y(g,.025,.020,C.silver,[x+kx,iy,.418],[Math.PI/2,0,0]);}
   // Reference shelves: equipment cases above, substantial books below.
   for(const base of [2.60,3.60]){
    const shades=[[.052,.061,.068],[.19,.037,.025],[.09,.075,.052],[.032,.043,.050],[.40,.37,.29],[.17,.15,.11]];
    for(let i=0;i<6;i++){const h=.56+(i%3)*.09,bx=x-.53+i*.205;B(g,.18,h,.42,shades[i],[bx,base+h/2,.20],'paint');B(g,.135,h-.05,.008,[.57,.54,.44],[bx,base+h/2,.417],'paint');B(g,.18,h,.025,shades[i],[bx,base+h/2,.435],'paint');}
    const spines=k.screen(g,1.23,.78,[x,base+.39,.453],(c,v)=>{c.clearRect(0,0,v.width,v.height);const names=['ENGINEERING','LEADERSHIP','TEAMWORK','DESIGN','SYSTEMS','ROBOTICS'];for(let i=0;i<6;i++){const bx=(i+.5)*v.width/6,h=(.56+(i%3)*.09)/.78*v.height;c.save();c.translate(bx,v.height-h*.53);c.rotate(-Math.PI/2);c.fillStyle=i===4?'#292b2a':'#ddd5bd';c.font='600 29px "Workshop Condensed",sans-serif';c.textAlign='center';c.fillText(names[i],0,10);c.restore();c.fillStyle='#b49a6b';c.fillRect(i*v.width/6+12,v.height-h+14,v.width/6-24,3);c.fillRect(i*v.width/6+12,v.height-20,v.width/6-24,3);}},{width:768,height:512});spines.node.emit=.12;spines.node.texMode=3;spines.node.alpha=.99;
   }
   B(g,.96,.30,.46,C.graphite,[x,1.76,.19]);B(g,.56,.025,.012,C.silver,[x,1.82,.43]);
  }else{
   // Warm recessed niches: lit timber backs, warm lenses and red accents.
   const nicheGlow=(cy,hh)=>{k.screen(g,1.30,hh,[x,cy,.185],(c,v)=>{const ng=c.createRadialGradient(v.width*.5,v.height*.30,8,v.width*.5,v.height*.5,v.width*.74);ng.addColorStop(0,'#c58143');ng.addColorStop(.42,'#77471f');ng.addColorStop(1,'#24150b');c.fillStyle=ng;c.fillRect(0,0,v.width,v.height);const fl=c.createLinearGradient(0,0,0,v.height);fl.addColorStop(0,'rgba(255,226,174,.72)');fl.addColorStop(.38,'rgba(255,172,96,0)');c.fillStyle=fl;c.fillRect(0,0,v.width,v.height);},{width:256,height:256});};
   nicheGlow(5.04,1.12);nicheGlow(4.03,.98);
   for(const [cy,hh] of [[5.04,1.12],[4.03,.98]]){B(g,1.16,.018,.026,[1,.78,.52],[x,cy+hh*.51,.24],'light',1.25);for(const ex of [-.64,.64])B(g,.016,hh*.86,.022,[1,.64,.38],[x+ex,cy,.24],'light',.85);}
   // Framed certificate: matte paper in a deep dark frame.
   k.R(g,.98,1.22,.08,[.055,.048,.035],[x,5.05,.29],.025,'steel');
   B(g,.90,1.14,.025,[.075,.066,.052],[x,5.05,.317],'paint');
   k.screen(g,.72,.94,[x,5.05,.348],(c,v)=>{const w=v.width,h=v.height;c.fillStyle='#d3c6a6';c.fillRect(0,0,w,h);c.strokeStyle='#6b542f';c.lineWidth=2;c.strokeRect(16,16,w-32,h-32);c.lineWidth=1;c.strokeRect(22,22,w-44,h-44);c.textAlign='center';c.fillStyle='#4f4634';c.font='600 27px "Workshop Condensed",sans-serif';c.fillText('RECOGNITION',w/2,h*.29);c.font='13px Arial';c.fillText('SELECTED ACHIEVEMENTS',w/2,h*.37);c.fillStyle='#877a60';for(let i=0;i<6;i++)c.fillRect(w*.20,h*(.47+i*.035),w*.60,1);c.strokeStyle='#947343';c.beginPath();c.arc(w*.72,h*.79,19,0,Math.PI*2);c.stroke();c.beginPath();c.arc(w*.72,h*.79,14,0,Math.PI*2);c.stroke();c.font='italic 17px Georgia';c.fillText('Leadership / Service',w*.40,h*.81);},{width:384,height:512});

   // Heavy orbital trophy on the shelf below: dark plinth, bronze ring, star.
   B(g,.38,.10,.30,[.045,.042,.036],[x,3.64,.24]);
   B(g,.26,.05,.22,[.075,.068,.052],[x,3.72,.24]);
   B(g,.10,.05,.10,[.38,.29,.14],[x,3.755,.24],'steel');
   Y(g,.034,.15,[.40,.31,.17],[x,3.86,.24],'steel');
   const ringV=[],ringI=[];for(let i=0;i<=40;i++)for(let j=0;j<=8;j++){const a=i/40*Math.PI*2,b=j/8*Math.PI*2,r=.265+.024*Math.cos(b);ringV.push(x+Math.cos(a)*r,4.10+Math.sin(a)*r*1.25,.24+.024*Math.sin(b));}for(let i=0;i<40;i++)for(let j=0;j<8;j++){const q=i*9+j;ringI.push(q,q+1,q+9,q+1,q+10,q+9);}const orbital=k.mat(g,k.customMesh(ringV,ringI),gold,[0,0,0],[],'steel');orbital.rough=.23;orbital.metal=.8;const localRing=ringV.map((v,i)=>v-[x,4.10,.24][i%3]);const crossed=k.mat(g,k.customMesh(localRing,ringI),[.48,.34,.16],[x,4.10,.24],[0,.95,.16],'steel');crossed.rough=.27;crossed.metal=.80;
   for(let i=0;i<5;i++){const a=i*Math.PI*2/5;Y(g,.015,.24,[.62,.47,.20],[x+Math.cos(a)*.06,4.10+Math.sin(a)*.06,.255],[0,0,a],'paint');}
   B(g,.075,.075,.014,[.50,.36,.14],[x,4.10,.255],'paint');
   B(g,.06,.24,.02,[.50,.36,.14],[x,3.80,.255],'paint');
   // Two recognition pieces occupy the lower lit niche.
   for(const [dx,height]of [[-.36,.59],[.35,.47]]){const award=G(g,[x+dx,2.60,.24]);k.R(award,.47,.07,.34,C.darkSteel,[0,.035,0],.012);const pts=[[-.18,.08],[.18,.08],[.22,height*.63],[0,height],[-.22,height*.63]],verts=[],ix=[];for(const z of [-.025,.025])for(const [xx,yy]of pts)verts.push(xx,yy,z);for(let i=1;i<4;i++)ix.push(0,i+1,i,5,5+i,5+i+1);for(let i=0;i<5;i++){const j=(i+1)%5;ix.push(i,j,i+5,j,j+5,i+5);}const plate=k.mat(award,k.customMesh(verts,ix),gold,[0,.06,0],[],'steel');plate.rough=.3;plate.metal=.8;for(const yy of [.18,.24,.30])B(award,.24,.008,.006,[.12,.095,.055],[0,yy,.029]);}

  }
 }
 // Full-depth exhibition credenza, recessed toe space and machined drawer pulls.
 k.R(g,10.45,1.50,2.0,[.048,.060,.068],[0,.83,.38],.06);
 B(g,10.55,.12,2.10,C.darkSteel,[0,1.64,.42],'steel');B(g,10.40,.055,2.02,[.075,.090,.095],[0,1.73,.42],'rubber');
 B(g,10.05,.24,1.65,C.black,[0,.03,.24]);B(g,9.95,.025,.08,[1,.80,.57],[0,-.01,1.18],'light',.65);
 for(const x of [-3.85,-1.28,1.28,3.85])for(let i=0;i<2;i++){const y=.53+i*.64;k.R(g,2.40,.55,.12,[.032,.040,.045],[x,y,1.43],.025);B(g,1.10,.035,.11,C.silver,[x,y+.13,1.535],'steel');for(const dx of [-.51,.51])B(g,.045,.13,.08,C.steel,[x+dx,y+.09,1.49],'steel');}
 B(g,10.24,.025,.055,[1,.83,.62],[0,1.81,1.24],'light',.48);
 // Corner console keeps the archive anchored like the reference.
 B(g,1.05,.50,.62,C.graphite,[5.05,1.62,.28]);B(g,.50,.28,.03,C.black,[5.05,1.70,.60],'glass');B(g,.40,.035,.02,[.20,.64,.48],[5.05,1.70,.615],'light',.65);
 buildLabPlant(k,g,[5.50,5.90,-.12],.48,true);buildLabPlant(k,g,[-5.30,0,-.10],.50);
 g.archiveDisplay=display;window.LabArchiveDisplay?.ready.then(()=>{if(k.gl.isTexture(display.texture))display.draw(0,window.EngineeringLab?.getState().journey||'achievements');});
 display.upload?.();window.addEventListener('lab:journey',e=>{if(e.detail)display.draw(0,e.detail);},{passive:true});
 return g;};
window.buildEngineeringCareerLab=function(api){const k=createLabGeometryKit(api),root=k.G(api.scene);k.moving(root);root.visible=true;
 const parts={floor:buildLabFloor(k,root),walls:buildLabWalls(k,root),ceiling:buildLabCeiling(k,root),lighting:buildLabLighting(k,root),services:buildLabServices(k,root),reception:buildLabReceptionExit(k,root),archive:buildArchiveShell(k,root),foreground:buildLabForegroundProps(k,root)};
 for(const name of ['floor','walls','ceiling','lighting','services','foreground']){const node=parts[name];node.s=EngineeringLabLayout.shellScale.slice();}
 const P=EngineeringLabLayout.stationPlacement,frame=k.G(root,P.position,[0,P.yaw,0]);frame.s=[P.scale,P.heightScale,P.scale];const stationRoot=k.G(frame,P.origin.map(v=>-v));parts.skillsAlcove=buildSkillsAlcove(k,stationRoot);
 const room={root,stationRoot,kit:k,parts,layout:EngineeringLabLayout,station:null,update(){},getState(){const s=this.station;return {sceneRevision:EngineeringLabLayout.revision,bounds:EngineeringLabLayout.bounds,components:Object.keys(parts),equipment:s?Object.keys(s):[],environment:this.environment?{elapsed:this.environment.elapsed,arrival:this.environment.arrival,visits:this.environment.visits,active:this.environment.active}:null,geometry:k.stats(),robotics:s?{yaw:s.robotics.yaw.r[1],pitch:s.robotics.pitch.r[0],limits:s.robotics.limits}:null,board:s?.board.leds.map(n=>n.emit),instrumentation:s?.instrumentation.leds.map(n=>n.emit),visible:root.visible};}};
 window.populateSkillsStation?.(room);parts.details=buildLabDetailInstallation(k,stationRoot);
 const finishes=n=>{if(n.geometry){if(n.finish===3&&n.rough===.78){n.rough=.72;n.metal=.18;}else if(n.finish===1){n.rough=.58;n.metal=.12;}else if(n.finish===4){n.rough=.27;n.metal=.88;}else if(n.finish===5&&!n.texture){n.metal=.12;n.rough=.12;}}for(const c of n.children)finishes(c);};finishes(root);return room;};
