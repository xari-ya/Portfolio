/* A local reading surface inside the shared workshop journey. No second RAF
 * or camera controller: the engine supplies animation time and rendering. */
(()=>{'use strict';
 const referenceProjects=new Set(['obsidian','analog-fsk','habitseed','click-claim','prajaa']);let modelZoom=1;
 const registry=WorkshopProjectRegistry,timeline=WorkshopStudyTimeline,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const root=document.createElement('section');root.id='projectStudy';root.className='project-study';root.hidden=true;root.inert=true;root.setAttribute('aria-labelledby','studyTitle');
 root.innerHTML=`<header class="study-toolbar"><span>03 / PROJECT STUDY <i id="studyFeatured" hidden>FEATURED</i></span><div><button type="button" data-study-nav="production">← BACK TO PROJECTS</button><button type="button" class="study-close" data-study-nav="production" aria-label="Close study and return to projects">✕</button></div></header>
 <div class="study-layout"><div class="study-copy"><div class="study-identity"><span id="studyCategory"></span><h1 id="studyTitle" tabindex="-1"></h1><span id="studyStatus"></span></div><nav class="study-tabs" aria-label="Study chapters"></nav><div class="study-reading" id="studyReading" tabindex="0" aria-label="Project chapter information"></div></div>
 <div class="study-model" id="studyModel" aria-label="Project model. Drag with a mouse to rotate. Scroll over the model to explore its animation."><nav class="study-project-nav" aria-label="Change project"><button type="button" id="studyPreviousProject" data-study-project="-1">← PREVIOUS PROJECT</button><button type="button" id="studyNextProject" data-study-project="1">NEXT PROJECT →</button></nav><img id="studyFallback" alt="Project study preview" hidden><div id="studyModelHud"></div></div></div>
 <footer class="study-footer"><div class="study-progress"><span id="studyChapterLabel">01 / THE BUILD</span><div><i id="studyProgress"></i></div></div><span id="studyScrollHint">SCROLL TO EXPLORE ↓</span><button type="button" class="study-skills-link" data-study-nav="lab">ENGINEERING TOOLBOX →</button></footer>`;
 document.body.append(root);
 const $=id=>document.getElementById(id),reading=$('studyReading'),host=$('studyModel'),parking=document.createElement('div');parking.hidden=true;parking.inert=true;document.body.append(parking);
 const originals=['obsExperience','terraExperience','jellyExperience'].map($),completed=new Set(),positions=new Map();
 let api=null,active=false,project=null,record=null,intro=0,last=0,activation=0,chapter=0,chapterProgress=0,narrative=0,pages=[],oldOverflow='',pendingFocus=null,entry=null,orbit=[0,0],drag=null,modelReady=true,error=null,openedAt=0;
 let finishedAt=0,continuationWheel=0;
 let visual=timeline.sample(null,0,0),introMotion=null,sceneMotion=null,projectMotion=null,pendingSwitch=null,projectOpacity=1,backgroundTheme=null,backgroundMotion=null;
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
 const labels=id=>timeline.chapters(id).map(c=>c.label);
 const icons=['<path d="m3 7 9-5 9 5v10l-9 5-9-5Zm0 0 9 5 9-5M12 12v10"/>','<circle cx="5" cy="5" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="10" cy="19" r="2"/><path d="m7 5 10 1M6 7l3 10m3 1 6-10"/>','<path d="m3 7 9-5 9 5-9 5Zm0 5 9 5 9-5M3 17l9 5 9-5"/>'];
 function article(title,text){const el=document.createElement('article');el.className='study-chapter';const h=document.createElement('h2'),p=document.createElement('p');h.textContent=title;p.textContent=text;el.append(h,p);return el;}
 function technologies(el){const tags=document.createElement('div');tags.className='study-technologies';for(const t of record.tags||project.technologies){const s=document.createElement('span');s.textContent=t;tags.append(s);}el.append(tags);if(record.link){const a=document.createElement('a');a.href=record.link;a.target='_blank';a.rel='noopener';a.className='study-repository';a.textContent='OPEN REPOSITORY ↗';el.append(a);}}
 function mount(){
  for(const node of originals)parking.append(node);
  const node=project.id==='obsidian'?originals[0]:project.id==='terravita'?originals[1]:project.id==='jellycast'?originals[2]:null;
  if(project.id==='jellycast'&&!node.dataset.studyMounted){
   const narrative=node.querySelector('.jelly-narrative'),stations=node.querySelector('.jelly-stations'),truth=node.querySelector('.jelly-disclaimer');
   const first=article('SOFTWARE FOR A CHANGING COAST.',record.description),second=article('ONE COAST. THREE STATIONS.','');second.querySelector('h2').remove();second.querySelector('p').remove();second.append(narrative,stations);
   const third=article('RESEARCH IN PROGRESS.',record.contribution);technologies(third);third.append(truth);node.replaceChildren(first,second,third);node.dataset.studyMounted='true';
  }
  if(node){reading.replaceChildren(node);pages=[...node.querySelectorAll('.obs-scene,.terra-scene,.study-chapter')];pages.forEach(n=>n.classList.add('study-chapter'));}
  else{const first=article('THE SYSTEM.',record.description),second=article('WHAT I BUILT.',record.contribution||project.description),third=article('TOOLS & TECHNOLOGIES.','The technologies used in this project.');technologies(third);const note=document.createElement('small');note.className='study-truth';note.textContent=record.disclaimer||'Conceptual visualization of the project; not manufacturing CAD.';third.append(note);pages=[first,second,third];reading.replaceChildren(...pages);}
  if(node){const truth=node.querySelector('.obs-truth,.terra-safety');if(truth){truth.classList.add('study-truth');pages.at(-1).append(truth);}if(record.disclaimer&&!node.querySelector('.study-record-disclaimer')){const note=document.createElement('small');note.className='study-truth study-record-disclaimer';note.textContent=record.disclaimer;pages.at(-1).append(note);}}
  // The existing miniature map belongs beside the large model, not over copy.
  const map=$('obsMapHud');if(map)$('studyModelHud').append(map);
  pages=window.ReferenceShowcase?.mount(project.id,pages,record)||pages;
  host.setAttribute('aria-label',referenceProjects.has(project.id)?'Interactive 3D model. Drag to rotate. Pinch or use the zoom buttons to inspect. The Obsidian micromouse runs automatically; use its pause and restart controls.':'Project model. Drag with a mouse to rotate. Scroll over the model to explore its animation.');
  root.querySelectorAll('[data-exhibit-step]').forEach(b=>b.remove());
  // Each chapter is a complete page; text never scrolls inside a small pane.
  for(const page of pages)for(const br of page.querySelectorAll('h2 br'))br.replaceWith(document.createTextNode(' '));
  const list=registry.list(),index=list.findIndex(p=>p.id===project.id);for(const [id,step]of [['studyPreviousProject',-1],['studyNextProject',1]]){const b=$(id),next=list[(index+step+list.length)%list.length];b.disabled=index<0||list.length<2;b.title=next?.name||'';b.setAttribute('aria-label',(step<0?'Previous project: ':'Next project: ')+(next?.name||''));}
  root.querySelector('.study-tabs').replaceChildren(...labels(project.id).map((label,i)=>{const b=document.createElement('button');b.type='button';b.dataset.studyChapter=i;b.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">'+icons[i]+'</svg><span>'+String(i+1).padStart(2,'0')+' '+label+'</span>';return b;}));
 }
 function showChapter(){root.dataset.exhibitState=chapter;pages.forEach((page,i)=>{page.hidden=i!==chapter;page.setAttribute('aria-hidden',String(i!==chapter));});}
 function setReadingState(value,immediate=false){const oldChapter=chapter,travel=Math.max(0,Math.min(3,Number(value)||0));chapter=Math.min(2,Math.floor(travel));chapterProgress=travel-chapter;narrative=travel/3;if(travel<3){finishedAt=0;continuationWheel=0;}else if(!finishedAt)finishedAt=performance.now();showChapter();
  const target=timeline.sample(project?.id,chapter,chapterProgress);
  if(immediate||reduced){visual=target;sceneMotion=null;}else{const previous=sceneMotion?.to||visual;if(previous.legacyProgress!==target.legacyProgress||previous.chapter!==target.chapter)sceneMotion={from:{...visual,weights:visual.weights.slice()},to:target,elapsed:0,duration:oldChapter===chapter ? .16 : .44};}
 }
 function skipIntro(){intro=1;introMotion=null;}
 function finishIntroSmoothly(){if(reduced){skipIntro();return;}if(intro<1&&!introMotion)introMotion={from:intro,elapsed:0,duration:.44};}
 function advanceIntro(dt){if(introMotion){introMotion.elapsed+=dt;intro=introMotion.from+(1-introMotion.from)*ease(introMotion.elapsed/introMotion.duration);if(introMotion.elapsed>=introMotion.duration){intro=1;introMotion=null;}}else intro=clamp(intro+dt/(entry?.carrierId ? .85 : 1.4));}
 function selectChapter(i){finishIntroSmoothly();setReadingState(Math.max(0,Math.min(2,i)));root.querySelector('.study-layout').scrollTop=0;}
 function advanceReading(delta){finishIntroSmoothly();setReadingState(narrative*3+delta/Math.max(540,innerHeight*.75));}
 function changeProject(step){if(!active)return false;const list=registry.list(),index=list.findIndex(p=>p.id===(pendingSwitch?.id||project.id));if(index<0||list.length<2)return false;return study.open(list[(index+(step<0?-1:1)+list.length)%list.length].id,{resume:false,featured:false});}
 function activate(id,options={}){
  const next=registry.get(id);if(!next||next.discoverable===false)return false;
  if(!active||reduced)return mountProject(id,options);
  if(next.id===project.id){if(pendingSwitch){pendingSwitch=null;projectMotion={phase:'in',elapsed:0,from:projectOpacity};}return true;}
  pendingSwitch={id,options};if(projectMotion?.phase!=='out')projectMotion={phase:'out',elapsed:0,from:projectOpacity};
  // Prepare the existing asset during departure; its normal load/error handling
  // remains in mountProject, and cannot replace the visible model prematurely.
  if(Number.isInteger(next.legacyIndex))Promise.resolve().then(()=>api?.prepare(next.legacyIndex)).catch(()=>{});
  return true;
 }
 function updateMotion(dt){
  if(sceneMotion){sceneMotion.elapsed+=dt;visual=timeline.blend(project.id,sceneMotion.from,sceneMotion.to,sceneMotion.elapsed/sceneMotion.duration);if(sceneMotion.elapsed>=sceneMotion.duration)sceneMotion=null;}
  if(projectMotion){const m=projectMotion;if(m.phase==='out'){
   m.elapsed+=dt;projectOpacity=m.from*(1-ease(m.elapsed/.18));
   if(m.elapsed>=.18){const queued=pendingSwitch;pendingSwitch=null;projectMotion=null;if(queued)mountProject(queued.id,{...queued.options,handoff:true});projectOpacity=0;projectMotion={phase:'in',elapsed:0,from:0};}
  }else if(modelReady||error||document.body.classList.contains('has-no-webgl')){m.elapsed+=dt;projectOpacity=m.from+(1-m.from)*ease(m.elapsed/.26);if(m.elapsed>=.26){projectOpacity=1;projectMotion=null;}}}
  if(backgroundMotion){const b=backgroundMotion;b.elapsed+=dt;const u=ease(b.elapsed/.4);backgroundTheme={rgb:b.to.rgb.map((v,i)=>b.from.rgb[i]+(v-b.from.rgb[i])*u),tintStrength:(b.from.tintStrength??.24)+((b.to.tintStrength??.24)-(b.from.tintStrength??.24))*u};if(b.elapsed>=.4){backgroundTheme=b.to;backgroundMotion=null;}}
  host.style.setProperty('--study-model-opacity',String(visual.opacity*projectOpacity));
 }
 function mountProject(id,{carrierId=null,featured=false,resume=undefined,handoff=false}={}){
  const next=registry.get(id);if(!next||next.discoverable===false)return false;
  if(active&&next.id===project?.id)return true;
  if(active){positions.set(project.id,narrative*3);document.body.style.overflow=oldOverflow;}
  const previousBackground=backgroundTheme||project?.theme||next.theme;
  const token=++activation;pendingFocus=null;introMotion=null;sceneMotion=null;projectMotion=null;pendingSwitch=null;projectOpacity=1;
  const restoring=resume??(!carrierId&&positions.has(id));if(Number.isInteger(next.legacyIndex))api?.select(next.legacyIndex);
  project=next;record=Number.isInteger(next.legacyIndex)?(api?.record(next.legacyIndex)||next):next;active=true;intro=reduced||(!handoff&&restoring)?1:0;chapter=0;chapterProgress=0;narrative=0;last=performance.now();orbit=[0,0];modelZoom=1;entry={carrierId,featured};error=null;modelReady=Number.isInteger(next.legacyIndex)&&!['terravita','obsidian','prajaa','habitseed','click-claim'].includes(next.id);
  backgroundTheme=handoff?previousBackground:next.theme;backgroundMotion=handoff?{from:previousBackground,to:next.theme,elapsed:0}:null;
  openedAt=performance.now()-(handoff?400:0);oldOverflow=document.body.style.overflow;document.body.style.overflow='hidden';document.body.classList.add('project-study-active');
  for(const [key,value]of Object.entries({'--study-colour':next.theme.colour,'--study-accent':next.theme.accent}))root.style.setProperty(key,value);
  root.dataset.project=id;document.body.dataset.studyProject=id;$('studyTitle').textContent=next.name;$('studyCategory').textContent=next.category;$('studyStatus').textContent=next.status||'Engineering study';$('studyFeatured').hidden=!featured;
  mount();setReadingState(restoring?(positions.get(id)||0):0,true);root.hidden=false;root.inert=false;root.setAttribute('aria-hidden','false');$('studyFallback').src=next.preview;$('studyFallback').hidden=!document.body.classList.contains('has-no-webgl');
  Promise.resolve().then(()=>Number.isInteger(next.legacyIndex)?api?.prepare(next.legacyIndex):false).then(ok=>{if(active&&activation===token){modelReady=ok!==false;if(!modelReady){error='Model unavailable — existing preview shown';skipIntro();$('studyFallback').hidden=false;}}}).catch(()=>{if(active&&activation===token){modelReady=false;skipIntro();error='Model unavailable — existing preview shown';$('studyFallback').hidden=false;}});
  requestAnimationFrame(()=>{if(!active||activation!==token)return;root.querySelector('.study-layout').scrollTop=0;root.classList.add('is-open');$('studyTitle').focus({preventScroll:true});});return true;
 }
 function deactivate(destination){if(!active)return;if(destination==='production'&&referenceProjects.has(project.id))window.ProductionDiscovery?.setPreview(project.id);positions.set(project.id,narrative*3);active=false;activation++;introMotion=sceneMotion=projectMotion=pendingSwitch=backgroundMotion=null;projectOpacity=1;root.hidden=true;root.inert=true;root.setAttribute('aria-hidden','true');root.classList.remove('is-open');delete document.body.dataset.studyProject;document.body.classList.remove('project-study-active','obs-exploring','terra-exploring','jelly-exploring');document.body.style.overflow=oldOverflow;pendingFocus=destination==='production'?'productionSelect':null;drag=null;}
 function frame(){const scene=timeline.sample(project?.id,chapter,chapterProgress);
  return {active,project,legacyIndex:project?.legacyIndex,reveal:reduced?1:clamp((performance.now()-openedAt)/400),intro:ease(intro),phase:intro<1?'assembling':'exploring',chapter,chapterProgress,narrative,scene:scene.scene,chapterWeights:scene.weights,legacyProgress:scene.legacyProgress,visual:{...visual,opacity:visual.opacity*projectOpacity,transitioning:!!(introMotion||sceneMotion||projectMotion)},pendingProjectId:pendingSwitch?.id||null,backgroundTheme,zoom:modelZoom,orbit:orbit.slice(),viewport:host.getBoundingClientRect(),ready:modelReady,error,entry};}
 const study=window.ProjectStudy={get active(){return active;},bind(value){api=value;},activate,deactivate,open(id,options={}){return window.WorkshopNavigation?.navigate('study',{projectId:id,...options});},close(destination='production'){window.WorkshopNavigation?.navigate(destination);},skipIntro,selectChapter,changeProject,advanceReading,frame,setModelZoom(value){if(referenceProjects.has(project?.id))modelZoom=Math.max(.75,Math.min(1.8,Number(value)||1));},resetModelView(){modelZoom=1;orbit=[0,0];},
  prepare(id){const next=registry.get(id);return Promise.resolve().then(()=>Number.isInteger(next?.legacyIndex)?api?.prepare(next.legacyIndex):false);},
  fromCompletion(s){const id=s.job?.id,key=s.job?.carrierId;if(!id||!key||completed.has(key)||active||!s.completed||s.rotation<Math.PI*4-1e-5)return;completed.add(key);study.open(id,{carrierId:key});},
  update(ms){if(!active){api?.updateMaze?.(0,false,false);if(pendingFocus){const el=$(pendingFocus);if(el?.offsetParent){el.focus({preventScroll:true});pendingFocus=null;}}return;}const dt=Math.max(0,Math.min(.1,(ms-last)/1000));last=ms;if(!document.hidden)updateMotion(dt);api?.updateMaze?.(dt,project.id==='obsidian'&&(chapter===1||visual.weights[1]>.01),!document.hidden&&modelReady&&intro===1&&!sceneMotion&&!projectMotion);if(!document.hidden&&modelReady)advanceIntro(dt);$('studyScrollHint').textContent=error||(!modelReady?'PREPARING EXISTING MODEL…':intro<1?'THE SYSTEM TAKES SHAPE':project.id==='obsidian'&&chapter===1?'AUTOMATIC MAZE / DRAG TO ORBIT':narrative===1?'CONTINUE TO THE ENGINEERING LAB ↓':'SCROLL TO EXPLORE ↓');$('studyChapterLabel').textContent=String(chapter+1).padStart(2,'0')+' / '+labels(project.id)[chapter];$('studyProgress').style.width=(narrative*100)+'%';root.querySelectorAll('[data-study-chapter]').forEach((b,i)=>b.setAttribute('aria-current',i===chapter?'step':'false'));},
  getState(){return {...frame(),viewport:active?{x:host.offsetLeft,y:host.offsetTop,width:host.clientWidth,height:host.clientHeight}:null,completedCarriers:completed.size};}
 };
 // The body also has data-study-project for the current theme; only buttons navigate.
 root.addEventListener('click',e=>{const run=e.target.closest('[data-obs-auto]');if(run&&project.id==='obsidian')api?.mazeControl?.(run.dataset.obsAuto);const projectButton=e.target.closest('button[data-study-project]');if(projectButton)changeProject(+projectButton.dataset.studyProject);const go=e.target.closest('[data-study-nav]'),tab=e.target.closest('[data-study-chapter]');if(go)study.close(go.dataset.studyNav);if(tab)selectChapter(+tab.dataset.studyChapter);});
 $('studyFallback').addEventListener('error',()=>{if($('studyFallback').src!==registry.fallback)$('studyFallback').src=registry.fallback;});
 const narrow=()=>matchMedia('(max-width:1039px)').matches;
 root.addEventListener('wheel',e=>{if(e.ctrlKey)return;e.stopPropagation();const layout=root.querySelector('.study-layout');
  // Small screens and enlarged text use normal whole-page reading, never an
  // independently scrolling paragraph. Model scrolling still scrubs animation.
  if(e.target.closest('.study-copy')&&(narrow()||layout.scrollHeight>layout.clientHeight+2))return;
  e.preventDefault();const delta=e.deltaY+(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:0);if(narrative===1&&intro===1&&!sceneMotion&&delta>0&&performance.now()-finishedAt>700){continuationWheel+=delta;if(continuationWheel>180){study.close('lab');return;}}else continuationWheel=0;advanceReading(delta);
 },{passive:false});
 let touchY=0,touchX=0,pinchDistance=0,touchGesture=false,landscapeGesture='';
 root.addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY||0;touchX=e.touches[0]?.clientX||0;touchGesture=false;landscapeGesture='';pinchDistance=e.touches.length===2?Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY):0;},{passive:true});
 root.addEventListener('touchmove',e=>{e.stopPropagation();if(!e.target.closest('.study-model')||e.target.closest('button'))return;const x=e.touches[0]?.clientX||touchX,y=e.touches[0]?.clientY||touchY;if(referenceProjects.has(project?.id)&&narrow()&&innerHeight<=550&&e.touches.length===1&&!touchGesture){if(!landscapeGesture)landscapeGesture=Math.abs(y-touchY)>Math.abs(x-touchX)*1.2?'scroll':'orbit';if(landscapeGesture==='scroll'){touchX=x;touchY=y;return;}}e.preventDefault();if(referenceProjects.has(project?.id)){if(e.touches.length===2){const distance=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinchDistance>0)study.setModelZoom(modelZoom*distance/pinchDistance);pinchDistance=distance;touchGesture=true;}else if(!touchGesture){orbit[0]+=(x-touchX)*.006;orbit[1]=Math.max(-.55,Math.min(.55,orbit[1]+(y-touchY)*.004));}}else advanceReading(touchY-y);touchX=x;touchY=y;},{passive:false});
 root.addEventListener('touchend',e=>{if(!e.touches.length){pinchDistance=0;touchGesture=false;}},{passive:true});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();study.close();}if(e.target.closest('input,textarea,button,a'))return;
  const layout=root.querySelector('.study-layout');if(e.target.closest('.study-copy')&&layout.scrollHeight>layout.clientHeight+2){e.stopPropagation();return;}
  if(['PageDown','PageUp','ArrowDown','ArrowUp','Home','End',' '].includes(e.key)){e.preventDefault();e.stopPropagation();finishIntroSmoothly();if(e.key==='Home')setReadingState(0);else if(e.key==='End')setReadingState(3);else if(['PageDown','PageUp',' '].includes(e.key))selectChapter(chapter+(e.key==='PageUp'?-1:1));else advanceReading(e.key==='ArrowUp'?-90:90);}
 });
 // A mouse drag can leave focus on body rather than inside the reading surface.
 // Escape still belongs to the active study, before the hall's own shortcuts.
 document.addEventListener('keydown',e=>{if(active&&e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();study.close();}},true);
 host.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.target.closest('button'))return;if(referenceProjects.has(project?.id))e.preventDefault();drag=[e.clientX,e.clientY];host.setPointerCapture(e.pointerId);});host.addEventListener('pointermove',e=>{if(!drag)return;orbit[0]+=(e.clientX-drag[0])*.006;orbit[1]=Math.max(-.55,Math.min(.55,orbit[1]+(e.clientY-drag[1])*.004));drag=[e.clientX,e.clientY];});for(const name of ['pointerup','pointercancel','lostpointercapture'])host.addEventListener(name,()=>drag=null);
 window.addEventListener('portfolio:render-fallback',()=>{if(active){modelReady=false;skipIntro();error='3D unavailable — existing preview shown';$('studyFallback').hidden=false;}});
})();
