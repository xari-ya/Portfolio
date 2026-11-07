/* Authored handset; native botanical specimen and spatial architecture. */
window.createHabitSeedShowcase=function(gl,k){'use strict';
 const {program,uni,mm,tr,sc,rx,ry,rz,meshes,textProgram,textUni,textMesh}=k,scenes=[[],[],[]],textures=[],green=[.10,.35,.27],metal=[.25,.32,.33];let disposed=false,drawCalls=0;
 // A smooth shared botanical primitive keeps curved petals and leaves free of flat facets.
 const smoothV=[],smoothI=[],rows=20,columns=32;for(let r=0;r<=rows;r++)for(let c=0;c<=columns;c++){const t=r*Math.PI/rows,a=c*Math.PI*2/columns,n=[Math.sin(t)*Math.cos(a),Math.cos(t),Math.sin(t)*Math.sin(a)];smoothV.push(...n.map(v=>v*.5),...n);if(r<rows&&c<columns){const i=r*(columns+1)+c;smoothI.push(i,i+columns+1,i+1,i+1,i+columns+1,i+columns+2);}}
 const smoothVAO=gl.createVertexArray(),smoothBuffer=gl.createBuffer(),smoothIndex=gl.createBuffer();gl.bindVertexArray(smoothVAO);gl.bindBuffer(gl.ARRAY_BUFFER,smoothBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(smoothV),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,smoothIndex);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(smoothI),gl.STATIC_DRAW);gl.bindVertexArray(null);const localMeshes={...meshes,botanical:{vao:smoothVAO,n:smoothI.length}};
 // One continuous revolved vessel replaces eighteen stacked cylinders.
 const potVertices=[],potIndices=[],potProfile=[[.50,-1.76],[.52,-1.70],[.65,-1.13],[.68,-1.08],[.73,-1.05],[.74,-1.01],[.72,-.97],[.66,-.97],[.63,-1.03],[.61,-1.12],[.47,-1.68],[.46,-1.72],[.50,-1.76]];
 for(let j=1;j<potProfile.length;j++){const [r0,y0]=potProfile[j-1],[r1,y1]=potProfile[j],dr=r1-r0,dy=y1-y0,length=Math.hypot(dr,dy);for(let i=0;i<64;i++){const a=i*Math.PI*2/64,b=(i+1)*Math.PI*2/64,start=potVertices.length/6;for(const [r,y,t]of [[r0,y0,a],[r1,y1,a],[r1,y1,b],[r0,y0,b]])potVertices.push(r*Math.cos(t),y,r*Math.sin(t),dy*Math.cos(t)/length,-dr/length,dy*Math.sin(t)/length);potIndices.push(start,start+1,start+2,start,start+2,start+3);}}
 const potVAO=gl.createVertexArray(),potBuffer=gl.createBuffer(),potIndex=gl.createBuffer();gl.bindVertexArray(potVAO);gl.bindBuffer(gl.ARRAY_BUFFER,potBuffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(potVertices),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,potIndex);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(potIndices),gl.STATIC_DRAW);gl.bindVertexArray(null);localMeshes.pot={vao:potVAO,n:potIndices.length};
 const obj=(scene,kind,p,size,col,rot=[0,0,0],growth=0)=>{const item={kind,p,size,col,rot,growth};scenes[scene].push(item);return item;};
 const box=(s,p,size,c,rot)=>obj(s,'bevel',p,size,c,rot),cyl=(s,p,size,c)=>obj(s,'cylinder',p,size,c),ball=(s,p,size,c,rot,g)=>obj(s,'botanical',p,size,c,rot,g);
 function texture(source){const t=gl.createTexture();textures.push(t);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.LINEAR);for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);return t;}
 function card(title,subtitle,tag='SYSTEM LAYER',accent='#4ade80'){const c=document.createElement('canvas');c.width=768;c.height=400;const a=c.getContext('2d');
  const g=a.createLinearGradient(0,0,768,400);g.addColorStop(0,'#0b1a1a');g.addColorStop(1,'#142b27');a.fillStyle=g;a.fillRect(0,0,768,400);
  a.strokeStyle='#2e5e52';a.lineWidth=3;a.strokeRect(10,10,748,380);
  a.fillStyle=accent+'26';a.beginPath();a.roundRect(32,32,190,40,8);a.fill();a.strokeStyle=accent;a.lineWidth=1.5;a.stroke();
  a.fillStyle=accent;a.font='bold 16px monospace';a.fillText(tag,48,58);
  a.fillStyle='#f0fbf4';a.font='bold 44px sans-serif';a.fillText(title,35,160);
  a.fillStyle='#a8d4c2';a.font='21px monospace';a.fillText(subtitle,35,215);
  a.fillStyle='#23453b';a.fillRect(35,260,698,2);
  a.fillStyle=accent;a.beginPath();a.arc(48,310,7,0,Math.PI*2);a.fill();
  a.fillStyle='#d5efe3';a.font='18px monospace';a.fillText('ACTIVE DATA PIPELINE · VERIFIED ARCHITECTURE',68,316);
  return texture(c);}
 const handset=k.phones.load('compact');const images={};for(const name of ['04-home','06-habit-detail','07-stats','08-store']){const image=new Image();image.onload=()=>{if(!disposed)images[name]=texture(image);};image.src='assets/showcase/habitseed/'+name+'.webp';}
 // Floating app cards remain physical plaques; screen artwork is mapped to their front face.
 box(0,[-1.75,-.15,-.4],[1.25,2.55,.09],[.24,.33,.29],[0,.28,-.10]);box(0,[2.1,.15,-.55],[1.25,2.55,.09],[.24,.33,.29],[0,-.3,.08]);
 // Lathed pot with a tapered wall, thick lip, soil bed and saucer.
 obj(1,'pot',[0,0,0],[1,1,1],green);
 cyl(1,[0,-.99,0],[1.26,.025,1.26],[.12,.08,.045]);cyl(1,[0,-1.83,0],[1.26,.10,1.26],[.075,.23,.20]);
 ball(1,[0,-.95,.03],[.14,.09,.11],[.34,.20,.07]);scenes[1].at(-1).seed=true;
 // Curved stem made from short aligned segments, with dimensional leaf blades and veins.
 for(let i=0;i<12;i++)obj(1,'cylinder',[Math.sin(i*.11)*.10,-.97+i*.125,0],[.065,.20,.065],[.19,.46,.15],[0,0,-.04],1);
 for(let i=0;i<5;i++){const side=i%2?-1:1,y=-.74+i*.23;ball(1,[side*.32,y,.04],[.78,.23,.35],[.16,.50,.22],[0,.22,side*.48],i<2?1:2);obj(1,'cylinder',[side*.26,y+.02,.09],[.018,.63,.018],[.33,.65,.26],[0,0,-side*1.05],i<2?1:2);}
 // Two radial layers of curved three-dimensional petals and a seeded disk.
 for(let layer=0;layer<2;layer++)for(let i=0;i<11;i++){const a=i*Math.PI*2/11+layer*.27;ball(1,[Math.cos(a)*.34,.56+Math.sin(a)*.34,.14+layer*.09],[.31,.64,.15],layer?[.94,.67,.08]:[.88,.48,.025],[.09,0,a-Math.PI/2],4);}
 ball(1,[0,.56,.35],[.43,.43,.18],[.29,.16,.035],[],3);for(let i=0;i<42;i++){const a=i*2.399,r=.165*Math.sqrt(i/42);ball(1,[Math.cos(a)*r,.56+Math.sin(a)*r,.47],[.032,.032,.025],[.61,.37,.08],[],4);}
 // Growth research frame: real rings and rails, open rather than an opaque cylinder.
 for(const y of [-2.03,1.55])obj(1,'torus',[0,y,0],[3.25,1.2,3.25],[.12,.33,.27]);for(const x of [-1.55,1.55])cyl(1,[x,-.24,-.5],[.035,3.57,.035],[.16,.38,.30]);
 const architecture=[
  {p:[-1.75,.50,.25],size:[1.85,1.05,.12],t:card('ANDROID CLIENT','Kotlin / Jetpack Compose / MVVM','UI LAYER','#4ade80')},
  {p:[-.70,-1.05,.35],size:[1.95,1.08,.14],t:card('ROOM DATABASE','SQLite / Flows / Encrypted Logs','LOCAL STORE','#38bdf8')},
  {p:[.45,.20,.12],size:[1.75,1.00,.12],t:card('SYNC GATEWAY','WorkManager / Data Filtering','BOUNDARY','#fb923c')},
  {p:[1.75,1.45,-.30],size:[1.95,1.08,.14],t:card('FIREBASE BACKEND','Cloud Firestore / Auth Tokens','CLOUD TIER','#f87171')},
  {p:[2.35,-.60,-.35],size:[1.85,1.05,.12],t:card('GARDEN NETWORK','Social Streaks / Leaderboards','COMMUNITY','#2dd4bf')}
 ];
 for(const node of architecture)box(2,node.p,node.size,[.08,.20,.18]);
 const links=[[0,1],[1,2],[2,3],[3,4]];
 for(const [from,to]of links){
  // Leave the facing card edges vertically, then curve through their open gap.
  // The tube radius stays outside the card bodies and their artwork.
  const source=architecture[from],target=architecture[to],direction=Math.sign(target.p[1]-source.p[1]),padding=.025;
  const a=[source.p[0],source.p[1]+direction*(source.size[1]/2+padding),source.p[2]],b=[target.p[0],target.p[1]-direction*(target.size[1]/2+padding),target.p[2]],points=[];
  for(let i=0;i<=18;i++){const t=i/18,u=t*t*(3-2*t);points.push(a.map((v,j)=>v+(b[j]-v)*(j===1?t:u)));}
  for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i],dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],length=Math.hypot(dx,dy,dz);
    obj(2,'cylinder',a.map((v,j)=>(v+b[j])/2),[.032,length,.032],from<2?[.28,.78,.55]:[.92,.58,.28],[Math.acos(dy/length),Math.atan2(dx,dz),0]);
    scenes[2].at(-1).flow=from<2?'private':'public';
  }
 }

 function model(p,size,rot=[0,0,0],base){return mm(base,mm(tr(...p),mm(ry(rot[1]||0),mm(rz(rot[2]||0),mm(rx(rot[0]||0),sc(...size))))));}
 return {ready:handset.ready,draw(frame,vp,eye){const chapter=frame.chapter,stage=window.HabitSeedExhibit?.stage||6,base=mm(tr(0,chapter===1?.25:0,0),mm(ry((chapter===0?-.15:-.08)+frame.orbit[0]),rx(frame.orbit[1]))),opacity=frame.reveal*(frame.modelOpacity??1);drawCalls=0;gl.useProgram(program);gl.uniformMatrix4fv(uni.vp,false,vp);gl.uniform3fv(uni.eye,eye);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);if(opacity<.999){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);}
  for(const o of scenes[chapter]){if(chapter===1){  if(o.seed&&stage>1)continue;  if(o.growth&&stage<o.growth)continue;}const p=o.p.slice(),size=o.size.slice();if(chapter===1&&o.growth&&stage<6){  const factor=Math.max(.15,.22+stage*.13);  p[1]=-.9+(p[1]+.9)*factor;size[0]*=factor;size[1]*=factor;size[2]*=factor;}const mesh=localMeshes[o.kind];gl.uniformMatrix4fv(uni.model,false,model(p,size,o.rot,base));gl.uniform3fv(uni.color,o.flow&&o.flow!==(window.HabitSeedExhibit?.flow||'private')?[.08,.15,.16]:o.col);gl.uniform1f(uni.metal,chapter===0?.65:o.kind==='botanical'?.04:.18);gl.uniform1f(uni.glow,0);gl.uniform1f(uni.opacity,opacity);gl.uniform1f(uni.premium,chapter===1?0:.65);gl.bindVertexArray(mesh.vao);gl.drawElements(gl.TRIANGLES,mesh.n,gl.UNSIGNED_INT,0);drawCalls++;}
  const screens=chapter===0?[{p:[-1.75,-.15,-.348],size:[1.08,2.26,1],t:images['07-stats'],rot:[0,.28,-.1]},{p:[2.1,.15,-.498],size:[1.08,2.26,1],t:images['08-store'],rot:[0,-.3,.08]}]:chapter===2?architecture.map(n=>({p:[n.p[0],n.p[1],n.p[2]+n.size[2]/2+.003],size:[n.size[0]-.10,n.size[1]-.08,1],t:n.t})):[];
  gl.useProgram(textProgram);gl.uniformMatrix4fv(textUni.vp,false,vp);gl.uniform4fv(textUni.rect,[0,0,1,1]);gl.uniform1f(textUni.opacity,opacity);gl.uniform1i(textUni.atlas,0);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.bindVertexArray(textMesh);for(const screen of screens){if(!screen.t)continue;gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,screen.t);gl.uniformMatrix4fv(textUni.model,false,model(screen.p,screen.size,screen.rot,base));gl.drawElements(gl.TRIANGLES,6,gl.UNSIGNED_SHORT,0);drawCalls++;}gl.bindVertexArray(null);gl.disable(gl.BLEND);if(chapter===0)drawCalls+=k.phones.draw('compact',model([.3,0,0],[4.62,4.62,4.62],[],base),vp,eye,images[window.HabitSeedExhibit?.screen||'04-home'],opacity);gl.useProgram(program);
 },getState:()=>({drawCalls,objects:scenes.map(s=>s.length),textures:textures.length,disposed}),dispose(){disposed=true;gl.deleteVertexArray(smoothVAO);gl.deleteBuffer(smoothBuffer);gl.deleteBuffer(smoothIndex);gl.deleteVertexArray(potVAO);gl.deleteBuffer(potBuffer);gl.deleteBuffer(potIndex);textures.forEach(t=>gl.deleteTexture(t));}};
};
