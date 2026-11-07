/* Native, depth-tested display artwork. No room photograph is used as geometry. */
(()=>{'use strict';
 const font='"Workshop Condensed",sans-serif',red='#ff2414',white='#f1eee5';
 function plate(c,x,y,w,h,r=14){
  c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.lineTo(x+w,y+r);c.lineTo(x+w,y+h-r);
  c.lineTo(x+w-r,y+h);c.lineTo(x+r,y+h);c.lineTo(x,y+h-r);c.lineTo(x,y+r);c.closePath();
 }
 function rounded(c,x,y,w,h,r=13){c.beginPath();c.roundRect(x,y,w,h,r);}
 // Read the approved home controls without changing their styles or markup.
 function readTheme(){
  const read=(selector,fallback)=>{const node=document.querySelector(selector);if(!node)return fallback;const s=getComputedStyle(node);return {base:s.backgroundColor,stops:s.backgroundImage.match(/rgba?\([^)]+\)/g)||[],edge:s.borderTopColor,text:s.color,radius:parseFloat(s.borderTopLeftRadius)||13,font:s.fontFamily};};
  return {
   primary:read('.home .intro-actions .button-solid',{base:'#fa4120',stops:['#ffe0b329','#ff78410a','#971f0c1a'],edge:'#ffb28f99',text:'#fff9ef',radius:13,font:'monospace'}),
   secondary:read('.home .intro-actions .button-outline',{base:'#27374257',stops:['#e9f6ff1f','#b0cbdb06'],edge:'#e2f1f33b',text:'#ecf2f3',radius:13,font:'monospace'})
  };
 }
 function stripes(c,x,y,w=62,h=24,color=red){
  c.fillStyle=color;for(let i=0;i<3;i++){c.beginPath();c.moveTo(x+i*w*.36,y+h);c.lineTo(x+i*w*.36+w*.23,y);c.lineTo(x+i*w*.36+w*.46,y);c.lineTo(x+i*w*.36+w*.23,y+h);c.fill();}
 }
 function icon(c,id,x,y,s){
  c.save();c.translate(x,y);c.scale(s/48,s/48);c.strokeStyle=white;c.fillStyle=white;c.lineWidth=2.5;c.lineJoin='round';
  if(id===0){c.beginPath();c.roundRect(-21,-15,42,30,6);c.stroke();c.beginPath();c.moveTo(-20,-12);c.lineTo(0,3);c.lineTo(20,-12);c.stroke();}
  if(id===1){c.font='800 49px Arial';c.textAlign='center';c.fillText('in',0,17);}
  if(id===2){c.beginPath();c.arc(0,0,21,0,Math.PI*2);c.fill();c.fillStyle='#091014';c.beginPath();c.moveTo(-13,-8);c.lineTo(-13,-18);c.lineTo(-5,-13);c.quadraticCurveTo(0,-16,5,-13);c.lineTo(13,-18);c.lineTo(13,-8);c.bezierCurveTo(21,6,11,12,4,12);c.lineTo(4,22);c.lineTo(-4,22);c.lineTo(-4,12);c.bezierCurveTo(-13,10,-20,6,-13,-8);c.fill();c.strokeStyle='#091014';c.lineWidth=4;c.beginPath();c.moveTo(-4,17);c.quadraticCurveTo(-16,20,-18,11);c.stroke();}
  if(id===3){c.beginPath();c.moveTo(-14,-21);c.lineTo(5,-21);c.lineTo(16,-10);c.lineTo(16,21);c.lineTo(-14,21);c.closePath();c.moveTo(5,-21);c.lineTo(5,-10);c.lineTo(16,-10);for(let y=-2;y<16;y+=6){c.moveTo(-7,y);c.lineTo(9,y);}c.stroke();}
  c.restore();
 }
 const A=window.CommunicationsGraphics={revision:0,connectionsImage:null,connectionsLoading:false,theme:readTheme(),
  loadConnections(){if(this.connectionsLoading)return;this.connectionsLoading=true;const image=new Image();image.onload=()=>{this.connectionsImage=image;this.revision++;};image.src='./communications-room/assets/network-connections.png';},
  plate,stripes,icon,
  buttons:Array.from({length:4},(_,i)=>({x:.12+i*(.175+.02),y:.60,w:.175,h:.18})),
  display(c,v,{hover=-1,pressed=-1,resume=true,life={},motion=0,cached=false}={}){
   const w=v.width,h=v.height;
   if(!cached){
    const key=[w,h,hover,pressed,resume,A.revision,!!life.ack,!!window.CommunicationsPhone?.active].join(':');
    if(!A.displayCache){A.displayCache=document.createElement('canvas');A.displayCache.width=w;A.displayCache.height=h;}
    if(A.displayCacheKey!==key){A.displayCacheKey=key;A.displayCache.width=w;A.displayCache.height=h;A.display(A.displayCache.getContext('2d'),A.displayCache,{hover,pressed,resume,life,cached:true});}
    c.clearRect(0,0,w,h);c.drawImage(A.displayCache,0,0);
    c.fillStyle='rgba(241,128,93,'+(.35+.15*Math.sin(motion*.7)+(life.welcome||0)*.2)+')';c.fillRect(w*.025,h*.065,w*.004,h*.04);
    return;
   }
   c.clearRect(0,0,w,h);
   if(window.CommunicationsPhone?.active){A.phoneDisplay(c,v,{hover,pressed,resume});return;}
   c.fillStyle='#090c0f';c.fillRect(0,0,w,h);
   const g=c.createRadialGradient(w*.76,h*.35,0,w*.65,h*.4,w*.9);g.addColorStop(0,'#111619');g.addColorStop(1,'#080b0e');c.fillStyle=g;c.fillRect(0,0,w,h);
   c.strokeStyle='#e1f1fa16';c.lineWidth=1.5;rounded(c,12,12,w-24,h-24,22);c.stroke();
   c.fillStyle='#f1805d';c.font='600 '+h*.048+'px monospace';c.fillText('07 / COMMUNICATIONS',w*.12,h*.125);
   c.strokeStyle='#dce8ed20';c.lineWidth=1;c.beginPath();c.moveTo(w*.12,h*.185);c.lineTo(w*.54,h*.185);c.stroke();
   c.fillStyle=white;c.font='600 '+h*.119+'px '+font;c.fillText("LET'S BUILD",w*.12,h*.345);
   const tw=c.measureText("LET'S BUILD ").width;c.fillStyle=red;c.fillText('SOMETHING.',w*.12+tw,h*.345);
   c.font='400 '+h*.043+'px Arial,sans-serif';c.fillStyle='#ccd7dd';
   c.fillText('Interested in collaborating, discussing an engineering project,',w*.12,h*.465);
   c.fillText("or exploring an internship opportunity? I'd love to connect.",w*.12,h*.535);
   if(A.connectionsImage){const im=A.connectionsImage;c.save();c.globalCompositeOperation='screen';c.drawImage(im,im.width*.28,im.height*.03,im.width*.71,im.height*.88,w*.58,h*.025,w*.30,h*.56);c.restore();}
   A.buttons.forEach((b,i)=>{
    const x=b.x*w,y=b.y*h,bw=b.w*w,bh=b.h*h,t=i===0?A.theme.primary:A.theme.secondary,on=hover===i;
    c.save();if(i===3&&!resume)c.globalAlpha=.56;
    rounded(c,x,y,bw,bh,t.radius*w/1200);c.fillStyle=t.base;c.fill();
    const glass=c.createLinearGradient(x,y,x+bw*.4,y+bh);t.stops.forEach((color,j)=>glass.addColorStop(j/Math.max(1,t.stops.length-1),color));c.fillStyle=glass;c.fill();
    if(on){c.fillStyle='#dbeaf214';c.fill();}if(pressed===i){c.fillStyle='#00000026';c.fill();}
    c.strokeStyle=on?'#f5ceaa9c':t.edge;if(on&&life.ack)c.strokeStyle='#ffe1bc';c.lineWidth=on?2.8:1.6;c.stroke();
    c.save();rounded(c,x+2,y+2,bw-4,bh-4,t.radius*w/1200-2);c.clip();c.strokeStyle='#ffffff24';c.lineWidth=2;c.beginPath();c.moveTo(x,y+2);c.lineTo(x+bw,y+2);c.stroke();c.restore();
    icon(c,i,x+bw*.16,y+bh*.50,bh*.27);c.fillStyle=t.text;c.textAlign='left';c.font='700 '+h*.05+'px '+t.font;
    c.fillText(['EMAIL ME','LINKEDIN','GITHUB','VIEW RÉSUMÉ'][i],x+bw*.29,y+bh*.58);c.restore();
   });
  },
  phoneDisplay(c,v,{hover,pressed,resume}){
   const w=v.width,h=v.height,phone=CommunicationsPhone;
   c.fillStyle='#090e13';c.fillRect(0,0,w,h);
   const wash=c.createLinearGradient(0,0,w,h);wash.addColorStop(0,'#dff1ff0c');wash.addColorStop(1,'#02080e00');c.fillStyle=wash;c.fillRect(0,0,w,h);return; // Phone typography and controls use the projected native interface.

  },
  touch(c,v){
   const w=v.width,h=v.height;c.fillStyle='#090c0f';c.fillRect(0,0,w,h);
   const wash=c.createLinearGradient(0,0,w,h);wash.addColorStop(0,'#dfF1ff12');wash.addColorStop(1,'#02080e22');c.fillStyle=wash;rounded(c,10,10,w-20,h-20,24);c.fill();c.strokeStyle='#e1f1fa29';c.lineWidth=1.5;c.stroke();
   c.fillStyle=white;c.font='600 73px '+font;c.fillText('GET IN',39,119);c.fillStyle='#ff7656';c.fillText('TOUCH',39,199);c.fillRect(40,243,74,3);
   c.fillStyle='#ccd7dd';c.font='400 32px Arial,sans-serif';['Collaborate,','connect, or','explore','opportunities.'].forEach((s,i)=>c.fillText(s,40,320+i*48));stripes(c,180,h-87,95,34);
  },
  brand(c,v){
   c.clearRect(0,0,v.width,v.height);
   c.fillStyle='#111315';c.font='800 145px '+font;c.fillText('S',38,176);c.fillText('D.',164,176);c.fillStyle=red;c.fillText('/',115,176);
   c.strokeStyle='#a7462f';c.lineWidth=4;c.beginPath();c.moveTo(345,49);c.lineTo(345,211);c.stroke();
   c.fillStyle='#101214';c.font='800 86px '+font;c.fillText('SARITH DODANGODAGE',410,127);
   c.fillStyle='#1c2223';const subtitle='ENGINEERING \u00b7 ROBOTICS \u00b7 INTELLIGENT SYSTEMS';const subtitleSize=Math.min(54,54*(v.width-460)/Math.max(1,(c.font='600 54px '+font,c.measureText(subtitle).width)));c.font='600 '+subtitleSize+'px '+font;c.fillText(subtitle,412,199);

  },
  floor(c,v){
   c.clearRect(0,0,v.width,v.height);c.strokeStyle='#c1c0b7';c.lineWidth=3;
   for(const [x,y,sx,sy] of [[8,8,1,1],[v.width-8,8,-1,1],[8,v.height-8,1,-1],[v.width-8,v.height-8,-1,-1]]){c.beginPath();c.moveTo(x+sx*61,y);c.lineTo(x,y);c.lineTo(x,y+sy*26);c.stroke();}
   c.font='800 142px '+font;c.fillStyle='#e7e3d9';c.fillText('S',197,157);c.fillText('D.',365,157);c.fillStyle=red;c.fillText('/',291,157);
  },
  bolt(c,v){c.clearRect(0,0,v.width,v.height);c.shadowColor=red;c.shadowBlur=18;c.fillStyle=red;c.beginPath();[[.58,.15],[.28,.55],[.49,.55],[.40,.87],[.73,.41],[.52,.41]].forEach(([x,y],i)=>c[i?'lineTo':'moveTo'](x*v.width,y*v.height));c.closePath();c.fill();}
 };
})();
