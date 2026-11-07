const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
  const page=await browser.newPage({viewport:{width:1920,height:900},reducedMotion:'reduce'});
  await page.goto((process.env.WORKSHOP_BASE_URL||'http://127.0.0.1:4173')+'/#communications');
  await page.waitForFunction(()=>window.__communicationsScene?.getState().active&&!window.__kiraSequence?.active,{},{timeout:60000});
  for(const offset of [-.12,0,.12]){
   await page.evaluate(offset=>CommunicationsCamera.yaw=offset,offset);
   await page.waitForFunction(offset=>{const c=__communicationsScene.getState().camera;return Math.abs(Math.atan2(-(c.target[2]-c.eye[2]),c.eye[0]-c.target[0])-(Math.atan2(.55,8.2)+offset))<.001;},offset);
   const results=await page.evaluate(()=>{
    const c=__communicationsScene.getState().camera,L=CommunicationsLayout;
    const norm=a=>{const m=Math.hypot(...a);return a.map(v=>v/m);},dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
    const f=norm(c.target.map((v,i)=>v-c.eye[i])),r=norm(cross(f,[0,1,0])),u=cross(r,f),q=Math.tan(c.fov/2),results=[];
    CommunicationsGraphics.buttons.forEach((b,i)=>{
     for(const [x,y] of [[.02,.5],[.98,.5],[.5,.03],[.5,.97],[.5,.5]]){
      const p=L.point([L.screen.center[0]+(b.x+b.w*x-.5)*L.screen.size[0],L.screen.center[1]+(.5-b.y-b.h*y)*L.screen.size[1],L.screen.center[2]]),v=p.map((n,j)=>n-c.eye[j]),depth=dot(v,f);
      const px=innerWidth*(.5+dot(v,r)/(2*depth*q*c.aspect)),py=(c.viewport?.top||0)+(c.viewport?.height||innerHeight)*(.5-dot(v,u)/(2*depth*q));
      results.push({button:i,x,y,hit:document.elementFromPoint(px,py)?.closest('a')?.dataset.commsAction});
     }
    });return results;
   });
   assert.ok(results.every(p=>Number(p.hit)===p.button),JSON.stringify(results.filter(p=>Number(p.hit)!==p.button)));
  }
  console.log('PASS: all four board buttons match the rendered edges and centres across three camera angles');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
