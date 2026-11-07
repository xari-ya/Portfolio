/* Local workshop lighting; shared actors receive illumination without mesh edits. */
window.CommunicationsLightingGLSL=`
uniform float uCommunicationsTime,uPhoneOffice,uPhoneRoomHeight;
vec3 commLocal(vec3 p){return vec3(-p.z-31.5,p.y+.06,p.x-.5);}
float commMask(vec3 p){vec3 q=commLocal(p);float top=mix(3.6,uPhoneRoomHeight,uPhoneOffice);return (1.-smoothstep(6.,6.12,abs(q.x)))*(1.-smoothstep(3.,3.12,abs(q.z)))*(1.-smoothstep(top,top+.15,q.y));}
float commBox(vec3 p,vec3 d,vec3 lo,vec3 hi){vec3 safe=sign(d)*max(abs(d),vec3(.0001));vec3 a=(lo-p)/safe,b=(hi-p)/safe;vec3 near=min(a,b),far=max(a,b);return step(max(max(near.x,near.y),max(near.z,.025)),min(min(far.x,far.y),far.z));}
float commNoise(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
vec3 commSurface(vec3 c,vec3 normal,vec3 eye,vec3 p,float rough,float metal,float finish){
 vec3 q=commLocal(p),n=normalize(vec3(-normal.z,normal.y,normal.x)),v=normalize(vec3(-eye.z,eye.y,eye.x));
 float t=uCommunicationsTime;float phone=uPhoneOffice,roomHeight=mix(1.,uPhoneRoomHeight/3.6,phone),windowX=mix(6.,2.1,phone),deskScale=mix(1.,.4125,phone),dockScale=mix(1.,.333333,phone),deskX=mix(.13608,-.79,phone),deskZ=mix(-.73,-.494,phone),dockX=mix(3.5,.56,phone);
 vec3 sun=normalize(vec3(1.,.49+.025*sin(t*.035),-.28+.035*sin(t*.024)));
 float travel=(windowX-q.x)/sun.x;vec3 hit=q+travel*sun;
 float aperture=step(0.,travel)*smoothstep(.32*roomHeight,.38*roomHeight,hit.y)*(1.-smoothstep(3.13*roomHeight,3.19*roomHeight,hit.y))*(1.-smoothstep(2.88,2.94,abs(hit.z)));
 float bars=smoothstep(.026,.047,abs(mod(hit.z+.725,1.45)-.725))*smoothstep(.02,.04,abs(hit.y-1.7*roomHeight));
 float cloud=.93+.06*sin(hit.z*.42+t*.031)*sin(hit.y*.8+t*.017);
 float occ=max(commBox(q+sun*.025,sun,mix(vec3(-2.53,.064,-1.67),vec3(-1.89,.026,-.873),phone),mix(vec3(2.81,.864,-.73),vec3(.31,.356,-.485),phone)),commBox(q+sun*.025,sun,mix(vec3(4.92,.17,-.62),vec3(1.23,.068,.83),phone),mix(vec3(5.84,.94,1.92),vec3(1.57,.376,1.87),phone)));
 occ=max(occ,commBox(q+sun*.025,sun,mix(vec3(3.125,.06,-1.153),vec3(.435,.02,-1.318),phone),mix(vec3(4.49,.923,-.448),vec3(.89,.308,-1.083),phone)));
 float direct=aperture*bars*cloud*(1.-occ*.94)*max(dot(n,sun),0.);
 vec3 lit=c*(vec3(.12,.135,.15)+.07*max(n.y,0.));
 lit+=workshopPoint(c,n,v,q,rough,metal,mix(vec3(-3.,3.23,1.7),vec3(-.78,3.876,1.7),phone),vec3(1.,.91,.79),1.65,.055);
 lit+=workshopPoint(c,n,v,q,rough,metal,mix(vec3(2.8,3.23,1.7),vec3(.728,3.876,1.7),phone),vec3(1.,.91,.79),1.65,.055);
 lit+=workshopPoint(c,n,v,q,rough,metal,vec3(0.,3.22*roomHeight,-1.55),vec3(1.,.90,.77),1.9*(1.-phone),.045);
 lit+=workshopPoint(c,n,v,q,rough,metal,mix(vec3(4.95,1.72,-1.30),vec3(1.3,.86,-.4),phone),vec3(1.,.53,.21),1.25,.8);
 lit+=workshopPoint(c,n,v,q,rough,metal,mix(vec3(-4.8,2.7,.2),vec3(-1.25,3.24,.2),phone),vec3(1.,.86,.72),1.7,.20);
 lit+=c*vec3(1.,.76,.43)*direct*3.8;
 float solarSpec=pow(max(dot(n,normalize(sun+v)),0.),mix(150.,12.,rough*rough))*(1.-rough)*aperture*bars*(1.-occ);
 lit+=vec3(1.,.76,.44)*solarSpec*.43;
 float wall=1./(1.+pow(q.z+2.76,2.)*13.);
 float channels=exp(-abs(q.x+mix(3.5,1.3,phone))*5.)+exp(-abs(q.x-mix(4.67,1.3,phone))*5.);
 lit+=c*vec3(1.,.035,.009)*wall*(channels*.8+.12);
 float underDesk=exp(-abs(q.y-.10*deskScale)*5./deskScale)*exp(-abs(q.z-deskZ)*2.6/deskScale)*(1.-smoothstep(2.285*deskScale,2.688*deskScale,abs(q.x-deskX)));
 lit+=vec3(1.,.36,.08)*underDesk*.18;
 if(n.y>.7&&q.y<.04&&rough<.6){
  float contact=1.-.60*exp(-pow((q.x-deskX)/(2.5984*deskScale),6.)-pow((q.z-mix(-1.2,-.688,phone))/(.52*deskScale),4.));
  contact*=1.-.38*exp(-pow((q.x-dockX)/(.5625*dockScale),4.)-pow((q.z-mix(-.8,-1.2,phone))/(.525*dockScale),4.));
  lit*=contact;
  // Analytic rough reflections of the actual desk, dock and window aperture.
  // This is a single surface pass: no mirrored scene or extra framebuffer.
  vec3 ray=reflect(-v,n);float dz=(deskZ-q.z)/min(ray.z,-.0001);vec3 desk=q+ray*dz;
  float deskMask=step(0.,dz)*step(.06*deskScale,desk.y)*step(desk.y,.856*deskScale)*(1.-smoothstep(2.374*deskScale,2.688*deskScale,abs(desk.x-deskX)));
  float fresnel=.13+.22*pow(1.-max(dot(n,v),0.),3.);
  float smear=.9+.1*commNoise(floor(q.xz*170.));
  lit+=vec3(.40,.28,.16)*deskMask*fresnel*smear*(1.-smoothstep(.0,.84*deskScale,desk.y)*.45);
  lit+=vec3(1.,.43,.12)*deskMask*exp(-abs(desk.y-.112*deskScale)*25./deskScale)*.70;
  float dockZ=(-.298-q.z)/min(ray.z,-.0001);vec3 dock=q+ray*dockZ;
  float dockMask=step(0.,dockZ)*(1.-smoothstep(.45,.555,abs(dock.x-3.5)));
  lit+=vec3(1.,.025,.007)*dockMask*exp(-abs(dock.y-.056)*30.)*.48;
  float wx=(6.-q.x)/max(ray.x,.0001);vec3 windowHit=q+ray*wx;
  float pane=step(0.,wx)*step(.36,windowHit.y)*step(windowHit.y,3.16)*step(abs(windowHit.z),2.9);
  pane*=smoothstep(.025,.075,abs(mod(windowHit.z+.725,1.45)-.725))*smoothstep(.02,.07,abs(windowHit.y-1.7));
  lit+=mix(vec3(.15,.20,.15),vec3(.55,.39,.19),smoothstep(1.,3.,windowHit.y))*pane*fresnel*.46;
  float lampReflection=exp(-pow((q.x+2.65)/.15,2.))+exp(-pow((q.x-.05)/.13,2.))+exp(-pow((q.x-2.65)/.15,2.));
  lit+=vec3(1.,.46,.19)*lampReflection*.10*exp(-abs(q.z-.4)*.30);
  float redReflection=(exp(-abs(q.x+mix(3.5,1.3,phone))*5.)+exp(-abs(q.x-mix(4.67,1.3,phone))*5.))*exp(-abs(q.z+1.3)*.55);
  lit+=vec3(1.,.025,.007)*redReflection*.12;
 }
 return lit/(1.+max(max(lit.r,lit.g),lit.b)*.35);
}
vec3 commLight(vec3 c,vec3 n,vec3 v,vec3 p){return commSurface(c,n,v,p,.48,.30,0.);}
`;
