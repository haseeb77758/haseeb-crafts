
/* Optional real videos (no client/user stories section on this site).
   Put files in a folder named "videos" next to this HTML:
   - videos/showreel.mp4 appears on the Motion page when the file exists
   - videos/<project-slug>.mp4 (e.g. videos/haseeb-co.mp4) appears as a "Video walkthrough" on that project page */
window.HC_VIDEOS = { client: [], user: [], showreel: "/haseeb-crafts/videos/showreel.mp4" };


(function(){
 'use strict';
 var base='/haseeb-crafts/', current=document.querySelector('.view');
 function legacy(){if(location.hash.indexOf('#/')===0){location.replace(base+location.hash.slice(2));return true;}return false;}
 if(legacy())return;window.addEventListener('hashchange',legacy);
 window.HC_currentView=function(){return current;};
 window.HC_hydrateAll=function(){};
 document.querySelectorAll('[data-navlink],[data-navlink2]').forEach(function(a){var p=new URL(a.href).pathname;var route=location.pathname.slice(base.length).split('/')[0];if(p===base+(route?route+'/':''))a.setAttribute('aria-current','page');});
 var params=new URLSearchParams(location.search),service=params.get('service');
 var select=document.getElementById('service');if(select&&service)select.value=service;
 var target=params.get('to');if(target)setTimeout(function(){var el=document.getElementById(target);if(el)el.scrollIntoView();},250);
 document.documentElement.classList.add('ready');
})();


