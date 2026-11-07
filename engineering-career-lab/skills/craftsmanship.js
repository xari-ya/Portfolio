/* Skills-only model details. Static parts are merged by the existing batching
 * pass; domain roots and their animated axes remain owned by equipment.js. */
(()=>{'use strict';
 const pcb=[.018,.16,.105],copper=[.35,.27,.095],chip=[.023,.029,.031],gold=[.59,.43,.18];
 function finish(n,rough=.4,metal=.35){n.rough=rough;n.metal=metal;return n;}
 // A continuous insulated lead, sampled from joined cubic curves. Building the
 // tube directly keeps its endpoints connected without changing the room kit.
 function wire(k,parent,controls,radius,color){
  const cache=k.skillsWireMeshes||(k.skillsWireMeshes=new Map()),key=JSON.stringify([controls,radius]);let mesh=cache.get(key);
  if(!mesh){const points=[],vertices=[],indices=[],sides=8,steps=12;
   for(let s=0;s+3<controls.length;s+=3)for(let j=s?1:0;j<=steps;j++){const t=j/steps,u=1-t;points.push([0,1,2].map(a=>u*u*u*controls[s][a]+3*u*u*t*controls[s+1][a]+3*u*t*t*controls[s+2][a]+t*t*t*controls[s+3][a]));}
   const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],unit=a=>{const length=Math.hypot(...a)||1;return a.map(x=>x/length);};
   points.forEach((p,i)=>{const a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],t=unit(b.map((v,j)=>v-a[j])),n=unit(cross(t,Math.abs(t[1])<.9?[0,1,0]:[1,0,0])),v=cross(t,n);for(let j=0;j<sides;j++){const angle=j*Math.PI*2/sides;vertices.push(...p.map((x,a)=>x+radius*(n[a]*Math.cos(angle)+v[a]*Math.sin(angle))));}});
   for(let i=0;i<points.length-1;i++)for(let j=0;j<sides;j++){const a=i*sides+j,b=i*sides+(j+1)%sides,c=a+sides,d=b+sides;indices.push(a,b,c,b,d,c);}
   mesh=k.customMesh(vertices,indices);cache.set(key,mesh);
  }
  return finish(k.mat(parent,mesh,color,[0,0,0],[],'rubber'),.82,.03);
 }
 function label(k,p,w,h,pos,title,sub='',accent='#9ebbb5'){const cache=k.skillsLabels||(k.skillsLabels=new Map()),key=[title,sub,accent,w,h].join('|');if(cache.has(key)){const first=cache.get(key),node=k.mat(p,first.node.geometry,k.C.white,pos,[],'glass',.9);node.s=[w,h,1];node.texture=first.texture;node.texMode=1;return {node};}const result=k.screen(p,w,h,pos,(c,v)=>{c.fillStyle='#101819';c.fillRect(0,0,v.width,v.height);c.fillStyle=accent;c.font='600 27px monospace';c.fillText(title,14,sub?36:53,v.width-28);if(sub){c.fillStyle='#839a9b';c.font='17px monospace';c.fillText(sub,14,65);}},{width:Math.min(1024,Math.max(256,Math.round(80*w/h))),height:80});cache.set(key,result);return result;}
 function board(k,parent,scale=1,{headers=true}={}){const {G,B,R,Y,C}=k,g=G(parent);g.s=[scale,scale,scale];
 R(g,1.20,.035,.85,pcb,[0,.04,0],.026,'paint');
 for(const x of [-.53,.53])for(const z of [-.35,.35]){Y(g,.033,.009,gold,[x,.063,z]);Y(g,.014,.011,C.black,[x,.069,z]);Y(g,.020,.045,gold,[x,.005,z]);}
 for(let i=0;i<20;i++){const x=-.47+i*.049;B(g,.006,.002,.22,i%3?copper:[.08,.29,.18],[x,.059,-.20]);B(g,.006,.002,.17,copper,[x,.059,.23]);}
 R(g,.50,.02,.46,[.025,.12,.085],[.04,.072,-.08],.015,'paint');R(g,.38,.055,.27,[.30,.36,.35],[.04,.103,-.12],.012,'steel');
 for(let i=0;i<7;i++)B(g,.30,.001,.002,[.17,.21,.20],[.04,.132,-.22+i*.028]);
 const mcu=R(g,.22,.045,.18,chip,[-.25,.092,.15],.012,'graphite');finish(mcu,.42,.16);
 for(let i=0;i<8;i++)for(const x of [-.379,-.119])B(g,.033,.007,.009,C.silver,[x,.085,.074+i*.022],'steel');
 if(headers)for(const z of [-.31,.31]){B(g,.82,.04,.055,C.black,[0,.083,z]);for(let i=0;i<16;i++){Y(g,.008,.052,gold,[-.38+i*.05,.13,z]);B(g,.022,.003,.022,C.silver,[-.38+i*.05,.06,z]);}}
 R(g,.17,.07,.14,C.silver,[-.51,.105,0],.012,'steel');B(g,.006,.043,.096,C.black,[-.598,.109,0]);
 for(let i=0;i<12;i++){const x=.31+(i%3)*.09,z=-.18+Math.floor(i/3)*.10;B(g,.052,.018,.030,[.26,.22,.13],[x,.081,z]);for(const dx of [-.025,.025])B(g,.012,.022,.032,C.silver,[x+dx,.082,z]);}
 for(const [x,z]of [[-.42,-.15],[.4,.23]]){Y(g,.035,.09,[.08,.10,.10],[x,.105,z]);B(g,.045,.002,.003,C.silver,[x,.153,z]);}
 label(k,g,.31,.048,[.04,.133,-.12],'ESP32','').node.r[0]=-Math.PI/2;
 return g;}
 function robot(k,parent){const {G,B,R,Y,C}=k,g=G(parent);g.r[1]=-.18;
 // Obsidian's documented differential drive: two N20 wheels, one rear caster.
 R(g,1.20,.055,.95,[.26,.16,.075],[0,.15,0],.035,'paint');
 for(const x of [-.65,.65]){const wheel=G(g,[x,.20,-.16],[0,0,Math.PI/2]);finish(Y(wheel,.225,.15,C.black),.9,.03);Y(wheel,.135,.163,C.darkSteel);Y(wheel,.069,.17,C.silver);for(let i=0;i<16;i++){const a=i*Math.PI/8,t=G(wheel,[Math.cos(a)*.222,0,Math.sin(a)*.222],[0,-a,0]);B(t,.032,.17,.024,[.025,.03,.033],[0,0,0],'rubber');}for(const y of [-.092,.092])Y(wheel,.037,.012,gold,[0,y,0]);}
 for(const x of [-.43,.43]){R(g,.24,.10,.15,[.48,.39,.18],[x,.19,-.16],.015,'steel');B(g,.16,.13,.16,C.steel,[x*.69,.19,-.16],'steel');}
 Y(g,.08,.10,C.silver,[0,.04,.33]);R(g,.19,.05,.18,C.steel,[0,.10,.33],.02,'steel');
 for(const x of [-.43,.43])for(const z of [-.33,.33]){Y(g,.025,.23,gold,[x,.29,z]);Y(g,.036,.013,C.silver,[x,.42,z]);}
 for(const x of [-.14,.14]){Y(g,.105,.62,[.045,.075,.10],[x,.25,.03],[Math.PI/2,0,0],'paint');B(g,.25,.05,.71,C.black,[x,.18,.03]);}
 R(g,1.12,.028,.87,[.025,.08,.075],[0,.43,0],.025,'paint');
 const dev=board(k,g,.45);dev.p=[.16,.43,-.10];
 R(g,.31,.045,.22,C.black,[-.29,.48,.10],.01);k.screen(g,.27,.13,[-.29,.54,.225],(c,v)=>{c.fillStyle='#07202a';c.fillRect(0,0,v.width,v.height);c.fillStyle='#79d5e7';c.font='18px monospace';c.fillText('OBSIDIAN',8,25);c.fillText('NAV / READY',8,49);},{width:180,height:64});
 for(const [x,z,ry]of [[0,-.48,Math.PI],[-.57,.02,-Math.PI/2],[.57,.02,Math.PI/2]]){const sensor=G(g,[x,.30,z],[0,ry,0]);B(sensor,.13,.13,.018,[.17,.08,.24],[0,0,0],'paint');B(sensor,.07,.04,.025,C.black,[0,.025,.018]);Y(sensor,.017,.03,[.2,.29,.32],[0,.025,.034],[Math.PI/2,0,0]);}
 k.cable(g,[[-.28,.47,-.1],[-.4,.57,-.05],[-.46,.38,-.12]],.009,C.red);k.cable(g,[[.16,.51,-.22],[.23,.55,-.3],[.41,.42,-.30]],.007,[.51,.35,.08]);
 return g;}
 function sensor(k,parent){const {G,B,R,Y,C}=k,g=G(parent);
 R(g,1.0,.12,.72,C.graphite,[0,.06,0],.03);const chamber=G(g,[-.35,.12,-.02]);R(chamber,.72,.06,.63,C.darkSteel,[0,.035,0],.02);B(chamber,.66,.12,.57,[.085,.051,.025],[0,.12,0],'rubber');
 for(const x of [-.35,.35])for(const z of [-.30,.30]){B(chamber,.018,.82,.018,C.silver,[x,.47,z],'steel');Y(chamber,.028,.018,C.silver,[x,.90,z]);}
 for(const x of [-.35,.35]){const n=B(chamber,.008,.74,.59,[.22,.38,.40],[x,.48,0],'glass');n.alpha=.065;}
 const back=B(chamber,.70,.74,.008,[.22,.38,.40],[0,.48,-.30],'glass');back.alpha=.04;
 B(chamber,.72,.025,.63,C.steel,[0,.88,0],'steel');B(chamber,.62,.009,.022,[1,.78,.52],[0,.86,.24],'light',.7);buildLabPlant(k,chamber,[0,.17,0],.36);
 for(const x of [-.23,.17]){B(chamber,.025,.32,.012,C.silver,[x,.31,.12],'steel');B(chamber,.06,.11,.025,[.04,.17,.15],[x,.45,.12],'paint');}
 const controller=G(g,[.47,.31,.05]);R(controller,.42,.48,.18,[.36,.37,.32],[0,0,0],.035,'paint');B(controller,.34,.40,.015,C.graphite,[0,.01,.10]);k.screen(controller,.29,.16,[0,.09,.112],(c,v)=>{c.fillStyle='#0a2022';c.fillRect(0,0,v.width,v.height);c.fillStyle='#82d3b7';c.font='24px monospace';c.fillText('28.4 °C',12,30);c.font='13px monospace';c.fillText('DEMO / TERRAVITA',12,52);},{width:250,height:70});for(const x of [-.10,0,.10])Y(controller,.022,.02,x?C.black:C.red,[x,-.1,.117],[Math.PI/2,0,0]);
 k.cable(g,[[.41,.18,.18],[.38,.13,.39],[-.55,.13,.39],[-.55,.5,.1]],.011,C.red);
 return g;}
 function scopeFace(k,root){const {B,Y,C}=k;label(k,root,1.28,.065,[0,.346,.353],'DIGITAL STORAGE OSCILLOSCOPE','', '#bdd0ca');
 for(const x of [-.66,.69])for(const y of [-.32,.34])Y(root,.016,.012,C.silver,[x,y,.36],[Math.PI/2,0,0]);
 for(const x of [.33,.58])for(const y of [-.10,.12,.29]){Y(root,.018,.005,C.black,[x,y,.415],[Math.PI/2,0,0]);B(root,.006,.027,.006,C.ivory,[x,y+.028,.412]);}
 for(let i=0;i<9;i++)B(root,.026,.012,.008,i===2?C.mint:C.steel,[.29+(i%3)*.13,-.22-Math.floor(i/3)*.04,.363],i===2?'light':'paint',i===2?.5:0);
 label(k,root,.33,.044,[.48,-.18,.366],'TRIGGER / LEVEL');label(k,root,.76,.039,[-.20,-.235,.384],'CH 1     CH 2     EXT');
 }
 window.SkillsCraft={board,robot,sensor,label,scopeFace,finish,wire};
})();
