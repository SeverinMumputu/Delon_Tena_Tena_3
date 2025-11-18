
//const TARGET_DATE = new Date(Date.UTC(2025, 11, 1, 0, 0, 0)); // months: 0-11
/* ========== DOM Elements ========== 
const cdDays = document.getElementById('cd-days');
const cdHours = document.getElementById('cd-hours');
const cdMins = document.getElementById('cd-mins');
const cdSecs = document.getElementById('cd-secs');
const yearEl = document.getElementById('year'); */
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


    /* ========== 1) CAROUSEL ========== */
    (function dttCarousel(){
      const slidesData = [
        {
          image: 'fond_fondation.jpg',
          caption: 'Engagement pour le bien-être social.'
        },
        {
          image: 'ecole.jpg',
          caption: "Promotion de l'éducation et de la formation."
        },
        {
          image: 'Clinique.jpg',
          caption: "Soutien aux initiatives de santé communautaire."
        },
        {
          image: 'femmes.jpg',
          caption: "Autonomisation des femmes et des jeunes."
        }
      ];

      const track = document.getElementById('dtt-track');
      const bulletsEl = document.getElementById('dtt-bullets');
      const prevBtn = document.getElementById('dtt-prev');
      const nextBtn = document.getElementById('dtt-next');

      let activeIndex = 0;
      let timer = null;
      const INTERVAL = Number(document.querySelector('.dtt-carousel').dataset.interval) || 4000;

      function createSlide(data, i){
        const slide = document.createElement('article');
        slide.className = 'dtt-slide';
        slide.setAttribute('role','group');
        slide.setAttribute('aria-roledescription','slide');
        slide.setAttribute('aria-label', (i+1) + ' sur ' + slidesData.length);
        slide.style.backgroundImage = `url('${data.image}' )`;
        slide.innerHTML = `
  <div class="dtt-caption" id="dtt-caption-${i}">
    ${escapeHtml(data.caption)}
  </div>
`;
        if(i===0) slide.classList.add('dtt-active');
        track.appendChild(slide);

        // bullet
        const btn = document.createElement('button');
        btn.className = 'dtt-bullet';
        btn.setAttribute('role','tab');
        btn.setAttribute('aria-controls','dtt-caption-'+i);
        btn.setAttribute('aria-pressed', i===0 ? 'true' : 'false');
        btn.setAttribute('title','Aller à la diapositive '+(i+1));
        btn.addEventListener('click', ()=> goTo(i, true));
        btn.addEventListener('keydown', (ev)=>{
          if(ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); goTo(i, true); }
        });
        bulletsEl.appendChild(btn);
      }

      slidesData.forEach(createSlide);

      function updateSlides(){
        const slides = track.querySelectorAll('.dtt-slide');
        const bullets = bulletsEl.querySelectorAll('.dtt-bullet');
        slides.forEach((s, idx) => {
          if(idx === activeIndex){
            s.classList.add('dtt-active');
            s.setAttribute('aria-hidden','false');
          } else {
            s.classList.remove('dtt-active');
            s.setAttribute('aria-hidden','true');
          }
        });
        bullets.forEach((b, idx) => {
          b.setAttribute('aria-pressed', String(idx === activeIndex));
        });
      }

      function goTo(index, userInitiated){
        activeIndex = (index + slidesData.length) % slidesData.length;
        updateSlides();
        if(userInitiated) restartTimer();
      }

      function prev(){
        goTo(activeIndex - 1, true);
      }
      function next(){
        goTo(activeIndex + 1, true);
      }

      prevBtn.addEventListener('click', prev);
      nextBtn.addEventListener('click', next);

      // keyboard navigation
      document.addEventListener('keydown', (e)=>{
        if(document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) return;
        if(e.key === 'ArrowLeft') prev();
        if(e.key === 'ArrowRight') next();
      });

      function restartTimer(){
        if(timer) clearInterval(timer);
        timer = setInterval(()=> goTo(activeIndex + 1, false), INTERVAL);
      }
      restartTimer();

      // expose for debugging (optional)
      window.dttCarousel = { goTo, next, prev };
      // Helper: escape HTML
      function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
    })();

    /* ========== 3) TOAST SYSTEM ========== */
    (function dttToasts(){
      const toastsRoot = document.getElementById('dtt-toasts');

      function showToast({message = '', type = 'info', ttl = 4000} = {}){
        const el = document.createElement('div');
        el.className = 'dtt-toast' + (type === 'error' ? ' dtt-error' : '');
        el.setAttribute('role','status');
        el.innerHTML = `<div>${escapeHtml(message)}</div>`;
        toastsRoot.appendChild(el);

        // remove after ttl with animation
        setTimeout(()=> {
          el.style.animation = 'dtt-toast-out 220ms ease forwards';
          setTimeout(()=> el.remove(), 240);
        }, ttl);

        return el;
      }

      window.dttShowToast = showToast;

      function escapeHtml(s){ return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];}); }
    })();

    /* ========== 2) FORM VALIDATION & SIMULATED SUBMIT ========== */
    (function dttForm(){
      const form = document.getElementById('dtt-form');
      const nameEl = document.getElementById('dtt-name');
      const emailEl = document.getElementById('dtt-email');
      const subjectEl = document.getElementById('dtt-subject');
      const messageEl = document.getElementById('dtt-message');
      const submitBtn = document.getElementById('dtt-submit');
      const spinner = document.getElementById('dtt-submit-spinner');
      const STORAGE_KEY = 'dtt_contact_messages_v1';

      // basic RFC-like email regex (simple)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      form.addEventListener('submit', function(e){
        e.preventDefault();
        clearFieldErrors();

        const name = nameEl.value.trim();
        const email = emailEl.value.trim();
        const subject = subjectEl.value.trim();
        const message = messageEl.value.trim();

        const errors = [];

        if(!name || name.length < 2) errors.push({field: nameEl, msg: 'Le nom doit contenir au moins 2 caractères.'});
        if(!email || !emailRegex.test(email)) errors.push({field: emailEl, msg: 'Veuillez saisir un email valide.'});
        if(!subject || subject.length < 3) errors.push({field: subjectEl, msg: 'Le sujet doit contenir au moins 3 caractères.'});
        if(!message || message.length < 10) errors.push({field: messageEl, msg: 'Le message doit contenir au moins 10 caractères.'});

        if(errors.length){
          // show first error as toast and highlight fields
          errors.forEach(err => markFieldError(err.field, err.msg));
          window.dttShowToast({message: errors[0].msg, type:'error', ttl: 5000});
          return;
        }

        // simulate send
        submitBtn.disabled = true;
        spinner.hidden = false;
        // small visual lift
        submitBtn.style.transform = 'translateY(0)';
        setTimeout(()=> {
          // store to localStorage
          try {
            const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            existing.push({name, email, subject, message, date: new Date().toISOString()});
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
          } catch (err) {
            // ignore storage errors
          }

          spinner.hidden = true;
          submitBtn.disabled = false;
          form.reset();
          window.dttShowToast({message: 'Message envoyé — merci pour votre confiance.', type: 'info', ttl: 4500});
        }, 1100);
      });

      function markFieldError(fieldEl, msg){
        fieldEl.setAttribute('aria-invalid','true');
        const wrap = fieldEl.closest('.dtt-field');
        if(wrap && !wrap.querySelector('.dtt-error-msg')){
          const err = document.createElement('div');
          err.className = 'dtt-error-msg';
          err.style.color = '#b02a2a';
          err.style.fontSize = '0.85rem';
          err.style.marginTop = '6px';
          err.textContent = msg;
          wrap.appendChild(err);
        }
      }
      function clearFieldErrors(){
        form.querySelectorAll('[aria-invalid="true"]').forEach(el => el.removeAttribute('aria-invalid'));
        form.querySelectorAll('.dtt-error-msg').forEach(n => n.remove());
      }
    })();