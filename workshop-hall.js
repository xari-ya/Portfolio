window.createLivingWorkshopHall=function(canvas,gl){
 'use strict';
 if(!gl)throw Error('Living Workshop requires WebGL2');
const gpuResources={buffers:new Set(),textures:new Set(),shaders:new Set()};
function createTexture(){const t=gl.createTexture();gpuResources.textures.add(t);return t;}
const vertexSrc=`attribute vec3 aPosition;attribute vec3 aNormal;attribute vec2 aUV;
uniform mat4 uModel,uVP;varying vec3 vP,vN,vLocal;varying vec2 vUV;
void main(){vec4 p=uModel*vec4(aPosition,1.);vP=p.xyz;vLocal=aPosition;vN=mat3(uModel)*aNormal;vUV=aUV;gl_Position=uVP*p;}`;
// Material-aware studio lighting: four different physical surface responses.
const fragSrc=`precision highp float;varying vec3 vP,vN,vLocal;varying vec2 vUV;
uniform vec3 uColor,uCamera,uKira,uPart;uniform float uEmit,uMetal,uAlpha,uTexOn,uRough,uFinish,uTask,uEntryMix;
uniform sampler2D uTexture;uniform vec4 uLabFocus,uLabEnvironment;
#define SHADOW_TEX texture2D
${window.WorkshopAppearance.lightingGLSL}
${window.CommunicationsLightingGLSL}
// Phone surfaces retain directional material highlights; local practicals use
// diffuse light without four extra per-pixel Blinn lobes at miniature scale.
vec3 labPractical(vec3 c,vec3 n,vec3 v,vec3 p,float rough,float metal,vec3 source,vec3 color,float energy,float falloff){
 if(uDetail>.5)return workshopPoint(c,n,v,p,rough,metal,source,color,energy,falloff);
 vec3 delta=source-p;float d2=dot(delta,delta);
 return color*energy/(1.+falloff*d2)*c*max(dot(n,delta*inversesqrt(max(d2,.01))),0.);
}
float hash3(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float hash2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float grain(vec3 p){vec3 a=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(mix(hash3(a),hash3(a+vec3(1,0,0)),f.x),mix(hash3(a+vec3(0,1,0)),hash3(a+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(a+vec3(0,0,1)),hash3(a+vec3(1,0,1)),f.x),mix(hash3(a+vec3(0,1,1)),hash3(a+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){
vec3 n=normalize(vN);vec3 v=normalize(uCamera-vP);
vec3 lightKey=normalize(vec3(-.57,.89,.72)),lightFill=normalize(vec3(.84,.55,-.33)),lightTop=normalize(vec3(.16,1.,-.75));
float D1=max(dot(n,lightKey),0.),D2=max(dot(n,lightFill),0.),D3=max(dot(n,lightTop),0.);
float fine=hash3(floor(vLocal*96.))-.5;
float broad=sin(vLocal.x*17.)*sin(vLocal.y*11.)*sin(vLocal.z*13.)*.14;
vec3 c=uColor;
float textureAlpha=1.;
if(uTexOn>.5){vec2 uv=uFinish>6.5&&uFinish<7.5?(commLocal(vP).xz+vec2(6.,3.))/vec2(12.,6.):vUV;vec4 sampleColor=texture2D(uTexture,uv);vec3 tex=sampleColor.rgb;if(uTexOn>2.5){c*=tex;textureAlpha=sampleColor.a;}else if(uTexOn>1.5)c*=tex;else c=tex;}
float rough=clamp(uRough,.06,.99);
if(uFinish<.5){c*=1.+fine*.007;} // natural unpainted surface
else if(uFinish<1.5){ // satin powder-coated ivory/red metal
 c*=1.+fine*.017+broad*.020;rough+=fine*.017;
}else if(uFinish<2.5){ // real vulcanised rubber / track blocks
 c*=.96+fine*.035+broad*.042;rough=.91;
}else if(uFinish<3.5){ // dark anodised mechanical housings
 c*=1.+fine*.021+broad*.027;
}else if(uFinish<4.5){ // directional machining marks
 float brush=sin(vLocal.y*380.0+fine*4.0)*.012;
 c*=1.+brush+fine*.013;rough=vP.z<-12.?clamp(uRough,.20,.65):.34;
}else if(uFinish<5.5){ // OLED glass, not a plastic panel
 c*=.93+fine*.015;rough=.14;
}
if(uFinish>8.5){vec3 e=commLocal(uCamera),q=commLocal(vP);float roomHeight=mix(1.,1.20,uPhoneOffice);float a=(mix(6.,1.56,uPhoneOffice)-e.x)/(q.x-e.x);vec3 hit=mix(e,q,a);if(uPhoneOffice<.001&&a>0.&&a<1.&&(hit.y<.36*roomHeight||hit.y>3.16*roomHeight||abs(hit.z)>2.9))discard;}
if(commMask(vP)>.99||uFinish>8.5||(uFinish>6.1&&uFinish<7.5)){vec3 daylight=uFinish>7.5?c:commSurface(c,n,v,vP,uRough,uMetal,uFinish);daylight=mix(daylight,c,clamp(uEmit,0.,1.))+c*max(uEmit-1.,0.)*.53;gl_FragColor=vec4(pow(max(daylight,vec3(0.)),vec3(.91)),uAlpha*textureAlpha);return;}
// Fully emissive lab seams and practical lenses do not need the lighting pass.
if(vP.z<-12.&&uEmit>=1.){vec3 direct=c*(1.+max(uEmit-1.,0.)*.53);float f=clamp((length(uCamera-vP)-7.)/38.,0.,.37);direct=mix(direct,vec3(.014,.015,.017),f*.48);gl_FragColor=vec4(pow(max(direct,vec3(0.)),vec3(.91)),uAlpha*textureAlpha);return;}
// Self-lit instrument glass uses a small reflected key, not nine light evaluations.
if(vP.z<-12.&&uTexOn>.5&&uTexOn<1.5&&uEmit>=.8){vec3 direct=c*(uEmit+(1.-uEmit)*(.35+.2*D1));float f=clamp((length(uCamera-vP)-7.)/38.,0.,.37);direct=mix(direct,vec3(.014,.015,.017),f*.48);gl_FragColor=vec4(pow(max(direct,vec3(0.)),vec3(.91)),uAlpha*textureAlpha);return;}
vec3 h1=normalize(lightKey+v),h2=normalize(lightFill+v);
float power=mix(155.,12.,rough*rough);
float spec1=pow(max(dot(n,h1),0.),power);
float spec2=pow(max(dot(n,h2),0.),power*.78);
float edge=pow(1.-max(dot(n,v),0.),3.1);
vec3 reflectTint=mix(vec3(.88,.89,.90),c,uMetal*.68);
float specScale=mix(.20,.52,uMetal)*(1.-rough*.47);
vec3 spec=reflectTint*(spec1*.77+spec2*.33)*specScale;
vec3 rim=vec3(.16,.26,.32)*edge*(.10+.11*uMetal);
float labMix=1.-smoothstep(-12.,-9.85,vP.z);
vec3 lit=vec3(0.);
// Opaque lab surfaces do not evaluate the unrelated hall lighting first.
if(labMix<.999){
// Four bounded industrial light pools correspond to visible fixtures and workstations.
float work=1.0/(1.0+0.24*dot(vP.xz-vec2(-.65,.2),vP.xz-vec2(-.65,.2))+0.08*pow(vP.y-3.7,2.0));
float server=1.0/(1.0+0.25*dot(vP.xz-vec2(-7.1,-3.6),vP.xz-vec2(-7.1,-3.6))+0.18*pow(vP.y-3.7,2.0));
float transfer=1.0/(1.0+0.20*dot(vP.xz-vec2(6.43,-1.3),vP.xz-vec2(6.43,-1.3))+0.12*pow(vP.y-4.1,2.0));
float path=1.0/(1.0+0.45*dot(vP.xz-vec2(2.4,4.4),vP.xz-vec2(2.4,4.4))+0.18*pow(vP.y-2.8,2.0));
float engineer=1.0/(1.0+0.45*dot(vP.xz-vec2(-12.1,-.8),vP.xz-vec2(-12.1,-.8))+0.25*pow(vP.y-3.4,2.0));
float taskFacing=max(dot(n,normalize(vec3(-.65,3.7,.2)-vP)),0.);
float architecture=1.-smoothstep(4.4,7.8,vP.y)*.37;
float diffusion=(.17+D1*.46+D2*.23+D3*.10)*architecture + (.62+uTask*.20)*work*taskFacing+.18*server+.14*transfer+.13*path+.15*engineer;
vec3 diffuse=c*diffusion;
lit=diffuse+spec+rim;
lit+=vec3(.026,.039,.052)*server+vec3(.025,.025,.021)*work+vec3(.018,.025,.032)*transfer;
if(uEntryMix>.001)lit=mix(lit,workshopEntry(c,n,v,vP,rough,uMetal),uEntryMix*smoothstep(5.35,7.35,vP.z));
if(uHallMix>.001&&vP.z>-12.){
 if(uFinish>5.5){
  c=mix(c,vec3(dot(c,vec3(.3,.45,.25)))*.83,.85);rough=.40;
  if(n.y>.7&&uDetail>.5){
   vec2 cell=fract(vP.xz*7.5)-.5;float alternate=mod(floor(vP.x*7.5)+floor(vP.z*7.5),2.)*2.-1.;
   vec2 q=vec2(cell.x+cell.y*alternate,cell.x-cell.y*alternate)*.707;
   float ridge=(1.-smoothstep(.85,1.1,abs(q.x)/.37+abs(q.y)/.055))*(1.-smoothstep(12.,23.,length(uCamera-vP)));
   n=normalize(n+vec3(ridge*.16,0.,ridge*-.12));rough+=ridge*.08;c*=1.+ridge*.085;
  }
 }
 vec3 look=workshopSurface(c,n,v,vP,rough,uMetal,uTask);
 lit=mix(lit,look,uHallMix);
}

}
// New lab fixtures illuminate only their physical room; the hall look is untouched.
if(labMix>.001){
 vec3 labLight=c*(.16+D1*.22+D3*.08)+spec*.78+rim*.42;
 labLight+=c*vec3(.022,.017,.012);
 // Warm ceiling washes aligned with the visible linear fixtures. Tight
 // falloff keeps the walls black and pools the light on the working decks.
 if(uDetail>.5)labLight+=workshopPoint(c,n,v,vP,rough,uMetal,vec3(${EngineeringLabLayout.ceilingLights[0].join(',')}),vec3(1.,.82,.62),2.006,.075);
 if(uDetail>.5)labLight+=workshopPoint(c,n,v,vP,rough,uMetal,vec3(${EngineeringLabLayout.ceilingLights[1].join(',')}),vec3(1.,.80,.59),1.836,.075);
 if(uDetail>.5)labLight+=workshopPoint(c,n,v,vP,rough,uMetal,vec3(${EngineeringLabLayout.ceilingLights[2].join(',')}),vec3(1.,.80,.58),2.074,.075);
 if(uDetail>.5)labLight+=workshopPoint(c,n,v,vP,rough,uMetal,vec3(${EngineeringLabLayout.ceilingLights[3].join(',')}),vec3(1.,.78,.56),1.938,.075);
 if(uDetail>.5)labLight+=workshopPoint(c,n,v,vP,rough,uMetal,vec3(7.05,4.65,-22.4),vec3(1.,.86,.65),3.6,.40);
 // Task and exhibition practicals carry the local contrast; decorative strips
 // use emissive geometry rather than a separate point calculation per shelf.
 labLight+=labPractical(c,n,v,vP,rough,uMetal,vec3(${EngineeringLabLayout.taskLight.join(',')}),vec3(1.,.89,.74),4.6,.19);
 labLight+=labPractical(c,n,v,vP,rough,uMetal,vec3(4.4,3.65,-22.7),vec3(1.,.89,.76),3.9,.20);
 labLight+=labPractical(c,n,v,vP,rough,uMetal,uKira+vec3(-.45,1.4,1.25),vec3(1.,.95,.83),2.4,.45);
 if(uLabFocus.w>.001)labLight+=labPractical(c,n,v,vP,rough,uMetal,uLabFocus.xyz,vec3(1.,.82,.65),uLabFocus.w,.9);
 labLight*=.91+.09*uLabEnvironment.y;
 labLight*=vec3(1.20,1.16,1.08);
 float benchGlow=exp(-.72*abs(vP.x+4.9)-.54*abs(vP.z+23.5));float archiveGlow=exp(-.72*abs(vP.x-4.9)-.54*abs(vP.z+23.5));labLight+=c*vec3(1.,.30,.09)*(benchGlow+archiveGlow)*.08;
 if(n.y>.7&&vP.y<.15){
  vec2 l=vP.xz-vec2(-4.34,-23.41),r=vP.xz-vec2(4.35,-23.46),ret=vP.xz-vec2(-6.86,-22.12);
  vec2 lq=vec2(.976*l.x-.218*l.y,.218*l.x+.976*l.y),rq=vec2(.976*r.x+.218*r.y,-.218*r.x+.976*r.y);
  float underL=(1.-smoothstep(2.95,3.15,abs(lq.x)))*(1.-smoothstep(.86,1.1,abs(lq.y)));
  float underR=(1.-smoothstep(3.2,3.5,abs(rq.x)))*(1.-smoothstep(.60,.78,abs(rq.y)));
  float underReturn=(1.-smoothstep(.9,1.3,abs(ret.y)))*(1.-smoothstep(.35,.60,abs(ret.x)));
  float cartContact=(1.-smoothstep(.60,.86,abs(vP.x+5.14)))*(1.-smoothstep(.30,.58,abs(vP.z+20.45)));
  float caseContact=(1.-smoothstep(.45,.70,abs(vP.x-5.29)))*(1.-smoothstep(.28,.52,abs(vP.z+21.0)));
  labLight*=1.-.55*max(max(underL,underR),underReturn);labLight*=1.-.38*max(cartContact,caseContact);labLight+=vec3(1.,.26,.055)*(benchGlow+archiveGlow)*.045;
 }
 if(n.y>.65&&vP.y>.98&&vP.y<1.10&&vP.x<-.8){
  vec2 scope=(vP.xz-vec2(-6.40,-22.39))/vec2(.55,.33),laptop=(vP.xz-vec2(-3.10,-23.23))/vec2(.53,.32);
  labLight*=1.-.34*max(exp(-dot(scope,scope)*2.),exp(-dot(laptop,laptop)*2.));
 }
 // Skills alcove: keep the archive and other rooms on their existing light rig.
 // A restrained cool separation and warm task pool replace the flat wash.
 float skillsAlcove=(1.-smoothstep(-1.25,-.70,vP.x))*(1.-smoothstep(-19.4,-18.0,vP.z));
 float taskPool=exp(-.42*pow(vP.x+4.6,2.)-.60*pow(vP.z+22.9,2.));
 labLight=mix(labLight,labLight*vec3(.62,.67,.70)+c*taskPool*vec3(.48,.22,.09),skillsAlcove);
 labLight+=skillsAlcove*vec3(.11,.19,.23)*edge*uMetal*.28;
 labLight=1.23*labLight/(vec3(1.)+labLight);
 lit=mix(lit,labLight,labMix);
}
// Soft contact occlusion at the actual supporting surfaces; never a floating decal.
if(n.y>.7&&vP.y<.14){
 float pedestal=exp(-dot((vP.xz-vec2(-2.1,-.25))/vec2(1.15,.95),(vP.xz-vec2(-2.1,-.25))/vec2(1.15,.95))*2.1);
 float cell=exp(-dot((vP.xz-vec2(.5,0.))/vec2(2.,1.7),(vP.xz-vec2(.5,0.))/vec2(2.,1.7))*2.1);
 float companion=exp(-dot((vP.xz-uKira.xz)/vec2(.55,.68),(vP.xz-uKira.xz)/vec2(.55,.68))*2.4);
 lit*=1.-min(.55,pedestal*.40+cell*.50+companion*.47);
 float joints=max(smoothstep(.985,1.,abs(sin(vP.x*2.66))),smoothstep(.985,1.,abs(sin(vP.z*2.80))));
 lit*=1.-joints*.07;
}
if(uFinish>4.5&&uFinish<5.5){
 float glow=pow(max(dot(n,normalize(vec3(-.54,.9,.36)+v)),0.),90.);
 lit+=vec3(.075,.105,.125)*glow*.3; // reflections on black glass
}
// A moving component casts a bounded soft contact shadow onto the feeder/fixture.
if(n.y>.7&&vP.y>.70&&vP.y<1.36){
 float height=uPart.y-.03-vP.y;
 if(height>=0.&&height<1.2){vec2 q=(vP.xz-uPart.xz)/vec2(.28+height*.20,.23+height*.20);lit*=1.-exp(-dot(q,q)*1.8)*.25/(1.+height*2.);}
}
// Restrained rough reflections of the actual red lane / wall channels.
if(uHallMix>.001&&vP.z>-12.&&n.y>.7&&vP.y<.15){
 float rails=(exp(-4.2*abs(vP.z-3.42))+exp(-4.2*abs(vP.z-5.88)))*(1.-smoothstep(9.6,10.3,abs(vP.x)));
 float bay=exp(-2.4*abs(vP.x+11.52))/(1.+.10*pow(vP.z+.8,2.));
 lit+=vec3(1.,.028,.009)*(rails*.18+bay*.23)*uHallMix;
 float bench=1./(1.+1.2*pow(vP.x+10.3,2.)+.40*pow(vP.z+.5,2.));
 float racks=1./(1.+.50*pow(vP.x+7.1,2.)+.65*pow(vP.z+3.8,2.));
 lit+=vec3(1.,.39,.13)*(bench*.075+racks*.045)*uHallMix;
}
float officeMask=commMask(vP);if(officeMask>.001)lit=mix(lit,commLight(c,n,v,vP),officeMask);
// Inset optics and emissive accents stay bright without the chalky plastic response.
lit=mix(lit,c,clamp(uEmit,0.,1.));lit+=c*max(uEmit-1.,0.)*.53;
float fog=clamp((length(uCamera-vP)-7.)/38.,0.,.37);
lit=mix(lit,mix(vec3(.026,.040,.051),vec3(.014,.015,.017),uHallMix),fog*mix(1.,.48,uHallMix));
gl_FragColor=vec4(pow(max(lit,vec3(0.)),vec3(.91)),uAlpha*textureAlpha);
}`;
function compile(type,source){let s=gl.createShader(type);gpuResources.shaders.add(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s}
const prog=gl.createProgram();gl.attachShader(prog,compile(gl.VERTEX_SHADER,vertexSrc));gl.attachShader(prog,compile(gl.FRAGMENT_SHADER,fragSrc));gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);
const loc={};for(let key of ['aPosition','aNormal','aUV'])loc[key]=gl.getAttribLocation(prog,key);for(let key of ['uModel','uVP','uColor','uCamera','uKira','uPart','uTask','uEmit','uMetal','uAlpha','uTexture','uTexOn','uRough','uFinish','uHallMix','uDetail','uEntryMix','uShadowOn','uShadowVP','uShadowMap','uLabFocus','uLabEnvironment','uCommunicationsTime','uPhoneOffice','uPhoneRoomHeight'])loc[key]=gl.getUniformLocation(prog,key);
const M={};M.I=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);M.mul=(a,b)=>{let o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3]}return o};M.T=(x,y,z)=>{let a=M.I();a[12]=x;a[13]=y;a[14]=z;return a};M.S=(x,y,z)=>{let a=M.I();a[0]=x;a[5]=y;a[10]=z;return a};M.X=a=>{let m=M.I(),c=Math.cos(a),s=Math.sin(a);m[5]=c;m[6]=s;m[9]=-s;m[10]=c;return m};M.Y=a=>{let m=M.I(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[2]=-s;m[8]=s;m[10]=c;return m};M.Z=a=>{let m=M.I(),c=Math.cos(a),s=Math.sin(a);m[0]=c;m[1]=s;m[4]=-s;m[5]=c;return m};M.pers=(fov,aspect,near,far)=>{let f=1/Math.tan(fov/2),o=new Float32Array(16);o[0]=f/aspect;o[5]=f;o[10]=(far+near)/(near-far);o[11]=-1;o[14]=2*far*near/(near-far);return o};M.look=(eye,target)=>{let n=(v)=>{let d=Math.hypot(...v);return v.map(x=>x/d)},sub=(a,b)=>a.map((x,i)=>x-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],z=n(sub(eye,target)),x=n(cross([0,1,0],z)),y=cross(z,x);let o=M.I();o[0]=x[0];o[4]=x[1];o[8]=x[2];o[1]=y[0];o[5]=y[1];o[9]=y[2];o[2]=z[0];o[6]=z[1];o[10]=z[2];o[12]=-x[0]*eye[0]-x[1]*eye[1]-x[2]*eye[2];o[13]=-y[0]*eye[0]-y[1]*eye[1]-y[2]*eye[2];o[14]=-z[0]*eye[0]-z[1]*eye[1]-z[2]*eye[2];return o};
function mesh(pos,nrm,uv,indices){let m={count:indices.length};m.vb=gl.createBuffer();gpuResources.buffers.add(m.vb);gl.bindBuffer(gl.ARRAY_BUFFER,m.vb);let d=new Float32Array(pos.length/3*8);for(let i=0;i<pos.length/3;i++){d.set(pos.slice(i*3,i*3+3),i*8);d.set(nrm.slice(i*3,i*3+3),i*8+3);d.set(uv.slice(i*2,i*2+2),i*8+6)}m.vertices=d;gl.bufferData(gl.ARRAY_BUFFER,d,gl.STATIC_DRAW);m.ib=gl.createBuffer();gpuResources.buffers.add(m.ib);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);m.indices=new Uint16Array(indices);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,m.indices,gl.STATIC_DRAW);return m}
function box(w,h,d,r=0){r=Math.min(r,w*.48,h*.48,d*.48);let P=[],N=[],U=[],I=[];const sides=[[[0,0,d/2],[1,0,0],[0,1,0],w,h],[[0,0,-d/2],[-1,0,0],[0,1,0],w,h],[[w/2,0,0],[0,0,-1],[0,1,0],d,h],[[-w/2,0,0],[0,0,1],[0,1,0],d,h],[[0,h/2,0],[1,0,0],[0,0,-1],w,d],[[0,-h/2,0],[1,0,0],[0,0,1],w,d]];let coords=(v)=>r?[ -v/2,-v/2+r*.23,-v/2+r*.53,-v/2+r,v/2-r,v/2-r*.53,v/2-r*.23,v/2]:[-v/2,v/2];for(let [center,u,v,sw,sh] of sides){let xs=coords(sw),ys=coords(sh),start=P.length/3;for(let j=0;j<ys.length;j++)for(let i=0;i<xs.length;i++){let p=center.map((n,k)=>n+u[k]*xs[i]+v[k]*ys[j]);let q=[Math.max(-w/2+r,Math.min(w/2-r,p[0])),Math.max(-h/2+r,Math.min(h/2-r,p[1])),Math.max(-d/2+r,Math.min(d/2-r,p[2]))];let diff=p.map((n,k)=>n-q[k]);let mag=Math.hypot(...diff)||1;let no=r?diff.map(n=>n/mag):[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];P.push(...q.map((n,k)=>n+no[k]*r));N.push(...no);U.push(i/(xs.length-1),j/(ys.length-1));}for(let j=0;j<ys.length-1;j++)for(let i=0;i<xs.length-1;i++){let a=start+j*xs.length+i,b=a+1,c=a+xs.length,e=c+1;I.push(a,b,c,b,e,c)}}return mesh(P,N,U,I)}
function cylinder(rad,height=0.1,steps=32,r2=rad){let p=[],n=[],uv=[],idx=[];for(let i=0;i<=steps;i++){let a=i/steps*Math.PI*2,c=Math.cos(a),s=Math.sin(a);p.push(c*rad,height/2,s*rad,c*r2,-height/2,s*r2);n.push(c,0,s,c,0,s);uv.push(i/steps,1,i/steps,0)}for(let i=0;i<steps;i++){let a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}for(let side of [1,-1]){let start=p.length/3;p.push(0,height/2*side,0);n.push(0,side,0);uv.push(.5,.5);for(let i=0;i<=steps;i++){let a=i/steps*Math.PI*2,c=Math.cos(a),s=Math.sin(a);p.push(c*(side===1?rad:r2),height/2*side,s*(side===1?rad:r2));n.push(0,side,0);uv.push(.5+c*.5,.5+s*.5)}for(let i=0;i<steps;i++){if(side===1)idx.push(start,start+i+2,start+i+1);else idx.push(start,start+i+1,start+i+2)}}return mesh(p,n,uv,idx)}
function torus(R=.3,r=.035,n1=36,n2=10){let p=[],norm=[],uv=[],idx=[];for(let i=0;i<=n1;i++){let a=i/n1*Math.PI*2;for(let j=0;j<=n2;j++){let b=j/n2*Math.PI*2,cb=Math.cos(b),x=(R+r*cb)*Math.cos(a),y=r*Math.sin(b),z=(R+r*cb)*Math.sin(a);p.push(x,y,z);norm.push(cb*Math.cos(a),Math.sin(b),cb*Math.sin(a));uv.push(i/n1,j/n2)}}for(let i=0;i<n1;i++)for(let j=0;j<n2;j++){let a=i*(n2+1)+j,b=a+n2+1;idx.push(a,b,a+1,b,b+1,a+1)}return mesh(p,norm,uv,idx)}
function quad(w,h){return mesh([-w/2,-h/2,0,w/2,-h/2,0,-w/2,h/2,0,w/2,h/2,0],[0,0,1,0,0,1,0,0,1,0,0,1],[0,0,1,0,0,1,1,1],[0,1,2,1,3,2])}
function oval(u){const R=.326,Z=.655,Y=.357,top=2*Z,arc=Math.PI*R,L=2*top+2*arc;let s=((u%1)+1)%1*L;let y,z,dy,dz;if(s<top){z=-Z+s;y=Y+R;dy=0;dz=1}else if((s-=top)<arc){let a=Math.PI/2-s/R;z=Z+R*Math.cos(a);y=Y+R*Math.sin(a);dy=-Math.cos(a);dz=Math.sin(a)}else if((s-=arc)<top){z=Z-s;y=Y-R;dy=0;dz=-1}else{ s-=top;let a=-Math.PI/2-s/R;z=-Z+R*Math.cos(a);y=Y+R*Math.sin(a);dy=-Math.cos(a);dz=Math.sin(a)}return {y,z,angle:Math.atan2(-dy,dz)}}
function trackBand(){let P=[],N=[],U=[],I=[],samples=90,halfX=.185,thick=.085;for(let i=0;i<samples;i++){let a=oval(i/samples),b=oval((i+.001)/samples);let dy=b.y-a.y,dz=b.z-a.z,len=Math.hypot(dy,dz)||1;let oy=dz/len,oz=-dy/len; // outward for top surface
for(let x of [-halfX,halfX])for(let k of [-1,1]){P.push(x,a.y+oy*thick*k,a.z+oz*thick*k);N.push(0,oy*k,oz*k);U.push(i/samples,k>0?1:0)}}
for(let i=0;i<samples;i++){let j=(i+1)%samples,a=i*4,b=j*4;for(let [x,y,xx,yy] of [[0,1,0,1],[2,3,2,3],[0,2,0,2],[1,3,1,3]]){ // using pair indices of adjacent cross-section loops
let A=a+x,B=a+y,C=b+xx,D=b+yy;I.push(A,C,B,B,C,D)}}return mesh(P,N,U,I)}
class Node{constructor(geometry=null,color=[1,1,1],metal=.25,emit=0){this.geometry=geometry;this.color=color;this.metal=metal;this.emit=emit;this.alpha=1;this.texture=null;this.texMode=1;this.rough=.56;this.finish=0;this.p=[0,0,0];this.r=[0,0,0];this.s=[1,1,1];this.children=[]}add(n){this.children.push(n);n.parent=this;return n}set(x,y,z){this.p=[x,y,z];return this}rot(x,y,z){this.r=[x,y,z];return this}sc(x,y,z){this.s=[x,y,z];return this}}
const colors={bone:[.79,.79,.75],boneLit:[.89,.86,.78],edge:[.155,.185,.201],dark:[.060,.075,.084],black:[.016,.023,.029],track:[.073,.079,.081],trackTread:[.106,.109,.109],steel:[.36,.41,.44],red:[.72,.105,.092],redDark:[.32,.068,.061],warm:[1,.59,.34],white:[.9,.94,1],lens:[.03,.24,.29]};
const scene=new Node();function part(parent,geom,color,p=[0,0,0],r=[0,0,0],metal=.25,emit=0){const o=parent.add(new Node(geom,color,metal,emit));o.p=[p[0]||0,p[1]||0,p[2]||0];o.r=[r[0]||0,r[1]||0,r[2]||0];return o}
const C={ivory:[.77,.77,.73],ivoryLight:[.87,.865,.81],charcoal:[.093,.114,.128],graphite:[.16,.188,.207],black:[.025,.034,.041],red:[.77,.145,.123],deepRed:[.38,.075,.070],steel:[.39,.46,.51],silver:[.61,.65,.67],darkSteel:[.20,.26,.28],amber:[1,.55,.24],white:[.91,.94,.91],mint:[.35,.95,.71],darkFloor:[.07,.098,.111],safety:[.83,.51,.18]};
const G={tiny:box(.07,.08,.07,.01),tinyBolt:cylinder(.043,.028,10),medBolt:cylinder(.062,.018,10),baseRing:cylinder(.75,.12,48),wheel:cylinder(.16,.10,24),smallRing:torus(.14,.016,28,8)};
function styled(n,finish=3,rough=.55,metal=.5){n.finish=finish;n.rough=rough;n.metal=metal;return n}
function material(p,geo,col,pos=[0,0,0],rot=[0,0,0],type='graphite',emit=0){let o=part(p,geo,col,pos,rot,0,emit);let map={paint:[1,.52,.42],steel:[4,.32,.85],graphite:[3,.78,.42],rubber:[2,.94,.04],light:[0,.25,.1],glass:[5,.14,.6]};let v=map[type]||map.graphite;styled(o,...v);return o}
function group(parent,pos=[0,0,0]){let o=parent.add(new Node());o.p=pos;return o}
function polygonXZ(w,d,c){let x=w/2,z=d/2;return [[-x+c,-z],[x-c,-z],[x,-z+c],[x,z-c],[x-c,z],[-x+c,z],[-x,z-c],[-x,-z+c]]}
function customMesh(vertices,indices,uvs){const nn=new Float32Array(vertices.length);for(let i=0;i<indices.length;i+=3){const a=indices[i]*3,b=indices[i+1]*3,c=indices[i+2]*3;const ax=vertices[b]-vertices[a],ay=vertices[b+1]-vertices[a+1],az=vertices[b+2]-vertices[a+2],bx=vertices[c]-vertices[a],by=vertices[c+1]-vertices[a+1],bz=vertices[c+2]-vertices[a+2];const n=[ay*bz-az*by,az*bx-ax*bz,ax*by-ay*bx];for(const q of [a,b,c])for(let j=0;j<3;j++)nn[q+j]+=n[j]}const normals=[];for(let i=0;i<nn.length;i+=3){const d=Math.hypot(nn[i],nn[i+1],nn[i+2])||1;normals.push(nn[i]/d,nn[i+1]/d,nn[i+2]/d)}return mesh(vertices,normals,uvs||Array.from({length:vertices.length/3},(_,i)=>[i%2,i%3/2]).flat(),indices)}
function loftY(rings){let pts=[],ind=[],uv=[];rings.forEach((r,k)=>{let base=polygonXZ(r.w,r.d,r.c);base.forEach(([x,z],i)=>{pts.push(x+r.ox,r.y,z+r.oz);uv.push(i/8,k/(rings.length-1))})});for(let k=0;k<rings.length-1;k++)for(let i=0;i<8;i++){let j=(i+1)%8,a=k*8+i,b=k*8+j,c=(k+1)*8+i,d=(k+1)*8+j;ind.push(a,b,c,b,d,c)}for(let i=1;i<7;i++){ind.push(0,i,i+1);const v=(rings.length-1)*8;ind.push(v,v+i+1,v+i)}return customMesh(pts,ind,uv)}
function octBlock(w,h,d,c=.18){return loftY([{y:-h/2,w,d,c,ox:0,oz:0},{y:h/2,w,d,c,ox:0,oz:0}])}
function taperedLink(h,w1,w2,d1,d2){return loftY([{y:.04,w:w1*.88,d:d1*.88,c:.12,ox:0,oz:0},{y:.2,w:w1,d:d1,c:.145,ox:0,oz:0},{y:h*.72,w:w2,d:d2,c:.12,ox:0,oz:0},{y:h-.12,w:w2*.94,d:d2*.94,c:.12,ox:0,oz:0},{y:h,w:w2*.7,d:d2*.7,c:.09,ox:0,oz:0}])}
function orientedTube(parent,a,b,r,col,style='steel'){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz);const p=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];const node=material(parent,cylinder(r,len,10),col,p,[],style);node.r[2]=-Math.atan2(dx,dy);node.r[0]=Math.atan2(dz,Math.hypot(dx,dy));return node}
function bolt(p,x,y,z,rot=[Math.PI/2,0,0]){material(p,G.tinyBolt,C.darkSteel,[x,y,z],rot,'steel')}
function makeLabel(textColor=C.white){return null}
function deck(n){n.finish=6;n.rough=.40;n.metal=.60;return n;}
// Floor / staging base: real geometry with graded slabs, perimeter and machine mounting islands.
const floor=group(scene);deck(material(floor,box(18,.12,11),C.darkFloor,[0,-.16,0],[],'graphite'));material(floor,box(10.4,.20,6.2,.025),C.graphite,[-.15,-.047,0],[],'steel');deck(material(floor,box(10.23,.045,6.02),C.charcoal,[-.15,.06,0],[],'graphite'));
for(let i=-9;i<=9;i++){let x=i*.52-.15;material(floor,box(.012,.006,6.0),C.darkSteel,[x,.086,0],[],'graphite');}for(let i=-6;i<=6;i++){let z=i*.48;material(floor,box(10.1,.006,.012),C.darkSteel,[-.15,.087,z],[],'graphite')}
for(let i=-4;i<=4;i++){const x=-4.05+i*1.02;material(floor,box(.38,.017,.025),C.red,[x,.106,2.95],[],'paint');material(floor,box(.38,.017,.025),C.red,[x,.106,-2.95],[],'paint')}
for(let x of [-4.7,4.45])for(let z of [-2.65,2.65]){material(floor,cylinder(.14,.025,18),C.darkSteel,[x,.10,z],[],'steel');material(floor,cylinder(.055,.03,12),C.graphite,[x,.121,z],[],'steel')}
// Robot pedestal, tapered motor towers and joint assemblies.
const ROBOT_X=-2.1,ROBOT_Z=-.25;
const robot=group(scene,[ROBOT_X,0,ROBOT_Z]);
material(robot,octBlock(1.73,.25,1.58,.23),C.darkSteel,[0,.23,0],[],'graphite');material(robot,octBlock(1.59,.12,1.47,.22),C.ivory,[0,.43,0],[],'paint');material(robot,octBlock(1.17,.5,1.02,.18),C.graphite,[0,.70,0],[],'graphite');
material(robot,cylinder(.65,.13,50),C.darkSteel,[0,.97,0],[],'steel');material(robot,torus(.585,.033,48,9),C.red,[0,1.05,0],[],'paint',.14);material(robot,cylinder(.5,.21,44),C.charcoal,[0,1.085,0],[],'graphite');
for(let x of [-.64,.64])for(let z of [-.56,.56]){material(robot,cylinder(.075,.032,12),C.steel,[x,.38,z],[],'steel');material(robot,cylinder(.029,.036,10),C.black,[x,.402,z],[],'graphite')}
for(let x of [-.56,.56]){material(robot,box(.075,.23,.6,.013),C.red,[x,.69,.1],[],'paint')}
// Rotating A1 base, shoulder and the jointed upper arm. All components parented to actual pivots.
const baseYaw=group(robot,[0,1.13,0]);material(baseYaw,octBlock(.91,.29,.86,.12),C.ivory,[0,.08,0],[],'paint');material(baseYaw,octBlock(.71,.35,.69,.14),C.charcoal,[0,.29,0],[],'graphite');
const shoulder=group(baseYaw,[0,.48,0]);
function joint(parent,pos,width,rad,redRing=true){let root=group(parent,pos);material(root,cylinder(rad,width,40),C.darkSteel,[0,0,0],[Math.PI/2,0,0],'steel');for(let sign of [-1,1]){let z=sign*(width*.51);material(root,cylinder(rad*.80,.052,36),C.ivory,[0,0,z],[Math.PI/2,0,0],'paint');material(root,cylinder(rad*.54,.072,32),C.graphite,[0,0,z+sign*.03],[Math.PI/2,0,0],'steel');material(root,cylinder(rad*.27,.08,32),C.red,[0,0,z+sign*.076],[Math.PI/2,0,0],'paint');if(redRing)material(root,torus(rad*.65,.025,36,8),C.red,[0,0,z+sign*.06],[Math.PI/2,0,0],'paint',.08);for(let k=0;k<6;k++){const a=k*Math.PI/3;bolt(root,Math.sin(a)*rad*.67,Math.cos(a)*rad*.67,z+sign*.077)}}return root}
const SH=1.50,EL=1.41;const shoulderJoint=joint(shoulder,[0,0,0],.8,.43);
const linkA=group(shoulder);material(linkA,taperedLink(SH,.68,.50,.60,.46),C.charcoal,[0,0,0],[],'graphite');
for(let zz of [-.29,.29]){material(linkA,taperedLink(SH-.27,.47,.30,.085,.07),C.ivory,[0,.14,zz],[],'paint');material(linkA,box(.17,.69,.024,.015),C.red,[0,.74,zz+(zz>0?.056:-.056)],[],'paint')}
for(let side of [-1,1]){for(let i=0;i<5;i++)material(linkA,box(.05,.075,.035,.008),C.darkSteel,[side*.335,.49+i*.145,.02],[],'steel');}
// Arm service cables, conduit and metallic grips that remain aligned with moving links.
const ca=[[-.30,.10,-.34],[-.38,.27,-.37],[-.4,.52,-.35],[-.33,.79,-.31],[-.32,1.08,-.28],[-.25,1.39,-.20]];for(let k=0;k<ca.length-1;k++)orientedTube(linkA,ca[k],ca[k+1],.042,C.black,'rubber');for(let k=1;k<ca.length-1;k++)material(linkA,torus(.054,.012,16,6),C.steel,ca[k],[Math.PI/2,0,0],'steel');
const elbow=group(linkA,[0,SH,0]);joint(elbow,[0,0,0],.70,.37);const linkB=group(elbow);
material(linkB,taperedLink(EL,.52,.33,.48,.34),C.graphite,[0,0,0],[],'graphite');
for(let zz of [-.235,.235]){material(linkB,taperedLink(EL-.17,.37,.22,.073,.07),C.ivory,[0,.095,zz],[],'paint');material(linkB,box(.09,.50,.022,.015),C.red,[0,.75,zz+(zz>0?.046:-.046)],[],'paint')}
for(let i=0;i<6;i++)material(linkB,box(.022,.04,.43,.005),C.charcoal,[.23,.31+i*.15,0],[],'graphite');
const cb=[[-.29,.11,-.27],[-.40,.28,-.28],[-.38,.48,-.28],[-.32,.72,-.24],[-.26,1.10,-.21],[-.21,1.39,-.15]];for(let k=0;k<cb.length-1;k++)orientedTube(linkB,cb[k],cb[k+1],.036,C.black,'rubber');
const wrist=group(linkB,[0,EL,0]);joint(wrist,[0,0,0],.58,.275,false);material(wrist,cylinder(.21,.25,32),C.steel,[0,-.23,0],[],'steel');material(wrist,octBlock(.34,.27,.34,.05),C.charcoal,[0,-.45,0],[],'graphite');material(wrist,torus(.19,.022,28,8),C.red,[0,-.51,0],[],'paint',.2);
const toolRoll=group(wrist,[0,-.53,0]);
material(toolRoll,octBlock(.42,.22,.36,.06),C.ivory,[0,-.10,0],[],'paint');
material(toolRoll,box(.79,.12,.28,.025),C.darkSteel,[0,-.24,0],[],'steel');
const fingerL=material(toolRoll,octBlock(.083,.33,.16,.016),C.steel,[-.41,-.41,0],[],'steel');
const fingerR=material(toolRoll,octBlock(.083,.33,.16,.016),C.steel,[.41,-.41,0],[],'steel');
for(const [finger,side] of [[fingerL,1],[fingerR,-1]])material(finger,box(.045,.13,.18,.007),C.black,[side*.0415,-.11,0],[],'rubber');
// Workpiece modules - identical geometry parented to feeder, gripper, stage depending on cycle.
function moduleGeom(parent){const o=group(parent);material(o,octBlock(.54,.10,.43,.07),C.graphite,[0,.02,0],[],'graphite');material(o,octBlock(.44,.085,.33,.042),C.red,[0,.10,0],[],'paint');material(o,box(.25,.018,.16,.005),C.darkSteel,[0,.154,0],[],'steel');for(let x of [-.14,.14])for(let z of [-.08,.08])material(o,cylinder(.034,.015,12),C.silver,[x,.164,z],[],'steel');return o}
const heldModule=moduleGeom(toolRoll);heldModule.p=[0,-.70,0];const feederModule=moduleGeom(scene);const installedModule=moduleGeom(scene);heldModule.visible=false;installedModule.visible=false;
// Modular precision workcell itself. Deep machined plinth, floating ring, secured rotary stage.
const PX=.50,PZ=.0;const plinth=group(scene,[PX,0,PZ]);material(plinth,octBlock(3.7,.19,3.15,.35),C.darkSteel,[0,.21,0],[],'graphite');material(plinth,octBlock(3.58,.11,3.03,.30),C.ivory,[0,.365,0],[],'paint');material(plinth,octBlock(3.18,.26,2.66,.26),C.charcoal,[0,.55,0],[],'graphite');material(plinth,octBlock(3.1,.058,2.55,.25),C.graphite,[0,.69,0],[],'steel');
for(let zz of [-1.2,1.2]){material(plinth,box(2.6,.015,.03),C.red,[0,.73,zz],[],'paint')}
for(let xx of [-1.57,1.57])for(let zz of [-1.1,1.1]){material(plinth,cylinder(.07,.026,16),C.steel,[xx,.415,zz],[],'steel')}
// Rotary precision workholding stage: rings with indexed teeth and 4 clamps.
const platter=group(plinth,[.10,.77,-.12]);material(platter,cylinder(.95,.13,56),C.darkSteel,[0,.02,0],[],'steel');material(platter,torus(.84,.041,54,10),C.red,[0,.104,0],[],'paint',.12);material(platter,cylinder(.76,.055,54),C.silver,[0,.115,0],[],'steel');material(platter,cylinder(.64,.038,48),C.graphite,[0,.156,0],[],'graphite');for(let i=0;i<28;i++){let a=i*Math.PI*2/28;material(platter,box(.09,.018,.045,.008),C.darkSteel,[Math.cos(a)*.91,.105,Math.sin(a)*.91],[0,-a,0],'steel')}
for(let i=0;i<4;i++){const a=Math.PI/4+i*Math.PI/2,ca=Math.cos(a),sa=Math.sin(a);material(platter,box(.25,.10,.13,.012),C.darkSteel,[ca*.53,.22,sa*.53],[0,-a,0],'steel');material(platter,box(.18,.035,.045,.01),C.ivory,[ca*.53,.29,sa*.53],[0,-a,0],'paint');material(platter,box(.08,.024,.045),C.red,[ca*.41,.31,sa*.41],[0,-a,0],'paint')}
// Central carrier + mechanical exhibit: compact sensing/actuator unit with shell and wheels.
scene.children.splice(scene.children.indexOf(installedModule),1);platter.add(installedModule);installedModule.p=[0,.53,0];
const built=group(platter,[0,.23,0]);material(built,octBlock(.79,.15,.68,.10),C.charcoal,[0,.04,0],[],'graphite');material(built,octBlock(.73,.13,.62,.10),C.ivory,[0,.18,0],[],'paint');for(let x of [-.48,.48])for(let z of [-.25,.25]){material(built,cylinder(.15,.13,20),C.black,[x,.12,z],[0,0,Math.PI/2],'rubber');material(built,cylinder(.075,.15,20),C.red,[x+(x>0?.074:-.074),.12,z],[0,0,Math.PI/2],'paint')}
for(let z of [-.28,.28]){material(built,box(.46,.055,.06,.014),C.darkSteel,[0,.28,z],[],'steel')}
for(let x of [-.29,.29])material(built,box(.12,.045,.10,.007),C.mint,[x,.25,.15],[],'light',.45);
// Feeder on the near-left edge of cell.
const feeder=group(plinth,[-1.12,.73,.73]);material(feeder,octBlock(.92,.13,.87,.13),C.darkSteel,[0,.05,0],[],'graphite');material(feeder,octBlock(.84,.038,.80,.12),C.silver,[0,.13,0],[],'steel');for(let x of [-.33,.33])for(let z of [-.32,.32]){material(feeder,box(.07,.16,.07,.01),C.graphite,[x,.16,z],[],'graphite')}
for(let x of [-.28,.28]){material(feeder,box(.15,.018,.028),C.red,[x,.17,.28],[],'paint')}
feederModule.p=[PX-1.12,.995,PZ+.73];
// Rear inspection gantry with optical sensor array and real metal framing.
const gantry=group(plinth,[0,0,-1.25]);for(let x of [-1.36,1.36]){material(gantry,octBlock(.18,2.22,.23,.048),C.darkSteel,[x,1.77,0],[],'steel');material(gantry,octBlock(.23,.22,.27,.06),C.ivory,[x,2.71,0],[],'paint')}
material(gantry,octBlock(3.04,.24,.29,.075),C.ivory,[0,2.84,0],[],'paint');material(gantry,box(2.69,.035,.10),C.red,[0,2.91,.15],[],'paint');material(gantry,box(.63,.16,.37,.05),C.graphite,[.17,2.65,.1],[],'steel');material(gantry,cylinder(.12,.19,26),C.black,[.17,2.55,.33],[Math.PI/2,0,0],'glass');material(gantry,cylinder(.074,.20,26),C.mint,[.17,2.55,.45],[Math.PI/2,0,0],'light',.13);
const gantryLamp=material(gantry,box(.72,.035,.13,.018),C.white,[.17,2.48,.3],[],'light',.65);
// Task luminaires have visible mounts and diffusers above their light pools.
const taskLights=[];
for(const x of [-2.9,1.5]){
 const light=group(scene,[x,0,.35]);
 material(light,cylinder(.13,.07,20),C.darkSteel,[0,.14,0],[],'steel');
 orientedTube(light,[0,.17,0],[0,3.55,0],.036,C.darkSteel);
 orientedTube(light,[0,3.55,0],[x<0?.55:-.55,3.72,0],.034,C.steel);
 material(light,box(.76,.12,.32,.04),C.graphite,[x<0?.55:-.55,3.72,0],[],'steel');
 taskLights.push(material(light,box(.66,.018,.25,.02),C.white,[x<0?.55:-.55,3.65,0],[],'light',.88));
}
// Cable duct / control stack and safety bars; engineered visual context, not a separate building.
const terminal=group(plinth,[1.37,.78,.60]);material(terminal,octBlock(.38,.66,.32,.08),C.ivory,[0,.3,0],[],'paint');material(terminal,box(.29,.30,.018,.01),C.black,[0,.46,.171],[],'glass');for(let i=0;i<5;i++)material(terminal,box(.21-i*.025,.016,.01,.005),i===0?C.red:C.mint,[-.02,.55-i*.055,.186],[],'light',.65);
material(terminal,cylinder(.07,.04,18),C.red,[.05,.18,.19],[Math.PI/2,0,0],'paint');
for(let x of [-1.7,1.7]){material(plinth,box(.09,.35,2.1,.015),C.darkSteel,[x,.54,0],[],'steel')}
// Lighting graphics and red emission live inside WebGL, no image overlay on models.
for(let x of [-3.65,-.4,3.2])material(floor,box(.035,.025,4.7),C.red,[x,.116,-.18],[],'paint',.1);
// Perimeter support background guide rails to establish scale.
for(let z of [-2.85,2.85]){material(floor,box(10.1,.08,.055),C.graphite,[-.15,.31,z],[],'steel');for(let x=-4.5;x<4.5;x+=1.1)material(floor,box(.085,.4,.09),C.steel,[x,.20,z],[],'steel')}

