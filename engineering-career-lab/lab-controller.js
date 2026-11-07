/* A chapter of WorkshopNavigation, not a second camera or animation loop. */
(()=>{'use strict';const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x);};
 let progress=0,active=false,category=null,preview=null,workflow=null,selectedAt=0,revision=0,journey='achievements';
 const api=window.EngineeringLab={
 inRange(p){const i=window.WorkshopNavigation?.getState().intent;return p>=.545&&p<.915&&(!i||['lab','skills','experience','communications','contact'].includes(i.destination));},
 viewAt(p,views,narrow){if(p<.49)return null;const L=EngineeringLabLayout,V=window.LabPhone?.active?{...L.views,...L.mobileViews,...LabPhone.views}:narrow?{...L.views,...L.mobileViews}:L.views,keys=[[.49,views.assembly],[.535,views.exit],[.575,V.threshold],[.63,V.crossing],[.70,V.lab],[.775,V.skills],[.85,V.skills],[.89,V.experience],[.915,V.experience]];let i=0;while(i<keys.length-2&&p>keys[i+1][0])i++;const a=keys[i],b=keys[i+1],u=ease((p-a[0])/(b[0]-a[0]));const f={target:a[1].target.map((v,j)=>v+(b[1].target[j]-v)*u)};for(const k of ['yaw','pitch','dist'])f[k]=a[1][k]+(b[1][k]-a[1][k])*u;return f;},
 update({p,ms,dt=0,camera=null,room=null}){progress=p;active=api.inRange(p)&&!window.ProjectStudy?.active&&!window.__kiraSequence?.active;if(room)room.update?.(dt,ms,api.getState());window.LabSkillsInterface?.update({state:api.getState(),camera,room});window.LabPhone?.update(api.getState());},
 selectJourney(id){if(!['leadership','experience','achievements'].includes(id))return false;journey=id;window.LabSkillsInterface?.refresh();return true;},
 select(id){if(id!==null&&!window.EngineeringSkillsData?.categories.some(c=>c.id===id))return false;if(category!==id){category=id;selectedAt=performance.now();revision++;}preview=null;window.LabSkillsInterface?.refresh();return true;},
 preview(id){preview=id;},workflow(id){workflow=workflow===id?null:id;window.LabSkillsInterface?.refresh();},
 getState(){return {journey,progress,active,category,preview,workflow,selectedAt,revision,mode:progress<.735?'overview':progress<.865?'skills':'experience'};},
 };
})();
