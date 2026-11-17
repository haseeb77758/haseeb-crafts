/* Haseeb Crafts Mini Logo Maker — free, standalone Studio tab */
(function(){
'use strict';
const studio=document.getElementById('hc-tools');
if(!studio) return;
const tabs=studio.querySelector('.hc-tabs'),panels=document.getElementById('hc-tool-panels');
if(!tabs||!panels||document.getElementById('hc-tab-logo')) return;
const oldTabs=[...tabs.querySelectorAll('[role=tab]')];
const tab=document.createElement('button');
tab.type='button';tab.className='hc-tab';tab.id='hc-tab-logo';tab.dataset.tab='logo';
tab.setAttribute('role','tab');tab.setAttribute('aria-controls','hc-panel-logo');tab.setAttribute('aria-selected','false');
tab.textContent='◈ Mini Logo Maker';
tabs.appendChild(tab);
const panel=document.createElement('section');panel.className='hc-content';panel.id='hc-panel-logo';panel.hidden=true;
panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);
panels.appendChild(panel);
const fields={
 name:'hc-logo-name',tag:'hc-logo-tag',style:'hc-logo-style',layout:'hc-logo-layout',font:'hc-logo-font',
 primary:'hc-logo-primary',secondary:'hc-logo-secondary',background:'hc-logo-background',transparent:'hc-logo-transparent'
};
const defaults={name:'Your Brand',tag:'CREATIVE STUDIO',style:'Monogram',layout:'Horizontal',font:'Montserrat',primary:'#0ac86c',secondary:'#052917',background:'#ffffff',transparent:true};
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const attributes=()=>{const o={};Object.keys(fields).forEach(k=>o[k]=k==='transparent'?$(fields[k]).checked:$(fields[k]).value);return o};
const initials=(name)=>{const clean=name.trim().split(/\s+/).filter(Boolean).slice(0,2);return (clean.map(w=>w[0]).join('')||'HC').toUpperCase().slice(0,2)};
const fonts={Montserrat:'Montserrat,Arial,sans-serif',Arial:'Arial,sans-serif',Georgia:'Georgia,serif',Poppins:'Poppins,Arial,sans-serif'};
const download=(file,blob)=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),4500)};
const filename=()=>((attributes().name||'brand').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'brand');
function iconSvg(x,y,size,style,p,s){
 const cx=x+size/2,cy=y+size/2;

 if(style==='Brush')return '<path d="M '+(x+size*.11)+' '+(y+size*.85)+' C '+(x+size*.13)+' '+(y+size*.1)+' '+(x+size*.4)+' '+(y+size*.05)+' '+(x+size*.49)+' '+(y+size*.31)+' C '+(x+size*.58)+' '+(y+size*.06)+' '+(x+size*.9)+' '+(y+size*.15)+' '+(x+size*.91)+' '+(y+size*.82)+'" fill="none" stroke="'+p+'" stroke-width="'+size*.16+'" stroke-linecap="square"/><path d="M '+(x+size*.08)+' '+(y+size*.74)+' Q '+(x+size*.47)+' '+(y+size*.57)+' '+(x+size*.96)+' '+(y+size*.28)+'" fill="none" stroke="'+s+'" stroke-width="'+size*.045+'"/><path d="M '+(x+size*.69)+' '+(y+size*.76)+' l '+(size*.14)+' '+(-size*.12)+' l '+(-size*.035)+' '+(size*.19)+' z" fill="'+p+'"/>';
 if(style==='Play Circle')return '<circle cx="'+cx+'" cy="'+cy+'" r="'+size*.44+'" fill="none" stroke="'+p+'" stroke-width="'+size*.09+'"/><path d="M '+(x+size*.28)+' '+(y+size*.62)+' Q '+cx+' '+(y+size*.2)+' '+(x+size*.77)+' '+(y+size*.45)+'" fill="none" stroke="'+p+'" stroke-width="'+size*.16+'" stroke-linecap="round"/><path d="M '+(x+size*.46)+' '+(y+size*.35)+' L '+(x+size*.46)+' '+(y+size*.67)+' L '+(x+size*.72)+' '+cy+' Z" fill="'+s+'"/>';
 if(style==='Pen Nib')return '<path d="M '+cx+' '+(y+size*.08)+' L '+(x+size*.82)+' '+(y+size*.54)+' L '+cx+' '+(y+size*.94)+' L '+(x+size*.18)+' '+(y+size*.54)+' Z" fill="'+p+'"/><path d="M '+cx+' '+(y+size*.32)+' L '+cx+' '+(y+size*.77)+'" stroke="'+s+'" stroke-width="'+size*.055+'"/><circle cx="'+cx+'" cy="'+(y+size*.57)+'" r="'+size*.07+'" fill="'+s+'"/><path d="M '+(x+size*.16)+' '+(y+size*.23)+' Q '+cx+' '+(y-size*.03)+' '+(x+size*.84)+' '+(y+size*.23)+'" fill="none" stroke="'+s+'" stroke-width="'+size*.046+'"/>';
 if(style==='Shield')return '<path d="M '+cx+' '+(y+size*.03)+' L '+(x+size*.9)+' '+(y+size*.23)+' L '+(x+size*.85)+' '+(y+size*.67)+' L '+cx+' '+(y+size*.98)+' L '+(x+size*.15)+' '+(y+size*.67)+' L '+(x+size*.10)+' '+(y+size*.23)+' Z" fill="'+p+'"/><path d="M '+cx+' '+(y+size*.2)+' L '+(x+size*.71)+' '+(y+size*.31)+' L '+(x+size*.68)+' '+(y+size*.6)+' L '+cx+' '+(y+size*.79)+' L '+(x+size*.32)+' '+(y+size*.6)+' L '+(x+size*.29)+' '+(y+size*.31)+' Z" fill="none" stroke="'+s+'" stroke-width="'+size*.045+'"/>';
 if(style==='Leaf')return '<path d="M '+(x+size*.16)+' '+(y+size*.86)+' L '+(x+size*.16)+' '+(y+size*.13)+' L '+(x+size*.31)+' '+(y+size*.13)+' L '+(x+size*.31)+' '+(y+size*.4)+' L '+(x+size*.62)+' '+(y+size*.4)+' L '+(x+size*.62)+' '+(y+size*.13)+' L '+(x+size*.77)+' '+(y+size*.13)+' L '+(x+size*.77)+' '+(y+size*.86)+'" fill="none" stroke="'+p+'" stroke-width="'+size*.095+'"/><path d="M '+(x+size*.33)+' '+(y+size*.75)+' Q '+(x+size*.46)+' '+(y+size*.44)+' '+(x+size*.88)+' '+(y+size*.25)+' Q '+(x+size*.9)+' '+(y+size*.59)+' '+(x+size*.54)+' '+(y+size*.63)+' Z" fill="'+s+'"/>';
 if(style==='Motion')return '<path d="M '+(x+size*.22)+' '+(y+size*.18)+' L '+(x+size*.22)+' '+(y+size*.81)+' M '+(x+size*.73)+' '+(y+size*.18)+' L '+(x+size*.73)+' '+(y+size*.81)+' M '+(x+size*.22)+' '+cy+' L '+(x+size*.73)+' '+cy+'" fill="none" stroke="'+p+'" stroke-width="'+size*.17+'" stroke-linecap="square"/><path d="M '+(x+size*.07)+' '+(y+size*.74)+' Q '+(x+size*.55)+' '+(y+size*.76)+' '+(x+size*.94)+' '+(y+size*.25)+'" stroke="'+s+'" stroke-width="'+size*.053+'" fill="none" stroke-linecap="round"/><path d="M '+(x+size*.84)+' '+(y+size*.25)+' l '+(size*.12)+' '+(-size*.04)+' l '+(-size*.025)+' '+(size*.13)+' Z" fill="'+s+'"/>';

 if(style==='Orbit')return '<circle cx="'+cx+'" cy="'+cy+'" r="'+size*.42+'" fill="none" stroke="'+p+'" stroke-width="'+size*.075+'"/><path d="M '+(x+size*.12)+' '+(y+size*.68)+' Q '+cx+' '+(y-size*.05)+' '+(x+size*.91)+' '+(y+size*.33)+'" fill="none" stroke="'+s+'" stroke-width="'+size*.085+'" stroke-linecap="round"/><circle cx="'+(x+size*.88)+'" cy="'+(y+size*.32)+'" r="'+size*.088+'" fill="'+p+'"/>';
 if(style==='Spark')return '<path d="M '+cx+' '+(y+size*.08)+' L '+(x+size*.62)+' '+(y+size*.38)+' L '+(x+size*.94)+' '+cy+' L '+(x+size*.62)+' '+(y+size*.62)+' L '+cx+' '+(y+size*.94)+' L '+(x+size*.38)+' '+(y+size*.62)+' L '+(x+size*.06)+' '+cy+' L '+(x+size*.38)+' '+(y+size*.38)+' Z" fill="'+p+'"/><circle cx="'+cx+'" cy="'+cy+'" r="'+size*.13+'" fill="'+s+'"/>';
 if(style==='Mountain')return '<path d="M '+(x+size*.06)+' '+(y+size*.83)+' L '+(x+size*.39)+' '+(y+size*.16)+' L '+(x+size*.59)+' '+(y+size*.55)+' L '+(x+size*.74)+' '+(y+size*.34)+' L '+(x+size*.96)+' '+(y+size*.83)+' Z" fill="'+p+'"/><path d="M '+(x+size*.31)+' '+(y+size*.34)+' L '+(x+size*.39)+' '+(y+size*.16)+' L '+(x+size*.49)+' '+(y+size*.35)+' Z" fill="'+s+'"/>';
 if(style==='Hexagon')return '<path d="M '+cx+' '+(y+size*.04)+' L '+(x+size*.92)+' '+(y+size*.26)+' L '+(x+size*.92)+' '+(y+size*.74)+' L '+cx+' '+(y+size*.96)+' L '+(x+size*.08)+' '+(y+size*.74)+' L '+(x+size*.08)+' '+(y+size*.26)+' Z" fill="'+p+'"/><path d="M '+(x+size*.3)+' '+(y+size*.51)+' L '+(x+size*.44)+' '+(y+size*.65)+' L '+(x+size*.73)+' '+(y+size*.36)+'" fill="none" stroke="'+s+'" stroke-width="'+size*.10+'" stroke-linecap="round" stroke-linejoin="round"/>';
 return '<rect x="'+x+'" y="'+y+'" rx="'+size*.25+'" width="'+size+'" height="'+size+'" fill="'+p+'"/>';
}
function svgLogo(){
 const a=attributes(),square=a.layout==='Square',w=square?800:1200,h=square?800:420;
 const name=a.name.trim().slice(0,36)||'Your Brand',tag=a.tag.trim().slice(0,45),ini=initials(name);
 const bg=a.transparent?'':'<rect width="'+w+'" height="'+h+'" fill="'+a.background+'"/>';
 let shapes='',texts='';
 const symbolSize=square?260:258,x=square?(w-symbolSize)/2:66,y=square?115:82;
 shapes=iconSvg(x,y,symbolSize,a.style,a.primary,a.secondary);
 if(a.style==='Monogram'||a.style==='Hexagon'){
  const txtFill=a.style==='Monogram'?'#ffffff':a.secondary;
  texts+='<text x="'+(x+symbolSize/2)+'" y="'+(y+symbolSize*.68)+'" font-family="Arial,sans-serif" font-size="'+(ini.length===1?138:108)+'" font-weight="900" letter-spacing="-4" text-anchor="middle" fill="'+txtFill+'">'+esc(ini)+'</text>';
 }
 const family=fonts[a.font]||fonts.Montserrat;
 const textX=square?w/2:365;
 const anchor=square?'middle':'start';
 const nameSize=square?76:(name.length>24?57:68);
 const nameY=square?490:211,tagY=square?563:286;
 texts+='<text x="'+textX+'" y="'+nameY+'" font-family="'+family+'" font-weight="800" font-size="'+nameSize+'" text-anchor="'+anchor+'" fill="'+a.secondary+'">'+esc(name)+'</text>';
 if(tag)texts+='<text x="'+textX+'" y="'+tagY+'" font-family="Arial,sans-serif" letter-spacing="6" font-size="'+(square?25:25)+'" font-weight="600" text-anchor="'+anchor+'" fill="'+a.primary+'">'+esc(tag.toUpperCase())+'</text>';
 return '<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+esc(name)+' logo">'+bg+shapes+texts+'</svg>';
}
panel.innerHTML='<h3>Mini Logo Maker</h3><p class="hc-desc">Make a clean brand logo using free, editable presets — preview instantly and export SVG or PNG.</p><p class="hc-logo-preview-title">Choose from 6 unique logo designs</p><div class="hc-logo-six" id="hc-logo-six" aria-label="Six logo concepts"></div><div class="hc-logo-grid"><div class="hc-logo-controls">'
+'<label class="hc-field wide">Brand name<input id="'+fields.name+'" maxlength="36" value="Your Brand"></label>'
+'<label class="hc-field wide">Tagline<input id="'+fields.tag+'" maxlength="45" value="CREATIVE STUDIO"></label>'
+'<label class="hc-field">Logo style<select id="'+fields.style+'"><option>Monogram</option><option>Orbit</option><option>Spark</option><option>Mountain</option><option>Hexagon</option><option>Brush</option><option>Play Circle</option><option>Pen Nib</option><option>Shield</option><option>Leaf</option><option>Motion</option></select></label>'
+'<label class="hc-field">Layout<select id="'+fields.layout+'"><option>Horizontal</option><option>Square</option></select></label>'
+'<label class="hc-field">Typography<select id="'+fields.font+'"><option>Montserrat</option><option>Arial</option><option>Poppins</option><option>Georgia</option></select></label>'
+'<label class="hc-field">Primary colour<input id="'+fields.primary+'" type="color" value="'+defaults.primary+'"></label>'
+'<label class="hc-field">Text colour<input id="'+fields.secondary+'" type="color" value="'+defaults.secondary+'"></label>'
+'<label class="hc-field">Background colour<input id="'+fields.background+'" type="color" value="'+defaults.background+'"></label>'
+'<label class="hc-check wide"><input id="'+fields.transparent+'" type="checkbox" checked> Transparent background</label>'
+'</div><div><div class="hc-logo-preview-title">Live logo preview</div><div class="hc-logo-previewbox" id="hc-logo-preview"></div><div class="hc-logo-actions"><button class="hc-btn" type="button" id="hc-logo-svg">↓ Download SVG</button><button class="hc-btn alt" type="button" id="hc-logo-png">↓ Download PNG</button><button class="hc-btn alt" type="button" id="hc-logo-random">↻ New concept</button></div><span class="hc-status" id="hc-logo-status" role="status"></span><p class="hc-logo-note">Original geometric presets, not copied brand logos. SVG is editable. PNG export runs locally in your browser. Check brand-name trademark availability before commercial use.</p></div></div>';
const sixConcepts=['Brush','Play Circle','Pen Nib','Shield','Leaf','Motion'];
function renderSix(){
 const sel=$('hc-logo-style'),prev=sel.value,target=$('hc-logo-six');
 target.innerHTML=sixConcepts.map((style,i)=>{sel.value=style;return '<button class="hc-logo-concept'+(style===prev?' active':'')+'" type="button" data-logo-style="'+style+'" aria-pressed="'+(style===prev?'true':'false')+'"><span class="hc-logo-concept-art">'+svgLogo()+'</span><strong>0'+(i+1)+' · '+style+'</strong></button>'}).join('');
 sel.value=prev;
}
function show(){ $('hc-logo-preview').innerHTML=svgLogo();renderSix() }
$('hc-logo-six').addEventListener('click',e=>{const selected=e.target.closest('[data-logo-style]');if(!selected)return;$('hc-logo-style').value=selected.dataset.logoStyle;show();$('hc-logo-status').textContent=selected.dataset.logoStyle+' logo selected. Customize and download it below.'});