// ===========================================================
// MAIN ASSEMBLY HALL — industrial architecture and secondary systems.
// This extends the original precision cell, which remains unchanged.
// Coordinates: entrance at rear (-Z); Kira route in foreground (+Z).
// ===========================================================
const hall=group(scene);
const mat=(g,shape,col,p,r=[],style='steel',e=0)=>material(g,shape,col,p,r,style,e);
const H={wall:[.052,.058,.061],panel:[.115,.125,.13],night:[.021,.041,.054],accent:[.87,.22,.18],gold:[1,.61,.31],cool:[.44,.78,.94],lit:[.88,.93,.96],floor:[.065,.089,.102],shadow:[.027,.047,.060]};
// Long ground slabs and elevated maintenance rims, keeping the active cell unobscured.
deck(mat(hall,box(24,.18,20),H.floor,[0,-.285,-1.2],[],'graphite'));
for(let x of [-11.2,11.2])mat(hall,box(.40,.20,18.1),C.darkSteel,[x,-.08,-1.3],[],'steel');
for(let z of [-9.5,6.3])mat(hall,box(23,.22,.38),C.darkSteel,[0,-.08,z],[],'steel');
for(let x=-10.1;x<=10.1;x+=1.18){mat(hall,box(.020,.010,17),C.darkSteel,[x,-.165,-1.1],[],'graphite')}
for(let z=-9;z<7;z+=1.12){mat(hall,box(21.5,.012,.02),C.darkSteel,[0,-.164,z],[],'graphite')}
// Foreground Kira lane with realistic flush guide lighting and a separate safe pedestrian route.
const kiraLane=group(hall,[0,-.10,4.65]);
deck(mat(kiraLane,box(20.6,.08,2.60,.03),C.charcoal,[0,0,0],[],'graphite'));
for(let dz of [-1.23,1.23])mat(kiraLane,box(20.0,.022,.045),C.red,[0,.061,dz],[],'paint',.14);
for(let k=0;k<24;k++){let x=-9.5+k*.82;mat(kiraLane,box(.36,.013,.038),C.silver,[x,.059,-.95],[],'steel');mat(kiraLane,box(.25,.014,.035),C.mint,[x,.060,1.10],[],'light',.27)}
// Tall load-bearing columns and visible base shoes.
const pillars=[];
for(let z of [-8.5,-3.55,2.05])for(let x of [-10.35,10.35]){
 // The two front left structural bays move outward for the engineer bay.
 // The rear support beside the servers and the rear wall retain their datums.
 const supportX=x<0&&z!==-8.5?-13.20:x;
 const root=group(hall,[supportX,0,z]);pillars.push(root);
 mat(root,octBlock(.84,.52,.84,.12),C.darkSteel,[0,.17,0],[],'steel');
 mat(root,box(.55,7.2,.58,.06),C.graphite,[0,3.9,0],[],'steel');
 mat(root,box(.35,6.6,.07),H.panel,[0,3.9,.325],[],'paint');
 mat(root,box(.055,6.3,.095),C.red,[.23,3.9,.36],[],'paint');
 mat(root,box(.91,.29,.90,.08),C.darkSteel,[0,7.45,0],[],'steel');
 for(let yy of [1.15,3.1,5.4]){mat(root,box(.68,.11,.66,.025),C.darkSteel,[0,yy,0],[],'steel')}
}
const conveyorCutawayPillars=pillars.filter(node=>node.p[0]>0&&node.p[2]!==-8.5);
// Cross-bracing overhead trusses with cable trays and suspended luminaire strips.
for(let z of [-8.5,-3.55,2.05]){
 const extend=z!==-8.5?2.85:0;
 mat(hall,box(21.2+extend,.30,.51),C.darkSteel,[-extend/2,7.46,z],[],'steel');
 mat(hall,box(21.0+extend,.11,.27),H.panel,[-extend/2,7.74,z],[],'paint');
 for(let x=-8.5;x<=8.6;x+=3.3){
   mat(hall,box(.22,1.18,.28),C.steel,[x,6.80,z],[],'steel');
   mat(hall,box(1.5,.09,.42),H.panel,[x,6.30,z],[],'paint');
   mat(hall,box(1.31,.022,.34),C.white,[x,6.244,z],[],'light',.58);
 }
}
for(let x of [-9.8,9.8]){
 mat(hall,box(.32,.30,17.0),C.darkSteel,[x,7.44,-1.6],[],'steel');
 for(let z=-7.6;z<5.2;z+=2.3)mat(hall,box(.40,.19,.17),H.panel,[x,7.60,z],[],'paint');
}
// Rear wall, textured panel ribs, grilles and windows overlooking additional machinery.
const rearHallWall=group(hall);for(const x of [-6.67,6.67])mat(rearHallWall,box(9.16,8.45,.35),H.wall,[x,4.05,-9.75],[],'graphite');mat(rearHallWall,box(4.18,3.75,.35),H.wall,[0,6.40,-9.75],[],'graphite');
for(let x=-10.4;x<10.6;x+=1.8){
 if(Math.abs(x)<2.1)continue;
 mat(hall,box(.08,7.9,.12),C.darkSteel,[x,4,-9.45],[],'steel');
 mat(hall,box(1.4,.035,.035),C.steel,[x+.65,6.5,-9.53],[],'steel');
}
// Permanent return enclosure: the west bay previously opened into empty space
// when viewed from the conveyor. These walls stay in the overview as well.
const returnEnclosure=group(hall);
const westHallWall=mat(returnEnclosure,box(.22,8.45,15.95),H.wall,[-13.55,4.05,-1.65],[],'graphite');
mat(returnEnclosure,box(2.45,8.45,.35),H.wall,[-12.325,4.05,-9.75],[],'graphite');
deck(mat(returnEnclosure,box(1.95,.18,16.0),H.floor,[-12.675,-.285,-1.65],[],'graphite'));
for(let z=-8.5;z<6.3;z+=2.1)mat(returnEnclosure,box(.055,7.9,.09),C.darkSteel,[-13.395,4,z],[],'steel');
for(const y of [.45,3.1,6.6])mat(returnEnclosure,box(.065,.08,15.9),C.darkSteel,[-13.38,y,-1.65],[],'steel');
for(const z of [-8.45,5.7])mat(returnEnclosure,box(.025,5.6,.025),C.red,[-13.345,3.7,z],[],'light',.35);
for(const z of [-5.4,1])mat(returnEnclosure,box(.10,.06,1.1),C.white,[-13.24,6.05,z],[],'light',.8);
// Two high glazed observation windows, steel mulls and illuminated interiors.
for(let x of [-6.5,6.4]){
 mat(hall,box(5.0,2.7,.095),C.darkSteel,[x,4.9,-9.49],[],'steel');
 mat(hall,box(4.68,2.4,.104),[.022,.029,.033],[x,4.9,-9.43],[],'glass');
 for(let dx of [-2.38,0,2.38])mat(hall,box(.07,2.55,.16),C.steel,[x+dx,4.9,-9.30],[],'steel');
 mat(hall,box(4.9,.085,.18),H.panel,[x,6.23,-9.30],[],'paint');
 for(let i=0;i<4;i++)mat(hall,box(.55,.022,.035),C.cool||H.cool,[x-1.7+i*1.04,5.82,-9.25],[],'light',.3);
}
// Rear loading/transfer portal - doubles as route toward next portfolio section.
const portal=group(hall,[0,0,-9.33]);
for(const x of [-2.10,2.10])mat(portal,box(.25,5.2,.42),C.darkSteel,[x,2.58,0],[],'steel');mat(portal,box(3.95,.55,.42),C.darkSteel,[0,4.91,0],[],'steel');
for(let x of [-2.17,2.17]){
 mat(portal,box(.25,5.14,.46),H.panel,[x,2.6,.17],[],'paint');
 mat(portal,box(.07,4.23,.49),C.red,[x*.89,2.27,.24],[],'light',.28);
}
mat(portal,box(4.45,.30,.52),H.panel,[0,5.09,.17],[],'paint');
mat(portal,box(2.56,.075,.08),C.mint,[0,4.73,.324],[],'light',.75);
const doorLeft=group(portal,[-.94,2.19,.30]);
const doorRight=group(portal,[.94,2.19,.30]);
for(let side of [-1,1]){
 const door=side===-1?doorLeft:doorRight;
 mat(door,box(1.79,3.78,.19,.035),C.graphite,[0,0,0],[],'steel');
 mat(door,box(1.50,3.22,.06,.015),C.darkSteel,[0,.02,.113],[],'graphite');
 for(let y of [-1.2,-.55,.1,.75,1.4])mat(door,box(1.41,.075,.034),C.steel,[0,y,.168],[],'steel');
 mat(door,box(.08,3.35,.06),C.red,[side<0?.66:-.66,0,.171],[],'paint',.1);
}
// Gantry crane high above the cell; detailed hoist and cable arrangement.
const crane=group(hall);
for(let x of [-8.1,8.1])mat(crane,box(.30,.30,12.8),C.ivory,[x,6.9,-2.85],[],'steel');
const crossGantry=group(crane,[0,0,-4.15]);
mat(crossGantry,box(16.6,.58,.65),H.panel,[0,6.68,0],[],'paint');
mat(crossGantry,box(16.1,.18,.42),C.ivory,[0,6.98,0],[],'steel');
for(let x of [-7.55,7.55])for(let z of [-.18,.18])mat(crossGantry,cylinder(.18,.21,16),C.darkSteel,[x,6.40,z],[Math.PI/2,0,0],'steel');
const trolley=group(crossGantry,[3.0,0,0]);
mat(trolley,octBlock(1.25,.48,.95,.14),C.darkSteel,[0,6.36,0],[],'steel');
mat(trolley,octBlock(.94,.24,.75,.1),C.ivory,[0,6.04,0],[],'paint');
for(let side of [-.34,.34])mat(trolley,box(.06,1.12,.06),C.black,[side,5.43,0],[],'rubber');
const hook=group(trolley,[0,4.85,0]);
mat(hook,cylinder(.18,.23,24),C.steel,[0,0,0],[],'steel');
mat(hook,torus(.23,.052,24,8),C.gold||H.gold,[0,-.24,0],[0,0,Math.PI/2],'steel');
// Central conveyor lane: modular frame, metal rollers, rubberized drive bed, physical packages.
const conveyor=group(hall,[6.43,0,-1.27]);
mat(conveyor,octBlock(2.45,.20,8.95,.16),C.darkSteel,[0,.54,0],[],'steel');
mat(conveyor,octBlock(2.22,.13,8.74,.12),C.ivory,[0,.66,0],[],'paint');
mat(conveyor,box(1.65,.065,8.3,.028),C.charcoal,[0,.76,0],[],'rubber');
for(let side of [-1.10,1.10]){
 mat(conveyor,box(.11,.42,8.65,.02),C.graphite,[side,.79,0],[],'steel');
 mat(conveyor,box(.055,.043,8.6),C.red,[side,.994,0],[],'paint');
 for(let z of [-3.4,-1.4,.7,2.7]){
  mat(conveyor,box(.14,.61,.26,.013),C.darkSteel,[side,.27,z],[],'steel');
  mat(conveyor,box(.35,.10,.35),C.steel,[side,.08,z],[],'steel');
 }
}
for(let i=0;i<23;i++){
 const z=-4.05+i*.365;
 const roller=group(conveyor,[0,.812,z]);
 mat(roller,cylinder(.075,1.68,12),i%3===0?C.silver:C.darkSteel,[0,0,0],[0,0,Math.PI/2],'steel');
 mat(roller,box(1.55,.012,.022),C.charcoal,[0,.074,0],[],'rubber');
 roller._roller=true;
}
const convPacks=[];
for(let i=0;i<4;i++){
 const pkg=group(conveyor,[0,.92,-2.5+i*1.8]);
 mat(pkg,octBlock(.86,.26,.80,.12),C.graphite,[0,.12,0],[],'graphite');
 mat(pkg,octBlock(.65,.12,.59,.08),C.ivory,[0,.31,0],[],'paint');
 mat(pkg,box(.40,.022,.43,.01),C.red,[0,.385,0],[],'paint');
 for(let a of [-.27,.27])mat(pkg,box(.045,.12,.04),C.mint,[a,.39,.20],[],'light',.35);
 convPacks.push(pkg);
}
// V21 — One physically traceable workpiece, not four unrelated package loops.
// The existing rollers/rails stay intact. The shared factory clock owns this part.
for(const packageNode of convPacks)packageNode.visible=false;
// Standard gripping faces and a common carrier make three variants compatible with one process.
const workpiece=group(scene),workpieceVariants=[];
for(let type=0;type<3;type++){
 const variant=moduleGeom(workpiece);workpieceVariants.push(variant);
 if(type===0){
  mat(variant,cylinder(.065,.065,20),C.black,[0,.198,0],[],'glass');
  mat(variant,cylinder(.041,.015,20),C.lens||C.mint,[0,.237,0],[],'glass');
 }else if(type===1){
  mat(variant,octBlock(.31,.10,.23,.035),C.ivory,[0,.21,0],[],'paint');
  for(let i=-1;i<=1;i++)mat(variant,box(.16,.012,.02),C.darkSteel,[0,.266,i*.05],[],'steel');
 }else{
  for(const x of [-.08,.08])mat(variant,box(.05,.12,.13,.008),C.silver,[x,.221,0],[],'steel');
  mat(variant,cylinder(.036,.04,16),C.black,[0,.20,.1],[Math.PI/2,0,0],'rubber');
 }
 variant.visible=type===0;
}
const productionStation=createProductionStation({scene,workpiece,group,mat,box,quad,cylinder,C,gl,createTexture});
const shuttle=group(scene,[6.43,.7845,3.5]);
const shuttleBogie=group(scene,[6.43,.7845,3.5]);
mat(shuttleBogie,box(.91,.055,.82,.02),C.darkSteel,[0,-.10,0],[],'steel');
for(const x of [-.27,.27])for(const z of [-.24,.24])mat(shuttleBogie,cylinder(.026,.20,12),C.silver,[x,-.015,z],[],'steel');
mat(shuttle,octBlock(.91,.105,.85,.1),C.darkSteel,[0,.01,0],[],'steel');
mat(shuttle,octBlock(.76,.035,.69,.08),C.silver,[0,.085,0],[],'steel');
for(const dx of [-.29,.29])for(const dz of [-.46,.46])mat(shuttleBogie,cylinder(.065,.055,14),C.graphite,[dx,-.015,dz],[Math.PI/2,0,0],'steel');
for(const dx of [-.46,.46])for(const dz of [-.28,.28])mat(shuttleBogie,cylinder(.065,.055,14),C.graphite,[dx,-.015,dz],[0,0,Math.PI/2],'steel');
const transferRails=group(scene);
// The cross slide clears the conveyor nose and skirts the cell's safety fence.
for(const z of [3.04,3.96])mat(transferRails,box(7.72,.055,.055,.01),C.darkSteel,[2.9,.677,z],[],'steel');
for(const x of [-1.08,-.16])mat(transferRails,box(.055,.055,2.78,.01),C.darkSteel,[x,.677,2.11],[],'steel');
for(const x of [-.7,1.1,3.0,5.1,6.5])mat(transferRails,box(.13,.607,.13,.012),C.darkSteel,[x,.3465,3.5],[],'steel');
for(const z of [1.05,2.1])for(const x of [-1.08,-.16])mat(transferRails,box(.10,.607,.10,.012),C.darkSteel,[x,.3465,z],[],'steel');
const laneMotor=group(transferRails,[6.85,.55,4.18]);
mat(laneMotor,octBlock(.33,.28,.30,.065),C.graphite,[0,0,0],[],'steel');
mat(laneMotor,cylinder(.12,.10,16),C.red,[0,.05,.19],[Math.PI/2,0,0],'paint');
// A short supported nose bridges the last roller to the lift-and-cross carrier.
mat(scene,box(1.65,.06,.48,.018),C.darkSteel,[6.43,.82,3.0],[],'steel');
for(const z of [2.96,3.15])mat(scene,cylinder(.065,1.68,12),C.silver,[6.43,.822,z],[0,0,Math.PI/2],'steel');
const conveyorDetector=group(conveyor,[0,1.05,3.62]);
for(const side of [-.86,.86])mat(conveyorDetector,box(.14,.57,.19,.025),C.ivory,[side,.04,0],[],'paint');
mat(conveyorDetector,box(1.84,.09,.22),C.darkSteel,[0,.35,0],[],'steel');
const detectionLamp=mat(conveyorDetector,box(.28,.035,.13,.01),C.mint,[0,.29,.09],[],'light',.13);
for(const side of [-.78,.78])mat(conveyorDetector,cylinder(.04,.03,16),C.red,[side,-.12,0],[0,0,Math.PI/2],'glass',.6);
const outputDock=group(scene,[3.42,0,-4.9]);
mat(outputDock,octBlock(1.3,.16,1.8,.12),C.graphite,[0,1.11,0],[],'steel');
for(const x of [-.59,.59])mat(outputDock,box(.10,1.30,1.9,.025),C.ivory,[x,1.15,0],[],'paint');
mat(outputDock,box(1.28,.14,1.9,.025),C.graphite,[0,1.85,0],[],'steel');
mat(outputDock,box(1.2,1.3,.13,.02),C.darkSteel,[0,1.15,-.9],[],'steel');
mat(outputDock,box(1.06,.22,.08),C.charcoal,[0,1.67,-.55],[],'rubber');
for(const x of [-.48,.48])for(const z of [-.65,.65])mat(outputDock,box(.10,1.04,.10),C.darkSteel,[x,.53,z],[],'steel');
const outputGate=group(outputDock,[0,1.54,.91]);
for(const x of [-.62,.62])mat(outputDock,box(.075,1.95,.09),C.darkSteel,[x,1.92,.94],[],'steel');
mat(outputDock,box(1.34,.09,.13),C.graphite,[0,2.92,.94],[],'steel');
mat(outputGate,box(1.10,.78,.075,.018),C.darkSteel,[0,0,0],[],'steel');
for(let i=-2;i<=2;i++)mat(outputGate,box(1.02,.025,.025),C.graphite,[0,i*.13,.05],[],'steel');
const qualityBeacon=mat(outputDock,box(.22,.045,.06),C.mint,[0,1.92,.75],[],'light',.12);
// Supported output rails pass to the RIGHT of the inspection gantry upright.
for(const z of [-.46,.22])orientedTube(scene,[.6,1.13,z],[3.42,1.13,z],.034,C.darkSteel);
for(const x of [3.08,3.76])orientedTube(scene,[x,1.13,-.12],[x,1.13,-5.55],.034,C.darkSteel);
for(const z of [-1.6,-3.3])for(const x of [3.08,3.76])mat(scene,box(.10,1.02,.10),C.darkSteel,[x,.56,z],[],'steel');
const outputCarrier=group(scene,[.6,1.22,-.12]);
mat(outputCarrier,octBlock(.77,.07,.68,.08),C.graphite,[0,0,0],[],'steel');
for(const dx of [-.27,.27])mat(outputCarrier,box(.056,.04,.45),C.silver,[dx,.04,0],[],'steel');
// The input magazine hides replenishment at the rear of the retained conveyor.
const inputHood=group(scene,[6.43,0,-5.45]);
for(const x of [-.98,.98])mat(inputHood,box(.10,1.15,1.2,.03),C.graphite,[x,1.28,0],[],'steel');
mat(inputHood,box(2.05,.12,1.2,.03),C.ivory,[0,1.86,0],[],'paint');
mat(inputHood,box(2.05,1.12,.08),C.darkSteel,[0,1.28,-.58],[],'steel');
const inputGate=group(inputHood,[0,1.39,.58]);
for(const x of [-.95,.95])mat(inputHood,box(.065,2.15,.08),C.darkSteel,[x,2.0,.60],[],'steel');
mat(inputGate,box(1.78,1.02,.065,.018),C.graphite,[0,0,0],[],'steel');
mat(inputGate,box(1.6,.045,.03),C.red,[0,-.38,.045],[],'paint');
feederModule.visible=false;heldModule.visible=false;installedModule.visible=false;
// The retained detailed exhibit serves as the rotary alignment/inspection fixture.
built.p[1]=.17;
const clampNodes=[];
for(let i=0;i<4;i++){
 const a=Math.PI/4+i*Math.PI/2;
 const n=mat(platter,box(.13,.08,.11,.012),C.ivory,[Math.cos(a)*.44,.51,Math.sin(a)*.44],[0,-a,0],'paint');
 clampNodes.push({node:n,angle:a});
}
const scanBar=mat(platter,box(.64,.006,.015),C.mint,[0,.82,0],[],'light',.9);scanBar.visible=false;

