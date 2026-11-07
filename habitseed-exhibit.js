(()=>{'use strict';
 let stage=0,screen='04-home',drops=0,flow='private',hud=null,autoGrowth=true,growthTimer=null;
 const stages=['Planted Seed','Germinating','Sprout Emergence','Young Plant','Vegetative Growth','Budding Plant','Full Bloom'];

 function startAutoGrowth(){
  if(growthTimer) clearInterval(growthTimer);
  growthTimer = setInterval(()=>{
   if(!autoGrowth || window.ProjectStudy?.frame().project?.id!=='habitseed') return;
   stage = (stage + 1) % 7;
   const slider = document.getElementById('habitStage');
   if(slider) slider.value = stage;
   update();
  }, 1400);
 }

 function stopAutoGrowth(){
  autoGrowth = false;
  update();
 }

 function mount(id,pages,record){
  if(id!=='habitseed') return pages;
  document.getElementById('studyTitle').textContent='PROJECT HABITSEED';
  document.getElementById('studyCategory').textContent='Android Development · Gamification';
  document.getElementById('studyStatus').textContent='Kotlin / Jetpack Compose · Gamified habit tracker';
  const headings=['SMALL HABITS.<br><em>REAL GROWTH.</em>','CONSISTENCY<br><em>TAKES ROOT.</em>','LOCAL FIRST.<br><em>CONNECTED BY DESIGN.</em>'];
  const copy=['HabitSeed transforms daily routines into a living digital garden. Create habits, water them with a swipe, track streaks, and grow your own collection of plants.','Each habit feeds a seven-stage biological growth engine. Complete a habit to earn drops and Garden XP, advance your plant from seed to full bloom, and unlock new species through the Seed Store.','HabitSeed separates private habit history from public social features. Room handles personal data; Firebase supports authentication, garden summaries, leaderboards and friends.'];
  pages.forEach((page,i)=>{
   page.innerHTML=`<div class="habit-section">0${i+1} / ${['THE EXPERIENCE · HABIT TRACKING','GAMIFICATION · PROGRESSION MODEL','UNDER THE HOOD · DATA ARCHITECTURE'][i]}</div><h2>${headings[i]}</h2><p>${copy[i]}</p>`;
  });

  // Chapter 0: Screen tabs
  const home=document.createElement('div');
  home.className='habit-controls';
  for(const [name,label]of [['04-home','01 HOME'],['06-habit-detail','02 WATER A HABIT'],['08-store','03 SEED STORE']]){
   const b=document.createElement('button');
   b.type='button';
   b.dataset.habitScreen=name;
   b.textContent=label;
   home.append(b);
  }
  pages[0].append(home);
  const note=document.createElement('p');
  note.className='habit-note';
  note.textContent='Actual application screens from the project repository. Drag to orbit the physical device.';
  pages[0].append(note);

  // Chapter 1: Growth Engine with Auto-growth & Dragger
  const growth=document.createElement('div');
  growth.className='habit-growth';
  growth.innerHTML=`<label for="habitStage">PLANT DEVELOPMENT / 07 STAGES (SEED TO FULL BLOOM)</label>
   <input id="habitStage" type="range" min="0" max="6" step="1" value="${stage}">
   <div class="habit-growth-status">
     <strong id="habitStageName"></strong>
     <div class="habit-growth-buttons">
       <button type="button" id="habitGrowthEngine" class="habit-engine-btn" title="Toggle automatic botanical growth simulation">AUTO GROWTH: <b>ON</b></button>
       <button type="button" id="habitWater" title="Water habit manually">+ WATER HABIT<br>+10 DROPS · +10 XP</button>
     </div>
   </div>
   <p id="habitRewards"></p>
   <small>REAL-TIME BOTANICAL ENGINE · SEED STAGE 0 TO FULL BLOOM STAGE 6</small>`;
  pages[1].append(growth);

  // Chapter 2: Privacy & Data Architecture
  const privacy=document.createElement('div');
  privacy.className='habit-privacy';
  privacy.innerHTML='<strong>PRIVATE STORAGE / ROOM DATABASE</strong><p>Habit titles, notes, exact Garden XP, water-drop balances and completion logs are not included in public Firebase profiles.</p><span>KOTLIN / MVVM · HILT · ROOM + FLOWS · WORKMANAGER · FIREBASE AUTH · FIRESTORE</span>';
  const flowControls=document.createElement('div');
  flowControls.className='habit-controls';
  flowControls.innerHTML='<button type="button" data-habit-flow="private">01 PRIVATE / LOCAL</button><button type="button" data-habit-flow="public">02 PUBLIC / SOCIAL</button>';
  pages[2].append(flowControls,privacy);
  const a=document.createElement('a');
  a.className='study-repository';
  a.href=record.link;
  a.target='_blank';
  a.rel='noopener';
  a.textContent='GITHUB REPOSITORY ↗';
  pages[2].append(a);

  if(!hud){
   hud=document.createElement('div');
   hud.className='habit-model-hud';
   hud.innerHTML='<div class="habit-specimen"><small>ACTIVE SPECIMEN</small><b>SUNFLOWER</b><span>BOTANICAL GROWTH ENGINE</span></div><div class="habit-specimen-stage"><small>GROWTH STATE</small><b data-habit-stage-label></b><span>INTERACTIVE STAGE PREVIEW</span></div><div class="habit-standard-reward"><small>STANDARD WATERING / GARDEN XP</small><b>+10 <span>DROPS</span> &nbsp; +10 <span>XP</span></b></div>';
   document.getElementById('studyModelHud').append(hud);
  }
  update();
  startAutoGrowth();
  return pages;
 }

 function update(){
  const title=document.getElementById('habitStageName'),rewards=document.getElementById('habitRewards');
  const stageText = String(stage).padStart(2,'0')+' / '+stages[stage].toUpperCase();
  if(title) title.textContent=stageText;
  const label=document.querySelector('[data-habit-stage-label]');
  if(label) label.textContent=stageText;
  const engineBtn = document.getElementById('habitGrowthEngine');
  if(engineBtn) {
   engineBtn.innerHTML = autoGrowth ? 'AUTO GROWTH: <b style="color:#6affaa">ON</b>' : 'AUTO GROWTH: <b style="color:#ffb38c">PAUSED</b>';
   engineBtn.setAttribute('aria-pressed', String(autoGrowth));
  }
  if(rewards) rewards.textContent=String(drops).padStart(3,'0')+' WATER DROPS / '+String(drops).padStart(3,'0')+' GARDEN XP · '+(autoGrowth?'AUTO GROWTH ENGINE ACTIVE':'MANUAL CONTROL');
  document.querySelectorAll('[data-habit-flow]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.habitFlow===flow)));
  document.querySelectorAll('[data-habit-screen]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.habitScreen===screen)));
 }

 // Dragging slider stops automatic growth
 document.addEventListener('input', e => {
  if(e.target.id==='habitStage'){
   stopAutoGrowth();
   stage=+e.target.value;
   update();
  }
 });

 // Clicking buttons
 document.addEventListener('click', e => {
  const b=e.target.closest('[data-habit-screen]');
  if(b){ screen=b.dataset.habitScreen; update(); }
  const f=e.target.closest('[data-habit-flow]');
  if(f){ flow=f.dataset.habitFlow; update(); }
  // Clicking the water (+10 drops) button stops auto growth and increments stage
  if(e.target.closest('#habitWater')){
   stopAutoGrowth();
   drops += 10;
   stage = Math.min(6, stage + 1);
   const slider = document.getElementById('habitStage');
   if(slider) slider.value = stage;
   update();
  }
  // Clicking the auto growth engine toggle button
  if(e.target.closest('#habitGrowthEngine')){
   autoGrowth = !autoGrowth;
   if(autoGrowth) startAutoGrowth();
   update();
  }
 });

 window.HabitSeedExhibit={mount,get flow(){return flow;},get stage(){return stage;},get screen(){return screen;},get autoGrowth(){return autoGrowth;}};
})();
