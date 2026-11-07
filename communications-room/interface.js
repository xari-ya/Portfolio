/* Accessible controls track the depth-tested display; reused models stay in front. */
(()=>{'use strict';
 const lifecycleAbort=new AbortController(),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
 const panel=document.createElement('section');panel.id='communicationsPanel';panel.className='communications-panel';panel.hidden=true;panel.inert=true;panel.setAttribute('aria-label','Office and communications');
 panel.innerHTML='<div class="comms-copy"><span>07 / COMMUNICATIONS</span><h2>LET’S BUILD <em>SOMETHING.</em></h2><p>Interested in collaborating, discussing an engineering project, or exploring an internship opportunity? I’d love to connect.</p></div><div class="comms-actions"></div>';
 const paths=[
  '<rect x="3" y="6" width="26" height="20" rx="4"/><path d="m4 8 12 9L28 8"/>',
  '<path d="M5 12v15M5 5v1m8 21V12m0 6c0-9 13-9 13 0v9"/>',
  '<path d="M16 3a13 13 0 0 0-4 25v-6c-5 1-6-2-7-4m7 4c-5-1-7-8-3-11l-1-5 6 3h4l6-3-1 5c4 3 2 10-3 11v6A13 13 0 0 0 16 3Z"/>',
  '<path d="M7 2h12l7 7v21H7Zm12 0v8h7M11 15h11m-11 5h11m-11 5h11"/>'
 ];
 const links=[...document.querySelector('#contact .contact-links').children];
 links.forEach((a,i)=>{
  a.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true">'+paths[i]+'</svg><span>'+['EMAIL ME','LINKEDIN','GITHUB','VIEW RÉSUMÉ'][i]+'</span>';
  a.dataset.commsAction=i;panel.querySelector('.comms-actions').append(a);
  a.addEventListener('pointerenter',e=>{if(e.pointerType!=='touch')CommunicationsRoom.behaviour.contact('hover',i);});
  a.addEventListener('focus',()=>CommunicationsRoom.behaviour.contact('focus',i));
  a.addEventListener('pointerleave',()=>{CommunicationsRoom.behaviour.contact('hover',-1);CommunicationsRoom.behaviour.contact('press',-1);});
  a.addEventListener('blur',()=>{CommunicationsRoom.behaviour.contact('focus',-1);CommunicationsRoom.behaviour.contact('press',-1);});
  a.addEventListener('click',()=>{if(!a.hasAttribute('aria-disabled'))CommunicationsRoom.behaviour.contact('click',i);});
  a.addEventListener('pointerdown',()=>{if(!a.hasAttribute('aria-disabled'))CommunicationsRoom.behaviour.contact('press',i);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])a.addEventListener(event,()=>{CommunicationsRoom.behaviour.contact('press',-1);});
 });
 const nav=document.createElement('nav');nav.className='comms-navigation';nav.setAttribute('aria-label','Office navigation. Arrow keys look around; Home restores the view.');nav.hidden=true;
 nav.innerHTML='<button type="button" data-comms-back>← SKILLS ROOM</button><button type="button" data-comms-home>BACK TO WORKSHOP ↗</button>';

 document.body.append(panel,nav);
 nav.querySelector('[data-comms-back]').onclick=()=>WorkshopNavigation.navigate('lab');
 nav.querySelector('[data-comms-home]').onclick=()=>WorkshopNavigation.navigate('overview');
 nav.addEventListener('keydown',e=>{CommunicationsRoom.behaviour.activity();
  if(e.key==='Home'){e.preventDefault();CommunicationsCamera.reset();return;}
  const moves={ArrowLeft:[90,0],ArrowRight:[-90,0],ArrowUp:[0,75],ArrowDown:[0,-75]};
  if(!moves[e.key])return;e.preventDefault();CommunicationsCamera.rotate(...moves[e.key],innerWidth,innerHeight);
 });
 for(const event of ['wheel','touchmove'])panel.addEventListener(event,e=>e.stopPropagation(),{passive:true});
 panel.addEventListener('keydown',e=>{if(e.key==='Escape')WorkshopNavigation.navigate('lab');});
 const cv=links[3];
 fetch('./Sarith_Dodangodage_CV.pdf',{method:'HEAD'}).then(response=>{
  CommunicationsRoom.resumeAvailable=response.ok;
  if(!response.ok){cv.removeAttribute('href');cv.setAttribute('aria-disabled','true');cv.title='Résumé PDF is unavailable in this checkout';}
 }).catch(()=>{CommunicationsRoom.resumeAvailable=false;cv.removeAttribute('href');cv.setAttribute('aria-disabled','true');});
 window.addEventListener('workshop:navigate',e=>{if(!['communications','contact'].includes(e.detail?.destination))CommunicationsRoom.behaviour.exit();},{signal:lifecycleAbort.signal});
 document.addEventListener('visibilitychange',()=>{CommunicationsRoom.behaviour.previous=performance.now();CommunicationsRoom.behaviour.hidden=document.hidden;if(document.hidden)CommunicationsRoom.behaviour.pressed=-1;else CommunicationsRoom.behaviour.contact('press',-1);},{signal:lifecycleAbort.signal});
 window.addEventListener('focus',()=>{if(CommunicationsRoom.active)CommunicationsRoom.behaviour.activity();},{signal:lifecycleAbort.signal});
 const greetings=document.createElement('div');greetings.className='comms-greetings';
 for(const [who,label] of [['kira','Say hello to KIRA'],['engineer','Greet Sarith']]){const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=()=>{if(who==='kira')window.__labScene?.acknowledgeKira();else CommunicationsRoom.behaviour.greet(who);};greetings.append(button);}const inspect=document.createElement('button');inspect.type='button';inspect.textContent='Inspect both cars and workstation';inspect.dataset.commsCars='';inspect.onclick=()=>CommunicationsCamera.inspectCars();greetings.append(inspect);panel.append(greetings);
 panel.addEventListener('keydown',()=>CommunicationsRoom.behaviour.activity());
 panel.addEventListener('scroll',()=>{panel._scrolled=true;},{passive:true});
 let lastCamera=null;
 const doorHint=document.createElement('div');doorHint.className='hall-hover-hint';doorHint.textContent='SKILLS ROOM';doorHint.hidden=true;doorHint.setAttribute('aria-hidden','true');document.body.append(doorHint);
 const stage=document.getElementById('stage');let doorActive=false,doorDown=null;
 const normalize=a=>{const l=Math.hypot(...a)||1;return a.map(x=>x/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 function doorQuad(camera){
  if(!camera||!stage||!window.EngineeringLabLayout)return null;
  const D=EngineeringLabLayout.doorway,c=D.center,half=1.24,height=3.12,z=c[2]-.02,pts=[[c[0]-half,c[1],z],[c[0]+half,c[1],z],[c[0]+half,c[1]+height,z],[c[0]-half,c[1]+height,z]];
  const f=normalize(camera.target.map((v,i)=>v-camera.eye[i])),right=normalize(cross(f,[0,1,0])),up=cross(right,f),q=Math.tan(camera.fov/2),width=camera.viewport?.width||innerWidth,viewHeight=camera.viewport?.height||innerHeight,top=camera.viewport?.top||0;
  const out=pts.map(world=>{const v=world.map((p,i)=>p-camera.eye[i]),depth=dot(v,f);if(depth<.1)return null;return [width*(.5+dot(v,right)/(2*depth*q*camera.aspect)),top+viewHeight*(.5-dot(v,up)/(2*depth*q))];});
  return out.every(Boolean)?out:null;
 }
 function inQuad(x,y,quad){let sign=0;for(let i=0;i<4;i++){const a=quad[i],b=quad[(i+1)%4],v=(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);if(Math.abs(v)<.001)continue;const s=v>0?1:-1;if(sign&&sign!==s)return false;sign=s;}return !!sign;}
 function overDoor(x,y){if(!doorActive||!lastCamera||!stage||stage.classList.contains('comms-dragging'))return false;const quad=doorQuad(lastCamera);return !!quad&&inQuad(x,y,quad);}
 window.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'||e.target!==stage||!overDoor(e.clientX,e.clientY)){doorHint.hidden=true;return;}
  doorHint.hidden=false;doorHint.style.left=Math.min(e.clientX+15,innerWidth-230)+'px';doorHint.style.top=Math.min(e.clientY+18,innerHeight-80)+'px';
 },{passive:true});
 window.addEventListener('pointerdown',e=>{doorDown=e.target===stage&&doorActive?[e.clientX,e.clientY]:null;},{passive:true});
 window.addEventListener('pointerup',e=>{
  const down=doorDown;doorDown=null;
  if(!down||e.target!==stage||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6||!overDoor(e.clientX,e.clientY))return;
  doorHint.hidden=true;window.WorkshopNavigation?.navigate('lab');
 },{passive:true});
 document.addEventListener('pointerleave',()=>{doorHint.hidden=true;});
 window.addEventListener('blur',()=>{doorHint.hidden=true;});
 window.CommunicationsInterface={
  update(p,camera){
   if(camera)lastCamera=camera;
   const life=CommunicationsRoom.behaviour;life.tick(p,performance.now(),{hidden:document.hidden,blocked:!!window.ProjectStudy?.active||!!window.__kiraSequence?.active||!!(window.WorkshopNavigation?.getState().intent&&!['communications','contact'].includes(window.WorkshopNavigation.getState().intent?.destination)),reduced:reducedMotion.matches});
   CommunicationsRoom.hover=life.selected;CommunicationsRoom.pressed=life.pressed;
   const on=p>=.98&&!window.ProjectStudy?.active&&!window.__kiraSequence?.active;
   panel.hidden=!on;panel.inert=!on;nav.hidden=!on;CommunicationsRoom.active=on;
   doorActive=on&&!window.CommunicationsPhone?.active;if(!doorActive)doorHint.hidden=true;
   const locked=on&&CommunicationsPhone.active;
   if(locked&&!document.documentElement.classList.contains('comms-phone-locked'))CommunicationsCamera.reset();
   document.documentElement.classList.toggle('comms-phone-locked',locked);
   document.body.classList.toggle('communications-active',p>=.915&&!window.ProjectStudy?.active);
   if(!on){CommunicationsCamera.cancel?.();CommunicationsCamera.inspectionGoal=0;return;}
   const phone=window.CommunicationsPhone?.active&&lastCamera&&window.__communicationsScene&&!document.body.classList.contains('has-no-webgl');
   const wall=innerWidth>=1040&&innerWidth/innerHeight>=1.25&&lastCamera&&window.__communicationsScene&&!document.body.classList.contains('has-no-webgl');
   panel.querySelector('.comms-actions').hidden=!!(wall&&CommunicationsCamera.inspection>.15);
   panel.dataset.layout=phone?'phone':wall?'wall':'reading';nav.dataset.layout=panel.dataset.layout;
   nav.setAttribute('aria-label',CommunicationsPhone.active?'Office navigation':'Office navigation. Arrow keys look around; Home restores the view.');
   nav.querySelector('[data-comms-back]').textContent=CommunicationsPhone.active?'\u2190 SKILLS LAB':'\u2190 SKILLS ROOM';nav.querySelector('[data-comms-home]').textContent=CommunicationsPhone.active?'START OVER \u2197':'BACK TO WORKSHOP \u2197';
   if(phone){
    if(nav.parentElement!==panel||panel.firstChild!==nav)panel.prepend(nav);
    const q=LabSkillsInterface.projectPlane(lastCamera,CommunicationsPhone.screenPlane);
    if(q){
     const [a,b,c,d]=q.points,edge=(u,v)=>Math.hypot(u[0]-v[0],u[1]-v[1]);
     const width=(edge(a,b)+edge(d,c))/2,height=(edge(a,d)+edge(b,c))/2;
     panel.style.width=width+'px';panel.style.height=height+'px';panel.dataset.dense=height<430?'true':'false';
     panel.style.transform=CommunicationsPhone.project(q.points,width,height);
     panel.style.visibility=width>2&&height>2&&CommunicationsCamera.inspection<.15?'visible':'hidden';
     if(panel.dataset.measure!==width.toFixed(1)+':'+height.toFixed(1)||panel._scrolled){
      panel.dataset.measure=width.toFixed(1)+':'+height.toFixed(1);panel._scrolled=false;
      const box=node=>{let x=0,y=0;for(let n=node;n&&n!==panel;n=n.offsetParent){x+=n.offsetLeft;y+=n.offsetTop;}return {x:x/width,y:(y-panel.scrollTop)/height,w:node.offsetWidth/width,h:node.offsetHeight/height};};
      links.forEach((a,i)=>CommunicationsPhone.buttons[i]=box(a));
     }
    }
   }else if(wall){
    [...nav.children].forEach(b=>b.removeAttribute('style'));
    panel.style.cssText='';
    if(nav.parentElement!==document.body)document.body.append(nav);
    links.forEach((a,i)=>{
     const b=CommunicationsGraphics.buttons[i],s=CommunicationsPhone.screenPlane;
     const plane={center:[s.center[0]+(b.x+b.w/2-.5)*s.size[0],s.center[1]+(.5-b.y-b.h/2)*s.size[1],s.center[2]],size:[s.size[0]*b.w,s.size[1]*b.h]};
     const q=LabSkillsInterface.projectPlane(lastCamera,plane);if(!q)return;
     const left=Math.min(...q.points.map(p=>p[0])),top=Math.min(...q.points.map(p=>p[1])),width=Math.max(...q.points.map(p=>p[0]))-left,height=Math.max(...q.points.map(p=>p[1]))-top;
     a.style.cssText='left:'+left+'px;top:'+top+'px;width:'+width+'px;height:'+height+'px;clip-path:polygon('+q.points.map(p=>(p[0]-left)/width*100+'% '+(p[1]-top)/height*100+'%').join(',')+');';
    });
   }else{
    [...nav.children].forEach(b=>b.removeAttribute('style'));
    panel.style.cssText='';links.forEach(a=>a.removeAttribute('style'));
    if(nav.parentElement!==panel||CommunicationsPhone.active)CommunicationsPhone.active?panel.prepend(nav):panel.append(nav);
   }
  },
  dispose(){lifecycleAbort.abort();panel.remove();nav.remove();}
 };
})();