// Conveyor transfer gantry at far end.
const convBridge=group(hall,[6.43,0,-5.10]);
for(let x of [-1.47,1.47])mat(convBridge,octBlock(.19,2.92,.21,.035),C.graphite,[x,1.76,0],[],'steel');
mat(convBridge,octBlock(3.21,.27,.48,.08),C.ivory,[0,3.15,0],[],'paint');
mat(convBridge,box(2.4,.045,.10),C.mint,[0,2.96,.22],[],'light',.55);
mat(convBridge,cylinder(.18,.32,20),C.black,[0,2.82,.20],[Math.PI/2,0,0],'glass');
// Hydraulic equipment cabinets and maintenance stations to imply a working factory.
for(let j=0;j<3;j++){
 let x=-8.58+j*1.53,z=-4.8+j*.7;
 let c=group(hall,[x,0,z]);
 mat(c,octBlock(1.18,1.60,.90,.13),j===1?C.ivory:C.graphite,[0,.86,0],[],'paint');
 mat(c,box(.72,.48,.06,.01),C.black,[0,1.20,.47],[],'glass');
 for(let i=0;i<3;i++)mat(c,box(.42,.025,.035),i===0?C.red:C.mint,[0,1.37-i*.10,.507],[],'light',.22);
 for(let i=0;i<5;i++)mat(c,box(.6,.025,.035),C.darkSteel,[0,.62+i*.058,.50],[],'steel');
 mat(c,box(.86,.055,.08),C.steel,[0,.10,.47],[],'steel');
}
// V21 — Existing three cabinet positions become the intelligence station.
// Their painted housings remain: rack inserts and a synchronized digital-twin display
// make the left-hand zone functional rather than decorative.
const serverDisplays=[],serverDots=[];
for(let j=0;j<3;j++){
 const x=-8.58+j*1.53,z=-4.8+j*.7;
 const g=group(hall,[x,0,z]);
 mat(g,box(.94,1.35,.055,.02),C.black,[0,.91,.509],[],'graphite');
 for(let k=0;k<6;k++){
  mat(g,box(.70,.115,.071,.008),k===3?C.graphite:C.darkSteel,[0,.46+k*.17,.555],[],'steel');
  const led=mat(g,box(.045,.045,.012),C.mint,[.27,.46+k*.17,.601],[],'light',.15);
  serverDots.push({node:led,bank:j,slot:k});
 }
}
const monitoring=group(hall,[-7.02,3.48,-3.30]);
mat(monitoring,octBlock(4.65,1.98,.19,.15),C.darkSteel,[0,0,0],[],'steel');
mat(monitoring,box(4.43,1.77,.035,.025),C.black,[0,.01,.108],[],'glass');
for(const xx of [-2.23,2.23])mat(monitoring,box(.045,1.71,.035),C.steel,[xx,.01,.147],[],'steel');
mat(monitoring,box(3.75,.05,.06),C.red,[0,.84,.11],[],'paint',.12);
for(const x of [-2.20,2.20])for(const y of [-.88,.88]){
 mat(monitoring,cylinder(.037,.024,12),C.steel,[x,y,.133],[Math.PI/2,0,0],'steel');
 mat(monitoring,box(.16,.022,.026),C.red,[x-Math.sign(x)*.09,y-Math.sign(y)*.06,.15],[0,0,Math.sign(x*y)*.72],'paint');
}
for(const y of [-.94,.94])mat(monitoring,box(.60,.025,.028),[1,.72,.47],[0,y,.128],[],'light',1.2);
const twinPanel=part(monitoring,quad(4.27,1.66),C.white,[0,.01,.139],[],0,.86);
const twinCanvas=document.createElement('canvas');twinCanvas.width=canvas.clientWidth<800?1024:1536;twinCanvas.height=Math.round(twinCanvas.width/2.56);
const twinCtx=twinCanvas.getContext('2d');
const twinTex=createTexture();gl.bindTexture(gl.TEXTURE_2D,twinTex);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,twinCanvas);
twinPanel.texture=twinTex;twinPanel.texMode=1;
let lastTwinLabel='',lastTwinDraw=0,displayMode='twin',lastTwinJoints=[],lastTwinMatrices=[];
function drawTwin(ms,cycle){
 const interval=factory.camera==='intelligence'?100:320;
 if(ms-lastTwinDraw<interval&&lastTwinLabel===cycle.id+displayMode)return;
 lastTwinLabel=cycle.id+displayMode;lastTwinDraw=ms;lastTwinJoints=[state.base,state.shoulder,state.elbow,state.wrist];
 const frames=[['A1','BASE','BASE',baseYaw,state.base],['A2','SHOULDER','A1',shoulder,state.shoulder],['A3','ELBOW','A2',elbow,state.elbow],['A4','WRIST','A3',wrist,state.wrist],['A5','TOOL ROLL','A4',toolRoll,-state.base]];
 lastTwinMatrices=frames.map(([code,name,parent,node,angle],i)=>({code,name,parent,angle,expression:'Ty('+node.p[1].toFixed(2)+') · R'+(i===0||i===4?'y':'z')+'(q'+(i+1)+')',matrix:Array.from(nodeMatrix(node))}));
 drawWorkshopMonitor(twinCtx,{mode:displayMode,cycle,joints:lastTwinMatrices,points:{base:worldPoint(robot),pivots:frames.map(f=>worldPoint(f[3])),tool:toolWorld(),fingers:[worldPoint(fingerL,[0,-.10,0]),worldPoint(fingerR,[0,-.10,0])]}});
 if(factory.camera==='intelligence'&&jointDetails.open)updateJointReadout();
 gl.bindTexture(gl.TEXTURE_2D,twinTex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 gl.texSubImage2D(gl.TEXTURE_2D,0,0,0,gl.RGBA,gl.UNSIGNED_BYTE,twinCanvas);
}
// Luminaire and supports belong to the computing station, above the retained three cabinets.
for(const x of [-8.5,-5.5]){
 mat(hall,box(.055,1.12,.055),C.darkSteel,[x,4.88,-3.7],[],'steel');
 mat(hall,box(1.0,.11,.34,.025),C.graphite,[x,4.35,-3.7],[],'steel');
 mat(hall,box(.88,.018,.26,.012),C.white,[x,4.285,-3.7],[],'light',.72);
}

// Foreground safety barriers; leave an open passage for Kira near +X.
for(let z of [2.84]){
 for(let x of [-4.65,-2.95,-1.25,1.95]){
  mat(hall,box(.085,.89,.09),C.steel,[x,.49,z],[],'steel');
  mat(hall,box(.10,.13,.13),C.safety,[x,.90,z],[],'paint');
 }
 for(let x of [-4.65,-2.95,1.95])mat(hall,box(1.52,.067,.065),C.ivory,[x+.77,.83,z],[],'steel');
}
// Visible ceiling ductwork / service conduits above back wall.
for(let z of [-7.8,-6.6]){
 mat(hall,box(17,.42,.50),C.darkSteel,[0,7.08,z],[],'steel');
 for(let x=-7.6;x<7.6;x+=1.5)mat(hall,box(.21,.50,.56),C.steel,[x,7.05,z],[],'steel');
}
// Portfolio signboards as textured geometry, not HTML pasted over the scene.
function signTex(lines,accent='#f17769'){
 const cv=document.createElement('canvas');cv.width=1024;cv.height=256;
 const c=cv.getContext('2d');c.fillStyle='#101316';c.fillRect(0,0,1024,256);
 c.strokeStyle='#45484a';c.lineWidth=3;c.strokeRect(10,10,1004,236);
 c.fillStyle='#ec3c24';c.fillRect(35,32,7,178);
 c.fillStyle='#a6a8a6';c.font='bold 19px monospace';c.fillText(lines[0],67,64);
 c.fillStyle='#f1ede3';c.font='bold 76px Arial';c.fillText(lines[1],65,153,890);
 c.fillStyle='#c6c3b9';c.font='19px monospace';c.fillText(lines[2],67,209,750);
 c.fillStyle='#ed3921';for(let i=0;i<4;i++){const x=825+i*35;c.beginPath();c.moveTo(x,194);c.lineTo(x+22,194);c.lineTo(x+7,221);c.lineTo(x-15,221);c.fill();}
 const tex=createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);gl.generateMipmap(gl.TEXTURE_2D);return tex;
}
function sign(g,pos,scale,lines){
 mat(g,box(scale[0]+.14,scale[1]+.14,.10),C.steel,pos,[],'steel');
 const sq=part(g,quad(scale[0],scale[1]),C.white,[pos[0],pos[1],pos[2]+.071],[],0,.85);sq.texture=signTex(lines);sq.texMode=1;return sq;
}
sign(hall,[0,5.85,-9.05],[4.2,1.03],['WORKSHOP SYSTEM / FACILITY 01','ASSEMBLY HALL','AUTOMATION  /  ROBOTICS  /  DESIGN']);
sign(hall,[-8.1,3.00,-7.78],[2.2,.78],['STATION STATUS','A01 / ACTIVE','CELL  /  QUALITY  /  CONTROL']);
sign(hall,[6.55,4.15,-8.92],[2.45,.75],['MATERIAL HANDLING','CONVEYOR / 02','AUTO FEEDER  /  RUNNING']);
// V19: the arrival mark is embedded IN the walkway; there is no raised pedestal
// for Kira to penetrate when he starts his foreground patrol.
const kiraDock=group(hall,[3.52,0,4.65]);
for(let x of [-.68,.68])mat(kiraDock,box(.055,.006,1.02,.002),C.mint,[x,-.059,0],[],'light',.21);
for(let z of [-.47,.47])mat(kiraDock,box(1.25,.006,.034,.002),C.darkSteel,[0,-.057,z],[],'steel');
mat(kiraDock,octBlock(1.23,.24,.20,.05),C.graphite,[0,.06,.61],[],'steel');
for(const x of [-.28,.28])mat(kiraDock,box(.12,.09,.04,.01),C.silver,[x,.11,.49],[],'steel');
const dockLamp=mat(kiraDock,box(.26,.025,.025,.006),C.mint,[0,.16,.49],[],'light',.2);
const kiraBeacons=[];
for(let x of [-3.85,-1.94,.16,2.07]){
 let o=mat(kiraLane,box(.27,.023,.10),C.mint,[x,.078,.53],[],'light',.18);kiraBeacons.push(o);
}
// Above-the-floor maintenance drone track (scenery only, no arbitrary levitation).
for(let z of [-1.0]){
 mat(hall,box(8.7,.11,.10),C.darkSteel,[-.10,5.45,z],[],'steel');
 for(let x of [-3.7,-1.6,.5,2.8])mat(hall,box(.075,.72,.07),C.ivory,[x,5.85,z],[],'steel');
}

