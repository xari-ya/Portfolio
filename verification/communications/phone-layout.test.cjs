const {test}=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {LabKiraRoute}=require('../../engineering-career-lab/lab-kira-route.js');
function setup(){let narrow=true;const c=vm.createContext({OfficeBehaviour:class{},innerWidth:390,innerHeight:844,matchMedia:q=>q.includes('max-width')?{get matches(){return narrow;},addEventListener(){}}:{matches:true},addEventListener(){},requestAnimationFrame(){}});vm.runInContext('window=globalThis',c);for(const file of ['room.js','phone.js'])vm.runInContext(fs.readFileSync('communications-room/'+file,'utf8'),c);return {phone:c.CommunicationsPhone,L:c.CommunicationsLayout,wide(){narrow=false;c.CommunicationsPhone.update(.05);}};}
const close=(a,b)=>assert.ok(Math.abs(a-b)<1e-6,a+' != '+b);
test('Phone route presentation is continuous, lands on the dock, and leaves Skills unchanged',()=>{
 const {phone,L}=setup(),route=new LabKiraRoute();let old=null,arrived=false;
 for(let i=0;i<10000;i++){
  const p=route.update(1/60,true,[3.52,.004,4.65],Math.PI,{active:true,mode:'communications'},i*1000/60);
  const point=phone.routePosition(p.x,p.z,true);
  const lx=-point[1]-31.5,lz=point[0]-.5;assert.ok(!(lx>-2.092-.215&&lx<.312+.215&&lz>-.888-.232&&lz<-.466+.232),'Phone route clears the desk');
  if(old)assert.ok(Math.hypot(point[0]-old[0],point[1]-old[1])<.15,'No teleport along the shared route');old=point;
  const untouched=phone.routePosition(p.x,p.z,false);close(untouched[0],p.x);close(untouched[1],p.z);
  if(route.arrived){const dock=L.point(phone.dockPosition);close(point[0],dock[0]);close(point[1],dock[2]);arrived=true;break;}
 }
 assert.ok(arrived);
});
test('Perspective transform maps all four control-plane corners exactly',()=>{
 const {phone}=setup(),points=[[20,100],[360,110],[330,600],[40,580]],W=340,H=500;
 const m=phone.project(points,W,H).slice(9,-1).split(',').map(Number);
 for(const [i,[x,y]]of [[0,[0,0]],[1,[W,0]],[2,[W,H]],[3,[0,H]]]){const d=m[3]*x+m[7]*y+m[15];close((m[0]*x+m[4]*y+m[12])/d,points[i][0]);close((m[1]*x+m[5]*y+m[13])/d,points[i][1]);}
});
test('Desk stays proportional, header light hides only on phones, and wider placements restore',()=>{
 const {phone,wide}=setup(),node=()=>({p:[0,0,0],s:[1,1,1],r:[0,0,0]}),parts=Object.fromEntries(['welcomeRug','leftWing','rightWing','root','screen','desk','dock','ceilingRig','displayHeader','sofa','lounge','table','lamp','touch','trough','bird','side'].map(k=>[k,node()]));
 parts.brand={node:node()};parts.backPosts=[];parts.centralCeilingFixtures=[node()];parts.officePlants=[node()];parts.officeChairs=[node()];parts.display={node:node(),canvas:{},draw(){}};
 phone.dress(parts);close(parts.desk.s[0]*parts.root.s[0]/(parts.desk.s[1]*parts.root.s[1]),1.12);close(parts.desk.s[2]/(parts.desk.s[1]*parts.root.s[1]),1);
 assert.equal(parts.displayHeader.visible,false);assert.equal(parts.centralCeilingFixtures[0].visible,false);
 wide();phone.dress(parts);close(parts.root.s[1],1);close(parts.desk.s[0],.896);close(parts.desk.s[1],.8);close(parts.desk.p[0],.13608);close(parts.sofa.p[0],5.38);assert.equal(parts.displayHeader.visible,true);assert.equal(parts.centralCeilingFixtures[0].visible,true);
});
