
const TARGET_DATE = new Date(Date.UTC(2025, 11, 1, 0, 0, 0)); // months: 0-11
/* ========== DOM Elements ========== */
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');
const yearEl = document.getElementById('year');
const langBtns = Array.from(document.querySelectorAll('.lang-btn'));
const bodyEl = document.body;
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const mobileLangBtns = Array.from(document.querySelectorAll('.mobile-lang .lang-btn'));
const allTextNodes = Array.from(document.querySelectorAll('[data-fr]'));

/* ========== Utilities ========== */
function pad(n){return String(n).padStart(2,'0')}

/* Countdown logic */
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
setInterval(updateCountdown, 1000);

/* Set current year */
yearEl.textContent = new Date().getFullYear();

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


/* ---------- Toast ---------- */
let toastTimer;
function showToast(message, duration=4000){
  const t = $("#toast");
  if(!t) return;
  t.textContent = message;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove("show"), duration);
}
/* ---------- Utilities ---------- */
const $ = (sel,root=document) => root.querySelector(sel);
const $$ = (sel,root=document) => Array.from(root.querySelectorAll(sel));
/* ---------- Newsletter (local demo) ---------- */
function setupNewsletter(){
  const form = $("#newsletterForm");
  const email = $("#emailInput");
  const unsubscribeBtn = $("#unsubscribeBtn");
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const mail = email.value.trim();
    if(!mail) { showToast("Veuillez saisir un email valide."); return; }
    // faux stockage local pour demo
    localStorage.setItem('delon_newsletter', mail);
    showToast("Merci ! Vous êtes abonné(e).");
    form.reset();
  });
  unsubscribeBtn.addEventListener("click", ()=>{
    localStorage.removeItem('delon_newsletter');
    showToast("Vous êtes désabonné(e).");
  });
}

setupNewsletter();

/* Small UX: animate card backgrounds on scroll (parallax-like) */
const parallaxCards = Array.from(document.querySelectorAll('.card-bg, .campaign-bg'));
function onScrollParallax(){
  const sc = window.scrollY;
  parallaxCards.forEach(el=>{
    const rect = el.getBoundingClientRect();
    const offset = rect.top;
    const windowH = window.innerHeight;
    // compute a small translate based on position
    const move = Math.max(-20, Math.min(20, (offset - windowH/2) * -0.02));
    el.style.transform = `translateY(${move}px) scale(1.02)`;
  });
}
window.addEventListener('scroll', onScrollParallax);
onScrollParallax();

/* Small accessibility: close mobile menu on escape */
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape') closeMobileMenu();
});

/* Ensure header height spacing on load/responsive */
function adjustHeroMargin(){
  // nothing heavy — left for future; placeholder to show immediate responsiveness
}
window.addEventListener('resize', adjustHeroMargin);
adjustHeroMargin();

/* Initial small entry animations for visible cards */
document.addEventListener('DOMContentLoaded', ()=>{

  const animated = document.querySelectorAll('.card, .campaign-card, .partner');
  animated.forEach((el,i)=>{
    el.style.opacity = 0;
    el.style.transform = 'translateY(18px)';
    setTimeout(()=>{ el.style.transition = 'opacity .6s ease, transform .6s cubic-bezier(.2,.9,.3,1)'; el.style.opacity = 1; el.style.transform = 'none' }, 120 * i);
  });
});