// The new observation bay fills only the space opened by the two front bays.
mat(hall,box(3.20,.18,6.00),H.floor,[-12.70,-.285,-.75],[],'graphite');
for(let x=-14.1;x<-10.8;x+=1.18)mat(hall,box(.020,.010,5.9),C.darkSteel,[x,-.165,-.75],[],'graphite');
for(let z=-3.6;z<2.3;z+=1.12)mat(hall,box(3.2,.012,.020),C.darkSteel,[-12.7,-.164,z],[],'graphite');
mat(hall,box(.32,.20,6.0),C.darkSteel,[-14.13,-.08,-.75],[],'steel');
const engineerStation=buildEngineerStation({hall,group,mat,box,cylinder,quad,customMesh,C,createTexture,gl});
// A placement-only height override keeps the original asset and hall pose intact.
const engineerRenderLayout={...engineerStation.layout};
const engineerRenderer=createEngineerRenderer(gl,{M,resources:gpuResources,layout:engineerRenderLayout,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches});
engineerRenderer.load('./engineer-assets/character/sarith-engineer-'+(canvas.clientWidth<800?'mobile':'desktop')+'.glb?v=life-03');
const dressing=buildWorkshopDressing({hall,group,mat,box,cylinder,torus,quad,customMesh,orientedTube,C,layout:engineerStation.layout,createTexture,gl});

const careerLab=buildEngineeringCareerLab({scene,group,mat,box,cylinder,quad,customMesh,C,createTexture,gl});
reparent(careerLab.parts.reception,scene);
let communicationsBuilt=null;
const communications={root:group(scene),kit:{animated:[],live:[]},get laptopScreen(){return communicationsBuilt?.laptopScreen;},kickPendulum(){communicationsBuilt?.pendulum.kick();},getState(){return communicationsBuilt?.getState()||{visible:false,initialized:false};},update(dt,ms,active){
 if(active&&!communicationsBuilt){communicationsBuilt=buildCommunicationsRoom({scene,group,mat,box,cylinder,quad,customMesh,C,createTexture,gl,finishMaps,chair:dressing.chair,doorway:careerLab.parts.reception});reparent(communicationsBuilt.root,this.root);communicationsBuilt.root.visible=true;for(const n of communicationsBuilt.kit.animated)n._animated=true;for(const n of communicationsBuilt.kit.live)liveMaterials.add(n);batchRigidFrame(communicationsBuilt.root);const order=n=>{n.children.sort((a,b)=>Number((a.alpha??1)<.999)-Number((b.alpha??1)<.999));for(const c of n.children)order(c);};order(communicationsBuilt.root);markRenderBranches(scene);}
 this.root.visible=active;communicationsBuilt?.update(dt,ms,active,latestProgress);
}};
// Draw / resource initialization.
const finishMaps={paint:null,red:null,rubber:null,graphite:null,steel:null};
function materialTexture(kind,seed){const size=128,c=document.createElement('canvas');c.width=c.height=size;const ctx=c.getContext('2d'),im=ctx.createImageData(size,size);function rnd(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}for(let i=0;i<size*size;i++){let p=(rnd()-.5),v=kind==='steel'?.95+p*.035:kind==='rubber'?.93+p*.1:.95+p*.07;im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=Math.max(0,Math.min(255,Math.round(v*255)));im.data[i*4+3]=255}ctx.putImageData(im,0,0);const t=createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.generateMipmap(gl.TEXTURE_2D);return t}
for(let [k,seed] of [['paint',1442],['rubber',8674],['graphite',3333],['steel',9922]])finishMaps[k]=materialTexture(k,seed);finishMaps.red=finishMaps.paint;
function applyFinish(node){if(node.geometry){let k=node.finish===1?'paint':node.finish===2?'rubber':node.finish===3?'graphite':node.finish===4?'steel':null;if(k&&node.emit<.48){node.texture=finishMaps[k];node.texMode=2;}}for(let c of node.children)applyFinish(c)}applyFinish(scene);
let bayBlendActive=false;
function draw(node,parent,parentOpacity=1){if(node.visible===false||node._renderBranch===false)return;const opacity=parentOpacity*(node.alpha??1);if(opacity<=.001)return;let m=M.mul(parent,node._animated?nodeMatrix(node):(node._local||(node._local=nodeMatrix(node))));if(node.geometry&&!node._batched){const transparent=opacity<.999;
if(transparent!==bayBlendActive){bayBlendActive=transparent;if(transparent){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);}else{gl.disable(gl.BLEND);gl.depthMask(true);}}
gl.bindBuffer(gl.ARRAY_BUFFER,node.geometry.vb);gl.vertexAttribPointer(loc.aPosition,3,gl.FLOAT,false,32,0);gl.vertexAttribPointer(loc.aNormal,3,gl.FLOAT,false,32,12);gl.vertexAttribPointer(loc.aUV,2,gl.FLOAT,false,32,24);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,node.geometry.ib);gl.uniformMatrix4fv(loc.uModel,false,m);gl.uniform3fv(loc.uColor,node.color);gl.uniform1f(loc.uMetal,node.metal);gl.uniform1f(loc.uRough,node.rough);gl.uniform1f(loc.uFinish,node.finish);gl.uniform1f(loc.uEmit,node.emit);gl.uniform1f(loc.uAlpha,opacity);gl.uniform1f(loc.uTexOn,node.texture?(node.texMode||1):0);if(node.texture){gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,node.texture);gl.uniform1i(loc.uTexture,0)}gl.drawElements(gl.TRIANGLES,node.geometry.count,gl.UNSIGNED_SHORT,0);renderMetrics.drawCalls++}for(let ch of node.children)draw(ch,m,opacity)}
// Animation and inverse kinematics use linked real pivots; manually controlled posing remains possible.
const state={yaw:.34,pitch:.33,dist:15.1,wantYaw:.34,wantPitch:.33,wantDist:15.1,camTarget:[-.15,1.30,.5],wCamTarget:[-.15,1.30,.5],speed:1,shoulder:-.40,elbow:1.13,wrist:-.73,base:-.10};

function buildApprovedKira(){
function oval(u){const R=.326,Z=.655,Y=.357,top=2*Z,arc=Math.PI*R,L=2*top+2*arc;let s=((u%1)+1)%1*L;let y,z,dy,dz;if(s<top){z=-Z+s;y=Y+R;dy=0;dz=1}else if((s-=top)<arc){let a=Math.PI/2-s/R;z=Z+R*Math.cos(a);y=Y+R*Math.sin(a);dy=-Math.cos(a);dz=Math.sin(a)}else if((s-=arc)<top){z=Z-s;y=Y-R;dy=0;dz=-1}else{ s-=top;let a=-Math.PI/2-s/R;z=-Z+R*Math.cos(a);y=Y+R*Math.sin(a);dy=-Math.cos(a);dz=Math.sin(a)}return {y,z,angle:Math.atan2(-dy,dz)}}
function trackBand(){let P=[],N=[],U=[],I=[],samples=90,halfX=.185,thick=.085;for(let i=0;i<samples;i++){let a=oval(i/samples),b=oval((i+.001)/samples);let dy=b.y-a.y,dz=b.z-a.z,len=Math.hypot(dy,dz)||1;let oy=dz/len,oz=-dy/len; // outward for top surface
for(let x of [-halfX,halfX])for(let k of [-1,1]){P.push(x,a.y+oy*thick*k,a.z+oz*thick*k);N.push(0,oy*k,oz*k);U.push(i/samples,k>0?1:0)}}
for(let i=0;i<samples;i++){let j=(i+1)%samples,a=i*4,b=j*4;for(let [x,y,xx,yy] of [[0,1,0,1],[2,3,2,3],[0,2,0,2],[1,3,1,3]]){ // using pair indices of adjacent cross-section loops
let A=a+x,B=a+y,C=b+xx,D=b+yy;I.push(A,C,B,B,C,D)}}return mesh(P,N,U,I)}
class Node{constructor(geometry=null,color=[1,1,1],metal=.25,emit=0){this.geometry=geometry;this.color=color;this.metal=metal;this.emit=emit;this.alpha=1;this.texture=null;this.texMode=1;this.rough=.56;this.finish=0;this.p=[0,0,0];this.r=[0,0,0];this.s=[1,1,1];this.children=[]}add(n){this.children.push(n);n.parent=this;return n}set(x,y,z){this.p=[x,y,z];return this}rot(x,y,z){this.r=[x,y,z];return this}sc(x,y,z){this.s=[x,y,z];return this}}
const colors={bone:[.79,.79,.75],boneLit:[.89,.86,.78],edge:[.155,.185,.201],dark:[.060,.075,.084],black:[.016,.023,.029],track:[.073,.079,.081],trackTread:[.106,.109,.109],steel:[.36,.41,.44],red:[.72,.105,.092],redDark:[.32,.068,.061],warm:[1,.59,.34],white:[.9,.94,1],lens:[.03,.24,.29]};

// MK.II geometry pass — bespoke multi-section surfaces, rather than basic box primitives.
// Everything below is procedural, editable, and keeps Kira's original scene hierarchy.
function customMesh(vertices,indices,uvs=null){
 const norms=new Float32Array(vertices.length),p=[],t=[];
 for(let k=0;k<indices.length;k+=3){let a=indices[k]*3,b=indices[k+1]*3,c=indices[k+2]*3;
  let ax=vertices[b]-vertices[a],ay=vertices[b+1]-vertices[a+1],az=vertices[b+2]-vertices[a+2];
  let bx=vertices[c]-vertices[a],by=vertices[c+1]-vertices[a+1],bz=vertices[c+2]-vertices[a+2];
  let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;
  for(let q of [a,b,c]){norms[q]+=nx;norms[q+1]+=ny;norms[q+2]+=nz;}}
 for(let k=0;k<vertices.length;k+=3){let len=Math.hypot(norms[k],norms[k+1],norms[k+2])||1;
  p.push(vertices[k],vertices[k+1],vertices[k+2]);t.push(norms[k]/len,norms[k+1]/len,norms[k+2]/len);}
 let u=uvs||Array.from({length:p.length/3},(_,i)=>[.1+(i%8)/8,.1+(i/8%8)/8]).flat();
 return mesh(p,t,u,indices);
}
function oct(w,h,c=.19,cy=0){let x=w/2,y=h/2;return [[-x+c,cy+y],[x-c,cy+y],[x,cy+y-c],[x,cy-y+c],[x-c,cy-y],[-x+c,cy-y],[-x,cy-y+c],[-x,cy+y-c]]}
function roundedContour(w,h,r=.12,cy=0,steps=5){let P=[],x=w/2,y=h/2;for(let [cx,yy,a] of [[x-r,y-r,Math.PI/2],[x-r,-y+r,0],[-x+r,-y+r,-Math.PI/2],[-x+r,y-r,-Math.PI]]){for(let i=0;i<=steps;i++){let t=a-Math.PI/2*(i/steps);P.push([cx+Math.cos(t)*r,cy+yy+Math.sin(t)*r]);}}return P}
function loftZ(rings){const N=rings[0].pts.length,V=[],I=[],UV=[];rings.forEach((ring,k)=>ring.pts.forEach(([x,y],i)=>{V.push(x,y,ring.z);UV.push(i/N,k/(rings.length-1))}));
 for(let k=0;k<rings.length-1;k++)for(let i=0;i<N;i++){let j=(i+1)%N,a=k*N+i,b=k*N+j,c=(k+1)*N+i,d=(k+1)*N+j;I.push(a,c,b,b,c,d)}
 for(let i=1;i<N-1;i++){I.push(0,i+1,i);let t=(rings.length-1)*N;I.push(t,t+i,t+i+1)}
 return customMesh(V,I,UV)}
function loftOct(rings){return loftZ(rings.map(r=>({z:r[0],pts:oct(r[1],r[2],r[3],r[4]||0)})))}
function sheetXY(poly,z0,z1){return loftZ([{z:z0,pts:poly},{z:z1,pts:poly}])}
function frameContour(outer,inner,zOuter,zInner){const N=outer.length,V=[],UV=[],I=[];
 outer.forEach(([x,y],i)=>{V.push(x,y,zOuter);UV.push(i/N,0)});
 inner.forEach(([x,y],i)=>{V.push(x,y,zInner);UV.push(i/N,1)});
 for(let i=0;i<N;i++){let j=(i+1)%N;I.push(i,j,N+i,j,N+j,N+i)}return customMesh(V,I,UV)}
function yzPrism(poly,x0,x1){let V=[],UV=[],I=[],N=poly.length;for(let x of [x0,x1])poly.forEach(([z,y],i)=>{V.push(x,y,z);UV.push(i/N,x===x0?0:1)});
 for(let i=0;i<N;i++){let j=(i+1)%N;I.push(i,N+i,j,j,N+i,N+j)}for(let i=1;i<N-1;i++){I.push(0,i,i+1,N,N+i+1,N+i)}return customMesh(V,I,UV)}
function strip3D(points,width=.025){let V=[],I=[],UV=[];for(let i=0;i<points.length;i++){let a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],l=Math.hypot(dx,dy)||1,nx=-dy/l*width/2,ny=dx/l*width/2;V.push(points[i][0]+nx,points[i][1]+ny,points[i][2],points[i][0]-nx,points[i][1]-ny,points[i][2]);UV.push(i/points.length,0,i/points.length,1)}for(let i=0;i<points.length-1;i++){let j=i*2;I.push(j,j+2,j+1,j+1,j+2,j+3)}return customMesh(V,I,UV)}
function metalLine(parent,points,col,w=.025,em=.0){return part(parent,strip3D(points,w),col,[0,0,0],[],.7,em)}
const geometry={
  headCore:loftOct([[-.595,1.27,1.04,.25,-.015],[-.49,1.44,1.18,.23,0],[.08,1.55,1.31,.205,0],[.45,1.50,1.24,.20,0],[.52,1.43,1.12,.20,0]]),
  headOuterShell:loftOct([[-.58,1.30,1.07,.26],[ -.46,1.49,1.25,.23],[-.10,1.55,1.31,.22],[.23,1.53,1.28,.22],[.34,1.50,1.23,.21]]),
  frontBumper:loftOct([[.42,1.52,1.21,.19],[.50,1.51,1.16,.195],[.573,1.43,1.06,.18]]),
  faceRim:frameContour(oct(1.39,1.047,.20,.025),oct(1.242,.865,.15,.06),.576,.614),
  screenRim:frameContour(roundedContour(1.25,.868,.16,.06),roundedContour(1.157,.788,.13,.075),.616,.649),
  screen:sheetXY(roundedContour(1.158,.793,.13,.075),.645,.654),
  chinPlate:loftOct([[.525,1.16,.15,.045,-.47],[.585,1.19,.15,.045,-.48],[.641,.43,.155,.042,-.495]]),
  headTop:loftOct([[-.36,1.05,.060,.023,.632],[.23,1.17,.065,.024,.632],[.43,1.08,.047,.018,.622]]),
  torso:loftOct([[-1.0,1.16,.53,.16,.70],[-.78,1.45,.69,.15,.70],[-.04,1.47,.76,.13,.71],[.62,1.40,.70,.145,.68],[.92,1.15,.52,.12,.59]]),
  topCowl:loftOct([[-.89,1.23,.24,.10,1.07],[-.48,1.42,.28,.09,1.095],[.32,1.39,.26,.09,1.095],[.70,1.28,.24,.10,1.028]]),
  nose:loftOct([[.56,1.27,.48,.13,.635],[.79,1.30,.46,.12,.594],[1.035,1.22,.40,.13,.555]]),
  dashboard:loftOct([[.64,1.26,.185,.055,.900],[.95,1.17,.15,.05,.86],[1.035,1.10,.16,.055,.835]]),
  trackBelt:trackBand(),tread:box(.381,.098,.157,.019),wheel:cylinder(.27,.235,32),hub:cylinder(.14,.015,24),tinyHub:cylinder(.079,.018,18),bolt:cylinder(.023,.017,12),ring:torus(.186,.016,36,8),lensRing:torus(.104,.016,32,8),lens:cylinder(.095,.05,28),neck:cylinder(.228,.13,36),neckThin:cylinder(.165,.07,36),neckRing:torus(.205,.021,36,8),headEar:box(.16,.41,.52,.065),stripe:box(.09,.015,.29,.01),topHandle:box(.87,.10,.13,.035),handlePost:box(.12,.2,.16,.03),panel:box(.62,.25,.035,.04),marker:box(.12,.08,.06,.025),floor:box(200,.14,200,.02),floorLine:box(.012,.005,40,0),stage:cylinder(2.62,.14,64),stageLip:torus(2.52,.026,80,8),nut:cylinder(.05,.03,12)
};
const robot=scene.add(new Node());robot.p=[3.52,.22,4.42];robot.s=[.46,.46,.46];
const chassis=robot.add(new Node());
// Custom tapered undertray, metal belly, and fitted shell.
part(chassis,geometry.torso,colors.edge,[0,0,0],[],.62);
part(chassis,loftOct([[-.94,1.15,.19,.12,.87],[-.50,1.34,.24,.11,.905],[.42,1.34,.25,.11,.895],[.73,1.14,.19,.10,.865]]),colors.dark,[0,0,0],[],.60);
part(chassis,geometry.topCowl,colors.bone,[0,0,0],[],.34);
part(chassis,geometry.nose,colors.boneLit,[0,0,0],[],.31);
// Dashboard originally masked the nose; removed so the sculpted ivory cowl remains visible.
// V-shaped forward cowl / tapered red flash, painted into the actual diagonal geometry.
const insignia=yzPrism([[.58,1.148],[.73,.963],[.89,.818],[1.00,.772],[1.00,.801],[.89,.848],[.73,.991],[.58,1.181]],-.054,.054);
part(chassis,insignia,colors.red,[0,0,0],[],.34);
// Main face of the chassis: trapezoidal headlamp housings, recessed lenses, defined splitter.
const lampOutline=oct(.355,.142,.035,.654);
for(let side of [-1,1]){
 const poly=lampOutline.map(([x,y])=>[x+side*.304,y]);
 part(chassis,sheetXY(poly,1.044,1.060),colors.black,[0,0,0],[],.40);
 const inner=oct(.283,.090,.025,.653).map(([x,y])=>[x+side*.304,y]);
 part(chassis,sheetXY(inner,1.064,1.069),colors.warm,[0,0,0],[],0,1.45);
 // hood over the light, integrated in the front armor
 part(chassis,box(.31,.023,.060,.010),colors.edge,[side*.304,.747,1.018],[-.17,0,0],.58);
}
// Lower replaceable skid / splitter with asymmetric inset service grille.
part(chassis,loftOct([[.98,.88,.14,.05,.42],[1.058,.98,.17,.07,.41],[1.103,.85,.10,.045,.425]]),colors.dark,[],[],.56);
part(chassis,sheetXY(oct(.38,.085,.026,.43),1.103,1.116),colors.edge,[],[],.47);
for(let k=0;k<5;k++)part(chassis,box(.042,.035,.011,.007),colors.steel,[-.12+k*.06,.43,1.12],[],.45);
// Contoured upper wings, floating side heatshields, body seams following the geometry.
for(let side of [-1,1]){
 const shellSide=[[ -.72,.90],[-.56,1.11],[.16,1.12],[.58,1.05],[.74,.84],[.23,.79],[-.43,.80]];
 part(chassis,yzPrism(shellSide,side*.70,side*.755),colors.bone,[0,0,0],[],.32);
 const insert=[[-.54,.91],[-.36,.96],[.13,.96],[.38,.903],[.28,.87],[-.43,.87]];
 part(chassis,yzPrism(insert,side*.766,side*.781),colors.edge,[],[],.55);
 for(let k=0;k<5;k++)part(chassis,box(.011,.023,.070,.002),colors.dark,[side*.794,.935,-.34+k*.12],[],.18);
 // engine guard sculpted over track, custom profile instead of a straight block
 part(chassis,yzPrism([[-.97,.93],[-.83,1.075],[.42,1.075],[.79,.90],[.55,.835],[-.75,.835]],side*.655,side*.72),colors.bone,[],[],.36);
 // Rear heat exit, folded into lower flank; fasteners remain on side ONLY.
 for(let i=0;i<3;i++)part(chassis,box(.017,.039,.104,.006),colors.black,[side*.787,.79,-.52+i*.17],[],.24);
 for(let z of [-.58,.49])part(chassis,cylinder(.031,.013,12),colors.steel,[side*.790,.95,z],[0,0,Math.PI/2],.6);
}
// Exposed dual tank drives: segmented belt, recessed drive sprockets, machining details.
const trackData=[];
for(let side of [-1,1]){
 let tg=chassis.add(new Node());tg.p=[side*.785,0,0];let data={group:tg,pieces:[],wheels:[],phase:0,side};trackData.push(data);
 part(tg,geometry.trackBelt,colors.track,[],[],.11);
 // an angular internal subframe with transparent-looking negative space around the hubs
 part(tg,yzPrism([[-.69,.43],[-.54,.57],[.48,.57],[.69,.43],[.57,.25],[-.57,.25]],side*.150,side*.167),colors.dark,[],[],.6);
 for(let z of [-.66,.66]){
  let wheel=part(tg,geometry.wheel,colors.black,[0,.355,z],[0,0,Math.PI/2],.20);data.wheels.push(wheel);
  part(tg,cylinder(.224,.245,30),colors.edge,[0,.355,z],[0,0,Math.PI/2],.55);
  part(tg,cylinder(.152,.028,32),colors.redDark,[side*.156,.355,z],[0,0,Math.PI/2],.52);
  part(tg,geometry.hub,colors.red,[side*.18,.355,z],[0,0,Math.PI/2],.47);
  part(tg,geometry.tinyHub,colors.steel,[side*.199,.355,z],[0,0,Math.PI/2],.82);
  part(tg,torus(.172,.014,32,8),colors.steel,[side*.21,.355,z],[0,0,Math.PI/2],.58);
  for(let k=0;k<5;k++){let a=k*Math.PI*2/5;part(tg,cylinder(.015,.016,10),colors.dark,[side*.213,.355+Math.cos(a)*.106,z+Math.sin(a)*.106],[0,0,Math.PI/2],.46)}
 }
 for(let i=0;i<4;i++)part(tg,cylinder(.124,.23,20),colors.edge,[0,.29,-.40+i*.27],[0,0,Math.PI/2],.55);
 // central stamped-steel suspension arm, two red mounting bosses, upper runner.
 part(tg,yzPrism([[-.43,.43],[-.33,.50],[.35,.50],[.45,.43],[.27,.31],[-.28,.31]],side*.205,side*.222),colors.edge,[],[],.73);
 part(tg,box(.032,.042,.53,.01),colors.steel,[side*.234,.405,0],[],.69);
 for(let z of [-.24,.24])part(tg,cylinder(.054,.033,16),colors.redDark,[side*.245,.399,z],[0,0,Math.PI/2],.45);
 for(let i=0;i<44;i++){let t=part(tg,geometry.tread,colors.track,[],[],.10);data.pieces.push(t)}
}
// Actuated neck with a mechanical turret / yaw bearing and properly distinct tilt stage.
part(chassis,cylinder(.395,.055,40),colors.dark,[0,1.145,-.03],[],.54);
part(chassis,cylinder(.275,.08,40),colors.edge,[0,1.209,-.03],[],.73);
part(chassis,geometry.neckThin,colors.steel,[0,1.282,-.03],[],.78);
part(chassis,geometry.neckRing,colors.red,[0,1.29,-.03],[],.36,.48);
part(chassis,torus(.269,.012,40,8),colors.dark,[0,1.267,-.03],[],.63);
const yawPivot=chassis.add(new Node());yawPivot.p=[0,1.38,-.03];
const tiltPivot=yawPivot.add(new Node());
part(tiltPivot,loftOct([[-.23,.31,.14,.05,.06],[.22,.49,.18,.07,.07]]),colors.edge,[0,0,0],[],.78);
const head=tiltPivot.add(new Node());head.p=[0,.51,.02];
// Head: shaped armored rear taper + deliberate 3-dimensional layered front shell.
part(head,geometry.headCore,colors.edge,[0,0,0],[],.66);
part(head,geometry.headOuterShell,colors.bone,[0,0,-.006],[],.30);
// Forged graphite brow and cheek rim, not a stack of rectangular plates.
part(head,geometry.frontBumper,colors.bone,[0,0,0],[],.32);
part(head,geometry.faceRim,colors.steel,[],[],.73);
part(head,geometry.screenRim,colors.dark,[],[],.51);
const screen=part(head,geometry.screen,colors.black,[],[],.07,.83);screen.texture=null;
// Chin is an integrated armor shape, with separate optical module underneath the display.
part(head,geometry.chinPlate,colors.boneLit,[],[],.29);
part(head,loftOct([[.620,.33,.15,.035,-.50],[.655,.285,.12,.03,-.51]]),colors.edge,[],[],.60);
part(head,cylinder(.101,.055,36),colors.dark,[0,-.50,.677],[Math.PI/2,0,0],.73);
part(head,torus(.104,.015,36,8),colors.steel,[0,-.50,.705],[Math.PI/2,0,0],.84);
part(head,cylinder(.073,.018,36),colors.lens,[0,-.50,.715],[Math.PI/2,0,0],.33,.27);
part(head,cylinder(.031,.02,24),[.24,.51,.63],[.02,-.487,.727],[Math.PI/2,0,0],.33,.44);
// Two separate faceted upper brow panels, side cheek guards, embossed red crown handle.
part(head,geometry.headTop,colors.edge,[],[],.65);
for(let side of [-1,1]){
  const eyeBrow=side===-1?[[-.70,.55],[-.43,.59],[-.15,.61],[-.15,.58],[-.60,.53]]:[[.70,.55],[.43,.59],[.15,.61],[.15,.58],[.60,.53]];
  part(head,sheetXY(eyeBrow,.570,.593),colors.steel,[],[],.67);
  part(head,yzPrism([[-.48,.31],[-.32,.52],[.22,.52],[.40,.33],[.27,-.26],[-.39,-.34]],side*.733,side*.788),colors.bone,[0,0,0],[],.32);
  part(head,yzPrism([[-.51,.26],[-.49,.36],[-.18,.43],[.24,.40],[.32,.27]],side*.789,side*.804),colors.edge,[],[],.66);
  for(let j=0;j<3;j++)part(head,box(.023,.026,.083,.005),colors.dark,[side*.810,-.22+j*.075,-.26],[],.33);
  // side-mounted compact gimbal cap, no visible fasteners on face.
  part(head,cylinder(.191,.05,38),colors.redDark,[side*.823,-.05,-.11],[0,0,Math.PI/2],.57);
  part(head,cylinder(.128,.062,38),colors.edge,[side*.85,-.05,-.11],[0,0,Math.PI/2],.60);
  part(head,torus(.136,.013,40,8),colors.steel,[side*.89,-.05,-.11],[0,0,Math.PI/2],.75);
  // red safety strips applied to planar side armor, away from front.
  for(let j=0;j<3;j++)part(head,box(.017,.108,.043,.008),colors.red,[side*.817,-.32,.015+j*.070],[0,0,.22],.22);
}
// Die-cast rear service hatch and horizontal radiator vents.
part(head,loftOct([[-.611,.85,.52,.14,-.11],[-.592,.89,.58,.13,-.12]]),colors.edge,[],[],.65);
for(let j=0;j<5;j++)part(head,box(.57,.022,.022,.007),colors.dark,[0,-.26+j*.082,-.625],[],.39);
// Rounded squared protective top carry rail with visible stance and shape.
part(head,geometry.topHandle,colors.red,[0,.725,-.12],[],.49);
for(let x of [-.36,.36])part(head,geometry.handlePost,colors.redDark,[x,.625,-.12],[],.62);
// Side marque retains the approved KIRA red-stripe branding.
const labelTexCanvas=document.createElement('canvas');labelTexCanvas.width=256;labelTexCanvas.height=128;
let lc=labelTexCanvas.getContext('2d');lc.fillStyle='#d0d0c4';lc.fillRect(0,0,256,128);lc.fillStyle='#111a20';lc.font='900 59px system-ui';lc.fillText('KIRA',12,82);lc.fillStyle='#cd3f37';lc.fillRect(14,93,70,9);lc.fillRect(95,93,13,9);
let labelTex=createTexture();gl.bindTexture(gl.TEXTURE_2D,labelTex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,labelTexCanvas);
const sideText=part(head,quad(.46,.24),colors.bone,[.816,.22,-.15],[0,Math.PI/2,0],0,.92);sideText.texture=labelTex;
// Subtle ambient contact shadow.

