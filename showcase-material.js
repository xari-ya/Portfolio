/* Correct normal transforms for the four new, nonuniformly scaled exhibits.
 * Retain the portfolio's lighting code and original room/robot program. */
window.createShowcaseMaterial=function(gl,vertex,fragment){'use strict';
 const program=gl.createProgram(),shaders=[];let disposed=false;
 fragment=fragment.replace('out vec4 fragColor;',`out vec4 fragColor;
 uniform mat4 shadowVP;uniform sampler2D shadowDepth;uniform float shadowEnabled;
 float exhibitShadow(vec3 p){vec4 clip=shadowVP*vec4(p,1.);vec3 s=clip.xyz/clip.w*.5+.5;if(s.x<0.||s.x>1.||s.y<0.||s.y>1.||s.z>1.)return 1.;float visible=0.;for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)visible+=s.z-.0018<=texture(shadowDepth,s.xy+vec2(x,y)/1024.).r?1.:0.;return .48+.52*visible/9.;}`)
 .replace('float fog=','if(shadowEnabled>.5)c*=exhibitShadow(world);float fog=');
 for(const [type,source]of [[gl.VERTEX_SHADER,vertex.replace('mat3(model)*normal','transpose(inverse(mat3(model)))*normal')],[gl.FRAGMENT_SHADER,fragment]]){const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(shader));gl.attachShader(program,shader);}
 gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));
 const uni=Object.fromEntries(['model','vp','color','eye','metal','glow','opacity','premium','shadowVP','shadowDepth','shadowEnabled'].map(name=>[name,gl.getUniformLocation(program,name)]));
 return {program,uni,getState:()=>({disposed}),dispose(){if(disposed)return;disposed=true;gl.deleteProgram(program);shaders.forEach(s=>gl.deleteShader(s));}};
};
