/* Browser suites run serially: avoid overloading the existing local server or
 * mixing GPU load into a visual/timing check. Individual failures are retained. */
const cp=require('node:child_process'),fs=require('node:fs');const results=[];
const jobs=[
 ['captures',['verification/mobile-mission/capture.cjs','current']],
 ['protected comparison',['verification/mobile-mission/compare.cjs']],
 ['full mobile audit',['verification/mobile-mission/audit.cjs']],
 ['orientation, evidence, DPR and fallback',['verification/mobile-mission/extras.cjs']],
 ['native project inputs',['verification/mobile-mission/project-inputs.cjs']],
 ['legacy browser suites',['verification/mobile-mission/existing.cjs']],
 ['core and route unit tests',['--test','verification/workshop-system.test.cjs','verification/project-delivery.test.cjs','verification/project-study-timeline.test.cjs','verification/lab/route.test.cjs','verification/communications/route.test.cjs','verification/communications/geometry.test.cjs','verification/communications/phone-layout.test.cjs']]
];
for(const [name,args]of jobs){console.log('START',name);const r=cp.spawnSync(process.execPath,args,{encoding:'utf8',timeout:900000});results.push({name,status:r.status,stdout:r.stdout,stderr:r.stderr,error:r.error?.message});fs.writeFileSync('verification/mobile-mission/final-checks.json',JSON.stringify(results,null,2));console.log('FINISH',name,r.status,r.stdout?.slice(-700),r.stderr?.slice(-700));}
if(results.some(r=>r.status!==0))process.exitCode=1;
