const {launch}=require('../browser.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
(async()=>{const b=await launch();try{
 const p=await b.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.goto('http://127.0.0.1:4173/refined-character.html?debug&skin=05');
 await p.waitForFunction(()=>window.__refinedReady,null,{timeout:40000});await p.waitForTimeout(1800);
 const result=await p.evaluate(()=>{
  const m=__refinedDebug.model,expected=[.4576416015625,.1231689453125];let maxError=0,hands=0;
  for(const part of m.parts){const g=part.geometry;for(let v=0;v<g.p.length/3;v++)if(Math.abs(g.p[v*3])>46&&g.p[v*3+1]<87){hands++;maxError=Math.max(maxError,Math.abs(g.uv[v*2]-expected[0]),Math.abs(g.uv[v*2+1]-expected[1]));}}
  return {parts:m.parts.length,skinned:m.parts.some(p=>!!p.node.skin),animations:m.json.animations?.length||0,skins:m.json.skins?.length||0,
   roughness:m.parts[0].node.material.rough,bodyTexture:!!m.parts[0].node.material.texture,bodyORM:!!m.parts[0].node.material.ormTexture,
   handVertices:hands,maxHandUVError:maxError,motionScript:[...document.scripts].some(s=>/life|motion-study/.test(s.src)),state:refinedCharacter.getState()};
 });
 assert.equal(result.parts,1);assert.equal(result.skinned,false);assert.equal(result.skins,0);assert.equal(result.animations,0);assert.equal(result.motionScript,false);
 assert.equal(result.roughness,1);assert.ok(result.handVertices>1000);assert.ok(result.maxHandUVError<.00003);
 const canvas=p.locator('canvas');const one=crypto.createHash('sha256').update(await canvas.screenshot()).digest('hex');await p.waitForTimeout(450);
 const two=crypto.createHash('sha256').update(await canvas.screenshot()).digest('hex');assert.equal(one,two);result.staticPixelsIdentical=true;
 await p.screenshot({path:'verification/refined-character/unified-skin-overview.png'});
 for(const view of ['righthand','lefthand']){await p.click(`[data-view="${view}"]`);await p.waitForTimeout(1400);await p.screenshot({path:`verification/refined-character/unified-skin-${view}.png`});}
 assert.deepEqual(errors,[]);result.errors=errors;fs.writeFileSync('verification/refined-character/static-skin-check.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
