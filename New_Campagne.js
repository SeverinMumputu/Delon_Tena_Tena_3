
//const TARGET_DATE = new Date(Date.UTC(2025, 11, 1, 0, 0, 0)); // months: 0-11
/* ========== DOM Elements ==========  
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');
const yearEl = document.getElementById('year');  */
const langBtns = Array.from(document.querySelectorAll('.lang-btn'));
const bodyEl = document.body;
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const mobileLangBtns = Array.from(document.querySelectorAll('.mobile-lang .lang-btn'));
const allTextNodes = Array.from(document.querySelectorAll('[data-fr]'));

/* ========== Utilities ========== 
function pad(n){return String(n).padStart(2,'0')}  */

/* Countdown logic 
function updateCountdown(){
  const now = new Date();
  const diff = TARGET_DATE - now;
  if(diff <= 0){
    cdDays.textContent = '00';
    cdHours.textContent = '00';
    cdMins.textContent = '00';
    cdSecs.textContent = '00';
    return;
  }
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / (3600*24));
  const hours = Math.floor((s % (3600*24)) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;

  cdDays.textContent = pad(days);
  cdHours.textContent = pad(hours);
  cdMins.textContent = pad(mins);
  cdSecs.textContent = pad(secs);
}
updateCountdown();
setInterval(updateCountdown, 1000);  */

/* Set current year */
//yearEl.textContent = new Date().getFullYear();

/* Language toggle (simple content swap) */
function setLanguage(lang){
  // set body class for RTL or styles if needed
  bodyEl.classList.remove('fr','en');
  bodyEl.classList.add(lang);

  // update aria-pressed for buttons
  langBtns.forEach(b=>{
    b.classList.toggle('active', b.dataset.lang === lang);
    b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false');
  });
  mobileLangBtns.forEach(b=>{
    b.classList.toggle('active', b.dataset.lang === lang);
  });

  // swap text for every element with data-fr and data-en
  allTextNodes.forEach(el=>{
    const fr = el.getAttribute('data-fr');
    const en = el.getAttribute('data-en');
    if(!fr || !en) return;
    el.textContent = (lang === 'en') ? en : fr;
  });
}

/* Attach language button handlers */
langBtns.forEach(btn=>{
  btn.addEventListener('click', e=>{
    const lang = btn.dataset.lang;
    setLanguage(lang);
  })
});
mobileLangBtns.forEach(btn=>{
  btn.addEventListener('click', e=>{
    const lang = btn.dataset.lang;
    setLanguage(lang);
    // close mobile menu for UX
    closeMobileMenu();
  })
});

/* Initialize default language from body attribute or browser */
(function initLang(){
  let preferred = 'fr';
  // If user previously chose a language, persist in localStorage
  try{
    const stored = localStorage.getItem('dtt_lang');
    if(stored) preferred = stored;
  }catch(e){}
  setLanguage(preferred);
})();

/* Persist language changes */
document.addEventListener('click', e=>{
  if(e.target.matches('.lang-btn')){
    try{ localStorage.setItem('dtt_lang', e.target.dataset.lang) }catch(e){}
  }
});

/* Mobile menu controls */
function openMobileMenu(){
  mobileMenu.setAttribute('aria-hidden','false');
  mobileMenu.style.transform = 'translateX(0)';
  hamburger.setAttribute('aria-expanded','true');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu(){
  mobileMenu.setAttribute('aria-hidden','true');
  mobileMenu.style.transform = 'translateX(120%)';
  hamburger.setAttribute('aria-expanded','false');
  document.body.style.overflow = '';
}
hamburger.addEventListener('click', openMobileMenu);
mobileClose.addEventListener('click', closeMobileMenu);

/* Close mobile menu on outside click */
mobileMenu.addEventListener('click', (e)=>{
  if(e.target === mobileMenu) closeMobileMenu();
});

    // ---------- Small helper functions ----------
    function showToast(message, type='default', duration=4200){
      const t = document.getElementById('toast');
      t.className = 'toast';
      if(type==='success') t.classList.add('success');
      t.textContent = message;
      t.classList.remove('hide');
      if(duration>0){
        setTimeout(()=>{ t.classList.add('hide'); }, duration);
      }
    }

    // ---------- Reveal on scroll ----------
    const reveals = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      })
    },{threshold:0.12});
    reveals.forEach(r=>io.observe(r));

    // ---------- POURQUOI LA CAMPAGNE POUR CEUX QU'ON AIME ? ----------
  // IntersectionObserver: reveal blocks with fade+slide when entering viewport.
  (function(){
    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.08 });

      document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    } else {
      // Fallback: show all
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
    }
  })();

