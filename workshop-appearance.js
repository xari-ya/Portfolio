/* Reference-led environment treatment. All additions are static scenery;
 * machinery, character assets and behavioural clocks remain owned elsewhere. */
(()=>{'use strict';
const palette={black:[.027,.029,.032],steel:[.20,.215,.22],edge:[.37,.38,.37],red:[1,.028,.012],warm:[1,.80,.59],white:[1,.96,.88],green:[.19,.28,.075]};
const lights=[
 {position:[-.4,4.8,1.2],color:[1,.94,.83],power:2.20,falloff:.070},
 {position:[-7.1,4.3,-2.0],color:[1,.79,.58],power:1.80,falloff:.12},
 {position:[-10.35,4.0,-.75],color:[1,.93,.82],power:1.90,falloff:.15},
 {position:[6.43,4.5,.10],color:[1,.94,.85],power:1.90,falloff:.095},
 {position:[4.1,3.1,6.2],color:[1,.90,.76],power:1.60,falloff:.14},
 {position:[-11.25,2.9,-.4],color:[1,.035,.012],power:3.00,falloff:.80},
 {position:[0,5.7,-8.7],color:[1,.025,.008],power:2.40,falloff:.85},
 {position:[3,.10,3.70],color:[1,.035,.010],power:1.25,falloff:1.20}
];
const vec=a=>'vec3('+a.map(n=>Number(n).toFixed(4)).join(',')+')';
const lightingGLSL=`
uniform float uHallMix,uDetail,uShadowOn;
uniform mat4 uShadowVP;uniform sampler2D uShadowMap;
float workshopVisibility(vec3 p,vec3 n){
 if(uShadowOn<.5)return 1.;
 vec4 projected=uShadowVP*vec4(p,1.);vec3 q=projected.xyz/projected.w*.5+.5;
 if(q.x<.002||q.x>.998||q.y<.002||q.y>.998||q.z<0.||q.z>1.)return 1.;
 float bias=max(.0010,.0020*(1.-max(n.y,0.))),sum=0.;
 for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)sum+=step(q.z-bias,SHADOW_TEX(uShadowMap,q.xy+vec2(float(x),float(y))/1024.).r);
 return sum/9.;
}
vec3 workshopPoint(vec3 c,vec3 n,vec3 v,vec3 p,float rough,float metal,vec3 source,vec3 color,float energy,float falloff){
 vec3 delta=source-p;float d2=dot(delta,delta);vec3 l=delta*inversesqrt(max(d2,.01));
 float diffuse=max(dot(n,l),0.);float spec=pow(max(dot(n,normalize(l+v)),0.),mix(130.,10.,rough*rough));
 return color*energy/(1.+falloff*d2)*(c*diffuse+mix(vec3(.17),c,metal*.72)*spec*(1.-rough*.55));
}
vec3 workshopSurface(vec3 c,vec3 n,vec3 v,vec3 p,float rough,float metal,float task){
 vec3 light=c*(.075+.035*max(n.y,0.));float visibility=workshopVisibility(p,n);
 ${lights.map((l,i)=>`${i===1||i===6||i===7?'if(uDetail>.5)':''}light+=workshopPoint(c,n,v,p,rough,metal,${vec(l.position)},${vec(l.color)},${l.power.toFixed(3)}${i===0?'*(1.+task*.18)':''},${l.falloff.toFixed(4)})${i===0?'*mix(.22,1.,visibility)':''};`).join('\n')}
 // Shallow, bounded red spill from the visible wall channels and lane rails.
 float left=1./(1.+2.1*pow(p.x+11.45,2.)+.08*pow(p.z+.8,2.)+.035*pow(p.y-2.9,2.));
 float rear=1./(1.+1.2*pow(p.z+8.95,2.)+.055*p.x*p.x+.05*pow(p.y-3.8,2.));
 float lane=(exp(-2.2*abs(p.z-3.42))+exp(-2.2*abs(p.z-5.88)))*.65*(1.-smoothstep(9.2,10.2,abs(p.x)))/(1.+p.y*p.y*2.);
 vec3 red=vec3(1.,.025,.008)*(left*.32+rear*.22+lane*.38);
 light+=c*red+red*pow(1.-max(dot(n,v),0.),3.)*metal*.12;
 return light*(1.-smoothstep(5.1,7.0,p.y)*.62)*mix(.76,1.,visibility);
}
vec3 workshopEntry(vec3 c,vec3 n,vec3 v,vec3 p,float rough,float metal){
 vec3 light=c*.085;
 light+=workshopPoint(c,n,v,p,rough,metal,vec3(3.52,4.55,12.20),vec3(1.,.91,.76),3.0,.08);
 light+=workshopPoint(c,n,v,p,rough,metal,vec3(.57,4.45,9.7),vec3(1.,.72,.49),1.4,.13);
 light+=workshopPoint(c,n,v,p,rough,metal,vec3(6.47,4.45,9.7),vec3(1.,.72,.49),1.4,.13);
 light+=workshopPoint(c,n,v,p,rough,metal,vec3(.05,2.3,7.43),vec3(1.,.035,.012),2.0,.5);
 light+=workshopPoint(c,n,v,p,rough,metal,vec3(7.0,2.3,7.43),vec3(1.,.035,.012),2.0,.5);
 return light;
}
`;
window.WorkshopAppearance={palette,lights,lightingGLSL,overview:{yaw:.28,pitch:.29,dist:16.4,target:[-1.15,1.50,.50]}};

window.buildWorkshopDressing=function({hall,group,mat,box,cylinder,torus,quad,customMesh,orientedTube,C,layout,createTexture,gl}){
 const P=palette,root=group(hall),bay=group(root,layout.position);bay.r[1]=layout.rotation;
 const b=(parent,w,h,d,p,col=P.black,type='graphite',emit=0,r=0)=>mat(parent,box(w,h,d,r),col,p,[],type,emit);
 // A small depth-tested light-spill decal, not a screen-wide bloom pass.
 const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=64;
 const gc=glowCanvas.getContext('2d'),gradient=gc.createRadialGradient(32,32,2,32,32,32);
 gradient.addColorStop(0,'rgba(255,255,255,.55)');gradient.addColorStop(.35,'rgba(255,255,255,.20)');gradient.addColorStop(1,'rgba(255,255,255,0)');gc.fillStyle=gradient;gc.fillRect(0,0,64,64);
 const glowTexture=createTexture();gl.bindTexture(gl.TEXTURE_2D,glowTexture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,glowCanvas);
 for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.LINEAR);
 for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);
 function strip(parent,w,h,d,p,color=P.red,energy=1.8){
  b(parent,w+.035,h+.035,d+.018,p,P.black,'steel');
  const diffuser=b(parent,w,h,d+.022,[p[0],p[1],p[2]+.012],color,'light',energy);
  if(color===P.red)b(parent,w>h?w*.98:w*.30,w>h?h*.30:h*.98,.006,[p[0],p[1],p[2]+d/2+.026],[1,.57,.38],'light',1.5);
  if(color===P.red&&(w>3||h>2.5)){
   const halo=mat(parent,quad(w+.24,h+.24),P.red,[p[0],p[1],p[2]+d/2+.030],[],'light',1.05);
   halo.texture=glowTexture;halo.texMode=3;halo.alpha=.65;
  }
  return diffuser;
 }
 // Inner bay jambs frame the brought-forward workstation and close the empty
 // return-wall gap without moving the hall's protected structural columns.
 for(const x of [-2.65,2.95]){
  b(bay,.52,6.9,.45,[x,3.45,-.93],P.black,'steel');
  b(bay,.80,.36,.73,[x,.12,-.93],P.steel,'steel');
  for(const y of [1.15,3.10,5.40])b(bay,.66,.11,.58,[x,y,-.90],P.steel,'steel');
  strip(bay,.030,5.7,.025,[x+.18,3.65,-.67]);
 }
 const conveyorColumnLights=[];
 // Fitted lighting channels: the supports, screen and bench retain their geometry.
 for(const z of [-8.5,-3.55,2.05])for(const x of [-10.35,10.35]){
  const sx=x<0&&z!==-8.5?-13.20:x;
  const frame=x>0&&z!==-8.5?group(root):root;if(frame!==root)conveyorColumnLights.push(frame);
  strip(frame,.038,5.65,.018,[sx+.23,3.7,z+.38]);
 }
 for(const z of [-8.20,-3.28,2.32])for(const x of [-7.3,-2.8,1.7,6.2])strip(root,1.35,.026,.10,[x,6.19,z]);
 for(const x of [-2.02,2.02])strip(root,.032,4.2,.02,[x,2.65,-8.88]);
 for(const x of [-2.2,2.5])strip(root,2.1,.032,.04,[x,6.52,-8.96]);
 for(const x of [-2.205,2.505])strip(bay,.020,.57,.022,[x,2.25,-.635]);
 strip(bay,2.31,.018,.025,[.56,.615,1.183]);
 for(const z of [3.42,5.88])strip(root,20.0,.017,.025,[0,-.036,z]);
 // White recessed lane markers; functional mint docking indicators remain unchanged.
 for(let i=0;i<24;i++)b(root,.36,.011,.037,[-9.5+i*.82,-.028,3.70],P.white,'light',1.1);
 // Warm miniature safety beacons sit on the retained barrier caps.
 for(const x of [-4.65,-2.95,-1.25,1.95]){
  mat(root,cylinder(.055,.07,12),P.black,[x,1.005,2.84],[],'steel');
  mat(root,cylinder(.043,.09,12),P.warm,[x,1.075,2.84],[],'light',1.3);
 }
 // Rack power illumination is separate from the controller-owned status LEDs.
 for(let j=0;j<3;j++)for(let k=0;k<6;k++)b(root,.35,.012,.014,[-8.74+j*1.53,.46+k*.17,-4.194+j*.7],[1,.40,.14],'light',.80);
 // Shelving and perforated tool board above the existing presentation display.
 const texCanvas=(w,h,paint)=>{
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;paint(cv.getContext('2d'),w,h);
  const t=createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;
 };
 b(bay,4.55,.84,.075,[.15,4.31,-.82],P.black,'steel');
 const board=mat(bay,quad(4.38,.72),[1,1,1],[.15,4.31,-.773],[],'graphite');board.finish=0;board.rough=.83;board.texture=texCanvas(1024,192,(c,w,h)=>{
  c.fillStyle='#202222';c.fillRect(0,0,w,h);c.fillStyle='#0b0d0f';for(let x=10;x<w;x+=18)for(let y=8;y<h;y+=18){c.beginPath();c.arc(x,y,2,0,Math.PI*2);c.fill();}
 });
 for(const y of [3.86,4.86,5.52]){
  b(bay,4.77,.08,.48,[.15,y,-.56],P.steel,'steel');
  b(bay,4.77,.075,.035,[.15,y+.028,-.305],P.black,'paint');
  for(const x of [-1.8,1.8]){b(bay,.045,.28,.045,[x,y-.17,-.71],P.steel,'steel');orientedTube(bay,[x,y-.28,-.72],[x,y-.035,-.34],.015,P.steel);}
 }
 strip(bay,4.45,.018,.025,[.15,3.808,-.36],P.warm,1.35);
 // Eight distinguishable hand tools, held by hooks on the pegboard.
 for(let i=0;i<8;i++){
  const x=-1.50+i*.45,y=4.38;
  b(bay,.018,.065,.060,[x,y+.17,-.70],P.edge,'steel');
  if(i<5){
   mat(bay,torus(.050,.016,12,6),P.edge,[x,y+.09,-.68],[Math.PI/2,0,0],'steel');
   b(bay,.028,.29,.028,[x,y-.085,-.68],P.edge,'steel');
   for(const side of [-1,1])b(bay,.018,.08,.028,[x+side*.035,y-.25,-.68],P.edge,'steel');
  }else{
   b(bay,.055,.15,.042,[x,y+.005,-.66],i===6?P.red:P.black,'rubber',0,.012);
   b(bay,.014,.19,.014,[x,y-.16,-.66],P.edge,'steel');
  }
 }
 // Boxes on the shelves share a restrained powder-coated material palette.
 for(const [x,y,w,h] of [[-.90,4.99,.54,.19],[.0,5.03,.66,.27],[1.07,5.01,.56,.23],[-.65,5.68,.72,.24],[.40,5.68,.77,.24],[1.36,5.65,.47,.18]]){
  b(bay,w,h,.35,[x,y,-.54],P.black,'paint',0,.025);
  b(bay,w*.70,.022,.012,[x,y+h*.14,-.355],P.steel,'steel');
  b(bay,.075,.022,.017,[x+w*.28,y-h*.2,-.345],P.edge,'steel');
 }
 // One shared curved leaf mesh, reused by both plants and hanging stems.
 const leaf=(len,width)=>{
  const points=[],indices=[];for(let i=0;i<=5;i++){const u=i/5;for(let s=-1;s<=1;s++){points.push(s*width*Math.sin(Math.PI*u),len*u,.055*Math.sin(Math.PI*u)*s*s+.15*u*u);}}
  for(let i=0;i<5;i++)for(let j=0;j<2;j++){const a=i*3+j;indices.push(a,a+3,a+1,a+1,a+3,a+4);}return customMesh(points,indices);
 };
 const leafGeo=leaf(.38,.09),leafColors=[[.15,.25,.055],[.28,.35,.08],[.095,.18,.045]];
 function plant(x,y,z,hanging=false){
  const g=group(bay,[x,y,z]);mat(g,cylinder(.18,.27,16,.145),P.steel,[0,.145,0],[],'paint');mat(g,cylinder(.16,.015,16),[.045,.035,.022],[0,.285,0],[],'rubber');
  for(let k=0;k<7;k++){
   const angle=k*2.399,dx=Math.cos(angle),dz=Math.sin(angle),high=.48+(k%3)*.12;
   orientedTube(g,[0,.28,0],[dx*.25,high,dz*.23],.008,leafColors[0],'paint');
   for(let j=0;j<3;j++){const l=mat(g,leafGeo,leafColors[(j+k)%3],[dx*.07*j,.30+(high-.3)*j/3,dz*.06*j],[.35+j*.15,angle+j*.8,-.75+(k%3)*.4],'paint');l.s=[1+(k%2)*.2,1,1];}
  }
  if(hanging)for(let arm=0;arm<3;arm++){
   let last=[-.05,.30,0];for(let j=0;j<12;j++){
    const p=[-.12-arm*.065+.10*Math.sin(j*.8),.30-j*.135,.18+.06*Math.cos(j*.7+arm)];
    orientedTube(g,last,p,.006,leafColors[0],'paint');last=p;
    mat(g,leafGeo,leafColors[(j+arm)%3],p,[2.3,j*1.7,arm-.8],'paint').s=[.75,.65,.75];
   }
  }
 }
 plant(-1.84,4.91,-.51,true);plant(-1.72,5.57,-.55,false);
 // Additional personal tools on the bench: no rescaling of supplied assets.
 const mug=group(bay,[-.40,.681,.93]);mat(mug,cylinder(.065,.14,18),P.black,[0,.075,0],[],'paint');mat(mug,torus(.063,.012,18,7),P.edge,[0,.145,0],[],'steel');mat(mug,cylinder(.052,.003,16),[.025,.016,.008],[0,.143,0],[],'rubber');mat(mug,torus(.039,.012,16,6),P.black,[.079,.08,0],[Math.PI/2,0,Math.PI/2],'paint');
 const cup=group(bay,[-.42,.681,.39]);mat(cup,cylinder(.06,.12,14),P.steel,[0,.06,0],[],'steel');
 for(let i=0;i<6;i++)orientedTube(cup,[.035*Math.cos(i),.04,.035*Math.sin(i)],[.07*Math.cos(i),.24+(i%3)*.025,.07*Math.sin(i)],.007,i%2?P.red:P.edge,'paint');
 b(bay,.31,.017,.20,[.31,.687,.97],[.12,.14,.14],'paint');b(bay,.28,.004,.18,[.31,.698,.97],[.55,.53,.44],'paint');
 // Chair parks to the right on the hall floor, clear of the raised platform,
 // actor, laptop, presentation text and all existing camera approach paths.
 const chair=group(bay,[2.70,-.215,.85]);chair.r[1]=-.65;
 mat(chair,cylinder(.045,.32,16),P.edge,[0,.31,0],[],'steel');mat(chair,cylinder(.085,.09,16),P.black,[0,.14,0],[],'rubber');
 for(let i=0;i<5;i++){const a=i*Math.PI*2/5,p=[Math.cos(a)*.34,.09,Math.sin(a)*.34];orientedTube(chair,[0,.15,0],p,.022,P.steel);mat(chair,cylinder(.047,.045,12),P.black,[p[0],.047,p[2]],[Math.PI/2,0,a],'rubber');}
 b(chair,.60,.115,.56,[0,.52,0],P.black,'rubber',0,.05);
 const back=group(chair,[0,.92,.235]);back.r[0]=-.14;
 b(back,.58,.72,.11,[0,0,0],P.steel,'paint',0,.045);b(back,.50,.59,.09,[0,.015,-.067],P.black,'rubber',0,.04);b(back,.34,.016,.012,[0,.20,-.12],P.red,'paint');
 for(const y of [-.17,.0,.17])b(back,.43,.007,.005,[0,y,-.115],P.steel,'rubber');
 for(const x of [-.24,.24])b(back,.009,.52,.009,[x,.015,-.11],P.red,'paint');
 b(chair,.33,.14,.13,[0,1.36,.34],P.black,'rubber',0,.025);
 for(const side of [-1,1]){orientedTube(chair,[side*.28,.50,.14],[side*.34,.72,.12],.016,P.steel);b(chair,.10,.045,.31,[side*.34,.74,-.02],P.black,'rubber',0,.015);}
 // Physical engineering pictograms mounted on the side support, not controls.
 const icons=group(root,layout.worldPoint([2.95,3.95,-.56]));icons.r[1]=layout.rotation;
 b(icons,.48,1.95,.075,[0,0,0],P.black,'steel');
 const icon=mat(icons,quad(.41,1.83),[1,1,1],[0,0,.045],[],'light',.65);icon.texture=texCanvas(192,768,(c,w,h)=>{
  c.fillStyle='#101214';c.fillRect(0,0,w,h);c.lineWidth=4;c.strokeStyle='#d32f1b';c.fillStyle='#ece7dc';c.textAlign='center';c.textBaseline='middle';c.font='bold 63px monospace';['▣','</>','◇','⚙'].forEach((s,i)=>{const y=8+i*190;c.strokeRect(15,y,w-30,166);c.fillText(s,w/2,y+83);});
 });
 const stats={triangles:0,meshInstances:0};
 (function count(n){if(n.geometry){stats.triangles+=n.geometry.count/3;stats.meshInstances++;}for(const child of n.children)count(child);})(root);
 const bounds=(min,max)=>{
  const p=[];for(const x of [min[0],max[0]])for(const y of [min[1],max[1]])for(const z of [min[2],max[2]])p.push(layout.worldPoint([x,y,z]));
  return [0,1].map(end=>[0,1,2].map(i=>(end?Math.max:Math.min)(...p.map(v=>v[i]))));
 };
 const clearances={chair:bounds([2.15,-.215,.30],[3.25,1.25,1.40]),shelving:bounds([-2.25,3.79,-.85],[2.55,6.6,-.25])};
 root.visible=true;
 return {root,chair,stats,clearances,conveyorColumnLights,update(amount){root.visible=amount>.001;root.alpha=amount;}};
};
})();
