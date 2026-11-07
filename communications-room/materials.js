/* Small deterministic material maps; share the hall's finish maps where possible. */
window.createCommunicationsMaterials=function(k){
 const {gl,createTexture}=k,owned=[];
 function texture(w,h,paint,repeat=false){
  const cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');paint(c,w,h);
  const t=createTexture();owned.push(t);gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  for(const d of [gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,d,repeat?gl.REPEAT:gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_2D);return t;
 }
 let seed=87137;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const floor=texture(1024,512,(c,w,h)=>{
  c.fillStyle='#98948d';c.fillRect(0,0,w,h);
  for(let y=0;y<10;y++)for(let x=0;x<20;x++){
   const n=139+rnd()*22;c.fillStyle='rgb('+n+','+(n-1)+','+(n-3)+')';c.fillRect(x*w/20,y*h/10,w/20,h/10);
   c.strokeStyle='#575752';c.lineWidth=1.8;c.strokeRect(x*w/20+.5,y*h/10+.5,w/20-1,h/10-1);
  }
  for(let i=0;i<12500;i++){const n=rnd()>.5?'#b0aaa0':'#686863';c.globalAlpha=.06;c.fillStyle=n;c.fillRect(rnd()*w,rnd()*h,1+rnd()*2,.6);}
  c.globalAlpha=.06;c.strokeStyle='#d8d4c8';c.lineWidth=.5;for(let i=0;i<45;i++){const x=rnd()*w,y=rnd()*h;c.beginPath();c.moveTo(x,y);c.lineTo(x+12+rnd()*80,y+3);c.stroke();}c.globalAlpha=1;
 },true);
 const leather=texture(256,256,(c,w,h)=>{
  const im=c.createImageData(w,h);for(let i=0;i<w*h;i++){const n=210+rnd()*35;im.data.set([n,n,n,255],i*4);}c.putImageData(im,0,0);
 },true);
 const rug=texture(256,256,(c,w,h)=>{
  c.fillStyle='#b7a49d';c.fillRect(0,0,w,h);for(let i=0;i<256;i++){c.strokeStyle=i%2?'#887a73':'#d7c3b8';c.globalAlpha=.35;c.beginPath();c.moveTo(i,0);c.lineTo(i,h);c.moveTo(0,i+.5);c.lineTo(w,i+.5);c.stroke();}c.globalAlpha=1;
 },true);
 const glow=texture(64,64,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(255,255,255,.65)');g.addColorStop(.25,'rgba(255,255,255,.27)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,w,h);});
 const timber=texture(256,256,(c,w,h)=>{
  c.fillStyle='#bda181';c.fillRect(0,0,w,h);
  for(let i=0;i<220;i++){const yy=rnd()*h;c.strokeStyle=i%3?'#72583a':'#e1c09a';c.globalAlpha=.08+rnd()*.15;c.lineWidth=.3+rnd();c.beginPath();for(let x=0;x<=w;x+=8){const y=yy+Math.sin(x*.022+i)*1.5;c[x?'lineTo':'moveTo'](x,y);}c.stroke();}c.globalAlpha=1;
 },true);
 function finish(n,type='graphite',rough){
  if(k.finishMaps?.[type]){n.texture=k.finishMaps[type];n.texMode=2;}
  if(rough!==undefined)n.rough=rough;return n;
 }
 return {floor,leather,rug,timber,glow,finish,count:()=>owned.length};
};