/* ===========================
   SCRIPT COMPTE A REBOURS
   =========================== */
/* Option A: simple constants */
const DURATION_DAYS = 0;
const DURATION_HOURS = 0;
const DURATION_MINUTES = 2;
const DURATION_SECONDS = 0;

/* Option B: or use object (keeps both)
   const duration = { days:2, hours:5, minutes:30, seconds:20 };
*/
const duration = {
  days: DURATION_DAYS,
  hours: DURATION_HOURS,
  minutes: DURATION_MINUTES,
  seconds: DURATION_SECONDS
};

/* Particle intensity mode (you chose B: dynamique) */
const PARTICLES_PER_SECOND = 16; // between 12..20 - dynamic visual
const MAX_PARTICLES = 500;       // safety cap for perf

/* ===========================
   Internal geometry config
   (SVG units, tuned to the viewBox)
   =========================== */
const TOP_CLIP_Y = 40;
const TOP_CLIP_MAX_HEIGHT = 100;   // when full
const BOTTOM_BASE_Y = 200;
const BOTTOM_MAX_HEIGHT = 120;     // maximum visible bottom sand height

/* neck position where particles spawn (approx) */
const NECK_X = 100;
const NECK_Y = 156; // just above the neck to look natural

/* horizontal spawn spread around neck (px) */
const SPAWN_SPREAD = 8;

/* gravity & physics (units px / s^2) scaled for pleasant look */
const GRAVITY = 1400; // px per second^2 (strong to look snappy at screen refresh)
const WIND = 20;      // small horizontal acceleration randomness
const FPS_TARGET = 60;

/* ===========================
   DOM references
   =========================== */
const svg = document.getElementById('hourglass');
const maskTopRect = document.getElementById('maskTopRect');
const maskBottomRect = document.getElementById('maskBottomRect');
const streamGroup = document.getElementById('streamGroup');
const streamParticlesDecor = document.getElementById('streamParticles');
const fallingParticlesGroup = document.getElementById('fallingParticles');
const countdownText = document.getElementById('countdownText');

/* ===========================
   Timer setup - fixed duration
   =========================== */
function durationToSeconds(d){
  return ( (d.days||0)*86400 + (d.hours||0)*3600 + (d.minutes||0)*60 + (d.seconds||0) );
}
let totalSeconds = Math.max(1, durationToSeconds(duration));
let remainingSeconds = totalSeconds; // will decrement
let startTimestamp = null; // set at start of simulation

/* percentage helper: 1 => just started, 0 => finished */
function percentFromRemaining(){
  return Math.max(0, Math.min(1, remainingSeconds / totalSeconds));
}

/* format text */
function formatTimeParts(sec){
  sec = Math.max(0, Math.floor(sec));
  const days = Math.floor(sec / 86400); sec -= days * 86400;
  const hours = Math.floor(sec / 3600); sec -= hours * 3600;
  const minutes = Math.floor(sec / 60); sec -= minutes * 60;
  const seconds = sec;
  return {days,hours,minutes,seconds};
}

/* initial render of masks */
function renderMasksByPercent(p){
  // Top: visible height = TOP_CLIP_MAX_HEIGHT * p
  const topVisible = TOP_CLIP_MAX_HEIGHT * p;
  const topY = TOP_CLIP_Y + (TOP_CLIP_MAX_HEIGHT - topVisible);
  maskTopRect.setAttribute('y', topY.toFixed(2));
  maskTopRect.setAttribute('height', Math.max(0.2, topVisible).toFixed(2));

  // bottom visible = BOTTOM_MAX_HEIGHT * (1 - p)
  const bottomVisible = BOTTOM_MAX_HEIGHT * (1 - p);
  const bottomY = BOTTOM_BASE_Y + (BOTTOM_MAX_HEIGHT - bottomVisible);
  maskBottomRect.setAttribute('y', bottomY.toFixed(2));
  maskBottomRect.setAttribute('height', Math.max(0.2, bottomVisible).toFixed(2));

  // toggle stream visibility
  if (p > 0.001 && p < 0.999) {
    svg.classList.add('flowing');
  } else {
    svg.classList.remove('flowing');
  }
}

