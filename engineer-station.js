/* All station-local targets share one rigid transform. The bay is brought
 * forward and faces inward toward production, clear of the server wall. */
window.EngineerStationLayout={
 position:[-10.70,.02,-.60],height:1.50,rotation:1.20,
 character:[-1.30,.1525,.75],laptop:[.68,.674,.618],laptopScale:.16,laptopYaw:-.85,
 screen:[.15,2.25,-.82],screenSize:[4.60,2.85],contentSize:[1100,681],
 desktop:{yaw:1.08,pitch:.10,dist:6.45,target:[-10.964,1.85,-1.025]},
 mobile:{yaw:1.38,pitch:.13,dist:4.9,target:[-10.358,1.45,-.789]},
 approach:{yaw:1.30,pitch:.18,dist:7.2,target:[-10.4,1.50,-.95]},
 bounds:[[-12.60,.02,-3.42],[-8.35,3.90,1.65]],
 worldPoint(p){const [x,y,z]=this.position,c=Math.cos(this.rotation),s=Math.sin(this.rotation);return [x+c*p[0]+s*p[2],y+p[1],z-s*p[0]+c*p[2]];}
};
window.buildEngineerStation=function({hall,group,mat,box,cylinder,quad,customMesh,C,createTexture,gl}){
 const L=EngineerStationLayout,root=group(hall,L.position);root.r[1]=L.rotation;
 const put=(geo,col,p,type='graphite',emit=0,r=[])=>mat(root,geo,col,p,r,type,emit);
 // This infill wall occupies the shifted front bays. The original wall beside
 // the servers and its rear column do not move.
 const wall=group(root,[.15,0,-1.10]);
 mat(wall,box(5.60,7.60,.18),[.052,.056,.060],[0,3.55,0],[],'graphite');
 for(const x of [-2.66,-1.33,0,1.33,2.66])mat(wall,box(.045,7.2,.035),C.darkSteel,[x,3.55,.105],[],'steel');
 for(const y of [.18,3.65,7.22])mat(wall,box(5.55,.065,.045),C.darkSteel,[0,y,.12],[],'steel');
 // A larger workbench bay, with clear standing space on the engineer's side.
 put(box(4.15,.16,2.50,.045),[.11,.14,.16],[.25,.04,.27]);
 put(box(4.03,.035,2.38,.018),[.20,.23,.24],[.25,.135,.27],'steel');
 for(const x of [-1.71,2.21])put(box(.025,.008,2.14),C.red,[x,.158,.27],'paint',.10);
 for(const x of [-1.50,-1.29,-1.08,1.57,1.78,1.99])put(box(.10,.007,.09),C.silver,[x,.157,1.38],'paint');
 const desk=group(root,[.16,.0305,.634]);desk.s=[.8,.8,.8];
 const d=(geo,col,p,type='graphite',emit=0,r=[])=>mat(desk,geo,col,p,r,type,emit);
 // Extend the bench toward the new standing position, preserving its height,
 // depth and the supplied laptop's scale. Props retain their own proportions.
 d(box(2.94,.11,1.30,.025),[.32,.36,.38],[.50,.71,.02],'steel');
 d(box(2.96,.045,1.32,.016),[.075,.095,.11],[.50,.785,.02]);
 d(box(2.89,.018,.025),C.red,[.50,.728,.692],'paint');
 for(const x of [-.75,1.80])for(const z of [-.49,.53]){
  d(box(.075,.53,.075,.012),C.darkSteel,[x,.41,z],'steel');
  d(box(.23,.035,.23,.014),C.darkSteel,[x,.175,z],'steel');
 }
 for(const z of [-.49,.53])d(box(2.63,.055,.06),C.darkSteel,[.525,.30,z],'steel');
 d(box(2.16,.16,.66,.022),[.15,.18,.19],[.60,.568,.12],'paint');
 d(box(.38,.026,.045,.009),C.silver,[.60,.565,.47],'steel');
 d(box(2.40,.018,.44),C.darkSteel,[.525,.29,-.04],'steel');
 const electronics=group(desk,[-.28,0,0]);
 const e=(geo,col,p,type='graphite',emit=0,r=[])=>mat(electronics,geo,col,p,r,type,emit);
 // A serviceable electronics prototype and loose leads on an anti-static mat.
 e(box(.48,.010,.51,.008),[.04,.13,.14],[-.08,.814,-.18],'rubber');
 e(box(.30,.018,.24,.006),[.04,.23,.16],[-.10,.832,-.20],'paint');
 for(const x of [-.20,-.10,0])for(const z of [-.27,-.17])e(box(.026,.021,.014),[.65,.58,.38],[x,.852,z],'steel');
 e(box(.09,.034,.075),C.black,[-.11,.858,-.20],'rubber');
 for(const x of [-.20,-.17,-.14,-.11,-.08])e(box(.012,.019,.025),C.silver,[x,.846,-.075],'steel');
 // Open parts tray with a small, deliberately irregular set of fasteners.
 e(box(.43,.025,.29,.015),[.27,.30,.30],[-.09,.822,.40],'steel');
 for(const x of [-.30,.12])e(box(.018,.057,.29),C.darkSteel,[x,.846,.40],'steel');
 for(const z of [.26,.54])e(box(.43,.057,.018),C.darkSteel,[-.09,.846,z],'steel');
 for(const [x,z,a] of [[-.21,.34,.2],[-.04,.36,-.8],[.03,.46,.4],[-.16,.48,-.4],[-.09,.42,.6]]){
  e(cylinder(.021,.018,10),C.silver,[x,.852,z],'steel',0,[Math.PI/2,0,a]);
  e(box(.017,.014,.055),C.steel,[x,.848,z+.026],'steel',0,[0,a,0]);
 }
 // Notebook / technical drawing, opened beside the laptop.
 d(box(.34,.022,.36,.008),[.24,.15,.11],[1.48,.824,.34],'paint',0,[0,-.12,0]);
 d(box(.30,.006,.32),[.75,.73,.64],[1.48,.840,.34],'paint',0,[0,-.12,0]);
 for(let i=0;i<5;i++)d(box(.18-i*.013,.002,.006),[.33,.40,.40],[1.46,.845,.25+i*.039],'paint',0,[0,-.12,0]);
 // Small bench vise with opposed jaws and a screw handle; no new machinery.
 d(box(.36,.045,.27,.015),C.darkSteel,[1.50,.831,-.37],'steel');
 for(const x of [1.38,1.64])d(box(.075,.13,.20,.012),[.31,.36,.38],[x,.915,-.37],'steel');
 d(cylinder(.018,.40,14),C.silver,[1.47,.900,-.37],'steel',0,[0,0,Math.PI/2]);
 d(cylinder(.012,.18,12),C.steel,[1.23,.900,-.37],'steel');
 // Unfinished enclosure and two hand tools, kept clear of the laptop keyboard.
 d(box(.22,.085,.24,.012),[.38,.40,.38],[1.82,.857,-.02],'paint');
 d(box(.19,.012,.21,.008),C.darkSteel,[1.82,.906,-.02],'steel');
 d(cylinder(.027,.13,14),[.43,.10,.08],[1.13,.837,.43],'rubber',0,[Math.PI/2,0,-.28]);
 d(cylinder(.009,.18,12),C.silver,[1.10,.837,.56],'steel',0,[Math.PI/2,0,-.28]);
 e(box(.13,.022,.035,.008),C.darkSteel,[.02,.831,-.46],'steel',0,[0,.30,0]);
 // One short cable follows the desktop edge instead of entering the keyboard.
 for(const [x,z,a] of [[.13,-.21,.2],[.14,-.31,-.3],[.09,-.39,-.7],[-.01,-.43,-1.1]])e(cylinder(.007,.12,10),C.black,[x,.824,z],'rubber',0,[Math.PI/2,0,a]);
 // Flush wall bracket and display frame. There are no freestanding screen posts.
 for(const x of [-1.00,1.50])put(box(.12,.62,.13,.01),C.darkSteel,[x,2.10,-.965],'steel');
 // A machined, chamfered bezel with real depth, fasteners and inset diffusers.
 const outline=(w,h,c)=>[[-w/2+c,-h/2],[w/2-c,-h/2],[w/2,-h/2+c],[w/2,h/2-c],[w/2-c,h/2],[-w/2+c,h/2],[-w/2,h/2-c],[-w/2,-h/2+c]];
 const verts=[],indices=[];
 for(const [w,h,c,z] of [[5.06,3.26,.17,-.15],[4.99,3.18,.15,.04],[4.65,2.91,.11,.04],[4.65,2.91,.11,-.15]])for(const [x,y] of outline(w,h,c))verts.push(x,y,z);
 for(let row=0;row<3;row++)for(let i=0;i<8;i++){const a=row*8+i,b=row*8+(i+1)%8,c=a+8,d=b+8;indices.push(a,b,c,b,d,c);}
 put(customMesh(verts,indices),[.13,.145,.16],[.15,2.25,-.75],'steel');
 for(const x of [-2.18,2.48])for(const y of [.83,3.67]){
  put(cylinder(.043,.027,16),[.43,.44,.43],[x,y,-.669],'steel',0,[Math.PI/2,0,0]);
  put(cylinder(.024,.031,6),C.black,[x,y,-.650],'steel',0,[Math.PI/2,0,0]);
 }
 for(const y of [.75,3.75]){
  put(box(.88,.11,.06,.025),[.28,.09,.055],[.15,y,-.66],'steel');
  put(box(.73,.035,.07,.012),[1,.61,.37],[.15,y,-.615],'light',1.7);
  put(box(.64,.015,.075),[1,.96,.81],[.15,y,-.605],'light',1.2);
 }
 for(const sx of [-1,1])for(const sy of [-1,1]){
  put(box(.28,.028,.026),[.89,.045,.025],[.15+sx*2.22,2.25+sy*1.37,-.646],'light',.9,[0,0,-sx*sy*.75]);
  put(box(.32,.023,.023),[.55,.08,.06],[.15+sx*2.02,2.25+sy*1.45,-.65],'paint');
 }
 put(box(4.66,2.91,.025,.02),[.012,.019,.024],[.15,2.25,-.80],'glass');
 const screen=put(quad(4.60,2.85),C.white,[.15,2.25,-.78],'light',.75);
 const cv=document.createElement('canvas');cv.width=1536;cv.height=960;const ctx=cv.getContext('2d');
 const texture=createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);
 for(const [k,v] of [[gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,k,v);
 screen.texture=texture;screen.texMode=1;
 const indicator=put(box(.038,.025,.016,.005),C.red,[2.43,.788,-.784],'light',.4);
 put(box(4.40,.025,.025),[.60,.65,.66],[.15,3.71,-.76],'light',.5);
 let previous='',lastActive=false,lastTab='intro';
 function display(active,tab='intro'){
  lastActive=active;lastTab=tab;
  const key=active+tab+(innerWidth>=1040&&innerWidth/innerHeight>=1.4?'wall':'reading');if(key===previous)return;previous=key;
  ctx.fillStyle='#090c0f';ctx.fillRect(0,0,cv.width,cv.height);
  // The physical screen provides the substrate. Desktop text/controls are
  // mapped onto it by EngineerAbout; mobile keeps its readable HTML below.
  const wash=ctx.createRadialGradient(1100,290,20,900,480,850);wash.addColorStop(0,'#111619');wash.addColorStop(1,'#080b0e');ctx.fillStyle=wash;ctx.fillRect(45,45,cv.width-90,cv.height-90);
  ctx.strokeStyle='#30383c';ctx.lineWidth=1;ctx.strokeRect(48,48,cv.width-96,cv.height-96);
  // Fine engineering linework stays below the contrast of all readable content.
  ctx.save();ctx.strokeStyle='#89979c12';ctx.lineWidth=1;
  for(let x=930;x<1500;x+=62){ctx.beginPath();ctx.moveTo(x,180);ctx.lineTo(x,875);ctx.stroke();}
  for(let y=190;y<890;y+=62){ctx.beginPath();ctx.moveTo(900,y);ctx.lineTo(1490,y);ctx.stroke();}
  ctx.strokeStyle='#e9442026';
  for(let row=0;row<14;row++){ctx.beginPath();for(let i=0;i<=70;i++){const x=58+i*6.4,y=830+row*6+Math.sin(i*.12+row*.20)*38;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();}
  ctx.strokeStyle='#a6a3a014';for(const radius of [150,185,240]){ctx.beginPath();ctx.arc(1520,945,radius,Math.PI,Math.PI*1.5);ctx.stroke();}
  ctx.restore();
  if(!active||innerWidth<1040||innerWidth/innerHeight<1.4){
   ctx.fillStyle='#d94b2c';ctx.fillRect(70,72,10,36);
   ctx.font='800 185px "Workshop Condensed", sans-serif';ctx.fillStyle='#f1eee6';ctx.fillText('S',185,380);ctx.fillStyle='#eb462b';ctx.fillText('/',280,380);ctx.fillStyle='#f1eee6';ctx.fillText('D.',365,380);
   ctx.font='34px monospace';ctx.fillStyle='#c6c6bd';['HARDWARE','SOFTWARE','THE PHYSICAL WORLD'].forEach((text,i)=>ctx.fillText(text,190,472+i*53));
   ctx.fillStyle='#bb5c42';ctx.font='19px monospace';ctx.fillText('01 / THE ENGINEER',92,105);
  }
  gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.generateMipmap(gl.TEXTURE_2D);
  indicator.emit=active?.9:.35;screen.emit=active?.95:.75;
 }
 // Redraw the identity texture once the local headline face becomes available.
 document.fonts.ready.then(()=>{previous='';display(lastActive,lastTab);});
 display(false);return {root,wall,screen,display,indicator,layout:L};
};