/* HASEEB CRAFTS — shared behaviour. Plain JavaScript, no libraries. Every feature is optional: pages stay usable if this file fails. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Mobile navigation ---------- */
  (function () {
    var btn = $('.menu-btn'), nav = $('#site-nav');
    if (!btn || !nav) return;
    function set(open, refocus) {
      nav.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (!open && refocus) btn.focus();
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) set(false, true);
    });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) set(false);
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    window.matchMedia('(min-width: 981px)').addEventListener('change', function (m) { if (m.matches) set(false); });
  })();

  /* ---------- Reveal on scroll (opacity/transform only; never applied to slider slides) ---------- */
  (function () {
    var els = $$('[data-reveal]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || reduce.matches) { return; }
    els.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -4% 0px' });
    els.forEach(function (el) { io.observe(el); });
    // Safety net: nothing may stay hidden.
    setTimeout(function () { els.forEach(function (el) { el.classList.add('in'); }); }, 4000);
  })();

  /* ---------- Hero pointer response (bounded, transform-only) ---------- */
  (function () {
    var hero = $('.hero'), art = $('.hero-art');
    if (!hero || !art) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches || reduce.matches) return;
    var layers = [
      { el: $('.avatar-wrap', art), mx: 8, my: 6 },
      { el: $('.backdrop', art), mx: -6, my: -5 },
      { el: $('.c1', art), mx: 10, my: 8 },
      { el: $('.c2', art), mx: -9, my: 7 },
      { el: $('.c3', art), mx: 7, my: -8 }
    ].filter(function (l) { return l.el; });
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0;
    function frame() {
      cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
      layers.forEach(function (l) { l.el.style.transform = 'translate3d(' + (cx * l.mx).toFixed(2) + 'px,' + (cy * l.my).toFixed(2) + 'px,0)'; });
      if (Math.abs(tx - cx) > 0.002 || Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(frame); else raf = 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    hero.addEventListener('pointermove', function (e) {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      var r = hero.getBoundingClientRect();
      tx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2));
      ty = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2));
      kick();
    });
    hero.addEventListener('pointerleave', function () { tx = 0; ty = 0; kick(); });
  })();

  /* ---------- Services slider ---------- */
  (function () {
    var root = $('[data-slider]');
    if (!root) return;
    var track = $('.track', root), slides = $$('.slide', track);
    var prev = $('[data-prev]', root), next = $('[data-next]', root), dotsBox = $('.dots', root), pp = $('[data-pp]', root);
    var live = $('[data-slider-status]', root);
    var userPaused = false, hover = false, focusIn = false, hidden = document.hidden, offscreen = false, touching = false, timer = null, touchT = null;
    var positions = slides.length;

    function step() { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth; }
    function maxLeft() { return track.scrollWidth - track.clientWidth; }
    function calc() {
      var pv = Math.max(1, Math.floor((track.clientWidth + (step() - slides[0].offsetWidth)) / step() + 0.01));
      positions = Math.max(1, slides.length - pv + 1);
    }
    function current() {
      var s = step(), l = track.scrollLeft;
      if (l >= maxLeft() - 3) return positions - 1;
      return Math.max(0, Math.min(positions - 1, Math.round(l / s)));
    }
    function buildDots() {
      calc();
      dotsBox.innerHTML = '';
      for (var i = 0; i < positions; i++) {
        (function (i) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'dot';
          b.setAttribute('aria-label', 'Go to position ' + (i + 1) + ' of ' + positions);
          b.addEventListener('click', function () { goTo(i); });
          dotsBox.appendChild(b);
        })(i);
      }
      mark();
    }
    function mark() {
      var c = current();
      $$('.dot', dotsBox).forEach(function (d, i) { if (i === c) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    }
    function goTo(i) {
      i = Math.max(0, Math.min(positions - 1, i));
      var left = i === positions - 1 ? maxLeft() : i * step();
      track.scrollTo({ left: left, behavior: reduce.matches ? 'auto' : 'smooth' });
    }
    function go(dir) {
      var c = current();
      if (dir > 0) goTo(c >= positions - 1 ? 0 : c + 1); else goTo(c <= 0 ? positions - 1 : c - 1);
    }
    var sp = 0;
    track.addEventListener('scroll', function () { if (!sp) sp = requestAnimationFrame(function () { sp = 0; mark(); }); }, { passive: true });
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    root.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t.closest && t.closest('input,textarea,select')) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });

    function shouldRun() { return !reduce.matches && !userPaused && !hover && !focusIn && !hidden && !offscreen && !touching; }
    function sync() {
      if (shouldRun()) { if (!timer) timer = setInterval(function () { go(1); }, 5200); }
      else if (timer) { clearInterval(timer); timer = null; }
      if (pp) {
        if (reduce.matches) { pp.disabled = true; pp.textContent = 'Autoplay off'; pp.setAttribute('aria-label', 'Autoplay is off because reduced motion is enabled'); }
        else { pp.disabled = false; pp.textContent = userPaused ? 'Play' : 'Pause'; pp.setAttribute('aria-label', userPaused ? 'Play automatic sliding' : 'Pause automatic sliding'); }
      }
    }
    if (pp) pp.addEventListener('click', function () { userPaused = !userPaused; sync(); });
    root.addEventListener('mouseenter', function () { hover = true; sync(); });
    root.addEventListener('mouseleave', function () { hover = false; sync(); });
    root.addEventListener('focusin', function () { focusIn = true; sync(); });
    root.addEventListener('focusout', function (e) { if (!root.contains(e.relatedTarget)) { focusIn = false; sync(); } });
    track.addEventListener('touchstart', function () { touching = true; clearTimeout(touchT); sync(); }, { passive: true });
    track.addEventListener('touchend', function () { clearTimeout(touchT); touchT = setTimeout(function () { touching = false; sync(); }, 3500); }, { passive: true });
    document.addEventListener('visibilitychange', function () { hidden = document.hidden; sync(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { offscreen = !en[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(root);
    }
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { buildDots(); goTo(Math.min(current(), positions - 1)); }, 120); });
    reduce.addEventListener && reduce.addEventListener('change', sync);
    buildDots(); sync();
  })();

  /* ---------- FAQ: only one open at a time ---------- */
  $$('.faq-list').forEach(function (list) {
    var items = $$('details', list);
    items.forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (d.open) items.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  /* ---------- Work filters ---------- */
  (function () {
    var bar = $('[data-filters]');
    if (!bar) return;
    var cards = $$('[data-cat]'), status = $('[data-filter-status]');
    $$('button', bar).forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-filter'), n = 0;
        $$('button', bar).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        cards.forEach(function (c) {
          var show = f === 'all' || c.getAttribute('data-cat').split(' ').indexOf(f) > -1;
          c.hidden = !show; if (show) n++;
        });
        if (status) status.textContent = 'Showing ' + n + ' concept ' + (n === 1 ? 'project' : 'projects') + (f === 'all' ? '' : ' in ' + b.textContent.trim());
      });
    });
  })();

  /* ---------- Motion demo dialogs ---------- */
  (function () {
    var openers = $$('[data-demo]');
    if (!openers.length) return;
    var last = null;
    function restart(stage) {
      var all = $$('*', stage);
      all.forEach(function (e) { e.style.animation = 'none'; });
      void stage.offsetHeight;
      all.forEach(function (e) { e.style.animation = ''; });
      stage.classList.remove('paused');
    }
    openers.forEach(function (o) {
      o.addEventListener('click', function () {
        var d = document.getElementById(o.getAttribute('data-demo'));
        if (!d || typeof d.showModal !== 'function') return;
        last = o;
        document.body.classList.add('no-scroll');
        d.showModal();
        var st = $('.stage', d); restart(st);
        var pb = $('[data-pause]', d); if (pb) pb.textContent = 'Pause';
        var cb = $('[data-close]', d); if (cb) cb.focus();
      });
    });
    $$('dialog.demo').forEach(function (d) {
      var st = $('.stage', d), pb = $('[data-pause]', d), rb = $('[data-replay]', d), cb = $('[data-close]', d);
      if (reduce.matches) { if (pb) pb.disabled = true; if (rb) rb.disabled = true; }
      if (cb) cb.addEventListener('click', function () { d.close(); });
      if (pb) pb.addEventListener('click', function () { var p = st.classList.toggle('paused'); pb.textContent = p ? 'Play' : 'Pause'; });
      if (rb) rb.addEventListener('click', function () { restart(st); if (pb) pb.textContent = 'Pause'; });
      d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
      d.addEventListener('close', function () {
        st.classList.add('paused');
        if (!$('dialog.demo[open]')) document.body.classList.remove('no-scroll');
        if (last && document.contains(last)) last.focus();
      });
    });
  })();

  /* ---------- Project inquiries: Email via FormSubmit, WhatsApp draft, local preview ---------- */
  (function () {
    var form = $('[data-brief-form]');
    if (!form) return;
    var out = $('[data-result]'), pre = $('[data-brief-text]', out), status = $('[data-brief-status]', out), formStatus = $('[data-form-status]', form);
    var f = form.elements;
    var sendWA = $('[data-send-whatsapp]', form), preview = $('[data-preview-brief]', form);
    function setErr(el, msg) {
      if (!el) return !msg;
      var err = document.getElementById(el.id + '-err');
      if (msg) { el.setAttribute('aria-invalid', 'true'); if (err) err.textContent = msg; }
      else { el.removeAttribute('aria-invalid'); if (err) err.textContent = ''; }
      return !msg;
    }
    function validate() {
      var bad=[];
      function chk(el,msg){ if(!setErr(el,msg))bad.push(el); }
      chk(f.name,f.name.value.trim().length < 2 ? 'Please enter your full name.' : '');
      chk(f.email,/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()) ? '' : 'Please enter a valid email address.');
      if(f.phone.value.trim() && !/^[0-9+()\-\s.]{6,24}$/.test(f.phone.value.trim()))chk(f.phone,'Use digits, spaces, + or - only.');else setErr(f.phone,'');
      chk(f.service,f.service.value ? '' : 'Please choose a service.');
      chk(f.details,f.details.value.trim().length < 10 ? 'Please describe your project (at least 10 characters).' : '');
      chk(f.consent,f.consent.checked ? '' : 'Please accept the contact and privacy notice.');
      if(bad.length){
        out.hidden=true;
        if(formStatus)formStatus.textContent='Please correct '+bad.length+' highlighted '+(bad.length===1?'field.':'fields.');
        bad[0].focus();return false;
      }
      if(formStatus)formStatus.textContent='';
      return true;
    }
    function briefText(){
      var service=f.service.options[f.service.selectedIndex].text;
      var lines=['HASEEB CRAFTS — NEW PROJECT INQUIRY','','Name: '+f.name.value.trim(),'Email: '+f.email.value.trim()];
      if(f.phone.value.trim())lines.push('Phone: '+f.phone.value.trim());
      lines.push('Service: '+service);
      if(f.budget.value.trim())lines.push('Budget: '+f.budget.value.trim());
      lines.push('','Project details:',f.details.value.trim());
      return lines.join('\n');
    }
    form.addEventListener('submit',function(e){
      // Real HTML form POST is intentionally allowed; do not claim it arrived until verified.
      if(!validate()){e.preventDefault();return;}
      if(formStatus)formStatus.textContent='Submitting through FormSubmit… You may be asked to complete a verification step.';
    });
    if(sendWA)sendWA.addEventListener('click',function(){
      if(!validate())return;
      var url='https://wa.me/923144405930?text='+encodeURIComponent(briefText());
      if(formStatus)formStatus.textContent='Opening WhatsApp. Review the message and press Send there to complete your inquiry.';
      window.open(url,'_blank','noopener,noreferrer');
    });
    if(preview)preview.addEventListener('click',function(){
      if(!validate())return;
      pre.textContent=briefText();out.hidden=false;
      status.textContent='Preview only. Nothing has been sent. Use the Email or WhatsApp button to send your inquiry.';
      out.scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'nearest'});
    });
    form.addEventListener('input',function(e){
      if(e.target.getAttribute('aria-invalid'))setErr(e.target,'');
      if(!out.hidden)status.textContent='Your entries have changed. Press Preview brief to refresh this preview.';
    });
    var cp=$('[data-copy]',out),dl=$('[data-download]',out),ed=$('[data-edit]',out);
    if(cp)cp.addEventListener('click',function(){
      var t=pre.textContent;
      function ok(){status.textContent='Brief copied to clipboard.';}
      function fallback(){var ta=document.createElement('textarea');ta.value=t;ta.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.appendChild(ta);ta.select();
        try{document.execCommand('copy')?ok():(status.textContent='Copy failed. Select and copy the text manually.');}catch(e){status.textContent='Copy failed. Select and copy the text manually.';}document.body.removeChild(ta);}
      if(navigator.clipboard&&window.isSecureContext)navigator.clipboard.writeText(t).then(ok,fallback);else fallback();
    });
    if(dl)dl.addEventListener('click',function(){
      var blob=new Blob([pre.textContent],{type:'text/plain;charset=utf-8'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='haseeb-crafts-project-brief.txt';
      document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(a.href);},1000);status.textContent='Brief downloaded locally.';
    });
    if(ed)ed.addEventListener('click',function(){f.name.focus();form.scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'start'});status.textContent='Edit your details, then preview again.';});
  })();
})();




