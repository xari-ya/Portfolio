/* Reference-led exhibits. Geometry and navigation remain owned by the existing engine. */
(()=>{'use strict';
 const titles=['BUILT TO <em>FIND A WAY.</em>','LEARN THE <em>LABYRINTH.</em>','SENSE. DECIDE. <em>MOVE.</em>'];
 const copy=[
  'A compact autonomous micromouse robot designed to explore an unknown maze, sense surrounding walls, and compute a reliable path through it.',
  'Explore unknown corridors, sense nearby walls, and compare exploration with shortest-path replay. The micromouse runs automatically through the existing exploration or shortest-path replay route.',
  'Three distance sensors inform perception. The ESP32 coordinates control and navigation, while the drive electronics, motors, caster and layered chassis form a compact autonomous platform.'
 ];
 function mount(id,pages,record){for(const [selector,owner]of [['.fsk-hud','analog-fsk'],['.claim-hud','click-claim'],['.exhibit-leaders','obsidian']]){const overlay=document.querySelector(selector);if(overlay)overlay.style.display=id===owner?'':'none';}if(id==='prajaa')return PrajaaExhibit.mount(id,pages,record);if(id==='click-claim')return ClaimExhibit.mount(id,pages,record);if(id==='habitseed')return HabitSeedExhibit.mount(id,pages,record);if(id==='analog-fsk')return FSKExhibit.mount(id,pages,record);if(id!=='obsidian')return pages;
  pages.forEach((page,i)=>{if(page.dataset.exhibitBuilt)return;page.dataset.exhibitBuilt='true';
   const controls=i===1?[page.querySelector('.obs-maze-modes'),page.querySelector('.obs-maze-stats')]:i===2?[page.querySelector('.obs-subsystems'),page.querySelector('.obs-subdetail')]:[page.querySelector('.obs-specs')];
   // Keep engine-owned telemetry nodes mounted, while replacing the obsolete reading structure.
   const telemetry=page.querySelector('.obs-progress-line');if(telemetry)telemetry.hidden=true;
   const hint=page.querySelector('.obs-hint');
   const note=page.querySelector('.obs-truth'),disclaimer=page.querySelector('.study-record-disclaimer');
   const label=document.createElement('div');label.className='exhibit-section';label.textContent=`0${i+1} / ${['OVERVIEW','NAVIGATION','SUBSYSTEMS'][i]}`;
   const h=document.createElement('h2');h.innerHTML=titles[i];const p=document.createElement('p');p.textContent=copy[i];page.replaceChildren(label,h,p,...controls.filter(Boolean));
   if(i===1){const run=document.createElement('div');run.className='obs-auto-controls';run.innerHTML='<button type="button" id="obsAutoToggle" data-obs-auto="toggle" aria-pressed="false">PAUSE AUTO RUN</button><button type="button" data-obs-auto="restart">RESTART ROUTE</button>';page.append(run);}
   if(i===0){controls[0].innerHTML='<span>ESP32 CONTROL</span><span>3× TOF SENSING</span><span>DUAL N20 DRIVE</span><span>MAZE ROBOTICS</span>';if(telemetry)page.append(telemetry);}
   if(hint){hint.hidden=true;page.append(hint);}if(note)page.append(note);if(disclaimer)page.append(disclaimer);
  });
  const host=document.getElementById('studyModelHud');let labels=host.querySelector('.exhibit-leaders');
  if(!labels){labels=document.createElement('div');labels.className='exhibit-leaders';labels.setAttribute('aria-label','Robot assemblies');for(const [name,cl]of [['Main PCB','pcb'],['Sensor array','sensors'],['Drive motors','motors'],['Chassis stack','chassis'],['Rear ball caster','caster']]){const label=document.createElement('span');label.className='exhibit-leader '+cl;label.textContent=name;labels.append(label);}host.append(labels);}
  return pages;
 }
 let leaderNodes=null,leaderSize='';
 function projectLabels(points,width,height){
  const parent=document.querySelector('.exhibit-leaders');if(!parent)return;
  if(!leaderNodes){const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('aria-hidden','true');svg.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:visible';parent.prepend(svg);leaderNodes=points.map(({key})=>{const line=document.createElementNS(svg.namespaceURI,'line');line.setAttribute('stroke','#c5c8ca');line.setAttribute('stroke-width','1');svg.append(line);return {label:parent.querySelector('.'+key),line};});}
  if(leaderSize!==width+':'+height){leaderNodes.forEach(n=>{n.width=n.label.offsetWidth;n.height=n.label.offsetHeight;});leaderSize=width+':'+height;}
  points.forEach(({x,y},i)=>{const {label,line,width:lw,height:lh}=leaderNodes[i];if(!label)return;const lx=Math.max(5,Math.min(width-lw-5,x+(i===1||i===2?-lw-35:35))),ly=Math.max(4,Math.min(height-lh-42,y-lh/2));label.style.left=lx+'px';label.style.top=ly+'px';label.style.right='auto';line.setAttribute('x1',x);line.setAttribute('y1',y);line.setAttribute('x2',lx>x?lx:lx+lw);line.setAttribute('y2',ly+lh/2);});
 }
 window.ReferenceShowcase={mount,projectLabels};
})();