// Actual geometry-driven OLED expressions: two independent eyes, always. No single-eye variant.
function eyeCurve(fn,width=.057,samples=24){let P=[],N=[],UV=[],I=[];for(let i=0;i<=samples;i++){let u=i/samples,x=-.159+.318*u,y=fn(x);let e=.0004,a=fn(x+e)-fn(x-e),len=Math.hypot(a,.0008),nx=-(a/e/2),ny=1,mag=Math.hypot(nx,ny)||1;nx/=mag;ny/=mag;for(let sign of [-1,1]){P.push(x+nx*sign*width*.5,y+ny*sign*width*.5,0);N.push(0,0,1);UV.push(u,(sign+1)/2)}}for(let i=0;i<samples;i++){let j=i*2;I.push(j,j+2,j+1,j+1,j+2,j+3)}return mesh(P,N,UV,I)}
const eyeRoot=head.add(new Node());eyeRoot.p=[0,.145,.677];const eyeSets={};const eyeMaterial=[.93,.98,1.0];
function registerEyes(name,builder){let g=eyeRoot.add(new Node());g.visible=false;eyeSets[name]=g;for(let x of [-.263,.263])builder(g,x)}
registerEyes('neutral',(g,x)=>part(g,box(.134,.27,.016,.056),eyeMaterial,[x,0,0],[],0,1.45));
registerEyes('happy',(g,x)=>part(g,eyeCurve(u=>.084-(u/.159)**2*.14),eyeMaterial,[x,.015,0],[],0,1.65));
registerEyes('curious',(g,x)=>part(g,torus(.103,.025,36,10),eyeMaterial,[x,0,0],[Math.PI/2,0,0],0,1.55));
registerEyes('surprised',(g,x)=>part(g,torus(.13,.029,36,10),eyeMaterial,[x,0,0],[Math.PI/2,0,0],0,1.65));
registerEyes('focused',(g,x)=>part(g,eyeCurve(u=>(x<0?u:-u)*-.44,.048),eyeMaterial,[x,0,0],[],0,1.6));
registerEyes('sleepy',(g,x)=>part(g,box(.29,.042,.012,.019),eyeMaterial,[x,-.028,0],[],0,1.15));

// Real repeatable material textures, generated once from deterministic micro-surface data.
function materialTexture(kind,seed){const size=256,c=document.createElement('canvas');c.width=c.height=size;
 const ctx=c.getContext('2d'),img=ctx.createImageData(size,size);
 function rand(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const k=(y*size+x)*4,p=rand()-.5;
  let v=1,streak=Math.sin((kind==='steel'?y:x)*.82+Math.sin(y*.13)*.5);
  if(kind==='paint')v=.953+p*.105+Math.sin(x*.014+y*.008)*.014;
  if(kind==='red')v=.948+p*.110+Math.sin(x*.010+y*.023)*.012;
  if(kind==='rubber')v=.93+p*.155+Math.sin(x*.17+y*.12)*.018;
  if(kind==='graphite')v=.955+p*.084;
  if(kind==='steel')v=.945+p*.042+streak*.015;
  v=Math.max(.78,Math.min(1.08,v));
  img.data[k]=img.data[k+1]=img.data[k+2]=Math.max(0,Math.min(255,Math.round(255*v)));
  img.data[k+3]=255;
 }
 ctx.putImageData(img,0,0);
 if(kind==='paint'||kind==='red'){
  for(let i=0;i<65;i++){let x=rand()*size,y=rand()*size,len=3+rand()*22;
   ctx.strokeStyle='rgba(40,46,47,'+(0.018+rand()*.045).toFixed(3)+')';ctx.lineWidth=.3+rand()*.55;
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+len,y+len*(rand()*.16-.08));ctx.stroke();}
  for(let i=0;i<50;i++){let x=rand()*size,y=rand()*size;
   ctx.fillStyle='rgba(51,50,47,'+(0.018+rand()*.035).toFixed(3)+')';ctx.fillRect(x,y,.7+rand()*1.5,.5+rand()*1.3);}
 }
 if(kind==='steel'){for(let i=0;i<185;i++){let y=rand()*size,x=rand()*size;ctx.fillStyle='rgba(11,19,23,'+(rand()*.045).toFixed(3)+')';ctx.fillRect(x,y,8+rand()*180,.3+rand()*.4);}}
 if(kind==='rubber'){for(let i=0;i<650;i++){let x=rand()*size,y=rand()*size;ctx.fillStyle='rgba(8,12,15,'+(rand()*.075).toFixed(3)+')';ctx.fillRect(x,y,1+rand()*2,1+rand()*2);}}
 const tex=createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);
 gl.generateMipmap(gl.TEXTURE_2D);
 return tex;
}
const finishes={paint:materialTexture('paint',17218),red:materialTexture('red',11873),rubber:materialTexture('rubber',34712),graphite:materialTexture('graphite',51821),steel:materialTexture('steel',92881)};
function assignFinish(n){
 if(n.texture===null){let k='';
  if(n.color===colors.bone||n.color===colors.boneLit)k='paint';
  else if(n.color===colors.red||n.color===colors.redDark)k='red';
  else if(n.color===colors.track||n.color===colors.trackTread)k='rubber';
  else if(n.color===colors.edge||n.color===colors.dark)k='graphite';
  else if(n.color===colors.steel)k='steel';
  if(k){n.texture=finishes[k];n.texMode=2;}
  n.finish= k==='paint'||k==='red'?1:k==='rubber'?2:k==='graphite'?3:k==='steel'?4:0;
  n.rough= k==='paint'?.59:k==='red'?.56:k==='rubber'?.94:k==='graphite'?.78:k==='steel'?.38:.57;
  if(n.color===colors.black){n.finish=n===screen?5:3;n.rough=n===screen?.13:.82;}
 }
 for(let child of n.children)assignFinish(child);
}
assignFinish(robot);
// Keep the OLED expressions emissive, otherwise they'd acquire the reflective finish of steel parts.
for(let k in eyeSets){for(let obj of eyeSets[k].children){obj.texture=null;obj.finish=0;obj.rough=.22;}}

 for(let k of Object.keys(eyeSets)){eyeSets[k].visible=k==='happy';}
 const initial=[3.52,.22,4.42];
 return {robot,chassis,yawPivot,tiltPivot,eyeRoot,eyeSets,trackData,oval,initial};
}
const kira=buildApprovedKira();
const labKiraRoute=new LabKiraRoute(),labKiraBehaviour=new KiraRoomBehaviour();
let labKiraPose=null;

// CONTINUOUS MAINTENANCE BAY — constructed directly in the Main Hall scene graph.
// The same approved Kira object is used during boot and after entry; no clone and no second WebGL canvas.
const entryBay=group(scene,[3.52,0,9.55]);
mat(entryBay,box(7.8,.16,7.0,.04),C.darkSteel,[0,-.15,0],[],'steel');
mat(entryBay,box(5.7,.045,4.7,.02),C.graphite,[0,-.055,.44],[],'graphite');
for(let x of [-3.65,3.65]){
 mat(entryBay,box(.26,5.0,6.9,.04),C.darkSteel,[x,2.33,0],[],'steel');
 mat(entryBay,box(.045,4.65,.11),WorkshopAppearance.palette.red,[x-Math.sign(x)*.09,2.25,-2.12],[],'light',1.10);
 mat(entryBay,box(.09,5.3,.21),C.steel,[x,2.42,2.65],[],'steel');
}
for(let z of [-2.72,2.72]){
 mat(entryBay,box(7.5,.27,.28),C.steel,[0,4.72,z],[],'steel');
 mat(entryBay,box(7.5,.14,.16),C.graphite,[0,4.15,z],[],'steel');
}
for(let x of [-2.95,2.95]){
 const lamp=mat(entryBay,box(.10,.075,3.05,.014),WorkshopAppearance.palette.warm,[x,4.45,.15],[],'light',.20);
 lamp._startupLamp=true;
}
for(let z of [-1.85,-.52,.80,2.13]){
 mat(entryBay,box(6.7,.009,.032),C.steel,[0,-.048,z],[],'steel');
}
// Dock surface, surveyed against Kira's .46-scaled rubber-track geometry.
// Top = .178 world units; the robot's true bottom contact is ~.057 below its root.
const DOCK_TOP=.178, BAY_FLOOR=-.033, HALL_FLOOR=-.060;
const RAMP_HEAD=10.20,RAMP_TAIL=8.35;
const TRACK_CLEARANCE=.064;  // track bottom (.057) plus 7mm visual clearance
const entryPad=group(entryBay,[0,.01,1.18]);
mat(entryPad,octBlock(1.55,.13,1.36,.18),C.graphite,[0,.07,0],[],'steel');
mat(entryPad,box(1.12,.034,1.06,.05),C.darkSteel,[0,.151,0],[],'graphite');
const dockPulse=mat(entryPad,box(.86,.012,.045,.01),WorkshopAppearance.palette.red,[0,.174,-.45],[],'light',.06);
// Real sloped surface: the dock now has a continuous way down, never an abrupt step.
// The ramp top joins the dock at z=10.20 and the bay floor at z=8.35.
const rx0=3.52, halfRamp=.78, lowBase=-.12;
const rampV=[rx0-halfRamp,DOCK_TOP,RAMP_HEAD,rx0+halfRamp,DOCK_TOP,RAMP_HEAD,
             rx0-halfRamp,BAY_FLOOR,RAMP_TAIL,rx0+halfRamp,BAY_FLOOR,RAMP_TAIL,
             rx0-halfRamp,lowBase,RAMP_HEAD,rx0+halfRamp,lowBase,RAMP_HEAD,
             rx0-halfRamp,lowBase,RAMP_TAIL,rx0+halfRamp,lowBase,RAMP_TAIL];
const rampFaces=[0,2,1,1,2,3, 0,1,4,1,5,4, 2,6,3,3,6,7, 0,4,2,2,4,6, 1,3,5,3,7,5, 4,5,6,5,7,6];
mat(scene,customMesh(rampV,rampFaces),C.graphite,[0,0,0],[],'graphite');
for(const side of [-1,1]){
 const seam=part(scene,customMesh([
  rx0+side*.79,DOCK_TOP+.006,RAMP_HEAD,
  rx0+side*.79,BAY_FLOOR+.006,RAMP_TAIL,
  rx0+side*.79-side*.027,DOCK_TOP+.006,RAMP_HEAD,
  rx0+side*.79-side*.027,BAY_FLOOR+.006,RAMP_TAIL],
  [0,1,2,2,1,3]),C.red,[0,0,0],[],.3,.13);
}
// Smooth ground transition through the doorway, then into the flush hall lane.
function trackSurface(z){
 if(z>=RAMP_HEAD)return DOCK_TOP;
 if(z>RAMP_TAIL)return BAY_FLOOR+(DOCK_TOP-BAY_FLOOR)*(z-RAMP_TAIL)/(RAMP_HEAD-RAMP_TAIL);
 if(z>=6.35)return BAY_FLOOR;
 if(z>5.35)return HALL_FLOOR+(BAY_FLOOR-HALL_FLOOR)*(z-5.35);
 return HALL_FLOOR;
}
// Physical gate is behind Kira, leading into the existing hall foreground lane.
const entryGate=group(scene,[3.52,0,6.10]);
for(let x of [-2.18,2.18])mat(entryGate,box(.31,4.52,.36),C.steel,[x,2.13,0],[],'steel');
mat(entryGate,box(4.7,.35,.43),C.graphite,[0,4.23,0],[],'steel');
const gateL=group(entryGate,[-1.04,2.00,.02]),gateR=group(entryGate,[1.04,2.00,.02]);
for(const [door,dir] of [[gateL,-1],[gateR,1]]){
 mat(door,box(2.03,3.98,.14,.025),C.darkSteel,[0,0,0],[],'steel');
 mat(door,box(1.78,3.46,.06),C.graphite,[0,0,.103],[],'graphite');
 mat(door,box(.10,3.26,.042),C.red,[-dir*.82,0,.144],[],'paint',.19);
 for(let j=-2;j<=2;j++)mat(door,box(1.75,.055,.055),C.steel,[0,j*.58,.14],[],'steel');
}
const entryFrontLight=mat(entryBay,box(2.4,.035,.12),WorkshopAppearance.palette.white,[0,4.55,2.65],[],'light',.20);entryFrontLight._startupLamp=true;
const entryLighting=[...entryBay.children.filter(x=>x._startupLamp)];
const bayInitial=[3.52,DOCK_TOP+TRACK_CLEARANCE,10.73];
const hallFinal=[3.52,HALL_FLOOR+TRACK_CLEARANCE,4.65];
// C2 continuous minimum-jerk easing: velocity AND acceleration are zero at joins.
const smoothEntry=t=>{t=Math.max(0,Math.min(1,t));return t*t*t*(t*(t*6-15)+10)};
const mixEntry=(a,b,t)=>a+(b-a)*t;
const INITIAL_EYE_DESKTOP=[5.75,3.14,16.4],INITIAL_EYE_MOBILE=[4.55,3.2,17.0];
const INITIAL_TARGET=[3.52,1.28,10.69];
function entryCameraPath(t,finalEye,finalTarget,isMobile){
 // No Stage-5 cut: first frame equals the *exact* dormant camera position.
 // Camera follows on a parallel offset to the robot, THEN cranes out into the hall.
 const walking=smoothEntry((t-.34)/.49);
 const followZ=mixEntry(bayInitial[2],hallFinal[2],walking);
 const startEye=isMobile?INITIAL_EYE_MOBILE:INITIAL_EYE_DESKTOP;
 const trackEye=[startEye[0],startEye[1]+.16*walking,startEye[2]+(followZ-bayInitial[2])];
 const trackTarget=[INITIAL_TARGET[0],INITIAL_TARGET[1]+.04*walking,INITIAL_TARGET[2]+(followZ-bayInitial[2])];
 const reveal=smoothEntry((t-.81)/.19);
 return {eye:trackEye.map((v,i)=>mixEntry(v,finalEye[i],reveal)),
         target:trackTarget.map((v,i)=>mixEntry(v,finalTarget[i],reveal))};
}




