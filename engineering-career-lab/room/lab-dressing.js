window.buildPreservedOfficePlant=function(k,parent,p,scale=1,trailing=false){const g=k.G(parent,p);g.s=[scale,scale,scale];if(!trailing){k.Y(g,.17,.26,[.045,.040,.032],[0,.13,0]);k.Y(g,.18,.020,[.030,.025,.018],[0,.275,0]);
 for(let j=0;j<6;j++)k.leaf(g,[Math.sin(j*1.7)*.13,.31+(j%3)*.07,Math.cos(j*1.7)*.13],[.5,j*1.2,.55],.48);}
 for(let j=0;j<5;j++){const points=[];for(let i=0;i<12;i++){const y=trailing?.30-i*.205:.42+i*.19,x=Math.sin(i*.62+j*1.9)*(.11+i*.028),z=Math.cos(i*.68+j*1.9)*(.11+i*.022);points.push([x,y,z]);k.leaf(g,[x,y,z],[.22*Math.sin(i)+j*.1,j*1.7+i*.56,(i%2?1:-1)*.7],.45+i*.029);}k.cable(g,points,.009,[.070,.155,.054]);}return g;};

/* Real wall returns, storage, ceiling services and greenery give the two
   inward-facing work areas the dense, warm reference-room character. No image
   is used as room geometry. */
window.buildLabPlant=function(k,parent,p,scale=1,trailing=false){
 const g=k.G(parent,p);g.s=[scale,scale,scale];if((k.plantMotion?.length||0)<2){k.moving(g);(k.plantMotion||(k.plantMotion=[])).push(g);}
 if(!k.labFoliage){const v=[],ix=[];for(let j=0;j<=8;j++){const t=j/8,w=.115*Math.pow(Math.sin(Math.PI*t),.8);for(let i=0;i<3;i++)v.push((i-1)*w,-t*.34,.055*Math.sin(Math.PI*t)+(i===1?.026:0));}for(let j=0;j<8;j++)for(let i=0;i<2;i++){const a=j*3+i;ix.push(a,a+3,a+1,a+1,a+3,a+4);}const front=ix.slice(),offset=v.length/3;v.push(...v.map((x,i)=>i%3===2?x-.001:x));for(let i=0;i<front.length;i+=3)ix.push(front[i+2]+offset,front[i+1]+offset,front[i]+offset);k.labFoliage=k.customMesh(v,ix);}
 const leaf=(p,r,size,index)=>{const n=k.mat(g,k.labFoliage,index%3?[.065,.135,.040]:[.12,.20,.055],p,r,'paint');n.s=[size,size,size];n.rough=.64;n.metal=0;};
 k.Y(g,trailing?.19:.23,trailing?.18:.32,[.045,.047,.043],[0,trailing?.09:.16,0]);k.Y(g,trailing?.20:.24,.025,[.14,.15,.13],[0,trailing?.18:.32,0]);k.Y(g,trailing?.17:.21,.013,[.022,.019,.013],[0,trailing?.185:.325,0]);
 for(let j=0;j<5;j++){const points=[];for(let i=0;i<8;i++){const u=i/7,a=j*2.4,y=trailing?.18-u*(1.3+(j%3)*.22):.32+u*(1.25+(j%2)*.3),radius=trailing?.10+u*.16:Math.sin(u*Math.PI)*.23+.04,x=Math.cos(a+u*.8)*radius,z=Math.sin(a+u*.8)*radius;points.push([x,y,z]);if(i>0){leaf([x,y,z],[trailing?.15:1.9,a+i*.37,(i%2?1:-1)*.38],.68+(i%3)*.08,i+j);if(i%2===0)leaf([x+.04,y-.03,z],[-.2,a+2.7,-.4],.8,j);}}k.cable(g,points,.007,[.055,.105,.025]);}
 return g;
};
window.buildSkillsAlcove=function(k,parent){const {G,B,R,Y,C}=k,g=G(parent);
 // Dark timber backboard, horizontal slats and a heavy lit canopy.
 B(g,10.5,7.7,.19,[.025,.028,.030],[-5.55,3.76,-23.96]);
 for(let y=.6;y<7.5;y+=1.35)B(g,10.34,.10,.10,[.022,.025,.027],[-5.55,y,-23.80]);
 for(const x of [-10.85,-.35]){B(g,.26,7.5,.40,C.graphite,[x,3.7,-23.64]);B(g,.028,5.2,.040,C.red,[x+.10,3.65,-23.39],'light',.55);}
 for(const y of [.20,6.75,7.55])B(g,10.55,.18,.25,C.darkSteel,[-5.55,y,-23.62]);
 B(g,10.9,.22,1.15,[.029,.032,.034],[-5.55,6.98,-23.42]);B(g,10.30,.035,.10,[1,.62,.36],[-5.55,6.85,-22.92],'light',.62);
 for(const x of [-.9])B(g,.026,4.5,.045,C.red,[x,4.25,-23.17],'light',.60);
 // Shallow equipment service recess and a routed supply conduit.
 B(g,8.9,.12,.28,C.graphite,[-5.25,1.50,-23.57]);B(g,8.6,.018,.10,[1,.60,.30],[-5.25,1.58,-23.38],'light',.78);
 B(g,8.8,.11,.66,[.085,.070,.052],[-5.25,1.91,-23.18]);B(g,8.7,.020,.07,[1,.58,.28],[-5.25,1.98,-22.88],'light',.72);
 k.cable(g,[[-10.6,.1,-23.5],[-10.6,6.6,-23.5],[-1,6.6,-23.5]],.035,C.darkSteel);
 for(const x of [-8.7,-1.8]){R(g,.7,.42,.19,C.graphite,[x,1.57,-23.5],.03);for(let j=0;j<3;j++){Y(g,.045,.018,C.black,[x-.18+j*.18,1.57,-23.39],[Math.PI/2,0,0]);}}
 buildLabPlant(k,g,[-11.15,6.00,-23.15],.95,true);

 B(g,9.15,.030,.040,[1,.58,.28],[-5.25,.13,-21.02],'light',.82);B(g,9.15,.018,.030,C.red,[-5.25,.10,-21.0],'light',.62);
 return g;};
