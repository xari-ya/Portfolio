/* Five constrained pendula with elastic contact, advanced by the room loop. */
window.buildOfficePendulum=function(k,api,parent,P){
 const {G,B,R}=k,base=G(parent,[-2.2,1.1,-.15]);base.name='office-newtons-cradle';
 R(base,.56,.026,.28,P.black,[0,.013,0],.018,'steel');
 for(const z of [-.11,.11]){for(const x of [-.25,.25])B(base,.012,.38,.012,P.edge,[x,.21,z],'steel');B(base,.51,.012,.012,P.edge,[0,.40,z],'steel');}
 const vertices=[],indices=[],lat=8,lon=12;
 for(let j=0;j<=lat;j++)for(let i=0;i<=lon;i++){const a=i/lon*Math.PI*2,b=j/lat*Math.PI;vertices.push(Math.sin(b)*Math.cos(a),Math.cos(b),Math.sin(b)*Math.sin(a));}
 for(let j=0;j<lat;j++)for(let i=0;i<lon;i++){const a=j*(lon+1)+i;indices.push(a,a+1,a+lon+1,a+1,a+lon+2,a+lon+1);}
 const sphere=api.customMesh(vertices,indices),radius=.042,length=.265,angles=[-.62,0,0,0,0],velocities=[0,0,0,0,0],pivots=[];let accumulator=0,quiet=0,wasReduced=true;
 for(let i=0;i<5;i++){const g=k.moving(G(base,[(i-2)*radius*2,.40,0]));for(const z of [-.11,.11])k.tube(g,[0,0,z],[0,-length,0],.0018,P.edge,'steel');const ball=api.mat(g,sphere,[.55,.58,.60],[0,-length,0],[],'steel');ball.s=[radius,radius,radius];ball.rough=.16;ball.metal=.85;pivots.push(g);}
 function kick(){angles.fill(0);velocities.fill(0);angles[0]=-.62;quiet=0;}
 function step(dt){
  for(let i=0;i<5;i++){velocities[i]+=(-9.81/length*Math.sin(angles[i])-.003*velocities[i])*dt;angles[i]+=velocities[i]*dt;}
  for(let pass=0;pass<6;pass++)for(let i=0;i<4;i++){
   const a=angles[i],b=angles[i+1],dx=radius*2+length*(Math.sin(b)-Math.sin(a)),dy=length*(Math.cos(a)-Math.cos(b)),distance=Math.hypot(dx,dy);
   if(distance>=radius*2||distance<1e-8)continue;
   const nx=dx/distance,ny=dy/distance,ta=Math.cos(a)*nx+Math.sin(a)*ny,tb=Math.cos(b)*nx+Math.sin(b)*ny,denom=Math.max(.05,ta*ta+tb*tb),relative=length*(velocities[i+1]*tb-velocities[i]*ta);
   if(relative<0){const impulse=-1.9997*relative/denom;velocities[i]-=impulse*ta/length;velocities[i+1]+=impulse*tb/length;}
   const correction=(radius*2-distance)*.55/(length*denom);angles[i]-=correction*ta;angles[i+1]+=correction*tb;
  }
 }
 return {kick,update(dt,reduced){if(!reduced&&wasReduced)kick();wasReduced=reduced;if(reduced){angles.fill(0);velocities.fill(0);accumulator=0;}else{accumulator+=Math.min(dt,.05);while(accumulator>=1/240){step(1/240);accumulator-=1/240;}const energy=velocities.reduce((s,v,i)=>s+v*v+angles[i]*angles[i],0);quiet=energy<.0001?quiet+dt:0;if(quiet>3)kick();}for(let i=0;i<5;i++)pivots[i].r[2]=angles[i];},getState:()=>({angles:angles.slice(),velocities:velocities.slice(),balls:5})};
};