/* update countdown text */
function updateCountdownText(){
  const parts = formatTimeParts(remainingSeconds);
  const pad = n => String(n).padStart(2,'0');
  countdownText.textContent = `${String(parts.days).padStart(2,'0')} : ${pad(parts.hours)} : ${pad(parts.minutes)} : ${pad(parts.seconds)}`;
}

/* ===========================
   Particle system (SVG circles)
   Real physics with requestAnimationFrame
   =========================== */

class Particle {
  constructor(x,y,r, color){
    this.x = x;
    this.y = y;
    this.r = r;
    // velocities px/s
    this.vx = (Math.random()*2 - 1) * 30; // initial tiny horizontal drift
    this.vy = 30 + Math.random()*60; // initial downwards push
    this.ax = (Math.random()*2 - 1) * 20; // small horizontal acceleration variation
    this.ay = GRAVITY; // gravity constant px/s^2
    this.life = 0;
    this.maxLife = 3.5; // seconds safety
    this.eliminated = false;

    // create SVG element
    this.el = document.createElementNS("http://www.w3.org/2000/svg","circle");
    this.el.setAttribute('cx', this.x);
    this.el.setAttribute('cy', this.y);
    this.el.setAttribute('r', this.r);
    this.el.setAttribute('fill', color);
    this.el.setAttribute('opacity', '0.98');
    // small blur to mimic tiny shape - use slight opacity
    fallingParticlesGroup.appendChild(this.el);
  }

  step(dt, bottomSurfaceY){
    if (this.eliminated) return;
    this.life += dt;
    // integrate velocities
    this.vx += this.ax * dt;
    this.vy += this.ay * dt;

    // small wind jiggle
    this.vx += (Math.random()*2 - 1) * 6 * dt;

    // update position
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // update DOM pos
    this.el.setAttribute('cx', this.x.toFixed(2));
    this.el.setAttribute('cy', this.y.toFixed(2));

    // rotation/scale subtle via transform (optional) - using opacity for simplicity
    // collision with bottom surface: when y crosses bottomSurfaceY - small margin
    if (this.y >= bottomSurfaceY - (this.r * 0.8) ) {
      // create small splash and remove
      this.splash();
      this.remove();
      return;
    }

    // lifetime cap
    if (this.life > this.maxLife) {
      this.remove();
    }
  }

  splash(){
    // small expanding circle to simulate deposit (created & faded quickly)
    const s = document.createElementNS("http://www.w3.org/2000/svg","circle");
    s.setAttribute('cx', this.x);
    s.setAttribute('cy', this.y);
    s.setAttribute('r', Math.max(0.6, this.r));
    s.setAttribute('fill', 'rgba(255,255,255,0.0)');
    s.setAttribute('stroke', 'rgba(0,0,0,0.06)');
    s.setAttribute('stroke-width','0.6');
    fallingParticlesGroup.appendChild(s);
    // animate with CSS-like JS (expand + fade)
    const duration = 380 + Math.random()*120;
    const t0 = performance.now();
    function animateSplash(time){
      const p = Math.min(1,(time - t0)/duration);
      const rr = Math.max(0.6,  this.r) + p * 5;
      const opacity = Math.max(0, 0.35 * (1 - p));
      s.setAttribute('r', rr.toFixed(2));
      s.setAttribute('stroke-opacity', opacity.toFixed(2));
      if (p < 1) requestAnimationFrame(animateSplash);
      else {
        if (s && s.parentNode) s.parentNode.removeChild(s);
      }
    }
    requestAnimationFrame(animateSplash.bind(this));
  }

  remove(){
    if (this.el && this.el.parentNode) this.el.parentNode.removeChild(this.el);
    this.eliminated = true;
  }
}

