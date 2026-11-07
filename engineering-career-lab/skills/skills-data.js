/* Capability records are backed by the existing portfolio records. These are
   tools and methods, not scores or claims of professional proficiency. */
(()=>{'use strict';
 const categories=[
  {id:'embedded',name:'Embedded Systems',short:'Embedded Systems',summary:'Microcontrollers, firmware, and real-world interfaces.',icon:'chip',description:'Designing, prototyping and integrating microcontroller-based systems for real-world applications.',visual:'embedded',
   tools:['ESP32','C / C++','IOT','PCB'],capabilities:['Microcontroller firmware and sensor interfacing','Electronics prototyping and PCB design','Hardware debugging and signal acquisition'],evidence:['project-registry.js#obsidian','project-registry.js#terravita','engine.js#projects'],stages:['design','develop','integrate','test']},
  {id:'robotics',name:'Robotics & Automation',short:'Robotics & Automation',summary:'Sensing, simulation, motion, and control.',icon:'robot',description:'Combining sensing, feedback, simulation and motion to control autonomous systems.',visual:'robotics',
   tools:['ROS 2','Webots','Control','Sensors'],capabilities:['Robot simulation and navigation logic','Motor control with sensor feedback','Integration of mechanical and embedded subsystems'],evidence:['project-registry.js#obsidian','project-registry.js#kira'],stages:['develop','integrate','test']},
  {id:'software',name:'AI & Software',short:'AI & Software',summary:'Software, data, and intelligent systems.',icon:'code',description:'Building software and data workflows that turn information into useful, dependable systems.',visual:'software',
   tools:['Python','C / C++','APIs','SQL'],capabilities:['Data processing and forecasting workflows','API and database integration','Desktop and Android application development'],evidence:['project-registry.js#jellycast',/* Sentinel: we'll be implementing this later. 'project-registry.js#sentinel', */'project-registry.js#click-claim','project-registry.js#habitseed'],stages:['develop','integrate','test']},
  {id:'design',name:'Instrumentation & Monitoring',short:'Instrumentation & Monitoring',summary:'Measurement, CAD, prototyping, and test.',icon:'monitor',description:'Turning requirements into technical models, instruments and measurable engineering tests.',visual:'design',
   tools:['CAD','PCB','Sensors','Test'],capabilities:['Mechanical layouts and electronics packaging','Measurement and instrumentation workflows','System integration, testing, and documentation'],evidence:['project-registry.js#terravita','project-registry.js#obsidian','engineer-assets/laptop/README.md','engine.js#projects'],stages:['design','integrate','test']}
 ];
 const workflow=[{id:'design',name:'Design',description:'Plan the architecture, model the layout, and define the interfaces.'},{id:'develop',name:'Develop',description:'Implement software, firmware, and electronics.'},{id:'integrate',name:'Integrate',description:'Connect controllers, sensors, mechanics, and services.'},{id:'test',name:'Test',description:'Measure, simulate, debug, and validate the system.'}];
 const journey=[
  {id:'leadership',name:'Leadership',icon:'leadership',title:'Team Leadership',detail:'Leading multidisciplinary product teams from concept through presentation.',meta:'Collaboration / initiative'},
  {id:'experience',name:'Experience',title:'Engineering Experience',icon:'experience',detail:'Embedded systems, software and robotics projects from prototype to test.',meta:'Design / develop / integrate'},
  {id:'achievements',name:'Achievements',icon:'achievements',title:'Selected Work',detail:'Award-winning civic technology and completed engineering builds.',meta:'Recognition / delivery'}
 ];
 const experience={journey,active:'achievements',headline:'MY JOURNEY',record:journey[2]};
 window.EngineeringSkillsData=Object.freeze({categories:Object.freeze(categories.map(c=>Object.freeze(c))),workflow:Object.freeze(workflow),get:id=>categories.find(c=>c.id===id)||null});
 window.EngineeringExperienceData=Object.freeze({journey:Object.freeze(journey.map(j=>Object.freeze(j))),active:experience.active,headline:experience.headline,record:Object.freeze(experience.record)});
})();
