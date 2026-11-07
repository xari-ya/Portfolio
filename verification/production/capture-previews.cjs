/* Reuse the existing portfolio renderers, never duplicate their heavy assets
 * into discovery. These captures are labelled model/concept studies in the UI. */
const {launch}=require('../browser.cjs');
(async()=>{const browser=await launch();try{
 const page=await browser.newPage({viewport:{width:1920,height:1080}});
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>window.__portfolioReady&&!__kiraSequence.active);
 await page.addStyleTag({content:'body *{visibility:hidden!important}canvas#stage{visibility:visible!important}'});
 const studies=[['obsidian',0,.700],['terravita',1,.650],['jellycast',2,.730],['sentinel',3,.650],['click-claim',4,.650],['analog-fsk',5,.650],['habitseed',6,.650],['prajaa',8,.650]];
 for(const [id,index,progress] of studies){await page.evaluate(({index,progress})=>{document.querySelector(`[data-project="${index}"]`).click();WorkshopNavigation.navigateProgress(progress,'portfolio',{instant:true});},{index,progress});await page.waitForTimeout(index===1?1800:1000);await page.screenshot({path:'assets/projects/'+id+'.png',clip:id==='obsidian'?{x:950,y:400,width:800,height:440}:id==='terravita'?{x:960,y:370,width:680,height:400}:{x:800,y:140,width:1000,height:850}});console.log('Captured',id);}
 await page.close();
 const kira=await browser.newPage({viewport:{width:1280,height:900}});await kira.goto('http://127.0.0.1:4173/');await kira.waitForFunction(()=>window.__portfolioReady&&window.__kiraSequence?.stage===2);await kira.addStyleTag({content:'body *{visibility:hidden!important}canvas#stage{visibility:visible!important}'});await kira.screenshot({path:'assets/projects/kira.png',clip:{x:400,y:240,width:600,height:600}});console.log('Captured Kira');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
