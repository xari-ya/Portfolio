const {test}=require('node:test'),assert=require('node:assert/strict');
const timeline=require('../project-study-timeline.js'),registry=require('../project-registry.js');
const ease=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(x*(x*6-15)+10);};
test('Rebuilt distinct exhibits retire before the next scene becomes visible',()=>{for(const id of ['analog-fsk','habitseed','click-claim','prajaa']){const from=timeline.sample(id,0,0),to=timeline.sample(id,1,0);assert.equal(timeline.blend(id,from,to,.25).chapter,0);assert.equal(timeline.blend(id,from,to,.75).chapter,1);assert.equal(timeline.blend(id,from,to,.5).opacity,0);}});
test('Obsidian chapters own mutually exclusive scenes over their entire reading range',()=>{
 for(let i=0;i<3;i++)for(const u of [0,.1,.5,.99,1]){
  const s=timeline.sample('obsidian',i,u);assert.equal(s.weights.reduce((a,b)=>a+b),1);assert.equal(s.weights[i],1);
  assert.equal(s.scene,['hardware','maze','subsystems'][i]);
  if(i===1)assert.ok(s.legacyProgress>=.713&&s.legacyProgress<=.747);
  if(i===2)assert.ok(s.legacyProgress>=.774&&s.legacyProgress<.79);
 }
 assert.equal(ease((timeline.sample('obsidian',1,0).legacyProgress-.713)/.034),0);
 assert.equal(ease((timeline.sample('obsidian',1,1).legacyProgress-.713)/.034),1);
});
test('All JellyCast chapters avoid the old blank and overlapping device/map transitions',()=>{
 for(let i=0;i<3;i++)for(const u of [0,.1,.5,.99,1]){
  const p=timeline.sample('jellycast',i,u).legacyProgress;
  const device=1-ease((p-.681)/.017)*(1-ease((p-.774)/.015));
  const map=ease((p-.700)/.017)*(1-ease((p-.758)/.015));
  assert.ok(Math.abs(device-(i===1?0:1))<1e-9);assert.ok(Math.abs(map-(i===1?1:0))<1e-9);
 }
});
test('TerraVita chapter checkpoints match hardware, sensing and readout phases',()=>{
 assert.ok(timeline.sample('terravita',0,0).legacyProgress<.706);
 for(const u of [0,.5,1]){assert.ok(timeline.sample('terravita',1,u).legacyProgress>=.733);assert.ok(timeline.sample('terravita',1,u).legacyProgress<.748);assert.ok(timeline.sample('terravita',2,u).legacyProgress>=.766);}
});
test('Unknown metadata uses stable default chapters and malformed progress is bounded',()=>{
 assert.equal(timeline.chapters('metadata-only').length,3);assert.equal(timeline.chapters('constructor').length,3);assert.equal(timeline.sample('obsidian',-3,-2).chapter,0);assert.equal(timeline.sample('jellycast',99,10).progress,1);assert.ok(Number.isFinite(timeline.sample('metadata-only',NaN,NaN).legacyProgress));
});
test('Project navigation registry remains configurable and excludes the companion',()=>{
 const ids=registry.list().map(p=>p.id);assert.equal(ids.length,7);assert.ok(!ids.includes('kira')&&!ids.includes('small-business-pos')&&!ids.includes('sentinel'));assert.equal(ids[0],'obsidian');assert.equal(ids.at(-1),'prajaa');
 assert.ok(registry.get('jellycast').theme.rgb[2]>registry.get('jellycast').theme.rgb[1]);assert.equal(registry.get('terravita').theme.colour,'#1a4434');
});
test('Physical-model chapters interpolate their existing parts without an unrelated scene',()=>{
 for(const id of ['obsidian','terravita','jellycast','sentinel']){
  const from=timeline.sample(id,0,0),to=timeline.sample(id,2,0),middle=timeline.blend(id,from,to,.5);
  assert.equal(middle.opacity,1);assert.equal(middle.weights[1],0);assert.ok(Math.abs(middle.weights[2]-.5)<1e-9);assert.ok(Math.abs(middle.legacyProgress-(from.legacyProgress+to.legacyProgress)/2)<1e-9);
  assert.deepEqual(timeline.blend(id,from,to,0),from);assert.deepEqual(timeline.blend(id,from,to,1),to);
 }
});
test('Maze and coastline changes fade sequentially without intersecting solid hardware',()=>{
 for(const id of ['obsidian','jellycast'])for(const pair of [[0,1],[1,2],[2,1],[1,0]]){
  const from=timeline.sample(id,pair[0],.3),to=timeline.sample(id,pair[1],.2);
  let previous=from;
  for(let i=0;i<=100;i++){
   const frame=timeline.blend(id,from,to,i/100);assert.ok(frame.opacity>=0&&frame.opacity<=1);assert.equal(frame.weights.filter(v=>v>0).length,1);
   if(frame.chapter!==previous.chapter)assert.ok(frame.opacity<.001&&previous.opacity<.001);previous=frame;
  }
  assert.equal(timeline.blend(id,from,to,.5).opacity,0);
 }
});
test('Reversing during a fade begins from the actual current visibility and pose',()=>{
 const source=timeline.sample('obsidian',0,0),target=timeline.sample('obsidian',1,0),middle=timeline.blend('obsidian',source,target,.3);
 assert.ok(middle.opacity>0&&middle.opacity<1);assert.deepEqual(timeline.blend('obsidian',middle,source,0),middle);assert.deepEqual(timeline.blend('obsidian',middle,source,1),source);
});
