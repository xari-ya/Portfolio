/* Adapters to the existing hall scene graph. Unit meshes are shared; rigid
   frames are later merged by the hall's existing material batching pass. */
window.createLabGeometryKit=function(api){
 const {group,mat,box,cylinder,quad,createTexture,gl}=api,C={...api.C,graphite:[.050,.057,.062],darkSteel:[.092,.108,.116],steel:[.185,.210,.222],silver:[.34,.37,.38],charcoal:[.062,.073,.080],black:[.014,.018,.021]},cache=new Map(),animated=[],live=[],screens=[];let objects=0;
 const geo=(key,make)=>{if(!cache.has(key))cache.set(key,make());return cache.get(key);};
 const G=(parent,p=[0,0,0],r=[0,0,0])=>{const n=group(parent,p);n.r=r;return n;};
 function B(parent,w,h,d,col,p=[0,0,0],style='graphite',emit=0){const n=mat(parent,geo('cube',()=>box(1,1,1)),col,p,[],style,emit);n.s=[w,h,d];objects++;return n;}
 function R(parent,w,h,d,col,p,bevel=.035,style='graphite'){const n=mat(parent,geo(['bevel',w,h,d,bevel].join(':'),()=>box(w,h,d,bevel)),col,p,[],style);objects++;return n;}
 function leaf(parent,p,rot,scale=1){const n=mat(parent,geo('leaf',()=>api.customMesh([-.12,0,0,0,.09,-.025,.12,0,0,0,-.32,.015,0,-.04,.055],[0,1,4,1,2,4,2,3,4,3,0,4])),[.165,.295,.105],p,rot,'paint');n.s=[scale,scale,scale];objects++;return n;}
 function Y(parent,r,h,col,p=[0,0,0],rot=[0,0,0],style='steel',emit=0){const n=mat(parent,geo('cyl',()=>cylinder(1,1,20)),col,p,rot,style,emit);n.s=[r,h,r];objects++;return n;}
 function tube(parent,a,b,r,col,style='rubber'){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],len=Math.hypot(dx,dy,dz);const n=Y(parent,r,len,col,a.map((v,i)=>(v+b[i])/2),[Math.atan2(dz,Math.hypot(dx,dy)),0,-Math.atan2(dx,dy)],style);return n;}
 function cable(parent,points,r=.012,col=C.black){for(let i=1;i<points.length;i++)tube(parent,points[i-1],points[i],r,col);}
 function screen(parent,w,h,p,paint,{width=1024,height=512,dynamic=false}={}){const cv=document.createElement('canvas');cv.width=width;cv.height=height;const ctx=cv.getContext('2d'),texture=createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const node=mat(parent,geo('quad',()=>quad(1,1)),C.white,p,[],'glass',.9);node.s=[w,h,1];node.texture=texture;node.texMode=1;objects++;
  const result={node,canvas:cv,texture,ctx,upload(){gl.bindTexture(gl.TEXTURE_2D,texture);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,cv);},draw(...args){paint(ctx,cv,...args);this.upload();}};result.draw();if(dynamic){live.push(node);screens.push(result);}return result;
 }
 function sign(parent,text,w,h,p,sub=''){return screen(parent,w,h,p,(c,v)=>{c.fillStyle='#0c1012';c.fillRect(0,0,v.width,v.height);c.fillStyle='#f0432d';c.fillRect(18,14,9,v.height-28);const section=/^(\d{2})\s*\/\s*(.*)$/.exec(text);if(section){c.fillStyle='#f0432d';c.font='800 78px "Workshop Condensed",sans-serif';c.fillText(section[1],48,96);c.fillStyle='#ecebe3';c.font='700 58px "Workshop Condensed",sans-serif';c.fillText(section[2],178,68);if(sub){c.font='20px monospace';c.fillStyle='#9ca8ac';c.fillText(sub,180,108);}}else{c.fillStyle='#ecebe3';c.font='600 60px "Workshop Condensed",sans-serif';c.fillText(text,48,sub?66:82);if(sub){c.font='22px monospace';c.fillStyle='#9ca8ac';c.fillText(sub,50,106);}}},{width:Math.max(512,Math.round(128*w/h)),height:128});}
 function moving(n){animated.push(n);return n;}function indicator(parent,p,col=C.mint){const n=B(parent,.04,.025,.025,col,p,'light',.35);live.push(n);return n;}
 return {...api,C,G,B,R,Y,leaf,tube,cable,screen,sign,moving,indicator,animated,live,screens,stats:()=>({objects,meshVariants:cache.size,animated: animated.length,textures:screens.length})};
};
