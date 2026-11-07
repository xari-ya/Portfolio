(()=>{'use strict';
const root=document.getElementById('kiraLoader');if(!root)return;
const status=document.getElementById('kiraStatus'),detail=document.getElementById('kiraDetail'),stageLabel=document.getElementById('kiraAwakeningStage'),story=document.getElementById('kiraStageStory'),skip=document.getElementById('kiraSkip'),fallback=document.getElementById('kiraFallback');
const dots=[...root.querySelectorAll('.kira-stage-item')],reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const names=['01 / DORMANT','02 / FIRST SIGNS OF LIFE','03 / SYSTEM CALIBRATION','04 / VISITOR DETECTED','05 / WORKSHOP ACTIVATION'];
const stories=['A quiet workshop. One small machine, waiting.','Power flows. Two eyes open. Kira wakes.','Eyes first. Head follows. Tracks calibrate.','He sees you. Move your pointer or tap Kira.','The doors open. Follow Kira into the workshop.'];
const times=reduced?[80,170,260,350]:[600,1460,2550,3950];const start=performance.now();
const seq=window.__kiraSequence={active:true,stage:0,entering:false,progress:0,awake:false,ready:false,pointer:[0,0],pointerAt:start,reactionAt:0,reaction:0,failed:false};
let state=-1,startedAt=0,finished=false,skipRequested=false,lastReaction=0,timer=0;
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
function select(n){n=Math.max(0,Math.min(4,n));if(n===state)return;state=n;seq.stage=n;root.dataset.stage=String(n+1);stageLabel.textContent=names[n];story.textContent=stories[n];dots.forEach((d,i)=>{d.classList.toggle('active',i===n);d.classList.toggle('passed',i<n);d.setAttribute('aria-current',i===n?'step':'false');});}
function setMessage(label,sub){if(status.textContent!==label)status.textContent=label;detail.textContent=sub;}
function ready(){seq.ready=true;root.dataset.ready='true';root.classList.add('kira-resources-ready');skip.disabled=false;skip.textContent='ENTER NOW ↗';if(skipRequested)enter();}
window.addEventListener('portfolio:ready',ready,{once:true});if(window.__portfolioReady)ready();
function enter(){if(seq.entering||finished||!seq.ready)return;seq.entering=true;startedAt=performance.now();select(4);root.classList.add('kira-entering');skip.disabled=true;skip.textContent='ENTERING…';setMessage('WORKSHOP ACTIVATION','The doors are opening · Follow Kira');}
function finish(){if(finished)return;finished=true;seq.active=false;seq.entering=false;seq.progress=1;seq.awake=true;document.body.classList.remove('kira-is-loading');document.body.classList.add('kira-has-entered');root.classList.add('kira-finished');window.dispatchEvent(new CustomEvent('kira:entered',{detail:{awake:true,continuous:true}}));setTimeout(()=>root.remove(),700);}
skip.addEventListener('click',()=>{skipRequested=true;if(seq.ready)enter();else setMessage('LOADING WORKSHOP','Completing actual scene initialization');});
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&seq.active&&seq.ready)enter();});
window.addEventListener('pointermove',e=>{if(!seq.active||seq.entering)return;seq.pointer=[clamp(e.clientX/Math.max(1,innerWidth)*2-1,-1,1),clamp(e.clientY/Math.max(1,innerHeight)*2-1,-1,1)];seq.pointerAt=performance.now();},{passive:true});
root.addEventListener('pointerup',e=>{if(seq.stage<3||seq.entering||e.target.closest('button'))return;const now=performance.now();if(now-lastReaction<1300)return;const x=e.clientX/Math.max(innerWidth,1),y=e.clientY/Math.max(innerHeight,1);if(x<.29||x>.78||y<.18||y>.84)return;lastReaction=now;seq.reactionAt=now;seq.reaction=(seq.reaction+1)%3;});
// WebGL is owned by #stage, never by a second loader canvas.
const canvas=document.getElementById('kiraCanvas');canvas.hidden=true;document.body.classList.add('kira-is-loading');
function frame(ms){if(finished)return;const t=ms-start;if(!seq.entering){let n=t<times[0]?0:t<times[1]?1:t<times[2]?2:3;select(n);seq.awake=n>=1;
 if(seq.ready){setMessage(n<2?'SYSTEM READY':'KIRA / ONLINE',n<3?'Preparing the workshop entrance':'The workshop is ready for you');if(skipRequested||t>=times[3])enter();}
 else if(t>12000){setMessage('WORKSHOP STILL LOADING','Use Continue to enter the accessible portfolio');root.classList.add('kira-stalled');}
 else setMessage(n<2?'INITIALIZING':'LOADING WORKSHOP','Preparing the main assembly hall');}
 if(seq.entering){seq.progress=clamp((ms-startedAt)/(reduced?500:3800));root.style.setProperty('--kira-door-progress',seq.progress.toFixed(3));root.style.setProperty('--kira-portal-glow',Math.min(1,seq.progress*2).toFixed(3));if(seq.progress>=1){finish();return;}}
 timer=requestAnimationFrame(frame);}
window.addEventListener('portfolio:render-fallback',()=>{seq.failed=true;fallback.hidden=false;root.classList.add('kira-no-webgl');},{once:true});
// 15-second safety valve. It does not fabricate resource readiness; the fallback still offers usable content.
setTimeout(()=>{if(!seq.ready&&!finished){root.classList.add('kira-stalled');skip.textContent='CONTINUE TO PORTFOLIO ↗';skip.disabled=false;}},15000);
skip.addEventListener('click',()=>{if(!seq.ready&&root.classList.contains('kira-stalled')){seq.failed=true;fallback.hidden=false;root.classList.add('kira-no-webgl');seq.ready=true;enter();}});
if(reduced){setMessage('PREPARING WORKSHOP','A simplified transition is enabled');}
select(0);timer=requestAnimationFrame(frame);
})();