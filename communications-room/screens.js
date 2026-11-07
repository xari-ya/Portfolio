/* Office-only screen content; the shared laptop and its hall screen stay intact. */
(()=>{'use strict';
 const home=new Image();
 window.CommunicationsScreens={home,
  homepage(c,v,phase=0){if(!home.src)home.src='./communications-room/assets/homepage-preview.jpg';const w=v.width,h=v.height;c.fillStyle='#101315';c.fillRect(0,0,w,h);if(home.complete&&home.naturalWidth)c.drawImage(home,0,0,w,h);else{c.fillStyle='#f1eee5';c.font='700 44px sans-serif';c.fillText('THE LIVING WORKSHOP',44,h/2);}if(phase){c.strokeStyle='#dfba87aa';c.lineWidth=3;c.strokeRect(3,3,w-6,h-6);}},
  ubuntu(c,v){const w=v.width,h=v.height,g=c.createLinearGradient(0,h,w,0);g.addColorStop(0,'#1c0a2e');g.addColorStop(.52,'#64244b');g.addColorStop(1,'#d14d22');c.fillStyle=g;c.fillRect(0,0,w,h);
   c.save();c.translate(w*.62,h*.5);c.strokeStyle='#f48e7244';c.lineWidth=3;for(let i=0;i<6;i++){c.beginPath();c.ellipse(0,0,110+i*28,160+i*20,-.7,0,Math.PI*2);c.stroke();}c.restore();
   c.fillStyle='#18151be8';c.fillRect(0,0,w,34);c.fillStyle='#f5f4f2';c.font='600 16px sans-serif';c.fillText('Activities',16,23);c.textAlign='center';c.fillText('Ubuntu Desktop',w/2,23);c.textAlign='left';c.fillText('\u25cf  \u25d4  \u23fb',w-108,23);
   c.fillStyle='#211a26dd';c.beginPath();c.roundRect(10,68,62,h-105,16);c.fill();
   const colors=['#e95e23','#eca440','#30323d','#9b9ba4'];for(let i=0;i<4;i++){const y=102+i*66;c.fillStyle=colors[i];c.beginPath();c.roundRect(22,y,38,38,9);c.fill();c.fillStyle='#fff';if(i===2){c.font='700 22px monospace';c.fillText('>_',25,y+26);}else if(i===1){c.fillStyle='#ffe0a4';c.fillRect(28,y+14,26,17);}else{c.beginPath();c.arc(41,y+19,10,0,Math.PI*2);c.strokeStyle='#fff';c.lineWidth=3;c.stroke();}}
   c.fillStyle='#d9d4de';for(let j=0;j<3;j++)for(let i=0;i<3;i++){c.beginPath();c.arc(29+i*12,h-60+j*10,2,0,Math.PI*2);c.fill();}
   c.fillStyle='#f2edf2';c.font='500 17px sans-serif';c.fillText('Home',101,127);c.fillStyle='#efb85b';c.beginPath();c.roundRect(109,68,43,36,4);c.fill();c.fillStyle='#f6e9d0';c.fillRect(115,81,31,18);
   c.textAlign='right';c.font='500 35px sans-serif';c.fillStyle='#ffffffb8';c.fillText('ubuntu',w-35,h-35);c.textAlign='left';
  }
 };
})();
