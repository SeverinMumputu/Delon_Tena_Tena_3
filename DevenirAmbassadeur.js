/* Set current year */
//const TARGET_DATE = new Date(Date.UTC(2025, 11, 1, 0, 0, 0)); // months: 0-11
/* ========== DOM Elements ========== 
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');
const yearEl = document.getElementById('year');*/
const langBtns = Array.from(document.querySelectorAll('.lang-btn'));
const bodyEl = document.body;
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
const mobileClose = document.getElementById('mobileClose');
const mobileLangBtns = Array.from(document.querySelectorAll('.mobile-lang .lang-btn'));
const allTextNodes = Array.from(document.querySelectorAll('[data-fr]'));

/* ========== Utilities ========== 
function pad(n){return String(n).padStart(2,'0')} */

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
  }*/ /* Countdown logic suite 
  const s = Math.floor(diff / 1000);
  const days = Math.floor(s / (3600*24));
  const hours = Math.floor((s % (3600*24)) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60; */

  //cdDays.textContent = pad(days);
  //cdHours.textContent = pad(hours);
  //cdMins.textContent = pad(mins);
  //cdSecs.textContent = pad(secs);
//}
//updateCountdown();
//setInterval(updateCountdown, 1000); 


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