/* system state */
let particles = [];
let lastFrameTime = null;
let spawnAccumulator = 0;

/* compute dynamic spawn rate (we keep simple constant here) */
const spawnRate = PARTICLES_PER_SECOND;

/* compute bottom surface Y from maskBottomRect dynamically */
function getBottomSurfaceY(){
  // The top y of the bottom sand rect is maskBottomRect.y attribute
  const yAttr = parseFloat(maskBottomRect.getAttribute('y')) || BOTTOM_BASE_Y;
  // We'll consider the surface a little above (for nicer look)
  return yAttr + 4; // tiny offset
}

/* spawn one particle at neck with random size & color */
function spawnParticle(){
  if (particles.length >= MAX_PARTICLES) return;
  // spawn near NECK_X +- spread, NECK_Y +- small vertical jitter
  const x = NECK_X + (Math.random()*2 - 1) * SPAWN_SPREAD;
  const y = NECK_Y + (Math.random()*2 - 1) * 4;
  const r = 0.8 + Math.random() * 1.6; // radius between ~0.8 and 2.4
  const color = getComputedStyle(document.documentElement).getPropertyValue('--accent-brown') || '#C2A88C';
  const p = new Particle(x,y,r,color.trim());
  particles.push(p);
}

/* frame loop: update particles physics & cleanup */
function particleFrame(now){
  if (!lastFrameTime) lastFrameTime = now;
  const dt = Math.min(0.05, (now - lastFrameTime) / 1000); // cap dt for stability
  lastFrameTime = now;

  // spawn particles based on spawnRate and dt
  spawnAccumulator += spawnRate * dt;
  while (spawnAccumulator >= 1) {
    // spawn only when there is still time > 0 (so stream stops when done)
    if (remainingSeconds > 0) spawnParticle();
    spawnAccumulator -= 1;
  }

  // bottom surface for collision
  const bottomSurfaceY = getBottomSurfaceY();

  // update existing particles
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (!p.eliminated) {
      p.step(dt, bottomSurfaceY);
    }
    if (p.eliminated) {
      particles.splice(i,1);
    }
  }

  // schedule next frame if any particles OR time still running (we keep loop active)
  requestAnimationFrame(particleFrame);
}
/* ================================
   POPUP : Apparition quand timer = 0
================================ */

// Récupération des éléments
const popup = document.getElementById('time-finished-popup');
const popupClose = document.getElementById('popup-close');

// Fonction pour afficher le popup
function showTimeFinishedPopup() {
  popup.classList.add("active");
}

// Fonction pour fermer le popup
popupClose.addEventListener("click", () => {
  popup.classList.remove("active");
});

/* ===========================
   Timer / main loop
   =========================== */

function startSablier(){
  startTimestamp = performance.now();
  remainingSeconds = totalSeconds;
  lastSecondTick = performance.now(); // for per-second decrement
  // initial masks/text
  renderMasksByPercent(percentFromRemaining());
  updateCountdownText();

  // start particle RAF
  requestAnimationFrame(particleFrame);

  // main interval: update each 200ms for smoother percent changes, but textual every second
  let lastUpdate = performance.now();
  function mainLoop(now){
    const dtMs = now - lastUpdate;
    if (dtMs >= 80) {
      lastUpdate = now;
      // compute elapsed from startTimestamp
      const elapsed = (now - startTimestamp) / 1000;
      // compute remaining sec as integer seconds
      remainingSeconds = Math.max(0, Math.round(totalSeconds - elapsed));
      // smoothly compute percent for visuals using precise elapsed float
      const exactRemaining = Math.max(0, totalSeconds - elapsed);
      const exactPercent = exactRemaining / totalSeconds;
      renderMasksByPercent(exactPercent);
      updateCountdownText();
      // stop when finished
      if (remainingSeconds <= 0) {
        // ensure final state
        renderMasksByPercent(0);
        updateCountdownText();
        // stop stream (particles may still fall until depleted)
        showTimeFinishedPopup();
        svg.classList.remove('flowing');
        // do not start new particles by enforcing remainingSeconds==0
      }
    }
    // continue loop while still time or particles exist (particles frame loop continues separately)
    if (remainingSeconds > 0) requestAnimationFrame(mainLoop);
    else {
      // We still keep mainLoop running a couple seconds to let particles finish
      // schedule a short tail to stop
      setTimeout(()=>{ /* nothing to do; animation naturally quiets */ }, 800);
    }
  }
  requestAnimationFrame(mainLoop);
}

