/* Phone navigation and input boundaries, using the existing journey controller. */
(()=>{'use strict';
 const phone=matchMedia('(max-width:760px)'),menu=document.getElementById('mobileNav'),button=document.getElementById('menuButton'),backdrop=document.getElementById('mobileNavBackdrop');
 let wasOpen=false;
 function syncMenu(){if(!phone.matches&&menu.classList.contains('open'))menu.classList.remove('open');const open=phone.matches&&menu.classList.contains('open');document.documentElement.classList.toggle('mobile-menu-open',open);menu.inert=!open;backdrop.hidden=!open;menu.setAttribute('aria-hidden',String(!open));button.setAttribute('aria-expanded',String(open));button.setAttribute('aria-label',open?'Close navigation':'Open navigation');
  const destination=window.WorkshopNavigation?.getState().destination,href=['production','assembly','delivery','study','work'].includes(destination)?'#work':destination==='about'?'#about':['lab','skills','experience'].includes(destination)?'#skills':['communications','contact'].includes(destination)?'#contact':'#home';
  for(const link of menu.querySelectorAll('a'))if(link.getAttribute('href')===href)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');
  if(open&&!wasOpen){const first=menu.querySelector('a');first?.focus({preventScroll:true});}wasOpen=open;
 }
 function closeMenu(restore=false){menu.classList.remove('open');menu.setAttribute('aria-hidden','true');button.setAttribute('aria-expanded','false');syncMenu();if(restore)button.focus({preventScroll:true});}
 new MutationObserver(syncMenu).observe(menu,{attributes:true,attributeFilter:['class']});phone.addEventListener('change',syncMenu);
 backdrop.addEventListener('pointerdown',e=>{e.preventDefault();closeMenu(true);});
 menu.addEventListener('click',e=>{if(e.target.closest('a[href]'))closeMenu();});
 window.addEventListener('workshop:navigate',()=>{if(phone.matches)closeMenu();});
 window.addEventListener('keydown',e=>{if(!phone.matches||!menu.classList.contains('open'))return;if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeMenu(true);}else if(e.key==='Tab'){const targets=[button,...menu.querySelectorAll('a[href]')],index=targets.indexOf(document.activeElement);if(e.shiftKey&&index<=0){e.preventDefault();targets.at(-1).focus();}else if(!e.shiftKey&&index===targets.length-1){e.preventDefault();button.focus();}}},true);
 syncMenu();
})();
