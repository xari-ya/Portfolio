/* Each reading chapter owns a finite, fully visible scene. The old scroll
 * transitions between scenes are deliberately excluded from these ranges. */
(function(root){'use strict';
 const tracks={
  obsidian:[['THE MACHINE','hardware',.697,.697],['MAZE NAVIGATION','maze',.713,.747],['SUBSYSTEMS','subsystems',.776,.787]],
  'analog-fsk':[['TRANSMITTER','transmitter',.697,.697],['RECEIVER','receiver',.735,.735],['SIGNAL PATH','link',.78,.78]],
  habitseed:[['THE GREENHOUSE','greenhouse',.697,.697],['GROWTH ENGINE','growth',.735,.735],['SYSTEM DESIGN','architecture',.78,.78]],
  'click-claim':[['PLATFORM','platform',.697,.697],['FIELD RESPONSE','field',.735,.735],['CONTROL CENTRE','operations',.78,.78]],
  prajaa:[['OVERVIEW','civic',.697,.697],['SERVICE ACCESS','services',.735,.735],['PARTICIPATION','participation',.78,.78]],
  terravita:[['THE INSTRUMENT','hardware',.697,.697],['SENSING PATHWAYS','sensing',.733,.744],['SIMULATED READOUT','readout',.766,.782]],
  jellycast:[['THE SOFTWARE','software',.675,.675],['THE COASTLINE','coastline',.720,.750],['THE RESEARCH','research',.789,.789]],
  default:[['OVERVIEW','overview',.67,.675],['MY CONTRIBUTION','contribution',.72,.745],['TECHNOLOGY','technology',.76,.789]]
 };
 const clamp=x=>Math.max(0,Math.min(1,Number(x)||0));
 const chapters=id=>(Object.hasOwn(tracks,id)?tracks[id]:tracks.default).map(([label,scene,from,to])=>({label,scene,from,to}));
 function sample(id,index,progress){const list=chapters(id),chapter=Math.max(0,Math.min(list.length-1,Math.floor(Number(index)||0))),c=list[chapter],u=clamp(progress);return {...c,chapter,progress:u,legacyProgress:c.from+(c.to-c.from)*u,weights:list.map((_,i)=>i===chapter?1:0),opacity:1};}
 const ease=x=>{x=clamp(x);return x*x*x*(x*(x*6-15)+10);};
 const family=(id,scene)=>['analog-fsk','habitseed','click-claim','prajaa'].includes(id)?'exhibit-'+scene.chapter:(id==='obsidian'||id==='jellycast')&&scene.chapter===1?'map':'model';
 function blend(id,from,to,progress){
  const p=clamp(progress),u=ease(p),mix=(a,b)=>a+(b-a)*u;
  if(p===0)return {...from};if(p===1)return {...to};
  // Parts of the same model move continuously. Distinct objects retire before
  // the next arrives, so a maze/coastline never cuts through solid hardware.
  if(family(id,from)===family(id,to))return {...to,legacyProgress:mix(from.legacyProgress,to.legacyProgress),weights:to.weights.map((v,i)=>mix(from.weights[i],v)),opacity:mix(from.opacity??1,1)};
  return p<.5?{...from,opacity:(from.opacity??1)*(1-ease(p*2))}:{...to,opacity:ease((p-.5)*2)};
 }
 const api={chapters,sample,blend};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.WorkshopStudyTimeline=api;
})(typeof window!=='undefined'?window:globalThis);
