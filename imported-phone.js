/* Authored, licensed handsets rendered inside the existing WebGL2 context.
 * Source topology/materials and provenance: assets/showcase/phones/*.json. */
window.createImportedPhones=function(gl){'use strict';
 const shaders=[],program=gl.createProgram(),models=new Map(),controller=new AbortController();let disposed=false,shadow=null,revision=0;
 const vertex=`#version 300 es
 precision highp float;
 layout(location=0) in vec3 position;layout(location=1) in vec3 normal;layout(location=2) in vec2 texcoord;
 uniform mat4 model,vp;out vec3 world,N,localPosition;out vec2 uv;
 void main(){vec4 p=model*vec4(position,1.);world=p.xyz;N=transpose(inverse(mat3(model)))*normal;uv=texcoord;localPosition=position;gl_Position=vp*p;}`;
 const fragment=`#version 300 es
 precision highp float;
 in vec3 world,N,localPosition;in vec2 uv;out vec4 fragColor;
 uniform vec3 eye;uniform vec4 color;uniform float metal,rough,opacity,normalScale;
 uniform sampler2D baseMap,ormMap,normalMap,screenMap,shadowDepth;
 uniform bool hasBase,hasORM,hasNormal,isScreen,shadowEnabled;uniform mat4 shadowVP;uniform vec4 screenRect;
 float visibility(){if(!shadowEnabled)return 1.;vec4 c=shadowVP*vec4(world,1.);vec3 s=c.xyz/c.w*.5+.5;if(any(lessThan(s,vec3(0.)))||any(greaterThan(s,vec3(1.))))return 1.;float v=0.;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)v+=s.z-.0018<=texture(shadowDepth,s.xy+vec2(x,y)/1024.).r?1.:0.;return .48+.52*v/9.;}
 void main(){
 if(isScreen){vec2 st=(localPosition.xy-screenRect.xy)/screenRect.zw;if(any(lessThan(st,vec2(0.)))||any(greaterThan(st,vec2(1.))))discard;float rx=0.048,ry=rx*screenRect.z/screenRect.w;vec2 cr=abs(st-0.5)-(0.5-vec2(rx,ry));if(cr.x>0.0&&cr.y>0.0&&length(vec2(cr.x/rx,cr.y/ry))>1.0)discard;fragColor=vec4(texture(screenMap,st).rgb,opacity);return;}
 vec4 albedo=color*(hasBase?texture(baseMap,uv):vec4(1.));if(albedo.a<.05)discard;
 vec3 n=normalize(N);if(!gl_FrontFacing)n=-n;
 if(hasNormal){vec3 q1=dFdx(world),q2=dFdy(world);vec2 s1=dFdx(uv),s2=dFdy(uv);vec3 t=q1*s2.y-q2*s1.y,b=-q1*s2.x+q2*s1.x;float scale=inversesqrt(max(max(dot(t,t),dot(b,b)),1e-12));vec3 map=texture(normalMap,uv).xyz*2.-1.;map.xy*=normalScale;n=normalize(mat3(t*scale,b*scale,n)*map);}
 vec3 orm=hasORM?texture(ormMap,uv).rgb:vec3(1.);float m=metal*orm.b,r=clamp(rough*orm.g,.08,1.);vec3 v=normalize(eye-world),l=normalize(vec3(-4.,8.,7.)),h=normalize(v+l),base=pow(max(albedo.rgb,vec3(.001)),vec3(2.2));
 float nl=max(dot(n,l),0.),nv=max(dot(n,v),0.);vec3 f0=mix(vec3(.045),base,m);vec3 f=f0+(1.-f0)*pow(1.-nv,5.);
 float spec=pow(max(dot(n,h),0.),mix(120.,5.,r))*(1.-r*.65);
 vec3 reflection=reflect(-v,n);float strip=pow(max(0.,1.-abs(reflection.x+.35*reflection.y)*1.7),10.)*.65+pow(max(reflection.y,0.),3.)*.3;
 vec3 c=base*(1.-m*.7)*(.24+nl*.85)*visibility()+f*(.18+strip)+spec*f0*1.3;
 c=c/(c+vec3(.75));fragColor=vec4(pow(c,vec3(1./2.2)),opacity*albedo.a);
 }`;
 for(const [type,source]of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));gl.attachShader(program,s);}
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const u=Object.fromEntries(['model','vp','eye','color','metal','rough','opacity','normalScale','baseMap','ormMap','normalMap','screenMap','shadowDepth','hasBase','hasORM','hasNormal','isScreen','shadowEnabled','shadowVP','screenRect'].map(n=>[n,gl.getUniformLocation(program,n)]));
 function load(key){if(models.has(key))return models.get(key);const entry={key,loaded:false,batches:[],textures:[],error:null,triangles:0};models.set(key,entry);
 entry.ready=(async()=>{try{const base='assets/showcase/phones/',response=await fetch(base+key+'.json',{signal:controller.signal});if(!response.ok)throw Error('Phone metadata '+response.status);const info=await response.json(),binaryResponse=await fetch(base+info.binary,{signal:controller.signal});if(!binaryResponse.ok)throw Error('Phone geometry '+binaryResponse.status);const binary=await binaryResponse.arrayBuffer();
 // Production maps preserve the verified original GPU pixels at this upload size.
 // Keep the cap fixed across resizes so models share one set of textures.
 entry.textureBytes=0;
 const images=await Promise.all(info.textures.map(async t=>{const response=await fetch(base+t.file,{signal:controller.signal});if(!response.ok)throw Error('Phone material '+response.status);const scale=Math.min(1,(t.maxGPUSize||1024)/Math.max(t.width,t.height)),width=Math.max(1,Math.round(t.width*scale)),height=Math.max(1,Math.round(t.height*scale));entry.textureBytes+=Math.ceil(width*height*4*4/3);return createImageBitmap(await response.blob(),{resizeWidth:width,resizeHeight:height,colorSpaceConversion:'none'});}));
 if(disposed){images.forEach(i=>i.close());return false;}
 let sliceStart=performance.now();
 for(const image of images){if(disposed){images.forEach(i=>i.close());return false;}const texture=gl.createTexture();entry.textures.push(texture);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);image.close();if(performance.now()-sliceStart>6){await (window.scheduler?.yield?window.scheduler.yield():new Promise(resolve=>setTimeout(resolve,0)));sliceStart=performance.now();}}
 if(disposed)return false;
 const activeBatches=info.batches.filter(b=>!info.materials[b.material].cover),vertices=new Uint8Array(activeBatches.reduce((n,b)=>n+b.vertexCount*32,0)),indices=new Uint8Array(activeBatches.reduce((n,b)=>n+b.indexCount*4,0));let vo=0,io=0;
 for(const batch of activeBatches){vertices.set(new Uint8Array(binary,batch.vertexOffset,batch.vertexCount*32),vo);indices.set(new Uint8Array(binary,batch.indexOffset,batch.indexCount*4),io);entry.batches.push({...batch,vertexOffset:vo,indexOffset:io,vao:gl.createVertexArray()});vo+=batch.vertexCount*32;io+=batch.indexCount*4;}
 entry.buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,entry.buffer);gl.bufferData(gl.ARRAY_BUFFER,vertices,gl.STATIC_DRAW);entry.index=gl.createBuffer();gl.bindVertexArray(null);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,entry.index);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,indices,gl.STATIC_DRAW);
 for(const batch of entry.batches){gl.bindVertexArray(batch.vao);gl.bindBuffer(gl.ARRAY_BUFFER,entry.buffer);for(const [i,size,offset]of [[0,3,0],[1,3,12],[2,2,24]]){gl.enableVertexAttribArray(i);gl.vertexAttribPointer(i,size,gl.FLOAT,false,32,batch.vertexOffset+offset);}gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,entry.index);}
 gl.bindVertexArray(null);entry.info=info;entry.triangles=info.triangles;entry.loaded=true;revision++;return true;
 }catch(error){entry.error=error.message;if(!disposed)throw error;return false;}})();return entry;
 }
 return {load,get revision(){return revision;},setShadow(value){shadow=value;},draw(key,model,vp,eye,screen,opacity=1){const entry=models.get(key);if(disposed||!entry?.loaded||!screen)return 0;gl.useProgram(program);gl.uniformMatrix4fv(u.model,false,model);gl.uniformMatrix4fv(u.vp,false,vp);gl.uniform3fv(u.eye,eye);gl.uniform1f(u.opacity,opacity);const bounds=entry.info.screenBounds;gl.uniform4fv(u.screenRect,[...bounds.min.slice(0,2),bounds.max[0]-bounds.min[0],bounds.max[1]-bounds.min[1]]);gl.uniform1i(u.shadowEnabled,!!shadow?.available);if(shadow)gl.uniformMatrix4fv(u.shadowVP,false,shadow.vp);gl.uniform1i(u.shadowDepth,7);gl.uniform1i(u.screenMap,3);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,screen);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 for(const batch of entry.batches){const m=entry.info.materials[batch.material];gl.uniform4fv(u.color,m.color);gl.uniform1f(u.metal,m.metal);gl.uniform1f(u.rough,m.rough);gl.uniform1f(u.normalScale,m.normalScale);gl.uniform1i(u.isScreen,m.screen);for(const [i,name,flag]of [[0,'baseColor','hasBase'],[1,'orm','hasORM'],[2,'normal','hasNormal']]){gl.uniform1i(u[flag],m[name]!==undefined);gl.uniform1i(u[['baseMap','ormMap','normalMap'][i]],i);gl.activeTexture(gl.TEXTURE0+i);gl.bindTexture(gl.TEXTURE_2D,m[name]!==undefined?entry.textures[m[name]]:null);}gl.bindVertexArray(batch.vao);gl.drawElements(gl.TRIANGLES,batch.indexCount,gl.UNSIGNED_INT,batch.indexOffset);}
 gl.bindVertexArray(null);gl.activeTexture(gl.TEXTURE0);gl.disable(gl.BLEND);return entry.batches.length;},getState:()=>({disposed,models:[...models.values()].map(e=>({key:e.key,loaded:e.loaded,error:e.error,triangles:e.triangles,batches:e.batches.length,textures:e.textures.length,materialTextureBytes:e.textureBytes||0}))}),dispose(){if(disposed)return;disposed=true;controller.abort();for(const entry of models.values()){entry.batches.forEach(b=>gl.deleteVertexArray(b.vao));entry.textures.forEach(t=>gl.deleteTexture(t));if(entry.buffer)gl.deleteBuffer(entry.buffer);if(entry.index)gl.deleteBuffer(entry.index);}gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));}};
};
