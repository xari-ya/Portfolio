/* The lab's two physical displays, mirrored as crisp HTML instruments. All
   camera and state updates come from the existing world loop. */
(()=>{'use strict';
 const skills=EngineeringSkillsData,journey=EngineeringExperienceData,root=document.createElement('section');root.id='engineeringLab';root.className='engineering-lab';root.hidden=true;root.inert=true;root.setAttribute('aria-label','Engineering and Career Lab');
 const paths={
  chip:'<rect x="6.2" y="6.2" width="11.6" height="11.6" rx="1.5"/><rect x="9.4" y="9.4" width="5.2" height="5.2" rx=".8"/><path d="M9 2.2v4M12 2.2v4M15 2.2v4M9 17.8v4M12 17.8v4M15 17.8v4M2.2 9h4M2.2 12h4M2.2 15h4M17.8 9h4M17.8 12h4M17.8 15h4"/>',
  robot:'<path d="M4.2 20.8h15.6M6.8 20.8v-3.4l6.4-5.1-6.4-6.2m6.4 6.2 5.2-5.4-4.1-4-7.2 3m11.1 1.1 2.7 2.9-2.7 2.9"/><circle cx="6.8" cy="6.1" r="1.8"/><circle cx="13.2" cy="12.3" r="1.7"/>',
  code:'<path d="m8 5.8-5.7 6.2L8 18.2M16 5.8l5.7 6.2L16 18.2M14.1 3.1 9.9 20.9"/>',
  monitor:'<rect x="2.6" y="3.4" width="18.8" height="13.2" rx="1.5"/><path d="M6 9.7h1.8l1.4 4.2 2.2-6.2 2 4.5 1.3-2.5H18M8.6 20.6h6.8M12 16.6v4"/>',
  leadership:'<circle cx="8.2" cy="8.2" r="2.4"/><circle cx="15.8" cy="8.2" r="2.4"/><path d="M3.2 18.8v-1.4c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5v1.4m-1.1-5.3c.6-.7 1.4-1.1 2.4-1.1 2.4 0 4.3 1.8 4.3 4v1.1"/>',
  experience:'<rect x="3" y="7.5" width="18" height="12.5" rx="1.7"/><path d="M8.2 7.5V5.2c0-1 .8-1.8 1.8-1.8h4c1 0 1.8.8 1.8 1.8v2.3M3 12.4h18M10 12.4v2h4v-2"/>',
  achievements:'<path d="M7.2 3.2h9.6v3.7c0 3.4-2.1 6.1-4.8 6.1s-4.8-2.7-4.8-6.1Z"/><path d="M7.2 5H3.4v1.3c0 2.3 1.7 4 4.2 4.2m9.2-5.5h3.8v1.3c0 2.3-1.7 4-4.2 4.2M12 13v4.1M8 17.1h8v3.3H8Z"/>'
 };
 const icon=(id,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">${paths[id]||paths.code}</svg>`;
 const building='';
 root.innerHTML=`
 
 <div class="lab-archive-notice" hidden></div>
 <section class="lab-panel lab-skills-panel" id="labSkillsPanel" aria-labelledby="labTitle">
  <div class="lab-screen-chrome lab-skills-screen">
   <header class="lab-screen-head"><span class="lab-red-square"></span><span id="labTitle">ENGINEERING DOMAINS</span><span class="lab-screen-dots" aria-hidden="true">···</span></header>
   <div class="lab-domain-layout">
    <div class="lab-domain-grid">${skills.categories.map(c=>`<button type="button" class="lab-capability" data-lab-category="${c.id}" aria-pressed="false" aria-label="${c.name}">${icon(c.icon,'lab-card-icon')}<span class="lab-card-title">${c.name}</span></button>`).join('')}</div>
    <aside class="lab-domain-detail" aria-live="polite">
     <div class="lab-detail-head"><h3 id="labDomainName">EMBEDDED SYSTEMS</h3><span class="lab-screen-dots" aria-hidden="true">···</span></div>
     <p id="labDomainDescription"></p>
     <h4>KEY TECHNOLOGIES</h4>
     <div class="lab-tech-chips" id="labDomainTools"></div>
    </aside>
   </div>
   <span id="labSkillsStatus" class="lab-visually-hidden" role="status" aria-live="polite">EMBEDDED SYSTEMS / WORKBENCH ONLINE</span>
  </div>
 </section>
 <section class="lab-panel lab-experience-panel" id="labExperiencePanel" aria-labelledby="labExperienceTitle">
  <div class="lab-screen-chrome lab-experience-screen">
   <header class="lab-screen-head"><span class="lab-red-square"></span><span id="labExperienceTitle">MY JOURNEY</span><span class="lab-screen-dots" aria-hidden="true">···</span></header>
   <div class="lab-journey-track" aria-label="Experience timeline">
    ${journey.journey.map((item,i)=>`<button type="button" class="lab-journey-stop ${item.id===journey.active?'is-selected':''}" data-lab-journey="${item.id}" aria-pressed="${item.id===journey.active}">${icon(item.icon,'lab-journey-icon')}<span>${item.name}</span></button>${i<journey.journey.length-1?'<i class="lab-journey-link" aria-hidden="true"></i>':''}`).join('')}
   </div>
   <div class="lab-journey-record" id="labJourneyRecord"><div class="lab-record-image">${building}</div><div class="lab-record-copy"><h3>${journey.record.title}</h3><p>${journey.record.detail}</p><span>${journey.record.meta}</span></div></div>
  </div>
 </section>
 <nav class="lab-navigation" aria-label="Lab navigation"><button type="button" data-lab-nav="production">← BACK TO PROJECTS</button><button type="button" data-lab-nav="lab">← LAB OVERVIEW</button><button type="button" data-lab-nav="skills" class="lab-primary lab-enter-skills">ENTER THE LAB ↗</button><button type="button" data-lab-nav="experience">EXPERIENCE ARCHIVES →</button><button type="button" class="lab-reception-entry" data-lab-nav="communications">CONTACT ROOM →</button></nav>`;
 document.body.append(root);
 const skillsPanel=root.querySelector('.lab-skills-panel'),experiencePanel=root.querySelector('.lab-experience-panel'),content=root.querySelector('.lab-domain-grid'),record=root.querySelector('#labJourneyRecord');
 let visible=false,mode='overview',lastCamera=null,doorActive=false,doorDown=null;
 const stage=document.getElementById('stage');
 const doorHint=document.createElement('div');doorHint.className='hall-hover-hint';doorHint.textContent='CONTACT ROOM';doorHint.hidden=true;doorHint.setAttribute('aria-hidden','true');document.body.append(doorHint);
 const normalize=a=>{const l=Math.hypot(...a)||1;return a.map(x=>x/l)},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 function doorQuad(camera){
  if(!camera||!stage||!window.EngineeringLabLayout)return null;
  const D=EngineeringLabLayout.doorway,c=D.center,half=1.24,height=3.12,z=c[2]+.02,pts=[[c[0]-half,c[1],z],[c[0]+half,c[1],z],[c[0]+half,c[1]+height,z],[c[0]-half,c[1]+height,z]];
  const f=normalize(camera.target.map((v,i)=>v-camera.eye[i])),right=normalize(cross(f,[0,1,0])),up=cross(right,f),q=Math.tan(camera.fov/2),width=camera.viewport?.width||innerWidth,viewHeight=camera.viewport?.height||innerHeight,top=camera.viewport?.top||0;
  const out=pts.map(world=>{const v=world.map((p,i)=>p-camera.eye[i]),depth=dot(v,f);if(depth<.1)return null;return [width*(.5+dot(v,right)/(2*depth*q*camera.aspect)),top+viewHeight*(.5-dot(v,up)/(2*depth*q))];});
  return out.every(Boolean)?out:null;
 }
 function inQuad(x,y,quad){let sign=0;for(let i=0;i<4;i++){const a=quad[i],b=quad[(i+1)%4],v=(b[0]-a[0])*(y-a[1])-(b[1]-a[1])*(x-a[0]);if(Math.abs(v)<.001)continue;const s=v>0?1:-1;if(sign&&sign!==s)return false;sign=s;}return !!sign;}
 function overDoor(x,y){if(!doorActive||!lastCamera||!stage||stage.classList.contains('dragging')||stage.classList.contains('comms-dragging'))return false;const quad=doorQuad(lastCamera);return !!quad&&inQuad(x,y,quad);}
 window.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'||e.target!==stage||!overDoor(e.clientX,e.clientY)){doorHint.hidden=true;return;}
  doorHint.hidden=false;doorHint.style.left=Math.min(e.clientX+15,innerWidth-230)+'px';doorHint.style.top=Math.min(e.clientY+18,innerHeight-80)+'px';
 },{passive:true});
 window.addEventListener('pointerdown',e=>{doorDown=e.target===stage&&doorActive?[e.clientX,e.clientY]:null;},{passive:true});
 window.addEventListener('pointerup',e=>{
  const down=doorDown;doorDown=null;
  if(!down||e.target!==stage||Math.hypot(e.clientX-down[0],e.clientY-down[1])>6||!overDoor(e.clientX,e.clientY))return;
  doorHint.hidden=true;window.WorkshopNavigation?.navigate('communications');
 },{passive:true});
 document.addEventListener('pointerleave',()=>{doorHint.hidden=true;});
 window.addEventListener('blur',()=>{doorHint.hidden=true;});

 function syncDomains(){const s=EngineeringLab.getState(),featured=s.category||'embedded',cat=skills.get(featured)||skills.categories[0];root.querySelectorAll('[data-lab-category]').forEach(b=>{const on=b.dataset.labCategory===(s.category||(innerWidth<=760?'embedded':null));b.classList.toggle('is-selected',on);b.setAttribute('aria-pressed',String(on));});root.querySelector('#labDomainName').textContent=cat.name.toUpperCase();root.querySelector('#labDomainDescription').textContent=cat.description;root.querySelector('#labDomainTools').innerHTML=cat.tools.map(t=>`<span>${t}</span>`).join('');if(!s.category&&innerWidth>760){root.querySelector('#labDomainName').textContent='SELECT A DOMAIN';root.querySelector('#labDomainDescription').textContent='Explore the tools, technologies and capabilities behind my projects.';root.querySelector('#labDomainTools').innerHTML='';}else{root.querySelector('#labDomainName').textContent=cat.name.toUpperCase();root.querySelector('#labDomainDescription').textContent=cat.description;root.querySelector('#labDomainTools').innerHTML=cat.tools.map(t=>`<span>${t}</span>`).join('');}root.querySelector('#labSkillsStatus').textContent=cat.name.toUpperCase()+' / WORKBENCH ONLINE';root.dataset.category=featured;window.LabRefinement?.refresh();}
 function syncJourney(){const selectedJourney=EngineeringLab.getState().journey;root.querySelectorAll('[data-lab-journey]').forEach(b=>{const on=b.dataset.labJourney===selectedJourney;b.classList.toggle('is-selected',on);b.setAttribute('aria-pressed',String(on));});const item=journey.journey.find(j=>j.id===selectedJourney)||journey.record;root.dataset.journey=selectedJourney;window.dispatchEvent(new CustomEvent('lab:journey',{detail:selectedJourney}));window.LabRefinement?.refresh();}

 root.addEventListener('click',e=>{const nav=e.target.closest('[data-lab-nav]'),category=e.target.closest('[data-lab-category]'),stop=e.target.closest('[data-lab-journey]');if(nav)WorkshopNavigation.navigate(nav.dataset.labNav);if(category){EngineeringLab.select(category.dataset.labCategory||null);const current=EngineeringLab.getState().category;const selector=current&&innerWidth>760?'.lab-refined-sidebar [data-lab-category="'+current+'"]':'.lab-domain-grid [data-lab-category="'+(current||skills.categories[0].id)+'"]';skillsPanel.querySelector(selector)?.focus({preventScroll:true});}if(stop){EngineeringLab.selectJourney(stop.dataset.labJourney);}});
 root.addEventListener('pointerover',e=>{const c=e.target.closest('[data-lab-category]');if(c)EngineeringLab.preview(c.dataset.labCategory||null);});
 root.addEventListener('pointerleave',()=>EngineeringLab.preview(null));
 root.addEventListener('focusin',e=>{const c=e.target.closest('[data-lab-category]');if(c)EngineeringLab.preview(c.dataset.labCategory||null);});
 root.addEventListener('focusout',()=>EngineeringLab.preview(null));
 for(const panel of [skillsPanel,experiencePanel]){
  panel.addEventListener('wheel',e=>{e.stopPropagation();if(panel.scrollHeight<=panel.clientHeight+2)e.preventDefault();},{passive:false});
  panel.addEventListener('keydown',e=>{if(!['PageDown','PageUp','Home','End'].includes(e.key))return;e.preventDefault();e.stopPropagation();const top=e.key==='Home'?0:e.key==='End'?panel.scrollHeight:panel.scrollTop+(e.key==='PageUp'?-1:1)*panel.clientHeight*.8;panel.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
 }
 skillsPanel.addEventListener('keydown',e=>{const buttons=[...content.children];if(buttons.includes(e.target)&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const i=e.key==='Home'?0:e.key==='End'?buttons.length-1:(buttons.indexOf(e.target)+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[i].focus();buttons[i].click();}});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();WorkshopNavigation.navigate('lab');}});

 function projectCorners(camera,corners){const normalize=a=>{const l=Math.hypot(...a);return a.map(x=>x/l);},cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot=(a,b)=>a.reduce((t,v,i)=>t+v*b[i],0),f=normalize(camera.target.map((v,i)=>v-camera.eye[i])),right=normalize(cross(f,[0,1,0])),up=cross(right,f),q=Math.tan(camera.fov/2),height=camera.viewport?.height||innerHeight,top=camera.viewport?.top||0;
  return corners.map(world=>{const v=world.map((p,i)=>p-camera.eye[i]),z=dot(v,f);if(z<.1)return [NaN,NaN];return [innerWidth*(.5+dot(v,right)/(2*z*q*camera.aspect)),top+height*(.5-dot(v,up)/(2*z*q))];});}
 function frame(camera,corners,contentSize){if(!camera||corners.some(p=>p.some(v=>!isFinite(v))))return null;const [a,b,c,d]=corners,[W,H]=contentSize,center=[0,1].map(i=>(a[i]+b[i]+c[i]+d[i])/4),u=[0,1].map(i=>(b[i]+c[i]-a[i]-d[i])/(2*W)),v=[0,1].map(i=>(d[i]+c[i]-a[i]-b[i])/(2*H));return {matrix:[u[0],u[1],v[0],v[1],center[0]-(u[0]*W+v[0]*H)/2,center[1]-(u[1]*W+v[1]*H)/2],width:W,height:H,points:corners};}
 function skillsProjection(camera){const L=EngineeringLabLayout.screen;if(!camera)return null;const corners=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([x,y])=>EngineeringLabLayout.stationPoint([L.center[0]+x*L.size[0]*.485,L.center[1]+y*L.size[1]*.48,L.center[2]+.214]));return frame(camera,projectCorners(camera,corners),L.content);}
 function experienceProjection(camera){const A=EngineeringLabLayout.archiveScreen;if(!camera||!A)return null;const u=A.u||[0,0,1],v=A.v||[0,1,0],w=A.width/2,h=A.height/2,c=A.center,add=(p,a,s)=>p.map((x,i)=>x+a[i]*s),corners=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([x,y])=>add(add(c,u,x*w),v,y*h));return frame(camera,projectCorners(camera,corners),A.content||[1200,580]);}

 function applyFrame(panel,p){if(p){let tr='matrix('+p.matrix.map(v=>v.toFixed(6)).join(',')+')';
  // Map all four Skills screen corners, including during the camera approach.
  // Affine fitting alone drifts at oblique angles because depth is different.
  if(panel===skillsPanel){const [a,b,c,d]=p.points,dx1=b[0]-c[0],dx2=d[0]-c[0],dx3=a[0]-b[0]+c[0]-d[0],dy1=b[1]-c[1],dy2=d[1]-c[1],dy3=a[1]-b[1]+c[1]-d[1],den=dx1*dy2-dx2*dy1;
   if(Math.abs(den)>.000001){const g=(dx3*dy2-dx2*dy3)/den,h=(dx1*dy3-dx3*dy1)/den,m=[(b[0]-a[0]+g*b[0])/p.width,(b[1]-a[1]+g*b[1])/p.width,0,g/p.width,(d[0]-a[0]+h*d[0])/p.height,(d[1]-a[1]+h*d[1])/p.height,0,h/p.height,0,0,1,0,a[0],a[1],0,1];tr='matrix3d('+m.map(v=>v.toFixed(10)).join(',')+')';}}
  if(panel.style.transform!==tr)panel.style.transform=tr;panel.style.width=p.width+'px';panel.style.height=p.height+'px';}else{panel.style.removeProperty('transform');panel.style.removeProperty('width');panel.style.removeProperty('height');}}
 // Keep the room unobstructed in the workstation close-ups: site chrome fades
 // out there, and the lab controls fade with pointer idle. Any movement brings
 // both back immediately, so navigation stays available.
 let idleTimer=0;const wake=()=>{document.body.classList.add('lab-pointer-active');clearTimeout(idleTimer);idleTimer=setTimeout(()=>document.body.classList.remove('lab-pointer-active'),1200);};
 window.addEventListener('pointermove',wake,{passive:true});window.addEventListener('pointerdown',wake,{passive:true});root.addEventListener('focusin',wake);
 window.LabSkillsInterface={projectPlane(camera,L){const corners=[[-1,1],[1,1],[1,-1],[-1,-1]].map(([x,y])=>CommunicationsLayout.point([L.center[0]+x*L.size[0]/2,L.center[1]+y*L.size[1]/2,L.center[2]]));return frame(camera,projectCorners(camera,corners),[1200,448]);},refresh(){syncDomains();syncJourney();},projection:skillsProjection,experienceProjection,update({state,camera}){if(camera)lastCamera=camera;const changed=visible!==state.active||mode!==state.mode;visible=state.active;mode=state.mode;doorActive=visible&&mode==='overview';if(!doorActive)doorHint.hidden=true;root.hidden=!visible;root.inert=!visible;root.setAttribute('aria-hidden',String(!visible));document.body.classList.toggle('lab-closeup',!!visible&&(mode==='skills'||mode==='experience'));if(!visible){document.body.classList.remove('lab-pointer-active');return;}root.dataset.mode=mode;const wall=innerWidth>=1040&&innerWidth/innerHeight>=1.25&&!!camera;root.dataset.layout=wall?'wall':'reading';skillsPanel.hidden=mode!=='skills';skillsPanel.inert=mode!=='skills';experiencePanel.hidden=mode!=='experience';experiencePanel.inert=mode!=='experience';const labButton=root.querySelector('[data-lab-nav="lab"]'),expButton=root.querySelector('[data-lab-nav="experience"]'),enter=root.querySelector('.lab-enter-skills');labButton.hidden=mode==='overview';expButton.hidden=mode==='experience';enter.hidden=mode!=='overview';if(wall){if(mode==='skills')applyFrame(skillsPanel,skillsProjection(camera));if(mode==='experience')applyFrame(experiencePanel,experienceProjection(camera));}else{applyFrame(skillsPanel,null);applyFrame(experiencePanel,null);}if(changed){syncDomains();syncJourney();}else if(root.dataset.category!==(EngineeringLab.getState().category||'embedded'))syncDomains();},
  getState:()=>({visible,mode,layout:root.dataset.layout,category:EngineeringLab.getState().category,journey:EngineeringLab.getState().journey})};
 syncDomains();syncJourney();
})();