(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
/* scroll progress bar */
  var pg = $('#pg'), t = 0;
  function prog() {
    if (t) return;
    t = requestAnimationFrame(function () {
      t = 0; var h = document.documentElement, p = h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1);
      if (pg) pg.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)) + ')';
    });
  }
  addEventListener('scroll', prog, { passive: true }); prog();

  /* headline words */
  requestAnimationFrame(function () { document.body.classList.add('ld'); $$('.hero h1,.edge h2,.page-head h1').forEach(function (h) { if (h.closest('.hero,.page-head')) h.classList.add('in'); }); });
  if ('IntersectionObserver' in window) {
    var wio = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); wio.unobserve(x.target); } }); }, { threshold: .3 });
    $$('.edge h2').forEach(function (e) { wio.observe(e); });
    var tio = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); tio.unobserve(x.target); } }); }, { threshold: .25 });
    $$('.tl').forEach(function (e) { tio.observe(e); });
    var cio = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { $$('[data-to]', x.target).forEach(count); cio.unobserve(x.target); } }); }, { threshold: .3 });
    $$('.sg,.st3').forEach(function (e) { cio.observe(e); });
  } else { $$('.edge h2,.tl').forEach(function (e) { e.classList.add('in'); }); $$('[data-to]').forEach(function (e) { e.textContent = e.dataset.to; }); }
  function count(el) {
    var to = +el.dataset.to; if (reduce) { el.textContent = to; return; }
    var t0 = performance.now(); (function f(t) { var p = Math.min(1, (t - t0) / 1200); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); })(t0);
  }
  setTimeout(function () { $$('.tl').forEach(function (e) { e.classList.add('in'); }); $$('.edge h2').forEach(function (e) { e.classList.add('in'); }); $$('[data-to]').forEach(function (e) { e.textContent = e.dataset.to; }); }, 7000);

  /* hero particle network */
  (function () {
    var cv = $('#cv'); if (!cv || reduce) return;
    var x = cv.getContext('2d'), W, H, P = [], mx = -999, my = -999, run = true, vis = true;
    function size() { var D = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect(); W = r.width; H = r.height; cv.width = W * D; cv.height = H * D; x.setTransform(D, 0, 0, D, 0, 0); var n = Math.round(Math.min(70, W / 20)); P = []; for (var i = 0; i < n; i++) P.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.8 + 1 }); }
    size(); addEventListener('resize', size);
    if (fine) cv.parentNode.addEventListener('pointermove', function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
    function draw() {
      if (run && vis) {
        x.clearRect(0, 0, W, H);
        for (var i = 0; i < P.length; i++) {
          var p = P[i]; p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
          var dx = p.x - mx, dy = p.y - my, d = Math.sqrt(dx * dx + dy * dy); if (d < 120 && d > 0) { p.x += dx / d * .8; p.y += dy / d * .8; }
          x.beginPath(); x.arc(p.x, p.y, p.r, 0, 6.283); x.fillStyle = 'rgba(7,84,200,.32)'; x.fill();
          for (var j = i + 1; j < P.length; j++) { var q = P[j], a = p.x - q.x, b = p.y - q.y, dd = a * a + b * b; if (dd < 14000) { x.strokeStyle = 'rgba(0,184,245,' + (0.2 * (1 - dd / 14000)).toFixed(3) + ')'; x.lineWidth = 1; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(q.x, q.y); x.stroke(); } }
        }
      }
      requestAnimationFrame(draw);
    }
    document.addEventListener('visibilitychange', function () { run = !document.hidden; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { vis = e[0].isIntersecting; }).observe(cv);
    draw();
  })();

  /* tilt + magnetic buttons (mouse only, bounded) */
  if (fine && !reduce) {
    $$('.tilt').forEach(function (c) {
      c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width - .5, py = (e.clientY - r.top) / r.height - .5; c.style.transform = 'perspective(800px) rotateX(' + (-py * 5).toFixed(2) + 'deg) rotateY(' + (px * 5).toFixed(2) + 'deg) translateY(-6px)'; });
      c.addEventListener('pointerleave', function () { c.style.transform = ''; });
    });
    $$('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) { var r = b.getBoundingClientRect(); b.style.setProperty('--mx', Math.max(-5, Math.min(5, (e.clientX - r.left - r.width / 2) * .08)) + 'px'); b.style.setProperty('--my', Math.max(-4, Math.min(4, (e.clientY - r.top - r.height / 2) * .12)) + 'px'); });
      b.addEventListener('pointerleave', function () { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
  }

  /* sticky project stack: previous card scales back as the next arrives (desktop only) */
  var cards = $$('.proj-card');
  function stack() {
    cards.forEach(function (c, i) {
      var n = cards[i + 1];
      if (reduce || innerWidth < 1024 || !n || getComputedStyle(c).position !== 'sticky') { c.style.transform = ''; c.style.filter = ''; return; }
      var top = parseFloat(getComputedStyle(c).top) || 90, h = c.offsetHeight, p = Math.max(0, Math.min(1, 1 - (n.getBoundingClientRect().top - top) / h));
      c.style.transform = 'scale(' + (1 - p * .07).toFixed(4) + ')'; c.style.filter = p > 0 ? 'brightness(' + (1 - p * .08).toFixed(3) + ')' : '';
    });
  }
  if (cards.length) { var st = 0; addEventListener('scroll', function () { if (!st) st = requestAnimationFrame(function () { st = 0; stack(); }); }, { passive: true }); addEventListener('resize', stack); stack(); }

  /* back to top */
  var up = $('#up'); if (up) up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });


})();


/* Services coverflow + quick-view dialogs */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cf = document.getElementById('cf'); if (!cf) return;
  var it = $$('.ci', cf), n = it.length, cur = 0, dots = document.getElementById('cfc'), st = document.getElementById('cfs');
  var user = false, hov = false, foc = false, off = true, hid = document.hidden, tm = null, drag = null, dlgOpen = false;
  var pp = document.createElement('button'); pp.className = 'pp'; pp.type = 'button';
  for (var i = 0; i < n; i++) (function (i) { var d = document.createElement('button'); d.className = 'dt'; d.type = 'button'; d.setAttribute('aria-label', 'Show service ' + (i + 1) + ' of ' + n); d.onclick = function () { go(i); }; dots.appendChild(d); })(i);
  dots.appendChild(pp);
  function go(i) { cur = (i + n) % n; lay(); }
  function focusServiceFromLink() {
    var hash = '/haseeb-crafts/services/' + location.search;
    if (!hash.startsWith('/haseeb-crafts/services/?')) return;
    var match = hash.match(/[?&]card=(\d+)(?:&|$)/);
    if (!match) return;
    var index = Number(match[1]);
    if (!Number.isInteger(index) || index < 0 || index >= n) return;
    user = true; go(index); sync();
  }
  window.addEventListener('hashchange', function () { setTimeout(focusServiceFromLink, 70); });
  setTimeout(focusServiceFromLink, 120);

  function lay() {
    var w = it[0].offsetWidth; if (!w) return;
    var m = window.innerWidth < 760, step = w * (m ? .74 : .66), vis = m ? 1 : 2;
    it.forEach(function (c, i) {
      var d = i - cur; if (d > n / 2) d -= n; if (d < -n / 2) d += n;
      var a = Math.abs(d), show = a <= vis;
      c.style.transform = 'translate(calc(-50% + ' + (d * step).toFixed(1) + 'px),-50%) scale(' + (1 - .13 * a).toFixed(3) + ') rotateY(' + (-d * 14) + 'deg)';
      c.style.zIndex = 20 - a; c.style.opacity = show ? (1 - .26 * a) : 0; c.style.pointerEvents = show ? 'auto' : 'none';
      c.classList.toggle('on', d === 0); c.setAttribute('aria-hidden', show ? 'false' : 'true');
      $$('a,button', c).forEach(function (b) { b.tabIndex = d === 0 ? 0 : -1; });
    });
    $$('.dt', dots).forEach(function (d, i) { if (i === cur) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
    st.textContent = 'Service ' + (cur + 1) + ' of ' + n + ': ' + $('h3', it[cur]).textContent;
  }
  it.forEach(function (c, i) { c.addEventListener('click', function (e) { if (e.target.closest('a,button')) return; if (i !== cur) go(i); }); });
  $('#pv').onclick = function () { go(cur - 1); }; $('#nx').onclick = function () { go(cur + 1); };
  cf.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); } });
  cf.addEventListener('pointerdown', function (e) { if (e.target.closest('a,button')) return; drag = { x: e.clientX, y: e.clientY }; });
  window.addEventListener('pointerup', function (e) { if (!drag) return; var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag = null; if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + (dx < 0 ? 1 : -1)); });
  cf.style.touchAction = 'pan-y';
  function should() { return !reduce && !user && !hov && !foc && !off && !hid && !dlgOpen; }
  function sync() {
    if (should()) { if (!tm) tm = setInterval(function () { go(cur + 1); }, 5200); } else if (tm) { clearInterval(tm); tm = null; }
    if (reduce) { pp.disabled = true; pp.textContent = 'Autoplay off'; } else { pp.textContent = user ? 'Play' : 'Pause'; pp.setAttribute('aria-label', user ? 'Play automatic carousel' : 'Pause automatic carousel'); }
  }
  pp.onclick = function () { user = !user; sync(); };
  cf.addEventListener('mouseenter', function () { hov = true; sync(); }); cf.addEventListener('mouseleave', function () { hov = false; sync(); });
  cf.addEventListener('focusin', function () { foc = true; sync(); }); cf.addEventListener('focusout', function (e) { if (!cf.contains(e.relatedTarget)) { foc = false; sync(); } });
  document.addEventListener('visibilitychange', function () { hid = document.hidden; sync(); });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (e) { off = !e[0].isIntersecting; sync(); }, { threshold: .3 }).observe(cf); else off = false;
  window.addEventListener('resize', function () { lay(); sync(); });
  /* quick-view dialogs */
  var last = null;
  $$('[data-svc-open]').forEach(function (b) {
    b.addEventListener('click', function () {
      var d = document.getElementById(b.getAttribute('data-svc-open')); if (!d || typeof d.showModal !== 'function') return;
      last = b; dlgOpen = true; sync(); document.body.classList.add('no-scroll'); d.showModal(); var x = $('[data-svc-close]', d); if (x) x.focus();
    });
  });
  $$('.svc-dlg').forEach(function (d) {
    $('[data-svc-close]', d).addEventListener('click', function () { d.close(); });
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); else if (e.target.closest('a')) d.close(); });
    d.addEventListener('close', function () { dlgOpen = false; document.body.classList.remove('no-scroll'); sync(); if (last && document.contains(last) && !d.__nav) last.focus(); });
  });
  lay(); sync();
})();



