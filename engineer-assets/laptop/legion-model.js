/* Final V4 supplied Lenovo Legion geometry. Only the renderer adapter is new.
 * Original supplied mesh construction, decals and materials are retained in
 * ./final-v4-source/. No showcase camera, lid/RGB controls or WebGL context. */
window.createSuppliedLegionModel=function({upload,texture,engineeringScreen}){
 const norm=a=>{let l=Math.hypot(...a)||1;return a.map(v=>v/l)},sub=(a,b)=>a.map((x,i)=>x-b[i]),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const hex=(s)=>{s=s.replace('#','');return [0,2,4].map(i=>parseInt(s.slice(i,i+2),16)/255);};
  const paint={shell:hex('#1a1d23'),top:hex('#292d35'),bottom:hex('#0e1116'),rim:hex('#444852'),slot:hex('#080b11'),inner:hex('#171c25'),key:hex('#171b24'),keyedge:hex('#3b4050'),silver:hex('#a2a7ae'),soft:hex('#666c79'),rgbpink:hex('#fa2b87'),rgborange:hex('#e3a34a'),rgbgreen:hex('#5fe29b'),rgbcyan:hex('#36c6ed'),rgbviolet:hex('#aa66ff')};
  const smooth=(a,b,t)=>a.map((v,i)=>v*(1-t)+b[i]*t);
  function rgbColor(x){const v=Math.max(0,Math.min(3.999,(x+1.62)/3.27*4)),i=Math.floor(v),t=v-i;return smooth([paint.rgbpink,paint.rgborange,paint.rgbgreen,paint.rgbcyan,paint.rgbviolet][i],[paint.rgbpink,paint.rgborange,paint.rgbgreen,paint.rgbcyan,paint.rgbviolet][i+1],t);}

  class Builder{
    constructor(){this.vertices=[];this.count=0;}
    tri(a,b,c,color,uvA=[0,0],uvB=[1,0],uvC=[1,1],normal=null){let n=normal||norm(cross(sub(b,a),sub(c,a)));for(const [v,uv] of [[a,uvA],[b,uvB],[c,uvC]])this.vertices.push(...v,...n,...color,...uv);this.count+=3;}
    quad(a,b,c,d,color,uv=[[0,0],[1,0],[1,1],[0,1]],n=null){this.tri(a,b,c,color,uv[0],uv[1],uv[2],n);this.tri(a,c,d,color,uv[0],uv[2],uv[3],n);}
    box(cx,cy,cz,w,h,d,col){const x=cx-w/2,X=cx+w/2,y=cy-h/2,Y=cy+h/2,z=cz-d/2,Z=cz+d/2;
      this.quad([x,Y,z],[x,Y,Z],[X,Y,Z],[X,Y,z],col,undefined,[0,1,0]);
      this.quad([x,y,Z],[x,y,z],[X,y,z],[X,y,Z],col,undefined,[0,-1,0]);
      this.quad([x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z],col,undefined,[0,0,1]);
      this.quad([X,y,z],[x,y,z],[x,Y,z],[X,Y,z],col,undefined,[0,0,-1]);
      this.quad([x,y,z],[x,y,Z],[x,Y,Z],[x,Y,z],col,undefined,[-1,0,0]);
      this.quad([X,y,Z],[X,y,z],[X,Y,z],[X,Y,Z],col,undefined,[1,0,0]);
    }
    roundedXZ(cx,yTop,cz,w,d,th,r,col,bevel=.012){const pts=[];r=Math.min(r,w/2,d/2);
      const corners=[[w/2-r,d/2-r,0],[-w/2+r,d/2-r,90],[-w/2+r,-d/2+r,180],[w/2-r,-d/2+r,270]];
      for(const [px,pz,a] of corners)for(let k=0;k<=5;k++){let theta=(a+(k/5)*90)*Math.PI/180;pts.push([cx+px+r*Math.cos(theta),cz+pz+r*Math.sin(theta)]);}
      const inset=Math.min(bevel,th*.32),layers=[[yTop,inset],[yTop-inset,0],[yTop-th+inset,0],[yTop-th,inset]];
      const map=(point,layer)=>{let [yy,ins]=layer;let x=point[0],z=point[1];return [x+(cx-x)*ins/(Math.max(w,d)*.5),yy,z+(cz-z)*ins/(Math.max(w,d)*.5)];};
      for(let i=0;i<pts.length;i++){
        let next=(i+1)%pts.length;
        this.tri([cx,yTop,cz],map(pts[next],layers[0]),map(pts[i],layers[0]),col,[.5,.5],[1,1],[0,1],[0,1,0]);
        this.tri([cx,yTop-th,cz],map(pts[i],layers[3]),map(pts[next],layers[3]),col,[.5,.5],[0,1],[1,1],[0,-1,0]);
        for(let j=0;j<3;j++){let a=map(pts[i],layers[j]),b=map(pts[next],layers[j]),c=map(pts[next],layers[j+1]),d2=map(pts[i],layers[j+1]);
          let edge=norm([pts[i][0]+pts[next][0]-cx*2,0,pts[i][1]+pts[next][1]-cz*2]);
          this.quad(a,b,c,d2,col,undefined,edge);
        }
      }
    }
    // For textured top-down decals. Canvas image top corresponds to -Z.
    planeXZ(x1,x2,y,zBack,zFront,col=[1,1,1]){this.quad([x1,y,zBack],[x1,y,zFront],[x2,y,zFront],[x2,y,zBack],col,[[0,1],[0,0],[1,0],[1,1]],[0,1,0]);}
    // For textured screen and front bezel; canvas image top corresponds to high Y.
    planeXY(x1,x2,yBottom,yTop,z,col=[1,1,1]){this.quad([x1,yBottom,z],[x2,yBottom,z],[x2,yTop,z],[x1,yTop,z],col,[[0,0],[1,0],[1,1],[0,1]],[0,0,1]);}
    ringXZ(x,y,z,outer,inner,segments,col){let n=segments||48;for(let i=0;i<n;i++){let a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n;this.quad([x+Math.cos(a)*inner,y,z+Math.sin(a)*inner],[x+Math.cos(b)*inner,y,z+Math.sin(b)*inner],[x+Math.cos(b)*outer,y,z+Math.sin(b)*outer],[x+Math.cos(a)*outer,y,z+Math.sin(a)*outer],col,undefined,[0,1,0]);}}
    cylinderX(cx,cy,cz,length,r,col,segments=14){for(let i=0;i<segments;i++){let a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments;let pa=[cy+Math.cos(a)*r,cz+Math.sin(a)*r],pb=[cy+Math.cos(b)*r,cz+Math.sin(b)*r];this.quad([cx-length/2,...pa],[cx+length/2,...pa],[cx+length/2,...pb],[cx-length/2,...pb],col);}}
    hexXZ(x,y,z,w,d,col){let a=[];for(let i=0;i<6;i++){let theta=i*Math.PI/3;a.push([x+Math.cos(theta)*w*.5,y,z+Math.sin(theta)*d*.5]);}for(let i=0;i<6;i++)this.tri([x,y,z],a[i],a[(i+1)%6],col,[0,0],[1,0],[1,1],[0,-1,0]);}
    // Closed arbitrary polygons and corresponding polygon-ring frames.
    polygonXY(points,z,color){let c=points.reduce((a,p)=>[a[0]+p[0]/points.length,a[1]+p[1]/points.length],[0,0]);for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];this.tri([c[0],c[1],z],[a[0],a[1],z],[b[0],b[1],z],color,[.5,.5],[0,0],[1,1],[0,0,-1]);}}
    frameXY(outer,inner,z,color){for(let i=0;i<outer.length;i++){const j=(i+1)%outer.length;this.quad([outer[i][0],outer[i][1],z],[outer[j][0],outer[j][1],z],[inner[j][0],inner[j][1],z],[inner[i][0],inner[i][1],z],color,undefined,[0,0,-1]);}}
    polygonYZ(x,points,col){let cy=0,cz=0;for(const p of points){cy+=p[0]/points.length;cz+=p[1]/points.length;}for(let i=0;i<points.length;i++){let a=points[i],b=points[(i+1)%points.length];this.tri([x,cy,cz],[x,...a],[x,...b],col,[.5,.5],[0,0],[1,1],[x>0?1:-1,0,0]);}}
    frameYZ(x,outer,inner,col){for(let i=0;i<outer.length;i++){const j=(i+1)%outer.length;this.quad([x,...outer[i]],[x,...outer[j]],[x,...inner[j]],[x,...inner[i]],col,undefined,[x>0?1:-1,0,0]);}}
  }
  const mesh=(builder,opts={})=>upload(new Float32Array(builder.vertices),opts);
  const base=[],lid=[],effects=[];
  const make=(set,build,opts={})=>{let b=new Builder();build(b);
    // Local offset applies only to selected subassemblies; meshes remain unchanged otherwise.
    if(opts.offsetY)for(let i=1;i<b.vertices.length;i+=11)b.vertices[i]+=opts.offsetY;
    if(b.count)set.push(mesh(b,opts));};
  const fromCanvas=texture;
  const artCanvas=(w,h)=>{let c=document.createElement('canvas');c.width=w;c.height=h;return [c,c.getContext('2d')];};

  // ===== SCREEN: original procedural backdrop, no external bitmap files =====
  function screenTexture(){let [c,ctx]=artCanvas(1200,750),w=c.width,h=c.height;
    let sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#060b26');sky.addColorStop(.42,'#0e1746');sky.addColorStop(.63,'#19265b');sky.addColorStop(.78,'#060d22');sky.addColorStop(1,'#02070e');ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    // luminous horizon
    let glow=ctx.createRadialGradient(590,485,12,590,485,680);glow.addColorStop(0,'#e0598e75');glow.addColorStop(.18,'#515cce54');glow.addColorStop(.55,'#20206b16');glow.addColorStop(1,'#02030a00');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    let seed=13;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    for(let i=0;i<240;i++){let x=rand()*w,y=rand()*h*.69,s=.3+rand()*1.1;ctx.fillStyle=`rgba(205,222,255,${.07+rand()*.55})`;ctx.fillRect(x,y,s,s);}
    // cloud layers, deep atmospheric lightning
    for(let j=0;j<16;j++){ctx.beginPath();let y=295+rand()*205;ctx.moveTo(-30,y);for(let x=0;x<1240;x+=47)ctx.lineTo(x,y+(rand()-.5)*100);ctx.strokeStyle=`rgba(${70+Math.floor(rand()*120)}, ${75+Math.floor(rand()*40)},255,${.028+rand()*.06})`;ctx.lineWidth=18+rand()*42;ctx.stroke();}
    // architectural gothic / sci-fi peaks
    for(let layer=0;layer<3;layer++){let y0=562+layer*65;ctx.fillStyle=['#071026','#060d1d','#030910'][layer];ctx.beginPath();ctx.moveTo(0,h);ctx.lineTo(0,y0);for(let x=0;x<w+20;x+=19+rand()*26){let peak=y0-(rand()*120+15)*(1-layer*.15);ctx.lineTo(x,y0);ctx.lineTo(x+10,peak);ctx.lineTo(x+22,y0);}ctx.lineTo(w,h);ctx.fill();}
    // main central monolithic tower
    ctx.fillStyle='#050b18';ctx.beginPath();ctx.moveTo(535,680);ctx.lineTo(547,405);ctx.lineTo(557,405);ctx.lineTo(569,342);ctx.lineTo(580,400);ctx.lineTo(612,400);ctx.lineTo(630,680);ctx.fill();ctx.fillRect(578,352,4,30);
    ctx.fillStyle='#5ae1fc';for(let i=0;i<15;i++){let xx=551+(i%3)*19,yy=435+Math.floor(i/3)*42;ctx.fillRect(xx,yy,2,12);}
    // angular red light horizon and electric arcs
    let horizon=ctx.createLinearGradient(0,470,w,530);horizon.addColorStop(0,'#415ce7');horizon.addColorStop(.4,'#ed6eae');horizon.addColorStop(.8,'#c847d5');horizon.addColorStop(1,'#2947e8');ctx.strokeStyle=horizon;ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,510);for(let x=0;x<w;x+=34)ctx.lineTo(x,486+Math.sin(x*.014)*18+(rand()-.5)*11);ctx.stroke();
    function bolt(x,y,len){let px=x,py=y;ctx.beginPath();ctx.moveTo(px,py);for(let k=0;k<11;k++){px+=(rand()-.5)*33;py+=len/11;ctx.lineTo(px,py);}ctx.strokeStyle='#90a3ff';ctx.lineWidth=1.2;ctx.shadowColor='#658bff';ctx.shadowBlur=21;ctx.stroke();ctx.shadowBlur=0;}
    bolt(300,180,380);bolt(880,210,290);bolt(1020,318,200);
    let fog=ctx.createLinearGradient(0,500,0,h);fog.addColorStop(0,'#824ca722');fog.addColorStop(1,'#02050e');ctx.fillStyle=fog;ctx.fillRect(0,500,w,250);
    ctx.save();ctx.translate(995,117);ctx.strokeStyle='#eeeaf4';ctx.lineWidth=11;ctx.lineCap='square';ctx.beginPath();ctx.arc(0,0,45,.35,Math.PI*1.68);ctx.stroke();ctx.rotate(-.3);ctx.fillStyle='#f6f5fb';ctx.fillRect(3,-52,21,13);ctx.restore();
    ctx.fillStyle='#e9ebff';ctx.font='bold 17px Arial';ctx.textAlign='right';ctx.fillText('LEGION',1085,695);
    // subtle scanline texture
    ctx.fillStyle='#00000013';for(let y=0;y<h;y+=5)ctx.fillRect(0,y,w,1);
    return fromCanvas(c);
  }
  // Pixel-safe padded decals: the full LEGION wordmark is visible, including both ends.
  function logoTexture(){
    let [c,g]=artCanvas(1024,320);g.clearRect(0,0,c.width,c.height);
    g.textAlign='center';g.textBaseline='middle';g.font='900 162px Arial Black,Arial,sans-serif';
    g.fillStyle='#92969d';g.fillText('LEGION',512,166,785);
    // Deliberate dual-tone reflection within the stylized O.
    g.globalAlpha=.16;let gr=g.createLinearGradient(0,90,0,238);gr.addColorStop(0,'#c4c7cf');gr.addColorStop(1,'#252b34');g.fillStyle=gr;g.fillRect(110,92,805,8);g.globalAlpha=1;
    return fromCanvas(c);
  }
  function stripTexture(){let [c,g]=artCanvas(530,144);g.font='bold 61px Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#a7acb4';g.fillText('LEGION',265,76,400);return fromCanvas(c);}
  // The rear-center wordmark is printed on an inset metal panel, not on a tiny
  // 26-mm-high (model units) ribbon. Preserve its proportions and contrast.
  function backLenovo(){
    const [c,g]=artCanvas(640,140);
    g.clearRect(0,0,c.width,c.height);
    g.textBaseline='middle';g.textAlign='center';
    g.font='bold 99px Arial,sans-serif';
    g.shadowColor='#b6c6db';g.shadowBlur=4;
    const sheen=g.createLinearGradient(0,30,0,116);
    sheen.addColorStop(0,'#f6f7f9');sheen.addColorStop(.46,'#d8dde4');sheen.addColorStop(1,'#a3abb8');
    g.fillStyle=sheen;g.fillText('Lenovo',320,73,565);
    g.shadowBlur=0;
    return fromCanvas(c);
  }
  function sticker(type){let [c,g]=artCanvas(512,512);g.clearRect(0,0,512,512);
    const rr=(x,y,w,h,r,color)=>{g.fillStyle=color;g.beginPath();g.roundRect(x,y,w,h,r);g.fill();};
    if(type==='nvidia'){
      rr(8,8,496,496,20,'#080c0c');rr(8,8,496,111,18,'#79bf27');
      g.fillStyle='#0a1b06';g.font='900 65px Arial Black,Arial,sans-serif';g.textAlign='center';g.fillText('NVIDIA',256,87);
      g.fillStyle='#fff';g.font='bold 79px Arial,sans-serif';g.fillText('GEFORCE',256,265);g.font='900 154px Arial Black,Arial,sans-serif';g.fillText('RTX',256,410);
      rr(35,473,442,9,4,'#85c72e');
    }else if(type==='intel'){
      let grad=g.createLinearGradient(0,0,512,512);grad.addColorStop(0,'#0860b4');grad.addColorStop(.48,'#003f93');grad.addColorStop(1,'#062a67');rr(8,8,496,496,23,grad);
      g.strokeStyle='#53dcfb';g.lineWidth=10;g.strokeRect(27,27,458,458);
      g.fillStyle='white';g.textAlign='left';g.font='bold 94px Arial,sans-serif';g.fillText('intel',65,145);g.font='900 120px Arial,sans-serif';g.fillText('CORE',64,310);g.font='bold 109px Arial,sans-serif';g.fillText('ULTRA',60,423);

    }
    return fromCanvas(c);
  }

  // ===== BASE BODY: actual 364.38 x 268.06 mm plan proportions =====
  make(base,b=>{b.roundedXZ(0,.237,0,3.644,2.681,.209,.055,paint.bottom,.023);b.roundedXZ(0,.267,-.001,3.634,2.669,.041,.05,paint.top,.017);});
  make(base,b=>{ // subtle side ridge, keyboard recess, palm-rest grain surfaces
    b.roundedXZ(0,.270,-.003,3.575,2.623,.007,.045,hex('#2d323a'),.003);
    b.roundedXZ(-.015,.274,-.338,3.39,1.40,.005,.027,paint.inner,.003);
    b.roundedXZ(-.333,.275,.872,1.23,.782,.006,.039,hex('#0e121a'),.003);
    b.roundedXZ(-.333,.278,.872,1.197,.746,.004,.027,hex('#292e37'),.002);
    b.box(0,.265,1.286,3.21,.006,.008,hex('#40444c'));
    // border/ridge along rear chassis + port ridge
    b.box(0,.261,-1.270,3.38,.018,.074,hex('#171c24'));
    // front brushed aluminum line
    b.box(0,.199,1.337,3.40,.003,.005,hex('#6b707b'));

  });
  // Bottom cooling grilles and rubber feet visible on underside.
  make(base,b=>{
    for (let side of [-1,1]) for(let row=0;row<7;row++)for(let col=0;col<12;col++){
      let x=side*(.53+col*.092),z=-.94+row*.126+(col%2)*.045;
      if(Math.abs(x)<1.70)b.hexXZ(x,.024,z,.071,.077,hex('#05080c'));
    }
    for(let side of [-1,1]){b.roundedXZ(side*1.32,.018,1.02,.61,.071,.035,.017,hex('#070a0f'),.006);b.roundedXZ(side*1.32,.018,-1.08,.56,.065,.034,.016,hex('#070a0f'),.005);}
    b.roundedXZ(0,.024,.52,.80,.34,.009,.015,hex('#151920'),.002);
  });
  // Fine real mesh detail on the underside: screws, long rear rubber strip and speaker perforations.
  make(base,b=>{
    for(let x of [-1.55,-.78,.78,1.55])for(let z of [-1.18,1.18]){
      b.ringXZ(x,.023,z,.017,.012,18,hex('#737782'));
      b.box(x,.024,z,.015,.002,.003,hex('#090b0f'));
    }
    for(const side of [-1,1])for(let i=0;i<10;i++){
      b.box(side*1.60,.024,.52+i*.051,.053,.002,.010,hex('#04070a'));
    }
    b.roundedXZ(0,.021,-1.200,2.83,.060,.013,.014,hex('#090b10'),.003);
  });
  // ===== 2025/26 16IAX10 REAR THERMAL DIFFUSER =====
  // V3 upper edge max Y was 0.325, while the deck is at Y=0.270.
  // Lower the entire diffuser including fins, frame and badge in one piece:
  // 0.325 - 0.056 = 0.269, level with the chassis top without changing its detailing.
  const REAR_GRILLE_DROP=-.056;
  // Rear is EXHAUST ONLY. Nothing resembling a power/HDMI/USB port belongs here.
  // Twin long, bevelled hexagonal diffuser mouths, ribbed central bridge and sharply chamfered end caps.
  make(base,b=>{
    b.box(0,.235,-1.372,3.613,.147,.110,hex('#161a22'));
    b.box(0,.319,-1.351,3.548,.012,.052,hex('#4c505a'));
    b.box(0,.319,-1.416,3.612,.006,.007,hex('#646971'));
    b.box(0,.149,-1.412,3.59,.018,.016,hex('#242831'));
    // Angular outer end plates rise into the faceted diffuser.
    for(const side of [-1,1]){
      b.box(side*1.780,.237,-1.429,.083,.117,.035,hex('#252b32'));
      b.box(side*1.802,.237,-1.441,.018,.060,.014,hex('#3c414b'));
      b.box(side*1.705,.317,-1.420,.170,.011,.012,hex('#72757b'));
    }
  },{offsetY:REAR_GRILLE_DROP});
  function octVent(a,b){const bot=.162,top=.307,cut=.072;return [[a+cut,top],[b-cut,top],[b,top-.054],[b,bot+.049],[b-cut,bot],[a+cut,bot],[a,bot+.049],[a,top-.054]];}
  function insetOct(a,b,v){const bot=.162+v,top=.307-v,cut=.082;return [[a+cut+v,top],[b-cut-v,top],[b-v,top-.050],[b-v,bot+.046],[b-cut-v,bot],[a+cut+v,bot],[a+v,bot+.047],[a+v,top-.050]];}
  make(base,b=>{
    for (const [a,z] of [[-1.785,-.330],[.330,1.785]]){
      let outer=octVent(a,z),sub=insetOct(a,z,.020),cavity=insetOct(a,z,.038);
      b.polygonXY(outer,-1.429,hex('#424650')); // narrow metallic surround
      b.polygonXY(sub,-1.435,hex('#090c11'));   // recessed dark intake volume
      b.frameXY(outer,sub,-1.454,hex('#6b6e75')); // crisp chamfer/trim
      b.frameXY(sub,cavity,-1.455,hex('#242930'));
      for(let i=0;i<23;i++){
        let x=a+.114+i*((z-a-.228)/22),y0=.188,y1=.284;
        b.box(x,(y0+y1)/2,-1.445,.018,y1-y0,.014,hex(i%4===0?'#484f59':'#2e353e'));
        // crossbar on the inner fins for authentic grille depth
        b.box(x,.213,-1.452,.016,.005,.006,hex('#11151b'));
      }
      // interior horizontal beam and polished upper/lower vent lips
      b.box((a+z)/2,.180,-1.450,z-a-.20,.006,.009,hex('#50555f'));
      b.box((a+z)/2,.293,-1.449,z-a-.20,.004,.008,hex('#5c626d'));
    }
    // Central thermal-deflector segment is NOT a row of connectors.
    b.box(0,.239,-1.429,.665,.150,.028,hex('#20252d'));
    b.box(0,.286,-1.454,.590,.010,.012,hex('#50555d'));
    // Keep the three lower diffuser channels. The upper strip is reserved
    // for the readable Lenovo wordmark, with no grille cutting through it.
    for(let k=0;k<3;k++){
      b.box(0,.181+k*.023,-1.454,.558,.010,.013,hex('#080c12'));
      b.box(0,.178+k*.023,-1.464,.536,.003,.006,hex('#48505b'));
    }
    // Recessed center identification plate, inset within the thermal bridge.
    b.box(0,.277,-1.465,.447,.076,.008,hex('#10151b'));
    b.box(0,.316,-1.466,.446,.003,.008,hex('#454c58'));
    b.box(0,.238,-1.467,.446,.003,.008,hex('#3e4652'));
    for(const x of [-.327,.327]){
      b.box(x,.240,-1.446,.027,.146,.017,hex('#454a53'));
      b.box(x,.297,-1.461,.018,.028,.012,hex('#6c7178'));
    }
    // The 16IAX10 exterior side walls are solid; exhaust outlets are rear-only.
  },{offsetY:REAR_GRILLE_DROP});
  const lenovoBack=backLenovo();
  // Printed face of the rear center badge; its surface is almost coplanar
  // with the metal plate and faces the rear-camera view (-Z).
  make(base,b=>b.quad([-.212,.243,-1.4695],[.212,.243,-1.4695],[.212,.312,-1.4695],[-.212,.312,-1.4695],[1,1,1],[[1,0],[0,0],[0,1],[1,1]],[0,0,-1]),{texture:lenovoBack,unlit:true,offsetY:REAR_GRILLE_DROP});

  // ===== REAL SIDE CONNECTORS, 16IAX10 location map =====
  // Left (-X): slim power, HDMI 2.1, USB-C PD, TB4, always-on USB-A.
  // Right (+X): RJ45, camera e-shutter, 2 x USB-A, 3.5 mm audio.
  const sideLabels=[];
  function putSidePort(side,kind,z){
    let hw,hh,cy=.169;
    if(kind==='power'){hw=.091;hh=.032;}
    else if(kind==='HDMI'){hw=.103;hh=.031;}
    else if(kind==='USB-A'){hw=.071;hh=.029;}
    else if(kind==='USB-C'){hw=.065;hh=.018;}
    else if(kind==='RJ45'){hw=.107;hh=.050;cy=.171;}
    else if(kind==='audio'){hw=.029;hh=.029;}
    if(kind==='audio'){
      const N=28,pts=[];for(let i=0;i<N;i++){let a=2*Math.PI*i/N;pts.push([cy+Math.cos(a)*hh,z+Math.sin(a)*hw]);}
      const inPts=pts.map(([y,zv])=>[cy+(y-cy)*.70,z+(zv-z)*.70]);
      const metal=pts.map(([y,zv])=>[cy+(y-cy)*1.22,z+(zv-z)*1.22]);
      for(const at of [side*1.837]){make(base,b=>{b.polygonYZ(at,metal,hex('#4b515b'));b.polygonYZ(at+side*.007,pts,hex('#06080d'));b.frameYZ(at+side*.009,metal,pts,hex('#7a808a'));b.polygonYZ(at+side*.013,inPts,hex('#020408'));});}
      return;
    }
    function rect(scale=1){let w=hw*scale,h=hh*scale;return [[cy-h,z-w],[cy-h,z+w],[cy+h,z+w],[cy+h,z-w]];}
    function hdmi(scale=1){let w=hw*scale,h=hh*scale;return [[cy-h*.70,z-w*.80],[cy-h,z-w*.61],[cy-h,z+w*.61],[cy-h*.70,z+w*.80],[cy+h,z+w],[cy+h,z-w]];}
    function rj(scale=1){let w=hw*scale,h=hh*scale;return [[cy-h,z-w],[cy-h,z+w],[cy+h*.33,z+w],[cy+h,z+w*.62],[cy+h,z-w*.62],[cy+h*.33,z-w]];}
    function usbC(scale=1){let w=hw*scale,h=hh*scale;return [[cy-h*.65,z-w*.81],[cy-h,z-w*.64],[cy-h,z+w*.64],[cy-h*.65,z+w*.81],[cy+h*.65,z+w*.81],[cy+h,z+w*.64],[cy+h,z-w*.64],[cy+h*.65,z-w*.81]];}
    let fn=kind==='HDMI'?hdmi:kind==='RJ45'?rj:kind==='USB-C'?usbC:rect;
    let rim=fn(1.21),inner=fn(1.0),black=fn(.83);
    make(base,b=>{
      let x=side*1.838;
      b.polygonYZ(x,rim,hex('#626a74'));
      b.frameYZ(x+side*.006,rim,inner,hex('#89909a'));
      b.polygonYZ(x+side*.009,inner,hex('#030509'));
      b.polygonYZ(x+side*.014,black,hex('#080c12'));
      if(kind==='USB-A'){
        // Recessed inner metal cage and connector tongue.
        b.box(x+side*.018,cy-.008,z,.007,.009,hw*1.06,hex('#c1b9a5'));
        b.box(x+side*.020,cy+.004,z,.007,.007,hw*.94,hex('#1b2437'));
      }else if(kind==='USB-C'){
        b.box(x+side*.017,cy,z,.006,.005,hw*1.1,hex('#5c6777'));
      }else if(kind==='HDMI'){
        b.box(x+side*.017,cy-.008,z,.007,.006,hw*1.19,hex('#777a7f'));
      }else if(kind==='power'){
        b.box(x+side*.021,cy,z,.005,.032,.018,hex('#d5c46d'));
      }else if(kind==='RJ45'){
        for(let i=-3;i<=3;i++)b.box(x+side*.019,cy+.004,z+i*.016,.006,.006,.008,hex('#ae9c5c'));
      }
    });
  }
  [-1].forEach(side=>{
    putSidePort(side,'power',-.69);
    putSidePort(side,'HDMI',-.415);
    putSidePort(side,'USB-C',-.133);
    putSidePort(side,'USB-C',.107);
    putSidePort(side,'USB-A',.402);
  });
  [1].forEach(side=>{
    putSidePort(side,'RJ45',-.644);
    putSidePort(side,'USB-A',-.215);
    putSidePort(side,'USB-A',.089);
    putSidePort(side,'audio',.470);
    // Physical sliding e-shutter switch, with engraved symbol nearby.
    make(base,b=>{
      b.box(1.839,.237,-.415,.010,.021,.102,hex('#080b10'));
      b.box(1.846,.241,-.434,.017,.025,.042,hex('#707783'));
      b.box(1.855,.244,-.429,.004,.011,.023,hex('#b6c0c8'));
    });
  });
  // Shallow vertical machining reliefs on the upper sidewalls.
  make(base,b=>{
    for(let side of [-1,1]){
      b.box(side*1.819,.259,.535,.008,.005,.36,hex('#535963'));
      b.box(side*1.819,.103,.680,.009,.004,.69,hex('#343941'));
    }
  });

  // ===== PALMREST BADGES: only Intel Core Ultra and NVIDIA GeForce RTX =====
  const rtxBadge=sticker('nvidia'),intelBadge=sticker('intel');
  make(base,b=>b.planeXZ(1.077,1.306,.288,1.002,1.238),{texture:rtxBadge,unlit:true});
  make(base,b=>b.planeXZ(1.330,1.575,.288,1.002,1.238),{texture:intelBadge,unlit:true});
  // Hinge mounts and circular power key.
  // The open lid's frontmost lower edge used to cross the rear lip of the
  // power-button ring. Shift the hinge back 0.052 and the key forward 0.045
  // model units, preserving physical separation at typical 90°–125° openings.
  make(base,b=>{
    for(const x of [-1.40,1.40]){
      b.cylinderX(x,.280,-1.230,.35,.078,hex('#0b1018'));
      b.cylinderX(x,.280,-1.230,.29,.055,hex('#41454f'));
    }
    b.ringXZ(0,.294,-1.080,.077,.055,48,hex('#c7d9eb'));
    b.ringXZ(0,.296,-1.080,.053,.040,40,hex('#222833'));
    b.roundedXZ(0,.297,-1.080,.066,.053,.004,.021,hex('#1b202a'),.002);
    b.box(-1.555,.277,1.139,.22,.002,.004,hex('#575d66'));
  });

  // ===== KEYBOARD: individually modeled keys, large Enter/Shift/Space, arrows, numpad =====
  const keys=[];let keyMeshCount=0;
  const pitch=.167, gap=.020;
  function key(x,z,units,label){const w=units*pitch-gap;keys.push({x:x+units*pitch/2,z,w,d:.149,label});}
  function row(labels,z,x=-1.617){for(const [label,u] of labels){key(x,z,u,label);x+=u*pitch;}}
  const one=t=>t.map(s=>[s,1]);
  row(one(['Esc','F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','Prt','Del']),-.894);
  row([['`',1],...one('1234567890-='.split('')),['⌫',1.65]],-.685);
  row([['Tab',1.44],...one('QWERTYUIOP[]'.split('')),['\\',1.47]],-.477);
  row([['Caps',1.75],...one('ASDFGHJKL;\''.split('')),['Enter',2.06]],-.268);
  row([['Shift',2.15],...one('ZXCVBNM,./'.split('')),['Shift',2.67]],-.059);
  row([['Ctrl',1.30],['Fn',1.02],['Win',1.03],['Alt',1.05],['',5.09],['Alt',1.05],['Cop',1.03],['Ctrl',1.30]],.149);
  // A well-spaced full number pad.
  const numX=.928;
  for(let r=0;r<5;r++){
    const labels=[['Num','/','*','-'],['7','8','9','+'],['4','5','6','+'],['1','2','3','↵'],['0','0','.','↵']][r];
    labels.forEach((text,c)=>{if((r===2&&c===3)||(r===4&&c===1)||(r===4&&c===3))return;let z=-.685+r*.209;let w=(r===4&&c===0)?1.99:1;key(numX+c*pitch,z,w,text);});
  }
  // Arrow cluster below the main keyboard at right of space row.
  for(const [x,z,label] of [[.532,.149,'◄'],[.699,.149,'▼'],[.866,.149,'►'],[.699,-.059,'▲']])key(x-pitch/2,z,1,label);
  make(base,b=>{for(const k of keys)b.roundedXZ(k.x,.302,k.z,k.w+.017,k.d+.014,.025,.013,rgbColor(k.x),.006);},{rgb:true,unlit:true,alpha:.73,emissive:.21});
  make(base,b=>{for(const k of keys)b.roundedXZ(k.x,.316,k.z,k.w,k.d,.024,.012,paint.key,.007);});
  make(base,b=>{for(const k of keys)b.roundedXZ(k.x,.321,k.z,k.w-.008,k.d-.008,.004,.009,hex('#272b34'),.002);});
  function keyboardTexture(){let [c,g]=artCanvas(1500,580);let xMin=-1.727,xMax=1.733,zMin=-.999,zMax=.333;
    for(const k of keys){if(!k.label)continue;let x=(k.x-xMin)/(xMax-xMin)*c.width,z=(k.z-zMin)/(zMax-zMin)*c.height;
      g.textBaseline='middle';g.textAlign='center';let size=k.label.length>3?14:k.label.length>1?17:24;g.font=`${size}px Arial,sans-serif`;
      let [r,gg,b]=rgbColor(k.x).map(v=>Math.round(v*210));g.fillStyle=`rgba(${r+27},${gg+27},${b+27},0.93)`;g.shadowColor=`rgba(${r},${gg},${b},.35)`;g.shadowBlur=6;g.fillText(k.label,x,z+2);g.shadowBlur=0;
    }
    return fromCanvas(c);
  }
  const kTex=keyboardTexture();
  make(base,b=>b.planeXZ(-1.727,1.733,.324,-.999,.333),{texture:kTex,unlit:true,rgb:true,emissive:.28});

  // ===== LCD HOUSING: screen is a pivoting physical assembly, not a billboard =====
  make(lid,b=>{
    b.roundedXZ(0,.019,-.030,0.04,.06,.015,.01,paint.bottom,.004); // miniature hinge join
    b.box(0,1.241,-.026,3.590,2.426,.076,paint.shell);
    b.box(0,1.243,.015,3.555,2.397,.018,hex('#11141b'));
    // brushed outer vertical edge catching highlights
    b.box(-1.786,1.234,.010,.011,2.315,.051,hex('#464b53'));
    b.box(1.786,1.234,.010,.011,2.315,.051,hex('#464b53'));
    b.box(0,2.457,-.028,.720,.038,.084,hex('#2b303a'));
    b.box(0,2.477,-.028,.495,.009,.058,hex('#494e58'));
    b.box(0,.040,-.028,3.55,.022,.050,hex('#2a2e37'));
    // near screen thin inner bezel, lower bezel with wordmark and webcam
    b.box(0,1.287,.031,3.464,2.186,.007,hex('#07080e'));
    b.box(0,.160,.035,3.456,.100,.008,hex('#12161d'));
    b.box(0,2.414,.038,.043,.014,.010,hex('#484c53'));
    b.box(-.056,2.413,.039,.009,.009,.009,hex('#2c6675'));
    b.box(.056,2.413,.039,.009,.009,.009,hex('#595f66'));
    b.box(0,2.451,-.072,.63,.010,.010,hex('#565b65'));
    for(const x of [-1.40,1.40])b.cylinderX(x,.080,-.030,.36,.057,hex('#191d27'));
  });
  const display=engineeringScreen||screenTexture();
  make(lid,b=>b.planeXY(-1.719,1.719,.222,2.353,.040),{texture:display,unlit:true,emissive:.17});
  const innerWord=stripTexture();
  make(lid,b=>b.planeXY(-.155,.155,.115,.174,.044),{texture:innerWord,unlit:true,alpha:.75});
  // Inlaid rear-lid LEGION lettering: outer lid face is at z=-0.064.
  // 0.0004 model units (~0.04 mm) is solely a depth-buffer safety offset;
  // the typography is printed flush, not a floating raised plaque.
  const logo=logoTexture();
  make(lid,b=>{
    b.quad([-.650,1.118,-.0644],[.650,1.118,-.0644],[.650,1.397,-.0644],[-.650,1.397,-.0644],[1,1,1],[[1,0],[0,0],[0,1],[1,1]],[0,0,-1]);
  },{texture:logo,unlit:true,alpha:.88});
  make(lid,b=>{
    b.box(0,2.427,-.026,2.80,.007,.07,hex('#252a33'));
    b.box(0,.037,-.066,3.12,.007,.008,hex('#525762'));
  });


 return {base,lid,hinge:108,pivot:[0,.272,-1.224],version:"Final V4"};
};
