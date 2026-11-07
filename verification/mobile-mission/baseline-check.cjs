const cp=require('node:child_process'),fs=require('node:fs');
const suite=process.argv[2]||'verification/production/camera-handoff.cjs';
const r=cp.spawnSync(process.execPath,['--require','./verification/mobile-mission/current-server.cjs',suite],{encoding:'utf8',timeout:240000,env:{...process.env,WORKSHOP_MISSION_BASELINE:'1',WORKSHOP_BASE_URL:'http://127.0.0.1:4175',WORKSHOP_BROWSER_EXECUTABLE:'C:/Program Files/Google/Chrome/Application/chrome.exe',WORKSHOP_BROWSER_ANGLE:'d3d11'}});
const report={suite,baseline:'5b5c7a4',source:'Original JS/CSS/HTML captured before implementation, intercepted by current-server.cjs',status:r.status,stdout:r.stdout,stderr:r.stderr};
if(suite.includes('camera-handoff'))report.trace=JSON.parse(fs.readFileSync('verification/production/camera-handoff-report.json'));
fs.writeFileSync('verification/mobile-mission/baseline-'+(suite.includes('camera-handoff')?'camera':'phone')+'-check.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
