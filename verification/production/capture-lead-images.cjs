/* Capture only the current first-chapter model, without page furniture. */
const {launch}=require('../browser.cjs');
// Model bounds include breathing room, while excluding empty capture margins.
const crops={obsidian:[170,145,585,420],terravita:[130,155,565,330],jellycast:[210,55,550,465],sentinel:[235,55,485,490],'click-claim':[220,0,530,555],'analog-fsk':[180,45,590,410],habitseed:[230,20,565,535],prajaa:[245,45,495,510]};
(async()=>{
 const browser=await launch();
 try{
  const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1,reducedMotion:'reduce'});
  page.on('pageerror',error=>console.error(error.message));
  await page.goto('http://127.0.0.1:4173/');
  await page.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active);
  await page.evaluate(()=>{
   window.createStudyBackdrop=(gl,canvas)=>({invalidate(){},render(){
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,canvas.width,canvas.height);
    gl.clearColor(.025,.045,.06,1);gl.depthMask(true);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);
   }});
  });
  await page.addStyleTag({content:'body *{visibility:hidden!important}canvas#stage{visibility:visible!important}.study-layout{grid-template-columns:420px minmax(0,1fr)!important}.study-model{align-self:center;height:580px!important}'});
  for(const id of ['obsidian','terravita','jellycast','sentinel','click-claim','analog-fsk','habitseed','prajaa']){
   await page.evaluate(id=>ProjectStudy.open(id,{resume:false}),id);
   await page.waitForFunction(id=>ProjectStudy.frame().project.id===id&&ProjectStudy.frame().ready,id,{timeout:120000});
   await page.waitForTimeout(1600);
   const bounds=await page.locator('#studyModel').boundingBox();
   const [x,y,width,height]=crops[id];
   await page.screenshot({path:`assets/projects/${id}-model.jpg`,type:'jpeg',quality:88,clip:{x:bounds.x+x,y:bounds.y+y,width,height}});
   console.log('Captured first chapter:',id);
  }
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