/* v3: header pill + menu, gold smoke, scroll reveal, grow-on-scroll video, pinned portfolio, services preview, FAQ */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); }, $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function vis(el) { return !!el && el.offsetParent !== null; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------- header: bar at top, floating pill after scrolling, full-screen menu ---------- */
  var hd = $('#hd'), pill = $('#pill'), menu = $('#menu'), mx = $('#menu-x'), lastFocus = null;
  function scrolled() { var y = window.pageYOffset || document.documentElement.scrollTop; hd.classList.toggle('pm', y > 70); pill.classList.toggle('show', y > 70); }
  function openMenu() { lastFocus = document.activeElement; menu.classList.add('open'); menu.removeAttribute('aria-hidden'); pill.setAttribute('aria-expanded', 'true'); document.body.classList.add('no-scroll'); setTimeout(function () { mx.focus(); }, 50); }
  function closeMenu(refocus) { menu.classList.remove('open'); menu.setAttribute('aria-hidden', 'true'); pill.setAttribute('aria-expanded', 'false'); document.body.classList.remove('no-scroll'); if (refocus && lastFocus) lastFocus.focus(); }
  if (pill) pill.addEventListener('click', function () { menu.classList.contains('open') ? closeMenu(true) : openMenu(); });
  if (mx) mx.addEventListener('click', function () { closeMenu(true); });
  if (menu) menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu && menu.classList.contains('open')) closeMenu(true); });

  /* ---------- gold smoke: real-time fluid simulation (WebGL), falls back to a light canvas version ---------- */
  (function () {
    var cv = $('#smoke'); if (!cv) return;
    var CFG = { SIM: 128, DYE: 640, DENS_DISS: 1.3, VEL_DISS: 0.5, PRESSURE: 0.8, ITER: 14, CURL: 36, RADIUS: 0.07, FORCE: reduce ? 2600 : 4200, HOLD: 9000 };
    var gl = null, ok = false;
    var isGL2 = false, GLO = { alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false };
    try { if (!window.HC_FORCE_GL1) { gl = cv.getContext('webgl2', GLO); isGL2 = !!gl; } } catch (e) { gl = null; }
    if (!gl) { try { gl = cv.getContext('webgl', GLO); } catch (e) { gl = null; } }
    if (gl) { try { ok = initGL(); } catch (e) { ok = false; if (window.console) console.warn('smoke: WebGL init failed', e); } }
    if (!ok) { if (window.console) console.warn('smoke: using the light fallback'); fallback(); return; }

    function initGL() {
      var types = [];
      if (isGL2) {
        gl.getExtension('EXT_color_buffer_float'); gl.getExtension('EXT_color_buffer_half_float'); var fl2 = gl.getExtension('OES_texture_float_linear');
        types.push({ t: gl.HALF_FLOAT, i: gl.RGBA16F, linear: true }); types.push({ t: gl.FLOAT, i: gl.RGBA32F, linear: !!fl2 });
      } else {
        var hf = gl.getExtension('OES_texture_half_float'), hfl = gl.getExtension('OES_texture_half_float_linear'); gl.getExtension('EXT_color_buffer_half_float');
        var ff = gl.getExtension('OES_texture_float'), ffl = gl.getExtension('OES_texture_float_linear'); gl.getExtension('WEBGL_color_buffer_float');
        if (hf && hfl) types.push({ t: hf.HALF_FLOAT_OES, i: gl.RGBA, linear: true }); if (ff && ffl) types.push({ t: gl.FLOAT, i: gl.RGBA, linear: true }); if (hf) types.push({ t: hf.HALF_FLOAT_OES, i: gl.RGBA, linear: false }); if (ff) types.push({ t: gl.FLOAT, i: gl.RGBA, linear: false });
      }
      var T = null;
      for (var i = 0; i < types.length && !T; i++) { if (testFBO(types[i].t, types[i].i)) T = types[i]; }
      if (!T) return false;
      var texType = T.t, intFmt = T.i, filt = T.linear ? gl.LINEAR : gl.NEAREST, manual = !T.linear;
      var vs = 'precision highp float;attribute vec2 aPosition;varying vec2 vUv,vL,vR,vT,vB;uniform vec2 texelSize;void main(){vUv=aPosition*.5+.5;vL=vUv-vec2(texelSize.x,0.);vR=vUv+vec2(texelSize.x,0.);vT=vUv+vec2(0.,texelSize.y);vB=vUv-vec2(0.,texelSize.y);gl_Position=vec4(aPosition,0.,1.);}';
      var H = 'precision highp float;precision mediump sampler2D;varying highp vec2 vUv,vL,vR,vT,vB;';
      var bil = 'vec4 bilerp(sampler2D s,vec2 uv,vec2 ts){vec2 st=uv/ts-.5;vec2 iuv=floor(st);vec2 f=fract(st);vec4 a=texture2D(s,(iuv+vec2(.5,.5))*ts);vec4 b=texture2D(s,(iuv+vec2(1.5,.5))*ts);vec4 c=texture2D(s,(iuv+vec2(.5,1.5))*ts);vec4 d=texture2D(s,(iuv+vec2(1.5,1.5))*ts);return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}';
      var P = {
        splat: prog(vs, H + 'uniform sampler2D uTarget;uniform float aspectRatio;uniform vec3 color;uniform vec2 point;uniform float radius;void main(){vec2 p=vUv-point.xy;p.x*=aspectRatio;vec3 s=exp(-dot(p,p)/radius)*color;vec3 b=texture2D(uTarget,vUv).xyz;gl_FragColor=vec4(b+s,1.);}'),
        adv: prog(vs, H + (manual ? bil : '') + 'uniform sampler2D uVelocity;uniform sampler2D uSource;uniform vec2 texelSize;uniform vec2 dyeTexelSize;uniform float dt;uniform float dissipation;void main(){' + (manual ? 'vec2 coord=vUv-dt*bilerp(uVelocity,vUv,texelSize).xy*texelSize;vec4 r=bilerp(uSource,coord,dyeTexelSize);' : 'vec2 coord=vUv-dt*texture2D(uVelocity,vUv).xy*texelSize;vec4 r=texture2D(uSource,coord);') + 'float decay=1.+dissipation*dt;gl_FragColor=r/decay;}'),
        div: prog(vs, H + 'uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).x;float R=texture2D(uVelocity,vR).x;float T=texture2D(uVelocity,vT).y;float B=texture2D(uVelocity,vB).y;vec2 C=texture2D(uVelocity,vUv).xy;if(vL.x<0.)L=-C.x;if(vR.x>1.)R=-C.x;if(vT.y>1.)T=-C.y;if(vB.y<0.)B=-C.y;gl_FragColor=vec4(.5*(R-L+T-B),0.,0.,1.);}'),
        curl: prog(vs, H + 'uniform sampler2D uVelocity;void main(){float L=texture2D(uVelocity,vL).y;float R=texture2D(uVelocity,vR).y;float T=texture2D(uVelocity,vT).x;float B=texture2D(uVelocity,vB).x;gl_FragColor=vec4(.5*(R-L-T+B),0.,0.,1.);}'),
        vort: prog(vs, H + 'uniform sampler2D uVelocity;uniform sampler2D uCurl;uniform float curl;uniform float dt;void main(){float L=texture2D(uCurl,vL).x;float R=texture2D(uCurl,vR).x;float T=texture2D(uCurl,vT).x;float B=texture2D(uCurl,vB).x;float C=texture2D(uCurl,vUv).x;vec2 f=.5*vec2(abs(T)-abs(B),abs(R)-abs(L));f/=length(f)+.0001;f*=curl*C;f.y*=-1.;vec2 v=texture2D(uVelocity,vUv).xy;v+=f*dt;v=min(max(v,-1000.),1000.);gl_FragColor=vec4(v,0.,1.);}'),
        press: prog(vs, H + 'uniform sampler2D uPressure;uniform sampler2D uDivergence;void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;float d=texture2D(uDivergence,vUv).x;gl_FragColor=vec4((L+R+B+T-d)*.25,0.,0.,1.);}'),
        grad: prog(vs, H + 'uniform sampler2D uPressure;uniform sampler2D uVelocity;void main(){float L=texture2D(uPressure,vL).x;float R=texture2D(uPressure,vR).x;float T=texture2D(uPressure,vT).x;float B=texture2D(uPressure,vB).x;vec2 v=texture2D(uVelocity,vUv).xy;v-=vec2(R-L,T-B);gl_FragColor=vec4(v,0.,1.);}'),
        clear: prog(vs, H + 'uniform sampler2D uTexture;uniform float value;void main(){gl_FragColor=value*texture2D(uTexture,vUv);}'),
        disp: prog(vs, H + 'uniform sampler2D uTexture;void main(){vec3 c=texture2D(uTexture,vUv).rgb;float m=max(c.r,max(c.g,c.b));float t=clamp(m*2.0,0.,1.);vec3 col=mix(vec3(0.137,0.325,0.278),vec3(0.60,0.78,0.66),smoothstep(0.0,0.5,t));col=mix(col,vec3(0.80,0.93,0.84),smoothstep(0.5,1.0,t));float a=min(t*0.92,0.7);gl_FragColor=vec4(col*a,a);}')
      };
      var quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
      var idx = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0); gl.enableVertexAttribArray(0);
      function blit(fb) { gl.bindFramebuffer(gl.FRAMEBUFFER, fb ? fb.fbo : null); if (fb) gl.viewport(0, 0, fb.w, fb.h); else gl.viewport(0, 0, cv.width, cv.height); gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0); }
      function prog(v, f) {
        var p = gl.createProgram(); [[gl.VERTEX_SHADER, v], [gl.FRAGMENT_SHADER, f]].forEach(function (s) { var sh = gl.createShader(s[0]); gl.shaderSource(sh, s[1]); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error('shader'); gl.attachShader(p, sh); });
        gl.bindAttribLocation(p, 0, 'aPosition'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link');
        var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (var i = 0; i < n; i++) { var nm = gl.getActiveUniform(p, i).name; u[nm] = gl.getUniformLocation(p, nm); } return { p: p, u: u };
      }
      function testFBO(type, ifmt) {
        while (gl.getError() !== gl.NO_ERROR) { }
        var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texImage2D(gl.TEXTURE_2D, 0, ifmt, 4, 4, 0, gl.RGBA, type, null);
        var f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
        var okk = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE && !gl.getError(); gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.deleteFramebuffer(f); gl.deleteTexture(t); return okk;
      }
      function fbo(w, h) {
        var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filt); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filt);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texImage2D(gl.TEXTURE_2D, 0, intFmt, w, h, 0, gl.RGBA, texType, null);
        var f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0); gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        return { tex: t, fbo: f, w: w, h: h, tx: 1 / w, ty: 1 / h, attach: function (id) { gl.activeTexture(gl.TEXTURE0 + id); gl.bindTexture(gl.TEXTURE_2D, t); return id; } };
      }
      function dbl(w, h) { var a = fbo(w, h), b = fbo(w, h); return { w: w, h: h, tx: a.tx, ty: a.ty, get read() { return a; }, get write() { return b; }, swap: function () { var t = a; a = b; b = t; } }; }
      var vel, dye, div, curl, pr, aspect = 1;
      function res(r) { var a = cv.width / cv.height; if (a < 1) a = 1 / a; var mn = Math.round(r), mx = Math.round(r * a); return cv.width > cv.height ? { w: mx, h: mn } : { w: mn, h: mx }; }
      function build() {
        var D = Math.min(window.devicePixelRatio || 1, 1); cv.width = Math.max(2, Math.round(window.innerWidth * D * 0.75)); cv.height = Math.max(2, Math.round(window.innerHeight * D * 0.75)); aspect = cv.width / cv.height;
        var s = res(CFG.SIM), d = res(CFG.DYE); vel = dbl(s.w, s.h); dye = dbl(d.w, d.h); div = fbo(s.w, s.h); curl = fbo(s.w, s.h); pr = dbl(s.w, s.h);
      }
      build();
      function use(pg) { gl.useProgram(pg.p); return pg.u; }
      var active = false, raf = 0, last = 0, until = 0;
      function splat(x, y, dx, dy, col) {
        var u = use(P.splat); gl.uniform1i(u.uTarget, vel.read.attach(0)); gl.uniform1f(u.aspectRatio, aspect); gl.uniform2f(u.point, x, y); gl.uniform3f(u.color, dx, dy, 0);
        var r = CFG.RADIUS / 100; if (aspect > 1) r *= aspect; gl.uniform1f(u.radius, r); blit(vel.write); vel.swap();
        gl.uniform1i(u.uTarget, dye.read.attach(0)); gl.uniform3f(u.color, col[0], col[1], col[2]); blit(dye.write); dye.swap();
        until = performance.now() + CFG.HOLD; wake();
      }
      function step(dt) {
        gl.disable(gl.BLEND);
        var u = use(P.curl); gl.uniform2f(u.texelSize, vel.tx, vel.ty); gl.uniform1i(u.uVelocity, vel.read.attach(0)); blit(curl);
        u = use(P.vort); gl.uniform2f(u.texelSize, vel.tx, vel.ty); gl.uniform1i(u.uVelocity, vel.read.attach(0)); gl.uniform1i(u.uCurl, curl.attach(1)); gl.uniform1f(u.curl, CFG.CURL); gl.uniform1f(u.dt, dt); blit(vel.write); vel.swap();
        u = use(P.div); gl.uniform2f(u.texelSize, vel.tx, vel.ty); gl.uniform1i(u.uVelocity, vel.read.attach(0)); blit(div);
        u = use(P.clear); gl.uniform2f(u.texelSize, vel.tx, vel.ty); gl.uniform1i(u.uTexture, pr.read.attach(0)); gl.uniform1f(u.value, CFG.PRESSURE); blit(pr.write); pr.swap();
        u = use(P.press); gl.uniform2f(u.texelSize, vel.tx, vel.ty); gl.uniform1i(u.uDivergence, div.attach(0));
        for (var i = 0; i < CFG.ITER; i++) { gl.uniform1i(u.uPressure, pr.read.attach(1)); blit(pr.write); pr.swap(); }
        u = use(P.grad); gl.uniform2f(u.texelSize, vel.tx, vel.ty); gl.uniform1i(u.uPressure, pr.read.attach(0)); gl.uniform1i(u.uVelocity, vel.read.attach(1)); blit(vel.write); vel.swap();
        u = use(P.adv); gl.uniform2f(u.texelSize, vel.tx, vel.ty); gl.uniform2f(u.dyeTexelSize, vel.tx, vel.ty); var vid = vel.read.attach(0); gl.uniform1i(u.uVelocity, vid); gl.uniform1i(u.uSource, vid); gl.uniform1f(u.dt, dt); gl.uniform1f(u.dissipation, CFG.VEL_DISS); blit(vel.write); vel.swap();
        gl.uniform2f(u.dyeTexelSize, dye.tx, dye.ty); gl.uniform1i(u.uVelocity, vel.read.attach(0)); gl.uniform1i(u.uSource, dye.read.attach(1)); gl.uniform1f(u.dissipation, CFG.DENS_DISS); blit(dye.write); dye.swap();
      }
      function draw() { gl.disable(gl.BLEND); var u = use(P.disp); gl.uniform1i(u.uTexture, dye.read.attach(0)); blit(null); }
      function frame(now) {
        raf = 0; if (document.hidden) { active = false; return; }
        var dt = Math.min((now - last) / 1000 || 0.016, 0.0166); last = now; step(dt); draw();
        if (now < until) raf = requestAnimationFrame(frame); else { active = false; gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
      }
      function wake() { if (!raf) { active = true; last = performance.now(); raf = requestAnimationFrame(frame); } }
      var px = null, py = null;
      function dxc(d) { return aspect < 1 ? d * aspect : d; } function dyc(d) { return aspect > 1 ? d / aspect : d; }
      function move(cx, cy) {
        var x = cx / window.innerWidth, y = 1 - cy / window.innerHeight;
        if (px !== null) {
          var dx = dxc(x - px) * CFG.FORCE, dy = dyc(y - py) * CFG.FORCE, sp = Math.min(1, Math.sqrt(dx * dx + dy * dy) / 450);
          if (sp > 0.0006) { var k = (reduce ? 0.08 : 0.12) + (reduce ? 0.12 : 0.22) * sp; splat(x, y, dx, dy, [0.62 * k, 0.88 * k, 0.70 * k]); }
        }
        px = x; py = y;
      }
      window.addEventListener('pointermove', function (e) { move(e.clientX, e.clientY); }, { passive: true });
      window.addEventListener('touchstart', function (e) { var t = e.touches && e.touches[0]; if (t) { px = t.clientX / window.innerWidth; py = 1 - t.clientY / window.innerHeight; } }, { passive: true });
      window.addEventListener('touchmove', function (e) { var t = e.touches && e.touches[0]; if (t) move(t.clientX, t.clientY); }, { passive: true });
      document.addEventListener('pointerleave', function () { px = null; });
      window.addEventListener('resize', function () { build(); });
      // a few soft wisps on arrival so the effect is visible before the first mouse move
      if (!reduce) setTimeout(function () { for (var i = 0; i < 5; i++) splat(0.22 + Math.random() * 0.56, 0.3 + Math.random() * 0.45, (Math.random() - .5) * 420, (Math.random() - .3) * 560, [.12, .17, .13]); }, 700);
      if (!reduce) setInterval(function () { if (!document.hidden && !active) splat(Math.random(), 0.2 + Math.random() * 0.6, (Math.random() - .5) * 420, 260 + Math.random() * 200, [.05, .075, .058]); }, 7000);
      window.HC_SMOKE_INFO = isGL2 ? 'webgl2' : 'webgl1';
      return true;
    }

    function fallback() {
      var n = document.createElement('canvas'); n.id = 'smoke'; n.setAttribute('aria-hidden', 'true'); cv.parentNode.replaceChild(n, cv); cv = n;
      var cx = cv.getContext('2d'), W, H, D = Math.min(window.devicePixelRatio || 1, 1.5), P = [], last = null, raf = 0, t0 = 0;
      function size() { W = window.innerWidth; H = window.innerHeight; cv.width = W * D; cv.height = H * D; cx.setTransform(D, 0, 0, D, 0, 0); }
      size(); window.addEventListener('resize', size);
      var spr = document.createElement('canvas'); spr.width = spr.height = 128; var g = spr.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(170,220,188,1)'); gr.addColorStop(.35, 'rgba(120,176,146,.55)'); gr.addColorStop(1, 'rgba(90,150,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
      function spawn(x, y, vx, vy, big) { if (P.length > 110) P.shift(); P.push({ x: x, y: y, vx: vx + (Math.random() - .5) * .6, vy: vy + (Math.random() - .5) * .6 - .15, r: (big ? 46 : 22) + Math.random() * (big ? 40 : 18), age: 0, max: (big ? 2800 : 1800) + Math.random() * 900, s: Math.random() * 1000 }); }
      function step(now) {
        var dt = Math.min(40, now - t0); t0 = now; cx.clearRect(0, 0, W, H);
        for (var i = P.length - 1; i >= 0; i--) { var p = P[i]; p.age += dt; if (p.age >= p.max) { P.splice(i, 1); continue; } var l = p.age / p.max, ang = (Math.sin(p.s + p.age * .0016) + Math.sin(p.s * 1.7 - p.age * .001) * .6) * 1.6; p.vx += Math.cos(ang) * .035; p.vy += Math.sin(ang) * .035 - .006; p.vx *= .985; p.vy *= .985; p.x += p.vx * dt * .06; p.y += p.vy * dt * .06; p.r += dt * .012; cx.globalAlpha = Math.sin(Math.min(1, l * 1.4) * Math.PI * .5) * Math.pow(1 - l, 1.6) * .3; var d = p.r * 2; cx.drawImage(spr, p.x - p.r, p.y - p.r, d, d); }
        cx.globalAlpha = 1; raf = P.length ? requestAnimationFrame(step) : 0;
      }
      function kick() { if (!raf) { t0 = performance.now(); raf = requestAnimationFrame(step); } }
      window.addEventListener('pointermove', function (e) { var x = e.clientX, y = e.clientY; if (last) { var dx = x - last.x, dy = y - last.y, dist = Math.sqrt(dx * dx + dy * dy), n2 = Math.min(4, Math.floor(dist / 14)); for (var k = 1; k <= n2; k++) spawn(last.x + dx * k / n2, last.y + dy * k / n2, dx * .05, dy * .05, false); } else spawn(x, y, 0, 0, false); last = { x: x, y: y }; kick(); }, { passive: true });
    }
  })();

  /* ---------- hero words ---------- */
  $$('.h3-h1').forEach(function (h) { requestAnimationFrame(function () { h.classList.add('in'); }); });

  /* ---------- statement: words fill in as you scroll ---------- */
  var st = $('.h3-st'), words = st ? $$('.sw', st) : [];
  function stUpdate() {
    if (!st || !vis(st)) return; if (reduce) { words.forEach(function (w) { w.style.opacity = 1; }); return; }
    var r = st.getBoundingClientRect(), run = r.height - window.innerHeight, p = run > 0 ? clamp(-r.top / run, 0, 1) : 1, n = words.length;
    words.forEach(function (w, i) { var t = clamp((p * 1.05 - i / n * .85 - .02) / (2.2 / n), 0, 1); w.style.opacity = (.16 + .84 * t).toFixed(3); });
  }

  /* ---------- intro video that grows while you scroll; plays only while visible ---------- */
  var inn = $('.h3-in'), vf = $('.h3-vf'), lab = $('.h3-in-lab'), vid = vf ? $('video', vf) : null, vbtn = vf ? $('.h3-vp', vf) : null;
  var vInit = false, vReady = false, userPaused = false, vVisible = false;
  function blob(id, type) { var el = document.getElementById(id); if (!el) return ''; var bin = atob(el.textContent.replace(/\s+/g, '')), n = bin.length, u = new Uint8Array(n); for (var i = 0; i < n; i++) u[i] = bin.charCodeAt(i); el.textContent = ''; return URL.createObjectURL(new Blob([u], { type: type })); }
  function vInitNow() {
    if (vInit || !vid) return; vInit = true; vid.muted = true; vid.defaultMuted = true; vid.loop = true; vid.playsInline = true; vid.setAttribute('playsinline', ''); vid.setAttribute('muted', '');
    vid.addEventListener('loadeddata', function () { vReady = true; vid.classList.add('on'); vSync(); });
    vid.addEventListener('play', function () { vf.classList.add('playing'); }); vid.addEventListener('pause', function () { vf.classList.remove('playing'); });
    vid.src = (vid.canPlayType && vid.canPlayType('video/mp4; codecs="avc1.4D401F"')) ? blob('hero-mp4', 'video/mp4') : blob('hero-webm', 'video/webm'); vid.load();
  }
  function vSync() { if (!vReady) return; if (vVisible && !userPaused && !reduce && !document.hidden) { var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else vid.pause(); }
  if (vbtn) vbtn.addEventListener('click', function () { if (vid.paused) { userPaused = false; var p = vid.play(); if (p && p.catch) p.catch(function () {}); } else { userPaused = true; vid.pause(); } });
  if ('IntersectionObserver' in window && vf) new IntersectionObserver(function (e) { vVisible = e[0].isIntersecting; if (vVisible) vInitNow(); vSync(); }, { threshold: .35 }).observe(vf);
  function inUpdate() {
    if (!inn || !vf || !vis(inn)) return; var r = inn.getBoundingClientRect(), run = r.height - window.innerHeight, p = run > 0 ? clamp(-r.top / run * 1.3, 0, 1) : 1;
    var e = 1 - Math.pow(1 - p, 2.2), maxW = Math.min(1180, window.innerWidth - 32), minW = Math.min(340, window.innerWidth * .72);
    vf.style.width = (reduce ? maxW : minW + (maxW - minW) * e).toFixed(1) + 'px'; vf.style.borderRadius = (18 - 6 * e).toFixed(1) + 'px'; if (lab) lab.style.opacity = (1 - clamp(p * 2.4, 0, 1)).toFixed(2);
    if (r.top < window.innerHeight * 1.6 && r.bottom > -200) vInitNow();
  }

  /* ---------- portfolio: vertical scroll drives a horizontal track (native swipe on phones) ---------- */
  var wk = $('.h3-wk'), tr = wk ? $('.h3-wk-t', wk) : null;
  function wkLayout() {
    if (!wk || !vis(wk)) return; var native = window.innerWidth < 900 || reduce; wk.classList.toggle('native', native);
    if (native) { wk.style.height = ''; tr.style.transform = ''; return; }
    var over = Math.max(0, tr.scrollWidth - window.innerWidth + 40); wk.style.height = (window.innerHeight + over) + 'px'; wk.setAttribute('data-over', over); wkMove();
  }
  function wkMove() {
    if (!wk || !vis(wk) || wk.classList.contains('native')) return; var over = +wk.getAttribute('data-over') || 0, r = wk.getBoundingClientRect();
    tr.style.transform = 'translate3d(' + (-clamp(-r.top / (over || 1), 0, 1) * over).toFixed(1) + 'px,0,0)';
  }

  /* ---------- services: hovering a row swaps the photo ---------- */
  var rows = $$('.sv-row'), simgs = $$('.sv-img img');
  function showSv(i) { simgs.forEach(function (im, j) { im.classList.toggle('on', j === (i % simgs.length)); }); }
  if (simgs.length) { showSv(0); rows.forEach(function (r, i) { r.addEventListener('mouseenter', function () { showSv(i); }); r.addEventListener('focus', function () { showSv(i); }); }); }

  /* ---------- FAQ: one open at a time ---------- */
  $$('.fq3').forEach(function (list) { var ds = $$('details', list); ds.forEach(function (d) { d.addEventListener('toggle', function () { if (d.open) ds.forEach(function (o) { if (o !== d) o.open = false; }); }); }); });

  /* ---------- one rAF-throttled updater ---------- */
  var tk = 0;
  function all() { tk = 0; scrolled(); stUpdate(); inUpdate(); wkMove(); }
  function req() { if (!tk) tk = requestAnimationFrame(all); }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', function () { wkLayout(); req(); });
  document.addEventListener('visibilitychange', vSync);
  wkLayout(); all();
  window.addEventListener('load', function () { wkLayout(); all(); });
})();



