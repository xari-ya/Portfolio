/* Archives presentation. Symbols are local, unmodified upstream assets;
   source and license records live in assets/archive/sources.json. */
(()=>{'use strict';
 const base=new URL('./engineering-career-lab/assets/archive/',document.baseURI).href,images=new Map(),symbols=new Map(),tints=new Map(),failures=[];
 const icons=['users','briefcase','trophy','calendar-month','book-2','settings','coins','shield-star','checkbox','microphone','broadcast','award','world-scout-emblem','ananda-college'];
 const organizations={'mahara-youth':{name:'Leo Club of Mahara Youth'},welfare:{name:'Welfare Benefits Board'},paffrel:{name:'PAFFREL'},hemas:{name:'Hemas'},rupavahini:{name:'Sri Lanka Rupavahini Corporation'},aiesec:{name:'AIESEC'},university:{name:'University of Colombo'}};
 const sections={
  leadership:{title:'MY LEADERSHIP JOURNEY',subtitle:'ROLES, RESPONSIBILITIES & INITIATIVES',name:'Leadership',label:'Roles & responsibilities',copy:'Roles, responsibilities and initiatives where I led teams, organized projects and created impact.',icon:'users',symbols:['university','university','aiesec','mahara-youth','ananda-college']},
  experience:{title:'MY JOURNEY',subtitle:'PROFESSIONAL & VOLUNTEER EXPERIENCE TIMELINE',name:'Experience',label:'Professional & volunteer work',copy:'A record of professional, media and volunteer experiences contributing to real-world projects and community impact.',icon:'briefcase',symbols:['paffrel','microphone','rupavahini','welfare']},
  achievements:{title:'ACHIEVEMENTS',subtitle:'AWARDS, RECOGNITION & NOTABLE ACCOMPLISHMENTS',name:'Achievements',label:'Awards & recognition',copy:'Awards, recognition and notable accomplishments.',icon:'trophy',symbols:['paffrel','hemas','world-scout-emblem','ananda-college']}
 };
 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const organizationFile=name=>base+name+'.png?v=transparent-logos-02';
 const assetFile=name=>name+(['ananda-college','world-scout-emblem'].includes(name)?'.png':'.svg');
 const jobs=icons.map(name=>new Promise(resolve=>{const img=new Image();img.onload=()=>{images.set(name,img);resolve();};img.onerror=()=>{failures.push(name);resolve();};img.src=base+assetFile(name);}));
 for(const name of icons.filter(n=>!['world-scout-emblem','ananda-college'].includes(n)))jobs.push(fetch(base+assetFile(name)).then(r=>{if(!r.ok)throw Error(name);return r.text();}).then(text=>{const svg=new DOMParser().parseFromString(text,'image/svg+xml').documentElement;if(svg.localName!=='svg')throw Error(name);svg.setAttribute('aria-hidden','true');symbols.set(name,svg);}).catch(()=>failures.push(name+'-source')));
 const crest=new Image();jobs.push(new Promise(resolve=>{crest.onload=()=>{images.set('university',crest);resolve();};crest.onerror=()=>{failures.push('university');resolve();};crest.src='./character-assets/university-of-colombo.png';}));
 for(const name of Object.keys(organizations).filter(name=>name!=='university'))jobs.push(new Promise(resolve=>{const image=new Image();image.onload=()=>{images.set(name,image);resolve();};image.onerror=()=>{failures.push(name);resolve();};image.src=organizationFile(name);}));
 function icon(name,cls=''){if(organizations[name]){const o=organizations[name],src=name==='university'?'./character-assets/university-of-colombo.png':organizationFile(name);return `<img class="archive-symbol archive-logo archive-organization ${cls}" src="${src}" alt="${o.name} logo" width="64" height="64">`;}if(name==='world-scout-emblem'||name==='ananda-college')return `<img class="archive-symbol archive-logo archive-crest ${cls}" src="${base+assetFile(name)}" alt="${name==='ananda-college'?'Ananda College crest':'World Scout Emblem'}" width="64" height="64">`;const source=symbols.get(name);if(source){const svg=source.cloneNode(true);svg.setAttribute('class','archive-symbol '+cls);return svg.outerHTML;}return `<img class="archive-symbol archive-line ${cls}" src="${base+assetFile(name)}" alt="" width="32" height="32">`;}
 function drawIcon(c,name,x,y,size,color='#eae9e1'){
  const image=images.get(name);if(!image)return;
  if(organizations[name]||name==='world-scout-emblem'||name==='ananda-college'){
   const pad=6,scale=Math.min((size-pad*2)/image.naturalWidth,(size-pad*2)/image.naturalHeight);
   c.drawImage(image,x+(size-image.naturalWidth*scale)/2,y+(size-image.naturalHeight*scale)/2,image.naturalWidth*scale,image.naturalHeight*scale);return;
  }
  const key=name+color;let tile=tints.get(key);
  if(!tile){tile=document.createElement('canvas');tile.width=tile.height=160;const g=tile.getContext('2d');g.drawImage(image,0,0,160,160);g.globalCompositeOperation='source-in';g.fillStyle=color;g.fillRect(0,0,160,160);tints.set(key,tile);}
  c.drawImage(tile,x,y,size,size);
 }
 jobs.push(document.fonts.load('600 32px "Workshop Condensed"').catch(()=>failures.push('display-font')));
 const ready=Promise.all(jobs);
 function render(root,selected){
  const s=sections[selected]||sections.achievements,list=LabRefinement.records[selected]||LabRefinement.records.achievements,record=root.querySelector('#labJourneyRecord');
  root.dataset.journey=selected;
  root.querySelector('#labExperienceTitle').textContent=s.title;
  root.querySelector('.lab-experience-screen .lab-screen-head').dataset.subtitle=s.subtitle;
  const assetState=symbols.size===12&&Object.keys(organizations).every(name=>images.has(name))?'sourced':'loading';
  if(root.dataset.archiveSymbols!==assetState){root.dataset.archiveSymbols=assetState;root.querySelectorAll('[data-lab-journey]').forEach(button=>{const part=sections[button.dataset.labJourney];if(part)button.innerHTML=icon(part.icon,'lab-journey-icon')+`<span>${part.name}</span>`;});}
  if(!root.dataset.archiveKeyboard){root.dataset.archiveKeyboard='bound';root.querySelector('.lab-journey-track').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const buttons=[...root.querySelectorAll('[data-lab-journey]')],current=buttons.indexOf(e.target.closest('button'));if(current<0)return;e.preventDefault();e.stopPropagation();const next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(current+(e.key==='ArrowRight'?1:-1)+buttons.length)%buttons.length;buttons[next].focus({preventScroll:true});buttons[next].click();});}
  const active=Object.keys(sections).indexOf(selected);
  root.querySelectorAll('.lab-journey-link').forEach((link,i)=>link.classList.toggle('is-active',i===active||i===active-1));
  if(record.dataset.archiveView===selected&&record.dataset.archiveAssets===assetState)return;
  record.dataset.archiveView=selected;record.dataset.archiveAssets=assetState;record.classList.toggle('lab-awards',selected==='achievements');
  const portrait=`<div class="archive-summary-symbol" aria-hidden="true">${icon(s.icon)}</div>`;
  const summary=`<aside class="lab-record-copy archive-summary">${selected==='leadership'?portrait:''}<h3>${s.name}</h3><h4>${s.label}</h4><i aria-hidden="true"></i><p>${s.copy}</p>${selected!=='leadership'?portrait:''}</aside>`;
  record.innerHTML=(selected==='achievements'?'':summary)+`<div class="lab-record-list archive-records">${list.map((r,i)=>{
   const award=selected==='achievements';return `<article class="archive-record" data-archive-record="${i}"><div class="archive-record-icon">${icon(s.symbols[i])}</div><div class="archive-record-body"><h4>${escape(r[0])}</h4><p>${escape(r[1])}</p>${award?`<span class="archive-award-meta">${escape(r[2])}</span>`:''}</div>${award?'':`<span class="archive-record-date">${icon('calendar-month')}<time>${escape(r[2])}</time></span><small class="archive-record-badge">${escape(r[3])}</small>`}</article>`;}).join('')}</div>`;
 }
 function wrap(c,text,x,y,width,line,maxLines=6){const words=String(text).split(/\s+/);let row='',lines=[];for(const word of words){const test=row?row+' '+word:word;if(row&&c.measureText(test).width>width){lines.push(row);row=word;}else row=test;}if(row)lines.push(row);lines.slice(0,maxLines).forEach((s,i)=>c.fillText(s,x,y+i*line));return Math.min(lines.length,maxLines)*line;}
 function box(c,x,y,w,h,r=10,accent=false){const g=c.createLinearGradient(x,y,x+w,y+h);g.addColorStop(0,accent?'#301314':'#101718');g.addColorStop(1,'#060b0d');c.fillStyle=g;c.strokeStyle=accent?'#ec3c2d':'#424d50';c.lineWidth=accent?1.7:1;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();c.stroke();}
 function summaryArt(c,selected,x,y,w,h){
  if(selected==='leadership'){c.fillStyle='#141716';c.fillRect(x,y,w,h);drawIcon(c,'users',x+(w-92)/2,y+(h-92)/2,92,'#eeb4a0');return;}
  c.strokeStyle='#602a26';c.lineWidth=.7;for(let i=-3;i<8;i++){c.beginPath();c.moveTo(x+i*36,y+h);c.lineTo(x+i*36+100,y);c.stroke();}for(let j=0;j<6;j++){c.beginPath();c.moveTo(x,y+j*22);c.lineTo(x+w,y+j*22+20);c.stroke();}drawIcon(c,'briefcase',x+(w-92)/2,y+(h-92)/2,92,'#eeb4a0');
 }
 function paint(c,v,selected='achievements'){
  const s=sections[selected]||sections.achievements,list=LabRefinement.records[selected]||LabRefinement.records.achievements,awards=selected==='achievements';
  c.save();c.scale(v.width/1200,v.height/714);c.fillStyle='#060b0d';c.fillRect(0,0,1200,714);
  const sheen=c.createLinearGradient(0,0,1200,714);sheen.addColorStop(0,'#131a1b');sheen.addColorStop(.55,'#080e10');sheen.addColorStop(1,'#05090b');c.fillStyle=sheen;c.fillRect(0,0,1200,714);
  c.fillStyle='#f13828';c.fillRect(30,29,6,26);c.fillStyle='#eeeee7';c.font='600 32px "Workshop Condensed",sans-serif';c.fillText(s.title,53,53);
  c.fillStyle='#9da9ab';c.font='14px Arial';const titleWidth=c.measureText(s.subtitle).width;c.fillText(s.subtitle,Math.max(380,1170-titleWidth),48);
  const keys=Object.keys(sections),active=keys.indexOf(selected);
  keys.forEach((id,i)=>{const x=90+i*376;if(i<2){const red=i===active||i===active-1;c.strokeStyle=red?'#f33f2a':'#a7c2bf';c.lineWidth=1.5;c.beginPath();c.moveTo(x+272,116);c.lineTo(x+376,116);c.stroke();for(const dx of [278,368]){c.fillStyle=red?'#f34330':'#b9d8d2';c.beginPath();c.arc(x+dx,116,3.5,0,Math.PI*2);c.fill();}}const on=id===selected;if(on){c.shadowColor='#f02c1c';c.shadowBlur=10;}box(c,x,76,268,90,9,on);c.shadowBlur=0;drawIcon(c,sections[id].icon,x+115,88,38,on?'#fff0e9':'#e2e5df');c.fillStyle=on?'#fff3eb':'#d9dfda';c.font='600 25px "Workshop Condensed",sans-serif';c.textAlign='center';c.fillText(sections[id].name,x+134,150);c.textAlign='left';});
  const top=188,bottom=688,height=bottom-top;
  if(!awards){box(c,30,top,255,height,7);if(selected==='leadership')summaryArt(c,selected,42,top+12,231,155);c.fillStyle='#f0eee6';c.font='600 33px "Workshop Condensed",sans-serif';const heading=selected==='leadership'?top+204:top+42;c.fillText(s.name,48,heading);c.fillStyle='#c3cbca';c.font='21px "Workshop Condensed",sans-serif';c.fillText(s.label,48,heading+29);c.fillStyle='#e63b29';c.fillRect(48,heading+43,40,2);c.font='19px Arial';c.fillStyle='#adb8b7';wrap(c,s.copy,48,heading+76,216,26,7);if(selected==='experience')summaryArt(c,selected,43,top+300,229,178);c.strokeStyle='#9e3128';c.lineWidth=1;c.beginPath();c.moveTo(307,top+20);c.lineTo(307,bottom-20);c.stroke();}
  list.forEach((r,i)=>{
   const x=awards?30+(i%2)*580:328,y=awards?(i<2?top:top+256):top+i*(height/list.length),w=awards?560:842,h=awards?244:height/list.length-9;
   box(c,x,y,w,h,9,false);
   if(awards){c.strokeStyle='#ad2e25';c.lineWidth=1.4;c.beginPath();c.moveTo(x+1,y+24);c.lineTo(x+1,y+8);c.quadraticCurveTo(x+1,y+1,x+8,y+1);c.lineTo(x+27,y+1);c.stroke();drawIcon(c,s.symbols[i],x+15,y+(h-64)/2,64,'#f4b5a0');c.strokeStyle='#5f4b46';c.beginPath();c.moveTo(x+94,y+20);c.lineTo(x+94,y+h-20);c.stroke();c.fillStyle='#f0eee8';c.font='600 31px "Workshop Condensed",sans-serif';const titleHeight=wrap(c,r[0],x+112,y+40,w-130,32,3);c.font='20px Arial';c.fillStyle='#b7c0bd';wrap(c,r[1],x+112,y+56+titleHeight,w-130,26,4);c.fillStyle='#cd8d76';c.font='12px monospace';c.fillText(r[2].toUpperCase(),x+112,y+h-18);}
   else{const cy=y+h/2;c.strokeStyle='#ef4934';c.fillStyle='#101011';c.beginPath();c.arc(307,cy,5,0,Math.PI*2);c.fill();c.stroke();box(c,x+8,y+10,76,h-20,6);drawIcon(c,s.symbols[i],x+14,cy-32,64,'#e6e4db');c.fillStyle='#efeee5';c.font='600 29px "Workshop Condensed",sans-serif';c.fillText(r[0],x+99,y+34);c.fillStyle='#b7c1bf';c.font='20px Arial';wrap(c,r[1],x+99,y+61,selected==='leadership'?348:475,23,2);
    if(selected==='leadership'){c.strokeStyle='#4a5050';c.beginPath();c.moveTo(x+504,y+15);c.lineTo(x+504,y+h-15);c.stroke();drawIcon(c,'calendar-month',x+519,cy-10,20);c.fillStyle='#c6cecb';c.font='16px Arial';c.fillText(r[2],x+547,cy+5);}
    const bx=x+w-127,by=selected==='leadership'?cy-10.5:y+14;c.strokeStyle='#bb3b2c';c.beginPath();c.roundRect(bx,by,111,21,5);c.stroke();c.fillStyle='#ecc2b3';c.font='600 14px "Workshop Condensed",sans-serif';c.textAlign='center';c.fillText(r[3].toUpperCase(),bx+55.5,by+15);c.textAlign='left';if(selected==='experience'){drawIcon(c,'calendar-month',bx,by+42,18);c.fillStyle='#c6cecb';c.font='16px Arial';c.fillText(r[2],bx+25,by+57);}
   }
  });c.restore();
 }
 window.LabArchiveDisplay={ready,render,paint,icon,sections,getState:()=>({revision:'transparent-logos-02',loaded:images.size,sourceSymbols:symbols.size,failures:failures.slice(),tintCache:tints.size})};
 ready.then(()=>window.LabSkillsInterface?.refresh());
})();
