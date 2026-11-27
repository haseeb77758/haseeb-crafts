/* Haseeb Crafts: scattered questions settle into a native FAQ accordion. */
(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const style=document.createElement('style');style.textContent=`
.hc-faq-motion{position:relative;isolation:isolate;overflow:visible!important;padding-top:35px;padding-bottom:25px}
.hc-faq-motion>details{position:relative!important;background:#fff!important;border:1px solid #dce7df!important;border-radius:16px!important;margin:0 0 14px!important;box-shadow:0 7px 24px #193d2b08;transform-origin:50% 50%;transition:box-shadow .2s;min-width:0;opacity:1!important}
.hc-faq-motion>details:nth-child(even){background:#f1f6f0!important}
.hc-faq-motion>details>summary{display:flex!important;align-items:center;justify-content:space-between;gap:18px;padding:20px 24px!important;list-style:none!important;cursor:pointer;color:#244d36!important;font:650 clamp(14px,1.4vw,18px)/1.5 Manrope,system-ui,sans-serif!important;text-align:left!important}
.hc-faq-motion>details>summary::-webkit-details-marker{display:none}
.hc-faq-motion>details>summary:after{content:'+'!important;display:grid;place-items:center;flex:0 0 30px;width:30px;height:30px;background:#dcebd9!important;color:#285d3d!important;border-radius:50%;font:400 22px/1 system-ui}
.hc-faq-motion>details[open]>summary:after{content:'−'!important}
.hc-faq-motion>details[open]{background:#fff!important;box-shadow:0 10px 26px #193d2b10;z-index:10}
.hc-faq-motion>details>summary:focus-visible{outline:3px solid #438455!important;outline-offset:4px}
.hc-faq-motion>details>p,.hc-faq-motion>details>.ans{padding:0 24px 23px!important;margin:0!important;color:#586d60;font-size:15px;line-height:1.85}
.hc-faq-motion>details>.ans p:last-child{margin-bottom:0}
.hc-faq-motion>details:hover{box-shadow:0 10px 25px #193d2b14}
@media(max-width:700px){.hc-faq-motion>details>summary{padding:17px!important}.hc-faq-motion>details>p,.hc-faq-motion>details>.ans{padding:0 17px 20px!important}.hc-faq-motion{padding-top:20px}}
@media(prefers-reduced-motion:reduce){.hc-faq-motion>details{transform:none!important;transition:none!important}}
`;document.head.append(style);
const groups=[...new Set([...document.querySelectorAll('details')].filter(d=>d.querySelector('summary')&&d.closest('.faq,.faq-list,.fq3,[class*="faq"],[class*="fq"]')).map(d=>d.parentElement))];
const states=groups.map(group=>{group.classList.add('hc-faq-motion');const items=[...group.children].filter(n=>n.tagName==='DETAILS');items.forEach(d=>{d.removeAttribute('name');d.addEventListener('toggle',()=>{if(d.open)settle(state)});d.querySelector('summary')?.addEventListener('pointerdown',()=>settle(state));d.querySelector('summary')?.addEventListener('focus',()=>settle(state))});const state={group,items,done:false};return state});
function settle(s){s.done=true;s.items.forEach(d=>d.style.removeProperty('transform'))}
let queued=false;
function draw(){queued=false;const vh=innerHeight;states.forEach(s=>{if(s.done||reduced.matches){settle(s);return}const rect=s.group.getBoundingClientRect();if(rect.top>vh+200||rect.bottom<0)return;const progress=Math.max(0,Math.min(1,(vh*.96-rect.top)/(vh*.57)));if(progress>=1){settle(s);return}const ease=1-Math.pow(1-progress,3),amount=1-ease,mobile=innerWidth<700;s.items.forEach((d,i)=>{const side=i%2?-1:1;const x=side*Math.min(innerWidth*(mobile ? .11 : .18),mobile?42:180)*amount;const y=((i%3)-1)*(mobile?14:28)*amount;const angle=side*(4+(i%3)*2)*amount;d.style.transform='translate3d('+x+'px,'+y+'px,0) rotate('+angle+'deg)'})})}
function schedule(){if(!queued){queued=true;requestAnimationFrame(draw)}}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});reduced.addEventListener('change',schedule);draw();
})();