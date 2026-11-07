const {chromium}=require('playwright'),fs=require('node:fs'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const digest=s=>crypto.createHash('sha256').update(s).digest('hex');
(async()=>{
 const protectedModels=JSON.parse(fs.readFileSync('verification/communications/protected-models.json'));
 const firstRoom=JSON.parse(fs.readFileSync('verification/communications/first-room-theme-baseline.json'));
 for(const [path,hash] of Object.entries(firstRoom))assert.equal(digest(fs.readFileSync(path)),hash,path+' in the first room stays unchanged');
 for(const [path,hash] of Object.entries(protectedModels.files))assert.equal(digest(fs.readFileSync(path)),hash,path+' is protected');
 const source=fs.readFileSync('workshop-hall.js','utf8').replace(/\r\n/g,'\n'),kira=source.slice(source.indexOf('function buildApprovedKira(){'),source.indexOf('const kira=buildApprovedKira();'));
 assert.equal(digest(kira),protectedModels.kiraMeshSHA256,'Approved Kira mesh stays unchanged');
 const browser=await chromium.launch({executablePath:process.env.WORKSHOP_BROWSER_EXECUTABLE||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const errors=[];try{
  const p=await browser.newPage({viewport:{width:1920,height:900},reducedMotion:'reduce'});
  p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!m.text().includes('Failed to load resource'))errors.push(m.text());});
  await p.goto((process.env.WORKSHOP_BASE_URL||'http://127.0.0.1:4173')+'/#communications');
  await p.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence?.active,{},{timeout:60000});
  await p.waitForTimeout(1800);
  console.log(JSON.stringify({errors,state:await p.evaluate(()=>window.__communicationsScene?.getState())},null,2));
  await p.screenshot({path:'verification/communications/reference-wide.png'});
  const navigation={};
  const measure=()=>p.evaluate(()=>{
   const buttons=[...document.querySelectorAll('.comms-navigation button')],boxes=buttons.map(b=>{const r=b.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height};});
   return {count:buttons.length,boxes,centre:boxes.length?(boxes[0].x+boxes.at(-1).x+boxes.at(-1).width)/2:null,viewport:innerWidth,removed:!document.querySelector('[data-comms-reset],.comms-look-hint')};
  });
  navigation.desktop=await measure();
  for(let i=0;i<2;i++){
   await p.locator('.comms-navigation button').nth(i).hover();
   assert.match(await p.locator('.comms-navigation button').nth(i).evaluate(b=>getComputedStyle(b).backgroundColor),/^rgba?\(53, 65, 76[,)]/,'Both navigation buttons use the site glass hover colour');
  }
  navigation.themeHover=true;
  await p.screenshot({path:'verification/communications/navigation-hover.png'});
  await p.locator('[data-comms-back]').press('ArrowRight');await p.waitForFunction(()=>CommunicationsCamera.yaw>.01);
  await p.locator('[data-comms-back]').press('Home');await p.waitForFunction(()=>Math.abs(CommunicationsCamera.yaw)<1e-6);
  await p.evaluate(()=>document.activeElement?.blur());await p.mouse.move(0,0);
  await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(750);
  await p.screenshot({path:'verification/communications/reference-desktop.png'});
  await p.setViewportSize({width:390,height:844});await p.waitForTimeout(750);
  await p.screenshot({path:'verification/communications/reference-mobile.png'});
  navigation.mobile=await measure();
  for(const layout of [navigation.desktop,navigation.mobile]){
   assert.equal(layout.count,2);assert.ok(layout.removed,'Drag hint and Reset View are removed');
   assert.ok(Math.abs(layout.boxes[0].width-layout.boxes[1].width)<.5&&Math.abs(layout.boxes[0].height-layout.boxes[1].height)<.5,'Navigation buttons are equal in size');
   assert.ok(Math.abs(layout.centre-layout.viewport/2)<1,'Navigation buttons are centred');
  }
  const theme=await p.evaluate(()=>{
   const properties=['backgroundImage','backgroundColor','borderRadius','borderTopColor','boxShadow','fontFamily'];
   return ['button-solid','button-outline'].map((type,i)=>{
    const source=getComputedStyle(document.querySelector('.home .intro-actions .'+type)),target=getComputedStyle(document.querySelectorAll('#communicationsPanel .comms-actions a')[i]);
    return {type,properties:Object.fromEntries(properties.map(name=>[name,{source:source[name],target:target[name]}]))};
   });
  });
  for(const control of theme)for(const [name,value] of Object.entries(control.properties))assert.equal(value.target,value.source,control.type+' shares the home '+name);
  fs.writeFileSync('verification/communications/theme-report.json',JSON.stringify({firstRoomUnchanged:true,controls:theme,navigation},null,2));
  assert.deepEqual(errors,[]);
 }finally{await browser.close();}
 console.log('First room and protected models unchanged; glass controls match the home theme; visual captures complete');
})().catch(e=>{console.error(e);process.exitCode=1;});
