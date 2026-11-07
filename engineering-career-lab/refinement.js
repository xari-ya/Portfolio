/* Shared archive records and cached technical artwork. Existing renderer only. */
(()=>{'use strict';
 const records={
 achievements:[
 ['1st Place — Prajaa','PAFFREL Civic Tech Challenge','Winner'],
 ['Top 5 — Hemas AITHON 2024','Finalist at the Hemas AITHON 2024 innovation challenge.','Top 5'],
 ["President’s Scout Award","The highest national recognition in the Scout movement in Sri Lanka.",'National recognition'],
 ['School Colours','Awarded for outstanding contribution to school in extracurricular activities.','Recognition']],
 leadership:[
 ['Secretary','English Literary Association, Faculty of Technology, UOC','Aug 2023 – Aug 2024','Executive'],
 ['Assistant Secretary','Students’ Innovation & Automation Team (SIAT)','Feb 2023 – Feb 2024','Team lead'],
 ['Showcasing Team Leader','AIESEC in University of Colombo','May 2022 – Jan 2023','Project lead'],
 ['Assistant Treasurer','Leo Club of Mahara Youth','Jan 2021 – Dec 2021','Finance'],
 ['Senior Prefect','Ananda College','Jan 2019 – Dec 2020','Student lead']],
 experience:[
 ['Data Processing Agent — PAFFREL','Local Authorities Election 2025','Apr – May 2025','Election support'],
 ['Voice-over Artist & Media Presenter','Volunteer Experience','2023 – Present','Media / volunteer'],
 ['Sri Lanka Rupavahini Corporation','Training / Media Experience','Aug – Sep 2023','Media training'],
 ['Aswesuma Welfare Benefits Program','Field/Support Experience','Jan – Mar 2023','Community support']]};
 const evidence={embedded:['obsidian','terravita'],robotics:['obsidian'],software:['jellycast'],design:['terravita']};
 const projectIcon=id=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+({obsidian:'M4 16H20L18 8H6ZM7 8V4H17V8M8 19H8M16 19H16M12 8V14',terravita:'M12 21V10M12 14C3 15 2 5 3 3C12 3 14 8 12 14ZM12 17C22 17 23 8 22 6C15 6 12 10 12 17Z',jellycast:'M3 16C7 8 9 22 13 10S18 3 21 8M3 21H21M3 3V21'})[id]+'"/></svg>';
 function wrap(c,text,x,y,width,line=24){let row='',yy=y;for(const word of text.split(' ')){const next=row?row+' '+word:word;if(c.measureText(next).width>width&&row){c.fillText(row,x,yy);yy+=line;row=word;}else row=next;}c.fillText(row,x,yy);}
 function card(c,x,y,w,h){c.fillStyle='#101a20';c.strokeStyle='#56626b';c.lineWidth=1;c.beginPath();c.roundRect(x,y,w,h,12);c.fill();c.stroke();}
 function paintArchive(c,v,active='achievements'){window.LabArchiveDisplay?.paint(c,v,active);}
 const cache=new Map(),canvases=new Map();
 function art(id){if(cache.has(id))return cache.get(id);const c=document.createElement('canvas');c.width=960;c.height=640;SkillsTechnicalArt.paint(c.getContext('2d'),c,id);const url=c.toDataURL();canvases.set(id,c);cache.set(id,url);return url;}
 let desktop=null;
 function refresh(){const root=document.getElementById('engineeringLab');if(!root)return;window.LabArchiveDisplay?.render(root,EngineeringLab.getState().journey||'achievements');if(innerWidth<=760)return;
  if(!desktop){desktop=document.createElement('div');desktop.className='lab-refined-domain';desktop.addEventListener('keydown',e=>{const a=[...desktop.querySelectorAll('[data-lab-category]')];if(a.includes(e.target)&&['ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const i=(a.indexOf(e.target)+(e.key==='ArrowDown'?1:-1)+a.length)%a.length,id=a[i].dataset.labCategory;EngineeringLab.select(id||null);desktop.querySelector('[data-lab-category="'+id+'"]')?.focus();}});root.querySelector('.lab-skills-screen').append(desktop);}
  const state=EngineeringLab.getState(),cat=EngineeringSkillsData.get(state.category);root.dataset.domainView=cat?'detail':'overview';
  const key=cat?.id||'';if(desktop.dataset.key!==key){desktop.dataset.key=key;desktop.innerHTML=cat?`<div class="lab-refined-sidebar">${EngineeringSkillsData.categories.map(item=>`<button data-lab-category="${item.id}" aria-label="${item.name}" aria-pressed="${item.id===cat.id}">${document.querySelector('.lab-domain-grid [data-lab-category="'+item.id+'"] svg')?.outerHTML||''}</button>`).join('')}<button data-lab-category="" aria-label="All domains">←</button></div><article><div class="lab-domain-copy"><span class="lab-technical-eyebrow">${({embedded:"01 / ELECTRONICS & FIRMWARE",robotics:"02 / AUTONOMOUS SYSTEMS",software:"03 / DATA & INTELLIGENCE",design:"04 / SENSING & ACQUISITION"})[cat.id]}</span><h2>${cat.name}</h2><p>${cat.description}</p><span class="lab-domain-note">${cat.id==="design"?"DEMONSTRATION MEASUREMENTS":"DESIGN / DEVELOP / INTEGRATE / TEST"}</span></div><img src="${art(cat.id)}" alt="${cat.name} technical illustration"></article><aside><h3>TECHNOLOGIES</h3><div class="lab-tech-chips">${cat.tools.map(t=>`<span>${t}</span>`).join('')}</div><h3>USED IN</h3>${evidence[cat.id].map(id=>`<p class="lab-evidence"><span aria-hidden="true">${projectIcon(id)}</span>${WorkshopProjectRegistry.get(id)?.name||id}</p>`).join('')}</aside>`:'';}

 }
 matchMedia('(max-width:760px)').addEventListener('change',refresh);
 function paintDomain(c,v){const id=window.EngineeringLab?.getState().category,cat=EngineeringSkillsData.get(id);if(!cat)return false;art(id);c.save();c.scale(v.width/1200,v.height/513);c.fillStyle='#071015';c.fillRect(0,0,1200,513);c.strokeStyle='#2b434b';c.lineWidth=1;c.strokeRect(12,12,1176,489);c.fillStyle='#ee5033';c.fillRect(32,30,5,27);c.fillStyle='#e7ece5';c.font='600 29px "Workshop Condensed",sans-serif';c.fillText('ENGINEERING DOMAINS',51,54);
 EngineeringSkillsData.categories.forEach((item,i)=>{const on=item.id===id;c.fillStyle=on?'#391610':'#111f26';c.strokeStyle=on?'#f25e3e':'#304951';c.beginPath();c.roundRect(32,82+i*70,66,58,5);c.fill();c.stroke();window.paintLabDomainIcon?.(c,item.icon,48,94+i*70,34,on?'#ffa182':'#92aab0');});
 c.strokeStyle='#2b434b';c.strokeRect(118,82,740,393);c.fillStyle='#edf0e8';c.font='600 33px "Workshop Condensed",sans-serif';wrap(c,cat.name,138,130,235,36);c.fillStyle='#a8b8bb';c.font='18px Arial';wrap(c,cat.description,138,id==='design'?227:199,232,28);c.drawImage(canvases.get(id),390,112,460,330);
 c.strokeStyle='#2b434b';c.beginPath();c.moveTo(880,82);c.lineTo(880,475);c.stroke();c.fillStyle='#e7ece5';c.font='600 21px "Workshop Condensed",sans-serif';c.fillText('TECHNOLOGIES',904,116);let x=904,y=135;c.font='600 18px "Workshop Condensed",sans-serif';for(const tool of cat.tools){const w=c.measureText(tool).width+20;if(x+w>1168){x=904;y+=39;}c.fillStyle='#182e39';c.beginPath();c.roundRect(x,y,w,30,5);c.fill();c.fillStyle='#c9dce5';c.fillText(tool,x+10,y+21);x+=w+8;}
 c.fillStyle='#e7ece5';c.font='600 21px "Workshop Condensed",sans-serif';c.fillText('USED IN',904,289);c.fillStyle='#b9ced1';c.font='22px "Workshop Condensed",sans-serif';evidence[id].forEach((key,i)=>c.fillText(WorkshopProjectRegistry.get(key)?.name||key,904,329+i*40));c.restore();return true;}
 window.LabRefinement={records,art,paintArchive,paintDomain,refresh,paintTechnical(c,v,id){art(id);c.drawImage(canvases.get(id),0,0,v.width,v.height);}};
})();
