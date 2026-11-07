/* One semantic discovery interface, driven by the existing journey and factory.
 * No render loop, independent camera tween, or scene-scroll controller. */
(()=>{'use strict';
 const phonePresentation=matchMedia('(max-width:760px)');
 const registry=WorkshopProjectRegistry,reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const panel=document.createElement('section');panel.id='projectDiscovery';panel.className='project-discovery';panel.hidden=true;panel.inert=true;panel.setAttribute('aria-label','Production line project discovery');
 panel.innerHTML=`<header class="production-heading"><button type="button" id="productionExit" data-production-nav="overview" aria-label="Exit project discovery and return to workshop">EXIT ↗</button><span class="production-kicker">02 / PROJECT DISCOVERY</span><h2>WHAT I'VE<br>BEEN <em>BUILDING.</em></h2><p>Systems, prototypes, and ideas across robotics, embedded engineering, automation, and intelligent software.</p></header>
 <div id="productionShowcase" class="production-showcase" role="region" aria-roledescription="carousel" aria-label="Project previews on the workshop conveyor" tabindex="0"></div>
 <div class="production-information"><div class="production-browser"><div class="production-browser-label"><span>AVAILABLE PROJECTS</span><span id="productionCount"></span></div><div class="production-arrows" role="group" aria-label="Browse projects"><button type="button" data-project-step="-1" aria-label="Previous project">←</button><span>SCROLL OR USE ARROWS</span><button type="button" data-project-step="1" aria-label="Next project">→</button></div>
 <div id="productionProjects" class="production-projects" role="list" aria-label="Available projects"></div>
 <article id="productionPreview" class="production-preview" aria-label="Project preview"><div class="production-image"><img id="productionImage" alt="" width="480" height="300"><span id="productionPreviewType">EXISTING MODEL STUDY</span></div><div class="production-preview-copy"><span id="productionCategory"></span><h3 id="productionName"></h3><p id="productionDescription"></p><div id="productionTechnologies" class="production-technologies"></div><small id="productionDevelopment"></small><div class="production-position"><span id="productionPositionLabel"></span><div id="productionProgress" class="production-progress" role="progressbar" aria-label="Project position" aria-valuemin="1"><i id="productionProgressFill"></i></div></div></div></article></div>
 <footer class="production-footer"><button type="button" class="production-primary" id="productionSelect">SELECT PROJECT ↗</button><div class="production-navigation"><button type="button" data-production-nav="about">← THE ENGINEER</button><button type="button" data-production-nav="assembly" aria-label="Continue to assembly; featured preview if no project is selected">ASSEMBLY ↗</button><button type="button" data-production-nav="lab">SKILLS LAB ↗</button></div></footer></div>`;
 document.body.append(panel);
 const transport=document.createElement('aside');transport.className='production-transport';transport.hidden=true;transport.setAttribute('aria-label','Project delivery');transport.innerHTML=`<span class="production-kicker">PROJECT DELIVERY / LIVE SIMULATION</span><h2 id="productionDeliveryName"></h2><p id="productionDeliveryStatus" role="status" aria-live="polite"></p><div class="production-milestones" aria-hidden="true"><span>PREPARE</span><span>IDENTIFY</span><span>TRANSFER</span><span>READY</span></div><button type="button" class="production-skip" id="productionSkip">SKIP ANIMATION ↗</button><button type="button" class="production-primary" id="productionInspect" hidden>INSPECT PROJECT ↗</button><button type="button" class="production-change" id="productionChange">← SELECT ANOTHER PROJECT</button>`;document.body.append(transport);
 const armActions=document.createElement('div');armActions.className='production-arm-actions';armActions.hidden=true;armActions.innerHTML='<button type="button" class="production-skip" id="productionAssemblySkip">SKIP ANIMATION ↗</button>';document.body.append(armActions);
 const $=id=>document.getElementById(id),nav=name=>window.WorkshopNavigation?.navigate(name);
 let context='outside',selectionPending=false,internalNavigation=false,cameraArrived=false;
 let readyAt=0;let factory=null,fallback=false,active=false,previewId=registry.featuredId,revision=-1,lastState='',delivery=false,deliveryOpenedAt=0,lastProgress=0,entrySerial=0,previewIndex=0,lastHandoffKey='',returnToBrowse=false;
 const statusNames={browsing:'LINE STANDBY / CHOOSE A PROJECT',idle:'SYSTEM READY',queued:'JOB REGISTERED',clearing:'CLEARING THE LINE',prepared:'CARRIER PREPARED',transport:'CARRIER IN TRANSIT',detected:'PROJECT IDENTIFIED',confirmed:'POSITION CONFIRMED',transfer:'TRANSFER IN PROGRESS',ready:'READY FOR PRESENTATION',presenting:'ASSEMBLY / INSPECTION',complete:'ASSEMBLY COMPLETE'};
 function ensureFactory(){if(!factory){factory=new WorkshopProjectDelivery.Factory({paused:true});factory.started=true;fallback=true;}return factory;}
 function updateProjectPosition(project){const count=registry.list().length,index=previewIndex+1,label=String(index).padStart(2,'0')+' / '+String(count).padStart(2,'0'),progress=$('productionProgress');$('productionPositionLabel').textContent=label;$('productionProgressFill').style.width=(index/count*100)+'%';progress.max=count;progress.value=index;progress.setAttribute('aria-valuemax',String(count));progress.setAttribute('aria-valuenow',String(index));progress.setAttribute('aria-valuetext','Project '+index+' of '+count);$('productionShowcase').setAttribute('aria-label','Project previews on the workshop conveyor. '+project.name+', '+index+' of '+count+'. Swipe horizontally to browse.');}
 function setPreview(id,{focus=false}={}){const project=registry.get(id);if(!project)return;previewId=id;previewIndex=registry.list().findIndex(p=>p.id===id);$('productionName').textContent=project.name;$('productionCategory').textContent=project.category;$('productionDescription').textContent=project.description;$('productionDevelopment').textContent=project.status||'Engineering study';$('productionImage').src=project.preview;$('productionImage').alt=project.name+' — first-view model preview';$('productionPreviewType').textContent=project.previewType||'EXISTING MODEL STUDY';$('productionTechnologies').replaceChildren(...project.technologies.map(t=>{const s=document.createElement('span');s.textContent=t;return s;}));$('productionCount').textContent=String(previewIndex+1).padStart(2,'0')+' / '+String(registry.list().length).padStart(2,'0');updateProjectPosition(project);
  panel.querySelectorAll('[data-project-preview]').forEach(b=>{b.setAttribute('aria-current',b.dataset.projectPreview===id?'true':'false');if(focus&&!phonePresentation.matches&&b.dataset.projectPreview===id){b.focus({preventScroll:true});b.scrollIntoView({block:'nearest',inline:'nearest',behavior:reduced?'instant':'smooth'});}});
  refresh(factory?.snapshot());
 }
 function build(){revision=registry.revision;const list=$('productionProjects');list.replaceChildren(...registry.list().map((project,i)=>{const item=document.createElement('div');item.setAttribute('role','listitem');const b=document.createElement('button');b.type='button';b.dataset.projectPreview=project.id;b.setAttribute('aria-label',project.name+', '+project.category);const n=document.createElement('span'),title=document.createElement('strong'),category=document.createElement('small');n.textContent=String(i+1).padStart(2,'0');title.textContent=project.shortName;category.textContent=project.category;b.append(n,title,category);item.append(b);return item;}));setPreview(registry.get(previewId)?previewId:registry.list()[0]?.id);}
 function browse(step){const list=registry.list();if(!list.length)return;setPreview(list[(previewIndex+step+list.length)%list.length].id,{focus:true});}
 function select(id=previewId){
  const project=registry.get(id);if(!project||project.discoverable===false)return false;
  const f=ensureFactory(),current=f.snapshot().project;
  if(current.selectedId===id&&current.activeId===id&&['presenting','complete'].includes(current.stage)){inspect();return false;}
  selectionPending=true;delivery=true;context='delivery';deliveryOpenedAt=performance.now();document.body.classList.add('project-delivery-active');
  window.ProjectStudy?.prepare(id).catch(()=>{});
  withCover(()=>{selectionPending=false;f.requestProject(project,{mobile:phonePresentation.matches});returnToBrowse=false;delivery=true;context='delivery';internalNavigation=true;
   if(reduced||fallback){f.finishPresentation();delivery=false;context='assembly';window.WorkshopNavigation?.navigate('assembly',{instant:true});}else nav('delivery');
   internalNavigation=false;refresh(f.snapshot());});return true;
 }
 function handoff(){const f=ensureFactory(),h=f.handoff(registry.featuredId);return {...h,project:registry.get(h.projectId),carrierPreparationState:h.preparationState};}
 function inspect(){delivery=false;ensureFactory().presentProject();window.__projectHandoff=handoff();window.dispatchEvent(new CustomEvent('project:handoff',{detail:window.__projectHandoff}));nav('assembly');}
 const curtain=document.createElement('div');curtain.className='production-skip-curtain';curtain.hidden=true;curtain.setAttribute('aria-hidden','true');document.body.append(curtain);
 let coverToken=0,transitioning=false;
 async function withCover(change){
  const token=++coverToken;transitioning=true;curtain.hidden=false;curtain.classList.remove('leaving');
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(token!==coverToken)return;change();
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(token!==coverToken)return;curtain.classList.add('leaving');
  setTimeout(()=>{if(token===coverToken){curtain.hidden=true;curtain.classList.remove('leaving');transitioning=false;}},reduced?0:150);
 }
 function changeContext(next){
  if(next===context)return;const before=context;context=next;
  if(next==='discovery'){selectionPending=false;withCover(()=>{ensureFactory().enterDiscovery();window.__projectHandoff=handoff();window.dispatchEvent(new CustomEvent('project:handoff',{detail:window.__projectHandoff}));});}
  else if(next==='assembly')ensureFactory().presentProject();
  else if(next==='study'){delivery=false;const f=ensureFactory();if(!f.releaseToStudy()&&f.discoveryHold)f.resumeAutonomous();}
  else if(next==='outside'&&before!=='outside'){selectionPending=false;withCover(()=>{ensureFactory().leavePresentation();window.__projectHandoff=handoff();window.dispatchEvent(new CustomEvent('project:handoff',{detail:window.__projectHandoff}));});}
 }
 function skipDelivery(){withCover(()=>{const f=ensureFactory();f.finishPresentation();delivery=false;context='assembly';window.__projectHandoff=handoff();internalNavigation=true;window.WorkshopNavigation?.navigate('assembly',{instant:true});internalNavigation=false;});}
 function refresh(snapshot){const p=snapshot?.project||{stage:'idle'},project=registry.get(previewId),chosen=p.selectedId===previewId;const text=statusNames[p.stage]||p.stage;
  const button=$('productionSelect');button.textContent=chosen&&['ready','presenting','complete'].includes(p.stage)?'INSPECT '+(project?.shortName||'PROJECT')+' ↗':chosen&&p.mode==='project-delivery'?'VIEW DELIVERY ↗':'SELECT '+(project?.shortName||'PROJECT')+' ↗';
  panel.querySelectorAll('[data-project-preview]').forEach(b=>{b.setAttribute('aria-pressed',String(b.dataset.projectPreview===p.selectedId));});
  const key=[p.stage,p.selectedId,p.activeId,p.pendingId,fallback,reduced].join('|');if(key===lastState)return;lastState=key;
  $('productionDeliveryName').textContent=registry.get(p.selectedId)?.shortName||'PROJECT DELIVERY';
  $('productionDeliveryStatus').textContent=text+(p.pendingId&&p.activeId!==p.pendingId?' / latest selection queued':'')+(fallback?' / 3D unavailable':reduced?' / reduced motion':'');
  const ready=p.ready;$('productionInspect').hidden=!ready;$('productionSkip').hidden=ready;
  const stageIndex=['prepared','transport','detected','confirmed','transfer','ready'].indexOf(p.stage);transport.querySelectorAll('.production-milestones span').forEach((e,i)=>e.classList.toggle('reached',stageIndex>=[0,2,4,5][i]));
 }
 panel.addEventListener('click',e=>{const preview=e.target.closest('[data-project-preview]'),step=e.target.closest('[data-project-step]'),go=e.target.closest('[data-production-nav]');if(preview)setPreview(preview.dataset.projectPreview);if(step)browse(Number(step.dataset.projectStep));if(go)nav(go.dataset.productionNav);});
 const showcase=$('productionShowcase');let carouselPointer=null;
 showcase.addEventListener('pointerdown',e=>{if(!phonePresentation.matches||!active||!e.isPrimary||e.button>0)return;carouselPointer={id:e.pointerId,x:e.clientX,y:e.clientY};try{showcase.setPointerCapture(e.pointerId);}catch{}});
 showcase.addEventListener('pointerup',e=>{if(!carouselPointer||e.pointerId!==carouselPointer.id)return;const dx=e.clientX-carouselPointer.x,dy=e.clientY-carouselPointer.y;carouselPointer=null;if(Math.abs(dx)>=34&&Math.abs(dx)>Math.abs(dy)*1.18)browse(dx<0?1:-1);});
 showcase.addEventListener('pointercancel',()=>{carouselPointer=null;});
 showcase.addEventListener('lostpointercapture',()=>{carouselPointer=null;});

 phonePresentation.addEventListener('change',()=>{const id=carouselPointer?.id;carouselPointer=null;if(id!==undefined&&showcase.hasPointerCapture(id))showcase.releasePointerCapture(id);wheelDistance=0;wheelAt=0;});
 panel.addEventListener('pointerover',e=>{const b=e.target.closest('[data-project-preview]');if(b&&e.pointerType!=='touch'&&b.dataset.projectPreview!==previewId)setPreview(b.dataset.projectPreview);});
 panel.addEventListener('focusin',e=>{const b=e.target.closest('[data-project-preview]');if(b&&b.dataset.projectPreview!==previewId)setPreview(b.dataset.projectPreview);});
 $('productionSelect').addEventListener('click',()=>{const p=ensureFactory().snapshot().project;if(p.selectedId===previewId&&['ready','presenting','complete'].includes(p.stage))inspect();else select();});
 $('productionSkip').addEventListener('click',skipDelivery);$('productionInspect').addEventListener('click',inspect);
 $('productionChange').addEventListener('click',()=>{delivery=false;returnToBrowse=true;nav('production');});
 armActions.addEventListener('click',e=>{if(e.target.closest('[data-production-nav]')){delivery=false;returnToBrowse=true;nav('production');}});
 panel.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)&&!e.target.closest('.production-preview')){e.preventDefault();e.stopPropagation();browse(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1);}if(e.key==='Escape')nav('overview');});
 // Mouse wheel browses catalogue at the belt. Touch scroll remains ordinary HTML reading.
 let wheelDistance=0,wheelAt=0;
 function browseWheel(e){if(!active)return;if(phonePresentation.matches){if(e.ctrlKey)return;const delta=Math.abs(e.deltaX)>Math.abs(e.deltaY)*1.15?e.deltaX:0;if(!delta)return;e.stopPropagation();e.preventDefault();const now=performance.now();if(now-wheelAt>300)wheelDistance=0;wheelDistance+=delta;if(Math.abs(wheelDistance)>65&&now-wheelAt>150){browse(Math.sign(wheelDistance));wheelDistance=0;wheelAt=now;}return;}e.stopPropagation();const reading=e.target.closest('.production-preview');if(reading&&reading.scrollHeight>reading.clientHeight+2)return;if(e.ctrlKey)return;e.preventDefault();const now=performance.now();if(now-wheelAt>300)wheelDistance=0;wheelDistance+=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(Math.abs(wheelDistance)>65&&now-wheelAt>150){browse(Math.sign(wheelDistance));wheelDistance=0;wheelAt=now;}}
 panel.addEventListener('wheel',browseWheel,{passive:false});
 document.getElementById('stage').addEventListener('wheel',browseWheel,{passive:false});
 document.addEventListener('keydown',e=>{if(active&&['BODY','CANVAS'].includes(e.target.tagName)&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();browse(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1);}});
 // Prevent reading gestures from chaining into guided scene navigation.
 let touchY=0;panel.addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY||0;},{passive:true});panel.addEventListener('touchmove',e=>{const y=e.touches[0]?.clientY||0,dy=y-touchY;touchY=y;if(phonePresentation.matches)return;e.stopPropagation();if(dy>0&&panel.scrollTop<=0||dy<0&&panel.scrollTop+panel.clientHeight>=panel.scrollHeight-1)e.preventDefault();},{passive:false});
 $('productionImage').addEventListener('error',()=>{if($('productionImage').src!==registry.fallback)$('productionImage').src=registry.fallback;});
 $('productionAssemblySkip').addEventListener('click',skipDelivery);
 window.addEventListener('portfolio:render-fallback',()=>{fallback=true;ensureFactory().paused=true;lastState='';});
 window.addEventListener('workshop:navigate',e=>{if(internalNavigation)return;const destination=e.detail.destination;if(!['delivery','assembly'].includes(destination))delivery=false;changeContext(destination==='study'?'study':destination==='production'?'discovery':destination==='assembly'?'assembly':destination==='delivery'?'delivery':'outside');});
 build();
 const workCount=document.querySelector('.topnav a[href="#work"] sup');if(workCount)workCount.textContent=String(registry.list().length).padStart(2,'0');
 window.ProductionDiscovery={
  bindFactory(value){factory=value;fallback=false;lastState='';},
  select,setPreview,browse,inspect,getHandoff:handoff,skip:skipDelivery,
  getViewState:()=>({active,previewId,previewIndex,entrySerial}),
  getState:()=>({active,delivery,transitioning,context,cameraArrived,previewId,previewIndex,entrySerial,fallback,reduced,project:factory?.snapshot().project||null,handoff:handoff()}),
  update({progress,snapshot=null,conveyorArrived=true,ms=performance.now()}){
   cameraArrived=conveyorArrived;
   if(registry.revision!==revision)build();
   const intent=window.WorkshopNavigation?.getState().intent,loading=window.__kiraSequence?.active;
   const studying=!!window.ProjectStudy?.active;
   const requested=!studying&&progress>=.30&&progress<.42&&(!intent||intent.destination==='production')&&!loading&&!document.body.classList.contains('hall-inspecting');
   const wanted=requested&&cameraArrived;
   if(wanted!==active){active=wanted;panel.hidden=!active;panel.inert=!active;panel.setAttribute('aria-hidden',String(!active));document.body.classList.toggle('production-active',active);if(active){entrySerial++;if(returnToBrowse)returnToBrowse=false;delivery=false;}else if(panel.contains(document.activeElement))document.activeElement.blur();}
   const state=snapshot||ensureFactory().snapshot();refresh(state);
   const armView=state.camera==='assembly'||(!state.camera||state.camera==='guided')&&progress>=.42&&progress<.51;
   if(delivery&&!selectionPending&&!intent&&progress>.095)delivery=false;
   if(!loading&&!intent&&!selectionPending){const next=studying?'study':delivery?'delivery':armView?'assembly':requested?'discovery':'outside';changeContext(next);}
   if(delivery&&state.project.ready&&!returnToBrowse){if(!readyAt)readyAt=ms;if(ms-readyAt>100)inspect();}else readyAt=0;
   const showDelivery=delivery&&!loading&&progress<.42&&!active&&(!intent||['delivery','assembly'].includes(intent.destination));transport.hidden=!showDelivery;transport.inert=!showDelivery;document.body.classList.toggle('production-delivering',showDelivery);
   const assembly=armView&&!loading&&!studying;armActions.hidden=!assembly||!state.job||state.project.stage==='complete';document.body.classList.toggle('project-assembly',assembly&&!!state.project.explicit);
   if(assembly){const h=handoff(),key=JSON.stringify(h);window.__projectHandoff=h;if(key!==lastHandoffKey){lastHandoffKey=key;window.dispatchEvent(new CustomEvent('project:handoff',{detail:h}));}
    if(state.job&&state.project.stage==='complete'&&registry.get(state.job.id)?.discoverable!==false)window.ProjectStudy?.fromCompletion(state);
   }
   if(delivery&&ms-deliveryOpenedAt>400&&!active&&progress<.08&&intent?.destination==='overview')delivery=false;
   // Keep the home UI out of view for the entire camera handoff, including
   // the interval after delivery ends and before the arm shot arrives.
   document.body.classList.toggle('project-delivery-active',!!state.job&&!window.ProjectStudy?.active&&['delivery','assembly'].includes(context));
   lastProgress=progress;
  }
 };
})();
