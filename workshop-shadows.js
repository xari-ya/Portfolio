/* Selective workcell shadows on the existing WebGL2 context. Original meshes
 * are copied once per articulated coordinate frame, never per animation tick. */
window.createWorkshopShadows=function(gl,{M,casters,skip,matrixFor,resources}){
 const meshes=[],buffers=[],vaos=[],shaders=[];let texture=null,fbo=null,program=null,drawCalls=0;
 const size=1024,view=M.look([-.4,4.8,1.2],[-.4,0,.2]),ortho=M.I();
 ortho[0]=ortho[5]=1/7;ortho[10]=-2/15;ortho[14]=-1;
 const vp=M.mul(ortho,view);
 function clean(){for(const v of vaos)gl.deleteVertexArray(v);for(const b of buffers){gl.deleteBuffer(b);resources.buffers.delete(b);}for(const s of shaders){gl.deleteShader(s);resources.shaders.delete(s);}if(texture){gl.deleteTexture(texture);resources.textures.delete(texture);}if(fbo)gl.deleteFramebuffer(fbo);if(program)gl.deleteProgram(program);}
 try{
  for(const [type,source] of [[gl.VERTEX_SHADER,'attribute vec3 position;uniform mat4 model,vp;void main(){gl_Position=vp*model*vec4(position,1.);}'],[gl.FRAGMENT_SHADER,'precision mediump float;void main(){gl_FragColor=vec4(1.);}']]){
   const s=gl.createShader(type);shaders.push(s);resources.shaders.add(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));
  }
  program=gl.createProgram();for(const s of shaders)gl.attachShader(program,s);gl.bindAttribLocation(program,0,'position');gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  const modelU=gl.getUniformLocation(program,'model'),vpU=gl.getUniformLocation(program,'vp');
  texture=gl.createTexture();resources.textures.add(texture);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,size,size,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);
  for(const key of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,key,gl.NEAREST);
  for(const key of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,key,gl.CLAMP_TO_EDGE);
  fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,texture,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);
  if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Selective shadow framebuffer unavailable');
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  const captured=new Set();
  function capture(anchor){
   if(captured.has(anchor)||skip.has(anchor))return;captured.add(anchor);const positions=[],indices=[],nested=[];
   function visit(n,m){
    if(skip.has(n)||n._batchDraw)return;
    if(n!==anchor&&n._animated){nested.push(n);return;}
    if(n!==anchor)m=M.mul(m,matrixFor(n));
    if(n.geometry){const offset=positions.length/3,data=n.geometry.vertices;
     for(let i=0;i<data.length;i+=8){const x=data[i],y=data[i+1],z=data[i+2];positions.push(m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]);}
     for(const i of n.geometry.indices)indices.push(offset+i);
    }
    for(const child of n.children)visit(child,m);
   }
   visit(anchor,M.I());
   if(indices.length){
    const vao=gl.createVertexArray();vaos.push(vao);gl.bindVertexArray(vao);
    for(const [target,data] of [[gl.ARRAY_BUFFER,new Float32Array(positions)],[gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(indices)]]){const b=gl.createBuffer();buffers.push(b);resources.buffers.add(b);gl.bindBuffer(target,b);gl.bufferData(target,data,gl.STATIC_DRAW);}
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,12,0);gl.bindVertexArray(null);meshes.push({anchor,vao,count:indices.length});
   }
   for(const n of nested)capture(n);
  }
  for(const root of casters)capture(root);
  function world(n){return n.parent?M.mul(world(n.parent),matrixFor(n)):matrixFor(n);}
  const enabled=()=>innerWidth>=1040&&window.__workshopQuality!=='low'&&window.__workshopQuality!=='balanced'&&(window.__workshopAutoScale||1)>.8;
  return {texture,vp,get enabled(){return enabled();},render(visible){drawCalls=0;if(!visible||!enabled())return 0;
   gl.bindFramebuffer(gl.FRAMEBUFFER,fbo);gl.viewport(0,0,size,size);gl.clearDepth(1);gl.depthMask(true);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.disable(gl.CULL_FACE);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.5,2.);gl.clear(gl.DEPTH_BUFFER_BIT);gl.useProgram(program);gl.uniformMatrix4fv(vpU,false,vp);
   for(const m of meshes){if(m.anchor.visible===false)continue;gl.uniformMatrix4fv(modelU,false,world(m.anchor));gl.bindVertexArray(m.vao);gl.drawElements(gl.TRIANGLES,m.count,gl.UNSIGNED_INT,0);drawCalls++;}
   gl.bindVertexArray(null);gl.disable(gl.POLYGON_OFFSET_FILL);gl.bindFramebuffer(gl.FRAMEBUFFER,null);return drawCalls;
  },getState:()=>({enabled:enabled(),size,drawCalls,frames:meshes.length}),dispose:clean};
 }catch(error){clean();gl.bindFramebuffer(gl.FRAMEBUFFER,null);console.warn('Workcell shadows disabled:',error.message);return {enabled:false,texture:null,vp,render:()=>0,getState:()=>({enabled:false,error:error.message}),dispose(){}};}
};
