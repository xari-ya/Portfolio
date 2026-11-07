/* Phone-only instruments for the existing physical desks. The hall retains
 * camera interpolation, picking, world geometry and its single render loop. */
(()=>{'use strict';
 const phone=matchMedia('(max-width:760px), (max-width:1023px) and (max-height:500px)'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const root=document.createElement('section');root.id='labPhone';root.hidden=true;root.inert=true;root.setAttribute('aria-label','Engineering and Career Lab');
 const categories=EngineeringSkillsData.categories,records=LabRefinement.records,positions={leadership:0,experience:0,achievements:0};
 const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icon=id=>document.querySelector(`[data-lab-category="${id}"] svg`)?.outerHTML||'';
 root.innerHTML=`<header class="lab-phone-heading"><span>04 / ENGINEERING &amp; CAREER LAB</span><button type="button" data-phone-nav="lab" aria-label="View both workstations">ROOM VIEW ↗</button></header>
 <div class="lab-phone-look" tabindex="0" role="region" aria-label="Room view. Drag or use arrow keys to look between the workstations. Press Home to reset."><span aria-hidden="true">&harr; DRAG TO LOOK</span><button type="button" data-phone-look-reset aria-label="Reset room view" hidden>RESET VIEW &#8634;</button></div>
 <div class="lab-phone-instrument">
  <div class="lab-phone-intro"><span class="lab-phone-eyebrow">TWO DESKS. ONE ENGINEERING JOURNEY.</span><h1>THE TOOLS.<br>THE <em>EXPERIENCE.</em></h1><p>Explore the workbench on the left, or the engineering archives on the right.</p></div>
  <nav class="lab-phone-desks" aria-label="Choose a workstation"><button type="button" data-phone-nav="skills"><span>01 / SKILLS</span><strong>SKILLS DESK <i>↗</i></strong></button><button type="button" data-phone-nav="experience"><span>02 / JOURNEY</span><strong>EXPERIENCE DESK <i>↗</i></strong></button></nav>
  <section class="lab-phone-skills" aria-label="Technical skills"><nav class="lab-phone-domains" aria-label="Engineering domains">${categories.map(c=>`<button type="button" data-phone-category="${c.id}" aria-label="${c.name}" aria-pressed="false">${icon(c.id)}<span>${escape(c.name)}</span></button>`).join('')}</nav><div class="lab-phone-reading" tabindex="0" aria-label="Selected domain information"><div id="labPhoneDomain"></div></div><details class="lab-phone-capabilities"><summary>CAPABILITIES &amp; WORKFLOW</summary><div id="labPhoneCapabilities"></div></details></section>
  <section class="lab-phone-archives" aria-label="Engineering archives"><nav class="lab-phone-sections" aria-label="Archive sections">${EngineeringExperienceData.journey.map(j=>`<button type="button" data-phone-journey="${j.id}" aria-pressed="false">${j.name}</button>`).join('')}</nav><div class="lab-phone-reading" tabindex="0" aria-label="Selected archive record"><article id="labPhoneRecord" aria-live="polite"></article></div><nav class="lab-phone-record-nav" aria-label="Browse archive records"><button type="button" data-phone-record="-1" aria-label="Previous archive record">← PREVIOUS</button><span id="labPhoneCount" role="status"></span><button type="button" data-phone-record="1" aria-label="Next archive record">NEXT →</button></nav></section>
  <footer class="lab-phone-footer"><button type="button" data-phone-nav="production">← BACK TO PROJECTS</button><button type="button" data-phone-nav="communications">CONTACT →</button></footer>
 </div>`;
 document.body.append(root);
 let key='',mode='overview',visible=false,gesture=null,lookDrag=null,lookYaw=0,lookPitch=0,lookLayout='';
 const lookSurface=root.querySelector('.lab-phone-look'),lookReset=root.querySelector('[data-phone-look-reset]'),scene=document.getElementById('stage');
 const views={lab:{yaw:0,pitch:.025,dist:7.4,target:[0,1.70,-24]},skills:{yaw:.22,pitch:.115,dist:7.7,target:[-4.4,2.02,-22.5]},experience:{yaw:-.22,pitch:.10,dist:7.7,target:[4.4,2.10,-22.5]}};
 let safeTop=0;const measureSafeArea=()=>{safeTop=parseFloat(getComputedStyle(root).getPropertyValue('--lab-safe-top'))||0;};measureSafeArea();window.addEventListener('resize',measureSafeArea,{passive:true});
 function viewport(){const landscape=innerWidth>innerHeight,top=(landscape?126:120)+safeTop,overview=EngineeringLab.getState().mode==='overview',fraction=overview?(innerHeight<=650?.47:.56):(innerHeight<=650?.46:.53);return landscape?{top,height:Math.max(80,innerHeight-top-16),width:innerWidth*.48}:{top,height:Math.max(80,Math.round(innerHeight*fraction)-top)};}
 function render(state){
  if(mode!==state.mode)resetLook();mode=state.mode;root.dataset.mode=mode;
  const category=EngineeringSkillsData.get(state.category)||categories[0],journey=state.journey||'achievements';
  root.querySelector('.lab-phone-intro').hidden=mode!=='overview';root.querySelector('.lab-phone-skills').hidden=mode!=='skills';root.querySelector('.lab-phone-archives').hidden=mode!=='experience';root.querySelector('[data-phone-nav="lab"]').hidden=mode==='overview';
  for(const button of root.querySelectorAll('[data-phone-nav]'))button.setAttribute('aria-pressed',String(button.dataset.phoneNav===mode));
  root.querySelectorAll('[data-phone-category]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.phoneCategory===category.id)));
  root.querySelectorAll('[data-phone-journey]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.phoneJourney===journey)));
  root.querySelector('#labPhoneDomain').innerHTML=`<span class="lab-phone-eyebrow">01 / SKILLS WORKBENCH</span><h2>${escape(category.name)}</h2><p>${escape(category.description)}</p><div class="lab-phone-tools">${category.tools.map(t=>`<span>${escape(t)}</span>`).join('')}</div>`;
  root.querySelector('#labPhoneDomain').insertAdjacentHTML('beforeend',`<img class="lab-phone-technical" src="${LabRefinement.art(category.id)}" alt="${escape(category.name)} technical visualization">`);
  const projects=category.evidence.map(source=>source.startsWith('project-registry.js#')?WorkshopProjectRegistry.get(source.split('#')[1]):null).filter(p=>p&&p.discoverable!==false);
  root.querySelector('#labPhoneCapabilities').innerHTML=`<ul>${category.capabilities.map(c=>`<li>${escape(c)}</li>`).join('')}</ul><dl>${category.stages.map(id=>{const step=EngineeringSkillsData.workflow.find(w=>w.id===id);return `<dt>${escape(step.name)}</dt><dd>${escape(step.description)}</dd>`;}).join('')}</dl><p>USED IN</p><div class="lab-phone-evidence">${projects.map(p=>`<button type="button" data-phone-project="${escape(p.id)}">${escape(p.name)} ↗</button>`).join('')}</div>`;
  const list=records[journey],index=Math.min(positions[journey],list.length-1),record=list[index];
  root.querySelector('#labPhoneRecord').innerHTML=`<span class="lab-phone-eyebrow">02 / ${escape(LabArchiveDisplay.sections[journey].label.toUpperCase())}</span><div class="lab-phone-record-title">${LabArchiveDisplay.icon(LabArchiveDisplay.sections[journey].symbols[index])}<h2>${escape(record[0])}</h2></div><p>${escape(record[1])}</p><div class="lab-phone-record-meta"><span>${escape(record[2])}</span>${record[3]?`<span>${escape(record[3])}</span>`:''}</div>`;
  root.querySelector('#labPhoneCount').textContent=`${String(index+1).padStart(2,'0')} / ${String(list.length).padStart(2,'0')}`;
 }
 function update(state){const on=phone.matches&&state.active&&(innerWidth<=760||state.mode==='skills');if(visible!==on){root.hidden=!on;root.inert=!on;document.body.classList.toggle('lab-phone-active',on);}if(!on){if(visible)resetLook();visible=false;return;}layoutLook();if(state.mode==='skills'&&!state.category){EngineeringLab.select(categories[0].id);state=EngineeringLab.getState();}const next=[state.mode,state.category,state.journey,positions[state.journey],LabArchiveDisplay.getState().sourceSymbols].join('|');if(!visible||key!==next){render(state);key=next;}visible=true;}
 // Turn the view from its existing camera position; the bounds reveal the
 // two workstations without allowing a full turn or a trip around the room.
 function setLook(yaw,pitch){lookYaw=Math.max(-.4,Math.min(.4,yaw));lookPitch=Math.max(-.12,Math.min(.12,pitch));lookReset.hidden=Math.abs(lookYaw)+Math.abs(lookPitch)<.001;}
 function finishLook(){const id=lookDrag?.id;lookDrag=null;scene.classList.remove('lab-looking');if(id!==undefined&&scene.hasPointerCapture(id))scene.releasePointerCapture(id);}
 function resetLook(){finishLook();setLook(0,0);}
 function layoutLook(){const v=viewport(),next=[v.top,v.height,v.width||innerWidth].join('|');if(next===lookLayout)return;lookLayout=next;Object.assign(lookSurface.style,{top:v.top+'px',height:v.height+'px',width:(v.width||innerWidth)+'px'});}
 scene.addEventListener('pointerdown',e=>{
  if(!visible||!phone.matches||e.button>0)return;
  if(!e.isPrimary){finishLook();return;}
  const v=viewport();if(e.clientY<v.top||e.clientY>v.top+v.height||e.clientX>(v.width||innerWidth))return;
  lookDrag={id:e.pointerId,x:e.clientX,y:e.clientY};scene.setPointerCapture(e.pointerId);scene.classList.add('lab-looking');
 });
 scene.addEventListener('pointermove',e=>{if(!lookDrag||e.pointerId!==lookDrag.id)return;setLook(lookYaw+(e.clientX-lookDrag.x)*.003,lookPitch-(e.clientY-lookDrag.y)*.002);lookDrag.x=e.clientX;lookDrag.y=e.clientY;});
 for(const name of ['pointerup','pointercancel','lostpointercapture'])scene.addEventListener(name,e=>{if(e.pointerId===lookDrag?.id)finishLook();});
 scene.addEventListener('touchmove',e=>{if(!visible||!lookDrag)return;e.stopPropagation();if(e.touches.length===1)e.preventDefault();},{passive:false});
 lookSurface.addEventListener('keydown',e=>{const step=.06;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();e.stopPropagation();if(e.key==='Home')resetLook();else setLook(lookYaw+(e.key==='ArrowLeft'?step:e.key==='ArrowRight'?-step:0),lookPitch+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0));});
 function recordStep(step){window.__labScene?.reactKira('record');const s=EngineeringLab.getState(),list=records[s.journey];positions[s.journey]=(positions[s.journey]+step+list.length)%list.length;update(s);root.querySelector('.lab-phone-archives .lab-phone-reading').scrollTop=0;}
 root.addEventListener('click',e=>{if(e.target.closest('[data-phone-look-reset]')){resetLook();return;}const nav=e.target.closest('[data-phone-nav]'),category=e.target.closest('[data-phone-category]'),journey=e.target.closest('[data-phone-journey]'),record=e.target.closest('[data-phone-record]'),project=e.target.closest('[data-phone-project]');if(nav)WorkshopNavigation.navigate(nav.dataset.phoneNav);if(category){EngineeringLab.select(category.dataset.phoneCategory);root.querySelector('.lab-phone-skills .lab-phone-reading').scrollTop=0;root.querySelector('details').open=false;}if(journey)EngineeringLab.selectJourney(journey.dataset.phoneJourney);if(record)recordStep(+record.dataset.phoneRecord);if(project)ProjectStudy.open(project.dataset.phoneProject,{resume:false});update(EngineeringLab.getState());});
 // Gestures belong to the instrument. Native vertical scrolling and pinch zoom
 // remain available; neither chains into the document's camera journey.
 root.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});
 let touchY=0;root.addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY||0;},{passive:true});
 root.addEventListener('touchmove',e=>{e.stopPropagation();if(e.touches.length!==1)return;const y=e.touches[0].clientY,dy=y-touchY;touchY=y;const scroller=e.target.closest('.lab-phone-reading,.lab-phone-intro,.lab-phone-capabilities[open]');if(!scroller||scroller.scrollHeight<=scroller.clientHeight+1||dy>0&&scroller.scrollTop<=0||dy<0&&scroller.scrollTop+scroller.clientHeight>=scroller.scrollHeight-1)e.preventDefault();},{passive:false});
 root.addEventListener('pointerdown',e=>{if(!e.isPrimary||e.target.closest('button,summary,details')||e.pointerType==='mouse')return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY};});
 root.addEventListener('pointerup',e=>{const start=gesture;gesture=null;if(!start||start.id!==e.pointerId||mode!=='experience')return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4)recordStep(dx<0?1:-1);});
 for(const name of ['pointercancel','lostpointercapture'])root.addEventListener(name,()=>{gesture=null;});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();WorkshopNavigation.navigate(mode==='overview'?'overview':'lab');return;}const button=e.target.closest('[data-phone-category],[data-phone-journey]');if(button&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();e.stopPropagation();const buttons=[...button.parentElement.children],index=e.key==='Home'?0:e.key==='End'?buttons.length-1:(buttons.indexOf(button)+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[index].focus({preventScroll:true});buttons[index].click();}else if(['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(e.key))e.stopPropagation();});
 window.addEventListener('workshop:navigate',resetLook);
 phone.addEventListener('change',()=>{resetLook();gesture=null;key='';update(EngineeringLab.getState());});
 window.LabPhone={get active(){return phone.matches&&(innerWidth<=760||EngineeringLab.getState().mode==='skills');},views,viewport,update,getLook:()=>({yaw:lookYaw,pitch:lookPitch,dragging:!!lookDrag}),getState:()=>({visible,mode,positions:{...positions},look:{yaw:lookYaw,pitch:lookPitch},reducedMotion:reduced.matches})};
})();
