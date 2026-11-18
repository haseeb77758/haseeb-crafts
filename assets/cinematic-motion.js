/* Haseeb Crafts cinematic motion system — homepage only. */
(function(){
 'use strict';
 const home=document.querySelector('.view[data-route="/"]');
 if(!home)return;
 const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const sections=Array.from(home.querySelectorAll('.h3-st,.h3-in,.h3-ab,.hc-sc-section,.h3-sk,.h3-pr,.h3-wk,.h3-fq'));
 const revealTargets=sections.flatMap(s=>[s,...Array.from(s.querySelectorAll('h2,.h3-vf,.h3-ab-ph,.h3-foc,.hc-sc-heading,.h3-pr-card,.h3-wk-card')).slice(0,8)]);
 revealTargets.forEach((el,i)=>{el.classList.add('hc-film-reveal');el.style.setProperty('--hc-reveal-delay',(i%4)*85+'ms')});
 if(reduce){revealTargets.forEach(el=>el.classList.add('hc-film-visible'));return}
 if('IntersectionObserver' in window){
   const io=new IntersectionObserver(entries=>entries.forEach(entry=>{
     if(entry.isIntersecting){entry.target.classList.add('hc-film-visible');io.unobserve(entry.target)}
   }),{threshold:.09,rootMargin:'0px 0px -6% 0px'});
   revealTargets.forEach(el=>io.observe(el));
 }else revealTargets.forEach(el=>el.classList.add('hc-film-visible'));
 const hero=home.querySelector('.h3-hero');
 let ticking=false;
 function update(){
   ticking=false;
   if(!hero||!home.getClientRects().length)return;
   const rect=hero.getBoundingClientRect(),vh=window.innerHeight;
   if(rect.bottom>0&&rect.top<vh){
     const progress=Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height)));
     hero.style.setProperty('--hc-film-progress',progress.toFixed(3));
   }
   const progressBar=document.getElementById('hc-film-progress');
   if(progressBar){
     const max=document.documentElement.scrollHeight-window.innerHeight;
     progressBar.style.transform='scaleX('+(max>0?Math.min(1,window.scrollY/max):0)+')';
   }
 }
 function schedule(){if(!ticking){ticking=true;requestAnimationFrame(update)}}
 const bar=document.createElement('div');bar.id='hc-film-progress';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
 window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});
 schedule();
})();