(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  /* ===== real client / user videos (runtime, configured in #hc-config) ===== */
  var CFG = window.HC_VIDEOS || { client: [], user: [] }, PLAY = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  var FILM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M10 9.5v5l4.5-2.5z"/></svg>';
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mount(f, src, title, onerr) {
    f.classList.remove('playing');
    f.innerHTML = '<video preload="metadata" playsinline></video><button class="vplay" type="button" aria-label="Play video: ' + esc(title || 'video') + '">' + PLAY + '</button>';
    var v = $('video', f), pb = $('.vplay', f), failed = false;
    v.addEventListener('error', function () { if (!failed) { failed = true; if (onerr) onerr(); } });
    v.src = src.indexOf('blob:') === 0 ? src : src + '#t=0.1';
    pb.addEventListener('click', function () { $$('video').forEach(function (o) { if (o !== v) o.pause(); }); v.controls = true; var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); });
    v.addEventListener('play', function () { f.classList.add('playing'); v.controls = true; });
    v.addEventListener('pause', function () { if (v.ended || v.currentTime === 0) f.classList.remove('playing'); });
    v.addEventListener('ended', function () { f.classList.remove('playing'); });
    return v;
  }
  function empty(f, file, title) {
    f.classList.remove('playing');
    f.innerHTML = '<div class="vempty">' + FILM + '<b>Video coming soon</b><code>' + esc(file) + '</code><label class="vpick">Preview a file from this device<input type="file" accept="video/*" hidden></label></div>';
    $('input', f).addEventListener('change', function (e) { var file2 = e.target.files && e.target.files[0]; if (!file2) return; mount(f, URL.createObjectURL(file2), title, function () { empty(f, file, title); }); });
  }
  function card(v, kind) {
    var a = document.createElement('article'); a.className = 'vcard';
    a.innerHTML = '<div class="vframe' + (v.vertical ? ' v9' : '') + '"></div><div class="vbody"><small>' + (kind === 'client' ? 'Client' : 'User') + ' video</small><h3>' + esc(v.title) + '</h3>' + (v.who ? '<p>' + esc(v.who) + '</p>' : '') + '</div>';
    var f = $('.vframe', a); mount(f, v.file, v.title, function () { empty(f, v.file, v.title); }); return a;
  }
  function initVideos(root) {
    $$('[data-render]', root).forEach(function (g) { if (g.getAttribute('data-done')) return; g.setAttribute('data-done', '1'); (CFG[g.getAttribute('data-render')] || []).forEach(function (v) { g.appendChild(card(v, g.getAttribute('data-render'))); }); });
    $$('.vsingle', root).forEach(function (w) {
      if (w.getAttribute('data-done')) return; w.setAttribute('data-done', '1');
      var file = w.getAttribute('data-file') === 'showreel' ? (CFG.showreel || '/haseeb-crafts/videos/showreel.mp4') : w.getAttribute('data-file'), f = $('.vframe', w);
      var v = mount(f, file, w.getAttribute('data-title'), function () { w.hidden = true; });
      v.addEventListener('loadedmetadata', function () { w.hidden = false; });
    });
    $$('.vtabs', root).forEach(function (tabs) {
      var sec = tabs.parentNode, bs = $$('button', tabs);
      bs.forEach(function (b) { b.addEventListener('click', function () {
        bs.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        $$('.vgrid', sec).forEach(function (g) { g.hidden = g.getAttribute('data-group') !== b.getAttribute('data-group'); $$('video', g).forEach(function (vv) { vv.pause(); }); });
      }); });
    });
  }
  window.HC_initVideos = initVideos;
  var cv0 = window.HC_currentView && window.HC_currentView(); if (cv0) initVideos(cv0);
})();