window.buildLabServices=function(k,parent){const {G,B,Y,R,C}=k,g=G(parent);
 // Longitudinal roof beams establish perspective instead of a flat backdrop.
 for(const x of [-9.2,9.2])B(g,.45,.26,14.7,C.graphite,[x,7.35,-17.7]);
 for(const z of [-22]){R(g,1.7,.27,1.1,C.darkSteel,[0,7.18,z],.04);for(let i=0;i<8;i++)B(g,1.42,.018,.035,C.black,[0,7.035,z-.4+i*.11]);}
 for(const x of [-11.15,11.15])for(const z of [-13.4,-19,-23.5]){B(g,.10,6.8,.11,C.darkSteel,[x,3.35,z]);B(g,.04,3.5,.05,C.red,[x-Math.sign(x)*.08,3.5,z],'light',.42);}
 for(const side of [-1,1]){const x=side*10.8;R(g,.72,1.1,.60,C.graphite,[x,.5,-15],.04);B(g,.45,.035,.035,C.silver,[x,.72,-14.68]);}

 return g;};
window.buildLabForegroundProps=function(k,parent){const {G,B,R,Y,C}=k,g=G(parent);
 // A cropped electronics service trolley replaces the empty corner table.
 const cart=G(g,[-9.2,-.06,-19.45]);R(cart,2.05,1.02,1.12,C.graphite,[0,.64,0],.045);R(cart,2.18,.10,1.22,C.steel,[0,1.20,0],.025);B(cart,1.75,.018,.85,[.045,.10,.095],[0,1.26,0],'rubber');
 for(let i=0;i<3;i++){const y=.35+i*.27;B(cart,1.85,.22,.045,C.darkSteel,[0,y,.59]);B(cart,.65,.035,.06,C.silver,[0,y+.04,.63]);}
 for(const x of [-.82,.82])for(const z of [-.42,.42]){Y(cart,.12,.09,C.black,[x,.12,z],[Math.PI/2,0,0],'rubber');Y(cart,.055,.10,C.steel,[x,.12,z],[Math.PI/2,0,0]);}
 const parts=G(cart,[0,1.31,0]);R(parts,1.12,.12,.62,C.darkSteel,[0,0,0],.025);for(const x of [-.34,0,.34]){B(parts,.28,.08,.44,[.06,.13,.12],[x,.06,0]);B(parts,.12,.04,.22,C.silver,[x,.12,.02]);}k.cable(cart,[[.55,1.30,.2],[.80,1.32,.35],[.95,1.15,.4]],.022,C.black);
 // An archive acquisition case on a low built-in plinth replaces the right table.
 const console=G(g,[8.9,-.08,-19.9]);R(console,1.80,.60,1.08,C.graphite,[0,.32,0],.04);R(console,1.64,.52,.94,[.09,.11,.12],[0,.89,0],.065,'paint');B(console,1.40,.32,.025,C.black,[0,.92,.49]);B(console,.48,.09,.014,[.23,.54,.41],[-.26,.98,.51],'light',.65);
 for(const x of [-.57,.57]){B(console,.08,.38,.08,C.steel,[x,.88,.53]);B(console,.20,.08,.28,C.darkSteel,[x,1.19,0]);}for(const x of [.20,.38])Y(console,.04,.03,C.silver,[x,.85,.53],[Math.PI/2,0,0]);
 return g;};