let pointer=[0,0],lastPointer=0,lastKiraTap=0,blinkAt=performance.now()+2700,blinkUntil=0,kiraSmileUntil=0;
let homeActive=false,homeEntry=0,yawValue=0,tiltValue=0;
const kiraPatrol={min:-9.2,max:9.2,dock:3.52,speed:.74};
const kiraRoutine={phase:'turnOut',time:0,elapsed:0,x:kiraPatrol.dock,greeting:0};
const engineerEncounter={active:false,phase:'idle',age:0,arrivalDone:false,departureDone:false,gesturePlayed:false,robotReplied:false,greetings:0,farewells:0,robotReplies:0};
const patrolDuration=(a,b)=>Math.abs(b-a)*1.875/kiraPatrol.speed;
// A smooth outward detour clears the conveyor motor at (6.85, 4.18).
// The lane remains level; the loading ramp is only used during the entrance.
function patrolPoint(x){const u=Math.max(0,Math.min(1,(x-5.15)/1.15)),v=Math.max(0,Math.min(1,(x-7.90)/1.15)),derivative=t=>30*t*t*(1-t)*(1-t);return {z:4.65+.65*(smoothEntry(u)-smoothEntry(v)),slope:.65*(derivative(u)-derivative(v))/1.15};}
const angleWrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
const angleDamp=(a,b,k,dt)=>a+angleWrap(b-a)*(1-Math.exp(-k*dt));
const kclamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const kdamp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
function entered(){homeActive=true;homeEntry=performance.now();oldTime=homeEntry;kiraSmileUntil=homeEntry+2400;}
function updateEngineerEncounter(dt,p,x,z){
 const e=engineerEncounter,a=engineerRenderer.avatar,cp=EngineerStationLayout.worldPoint(EngineerStationLayout.character);
 if(!a||reduced||p>.535){engineerRenderer.setEncounterLook();return;}
 if(kiraRoutine.phase==='dock'){e.arrivalDone=false;e.departureDone=false;}
 if(kiraRoutine.phase==='observe'&&!e.arrivalDone&&Math.hypot(x-cp[0],z-cp[2])<4.6){Object.assign(e,{active:true,phase:'arrival',age:0,arrivalDone:true,gesturePlayed:false,robotReplied:false});}
 if(kiraRoutine.phase==='turnAcross'&&e.arrivalDone&&!e.departureDone){Object.assign(e,{active:true,phase:'farewell',age:0,departureDone:true,gesturePlayed:false,robotReplied:false});}
 if(e.active){
  e.age+=dt;
  if(!e.gesturePlayed&&e.age<5){const clip=e.phase==='arrival'?'ENGINEER_GREETING':'ENGINEER_EXIT';e.gesturePlayed=a.active?a.playAcknowledgement():a.play(clip,{priority:true});if(e.gesturePlayed){e[e.phase==='arrival'?'greetings':'farewells']++;a.nextIdle=Math.max(a.nextIdle,a.time+12);}}
  if(e.gesturePlayed&&!e.robotReplied&&e.age>.65){e.robotReplied=true;e.robotReplies++;}
  if(e.phase==='farewell'&&e.age>4.5){e.active=false;e.phase='idle';}
 }
 const yaw=angleWrap(Math.atan2(x-cp[0],z-cp[2])-EngineerStationLayout.rotation);
 engineerRenderer.setEncounterLook(yaw,.08,e.active?(a.active?.35:1):0);
}
function acknowledge(){const now=performance.now();if(now-lastKiraTap<(EngineeringLab.getState().active||CommunicationsRoom.active&&!CommunicationsPhone.active?2000:1250))return;lastKiraTap=now;kiraSmileUntil=now+3200;kiraRoutine.greeting++;labKiraBehaviour.react('tap');if(CommunicationsRoom.active)CommunicationsRoom.behaviour.greet('kira');}
function pointerMove(clientX,clientY){const r=canvas.getBoundingClientRect();pointer=[kclamp((clientX-r.left)/Math.max(1,r.width)*2-1,-1,1),kclamp((clientY-r.top)/Math.max(1,r.height)*2-1,-1,1)];lastPointer=performance.now();}
let officePointerAt=0,officePointer=[0,0];
function onPointer(e){pointerMove(e.clientX,e.clientY);if(CommunicationsRoom.active&&performance.now()-officePointerAt>200&&Math.hypot(e.clientX-officePointer[0],e.clientY-officePointer[1])>6){officePointerAt=performance.now();officePointer=[e.clientX,e.clientY];CommunicationsRoom.behaviour.pointer();}}
window.addEventListener('pointermove',onPointer,{passive:true});
window.addEventListener('kira:entered',entered,{once:true});
if(document.body.classList.contains('kira-has-entered'))entered();
function updateKira(ms,dt,p,intro){
 const sec=ms*.001,stage=intro?.active?intro.stage:5,entry=intro?.entering?intro.progress:0;
 const labState=EngineeringLab.getState(),routeState=labKiraRoute.getState();
 const labParked=routeState.arrived&&routeState.targetMode===(labState.mode==='overview'?labKiraBehaviour.destination():labState.mode);
 labKiraPose=labKiraBehaviour.update({...labState,dt,active:labState.active&&!intro?.active&&!CommunicationsRoom.inRange(p),hidden:document.hidden,reduced,parked:labParked,moving:!labParked,routeMode:routeState.targetMode});
 const labLease=!intro?.active?labKiraRoute.update(document.hidden?0:dt,CommunicationsRoom.inRange(p)||EngineeringLab.inRange(p)||p>=.49&&p<.545&&!window.ProjectStudy?.active,kira.robot.p,kira.robot.r[1],CommunicationsRoom.inRange(p)?{...labState,mode:'communications',progress:p}:{...labState,kiraDestination:labKiraPose.destination},ms,reduced):null;
 const productionLook=intro?.active?null:labLease?.attention||productionAttention(ms);
 // A fixed world-space Kira: starts in front of the same hall, drives through the real doorway.
 const driving=intro?.active?smoothEntry((entry-.33)/.58):1;
 const sinceHome=homeActive?(ms-homeEntry)/1000:0;
 let x=3.52,z=hallFinal[2],heading=kira.robot.r[1];
 const oldX=kira.robot.p[0],oldZ=kira.robot.p[2],oldHeading=kira.robot.r[1];
 if(intro?.active){
  x=3.52;z=mixEntry(bayInitial[2],hallFinal[2],driving);
  heading=-Math.PI*smoothEntry((entry-.12)/.21);
 }else if(reduced&&CommunicationsRoom.inRange(p)){const park=CommunicationsLayout.point(CommunicationsLayout.dock);x=park[0];z=park[2];heading=Math.PI/2;}else if(reduced&&EngineeringLab.inRange(p)){const park=EngineeringLab.getState().mode==='skills'?EngineeringLabLayout.kiraPark:EngineeringLab.getState().mode==='experience'?EngineeringLabLayout.kiraArchive:EngineeringLabLayout.kiraOverview;x=park[0];z=park[1];heading=0;}else if(labLease){x=labLease.x;z=labLease.z;heading=labLease.heading;engineerRenderer.setEncounterLook();dockLamp.emit=.14;
 }else{
  const motionDt=reduced||controller.paused?0:dt;
  kiraRoutine.time+=motionDt;kiraRoutine.elapsed+=motionDt;
  const rt=kiraRoutine;
  // Each drive begins AFTER its pivot turn. Foreground route has no machine crossings.
  if(rt.phase==='turnOut'){
   heading=angleDamp(heading,-Math.PI/2,3,motionDt);
   if(rt.time>2.4){rt.phase='out';rt.time=0;}
  }else if(rt.phase==='out'){
   const duration=patrolDuration(kiraPatrol.dock,kiraPatrol.min);
   rt.x=mixEntry(kiraPatrol.dock,kiraPatrol.min,smoothEntry(rt.time/duration));heading=-Math.PI/2;
   if(rt.time>=duration){rt.phase='observe';rt.time=0;}
  }else if(rt.phase==='observe'||rt.phase==='observeRight'){
   const visitor=(hoveredStation==='kira'&&ms-lastPointer<1800)||ms-lastKiraTap<3200;
   const subject=engineerEncounter.active?EngineerStationLayout.worldPoint(EngineerStationLayout.character):productionLook?productionLook.target:['arrival','detected','shuttle'].includes(factory.phase)?factory.component:[.6,1.5,-.12];
   const watch=Math.atan2(subject[0]-rt.x,subject[2]-hallFinal[2]);
   const attentionDt=!reduced&&ms-lastKiraTap<3200?dt:motionDt;
   heading=angleDamp(heading,engineerEncounter.active?watch:visitor||factory.phase==='complete'?.30:watch,1.5,attentionDt);
   if(rt.time>(rt.phase==='observe'?8:10)){rt.phase=rt.phase==='observe'?'turnAcross':'turnHome';rt.time=0;}
  }else if(rt.phase==='turnAcross'){
   const cp=EngineerStationLayout.worldPoint(EngineerStationLayout.character),reply=engineerEncounter.active&&engineerEncounter.phase==='farewell'&&engineerEncounter.age<1.15;
   heading=angleDamp(heading,reply?Math.atan2(cp[0]-rt.x,cp[2]-hallFinal[2]):Math.PI/2,3,motionDt);
   if(rt.time>(engineerEncounter.departureDone?3.6:2.4)){rt.phase='across';rt.time=0;}
  }else if(rt.phase==='across'){
   const duration=patrolDuration(kiraPatrol.min,kiraPatrol.max);
   rt.x=mixEntry(kiraPatrol.min,kiraPatrol.max,smoothEntry(rt.time/duration));heading=Math.PI/2;
   if(rt.time>=duration){rt.phase='observeRight';rt.time=0;}
  }else if(rt.phase==='turnHome'){
   heading=angleDamp(heading,-Math.PI/2,3,motionDt);
   if(rt.time>2.4){rt.phase='home';rt.time=0;}
  }else if(rt.phase==='home'){
   const duration=patrolDuration(kiraPatrol.max,kiraPatrol.dock);
   rt.x=mixEntry(kiraPatrol.max,kiraPatrol.dock,smoothEntry(rt.time/duration));heading=-Math.PI/2;
   if(rt.time>=duration){rt.phase='dock';rt.time=0;}
  }else{
   heading=angleDamp(heading,.30,2.5,motionDt);
   // Rest is long enough for several quiet observations before another patrol.
   if(rt.time>48){rt.phase='turnOut';rt.time=0;}
  }
  x=rt.x;const route=patrolPoint(x);z=route.z;
  if(['out','across','home'].includes(rt.phase)){const direction=rt.phase==='across'?1:-1;heading=Math.atan2(direction,route.slope*direction);}
  if(reduced)heading=.30;
  updateEngineerEncounter(motionDt,p,x,z);
  dockLamp.emit=rt.phase==='dock'?.48:.14;
 }
 const wheelbase=.87,front=intro?.active?trackSurface(z-wheelbase*.5):HALL_FLOOR,rear=intro?.active?trackSurface(z+wheelbase*.5):HALL_FLOOR;
 // Finish shrinking in the lab approach, two metres before the office doors.
 // The route keeps this branch on return until it reaches the lab junction.
 const officeJourney=labKiraRoute.branch==='communications'||reduced&&CommunicationsRoom.inRange(p);
 const roomAmount=intro?.active?0:CommunicationsLayout.robotRoomAmount(z,officeJourney);
 const labScale=!intro?.active&&EngineeringLab.inRange(p)? .68:1;
 const roomScale=labScale*mixEntry(1,CommunicationsLayout.scale.robot,roomAmount)*(officeJourney?1+(CommunicationsPhone.actorScale-1)*roomAmount:1);
 [x,z]=CommunicationsPhone.routePosition(x,z,officeJourney);
 kira.robot.s=[.46*roomScale,.46*roomScale,.46*roomScale];
 const pad=CommunicationsLayout.point(CommunicationsPhone.dockPosition);
 const onPad=smoothEntry((.65-Math.hypot(x-pad[0],z-pad[2]))/.2)*roomAmount;
 kira.robot.p=[x,(front+rear)*.5+TRACK_CLEARANCE*roomScale+onPad*.065*CommunicationsLayout.scale.chargingStation,z];
 kira.robot.r[0]=intro?.active?Math.atan2(rear-front,wheelbase):0;
 kira.robot.r[1]=heading;
 const dxK=x-oldX,dzK=z-oldZ,travelled=Math.hypot(dxK,dzK);
 const signedTravel=dxK*Math.sin(heading)+dzK*Math.cos(heading);
 const turned=angleWrap(heading-oldHeading);
 const officeLife=CommunicationsRoom.behaviour.kira(labKiraRoute.getState(),kira.robot.p,heading,reduced);
 let targetYaw=0,targetTilt=-.018,gazeGoal=0;
 if(intro?.active){
  const t=ms*.001;
  if(stage===0){targetTilt=-.045;}
  if(stage===2){targetYaw=.22*Math.sin(t*2.2);targetTilt=.028*Math.sin(t*1.35);}
  if(stage===3){const recent=ms-intro.pointerAt<2000;targetYaw=recent?kclamp(-intro.pointer[0]*.22,-.28,.28):.07*Math.sin(t*.8);targetTilt=recent?kclamp(-intro.pointer[1]*.052,-.08,.08):0;}
  if(stage===4){targetYaw=entry<.18?.09:entry>.83?.19:0;targetTilt=entry>.83?-.025:0;}
 }else{
  const near=hoveredStation==='kira';
  const visitor=(near||ms-lastKiraTap<3200)&&ms-lastPointer<2200;
  const activeMotion=labLease?!labLease.parked:['out','across','home','turnOut','turnAcross','turnHome'].includes(kiraRoutine.phase);
  const source=productionLook?productionLook.target:factory.owner==='gripper'?factory.component:factory.phase==='arrival'||factory.phase==='detected'?factory.component:[.6,1.8,-.12];
  const interest=angleWrap(Math.atan2(source[0]-x,source[2]-z)-heading);
  kiraRoutine.visitorTime=visitor?(kiraRoutine.visitorTime||0)+dt:0;
  gazeGoal=visitor?pointer[0]*.025:kclamp(interest,-.4,.4)*.10;
  targetYaw=visitor&&kiraRoutine.visitorTime>.16?kclamp(-pointer[0]*.24,-.30,.30):kclamp(interest,-.40,.40);
  targetTilt=visitor?kclamp(-pointer[1]*.06,-.08,.08):-.035;
  if(activeMotion){targetYaw*=.35;targetTilt=0;}
  if(kiraRoutine.phase==='dock'&&kiraRoutine.time>15&&!visitor&&!productionLook){targetYaw=.055*Math.sin(sec*.23);targetTilt=.035;}
  if(engineerEncounter.active&&!visitor&&!labLease){const cp=EngineerStationLayout.worldPoint(EngineerStationLayout.character),look=angleWrap(Math.atan2(cp[0]-x,cp[2]-z)-heading),age=engineerEncounter.age;targetYaw=kclamp(look,-.4,.4);gazeGoal=0;targetTilt=-.03+(age>.65&&age<1.55?.09*Math.sin((age-.65)/.9*Math.PI):0);}
  if(productionLook&&!visitor&&!engineerEncounter.active){targetTilt=productionLook.mood==='focused'?-.065:-.025;}
  if(reduced){targetYaw=0;targetTilt=0;}
 }
 if(CommunicationsRoom.active&&!intro?.active){
  const resting=officeLife.kiraState==='RECEPTION_RESTING',moving=labLease&&!labLease.parked;
  const glance=officeLife.attention&&officeLife.selected>=0;
  const visitor=hoveredStation==='kira'||officeLife.pointerActive||ms-lastKiraTap<3200;
  const t=officeLife.time,play=!moving&&!resting&&officeLife.playing;
  const envelope=play?Math.sin(Math.min(1,officeLife.playAge/2.1)*Math.PI):0;
  const flourish=envelope*Math.sin(officeLife.playAge*(officeLife.playIndex%2?6:9));
  // Bounded over-the-shoulder screen attention, with the tracked chassis parked.
  targetYaw=glance?0:visitor?kclamp(pointer[0]*.46,-.48,.48):resting?.035:.13*Math.sin(t*.43)+.04*Math.sin(t*.83);
  targetTilt=glance?-.08:resting?.045:visitor?kclamp(pointer[1]*.12,-.12,.12):-.015;
  if(!glance){targetYaw+=flourish*.16;targetTilt+=flourish*.09;}
  gazeGoal=visitor?pointer[0]*.04:Math.sin(t*.61)*.015;
  if(glance){
   const b=(CommunicationsPhone.active?CommunicationsPhone.buttons:CommunicationsGraphics.buttons)[officeLife.selected],s=CommunicationsPhone.screenPlane;
   const target=CommunicationsLayout.point([s.center[0]+(b.x+b.w/2-.5)*s.size[0],s.center[1]+(.5-b.y-b.h/2)*s.size[1],s.center[2]]);
   const angle=angleWrap(Math.atan2(target[0]-x,target[2]-z)-heading);
   targetYaw=kclamp(angle*.52,-1.45,1.45);gazeGoal=kclamp((angle-targetYaw)*.035,-.055,.055);
   targetTilt=-kclamp(Math.atan2(target[1]-kira.robot.p[1]-.6,Math.hypot(target[0]-x,target[2]-z))*.3,-.14,.14);
  }
  if(!CommunicationsPhone.active&&!moving&&!resting){
   const a=officeLife.gestureAge,w=officeLife.gesture?Math.sin(Math.min(1,a/1.6)*Math.PI):0;
   if(officeLife.gesture==='hello'||officeLife.gesture==='tap')targetYaw=.05;
   targetTilt+=w*.10;
  }
  kira.tiltPivot.r[2]=kdamp(kira.tiltPivot.r[2],glance?-.035:envelope*.055*Math.sin(officeLife.playAge*4),6,dt);
  if(moving){targetYaw*=.25;targetTilt=0;kira.tiltPivot.r[2]=0;}
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){targetYaw=targetTilt=gazeGoal=0;kira.tiltPivot.r[2]=0;}

 }
 if(!CommunicationsRoom.active&&!labState.active)kira.tiltPivot.r[2]=0;
 if(labState.active&&!CommunicationsRoom.active){
  targetYaw=labKiraPose.yaw;targetTilt=labKiraPose.tilt;gazeGoal=targetYaw*.06;
  if(['selection','preview'].includes(labKiraPose.gesture)&&labLease?.parked&&labState.mode==='skills'){const local=({software:[-4.20,2.1,-21.02],embedded:[-4.75,1.95,-21.00],robotics:[-4.20,2,-21.28],design:[-4.25,2,-21.05]})[labState.preview||labState.category];if(local){const target=EngineeringLabLayout.stationPoint(local);targetYaw=kclamp(angleWrap(Math.atan2(target[0]-x,target[2]-z)-heading),-.45,.45);}}
  kira.tiltPivot.r[2]=kdamp(kira.tiltPivot.r[2],labKiraPose.roll,6,dt);
 }


 yawValue=kdamp(yawValue,targetYaw,CommunicationsRoom.active?7:3.5,dt);tiltValue=kdamp(tiltValue,targetTilt,3.2,dt);
 kira.yawPivot.r[1]=yawValue;kira.tiltPivot.r[0]=tiltValue;
 let mood='neutral';
 if(intro?.active){
  if(stage===1)mood='neutral';
  else if(stage===2)mood='curious';
  else if(stage===3)mood=ms-(intro.reactionAt||0)<1150?'happy':'curious';
  else if(stage===4)mood='happy';
 }else mood=!labLease&&engineerEncounter.active&&engineerEncounter.robotReplied?'happy':ms<kiraSmileUntil?['happy','curious','surprised'][kiraRoutine.greeting%3]:
  (productionLook?productionLook.mood:factory.phase==='detected'||factory.phase==='shuttle'?'curious':
   factory.phase==='inspection'?'focused':factory.phase==='complete'&&ms-factoryEvent.at<2300?'happy':
   kiraRoutine.phase==='dock'&&kiraRoutine.time>20?'sleepy':'neutral');
 if(CommunicationsRoom.active){mood=officeLife.kiraState==='RECEPTION_RESTING'?'sleepy':ms<kiraSmileUntil?['happy','curious','surprised'][kiraRoutine.greeting%3]:officeLife.ack||officeLife.waking||!CommunicationsPhone.active&&['hello','tap','ack'].includes(officeLife.gesture)?'happy':officeLife.attention?'curious':officeLife.playing?['happy','curious','surprised'][officeLife.playIndex%3]:'neutral';}
 if(labState.active&&!CommunicationsRoom.active)mood=labKiraPose.mood;
 for(const [key,node] of Object.entries(kira.eyeSets))node.visible=key===mood&&(stage!==0);
 if(!reduced&&ms>blinkAt){blinkUntil=ms+120;blinkAt=ms+3300+(CommunicationsRoom.active?(Math.sin(blinkAt*.013)*.5+.5)*3100:EngineeringLab.getState().active?(Math.sin(blinkAt*.0017)*.5+.5)*3200:(controller.count%3)*530);}
 const awake=stage>0,firstLife=stage===1&&Math.sin(ms*.021)<-.8;
 kira.eyeRoot.s[1]=awake&&(ms<blinkUntil||firstLife||!reduced&&(labState.active&&labKiraPose.blink||CommunicationsRoom.active&&!CommunicationsPhone.active&&officeLife.gestureBlink))? .1:1;
 const gazeX=intro?.active?(stage===3?intro.pointer[0]*.018:0):gazeGoal;
 kira.eyeRoot.p[0]=kdamp(kira.eyeRoot.p[0],gazeX,12,dt);
 // Rotate the caterpillar tracks with actual forward travel; brief alternating tests during calibration.
 for(const d of kira.trackData){
  let distance=signedTravel-d.side*turned*.36;
  if(intro?.active&&stage===2)distance+=Math.max(0,Math.sin(ms*.011))*.025*dt;
  d.phase=((d.phase+distance/3.35)%1+1)%1;
  for(const wheel of d.wheels)wheel.r[0]+=distance/(.326*.46);
  for(let i=0;i<d.pieces.length;i++){
   const a=kira.oval((i/d.pieces.length+d.phase)%1),n=d.pieces[i];
   n.p=[0,a.y+Math.cos(a.angle)*.105,a.z+Math.sin(a.angle)*.105];n.r=[a.angle,0,0];
  }
 }

}

let officeEngineerSeen=0,officeEngineerOwned=false;
function updateOfficeEngineer(){const a=engineerRenderer.avatar;if(!a)return;const life=CommunicationsRoom.behaviour.snapshot();
 if(!CommunicationsRoom.active){if(officeEngineerOwned){a.lookAtTarget(0,0);a.playIdle();officeEngineerOwned=false;}return;}
 officeEngineerOwned=true;if(life.engineerRequest!==officeEngineerSeen){if(a.playAcknowledgement())officeEngineerSeen=life.engineerRequest;}
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&!a.oneShot&&life.time%19<2){a.lookAtTarget(Math.sin(life.time*.12)*.12,.015);}
}
const deg=Math.PI/180;const lerp=(a,b,t)=>a+(b-a)*t;
function damp(a,b,k,dt){return lerp(a,b,1-Math.exp(-k*dt))}
function clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function smooth(t){t=clamp(t,0,1);return t*t*(3-2*t)}
const controller=new WorkshopProjectDelivery.Factory({paused:matchMedia('(prefers-reduced-motion: reduce)').matches,
 onEvent(event){factoryEvent={...event,at:performance.now()};}});
let factoryEvent={phase:'ready',cycle:1,at:0};
let factory={...controller.snapshot(),camera:'guided',cameraWeight:0};
window.ProductionDiscovery.bindFactory(controller);
const productionAwareness={entry:0,revision:-1,stage:'idle',until:0,target:null,mood:'neutral',reactions:0};
function productionAttention(ms){const d=window.ProductionDiscovery.getViewState(),job=factory.project;let event=null;if(d.active&&d.entrySerial!==productionAwareness.entry){productionAwareness.entry=d.entrySerial;event='arrival';}if(job.revision!==productionAwareness.revision){productionAwareness.revision=job.revision;if(job.selectedId)event='selection';}if(job.stage!==productionAwareness.stage){productionAwareness.stage=job.stage;if(['detected','ready'].includes(job.stage))event=job.stage;}if(event==='detected'&&controller.carrierSerial%3===0)event=null;if(event){productionAwareness.target=event==='ready'?WorkshopSystem.datums.pickup.slice():event==='detected'?[6.43,1.05,2.35]:[8.05,2.48,-1.55];productionAwareness.mood=event==='ready'?'happy':event==='detected'?'focused':'curious';productionAwareness.until=ms+(event==='selection'?1700:2300);productionAwareness.reactions++;}if(job.activeId&&['transport','transfer'].includes(job.stage)){productionAwareness.target=factory.component.slice();productionAwareness.until=ms+250;productionAwareness.mood='curious';}return ms<productionAwareness.until?productionAwareness:null;}

window.__productionScene={controller,station:productionStation,getState:()=>({...controller.snapshot(),actualComponent:worldPoint(workpiece),carrier:productionStation.getState(),architecture:{parallelCutaway,sensorPostOpacity:conveyorDetector.alpha,cutawayPillars:conveyorCutawayPillars.map(n=>({position:n.p.slice(),visible:n.visible!==false})),rearWall:rearHallWall.visible!==false,westWall:westHallWall.visible!==false,enclosureVisible:returnEnclosure.visible!==false}})};
function reparent(node,parent){
 if(node.parent===parent)return;
 if(node.parent)node.parent.children.splice(node.parent.children.indexOf(node),1);
 parent.add(node);
}
function setRobotPose(pose){
 Object.assign(state,pose);baseYaw.r[1]=pose.base;shoulder.r[2]=pose.shoulder;
 elbow.r[2]=pose.elbow;wrist.r[2]=pose.wrist;toolRoll.r[1]=-pose.base;
}
function worldMatrix(n){let m=M.I();const chain=[];while(n){chain.unshift(n);n=n.parent;}for(const node of chain)m=M.mul(m,nodeMatrix(node));return m;}
function worldPoint(node,p=[0,0,0]){const m=worldMatrix(node);return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];}
function toolWorld(){return worldPoint(toolRoll,[0,-.6,0])}
function updateFactory(dt,ms){
 controller.started=homeActive;
 controller.tick(dt);
 Object.assign(factory,controller.snapshot());
 setRobotPose(factory.pose);
 fingerL.p[0]=-factory.grip;fingerR.p[0]=factory.grip;
 state.phaseLabel=factory.id;state.phaseDescription=factory.description;
 state.progressWidth=(factory.progress*100).toFixed(1)+'%';
 for(let i=0;i<workpieceVariants.length;i++)workpieceVariants[i].visible=i===factory.type;
 workpiece.visible=factory.visible;workpiece.r=[0,0,0];
 const discovery=window.ProductionDiscovery.getViewState();productionStation.update(factory,discovery.previewId,discovery.active,ms);
 // The sensor upright crosses the first projected label. Reveal the hologram
 // through it while browsing, then restore the physical sensor for delivery.
 conveyorDetector.alpha=1-.84*productionStation.getHologramWeight();
 if(factory.owner==='gripper'){
  reparent(workpiece,toolRoll);workpiece.p=[0,-.60,0];
 }else if(factory.owner==='stage'){
  reparent(workpiece,platter);workpiece.p=[0,.54,0];
 }else if(factory.owner==='output'){
  reparent(workpiece,outputCarrier);workpiece.p=[0,.09,0];
 }else{reparent(workpiece,scene);workpiece.p=factory.component.slice();}
 shuttle.visible=true;shuttle.p=factory.shuttle.map((v,i)=>i===1?v-.1325:v);
 shuttleBogie.p=[factory.shuttle[0],.7845,factory.shuttle[2]];
 outputCarrier.p=factory.pallet.map((v,i)=>i===1?v-.09:v);
 outputCarrier.r[1]=factory.rotation;
 inputGate.p[1]=1.39+factory.inputGate*1.10;outputGate.p[1]=1.54+factory.outputGate*.85;
 for(const roller of conveyor.children)if(roller._roller)roller.r[0]=factory.rollerDistance/.075;
 platter.r[1]=factory.rotation;
 for(const {node,angle} of clampNodes){const r=.44-.105*factory.clampAmount;node.p[0]=Math.cos(angle)*r;node.p[2]=Math.sin(angle)*r;}
 scanBar.visible=factory.inspection;scanBar.p[2]=-.24+.48*WorkshopSystem.ease((factory.age%1.8)/1.8);
 const task= factory.inspection||hoveredStation==='assembly';
 gantryLamp.emit=damp(gantryLamp.emit,task?1.15:.65,5,dt);
 for(const light of taskLights)light.emit=damp(light.emit,task?1.05:.78,4,dt);
 detectionLamp.emit=damp(detectionLamp.emit,factory.sensor?1.15:.12,6,dt);
 qualityBeacon.emit=damp(qualityBeacon.emit,factory.completed?1:.12,4,dt);
 for(const {node,bank,slot} of serverDots){
  const active=bank===0?factory.detected:bank===1?factory.owner==='gripper':factory.inspection||factory.completed;
  node.emit=damp(node.emit,active&&slot%3===0?.75:.19+(slot===factory.index%6?.13:0),3,dt);
 }
 twinPanel.emit=damp(twinPanel.emit,hoveredStation==='intelligence'?1.02:.86,4,dt);
 drawTwin(ms,factory);
 window.__livingWorkshopState={phase:factory.phase,label:factory.id,elapsed:+factory.clock.toFixed(3),
  cycle:factory.count,component:factory.component.slice(),owner:factory.owner,sensor:factory.sensor,
  detected:factory.detected,inspectionPassed:factory.completed,paused:factory.paused,part:factory.partName,progress:factory.progress,project:{...factory.project}};
}
function resetFactory(){controller.restart();}
if(new URLSearchParams(location.search).has('workshopDebug'))window.__workshopDev={
 setTime(t){controller.seek(t);controller.paused=true;},run(){controller.paused=false;},
 state(){return {...controller.snapshot(),tool:toolWorld(),actualComponent:worldPoint(workpiece),kira:kira.robot.p.slice(),kiraHeading:kira.robot.r[1],kiraRoutine:{...kiraRoutine},productionAwareness:{...productionAwareness},kiraPatrol:{...kiraPatrol},engineerEncounter:{...engineerEncounter},engineerClip:engineerRenderer.avatar?.clip?.name,kiraHeadTilt:kira.tiltPivot.r[0],eyes:Object.keys(kira.eyeSets).find(k=>kira.eyeSets[k].visible),trackPhases:kira.trackData.map(d=>d.phase),camera:factory.camera,cameraPose:cameraSnapshot,rollerAngle:conveyor.children.find(n=>n._roller).r[0],hover:hoveredStation,monitor:{label:lastTwinLabel,joints:lastTwinJoints.slice(),matrices:lastTwinMatrices.map(j=>({...j,matrix:j.matrix.slice()})),mode:displayMode},joints:[state.base,state.shoulder,state.elbow,state.wrist],metrics:{...renderMetrics},appearance:{...dressing.stats,clearances:dressing.clearances,shadows:shadows.getState()},gpuResources:{buffers:gpuResources.buffers.size,textures:gpuResources.textures.size}};}
};

let oldTime=performance.now(),frame=0;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;


