/* One supplementary draw pass on the existing hall WebGL context. No canvas,
 * render loop, or animation timer is created by this component. */
window.createEngineerRenderer=function(gl,{M,resources,layout,reduced=false}){
 const buffers=[],textures=[],vaos=[],shaders=[];let disposed=false,avatar=null,model=null,error=null,drawCalls=0;
 const encounterLook={yaw:0,pitch:0,weight:0,targetYaw:0,targetPitch:0,targetWeight:0};
 const vertex=`#version 300 es
 precision highp float;
 layout(location=0)in vec3 position;layout(location=1)in vec3 normal;layout(location=2)in vec2 uv;
 layout(location=3)in vec4 joints;layout(location=4)in vec4 weights;layout(location=5)in vec3 color;
 uniform mat4 model,vp,bones[48];uniform float skinned;out vec3 N,P,C;out vec2 UV;
 void main(){mat4 skin=mat4(1.);if(skinned>.5)skin=weights.x*bones[int(joints.x)]+weights.y*bones[int(joints.y)]+weights.z*bones[int(joints.z)]+weights.w*bones[int(joints.w)];vec4 p=model*skin*vec4(position,1.);P=p.xyz;N=mat3(model*skin)*normal;UV=uv;C=color;gl_Position=vp*p;}`;
 const fragment=`#version 300 es
 precision highp float;in vec3 N,P,C;in vec2 UV;out vec4 outColor;
 #define SHADOW_TEX texture
 ${window.WorkshopAppearance.lightingGLSL}
 ${window.CommunicationsLightingGLSL}
 uniform sampler2D baseMap,ormMap;uniform float textured,orm,rough,metal,emissive,alpha;uniform vec3 camera,tint;
 void main(){vec4 tex=textured>.5?texture(baseMap,UV):vec4(1.);if(tex.a*alpha<.05)discard;
 vec3 c=tex.rgb*C*tint,n=normalize(N),v=normalize(camera-P);
 vec3 l=normalize(vec3(-.38,.75,.85)),l2=normalize(vec3(.8,.5,-.7));
 float r=clamp(rough*(orm>.5?texture(ormMap,UV).g:1.),.15,.96);
 float key=max(dot(n,l),0.),fill=max(dot(n,l2),0.);
 float gloss=pow(max(dot(n,normalize(l+v)),0.),mix(110.,12.,r*r))*(1.-r*.65);
 vec3 lit=c*(.37+key*.55+fill*.19)+mix(vec3(.1),c,metal)*gloss*.36;
 lit=mix(lit,workshopSurface(c,n,v,P,r,metal,0.),uHallMix);
 lit=mix(lit,commLight(c,n,v,P),commMask(P));lit=mix(lit,c,clamp(emissive,0.,1.));float fog=clamp((length(camera-P)-8.)/40.,0.,.28);lit=mix(lit,vec3(.014,.015,.017),fog*.48);
 outColor=vec4(lit,tex.a*alpha);}`;
 function compile(type,source){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const U={};for(const n of ['model','vp','bones[0]','skinned','baseMap','ormMap','textured','orm','rough','metal','emissive','alpha','camera','tint','uHallMix','uDetail','uShadowOn','uShadowVP','uShadowMap','uCommunicationsTime'])U[n]=gl.getUniformLocation(program,n);
 function texture(source,flip=true){if(disposed)return null;const t=gl.createTexture();textures.push(t);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,flip);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.generateMipmap(gl.TEXTURE_2D);return t;}
 function buffer(data,target=gl.ARRAY_BUFFER){const b=gl.createBuffer();buffers.push(b);gl.bindBuffer(target,b);gl.bufferData(target,data,gl.STATIC_DRAW);return b;}
 function vao(){const v=gl.createVertexArray();vaos.push(v);gl.bindVertexArray(v);return v;}
 function attribute(slot,data,dim){buffer(data);gl.enableVertexAttribArray(slot);gl.vertexAttribPointer(slot,dim,gl.FLOAT,false,0,0);}
 function upload(data,options={}){const v=vao();buffer(data);for(const [slot,dim,offset] of [[0,3,0],[1,3,12],[5,3,24],[2,2,36]]){gl.enableVertexAttribArray(slot);gl.vertexAttribPointer(slot,dim,gl.FLOAT,false,44,offset);}gl.bindVertexArray(null);return {vao:v,count:data.length/11,...options};}
 const laptopWorkspace=createWorkshopLaptopScreen();
 const originalLaptopScreen=texture(laptopWorkspace.canvas);
 const laptop=window.createSuppliedLegionModel({upload,texture,engineeringScreen:originalLaptopScreen});
 const L=layout,origin=L.position,characterPoint=L.worldPoint(L.character);
 const characterRoot=M.mul(M.T(...characterPoint),M.mul(M.Y(L.rotation),M.S(L.height/.13,L.height/.13,L.height/.13)));
 const laptopRoot=M.mul(M.T(...L.worldPoint(L.laptop)),M.mul(M.Y(L.rotation+L.laptopYaw),M.S(L.laptopScale,L.laptopScale,L.laptopScale)));
 const lidRoot=M.mul(laptopRoot,M.mul(M.T(...laptop.pivot),M.X((90-laptop.hinge)*Math.PI/180)));
 async function load(url){try{const asset=await window.EngineerGLTF.read(url);if(disposed)return;const j=asset.json;
   const imgs=await Promise.all((j.images||[]).map(async im=>{const bitmap=await createImageBitmap(new Blob([asset.views[im.bufferView]],{type:im.mimeType}),{premultiplyAlpha:'none',colorSpaceConversion:'none'});const t=texture(bitmap,false);bitmap.close();return t;}));
   if(disposed)return;
   const tex=id=>imgs[j.textures[id].source],materials=(j.materials||[{}]).map(m=>{const p=m.pbrMetallicRoughness||{};return {tint:(p.baseColorFactor||[1,1,1,1]).slice(0,3),rough:p.roughnessFactor??1,metal:p.metallicFactor??1,texture:p.baseColorTexture?tex(p.baseColorTexture.index):null,ormTexture:p.metallicRoughnessTexture?tex(p.metallicRoughnessTexture.index):null};});
   const parts=[];j.nodes.forEach((node,id)=>{if(node.mesh===undefined)return;for(const primitive of j.meshes[node.mesh].primitives){const a=primitive.attributes,v=vao();attribute(0,asset.acc(a.POSITION),3);attribute(1,asset.acc(a.NORMAL),3);attribute(2,asset.acc(a.TEXCOORD_0),2);if(a.JOINTS_0!==undefined){attribute(3,asset.acc(a.JOINTS_0),4);attribute(4,asset.acc(a.WEIGHTS_0),4);}const indices=new Uint32Array(asset.acc(primitive.indices));buffer(indices,gl.ELEMENT_ARRAY_BUFFER);gl.bindVertexArray(null);parts.push({vao:v,count:indices.length,indexed:true,node:id,eyelid:(node.name||'').toLowerCase().includes('eyelid'),skin:node.skin,material:materials[primitive.material||0]});}});
   const world=j.nodes.map(()=>M.I());const visit=(id,parent)=>{const n=j.nodes[id];world[id]=M.mul(parent,n.matrix?new Float32Array(n.matrix):EngineerGLTF.math.trs(n.translation,n.rotation,n.scale));for(const child of n.children||[])visit(child,world[id]);};for(const n of j.scenes[j.scene||0].nodes)visit(n,M.I());
   if(j.animations?.length)avatar=new EngineerAvatar(asset,{reduced});model={parts,world,asset};window.dispatchEvent(new Event('engineer:asset-ready'));
  }catch(e){error=e.message;console.error('Engineer asset failed',e);window.dispatchEvent(new CustomEvent('engineer:asset-error',{detail:error}));}}
 function put(part,m,mat,skin){gl.bindVertexArray(part.vao);gl.vertexAttrib3f(5,1,1,1);gl.uniformMatrix4fv(U.model,false,m);gl.uniform1f(U.skinned,skin?1:0);if(skin)gl.uniformMatrix4fv(U['bones[0]'],false,skin.matrices);
  gl.uniform3fv(U.tint,mat.tint||[1,1,1]);gl.uniform1f(U.rough,mat.rough??.63);gl.uniform1f(U.metal,mat.metal??.1);gl.uniform1f(U.textured,mat.texture?1:0);gl.uniform1f(U.orm,mat.ormTexture?1:0);gl.uniform1f(U.emissive,mat.unlit?.9:(mat.emissive||0));gl.uniform1f(U.alpha,mat.alpha??1);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,mat.texture||null);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,mat.ormTexture||null);
  if((mat.alpha??1)<1){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);}else gl.disable(gl.BLEND);
  if(part.indexed)gl.drawElements(gl.TRIANGLES,part.count,gl.UNSIGNED_INT,0);else gl.drawArrays(gl.TRIANGLES,0,part.count);drawCalls++;
 }
 // A bounded head/chest attention layer follows the authored skeletal clip.
 // It never alters feet, moves the model root, or accumulates into clip poses.
 function applyEncounterLook(dt){
  const e=encounterLook,a=avatar,k=1-Math.exp(-5*dt);for(const [value,target] of [['yaw','targetYaw'],['pitch','targetPitch'],['weight','targetWeight']])e[value]+=(e[target]-e[value])*k;
  if(!a||reduced||e.weight<.001)return;
  const qmul=(a,b)=>[a[3]*b[0]+a[0]*b[3]+a[1]*b[2]-a[2]*b[1],a[3]*b[1]-a[0]*b[2]+a[1]*b[3]+a[2]*b[0],a[3]*b[2]+a[0]*b[1]-a[1]*b[0]+a[2]*b[3],a[3]*b[3]-a[0]*b[0]-a[1]*b[1]-a[2]*b[2]],yaw=t=>[0,Math.sin(t/2),0,Math.cos(t/2)],pitch=t=>[Math.sin(t/2),0,0,Math.cos(t/2)];
  const saved=[];for(const [index,fraction] of [[a.head,.8],[a.chest,.2]])if(index>=0){saved.push([index,a.pose[index].r]);const extra=qmul(yaw(e.yaw*e.weight*fraction),pitch(index===a.head?e.pitch*e.weight:0));a.pose[index].r=qmul(a.pose[index].r,extra);}
  const math=EngineerGLTF.math,visit=(id,parent)=>{const n=a.json.nodes[id],p=a.pose[id];a.world[id]=math.mul(parent,n.matrix?new Float32Array(n.matrix):math.trs(p.t,p.r,p.s));for(const child of n.children||[])visit(child,a.world[id]);};for(const id of a.json.scenes[a.json.scene||0].nodes)visit(id,math.I());
  for(const skin of a.skins)for(let i=0;i<skin.joints.length;i++)skin.matrices.set(math.mul(a.world[skin.joints[i]],skin.bind.subarray(i*16,i*16+16)),i*16);
  for(const [index,rotation] of saved)a.pose[index].r=rotation;
 }
 return {load,get avatar(){return avatar;},
  // Shared Final V4 vertex buffers, materials and VAOs; the lab is a second
  // placement, not a second uploaded asset. Only the workspace texture changes.
  renderLaptop(vp,eye,placement,workspace){if(disposed)return 0;drawCalls=0;const scale=placement.scale,root=M.mul(M.T(...placement.position),M.mul(M.Y(placement.yaw),M.S(scale,scale,scale))),lid=M.mul(root,M.mul(M.T(...laptop.pivot),M.X((90-laptop.hinge)*Math.PI/180)));
   gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.CULL_FACE);gl.uniform1f(U.uCommunicationsTime,window.CommunicationsRoom?.time||0);gl.uniformMatrix4fv(U.vp,false,vp);gl.uniform3fv(U.camera,eye);gl.uniform1f(U.uHallMix,0);gl.uniform1f(U.uShadowOn,0);gl.uniform1f(U.uDetail,0);gl.uniform1i(U.baseMap,0);gl.uniform1i(U.ormMap,1);
   const draw=(p,m)=>put(p,m,p.texture===originalLaptopScreen&&workspace?{...p,texture:workspace}:p);for(const p of laptop.base)draw(p,root);for(const p of laptop.lid)draw(p,lid);gl.bindVertexArray(null);gl.activeTexture(gl.TEXTURE0);gl.disable(gl.BLEND);gl.depthMask(true);return drawCalls;
  },
  setEncounterLook(yaw=0,pitch=0,weight=0){encounterLook.targetYaw=Math.max(-.78,Math.min(.78,yaw));encounterLook.targetPitch=Math.max(-.12,Math.min(.12,pitch));encounterLook.targetWeight=reduced?0:Math.max(0,Math.min(1,weight));},
  render(vp,eye,dt,visible=true,shadows=null,placement=null){if(disposed)return 0;drawCalls=0;if(!visible)return 0;gl.useProgram(program);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.CULL_FACE);gl.uniform1f(U.uCommunicationsTime,window.CommunicationsRoom?.time||0);gl.uniformMatrix4fv(U.vp,false,vp);gl.uniform3fv(U.camera,eye);gl.uniform1f(U.uHallMix,1);gl.uniform1f(U.uShadowOn,shadows?.enabled?1:0);if(shadows){gl.uniformMatrix4fv(U.uShadowVP,false,shadows.vp);gl.uniform1i(U.uShadowMap,2);gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,shadows.texture);}gl.uniform1f(U.uDetail,innerWidth>=800&&window.__workshopQuality!=='low'?1:0);gl.uniform1i(U.baseMap,0);gl.uniform1i(U.ormMap,1);
   if(!placement){for(const p of laptop.base)put(p,laptopRoot,p);for(const p of laptop.lid)put(p,lidRoot,p);}const actorRoot=placement?M.mul(M.T(...placement.position),M.mul(M.Y(placement.yaw),M.S(L.height/.13,L.height/.13,L.height/.13))):characterRoot;
   if(avatar){avatar.update(Math.min(.1,dt));applyEncounterLook(Math.min(.1,dt));}if(model)for(const p of model.parts){if(p.eyelid&&(!avatar||avatar.blink<.001))continue;const skin=p.skin!==undefined?avatar?.skins[p.skin]:null;put(p,skin?actorRoot:M.mul(actorRoot,(avatar?.world||model.world)[p.node]),p.material,skin);}
   gl.bindVertexArray(null);gl.activeTexture(gl.TEXTURE0);gl.disable(gl.BLEND);gl.depthMask(true);return drawCalls;
  },getState(){return {ready:!!model,error,drawCalls,triangles:model?model.parts.reduce((s,p)=>s+p.count/3,0):0,laptop:'supplied final V4 / static open model',laptopScreen:laptopWorkspace.metadata,encounterLook:{yaw:encounterLook.yaw,pitch:encounterLook.pitch,weight:encounterLook.weight},avatar:avatar?.getState()||null,position:characterPoint,resources:{buffers:buffers.length,textures:textures.length,vaos:vaos.length}};},
  dispose(){disposed=true;for(const b of buffers)gl.deleteBuffer(b);for(const t of textures)gl.deleteTexture(t);for(const v of vaos)gl.deleteVertexArray(v);for(const s of shaders)gl.deleteShader(s);gl.deleteProgram(program);}
 };
};
