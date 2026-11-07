/* Accessible content projected onto the wall display. Navigation is
 * delegated to WorkshopNavigation, the portfolio's single scroll timeline. */
(()=>{'use strict';
const panel=document.getElementById('engineerAbout');document.body.appendChild(panel);let active=false,entered=false,arrivalAt=0,tab='intro',lastScreenMode=null;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const nav=(name)=>window.WorkshopNavigation?.navigate(name);
const reading=panel.querySelector('.engineer-reading'),hint=panel.querySelector('.engineer-read-hint');
function readingHint(){hint.hidden=reading.scrollHeight<=reading.clientHeight+5||reading.scrollTop+reading.clientHeight>=reading.scrollHeight-5;}
reading.addEventListener('scroll',readingHint,{passive:true});new ResizeObserver(readingHint).observe(reading);
// Contain reading gestures locally; scene progress remains native page scroll
// outside this interface. This is not a second camera/scroll controller.
panel.addEventListener('wheel',e=>{e.stopPropagation();if(!reading.contains(e.target)||reading.scrollHeight<=reading.clientHeight+2)e.preventDefault();},{passive:false});
let touchY=null;
panel.addEventListener('touchstart',e=>{touchY=e.touches.length===1?e.touches[0].clientY:null;},{passive:true});
panel.addEventListener('touchmove',e=>{if(touchY===null||e.touches.length!==1)return;const y=e.touches[0].clientY,dy=y-touchY;touchY=y;const inside=reading.contains(e.target),top=reading.scrollTop<=0,bottom=reading.scrollTop+reading.clientHeight>=reading.scrollHeight-1;if(!inside||(dy>0&&top)||(dy<0&&bottom))e.preventDefault();e.stopPropagation();},{passive:false});
reading.addEventListener('keydown',e=>{if(e.target===reading&&reading.scrollHeight<=reading.clientHeight+2&&['PageDown','PageUp',' ','ArrowDown','ArrowUp'].includes(e.key))e.preventDefault();});
panel.addEventListener('click',e=>{const button=e.target.closest('[data-engineer-tab],[data-engineer-nav]');if(!button)return;
 if(button.dataset.engineerNav){nav(button.dataset.engineerNav);return;}
 tab=button.dataset.engineerTab;panel.querySelector('.engineer-reading').scrollTop=0;panel.querySelectorAll('[data-engineer-tab]').forEach(b=>{const selected=b===button;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
 panel.querySelectorAll('[data-engineer-page]').forEach(p=>p.hidden=p.dataset.engineerPage!==tab);
 readingHint();
 window.__engineerScene?.station.display(true,tab);window.__engineerScene?.renderer.avatar?.playPresent();
});
panel.querySelector('[role="tablist"]').addEventListener('keydown',e=>{if(!['ArrowRight','ArrowLeft','Home','End'].includes(e.key))return;e.preventDefault();const tabs=[...panel.querySelectorAll('[role="tab"]')],index=tabs.indexOf(document.activeElement),next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+(e.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].click();tabs[next].focus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){nav('overview');document.querySelector('[data-hall="about"]')?.focus({preventScroll:true});}});
function screenProjection(camera,layout){
 const norm=a=>{const n=Math.hypot(...a);return a.map(x=>x/n);},dot=(a,b)=>a.reduce((s,x,i)=>s+x*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],f=norm(camera.target.map((x,i)=>x-camera.eye[i])),right=norm(cross(f,[0,1,0])),up=cross(right,f),q=Math.tan(camera.fov/2);
 const [cx,cy,cz]=layout.screen,[w,h]=layout.screenSize,points=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([x,y])=>{const world=layout.worldPoint([cx+x*w*.482,cy+y*h*.475,cz+.045]),v=world.map((n,i)=>n-camera.eye[i]),z=dot(v,f);return [innerWidth*(.5+dot(v,right)/(2*z*q*camera.aspect)),innerHeight*(.5-dot(v,up)/(2*z*q))];});
 if(points.some(p=>p.some(n=>!Number.isFinite(n))))return null;
 // Keep the HTML in an ordinary 2D paint layer. A projective matrix3d can
 // fragment text glyphs in hardware compositors, particularly on scrolling
 // descendants. Fit the screen's projected axes and safely inset all corners
 // inside its true quadrilateral instead of perspective-warping live text.
 const [a,b,c,d]=points,[W,H]=layout.contentSize;
 const center=[0,1].map(i=>(a[i]+b[i]+c[i]+d[i])/4);
 const u=[0,1].map(i=>(b[i]+c[i]-a[i]-d[i])/(2*W));
 const v=[0,1].map(i=>(d[i]+c[i]-a[i]-b[i])/(2*H));
 if(Math.abs(u[0]*v[1]-u[1]*v[0])<.00001)return null;
 const corners=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>center.map((n,i)=>n+x*u[i]*W/2+y*v[i]*H/2));
 const side=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
 let fit=1;
 for(let i=0;i<4;i++){
  const edgeA=points[i],edgeB=points[(i+1)%4],inside=side(edgeA,edgeB,center);
  for(const p of corners){const distance=side(edgeA,edgeB,p);if(distance*inside<0)fit=Math.min(fit,inside/(inside-distance));}
 }
 fit*=.99;
 return {matrix:[u[0]*fit,u[1]*fit,v[0]*fit,v[1]*fit,center[0]-(u[0]*W+v[0]*H)*fit/2,center[1]-(u[1]*W+v[1]*H)*fit/2]};
}
window.EngineerAbout={
 update({progress,camera,ms,avatar,layout}){
  const intent=window.WorkshopNavigation?.getState().intent;
  const wanted=progress>=.10&&progress<.30&&(!intent||intent.destination==='about')&&!window.__kiraSequence?.active&&!document.body.classList.contains('hall-inspecting');
  if(wanted!==active){active=wanted;document.body.classList.toggle('engineer-active',active);panel.hidden=!active;panel.inert=!active;panel.setAttribute('aria-hidden',String(!active));
   if(active){arrivalAt=ms;entered=false;panel.classList.remove('is-ready');panel.querySelector('.engineer-reading').scrollTop=0;}
   else{avatar?.playExit();window.__engineerScene?.station.display(false);panel.classList.remove('is-ready');if(panel.contains(document.activeElement))document.activeElement.blur();}
  }
  if(!active)return;
  if(!entered&&(reduced||progress>=.142&&progress<=.277)){entered=true;avatar?.enter();window.__engineerScene?.station.display(true,tab);}
  if(entered&&avatar&&!avatar.active)avatar.enter();
  if(entered&&(reduced||ms-arrivalAt>150))panel.classList.add('is-ready');
  const desktop=innerWidth>=1040&&innerWidth/innerHeight>=1.4&&!document.body.classList.contains('has-no-webgl');
  panel.classList.toggle('on-wall-screen',desktop);
  if(lastScreenMode!==desktop){window.__engineerScene?.station.display(true,tab);lastScreenMode=desktop;}
  if(desktop&&camera){const projected=screenProjection(camera,layout);if(projected){const transform='matrix('+projected.matrix.map(n=>n.toFixed(6)).join(',')+')';if(panel.style.transform!==transform)panel.style.transform=transform;panel.style.width=layout.contentSize[0]+'px';panel.style.height=layout.contentSize[1]+'px';panel.dataset.projection='wall';}}
  else{panel.style.removeProperty('transform');panel.style.removeProperty('width');panel.style.removeProperty('height');panel.dataset.projection='reading';}
 },getState:()=>({active,entered,tab,projection:panel.dataset.projection||null}),
};
// Fallback content still follows the same navigation and remains semantic HTML.
window.addEventListener('portfolio:render-fallback',()=>document.body.classList.add('engineer-fallback'));
})();