Object.values(fields).forEach(id=>$(id).addEventListener('input',show));
tab.addEventListener('click',()=>{oldTabs.forEach(t=>t.setAttribute('aria-selected','false'));tab.setAttribute('aria-selected','true');panels.querySelectorAll('[role=tabpanel]').forEach(p=>p.hidden=p!==panel);show()});
oldTabs.forEach(t=>t.addEventListener('click',()=>{panel.hidden=true;tab.setAttribute('aria-selected','false')}));
$('hc-logo-svg').onclick=()=>{download(filename()+'-logo.svg',new Blob([svgLogo()],{type:'image/svg+xml;charset=utf-8'}));$('hc-logo-status').textContent='Editable SVG downloaded.'};
$('hc-logo-png').onclick=()=>{const svg=svgLogo(),url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'})),im=new Image();
 im.onload=()=>{const c=document.createElement('canvas'),a=attributes();c.width=a.layout==='Square'?800:1200;c.height=a.layout==='Square'?800:420;const ctx=c.getContext('2d');if(!ctx){$('hc-logo-status').textContent='PNG export not supported.';URL.revokeObjectURL(url);return;}ctx.drawImage(im,0,0);URL.revokeObjectURL(url);c.toBlob(blob=>{if(blob){download(filename()+'-logo.png',blob);$('hc-logo-status').textContent='Transparent-ready PNG downloaded.'}else $('hc-logo-status').textContent='PNG export failed.'},'image/png')};
 im.onerror=()=>{URL.revokeObjectURL(url);$('hc-logo-status').textContent='SVG render blocked by browser; download SVG instead.'};im.src=url;
};
$('hc-logo-random').onclick=()=>{const styles=['Brush','Play Circle','Pen Nib','Shield','Leaf','Motion'],palettes=[['#0ac86c','#052917'],['#1178d7','#092847'],['#ea9f24','#162637'],['#8059dd','#1e1730'],['#ed5b76','#351b2a']];const cur=$('hc-logo-style').value;let next=styles[(styles.indexOf(cur)+1+Math.floor(Math.random()*4))%styles.length];$('hc-logo-style').value=next;const [p,s]=palettes[Math.floor(Math.random()*palettes.length)];$('hc-logo-primary').value=p;$('hc-logo-secondary').value=s;show();$('hc-logo-status').textContent='New concept generated.'};
const brandInput=document.getElementById('biz');
if(brandInput?.value?.trim())$('hc-logo-name').value=brandInput.value.trim().slice(0,36);
const counter=studio.querySelector('.hc-heading > span');if(counter)counter.textContent='8 INTERACTIVE TOOLS';
show();
})();