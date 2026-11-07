/* Native-resolution live hall, tinted but never blurred or downsampled.
 * Glass belongs to the local controls; the project model remains sharp. */
window.createStudyBackdrop=function(gl,canvas){
 const shaders=[];let texture=null,target=null,depth=null,program=null,vao=null,width=0,height=0,last=-Infinity,refreshes=0,composites=0;
 const opaque=matchMedia('(prefers-reduced-transparency: reduce), (prefers-contrast: more)');
 function compile(type,source){const s=gl.createShader(type);shaders.push(s);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 function dispose(){if(texture)gl.deleteTexture(texture);if(target)gl.deleteFramebuffer(target);for(const s of shaders)gl.deleteShader(s);if(depth)gl.deleteRenderbuffer(depth);if(program)gl.deleteProgram(program);if(vao)gl.deleteVertexArray(vao);}
 try{
  program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,`#version 300 es
  precision highp float;out vec2 uv;void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));uv=p;gl_Position=vec4(p*2.-1.,0.,1.);}`));
  gl.attachShader(program,compile(gl.FRAGMENT_SHADER,`#version 300 es
  precision highp float;in vec2 uv;uniform sampler2D image;uniform vec3 tint;uniform float strength,reveal,opaque;out vec4 pixel;
  void main(){vec3 c=texture(image,uv).rgb;c=mix(c*.34,tint*.65,strength*reveal);c=mix(c,tint*.32,opaque);pixel=vec4(c,1.);}`));
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
  const u=Object.fromEntries(['image','tint','strength','reveal','opaque'].map(k=>[k,gl.getUniformLocation(program,k)]));vao=gl.createVertexArray();depth=gl.createRenderbuffer();texture=gl.createTexture();target=gl.createFramebuffer();
  gl.bindTexture(gl.TEXTURE_2D,texture);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.NEAREST);for(const p of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);
  function resize(){const w=canvas.width,h=canvas.height;if(w===width&&h===height)return;width=w;height=h;last=-Infinity;gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.bindFramebuffer(gl.FRAMEBUFFER,target);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,texture,0);gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,w,h);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw Error('Study backdrop framebuffer unavailable');gl.bindFramebuffer(gl.FRAMEBUFFER,null);}
  return {invalidate(){last=-Infinity;},render(ms,frame,renderHall){
   resize();const rate=canvas.clientWidth<1040?15:30;
   if(ms-last>=1000/rate){renderHall({target,width,height,study:true});last=ms;refreshes++;}
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.depthMask(false);gl.useProgram(program);gl.bindVertexArray(vao);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);gl.uniform1i(u.image,0);gl.uniform3fv(u.tint,(frame.backgroundTheme||frame.project.theme).rgb);gl.uniform1f(u.strength,(frame.backgroundTheme||frame.project.theme).tintStrength??.24);gl.uniform1f(u.reveal,frame.reveal);gl.uniform1f(u.opaque,opaque.matches?1:0);gl.drawArrays(gl.TRIANGLES,0,3);gl.bindVertexArray(null);gl.depthMask(true);gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);composites++;
  },getState:()=>({width,height,refreshes,composites,textures:1,framebuffers:1,backgroundHz:canvas.clientWidth<1040?15:30,nativeResolution:true,blurPasses:0}),dispose};
 }catch(error){dispose();gl.bindFramebuffer(gl.FRAMEBUFFER,null);throw error;}
};