/* start */
startSablier();

/* expose methods to control externally */
window.hourglass = {
  pause: function(){ /* for future: pause logic */ console.warn('pause not implemented'); },
  restartWithDuration: function(d){
    // accept object with days/hours/minutes/seconds
    const secs = durationToSeconds(d);
    if (secs > 0) {
      totalSeconds = secs;
      remainingSeconds = totalSeconds;
      startTimestamp = performance.now();
      // reset masks immediately
      renderMasksByPercent(1);
      updateCountdownText();
    }
  }
};


    /* BOUTON SIMILAIRE SIRI
*/
(function(){
  // Query elements
  const wrapper = document.querySelector('.dtt-fab-wrapper');
  if(!wrapper) return;

  const fab = wrapper.querySelector('.dtt-fab');
  const reveal = wrapper.querySelector('.dtt-fab-reveal');
  const backdrop = wrapper.querySelector('.dtt-fab-backdrop');
  const counterEl = wrapper.querySelector('.dtt-fab-counter .dtt-counter-value');

  // Readable controls
  const revealAttr = 'data-open';
  const backdropAttr = 'data-state';

  // State
  let isOpen = false;
  let animatingCounter = false;
  let currentRAF = null;

  // Accessibility: toggle
  function setOpen(val){
    isOpen = !!val;
    fab.classList.toggle('open', isOpen);
    reveal.setAttribute(revealAttr, isOpen ? 'true' : 'false');
    backdrop.setAttribute(backdropAttr, isOpen ? 'open' : 'closed');
    fab.setAttribute('aria-expanded', String(isOpen));
    reveal.setAttribute('aria-hidden', String(!isOpen));
  }

  // Smooth counter: from 0 to target in ms duration using requestAnimationFrame
  function animateCounter(target, duration){
    if(animatingCounter) {
      // If currently animating, cancel and start new cleanly
      cancelAnimationFrame(currentRAF);
      animatingCounter = false;
    }
    const start = performance.now();
    const startValue = 0;
    const endValue = Math.max(0, parseInt(target,10) || 0);
    if(endValue === startValue){
      counterEl.textContent = String(endValue);
      return;
    }
    animatingCounter = true;

    function step(now){
      const elapsed = Math.min(now - start, duration);
      // easeOutCubic for pleasing finish
      const t = elapsed / duration;
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(startValue + (endValue - startValue) * eased);
      counterEl.textContent = value.toLocaleString(); // locale grouping
      if(elapsed < duration){
        currentRAF = requestAnimationFrame(step);
      } else {
        // ensure exact target at end
        counterEl.textContent = endValue.toLocaleString();
        animatingCounter = false;
      }
    }
    currentRAF = requestAnimationFrame(step);
  }

  // Open/close behavior
  function openMenu(){
    setOpen(true);
    // read target number from attribute
    const counterWrapper = wrapper.querySelector('.dtt-fab-counter');
    const target = counterWrapper ? counterWrapper.getAttribute('data-target') : null;
    const durationAttr = counterWrapper ? parseInt(counterWrapper.getAttribute('data-duration') || '1200', 10) : 1200;
    // Small stagger for micro-interaction
    setTimeout(()=> {
      if (target) animateCounter(target, durationAttr);
    }, 180);
    // small focus trap: move focus to first actionable element
    const firstAction = wrapper.querySelector('.dtt-action-btn');
    if(firstAction) firstAction.focus();
  }

  function closeMenu(){
    setOpen(false);
    // subtle reset (keeps last value visible until next open)
    // Optionally we could reset to 0: comment shows how to reset if desired
    // wrapper.querySelector('.dtt-counter-value').textContent = '0';
  }

  // Toggle handler
  function toggle(evt){
    evt && evt.preventDefault();
    if(isOpen) closeMenu();
    else openMenu();
  }

  // Clicks
  fab.addEventListener('click', toggle);
  backdrop.addEventListener('click', closeMenu);

  // keyboard: ESC to close, Enter/Space to open via fab
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && isOpen) { closeMenu(); }
  });

  // Close when clicking outside the wrapper (defensive)
  document.addEventListener('click', (e)=>{
    if(!isOpen) return;
    if(!wrapper.contains(e.target)) closeMenu();
  }, true);

  // Progressive enhancement: if user prefers reduced motion, reduce animations
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReduced){
    // shorten durations and disable float
    document.documentElement.style.setProperty('--transition', 'all 0.12s linear');
    // remove float animation
    fab.style.animation = 'none';
  }

  // Initialization: ensure closed
  setOpen(false);

  // Organic micro-wobble for open state (CSS only) — already in CSS; below we add a tiny JS 'siri-like' pulse when opening.
  function pulseOnOpen(){
    if(!isOpen) return;
    // quick scale pulse and halo flash
    fab.animate([
      { transform: 'translateY(-6px) scale(1.02)' },
      { transform: 'translateY(-3px) scale(1.04)' },
      { transform: 'translateY(-6px) scale(1.02)' }
    ], { duration: 560, easing: 'cubic-bezier(.2,.9,.2,1)'});
  }

  // hook pulse to open
  fab.addEventListener('transitionend', (e)=>{
    if(e.propertyName.includes('transform') && isOpen){
      pulseOnOpen();
    }
  });

  // Expose minimal API for integration if needed
  window.DTT_FAB = {
    open: openMenu,
    close: closeMenu,
    toggle: ()=> toggle(new Event('manual')),
    setTarget: function(num){
      const cw = wrapper.querySelector('.dtt-fab-counter');
      if(cw) cw.setAttribute('data-target', String(num));
    }
  };
})();

