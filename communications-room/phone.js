/* Phone-only presentation of the existing office, shared actors and display. */
(()=>{'use strict';
 const query=matchMedia('(max-width:760px)'),L=CommunicationsLayout;
 const mix=(a,b,t)=>a+(b-a)*t,vec=(a,b,t)=>a.map((v,i)=>mix(v,b[i],t));
 const phone=window.CommunicationsPhone={
  get active(){return query.matches;},amount:query.matches?1:0,
  safeTop:0,safeBottom:0,viewportDirty:true,
  get top(){return 65+this.safeTop;},
  get span(){return Math.max(3.9,2.50/(innerWidth/Math.max(1,innerHeight-this.top-this.safeBottom)));},
  get boardFraction(){return innerHeight<=700?.80:.75;},
  get screen(){const height=this.span*this.boardFraction;return {center:[0,.90+height/2,-2.40],size:[2.25,height]};},
  get eyeHeight(){return Math.max(.15,Math.min(.35,(this.span-3.9)*.2+.15));},
  get targetHeight(){return .90+this.span*this.boardFraction-this.span*.48;},
  dock:[.56,0,-1.20],engineer:[-.70,.02,-1.15],laptop:[-.02,.36,-.78],
  buttons:Array.from({length:4},(_,i)=>({x:.07,y:.515+i*.115,w:.86,h:.105})),
  navigation:[{x:.07,y:.022,w:.415,h:.105},{x:.515,y:.022,w:.415,h:.105}],
  update(dt,progress=1){const key=innerWidth+':'+innerHeight;if((this.viewportDirty||this.viewportKey!==key)&&typeof getComputedStyle==='function'){this.viewportDirty=false;this.viewportKey=key;const style=getComputedStyle(document.documentElement);this.safeTop=parseFloat(style.getPropertyValue('--comms-safe-top'))||0;this.safeBottom=parseFloat(style.getPropertyValue('--comms-safe-bottom'))||0;}let goal=query.matches?Math.max(0,Math.min(1,(progress-.967)/.023)):0;goal=goal*goal*(3-2*goal);this.amount=matchMedia('(prefers-reduced-motion: reduce)').matches?goal:mix(this.amount,goal,1-Math.exp(-Math.min(dt,.05)*12));if(Math.abs(this.amount-goal)<.001)this.amount=goal;},
  get roomScale(){return [1,mix(1,Math.max(1.2,(.90+this.span*this.boardFraction)/3.6+.05),this.amount),1];},
  get screenPlane(){return {center:vec(L.screen.center,this.screen.center,this.amount),size:vec(L.screen.size,this.screen.size,this.amount)};},
  get dockPosition(){return vec(L.dock,this.dock,this.amount);},
  get engineerPosition(){return vec(L.engineer,this.engineer,this.amount);},
  get laptopPosition(){return vec(L.laptop,this.laptop,this.amount);},
  get actorScale(){return mix(1,.58,this.amount);},
  get engineerScale(){return mix(L.scale.engineer,.65,this.amount);},
  officePoint(p,kind){
   const side=kind==='workstation',from=side?[-5.40,0,2.05]:[.13608,0,-1.25],to=side?[-1.30,0,1.15]:[-.890128,0,-.70],factor=side?.50:.36/.8;
   return vec(p,p.map((v,i)=>to[i]+(v-from[i])*factor),this.amount);
  },
  project([p0,p1,p2,p3],width,height){
   const dx1=p1[0]-p2[0],dx2=p3[0]-p2[0],dx3=p0[0]-p1[0]+p2[0]-p3[0];
   const dy1=p1[1]-p2[1],dy2=p3[1]-p2[1],dy3=p0[1]-p1[1]+p2[1]-p3[1];
   const determinant=dx1*dy2-dx2*dy1;
   if(Math.abs(determinant)<1e-8)return 'scale(0)';
   const g=(dx3*dy2-dx2*dy3)/determinant,h=(dx1*dy3-dx3*dy1)/determinant;
   const a=p1[0]-p0[0]+g*p1[0],b=p3[0]-p0[0]+h*p3[0],d=p1[1]-p0[1]+g*p1[1],e=p3[1]-p0[1]+h*p3[1];
   return 'matrix3d('+[a/width,d/width,0,g/width,b/height,e/height,0,h/height,0,0,1,0,p0[0],p0[1],0,1].join(',')+')';
  },
  fov(aspect){return 2*Math.atan(Math.max(3.9,2.50/aspect)/(2*Math.hypot(5.8+2.40,this.targetHeight-this.eyeHeight)));},
  // The existing route keeps its distance cursor. Map its office segment into
  // the phone arrangement smoothly, with no changes to the Skills route.
  routePosition(x,z,office){
   if(!office||!this.amount)return [x,z];
   let u=Math.max(0,Math.min(1,(-z-23.6)/1.8));u=u*u*(3-2*u)*this.amount;
   const local=[-z-31.5,0,x-.5];
   // Keep the existing doorway/front-aisle/dock sequence. The left aisle
   // clears the desk, and the last approach clears the lounge table.
   let px=local[0]<=-4.4?local[0]*(2.35/4.4):-2.35+(local[0]+4.4)/7.85*2.95;
   let pz=local[2];
   if(local[0]>=3.4){const approach=Math.max(0,Math.min(1,(1.25-local[2])/2.05));px=.60+(this.dock[0]-.60)*approach;pz=1.25+(this.dock[2]-1.25)*approach;}
   const point=L.point([mix(local[0],px,u),0,mix(local[2],pz,u)]);
   return [point[0],point[2]];
  },
  dress({root,leftWing,rightWing,screen,display,desk,dock,ceilingRig,centralCeilingFixtures,displayHeader,backPosts,brand,welcomeRug,sofa,lounge,table,lamp,touch,trough,bird,side,officePlants,officeChairs}){
   const t=this.amount,s=this.screenPlane,[horizontal,vertical]=this.roomScale;
   root.s=[horizontal,vertical,1];
   // Rigid side walls pivot around the rear corners, presenting their inside
   // faces toward the visitor. Doors, mullions and exterior retain their shapes.
   for(const [wing,sign]of [[leftWing,-1],[rightWing,1]]){
    const angle=sign*.40*t,oldX=sign*6,hingeX=mix(oldX,sign*.94,t),c=Math.cos(angle),sn=Math.sin(angle);
    wing.r[1]=angle;wing.p=[hingeX-c*oldX+sn*3,0,-3+sn*oldX+c*3];
   }
   screen.p=[s.center[0]/horizontal,s.center[1]/vertical,mix(-2.96,this.screen.center[2]-.115,t)];screen.s=[s.size[0]/(7.5*horizontal),s.size[1]/(2.5*vertical),1];
   display.node.p=[s.center[0]/horizontal,s.center[1]/vertical,s.center[2]];display.node.s=[s.size[0]/horizontal,s.size[1]/vertical,1];
   // All desk axes share the same scale factor: neither the furniture nor
   // its existing nameplate is squeezed to fit the portrait camera.
   desk.p=vec([.13608,0,-1.25],[-.890128,0,-.70],t);desk.p[0]/=horizontal;const deskSize=mix(.8,.36,t);desk.s=[deskSize*1.12/horizontal,deskSize/vertical,deskSize];
   // Reframe the existing decal inside the shorter visible face; preserve
   // its aspect ratio so the name and single-line subtitle stay legible.
   brand.node.p[0]=mix(.35,1.35,t);brand.node.s=[mix(4.15,3.00,t),mix(.60,.60*3.00/4.15,t),1];welcomeRug.visible=t<.001;
   dock.p=this.dockPosition;dock.p[0]/=horizontal;const dockSize=mix(.75,.25,t);dock.s=[dockSize/horizontal,dockSize/vertical,dockSize];
   ceilingRig.p[1]=0;centralCeilingFixtures.forEach(n=>n.visible=t<.001);displayHeader.visible=t<.001;displayHeader.p=[.6,2.12,-2.96];
   backPosts.forEach(({node,x})=>{node.p[0]=mix(x,Math.sign(x)*(Math.abs(x)<5?1.30:1.52)/horizontal,t);});
   const place=(node,from,to,size=1)=>{node.p=vec(from,to,t);node.p[0]/=horizontal;node.p[1]/=vertical;const scale=mix(1,size,t);node.s=[scale/horizontal,scale/vertical,scale];};
   place(sofa,[5.38,0,.65],[1.40,0,1.35],.40);
   place(lounge,[4.90,0,.65],[1.25,0,1.35],.40);
   place(table,[4.32,0,.65],[1.06,0,1.35],.40);
   place(lamp,[4.95,0,-1.30],[1.30,0,-.40],.50);
   place(touch,[-4.39,1.99,-2.88],[-1.46,1.99,-2.35],.55);touch.r[1]=Math.PI/2*t;
   place(trough,[-4.39,.10,-2.66],[-1.40,.10,-2.35],.55);trough.r[1]=Math.PI/2*t;
   place(bird,[-5.53,0,-2.54],[-1.26,0,-2.30],.50);
   place(side,[-5.40,0,2.05],[-1.30,0,1.15],.50);
   officePlants.forEach(node=>place(node,[5.65,0,-2.2],[1.24,0,-2.2],.60));
   officeChairs.forEach(node=>place(node,[-4.72,0,2.12],[-.94,0,1.15],.50));
   const portrait=query.matches;
   if(this.paintedPortrait!==portrait){this.paintedPortrait=portrait;display.canvas.width=portrait?900:1800;display.canvas.height=portrait?1224:600;display.draw();}
  },
  getState(){return {active:this.active,amount:this.amount,screen:this.screenPlane,dock:this.dockPosition};}
 };
 // Cancel visitor scroll input rather than changing overflow: the world
 // canvas lives in a sticky viewport and must retain its scroll container.
 const locked=()=>document.documentElement.classList.contains('comms-phone-locked');
 const scrollInput=e=>{if(!locked()||e.ctrlKey||e.metaKey||e.touches?.length>1||e.target.closest?.('#mobileNav'))return;e.preventDefault();};
 window.addEventListener('wheel',scrollInput,{passive:false,capture:true});
 window.addEventListener('touchmove',scrollInput,{passive:false,capture:true});
 window.addEventListener('keydown',e=>{if(!locked()||e.ctrlKey||e.metaKey||e.altKey||e.target.closest?.('input,textarea,select,[contenteditable=true]'))return;if(e.key===' '&&e.target.closest?.('button,a'))return;if(['PageUp','PageDown','Home','End','ArrowUp','ArrowDown',' '].includes(e.key))e.preventDefault();},{capture:true});
 window.addEventListener('resize',()=>{phone.viewportDirty=true;const navigation=window.WorkshopNavigation;if(navigation&&CommunicationsRoom.inRange(navigation.getState().progress)&&phone.active)requestAnimationFrame(()=>{if(CommunicationsRoom.inRange(navigation.getState().progress)&&!window.ProjectStudy?.active)navigation.navigate('communications',{instant:true});});});
 query.addEventListener('change',()=>{CommunicationsCamera?.reset();});
})();
