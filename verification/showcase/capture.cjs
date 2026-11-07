const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),cp=require('node:child_process');
const {launch}=require('../browser.cjs');
const mode=process.argv[2]||'current',dir=path.join(__dirname,mode);fs.mkdirSync(dir,{recursive:true});
const ids=process.env.SHOWCASE_PROJECTS?.split(',')||['obsidian','analog-fsk','habitseed','click-claim','prajaa'];
const report={mode,errors:[],views:[],performance:[],capturedAt:new Date().toISOString()};
async function timing(p){return p.evaluate(()=>new Promise(resolve=>{const a=[];let last=performance.now();function frame(t){a.push(t-last);last=t;if(a.length<90)requestAnimationFrame(frame);else{a.sort((x,y)=>x-y);resolve({median:a[45],p95:a[85],samples:a.length,renderer:document.querySelector('#stage').getContext('webgl2').getParameter(7937)});}}requestAnimationFrame(frame);}));}
(async()=>{const b=await launch();try{
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  const p=await b.newPage({viewport,isMobile:viewport.width<500,hasTouch:viewport.width<500});p.on('pageerror',e=>report.errors.push(e.message));
  await p.goto('http://127.0.0.1:4173/');await p.waitForFunction(()=>window.__portfolioReady,null,{timeout:90000});await p.evaluate(()=>document.querySelector('#kiraSkip')?.click());await p.waitForFunction(()=>!window.__kiraSequence?.active,null,{timeout:90000});
  await p.evaluate(()=>WorkshopNavigation.navigate('production',{instant:true}));await p.waitForTimeout(700);
  await p.screenshot({path:path.join(dir,`discovery-${viewport.width}.png`)});
  for(const id of ids){await p.evaluate(id=>ProjectStudy.open(id,{resume:false}),id);await p.waitForFunction(id=>ProjectStudy.active&&ProjectStudy.getState().project.id===id&&ProjectStudy.getState().ready,id);await p.evaluate(()=>ProjectStudy.skipIntro());await p.waitForTimeout(500);
   for(let chapter=0;chapter<3;chapter++){await p.evaluate(i=>ProjectStudy.selectChapter(i),chapter);await p.waitForTimeout(550);const file=`${id}-${chapter+1}-${viewport.width}.png`;await p.screenshot({path:path.join(dir,file)});report.views.push({id,chapter,viewport,file,glError:await p.evaluate(()=>document.querySelector('#stage').getContext('webgl2').getError())});}
   report.performance.push({id,viewport,...await timing(p)});
  }await p.close();
 }
 if(mode==='baseline'){const files=cp.execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean);report.hashes=Object.fromEntries(files.filter(f=>fs.existsSync(f)).map(f=>[f,crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')]));}
}finally{fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(report,null,2));await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
