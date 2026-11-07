/* FSK editorial panels and controls; component models live in the shared WebGL scene. */
(()=>{'use strict';
 let signal='mark',hud=null,lastChapter=-1,cycleTimer=null,rafId=null;
 const modes=['mark','space','idle'];
 let modeIndex=0;

 function startAutoCycle(){
  if(cycleTimer) clearInterval(cycleTimer);
  cycleTimer = setInterval(()=>{
   if(window.ProjectStudy?.frame().project?.id!=='analog-fsk') return;
   modeIndex = (modeIndex + 1) % modes.length;
   setSignal(modes[modeIndex], false);
  }, 2000);
 }

 const headings=['CODE A BIT AS<br><em>A FREQUENCY.</em>','FILTER THE LIGHT.<br><em>RECOVER THE BIT.</em>','ONE LINK.<br><em>THREE OUTCOMES.</em>'];
 const texts=[
  'An NE555 timer runs as an astable oscillator. Two push-buttons select its timing network; an IR LED transmits the resulting square-wave carrier.',
  'A photodiode converts infrared pulses into an electrical signal. Parallel active filters separate the carriers; diodes, RC networks and comparators recover the channel decision.',
  'The transmitter and receiver form a complete analog digital link. Carrier selection determines which output LED lights; no signal leaves both outputs inactive.'
 ];

 function setSignal(value, manual=true){
  if(!modes.includes(value)) return;
  signal=value;
  if(manual){
   modeIndex=modes.indexOf(value);
   startAutoCycle();
  }
  document.querySelectorAll('[data-fsk-signal]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.fskSignal===signal)));
  const output=document.getElementById('fskOutput');
  if(output){
   output.textContent=signal==='mark'?'MARK · 38 kHz · TRANSMITTING · RED CHANNEL ACTIVE':signal==='space'?'SPACE · 1 kHz · TRANSMITTING · GREEN CHANNEL ACTIVE':'IDLE · NO CARRIER · TRANSMITTER & RECEIVER QUIESCENT';
  }
  updateWaveformLabels();
 }

 function updateWaveformLabels(){
  document.querySelectorAll('.fsk-wave.mark').forEach(w=>{
   w.classList.toggle('is-active', signal==='mark');
   const badge = w.querySelector('.fsk-live-badge');
   if(badge) badge.textContent = signal==='mark' ? 'ACTIVE · 38 kHz' : 'STANDBY';
  });
  document.querySelectorAll('.fsk-wave.space').forEach(w=>{
   w.classList.toggle('is-active', signal==='space');
   const badge = w.querySelector('.fsk-live-badge');
   if(badge) badge.textContent = signal==='space' ? 'ACTIVE · 1 kHz' : 'STANDBY';
  });
 }

 function computeWavePath(cycles, y, phase, active){
  if(!active) return `M0 ${y}H260`;
  const period = 260 / cycles;
  const half = period / 2;
  const offset = ((phase % 1 + 1) % 1) * period;
  let d = '';
  for(let x = -period + offset; x <= 260 + period; x += period){
   const x0 = Math.max(0, Math.min(260, x));
   const x1 = Math.max(0, Math.min(260, x + half));
   const x2 = Math.max(0, Math.min(260, x + period));
   if(!d) d = `M${x0.toFixed(1)} ${y+11}`;
   d += `H${x1.toFixed(1)}V${y-11}H${x2.toFixed(1)}V${y+11}`;
  }
  return d;
 }

 function animateWaves(ts){
  if(window.ProjectStudy?.frame().project?.id==='analog-fsk'){
   const markActive = signal === 'mark';
   const spaceActive = signal === 'space';
   // 38 kHz wave moves smoothly across the view
   const markPhase = markActive ? (ts * 0.007) % 1 : 0;
   const spacePhase = spaceActive ? (ts * 0.002) % 1 : 0;
   const markPath = computeWavePath(19, 20, markPhase, markActive);
   const spacePath = computeWavePath(4, 20, spacePhase, spaceActive);
   document.querySelectorAll('.fsk-wave-mark-path').forEach(p=>p.setAttribute('d', markPath));
   document.querySelectorAll('.fsk-wave-space-path').forEach(p=>p.setAttribute('d', spacePath));
  }
  rafId = requestAnimationFrame(animateWaves);
 }

 function mount(id,pages,record){
  if(id!=='analog-fsk') return pages;
  const title=document.getElementById('studyTitle');
  title.textContent='ANALOG FSK';
  document.getElementById('studyCategory').textContent='Analog Electronics';
  document.getElementById('studyStatus').textContent='INFRARED COMMUNICATION SYSTEM';
  pages.forEach((page,i)=>{
   const source=page.querySelector('.study-repository');
   page.replaceChildren();
   const label=document.createElement('div');
   label.className='fsk-section';
   label.textContent=['01 / THE MODULATOR','02 / THE DEMODULATOR','03 / COMPLETE COMMUNICATION LINK'][i];
   const h=document.createElement('h2');
   h.innerHTML=headings[i];
   const p=document.createElement('p');
   p.textContent=texts[i];
   page.append(label,h,p);
   const data=document.createElement('div');
   data.className='fsk-facts';
   data.innerHTML=i===0?'<div><b>38 kHz</b><span>MARK / LOGIC 1</span><small>RED CHANNEL</small></div><div><b>1 kHz</b><span>SPACE / LOGIC 0</span><small>GREEN CHANNEL</small></div>':i===1?'<div><b>BPF × 2</b><span>PARALLEL FILTERS</span><small>FREQUENCY SEPARATION</small></div><div><b>RC</b><span>ENVELOPE DETECTION</span><small>CHANNEL DECISION</small></div>':'<div><b>MARK</b><span>38 kHz / RED ON</span></div><div><b>SPACE</b><span>1 kHz / GREEN ON</span></div>';
   page.append(data);
   const controls=document.createElement('div');
   controls.className='fsk-signal-controls';
   controls.setAttribute('role','group');
   controls.setAttribute('aria-label','Illustrate carrier selection');
   for(const [mode,name]of [['mark','MARK / 1 (38 kHz)'],['space','SPACE / 0 (1 kHz)'],['idle','IDLE (OFF)']]){
    const b=document.createElement('button');
    b.type='button';
    b.dataset.fskSignal=mode;
    b.textContent=name;
    controls.append(b);
   }
   page.append(controls);
   if(i===2){
    const actual=document.createElement('p');
    actual.className='fsk-contribution';
    actual.textContent=record.contribution||'';
    page.append(actual);
    if(source) page.append(source);
    else if(record.link){
     const a=document.createElement('a');
     a.className='study-repository';
     a.href=record.link;
     a.target='_blank';
     a.rel='noopener';
     a.textContent='VIEW SOURCE ↗';
     page.append(a);
    }
   }
  });
  if(!hud){
   hud=document.createElement('div');
   hud.className='fsk-hud';
   hud.innerHTML='<div class="fsk-count"></div><div class="fsk-callout first"><b></b><span></span></div><div class="fsk-callout second"><b></b><span></span></div><div class="fsk-instrument"></div><div class="fsk-output" id="fskOutput" role="status"></div><div class="fsk-model-note">SOURCE-BASED 3D RECONSTRUCTION · DRAG TO ORBIT</div>';
   document.getElementById('studyModelHud').append(hud);
  }
  pages.forEach(page=>{
   const mobile=document.createElement('div');
   mobile.className='fsk-instrument fsk-mobile-instrument';
   if(page===pages[2]) return;
   page.append(mobile);
  });
  lastChapter=-1;
  setSignal(signal, false);
  startAutoCycle();
  if(!rafId) rafId = requestAnimationFrame(animateWaves);
  return pages;
 }

 const details=[['NE555 / OSCILLATOR','Astable timing network','S1 + S2 / INPUTS','Manual carrier selection'],['FILTER COMPONENTS','Resistors · capacitors','OP-AMP PACKAGES','Active filters / comparators'],['FSK TRANSMITTER','NE555 + infrared LED','FSK RECEIVER','Two frequency channels']];

 function waveTemplate(){
  return `<b>CARRIER SIGNATURE · MOVING WAVEFORM</b>
  <div class="fsk-wave mark">
    <div class="fsk-wave-header"><span>MARK · 38 kHz</span><i class="fsk-live-badge">ACTIVE · 38 kHz</i></div>
    <svg viewBox="0 0 260 40" aria-label="Live moving square-wave mark carrier"><path class="fsk-wave-mark-path" d="M0 20H260"/></svg>
  </div>
  <div class="fsk-wave space">
    <div class="fsk-wave-header"><span>SPACE · 1 kHz</span><i class="fsk-live-badge">STANDBY</i></div>
    <svg viewBox="0 0 260 40" aria-label="Live moving square-wave space carrier"><path class="fsk-wave-space-path" d="M0 20H260"/></svg>
  </div>
  <small>DYNAMIC OSCILLOSCOPE TRACE · 2-SECOND DEMO CYCLE (MARK → SPACE → IDLE)</small>`;
 }

 function rendered(chapter){
  if(!hud) return;
  if(lastChapter===chapter) return;
  lastChapter=chapter;
  const d=details[chapter];
  hud.querySelector('.fsk-count').textContent=`0${chapter+1} / 03 STUDY`;
  for(const [index,selector]of [[0,'.first'],[2,'.second']]){
   const node=hud.querySelector(selector);
   node.querySelector('b').textContent=d[index];
   node.querySelector('span').textContent=d[index+1];
  }
  hud.querySelector('.fsk-instrument').innerHTML=chapter===0?waveTemplate():chapter===1?'<b>THE ANALOG RECOVERY CHAIN</b><div class="fsk-chain"><span>IR SENSOR<small>Threshold</small></span><span>BPF × 2<small>Separate</small></span><span>DIODE + RC<small>Envelope</small></span><span>COMPARATOR<small>Decision</small></span></div>':'';
  hud.querySelector('.fsk-instrument').hidden=chapter===2;
  updateWaveformLabels();
 }

 document.addEventListener('click',e=>{
  const b=e.target.closest('[data-fsk-signal]');
  if(b&&window.ProjectStudy?.frame().project?.id==='analog-fsk') setSignal(b.dataset.fskSignal, true);
 });

 let leaders=null,leaderSize='',leaderStarts=[];
 function projected(points,width,height){
  if(!hud) return;
  if(!leaders){
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
   svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none';
   svg.setAttribute('aria-hidden','true');
   leaders=points.map((p,i)=>{
    const line=document.createElementNS(svg.namespaceURI,'path');
    line.setAttribute('fill','none');
    line.setAttribute('stroke',i?'#87c8e3':'#ff6951');
    line.setAttribute('stroke-width','1');
    svg.append(line);
    return line;
   });
   hud.prepend(svg);
   hud.classList.add('has-projected-leaders');
  }
  const size=[width,height,lastChapter].join(':');
  if(leaderSize!==size){
   const host=hud.getBoundingClientRect();
   leaderStarts=[...hud.querySelectorAll('.fsk-callout')].map(n=>{
    const r=n.getBoundingClientRect();
    return {x:r.left-host.left+r.width*.5,y:r.bottom-host.top};
   });
   leaderSize=size;
  }
  points.forEach((p,i)=>{
   const a=leaderStarts[i];
   leaders[i].setAttribute('d',`M${a.x.toFixed(1)} ${a.y.toFixed(1)}L${a.x.toFixed(1)} ${(p.y-16).toFixed(1)}L${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  });
 }

 window.FSKExhibit={mount,projected,rendered(chapter){rendered(chapter);const mobile=document.querySelectorAll('.fsk-mobile-instrument')[chapter];if(mobile&&mobile.dataset.chapter!==String(chapter)){mobile.innerHTML=chapter===0?waveTemplate():hud.querySelector('.fsk-instrument').innerHTML;mobile.dataset.chapter=chapter;updateWaveformLabels();}},setSignal,get signal(){return signal;}};
})();