if(!document.documentElement.classList.contains('ready')&&window.HC_hydrateAll){window.HC_hydrateAll()}

/* HASEEB CRAFTS homepage: 3D image carousel based on the supplied WebNextOnline interaction */
(function(){
  'use strict';
  var root=document.getElementById('sv-home'),stage=document.getElementById('hc-sc-stage');if(!root||!stage)return;
  var ring=document.getElementById('hc-sc-ring');var cards=Array.prototype.slice.call(ring.querySelectorAll('[data-hc-card]'));
  var dotsBox=document.getElementById('hc-sc-dots');var title=document.getElementById('hc-sc-title');var desc=document.getElementById('hc-sc-desc');var cat=document.getElementById('hc-sc-category');var more=document.getElementById('hc-sc-more');var discuss=document.getElementById('hc-sc-discuss');
  var data=[{"name": "Website Development", "description": "Responsive websites, landing pages and modern digital experiences.", "category": "Web Design", "details": "/haseeb-crafts/services/website-development/", "contact": "website-development"}, {"name": "WordPress & Elementor", "description": "Editable websites, custom Elementor layouts and WordPress setups.", "category": "WordPress", "details": "/haseeb-crafts/services/wordpress-elementor/", "contact": "wordpress-elementor"}, {"name": "Motion Graphics", "description": "Cinematic animated promos, typography, explainers and branded visuals.", "category": "Motion Design", "details": "/haseeb-crafts/services/motion-graphics/", "contact": "motion-graphics"}, {"name": "Video Editing", "description": "Polished edits, motion titles, captions and social-first videos.", "category": "Video Production", "details": "/haseeb-crafts/services/video-editing/", "contact": "video-editing"}, {"name": "Branding & Identity", "description": "Memorable logos, visual identities, posters and graphic design.", "category": "Brand Design", "details": "/haseeb-crafts/services/branding-identity/", "contact": "branding-identity"}, {"name": "Social Media Design", "description": "Content creatives, campaign visuals, reels covers and templates.", "category": "Social Creative", "details": "/haseeb-crafts/services/social-media-design/", "contact": "social-media-design"}, {"name": "Chrome Extensions", "description": "Custom browser tools to simplify tasks and improve workflows.", "category": "Browser Tools", "details": "/haseeb-crafts/services/?to=services&card=6", "contact": "chrome-extensions"}, {"name": "Web Apps & Dashboards", "description": "Interactive web applications, admin panels and tailored interfaces.", "category": "Applications", "details": "/haseeb-crafts/services/?to=services&card=7", "contact": "web-apps"}, {"name": "AI Chatbots & Agents", "description": "Chat interfaces, AI assistants and voice-driven workflow concepts.", "category": "AI Solutions", "details": "/haseeb-crafts/services/?to=services&card=8", "contact": "ai-assistants"}, {"name": "Desktop Software", "description": "Windows utilities, productive desktop tools and app concepts.", "category": "Desktop Apps", "details": "/haseeb-crafts/services/?to=services&card=9", "contact": "desktop-software"}, {"name": "Automation & Integrations", "description": "Connect websites, forms, spreadsheets, alerts and business workflows.", "category": "Automation", "details": "/haseeb-crafts/services/?to=services&card=10", "contact": "automation"}, {"name": "E-commerce & WooCommerce", "description": "Online stores, product experiences and WooCommerce solutions.", "category": "E-commerce", "details": "/haseeb-crafts/services/?to=services&card=11", "contact": "ecommerce"}];
  var c=.75,n=cards.length,W=0,w=0,h=0,R=0,f=0,G=0,T=[0],pos=0,target=0,drag=null,running=false,active=-1,hover=false,focusInside=false,visible=false,moved=0,idle=Date.now(),timer=null;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var dots=data.map(function(item,i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Show '+item.name);b.addEventListener('click',function(){jump(i)});dotsBox.appendChild(b);return b});
  function closest(i){var curr=Math.round(target);var delta=((i-curr)%n+n)%n;if(delta>n/2)delta-=n;return curr+delta}
  function jump(i){target=closest(i);idle=Date.now();kick()}
  function solve(){
    W=stage.clientWidth;if(!W)return;
    w=Math.min(280,Math.max(195,W<650?W*.66:W*.29));h=w*1.32;G=Math.max(12,Math.min(22,W*.025));
    stage.style.setProperty('--sc-w',w+'px');stage.style.setProperty('--sc-h',h+'px');
    stage.style.height=Math.round(h+28)+'px';render();
  }
  function render(){
    var spacing=w+G;
    cards.forEach(function(el,i){
      var p=((i-pos)%n+n)%n;if(p>n/2)p-=n;
      var x=p*spacing;
      var opacity=Math.max(0,Math.min(1,(W/2+w/2-Math.abs(x))/Math.max(30,w*.35)));
      el.style.transform='translate3d('+x+'px,0,0)';
      el.style.opacity=opacity.toFixed(3);
      el.style.zIndex=100-Math.round(Math.abs(p));
      el.style.pointerEvents=opacity<.08?'none':'auto';
      el.tabIndex=opacity>.35?0:-1;
      el.setAttribute('aria-hidden',opacity<.08?'true':'false');
    });
    setActive(((Math.round(pos)%n)+n)%n);
  }
  function setActive(i){if(i===active)return;active=i;var item=data[i];cat.textContent=item.category;title.textContent=item.name;desc.textContent=item.description;more.href=item.details;discuss.href='/haseeb-crafts/contact/?service='+encodeURIComponent(item.contact)+'&to=start-project';
    dots.forEach(function(b,j){b.classList.toggle('on',j===i);b.setAttribute('aria-current',j===i?'true':'false')});
  }
  function tick(){if(!drag){if(reduce)pos=target;else{pos+=(target-pos)*.16;if(Math.abs(target-pos)<.0008)pos=target;}}render();if(drag||pos!==target)requestAnimationFrame(tick);else running=false}
  function kick(){if(!running){running=true;requestAnimationFrame(tick)}}
  function step(dir){idle=Date.now();target=Math.round(target)+dir;kick()}
  document.getElementById('hc-sc-prev').addEventListener('click',function(){step(-1)});
  document.getElementById('hc-sc-next').addEventListener('click',function(){step(1)});
  cards.forEach(function(el,i){el.addEventListener('click',function(){if(moved>8)return;jump(i)});el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();jump(i)}})});
  stage.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){e.preventDefault();step(-1)}else if(e.key==='ArrowRight'){e.preventDefault();step(1)}});
  stage.addEventListener('pointerdown',function(e){if(e.button!==0||e.target.closest('a'))return;drag={x:e.clientX,p:pos,last:e.clientX,v:0};moved=0;idle=Date.now();});
  window.addEventListener('pointermove',function(e){if(!drag)return;var dx=e.clientX-drag.x;moved=Math.max(moved,Math.abs(dx));drag.v=e.clientX-drag.last;drag.last=e.clientX;pos=drag.p-dx/(w+G);target=pos;kick()});
  function end(){if(!drag)return;target=Math.round(pos-drag.v/(w+G)*4);drag=null;idle=Date.now();kick();setTimeout(function(){moved=0},100)}
  window.addEventListener('pointerup',end);window.addEventListener('pointercancel',end);
  stage.addEventListener('wheel',function(e){if(Math.abs(e.deltaX)<=Math.abs(e.deltaY))return;e.preventDefault();idle=Date.now();target+=e.deltaX/240;kick();clearTimeout(timer);timer=setTimeout(function(){target=Math.round(target);kick()},140)},{passive:false});
  stage.addEventListener('mouseenter',function(){hover=true});stage.addEventListener('mouseleave',function(){hover=false});
  root.addEventListener('focusin',function(){focusInside=true});root.addEventListener('focusout',function(e){if(!root.contains(e.relatedTarget))focusInside=false});
  if('IntersectionObserver'in window){new IntersectionObserver(function(entries){visible=entries[0].isIntersecting},{threshold:.15}).observe(root)}else visible=true;
  window.setInterval(function(){if(!drag&&!hover&&!focusInside&&!reduce&&visible&&!document.hidden&&Date.now()-idle>4800)step(1)},4800);
  if('ResizeObserver'in window)new ResizeObserver(solve).observe(stage);else window.addEventListener('resize',solve);
  solve();
})();