const desktopViews={
 overview:WorkshopAppearance.overview,
 about:EngineerStationLayout.desktop,
 engineerApproach:EngineerStationLayout.approach,
 productionApproach:{yaw:.80,pitch:.38,dist:9.5,target:[0,1.4,-.5]},
 assembly:{yaw:.42,pitch:.33,dist:9.8,target:[-1.85,1.60,.05]},
 intelligence:{yaw:.045,pitch:.07,dist:6.1,target:[-8.0,3.42,-3.30]},
 conveyor:{yaw:1.57,pitch:.30,dist:11.4,target:[5.2,1.30,.1]},
 exit:{yaw:.30,pitch:.24,dist:6.8,target:[-.3,2.1,-8.7]}
};
const mobileViews={
 overview:{yaw:.32,pitch:.34,dist:19.2,target:[.25,2.35,.55]},
 about:EngineerStationLayout.mobile,
 engineerApproach:EngineerStationLayout.mobile,
 productionApproach:{yaw:.80,pitch:.42,dist:13,target:[0,1.4,-.5]},
 assembly:{yaw:.28,pitch:.34,dist:13.0,target:[-.7,1.75,.15]},
 intelligence:{yaw:.06,pitch:.12,dist:13.5,target:[-7.05,3.20,-3.5]},
 conveyor:{yaw:1.57,pitch:.50,dist:13.8,target:[4.2,1.3,-.65]},
 exit:{yaw:.10,pitch:.15,dist:11.5,target:[0,2.2,-8.7]}
};
const phoneUIQuery=matchMedia('(max-width:760px)');
const phoneHomeView=(()=>{
 // Keep the lowered mobile eye fixed while turning right enough to frame
 // Sarith left of center with the workstation and right-side displays.
 const v={...WorkshopAppearance.overview,pitch:.23,target:[WorkshopAppearance.overview.target[0]-3,WorkshopAppearance.overview.target[1],WorkshopAppearance.overview.target[2]]};
 const eye=[v.target[0]+Math.sin(v.yaw)*Math.cos(v.pitch)*v.dist,v.target[1]+Math.sin(v.pitch)*v.dist,v.target[2]+Math.cos(v.yaw)*Math.cos(v.pitch)*v.dist];
 const person=EngineerStationLayout.worldPoint(EngineerStationLayout.character);person[1]+=EngineerStationLayout.height*.62;
 const dx=eye[0]-person[0],dy=eye[1]-person[1],dz=eye[2]-person[2],dist=Math.hypot(dx,dy,dz);
 const yaw=Math.atan2(dx,dz)-.09,pitch=Math.asin(dy/dist),target=[eye[0]-Math.sin(yaw)*Math.cos(pitch)*dist,eye[1]-Math.sin(pitch)*dist,eye[2]-Math.cos(yaw)*Math.cos(pitch)*dist];
 return {yaw,pitch,dist,target};
})();
const phoneViews={...mobileViews,overview:phoneHomeView,about:{yaw:.68,pitch:.158,dist:3.503,target:[-10.203,1.27,-.085]},engineerApproach:{yaw:.68,pitch:.158,dist:3.503,target:[-10.203,1.27,-.085]},conveyor:{yaw:1.57,pitch:.26,dist:1.95,target:[6.43,1.77,-.65]}};
const journey=[[0,'overview'],[.045,'overview'],[.095,'engineerApproach'],[.14,'about'],[.275,'about'],[.31,'productionApproach'],[.35,'conveyor'],[.405,'conveyor'],[.47,'assembly'],[.49,'assembly'],[.535,'exit'],[.545,'exit']];
const releaseCommunicationsCamera=CommunicationsCamera.bind(canvas);
const onCameraResize=()=>{snapCamera=true;};window.addEventListener('resize',onCameraResize);let parallelCutaway=false,snapCamera=false,followCarrierId=null;const cameraVelocity={};let cameraSnapshot=null,previousProgress=0,latestProgress=0;
function spring(key,current,target,dt){
 if(reduced||snapCamera)return target;
 const omega=5.5,x=current-target,v=cameraVelocity[key]||0,e=Math.exp(-omega*dt),temp=(v+omega*x)*dt;
 cameraVelocity[key]=(v-omega*temp)*e;return target+(x+temp)*e;
}
function guidedView(p,views){
 let i=0;while(i<journey.length-2&&p>journey[i+1][0])i++;
 const a=journey[i],b=journey[i+1],u=WorkshopSystem.ease((p-a[0])/(b[0]-a[0]));
 const av=views[a[1]],bv=views[b[1]],v={target:av.target.map((x,j)=>lerp(x,bv.target[j],u))};
 for(const k of ['yaw','pitch','dist'])v[k]=lerp(av[k],bv[k],u);
 return v;
}
function receptionCameraClearance(eye){
 const z=eye[2];if(z>-18.5||z<-30.5)return eye;
 const amount=WorkshopSystem.ease((-z-18.5)/3.0)*(1-WorkshopSystem.ease((-z-26.6)/3.9));
 eye[0]=lerp(eye[0],clamp(eye[0],-.68,.68),amount);eye[1]=lerp(eye[1],Math.min(2.65,eye[1]),amount);return eye;
}
function update(ms,p=0,offsetY=0,offsetX=0,renderOptions={}){
 const frameStarted=performance.now();renderMetrics.drawCalls=0;let dt=Math.max(0,Math.min(.25,(ms-oldTime)/1000));oldTime=ms;frame++;
 const seconds=ms/1000,intro=window.__kiraSequence;if(document.hidden)dt=0;
 latestProgress=p;CommunicationsPhone.update(dt,p);
 CommunicationsCamera.enabled=p>=.98&&!intro?.active&&!renderOptions.study&&!CommunicationsPhone.active;
 canvas.classList.toggle('comms-camera-ready',CommunicationsCamera.enabled);
 if(Math.abs(p-previousProgress)>.0015&&!intro?.active&&factory.camera!=='guided')selectStation('guided');
 previousProgress=p;
 const isNarrow=canvas.clientWidth<800,views={...(isNarrow?mobileViews:desktopViews),...((canvas.clientWidth<1040||canvas.clientWidth/canvas.clientHeight<1.4)?{about:mobileViews.about,engineerApproach:mobileViews.engineerApproach}:{})};
 if(phoneUIQuery.matches)Object.assign(views,phoneViews);
 let phoneShowcaseRect=null;
 if(phoneUIQuery.matches&&p>=.30&&p<.42){const showcase=document.getElementById('productionShowcase');if(showcase&&!showcase.closest('.project-discovery')?.hidden){phoneShowcaseRect=showcase.getBoundingClientRect();if(phoneShowcaseRect.width>0&&phoneShowcaseRect.height>0)views.conveyor.dist=clamp(1.28*phoneShowcaseRect.height/(.70*phoneShowcaseRect.width*2*Math.tan(24*Math.PI/180)),1.70,2.45);}}
 const intent=window.WorkshopNavigation?.getState().intent;
 // Follow the selected box from preparation under the selection cover until
 // its inspection finishes. Translation follows the physical workpiece;
 // the camera widens gradually as the shuttle approaches the robot.
 const followBox=phoneUIQuery.matches&&!reduced&&!intro?.active&&!renderOptions.study&&controller.job&&!controller.studyReleased?controller.snapshot():null;
 const following=!!followBox;
 if(following&&followCarrierId!==followBox.job.carrierId)snapCamera=true;
 followCarrierId=followBox?.job.carrierId||null;
 const approach=following?WorkshopSystem.ease((6.43-followBox.component[0])/7.05):0;
 const emergence=following?WorkshopSystem.ease((followBox.component[2]+4.6)/1.8):0;
 // Establish the open magazine mouth first; start translating once the box
 // clears it, rather than looking through the opaque hood at its hidden spawn.
 const followView=following?{yaw:lerp(lerp(.20,1.1,emergence),.65,approach),pitch:lerp(lerp(.26,.45,emergence),.38,approach),dist:lerp(4.9,7.0,approach),target:[followBox.component[0],followBox.component[1]+.12,Math.max(-4.6,followBox.component[2])]}:null;
 // Selection pulls out to the overview, then approaches the arm directly.
 // Page progress still crosses the other chapter marks; those marks must not
 // briefly retarget the camera back to the conveyor during this direct journey.
 const directWorkcellTransition=following||['delivery','assembly'].includes(intent?.destination);
 const directView=intent?.destination==='delivery'?views.overview:intent?.destination==='assembly'?views.assembly:null;
 const labFocus=!renderOptions.study&&CommunicationsRoom.inRange(p)?CommunicationsRoom.viewAt(p,isNarrow):!renderOptions.study&&EngineeringLab.inRange(p)?EngineeringLab.viewAt(p,views,isNarrow):null;
 const focus=followView||(factory.camera==='guided'?(labFocus||directView||guidedView(p,views)):(views[factory.camera]||views.overview));
 const inspecting=!following&&['assembly','conveyor'].includes(factory.camera);
 const homeLook=!following&&phoneUIQuery.matches&&!intro?.active&&!renderOptions.study&&p<.04;
 // The landing camera is fixed in place. Only the view direction changes: the
 // eye stays anchored to the overview position and the look target sweeps
 // around it, so a drag spins the room instead of moving through it.
 const homeEye=homeLook?[focus.target[0]+Math.sin(focus.yaw)*Math.cos(focus.pitch)*focus.dist,focus.target[1]+Math.sin(focus.pitch)*focus.dist,focus.target[2]+Math.cos(focus.yaw)*Math.cos(focus.pitch)*focus.dist]:null;
 const focusTarget=homeLook?homeEye:focus.target;
 state.wantYaw=focus.yaw+(inspecting?clamp(offsetY,-.45,.45)*.4:homeLook?clamp(offsetY,-.90,.06):0);
 state.wantPitch=focus.pitch+(inspecting?clamp(offsetX,-.3,.3)*.4:homeLook?offsetX:0);
 state.wantDist=focus.dist;state.wCamTarget=focusTarget.slice();
 for(const key of ['yaw','pitch','dist'])state[key]=spring(key,state[key],state['want'+key[0].toUpperCase()+key.slice(1)],dt);
 if(homeLook)state.yaw=clamp(state.yaw,focus.yaw-.90,focus.yaw+.06);
 if(homeLook){
  const sx=Math.sin(state.yaw)*Math.cos(state.pitch),sy=Math.sin(state.pitch),sz=Math.cos(state.yaw)*Math.cos(state.pitch);
  state.camTarget[0]=homeEye[0]-sx*state.dist;
  state.camTarget[1]=homeEye[1]-sy*state.dist;
  state.camTarget[2]=homeEye[2]-sz*state.dist;
 }else{
  for(let i=0;i<3;i++){state.camTarget[i]=following?focusTarget[i]:spring('target'+i,state.camTarget[i],focusTarget[i],dt);if(following)cameraVelocity['target'+i]=0;}
 }
 if(snapCamera){for(const key of Object.keys(cameraVelocity))cameraVelocity[key]=0;snapCamera=false;}
parallelCutaway=!intro?.active&&(following||factory.camera==='conveyor'||factory.camera==='guided'&&p>.30&&p<.42&&state.yaw>1.27);
 for(const column of conveyorCutawayPillars)column.visible=!parallelCutaway;
 for(const lights of dressing.conveyorColumnLights)lights.visible=!parallelCutaway;
// The factory clock owns the robot, shuttle, conveyor, QC and monitoring station.
 // The selected shot never resets or interrupts a manufacturing cycle.
 updateFactory(dt,ms);

 // Secondary scene choreography, independently animated from the main cell.
 const ambientSpeed=(reduced||controller.paused?0:state.speed);
 // Conveyor packages are now coordinated with the real shuttle and sensor state.
 if(ambientSpeed){trolley.p[0]=3.05+Math.sin(factory.totalTime*.11)*.45;hook.p[1]=4.85+.07*Math.sin(factory.totalTime*.19);}
 for(let i=0;i<kiraBeacons.length;i++)kiraBeacons[i].emit=.12 + Math.max(0,Math.sin(seconds*2.0*ambientSpeed-i*.55))*.31;
 const portalApproach=p>.49||factory.camera==='exit'||!!labKiraRoute.path;
 const open=(portalApproach?1:0);
 doorLeft.p[0]=damp(doorLeft.p[0],-.94-open*.96,1.5,dt);
 doorRight.p[0]=damp(doorRight.p[0],.94+open*.96,1.5,dt);
 // Kira stays behind the workcell safety line and tracks machinery or the cursor.
 updateKira(ms,dt,p,intro);
 // The maintenance bay cannot simply disappear at the loader UI's completion.
 // Keep the same geometry alive through the handoff and give the doorway a real
 // departing sequence: once Kira has crossed, the open entrance and rear bay
 // retreat together behind the widening hall camera. Visibility at the final state is already zero,
 // so removing the loading UI cannot change any visible pixels.
 const entryProgress=intro?.entering?clamp(intro.progress,0,1):(intro?.active?0:1);
 const opened=smoothEntry((entryProgress-.10)/.26);
 // Leave the sliding leaves parked open while the visitor crosses the threshold.
 // Closing them in front of the camera would obscure both Kira and the hall.
 const gateAperture=opened;
 gateL.p[0]=mixEntry(-1.04,-2.95,gateAperture);
 gateR.p[0]=mixEntry(1.04,2.95,gateAperture);
 const bayRetire=smoothEntry((entryProgress-.855)/.112);
 const gateRetire=smoothEntry((entryProgress-.855)/.112);
 entryBay.alpha=1-bayRetire;
 entryGate.alpha=1-gateRetire;
 entryBay.visible=entryBay.alpha>.001;
 entryGate.visible=entryGate.alpha>.001;
 dockPulse.emit=(intro?.active?.08:0)+Math.max(0,Math.sin(seconds*2.3))*.26;
 for(const light of entryLighting)light.emit=(intro?.entering?mixEntry(.12,.82,opened):intro?.stage>=2?.37:.12)*(1-bayRetire);
 // As the camera cranes into the hall, bay lights dim gradually with the
 // supporting architecture, without a last-frame visibility switch.
 const portal=careerLab.parts.reception;
 const portalCamera=[state.camTarget[0]+Math.sin(state.yaw)*Math.cos(state.pitch)*state.dist,state.camTarget[1]+Math.sin(state.pitch)*state.dist,state.camTarget[2]+Math.cos(state.yaw)*Math.cos(state.pitch)*state.dist];
 portal.update(dt,ms,{progress:p,camera:receptionCameraClearance(portalCamera),kira:kira.robot.p,kiraInReception:labKiraRoute.branch==='communications',destination:window.WorkshopNavigation?.getState().intent?.destination,reduced});
 portal.visible=!intro?.active&&p>.49&&!renderOptions.study;
 careerLab.root.visible=!intro?.active&&p>.49&&(p<.975||portal.openAmount>.001)&&!renderOptions.study;
 mainAssemblyWorld.visible=(!EngineeringLab.inRange(p)&&!CommunicationsRoom.inRange(p))||p<.655;
 communications.update(dt,ms,!intro?.active&&(p>.87||portal.openAmount>.001||portal.requested)&&!renderOptions.study);
 // Keep the assembly stand out of the floating project presentation.
 plinth.visible=!renderOptions.study;
 const shadowCalls=shadows.render(!intro?.active&&!renderOptions.study&&mainAssemblyWorld.visible);
 gl.bindFramebuffer(gl.FRAMEBUFFER,renderOptions.target||null);
 const rasterWidth=renderOptions.width||canvas.width,rasterHeight=renderOptions.height||canvas.height;
 const w=canvas.clientWidth,h=canvas.clientHeight;gl.viewport(0,0,rasterWidth,rasterHeight);
 let dist=state.dist;let eye=[state.camTarget[0]+Math.sin(state.yaw)*Math.cos(state.pitch)*dist,state.camTarget[1]+Math.sin(state.pitch)*dist,state.camTarget[2]+Math.cos(state.yaw)*Math.cos(state.pitch)*dist];let target=state.camTarget.slice();let isMobile=w<800;
 // The east-side conveyor shot crosses the front structural bay. Keep the
 // camera in a smooth foreground corridor while its orbit springs catch up;
 // interpolating yaw/target separately can otherwise sweep through this column.
 if(!following&&!intro?.active&&p<.545){const clearance=WorkshopSystem.ease((1.90-Math.abs(eye[0]-10.35))/1.35);eye[2]+=Math.max(0,3.05-eye[2])*clearance;}
 // The rear portal is the only passage between the two rooms, including quick
 // direct navigation from an off-axis camera shot. Ease into its clear corridor.
 if(EngineeringLab.inRange(p)&&eye[2]<-7&&eye[2]>-12.2){const enter=WorkshopSystem.ease((-eye[2]-7)/1.8),leave=1-WorkshopSystem.ease((-eye[2]-11.2)/1);eye[0]*=1-enter*leave;eye[1]=lerp(eye[1],Math.min(3.65,eye[1]),enter*leave);}

 if(!intro?.active&&!renderOptions.study&&p>.49)eye=receptionCameraClearance(eye);
 if(intro?.active){
  if(intro.entering){const cam=entryCameraPath(intro.progress,eye,target,isMobile);eye=cam.eye;target=cam.target;}
  else{eye=(isMobile?INITIAL_EYE_MOBILE:INITIAL_EYE_DESKTOP).slice();target=INITIAL_TARGET.slice();}
 }
 const mobileAbout=(w<1040||w/h<1.4)&&!intro?.active&&!directWorkcellTransition?WorkshopSystem.ease((p-.095)/.045)*(1-WorkshopSystem.ease((p-.275)/.035)):0;
 const mobileProduction=(w<1040||w/h<1.4)&&!intro?.active&&!directWorkcellTransition?WorkshopSystem.ease((p-.295)/.04)*(1-WorkshopSystem.ease((p-.405)/.035)):0;
 const mobileLab=(w<1040||w/h<1.25)&&!intro?.active&&EngineeringLab.inRange(p)?WorkshopSystem.ease((p-.64)/.045):0;
 const mobileComms=(w<1040||w/h<1.25)&&!intro?.active&&CommunicationsRoom.inRange(p)?WorkshopSystem.ease((p-.967)/.013):0;
 const mobileSplit=Math.max(mobileAbout,mobileProduction,mobileLab,mobileComms);
 let viewTop=65*mobileSplit,viewHeight=lerp(h,h*.45-65,mobileSplit);
 if(mobileLab>.98){viewTop=72;viewHeight=EngineeringLab.getState().mode==='overview'?h-72:Math.max(48,h*.40-72);}
 if(mobileLab>.98&&window.LabPhone?.active){const viewport=LabPhone.viewport();viewTop=viewport.top;viewHeight=viewport.height;}

 if(phoneUIQuery.matches&&mobileProduction>.98&&phoneShowcaseRect){const top=Math.max(65,phoneShowcaseRect.top),bottom=Math.min(h,phoneShowcaseRect.bottom);if(bottom-top>40){viewTop=top;viewHeight=bottom-top;}}
 if(CommunicationsPhone.active&&mobileComms>.98){viewTop=CommunicationsPhone.top;viewHeight=h-viewTop-CommunicationsPhone.safeBottom;}
 const phoneLabWidth=mobileLab>.98&&window.LabPhone?.active?LabPhone.viewport().width||w:w,aspect=phoneLabWidth/viewHeight;
 gl.viewport(0,Math.round((h-viewTop-viewHeight)/h*rasterHeight),Math.round(phoneLabWidth/w*rasterWidth),Math.round(viewHeight/h*rasterHeight));
 const labWide=EngineeringLab.inRange(p)?(1-WorkshopSystem.ease((p-.70)/.075))*(WorkshopSystem.ease((p-.63)/.07)):0;const commBlend=!intro?.active&&CommunicationsRoom.inRange(p)?WorkshopSystem.ease((p-.967)/.023):0;const baseFov=((isMobile?(homeLook?46:48):44)+labWide*(window.__labFovBoost??6))*Math.PI/180;const commFov=Math.min(2*Math.atan(1/aspect),(w<1040?72:58)*Math.PI/180);const fov=lerp(baseFov,CommunicationsPhone.active?CommunicationsPhone.fov(aspect):commFov,commBlend);
 if(!intro?.active&&!renderOptions.study&&p>=.975)target=CommunicationsCamera.apply(eye,target,WorkshopSystem.ease((p-.975)/.015),{fov,aspect});
 if(!intro?.active&&!renderOptions.study)({eye,target}=CommunicationsCamera.compose(eye,target,dt,p,{fov,aspect}));
 if(!intro?.active&&!renderOptions.study&&EngineeringLab.inRange(p)&&window.LabPhone?.active){
  const look=LabPhone.getLook(),delta=eye.map((n,i)=>n-target[i]),distance=Math.hypot(...delta),yaw=Math.atan2(delta[0],delta[2])+look.yaw,pitch=clamp(Math.asin(delta[1]/distance)+look.pitch,-.7,.7);
  target=[eye[0]-Math.sin(yaw)*Math.cos(pitch)*distance,eye[1]-Math.sin(pitch)*distance,eye[2]-Math.cos(yaw)*Math.cos(pitch)*distance];
 }
 cameraSnapshot={eye:eye.slice(),target:target.slice(),fov,aspect,followCarrierId,viewport:{top:viewTop,height:viewHeight,...(phoneLabWidth!==w?{width:phoneLabWidth}:{})}};
 updateOfficeEngineer();
 window.EngineerAbout?.update({progress:p,camera:cameraSnapshot,ms,avatar:engineerRenderer.avatar,layout:engineerStation.layout});
 // Reveal discovery only once the rendered camera has arrived at the belt.
 // The section lease still parks machinery earlier, while the camera approaches.
 const conveyorYawError=Math.abs(Math.atan2(Math.sin(state.yaw-views.conveyor.yaw),Math.cos(state.yaw-views.conveyor.yaw)));
 const conveyorArrived=['guided','conveyor'].includes(factory.camera)&&conveyorYawError<.10&&Math.hypot(...state.camTarget.map((n,i)=>n-views.conveyor.target[i]))<.55&&Math.abs(state.dist-views.conveyor.dist)<.9;
 window.ProductionDiscovery.update({progress:p,snapshot:factory,conveyorArrived,ms});
 EngineeringLab.update({p,ms,dt,camera:cameraSnapshot,room:careerLab});CommunicationsInterface.update(p,cameraSnapshot);
 const hallLook=intro?.active?(intro.entering?WorkshopSystem.ease((intro.progress-.72)/.24):0):1;dressing.update(hallLook);
 const vp=M.mul(M.pers(fov,aspect,.07,120),M.look(eye,target));gl.bindVertexArray(null);gl.useProgram(prog);gl.uniformMatrix4fv(loc.uVP,false,vp);gl.uniform3fv(loc.uCamera,eye);gl.uniform3fv(loc.uKira,kira.robot.p);gl.uniform1f(loc.uCommunicationsTime,CommunicationsRoom.time);gl.uniform1f(loc.uPhoneOffice,CommunicationsPhone.amount);gl.uniform1f(loc.uPhoneRoomHeight,3.6*CommunicationsPhone.roomScale[1]);gl.uniform4fv(loc.uLabEnvironment,careerLab.environment?.uniform||[0,1,0,0]);gl.uniform4fv(loc.uLabFocus,[...(careerLab.focus?.point||[-5,2,-21.7]),careerLab.focus?.intensity||0]);gl.uniform3fv(loc.uPart,factory.component);gl.uniform1f(loc.uHallMix,hallLook);gl.uniform1f(loc.uShadowOn,shadows.enabled&&!intro?.active&&!renderOptions.study?1:0);gl.uniformMatrix4fv(loc.uShadowVP,false,shadows.vp);gl.uniform1i(loc.uShadowMap,2);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,shadows.texture);gl.activeTexture(gl.TEXTURE0);gl.uniform1f(loc.uEntryMix,intro?.active?1:0);gl.uniform1f(loc.uDetail,canvas.clientWidth>=800&&window.__workshopQuality!=='low'?1:0);gl.uniform1f(loc.uTask,factory.phase==='inspection'||hoveredStation==='assembly'?1:0);gl.enableVertexAttribArray(loc.aPosition);gl.enableVertexAttribArray(loc.aNormal);gl.enableVertexAttribArray(loc.aUV);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);gl.disable(gl.CULL_FACE);gl.clearColor(.032,.052,.068,1);gl.disable(gl.BLEND);gl.depthMask(true);bayBlendActive=false;gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.bindTexture(gl.TEXTURE_2D,null);draw(scene,M.I());const officeActor=communications.root.visible&&(p>=.975||portal.openAmount>.001);engineerRenderLayout.height=engineerStation.layout.height*(officeActor?CommunicationsPhone.engineerScale:1);renderMetrics.drawCalls+=shadowCalls+engineerRenderer.render(vp,eye,dt,!intro?.active&&(mainAssemblyWorld.visible||officeActor),shadows,officeActor?{position:CommunicationsLayout.point(CommunicationsPhone.engineerPosition),yaw:Math.PI/2}:null);if(officeActor)renderMetrics.drawCalls+=engineerRenderer.renderLaptop(vp,eye,{position:CommunicationsLayout.point(CommunicationsPhone.laptopPosition),yaw:CommunicationsLayout.laptopYaw,scale:CommunicationsLayout.scale.laptop*(CommunicationsPhone.active?.65:1)},communications.laptopScreen?.texture);gl.disable(gl.BLEND);gl.depthMask(true);bayBlendActive=false;gl.bindVertexArray(null);renderMetrics.frames++;renderMetrics.frameMs=damp(renderMetrics.frameMs,performance.now()-frameStarted,2,Math.max(.016,dt));return {phase:state.phaseLabel,kira:kira.robot.p.slice(),kiraPitch:kira.robot.r[0],camera:{eye:eye.slice(),target:target.slice()},contact:{front:trackSurface(kira.robot.p[2]-.435),rear:trackSurface(kira.robot.p[2]+.435)},exit:{bayOpacity:entryBay.alpha,gateOpacity:entryGate.alpha,gateAperture}};
}


// Station selection is available through both ray-picked machinery and semantic controls.
const bar=document.createElement('div');bar.className='hall-focus-tools';bar.id='hallFocusTools';
bar.setAttribute('role','group');bar.setAttribute('aria-label','Workshop cameras and demonstration controls');
bar.innerHTML=`<span class="hall-focus-label">MAIN ASSEMBLY HALL <span> / SCROLL TO EXPLORE</span></span>
 <div class="hall-station-buttons">
  <button type="button" data-hall="overview" aria-pressed="true">OVERVIEW</button>
  <button type="button" data-hall="about" aria-pressed="false">MEET SARITH</button>
  <button type="button" data-hall="assembly" aria-pressed="false">ASSEMBLY</button>
  <button type="button" data-hall="intelligence" aria-pressed="false">CONTROL</button>
  <button type="button" data-hall="conveyor" aria-pressed="false">CONVEYOR</button>
  <button type="button" data-hall="exit" aria-pressed="false">EXIT</button>
 </div>
 <div class="hall-operation-buttons">
  <button type="button" id="hallGreet" title="Greet Kira">KIRA ↗</button>
  <button type="button" id="hallPause" aria-pressed="false">PAUSE</button>
  <button type="button" id="hallRestart" aria-label="Finish this cycle and restart safely" title="Finish this cycle and restart safely">↻</button>
  <label class="hall-quality-label"><span class="hall-sr-only">Rendering quality</span><select id="hallQuality" aria-label="Rendering quality"><option value="auto">AUTO</option><option value="high">HIGH</option><option value="balanced">BALANCED</option><option value="low">LIGHT</option></select></label>
 </div>
 <span id="hallLive" role="status" aria-live="polite">SYSTEM READY</span>`;