// Layered services and equipment are assembled in the same station coordinates.
window.buildLabDetailInstallation=function(k,parent){const {G,B,R,Y,C}=k,g=G(parent);
 // Open-frame instrument bridge: power equipment below, signal generator above.
 for(const x of [-8.0,-6.45]){B(g,.09,.90,.12,C.steel,[x,1.82,-22.0],'steel');B(g,.26,.045,.85,C.darkSteel,[x,1.37,-22.0]);}
 B(g,1.90,.09,1.02,C.darkSteel,[-7.23,2.00,-22.0],'steel');B(g,1.70,.015,.87,[.08,.10,.105],[-7.23,2.055,-22.0],'rubber');
 // Bench signal generator, meter, sensor jig and low component organizers.
 const generator=G(g,[-7.25,2.20,-22.0]);R(generator,1.02,.34,.48,[.30,.31,.30],[0,0,0],.035,'paint');B(generator,.92,.26,.02,C.graphite,[0,0,.25]);k.screen(generator,.49,.16,[-.14,.025,.266],(c,v)=>{c.fillStyle='#081719';c.fillRect(0,0,v.width,v.height);c.fillStyle='#89d7b7';c.font='42px monospace';c.fillText('1.000 kHz',12,58);},{width:300,height:90});for(const x of [.23,.38])Y(generator,.045,.035,C.silver,[x,0,.28],[Math.PI/2,0,0]);
 const meter=G(g,[-5.90,1.42,-21.85],[.15,0,.09]);R(meter,.30,.43,.11,[.64,.42,.08],[0,.15,0],.025,'paint');B(meter,.23,.14,.015,[.12,.18,.16],[0,.25,.065]);Y(meter,.055,.025,C.black,[0,.08,.075],[Math.PI/2,0,0]);k.cable(g,[[-5.95,1.4,-21.75],[-6.02,1.38,-21.65],[-6.02,1.38,-21.3],[-6.15,1.38,-21.15]],.012,C.red);
 for(let i=0;i<3;i++){const x=-6.8+i*.44;R(g,.38,.14,.32,[.065,.078,.085],[x,1.40,-22.35],.018);for(let j=0;j<3;j++)B(g,.055,.045,.11,j%2?C.silver:[.12,.25,.18],[x-.10+j*.10,1.48,-22.35]);}
 const jig=G(g,[-5.5,1.35,-22.35]);B(jig,.60,.025,.42,[.025,.18,.11],[0,.01,0]);for(const x of [-.22,.22]){Y(jig,.026,.22,C.silver,[x,.13,-.13]);B(jig,.12,.13,.12,C.graphite,[x,.18,-.13]);}B(jig,.32,.055,.16,[.45,.47,.45],[0,.09,.05]);
 // Service panel, recessed fasteners, conduit brackets and proper mounting feet.
 for(const x of [-10.5,-.7]){R(g,.30,4.5,.23,C.darkSteel,[x,3.9,-23.5],.025);for(const y of [1.8,3.8,5.8]){B(g,.38,.13,.28,C.graphite,[x,y,-23.45]);for(const dx of [-.12,.12])Y(g,.025,.018,C.silver,[x+dx,y,-23.29],[Math.PI/2,0,0]);}}
 for(const x of [-8.8,-1.8]){B(g,.66,.35,.15,C.graphite,[x,1.70,-23.30]);for(let i=0;i<3;i++)Y(g,.055,.025,C.black,[x-.20+i*.20,1.72,-23.20],[Math.PI/2,0,0]);}

 return g;
};
