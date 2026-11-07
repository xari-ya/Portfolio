/* Reuse the maze's existing DFS/BFS routes. One draw shows the visited prefix;
 * this changes the trail's rendering, never its traversal or telemetry. */
window.createObsidianRoute=function(gl,routes,xAt,zAt){'use strict';const gpu={};let disposed=false,drawCalls=0;
 for(const [mode,route]of Object.entries(routes)){const vertices=[],prefix=[];function quad(x0,z0,x1,z1){for(const [x,z]of [[x0,z0],[x1,z0],[x1,z1],[x0,z0],[x1,z1],[x0,z1]])vertices.push(x,.014,z,0,1,0);}
  for(let i=0;i<route.length;i++){const id=route[i],x=xAt(id%11),z=zAt(Math.floor(id/11));quad(x-.055,z-.055,x+.055,z+.055);if(i){const before=route[i-1],px=xAt(before%11),pz=zAt(Math.floor(before/11));quad(Math.min(x,px)-.055,Math.min(z,pz)-.055,Math.max(x,px)+.055,Math.max(z,pz)+.055);}prefix.push(vertices.length/6);}
  const vao=gl.createVertexArray(),buffer=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,24,12);gpu[mode]={vao,buffer,prefix};
 }gl.bindVertexArray(null);
 return {draw(mode,count){if(disposed)return;const mesh=gpu[mode],n=mesh.prefix[Math.max(0,Math.min(mesh.prefix.length-1,count-1))];gl.bindVertexArray(mesh.vao);gl.drawArrays(gl.TRIANGLES,0,n);drawCalls++;},getState:()=>({buffers:Object.keys(gpu).length,drawCalls,disposed,source:'existing DFS exploration / BFS replay arrays'}),dispose(){if(disposed)return;disposed=true;for(const mesh of Object.values(gpu)){gl.deleteVertexArray(mesh.vao);gl.deleteBuffer(mesh.buffer);}}};
};
