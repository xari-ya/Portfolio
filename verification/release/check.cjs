const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {launch}=require('../browser.cjs');
const base=process.env.WORKSHOP_BASE_URL||'http://127.0.0.1:4174',label=process.argv[2]||'release',out=path.resolve(process.env.WORKSHOP_OUTPUT||path.join('verification/test-results',label));fs.mkdirSync(out,{recursive:true});
const report={label,base,started:new Date().toISOString(),errors:[],httpErrors:[],requests:{},captures:[],measurements:[],checks:[]};
async function save(){fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));}
async function nav(p,id){await p.evaluate(id=>WorkshopNavigation.navigate(id,{instant:true}),id);await p.waitForTimeout(650);assert.equal(await p.evaluate(()=>WorkshopNavigation.getState().destination),id);}
async function shot(p,name){if(process.env.WORKSHOP_CAPTURE!=='0')await p.screenshot({path:path.join(out,name+'.png'),animations:'disabled'});report.captures.push(name);await save();}
(async()=>{const b=await launch();report.browser=b.version();try{
 for(const [width,height] of (process.env.WORKSHOP_VIEWPORTS?JSON.parse(process.env.WORKSHOP_VIEWPORTS):[[1440,900],[1920,1080],[768,1024],[390,844],[360,800]])){
 const p=await b.newPage({viewport:{width,height},isMobile:width<760,hasTouch:width<760,deviceScaleFactor:1});p.setDefaultTimeout(45000);
 p.on('pageerror',e=>report.errors.push({width,message:e.message}));p.on('console',m=>{if(m.type()==='error')report.errors.push({width,message:m.text()});});p.on('response',r=>{report.requests[new URL(r.url()).pathname]={status:r.status(),type:r.headers()['content-type']};if(r.status()>=400)report.httpErrors.push({width,url:r.url(),status:r.status()});});
 await p.goto(base+'/?workshopDebug');await p.waitForFunction(()=>window.__portfolioReady&&!window.__kiraSequence.active,null,{timeout:90000});await p.evaluate(()=>document.fonts.ready);report.renderer=await p.evaluate(()=>{const g=stage.getContext('webgl2');return g.getParameter(g.getExtension('WEBGL_debug_renderer_info').UNMASKED_RENDERER_WEBGL)});
 for(const id of ['overview','about','production','lab','skills','experience','communications']){await nav(p,id);await shot(p,width+'-'+height+'-'+id);}
 await nav(p,'about');for(const id of ['intro','education','interests','direction']){await p.locator('[data-engineer-tab="'+id+'"]').click();await p.waitForTimeout(200);await shot(p,width+'-about-'+id)}
 await nav(p,'skills');for(const id of ['embedded','robotics','design','software']){await p.evaluate(id=>EngineeringLab.select(id),id);await p.waitForTimeout(400);await shot(p,width+'-skill-'+id)}
 await nav(p,'experience');for(const id of ['leadership','experience','achievements']){await p.evaluate(id=>EngineeringLab.selectJourney(id),id);await p.waitForTimeout(200);await shot(p,width+'-archive-'+id)}
 for(const id of await p.evaluate(()=>WorkshopProjectRegistry.list().map(p=>p.id))){await p.evaluate(id=>ProjectStudy.open(id,{resume:false,featured:true}),id);await p.waitForFunction(id=>ProjectStudy.active&&ProjectStudy.getState().project.id===id&&ProjectStudy.getState().ready,id);await p.waitForTimeout(1300);for(let i=0;i<3;i++){await p.locator('[data-study-chapter="'+i+'"]').click();await p.waitForTimeout(500);await shot(p,width+'-project-'+id+'-'+i);assert.equal(await p.evaluate(()=>ProjectStudy.getState().chapter),i);}await nav(p,'production');}
 report.checks.push({width,height,allRooms:true,allProjectChapters:true,aboutTabs:true,skills:true,archives:true});await p.close();await save();console.log('Completed',label,width,height);
 }
 assert.equal(report.errors.length,0,'No runtime exceptions');assert.equal(report.httpErrors.length,0,'No failed runtime resources');
 }finally{report.completed=new Date().toISOString();await save();await b.close();}
})().catch(e=>{report.failure=e.stack;save();console.error(e);process.exitCode=1});