//SCRIPT BLOC CACHE DEVENIR AMBASSADEUR

  (function(){
    const toggle = document.getElementById('amb-toggle');
    const ambBlock = document.getElementById('amb-block');
    const ambOverlay = document.getElementById('amb-overlay');
    const ambClose = document.getElementById('amb-close');
    const ambClose2 = document.getElementById('amb-cta-close');
    const ambJoin = document.getElementById('amb-cta-join');
    const body = document.body;

    if(!toggle || !ambBlock || !ambOverlay) return;

    // Open function: sets aria and adds show class with smooth entrance (scale+fade+slide)
    function openAmbassador(){
      ambOverlay.classList.add('show');
      ambOverlay.setAttribute('aria-hidden','false');
      ambBlock.classList.add('show');
      ambBlock.setAttribute('aria-hidden','false');

      // trap focus
      body.style.overflow = 'hidden';

      // subtle stagger for inner elements
      requestAnimationFrame(()=> {
        const head = ambBlock.querySelector('.amb-head');
        const sections = ambBlock.querySelector('.amb-sections');
        const actions = ambBlock.querySelector('.amb-actions');

        head && (head.style.transitionDelay = '0.04s');
        sections && (sections.style.transitionDelay = '0.12s');
        actions && (actions.style.transitionDelay = '0.2s');
      });

      // focus first focusable element
      setTimeout(()=> {
        const focusable = ambBlock.querySelector('button, a, [tabindex]:not([tabindex="-1"])');
        if(focusable) focusable.focus();
      }, 250);
    }

    // Close function
    function closeAmbassador(){
      ambOverlay.classList.remove('show');
      ambOverlay.setAttribute('aria-hidden','true');
      ambBlock.classList.remove('show');
      ambBlock.setAttribute('aria-hidden','true');
      body.style.overflow = '';
      toggle.focus();
    }

    // Toggle click
    toggle.addEventListener('click', function(e){
      e.preventDefault();
      openAmbassador();
    });

    // Close handlers
    [ambClose, ambClose2].forEach(btn => {
      if(btn) btn.addEventListener('click', function(e){
        e.preventDefault();
        closeAmbassador();
      });
    });

    // Join button - you can hook logic here (currently closes + sends focus back)
    if(ambJoin){
      ambJoin.addEventListener('click', function(e){
        e.preventDefault();
        // default behavior: close dialog (integration point for form submission)
        closeAmbassador();
        // Optional: dispatch a custom event for host page to handle enrollment
        document.dispatchEvent(new CustomEvent('ambassador:joinClicked', { detail:{ time: Date.now() } }));
      });
    }

    // Click outside to close
    ambOverlay.addEventListener('click', closeAmbassador);

    // ESC to close
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && ambBlock.classList.contains('show')){
        closeAmbassador();
      }
    });

    // Prevent focus leaving the dialog (simple trap)
    document.addEventListener('focus', function(e){
      if(!ambBlock.classList.contains('show')) return;
      if(!ambBlock.contains(e.target)) {
        e.stopPropagation();
        const focusable = ambBlock.querySelector('button, a, [tabindex]:not([tabindex="-1"])');
        if(focusable) focusable.focus();
      }
    }, true);

    // Small progressive image reveal (adds subtle animation when shown)
    const imgs = ambBlock.querySelectorAll('img');
    imgs.forEach(img=>{
      img.style.opacity = 0;
      img.style.transform = 'translateY(6px) scale(.995)';
      img.style.transition = 'opacity 450ms ease, transform 420ms ease';
      img.addEventListener('load', ()=> {
        setTimeout(()=>{ img.style.opacity=1; img.style.transform='translateY(0) scale(1)'; }, 120);
      });
      // if already cached
      if(img.complete) { setTimeout(()=>{ img.style.opacity=1; img.style.transform='translateY(0) scale(1)'; }, 120); }
    });

    // Respect reduced-motion preference
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if(mq.matches){
      document.documentElement.style.setProperty('--transition', 'all 0.01s linear');
      ambBlock.style.transition = 'none';
      ambOverlay.style.transition = 'none';
    }
  })();

    /****  FORMULAIRE DEVENIR AMBASSADEUR
    // ---------- Ambassador toggle & form handling ----------
    const ambToggle = document.getElementById('amb-toggle');
    const ambFormWrap = document.getElementById('amb-form');
    const ambCancel = document.getElementById('amb-cancel');
    const ambBtn = document.getElementById('btn-ambassador');

    function openForm(){
      ambFormWrap.classList.add('open');
      ambFormWrap.scrollIntoView({behavior:'smooth',block:'center'});
    }
    function closeForm(){
      ambFormWrap.classList.remove('open');
      // bring hero into view
      window.scrollTo({top:0,behavior:'smooth'});
    }

    [ambToggle, ambBtn].forEach(el=>el.addEventListener('click', openForm));
    ambCancel.addEventListener('click', closeForm);

    // Form validation & simulated submission
    const form = document.getElementById('ambassadorForm');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      // basic validation: required fields
      const requiredIds = ['fullname','age','city','email','phone','why'];
      const missing = requiredIds.filter(id=>{
        const el = document.getElementById(id);
        if(!el) return false;
        if(el.type==='number') return el.value === '' || isNaN(Number(el.value));
        return !el.value || el.value.trim()==='';
      });
      if(missing.length){
        showToast('Veuillez remplir tous les champs obligatoires ⚠');
        // highlight first missing
        document.getElementById(missing[0]).focus();
        return;
      }

      // Email simple pattern check
      const email = document.getElementById('email').value.trim();
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!re.test(email)){
        showToast('Adresse e-mail invalide ⚠');
        document.getElementById('email').focus();
        return;
      }

      // simulate upload / network
      showToast('Envoi en cours...');
      // disable submit
      form.querySelector('button[type=submit]').disabled = true;
      setTimeout(()=>{
        form.querySelector('button[type=submit]').disabled = false;
        form.reset();
        closeForm();
        showToast('Candidature envoyée avec succès ✅', 'success', 5000);
      },1200);
    });

    // Accessibility: allow Esc to close form
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && ambFormWrap.classList.contains('open')) closeForm();
    });

    // Small UX: prevent accidental file upload description in unsupported browsers
    document.getElementById('cv').addEventListener('change', (e)=>{
      const f = e.target.files[0];
      if(f && f.size > 6_000_000){ // 6MB limit demo
        showToast('Le fichier est trop volumineux. Limite 6MB ⚠');
        e.target.value = '';
      }
    });
*/