const showDebugControls=new URLSearchParams(location.search).has('workshopDebug');
if(showDebugControls)canvas.parentNode.appendChild(bar);else{bar.hidden=true;bar.inert=true;}
const panel=document.createElement('section');panel.className='hall-station-info';panel.hidden=true;
panel.setAttribute('aria-label','Selected workshop station');
panel.innerHTML=`<button type="button" id="hallReturn">↶ BACK TO WORKSHOP</button><span id="hallStationKicker"></span>
 <h2 id="hallStationTitle"></h2><p id="hallStationDescription"></p>
 <div class="hall-display-modes" role="group" aria-label="Control display mode" hidden>
 <button type="button" data-display="twin" aria-pressed="true">TWIN</button><button type="button" data-display="control" aria-pressed="false">SIGNALS</button><button type="button" data-display="software" aria-pressed="false">LOGIC</button></div>
 <div class="hall-process"><span id="hallPart"></span><strong id="hallStationStatus"></strong><p id="hallProcessDescription"></p><div class="hall-process-track"><i id="hallProcessFill"></i></div></div>
 <details class="hall-joint-details" hidden><summary>JOINT TRANSFORM MATRICES</summary><p>Parent-local 4 × 4 transforms, computed from the simulated joint nodes. Translations use scene units; column-vector convention.</p><div id="hallJointMatrices"></div></details>
 <small>SCRIPTED MANUFACTURING DEMONSTRATION</small>`;
const jointDetails=panel.querySelector('.hall-joint-details'),jointReadout=panel.querySelector('#hallJointMatrices');
for(let i=0;i<5;i++){const item=document.createElement('article'),label=document.createElement('h3'),matrix=document.createElement('pre');item.append(label,matrix);jointReadout.append(item);}
function updateJointReadout(){lastTwinMatrices.forEach((joint,i)=>{const item=jointReadout.children[i];item.firstChild.textContent=joint.code+' / '+joint.name+' · '+(joint.angle*180/Math.PI).toFixed(1)+'°';item.lastChild.textContent=Array.from({length:4},(_,r)=>Array.from({length:4},(_,col)=>{const n=joint.matrix[col*4+r],v=Math.abs(n)<.0005?0:n;return (v<0?'':' ')+v.toFixed(3);}).join('  ')).join('\n');});}
jointDetails.addEventListener('toggle',()=>{if(jointDetails.open)updateJointReadout();});
canvas.parentNode.appendChild(panel);
const hoverHint=document.createElement('div');hoverHint.className='hall-hover-hint';hoverHint.hidden=true;hoverHint.setAttribute('aria-hidden','true');canvas.parentNode.appendChild(hoverHint);
const stationInfo={
 assembly:['02 / PHYSICAL EXECUTION','SENSE. THINK. ACT.','An articulated manipulator receives a cartridge, places it in the rotary fixture, and clears the optical inspection path. Drag gently to inspect.'],
 intelligence:['01 / COMPUTATION & CONTROL','THE INTELLIGENCE.','Three computing cabinets coordinate sensing, motion, and quality. The display follows the actual component ownership and arm joints in this demonstration.'],
 conveyor:['03 / COMPONENT DELIVERY','FOLLOW THE COMPONENT.','A position-triggered optical sensor stops the roller line. A guided cross slide lifts the cartridge and delivers it to the arm. Drag gently to inspect.'],
 exit:['04 / WORKSHOP THRESHOLD','THE NEXT CHAPTER.','The rear doorway marks the continuation of the workshop. Return to the hall or use the portfolio navigation to keep exploring.']
};
function selectStation(name){
 factory.camera=name;hoveredStation=null;hoverHint.hidden=true;document.body.dataset.hallStation=name;const info=stationInfo[name];
 document.body.classList.toggle('hall-inspecting',!!info);panel.hidden=!info;
 if(info){panel.querySelector('#hallStationKicker').textContent=info[0];panel.querySelector('#hallStationTitle').textContent=info[1];panel.querySelector('#hallStationDescription').textContent=info[2];}
 panel.querySelector('.hall-display-modes').hidden=name!=='intelligence';
 jointDetails.hidden=name!=='intelligence';
 bar.querySelectorAll('[data-hall]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.hall===(name==='guided'?'overview':name))));
 window.dispatchEvent(new Event('workshop:camera-changed'));
}
function onHallClick(e){
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.hall==='about'||b.dataset.hall==='overview')window.WorkshopNavigation?.navigate(b.dataset.hall);
 else if(b.dataset.hall)selectStation(b.dataset.hall);
 else if(b.id==='hallPause')controller.paused=!controller.paused;
 else if(b.id==='hallRestart')resetFactory();
 else if(b.id==='hallGreet')acknowledge();
}
function onPanelClick(e){
 const b=e.target.closest('button');if(!b)return;
 if(b.id==='hallReturn'){if(window.WorkshopNavigation)WorkshopNavigation.navigate('overview');else selectStation('guided');(showDebugControls?bar.querySelector('[data-hall="overview"]'):document.querySelector('.brand')).focus({preventScroll:true});}
 if(b.dataset.display){displayMode=b.dataset.display;lastTwinLabel='';panel.querySelectorAll('[data-display]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}
}
function onQuality(e){window.__workshopQuality=e.target.value;}
function onEscape(e){if(e.key==='Escape'&&document.body.classList.contains('hall-inspecting'))selectStation('guided');}
const bounds={lab:[[-1.8,.1,-9.55],[1.8,4.4,-8.95]],about:EngineerStationLayout.bounds,assembly:[[-3.15,.2,-1.62],[2.2,3.65,1.65]],intelligence:[[-9.4,.05,-5.65],[-4.65,4.48,-2.65]],conveyor:[[5.2,.45,-5.8],[7.66,1.6,3.93]]};
const normalize=a=>{const l=Math.hypot(...a)||1;return a.map(x=>x/l)};
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function pick(clientX,clientY){
 if(window.ProjectStudy?.active||!cameraSnapshot||(latestProgress>=.535&&!EngineeringLab.inRange(latestProgress)&&!CommunicationsRoom.active)||window.__kiraSequence?.active)return null;
 const r=canvas.getBoundingClientRect(),top=cameraSnapshot.viewport?.top||0,height=cameraSnapshot.viewport?.height||r.height;
 if(clientY-r.top<top||clientY-r.top>top+height)return null;
 const pickWidth=cameraSnapshot.viewport?.width||r.width;if(clientX-r.left>pickWidth)return null;
 const nx=(clientX-r.left)/pickWidth*2-1,ny=1-(clientY-r.top-top)/height*2;
 const {eye,target,fov,aspect}=cameraSnapshot,forward=normalize(target.map((x,i)=>x-eye[i]));
 const right=normalize(cross(forward,[0,1,0])),up=cross(right,forward),h=Math.tan(fov/2);
 const dir=normalize(forward.map((x,i)=>x+right[i]*nx*h*aspect+up[i]*ny*h));
 const ep=CommunicationsLayout.point(CommunicationsPhone.engineerPosition);
 const officeBounds=(a,b,kind)=>{if(kind){a=CommunicationsPhone.officePoint(a,kind);b=CommunicationsPhone.officePoint(b,kind);}const pts=[];for(const x of [a[0],b[0]])for(const y of [a[1],b[1]])for(const z of [a[2],b[2]])pts.push(CommunicationsLayout.point([x,y,z]));return [0,1].map(end=>[0,1,2].map(i=>(end?Math.max:Math.min)(...pts.map(p=>p[i]))));};
 const candidates=CommunicationsRoom.active?{officeCars:officeBounds([-5.78,1.49,1.16],[-5.12,2.57,2.72],'workstation'),officeCradle:officeBounds([-2.10,.85,-1.55],[-1.56,1.27,-1.10],'desk'),officeEngineer:[[ep[0]-.3,ep[1],ep[2]-.3],[ep[0]+.3,ep[1]+1.5*CommunicationsPhone.engineerScale,ep[2]+.3]],kira:[[kira.robot.p[0]-.37,0,kira.robot.p[2]-.4],[kira.robot.p[0]+.37,.99,kira.robot.p[2]+.4]]}:EngineeringLab.inRange(latestProgress)?{skills:EngineeringLabLayout.stationBounds,experience:EngineeringLabLayout.archiveBounds,kira:[[kira.robot.p[0]-.52,0,kira.robot.p[2]-.55],[kira.robot.p[0]+.52,1.32,kira.robot.p[2]+.55]]}:latestProgress>=.10&&latestProgress<.30?{about:bounds.about}:{...bounds,...productionStation.pickBounds(),kira:[[kira.robot.p[0]-.52,.0,kira.robot.p[2]-.55],[kira.robot.p[0]+.52,1.32,kira.robot.p[2]+.55]]};
 let hit=null,distance=Infinity;
 for(const [name,[min,max]] of Object.entries(candidates)){
  let near=0,far=Infinity;
  for(let i=0;i<3;i++){
   if(Math.abs(dir[i])<1e-8){if(eye[i]<min[i]||eye[i]>max[i])far=-1;continue;}
   const a=(min[i]-eye[i])/dir[i],b=(max[i]-eye[i])/dir[i];near=Math.max(near,Math.min(a,b));far=Math.min(far,Math.max(a,b));
  }
  if(far>=near&&near<distance){hit=name;distance=near;}
 }
 return hit;
}
let pointerDown=null;
function onSceneDown(e){if(e.target===canvas)pointerDown=[e.clientX,e.clientY];}
function noticeEngineer(x,y,engaged){
 const avatar=engineerRenderer.avatar;if(!avatar)return;
 if(!engaged||!cameraSnapshot){avatar.lookAtTarget(0,0);return;}
 const c=cameraSnapshot,p=EngineerStationLayout.worldPoint(EngineerStationLayout.character);p[1]+=1.20;
 const forward=normalize(c.target.map((v,i)=>v-c.eye[i])),right=normalize(cross(forward,[0,1,0])),up=cross(right,forward),v=p.map((n,i)=>n-c.eye[i]),dot=(a,b)=>a.reduce((s,n,i)=>s+n*b[i],0),depth=dot(v,forward),h=Math.tan(c.fov/2),r=canvas.getBoundingClientRect();
 const cx=r.left+r.width*(.5+dot(v,right)/(2*depth*h*c.aspect)),cy=r.top+(c.viewport?.top||0)+(c.viewport?.height||r.height)*(.5-dot(v,up)/(2*depth*h));
 avatar.lookAtTarget((x-cx)/(r.width*.18)*.26,(y-cy)/(r.height*.18)*.10);
}
function onSceneMove(e){
 if(e.target!==canvas||e.pointerType==='touch'){hoveredStation=null;hoverHint.hidden=true;engineerRenderer.avatar?.lookAtTarget(0,0);return;}
 hoveredStation=pick(e.clientX,e.clientY);careerLab.hover=EngineeringLab.getState().active?hoveredStation:null;noticeEngineer(e.clientX,e.clientY,hoveredStation==='about');canvas.classList.toggle('station-hover',!!hoveredStation);
 hoverHint.hidden=!hoveredStation;
 if(hoveredStation){hoverHint.textContent=hoveredStation.startsWith('project:')?(WorkshopProjectRegistry.get(hoveredStation.slice(8))?.shortName+' / SELECT ↗'):hoveredStation==='officeCars'?'CAR COLLECTION / INSPECT':hoveredStation==='officeCradle'?"NEWTON'S CRADLE / RELEASE":hoveredStation==='officeEngineer'?'SAY HELLO ?':hoveredStation==='about'?(latestProgress>=.10&&latestProgress<.30?'SAY HELLO ↗':'MEET SARITH ↗'):hoveredStation==='kira'?'KIRA / SAY HELLO ↗':({assembly:'ASSEMBLY CELL',intelligence:'DIGITAL CONTROL',conveyor:'PROJECT DISCOVERY',lab:'ENGINEERING & CAREER LAB',skills:'ENGINEERING TOOLBOX',experience:'ARCHIVE SPACE'}[hoveredStation]+' / INSPECT ↗');hoverHint.style.left=Math.min(e.clientX+15,innerWidth-230)+'px';hoverHint.style.top=Math.min(e.clientY+18,innerHeight-80)+'px';}
}
function onSceneUp(e){
 const down=pointerDown;pointerDown=null;if(!down||e.target!==canvas||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6)return;
 const hit=pick(e.clientX,e.clientY);if(hit?.startsWith('project:')){window.ProductionDiscovery.setPreview(hit.slice(8));window.ProductionDiscovery.select(hit.slice(8));}else if(hit==='officeCars'){CommunicationsCamera.inspectCars();}else if(hit==='officeCradle'){communications.kickPendulum();}else if(hit==='officeEngineer'){CommunicationsRoom.behaviour.greet('engineer');}else if(hit==='about'){if(latestProgress>=.10&&latestProgress<.30)engineerRenderer.avatar?.playAcknowledgement();else window.WorkshopNavigation?.navigate('about');}else if(hit==='kira')acknowledge();else if(hit==='lab'||hit==='skills'||hit==='experience')window.WorkshopNavigation.navigate(hit);else if(hit==='conveyor')window.WorkshopNavigation.navigate('production');else if(hit)selectStation(hit);else if(CommunicationsRoom.active){CommunicationsRoom.behaviour.activity();CommunicationsRoom.behaviour.play();}
}
function onSceneLeave(){careerLab.hover=null;engineerRenderer.avatar?.lookAtTarget(0,0);pointerDown=null;hoveredStation=null;hoverHint.hidden=true;canvas.classList.remove('station-hover');}
function onVisibility(){oldTime=performance.now();}
function onJourneyScroll(e){if(window.ProjectStudy?.active)return;CommunicationsCamera.inspectionGoal=0;window.WorkshopNavigation?.cancelIntent();if(latestProgress<.545&&factory.camera!=='guided'&&!e.target.closest?.('.hall-station-info,.hall-focus-tools'))selectStation('guided');}
bar.addEventListener('click',onHallClick);panel.addEventListener('click',onPanelClick);
bar.querySelector('#hallQuality').addEventListener('change',onQuality);window.addEventListener('keydown',onEscape);
window.addEventListener('pointerdown',onSceneDown,{passive:true});window.addEventListener('pointermove',onSceneMove,{passive:true});window.addEventListener('pointerup',onSceneUp,{passive:true});
canvas.addEventListener('pointerleave',onSceneLeave);document.addEventListener('visibilitychange',onVisibility);
window.addEventListener('wheel',onJourneyScroll,{passive:true});window.addEventListener('touchmove',onJourneyScroll,{passive:true});
let hoveredStation=null,lastHud='',lastHudPaused=null,lastQualityAdjustment=0;
const renderMetrics={frames:0,drawCalls:0,frameMs:0,intervalMs:33.3,batches:0};
// Merge rigid mechanical surfaces by material in each moving frame. Geometry is preserved.
// This reduces thousands of small draw calls without batching across articulated joints.
function nodeMatrix(n){return M.mul(M.mul(M.mul(M.mul(M.T(...n.p),M.Y(n.r[1])),M.X(n.r[0])),M.Z(n.r[2])),M.S(...n.s));}
const animatedNodes=new Set([scene,dressing.root,baseYaw,shoulder,elbow,wrist,toolRoll,fingerL,fingerR,plinth,platter,workpiece,
 careerLab.root,careerLab.parts.reception,communications.root,...communications.kit.animated,...careerLab.kit.animated,...workpieceVariants,...productionStation.animated,conveyorDetector,...conveyorCutawayPillars,...dressing.conveyorColumnLights,shuttle,shuttleBogie,outputCarrier,trolley,hook,doorLeft,doorRight,kira.robot,kira.chassis,kira.yawPivot,kira.tiltPivot,kira.eyeRoot,
 ...Object.values(kira.eyeSets),entryBay,entryGate,gateL,gateR,inputGate,outputGate,scanBar,...clampNodes.map(x=>x.node),
 ...conveyor.children.filter(n=>n._roller),...kira.trackData.flatMap(d=>[...d.pieces,...d.wheels])]);
const liveMaterials=new Set([...communications.kit.live,...careerLab.kit.live,...productionStation.live,engineerStation.screen,engineerStation.indicator,twinPanel,gantryLamp,detectionLamp,qualityBeacon,dockLamp,dockPulse,...taskLights,
 ...kiraBeacons,...entryLighting,...serverDots.map(x=>x.node)]);
for(const n of animatedNodes)n._animated=true;
function batchRigidFrame(anchor){
 if(anchor.geometry&&anchor.children.length===0)return;
 const buckets=new Map(),anchors=[];let textureId=0;const textureIds=new Map();
 function visit(n,m){
  if(n!==anchor&&n._animated){anchors.push(n);return;}
  if(n.visible===false)return;
  if(n!==anchor)m=M.mul(m,nodeMatrix(n));
  if(n.geometry&&!liveMaterials.has(n)){
   const tex=n.texture;if(tex&&!textureIds.has(tex))textureIds.set(tex,++textureId);
   const key=[n.color.join(','),n.metal,n.rough,n.finish,n.emit,n.alpha,tex?textureIds.get(tex):0,n.texMode].join('|');
   let list=buckets.get(key);if(!list)buckets.set(key,list=[]);
   let b=list[list.length-1];const count=n.geometry.vertices.length/8;
   if(!b||b.p.length/3+count>60000){b={p:[],n:[],u:[],i:[],sample:n};list.push(b);}
   const offset=b.p.length/3,v=n.geometry.vertices;
   // inverse-transpose of the upper 3x3, up to normalization
   const co=[m[5]*m[10]-m[6]*m[9],m[6]*m[8]-m[4]*m[10],m[4]*m[9]-m[5]*m[8],
    m[9]*m[2]-m[10]*m[1],m[10]*m[0]-m[8]*m[2],m[8]*m[1]-m[9]*m[0],
    m[1]*m[6]-m[2]*m[5],m[2]*m[4]-m[0]*m[6],m[0]*m[5]-m[1]*m[4]];
   for(let j=0;j<v.length;j+=8){
    b.p.push(m[0]*v[j]+m[4]*v[j+1]+m[8]*v[j+2]+m[12],m[1]*v[j]+m[5]*v[j+1]+m[9]*v[j+2]+m[13],m[2]*v[j]+m[6]*v[j+1]+m[10]*v[j+2]+m[14]);
    const nx=co[0]*v[j+3]+co[3]*v[j+4]+co[6]*v[j+5],ny=co[1]*v[j+3]+co[4]*v[j+4]+co[7]*v[j+5],nz=co[2]*v[j+3]+co[5]*v[j+4]+co[8]*v[j+5],l=Math.hypot(nx,ny,nz)||1;
    b.n.push(nx/l,ny/l,nz/l);b.u.push(v[j+6],v[j+7]);
   }
   for(const index of n.geometry.indices)b.i.push(offset+index);
   n._batched=true;
  }
  for(const child of n.children)visit(child,m);
 }
 // The anchor's own transform belongs to its parent; its vertices stay in local space.
 visit(anchor,M.I());
 for(const list of buckets.values())for(const b of list){
  const sample=b.sample,node=anchor.add(new Node(mesh(b.p,b.n,b.u,b.i),sample.color,sample.metal,sample.emit));node._batchDraw=true;
  Object.assign(node,{rough:sample.rough,finish:sample.finish,texture:sample.texture,texMode:sample.texMode,alpha:sample.alpha});renderMetrics.batches++;
 }
 for(const child of anchors)batchRigidFrame(child);
}
batchRigidFrame(scene);
// Catalogue projections blend after the opaque hall batches; otherwise later
// structural batches paint over their depth-write-free translucent surfaces.
// Blend the ghosted sensor after opaque surfaces and before the projections.
reparent(conveyorDetector,scene);conveyorDetector.p=[6.43,1.05,2.35];
scene.children.splice(scene.children.indexOf(productionStation.catalogue),1);scene.children.push(productionStation.catalogue);
const mainAssemblyWorld=group(scene);mainAssemblyWorld._animated=true;for(const node of scene.children.slice())if(node!==mainAssemblyWorld&&node!==careerLab.root&&node!==communications.root&&node!==careerLab.parts.reception&&node!==kira.robot)reparent(node,mainAssemblyWorld);
const shadows=createWorkshopShadows(gl,{M,casters:[robot,plinth],skip:new Set([workpiece,...workpieceVariants,scanBar]),matrixFor:nodeMatrix,resources:gpuResources});
function markRenderBranches(n){let active=!!(n.geometry&&!n._batched)||!!n._animated;for(const child of n.children)active=markRenderBranches(child)||active;n._renderBranch=active;return active;}
markRenderBranches(scene);
const baseUpdate=update;
function augmentedUpdate(ms,p,offsetY,offsetX,renderOptions={}){
 if(!renderOptions.study)renderMetrics.intervalMs=damp(renderMetrics.intervalMs,Math.min(250,ms-oldTime),1,.033);
 const result=baseUpdate(ms,p,offsetY,offsetX,renderOptions),show=!renderOptions.study&&p<.535&&!window.__kiraSequence?.active;
 if(show&&!reduced&&(window.__workshopQuality||'auto')==='auto'&&renderMetrics.frames>120&&ms-lastQualityAdjustment>4000){
  const target=canvas.clientWidth<800?34:18,scale=window.__workshopAutoScale||1;
  if(renderMetrics.intervalMs>target*1.2)window.__workshopAutoScale=Math.max(canvas.clientWidth<800?.75:.65,scale-.1);
  else if(renderMetrics.intervalMs<target*.9&&scale<1)window.__workshopAutoScale=Math.min(1,scale+.05);
  lastQualityAdjustment=ms;
 }
 bar.classList.toggle('is-visible',show&&showDebugControls);
 if(!show){panel.hidden=true;hoverHint.hidden=true;document.body.classList.remove('hall-inspecting');}
 else if(stationInfo[factory.camera]){panel.hidden=false;document.body.classList.add('hall-inspecting');}
 if(lastHud!==factory.id||lastHudPaused!==controller.paused){
  const label=(controller.paused?'PAUSED / ':'')+factory.id;
  bar.querySelector('#hallLive').textContent=label;
  panel.querySelector('#hallPart').textContent=factory.partName+' / '+String(factory.count).padStart(3,'0');
  panel.querySelector('#hallStationStatus').textContent=factory.id;panel.querySelector('#hallProcessDescription').textContent=factory.description;
  const b=bar.querySelector('#hallPause');b.textContent=controller.paused?'RESUME':'PAUSE';b.setAttribute('aria-pressed',String(controller.paused));
  lastHud=factory.id;lastHudPaused=controller.paused;
 }
 bar.querySelector('#hallRestart').textContent=controller.restartRequested?'QUEUED':'↻';
 panel.querySelector('#hallProcessFill').style.width=(factory.progress*100).toFixed(1)+'%';
 return result;
}
window.__communicationsScene={room:communications,getState:()=>({...CommunicationsRoom.getState(),...communications.getState(),progress:latestProgress,camera:cameraSnapshot,look:CommunicationsCamera.getState(),receptionActor:{headYaw:kira.yawPivot.r[1],headTilt:kira.tiltPivot.r[0],eyeScale:kira.eyeRoot.s[1],mood:Object.keys(kira.eyeSets).find(key=>kira.eyeSets[key].visible),trackPhases:kira.trackData.map(d=>d.phase)},proportions:{...CommunicationsLayout.scale,robotInstance:kira.robot.s.slice(),engineerHeight:engineerRenderLayout.height},doorAperture:careerLab.parts.reception.openAmount,portal:careerLab.parts.reception.getDoorState(),metrics:{...renderMetrics},resources:{buffers:gpuResources.buffers.size,textures:gpuResources.textures.size}})};
window.__labScene={room:careerLab,acknowledgeKira:acknowledge,reactKira:kind=>labKiraBehaviour.react(kind),getState:()=>({...careerLab.getState(),controller:EngineeringLab.getState(),camera:cameraSnapshot,kira:kira.robot.p.slice(),sharedKira:true,kiraBehaviour:labKiraBehaviour.getState(),kiraPose:labKiraPose,kiraRoute:labKiraRoute.getState(),portal:careerLab.parts.reception.getDoorState(),doorAperture:Math.abs(doorLeft.p[0]+.94)/.96,metrics:{...renderMetrics},resources:{buffers:gpuResources.buffers.size,textures:gpuResources.textures.size}})};
window.__engineerScene={renderer:engineerRenderer,station:engineerStation,selectStation,getClearances:()=>({platform:EngineerStationLayout.bounds,facing:[Math.sin(EngineerStationLayout.rotation),0,Math.cos(EngineerStationLayout.rotation)],screenWall:EngineerStationLayout.worldPoint(engineerStation.wall.p),supports:pillars.map(p=>p.p.slice()),kira:kira.robot.p.slice(),conveyor:conveyor.p.slice(),rearWall:[0,4.05,-9.75]})};
return {update:augmentedUpdate,kira,ready:true,entered,acknowledge,selectGuided(instant=false){selectStation('guided');if(instant)snapCamera=true;},
 getState:()=>({...controller.snapshot(),position:kira.robot.p.slice()}),
 debugSetFactoryTime(t){controller.seek(t);controller.paused=true;},
 dispose(){
  releaseCommunicationsCamera();productionStation.disposePhoneUI();canvas.classList.remove('comms-camera-ready','comms-dragging');
  window.removeEventListener('resize',onCameraResize);window.removeEventListener('pointermove',onPointer);window.removeEventListener('kira:entered',entered);
  window.removeEventListener('keydown',onEscape);window.removeEventListener('pointerdown',onSceneDown);window.removeEventListener('pointermove',onSceneMove);window.removeEventListener('pointerup',onSceneUp);
  canvas.removeEventListener('pointerleave',onSceneLeave);document.removeEventListener('visibilitychange',onVisibility);
  window.removeEventListener('wheel',onJourneyScroll);window.removeEventListener('touchmove',onJourneyScroll);
  bar.removeEventListener('click',onHallClick);panel.removeEventListener('click',onPanelClick);bar.querySelector('#hallQuality').removeEventListener('change',onQuality);
  window.__communicationsDisposed=true;delete window.__communicationsScene;delete window.__labScene;shadows.dispose();engineerRenderer.dispose();delete window.__engineerScene;
  bar.remove();panel.remove();hoverHint.remove();document.body.classList.remove('hall-inspecting');
  for(const buffer of gpuResources.buffers)gl.deleteBuffer(buffer);for(const texture of gpuResources.textures)gl.deleteTexture(texture);for(const shader of gpuResources.shaders)gl.deleteShader(shader);gl.deleteProgram(prog);
  gpuResources.buffers.clear();gpuResources.textures.clear();gpuResources.shaders.clear();delete window.__workshopDev;
 }};
};
