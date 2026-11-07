/* A presentation clock over the original DFS/BFS paths. No navigation data or
 * maze geometry is generated here. The existing portfolio RAF supplies dt. */
(function(root){'use strict';
 function createObsidianAutopilot(lengths){let mode='explore',visible=false,paused=false,elapsed=0;const secondsPerCell=.24,startHold=.6,goalHold=1.8;
  const travel=()=>Math.max(1,lengths[mode]-1)*secondsPerCell;
  const cycle=()=>startHold+travel()+goalHold;
  const ratio=()=>Math.max(0,Math.min(1,(elapsed-startHold)/travel()));
  return {update(dt,nextVisible,canRun){if(nextVisible&&!visible){elapsed=0;paused=false;}visible=nextVisible;if(visible&&canRun&&!paused)elapsed=(elapsed+Math.max(0,Math.min(.1,dt)) )%cycle();},setMode(value){if(!Object.hasOwn(lengths,value))return;mode=value;elapsed=0;paused=false;},restart(){elapsed=0;paused=false;},toggle(){paused=!paused;},get visible(){return visible;},get ratio(){return ratio();},get paused(){return paused;},getState(){return {mode,visible,paused,elapsed,ratio:ratio(),secondsPerCell,routeCells:lengths[mode],cycleSeconds:cycle(),phase:elapsed<startHold?'starting':elapsed<startHold+travel()?'moving':'goal'};}};
 }
 if(typeof module!=='undefined'&&module.exports)module.exports=createObsidianAutopilot;else root.createObsidianAutopilot=createObsidianAutopilot;
})(typeof window!=='undefined'?window:globalThis);
