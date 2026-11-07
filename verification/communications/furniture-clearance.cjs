const {chromium}=require('playwright'),fs=require('node:fs'),assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});try{
const p=await b.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});await p.goto('http://127.0.0.1:4174/#communications');await p.waitForFunction(()=>window.__communicationsScene?.getState().behaviour.docked,null,{timeout:90000});
const result=await p.evaluate(()=>{
 const find=(n,name)=>n.name===name?n:n.children.map(c=>find(c,name)).find(Boolean),table=find(__communicationsScene.room.root,'office-tea-table'),top=find(table,'office-tea-top'),v=top.geometry.vertices,points=[];
 for(let i=0;i<v.length;i+=8){const x=v[i]*top.s[0]+top.p[0],z=v[i+2]*top.s[2]+top.p[2],c=Math.cos(table.r[1]),s=Math.sin(table.r[1]);points.push([table.p[0]+c*x+s*z,table.p[2]-s*x+c*z]);}
 const lo=[0,1].map(i=>Math.min(...points.map(p=>p[i]))),hi=[0,1].map(i=>Math.max(...points.map(p=>p[i]))),r=new LabKiraRoute();let minimum=Infinity;
 for(let i=0;i<12000;i++){const p=r.update(1/60,true,[3.52,.004,4.65],Math.PI,{active:true,mode:'communications',progress:.99},i*1000/60);if(p){const x=-p.z-31.5,z=p.x-.5;minimum=Math.min(minimum,Math.hypot(Math.max(lo[0]-x,0,x-hi[0]),Math.max(lo[1]-z,0,z-hi[1])));}}
 return {footprint:{lo,hi},minimumCenterDistance:minimum,safetyRadius:.34,clearance:minimum-.34,parallel:Math.abs(Math.cos(table.r[1]))<1e-8};
});assert.ok(result.parallel);assert.ok(result.clearance>.1,'KIRA swept route clears the actual tabletop by more than 10cm beyond its safety radius');
await p.evaluate(()=>CommunicationsCamera.yaw=.27);await p.waitForTimeout(1000);await p.screenshot({path:'verification/communications/furniture-lounge.png'});fs.writeFileSync('verification/communications/furniture-clearance.json',JSON.stringify(result,null,2));console.log(result);
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
