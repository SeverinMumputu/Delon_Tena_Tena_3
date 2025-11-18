
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
setInterval(updateCountdown, 1000); */

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

    /* ------------------------------------------------------------
       Utility: small helper to animate reveals of methods
       ------------------------------------------------------------ */
    function revealMethods(container){
      const methods = container.querySelectorAll('.method');
      methods.forEach((m,i)=>{
        const delay = parseInt(m.getAttribute('data-delay')|| (i*60));
        setTimeout(()=> m.classList.add('show'), delay);
      })
    }

    /* ------------------------------------------------------------
       Handle CTA clicks to toggle panels
       ------------------------------------------------------------ */
    const btnFoundation = document.getElementById('btn-foundation');
    const btnCampaign = document.getElementById('btn-campaign');
    const panelFoundation = document.getElementById('panel-foundation');
    const panelCampaign = document.getElementById('panel-campaign');
    const donationArea = document.getElementById('donation-area');

    function hidePanels(){
      panelFoundation.style.display = 'none';
      panelCampaign.style.display = 'none';
      // remove any show classes for next reveal
      document.querySelectorAll('.method').forEach(m=>m.classList.remove('show'))
    }

    btnFoundation.addEventListener('click', ()=>{
      hidePanels();
      panelFoundation.style.display = 'block';
      donationArea.scrollIntoView({behavior:'smooth',block:'center'});
      revealMethods(document.getElementById('methods-foundation'));
    });

    btnCampaign.addEventListener('click', ()=>{
      hidePanels();
      panelCampaign.style.display = 'block';
      donationArea.scrollIntoView({behavior:'smooth',block:'center'});
      revealMethods(document.getElementById('methods-campaign'));
    });

    /* ------------------------------------------------------------
       Copy to clipboard + toasts
       ------------------------------------------------------------ */
    function makeToast(message, success=true){
      const wrap = document.getElementById('toast-wrap');
      const t = document.createElement('div');
      t.className = 'toast';
      t.textContent = (success? '✅ ' : '❌ ') + message;
      wrap.appendChild(t);
      // allow animation frame
      requestAnimationFrame(()=> t.classList.add('show'));
      // auto hide after 3s
      setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=> t.remove(),420) }, 3000);
    }

    document.querySelectorAll('.copy-btn').forEach(btn=>{
      btn.addEventListener('click', async (e)=>{
        // If it's a link, let it behave normally
        if(btn.tagName.toLowerCase() === 'a') return;
        const selector = btn.getAttribute('data-copy-target');
        if(!selector){ makeToast('Erreur: contenu introuvable', false); return }
        const el = document.querySelector(selector);
        if(!el){ makeToast('Erreur: contenu introuvable', false); return }
        const text = el.textContent.trim();
        try{
          await navigator.clipboard.writeText(text);
          makeToast('Numéro copié avec succès');
        }catch(err){
          // Fallback: select & prompt
          try{
            const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
            makeToast('Numéro copié avec succès');
          }catch(e){
            makeToast('Erreur, veuillez réessayer', false);
            console.error('Copy failed', e);
          }
        }
      })
    })

    /* ------------------------------------------------------------
       Small accessibility: allow Enter on focused CTAs
       ------------------------------------------------------------ */
       
    [btnFoundation, btnCampaign].forEach(b=>{
      b.addEventListener('keyup', (e)=>{ if(e.key === 'Enter') b.click() })
    })

    /* ------------------------------------------------------------
       Optional: pre-open foundation panel on small screens for demo
       ------------------------------------------------------------ */
    // if you want to auto-open default panel on load, uncomment below
    // btnFoundation.click();
