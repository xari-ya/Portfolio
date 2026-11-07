const {launch}=require('./browser.cjs');
async function enter(page){
 await page.goto((process.env.WORKSHOP_URL||'http://127.0.0.1:4173')+'/?workshopDebug');
 await page.waitForFunction(()=>window.__portfolioReady);
 await page.evaluate(()=>{if(!window.__kiraSequence.entering)document.getElementById('kiraSkip')?.click();});
 await page.waitForFunction(()=>!window.__kiraSequence.active);
 await page.waitForTimeout(11000);
}
async function view(page,camera,seconds,file){
 await page.evaluate(t=>window.__workshopDev.setTime(t),seconds);
 await page.locator('[data-hall="'+camera+'"]').click();
 await page.waitForTimeout(1800);
 await page.mouse.move(15,75);
 await page.screenshot({path:'verification/'+file+'.png'});
}
(async()=>{
 const browser=await launch();
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900}});await enter(page);
  await page.locator('#hallGreet').click();
  await view(page,'overview',4,'01-workshop-overview');
  await view(page,'assembly',25,'02-assembly-workstation');
  await view(page,'assembly',26.8,'03-component-pickup');
  await view(page,'assembly',40.5,'04-assembly-inspection');
  await view(page,'intelligence',40.5,'05-server-monitor');
  await view(page,'conveyor',11.3,'08-component-detection');
  await view(page,'overview',30,'06-kira-environment');
  await page.locator('#hallGreet').click();await page.waitForTimeout(1000);
  await page.screenshot({path:'verification/06-kira-environment.png'});await page.close();
  const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await enter(mobile);await mobile.locator('#hallGreet').tap();
  await view(mobile,'overview',30,'07-mobile-workshop');
  await view(mobile,'intelligence',30,'09-mobile-control');
  console.log('Saved all nine review screenshots.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
