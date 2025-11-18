document.addEventListener('DOMContentLoaded', () => {

  // ---- State ----
  const TOTAL_STEPS = 4;
  let currentStep = 1;
  let selectedInfluencers = []; // hold names
  const maxInfluencers = 3;

  // Elements
  const pills = Array.from(document.querySelectorAll('.pill'));
  const stepCards = Array.from(document.querySelectorAll('.step-card'));
  const mainProgress = document.getElementById('mainProgress');
  const sideProgress = document.getElementById('sideProgress');
  const toastEl = document.getElementById('toast');
  const langButtons = Array.from(document.querySelectorAll('.flag-btn'));
  const allTextNodes = Array.from(document.querySelectorAll('[data-fr]'));

  // Step-specific elements
  const nextBtn1 = document.getElementById('nextBtn1');
  const prevBtn1 = document.getElementById('prevBtn1');
  const saveDraft1 = document.getElementById('saveDraft1');
  const step1Status = document.getElementById('step1Status');

  const nextBtn2 = document.getElementById('nextBtn2');
  const prevBtn2 = document.getElementById('prevBtn2');
  const invitationStatus = document.getElementById('invitationStatus');

  const inflList = document.getElementById('inflList');
  const inflSearch = document.getElementById('inflSearch');
  const chosenCount = document.getElementById('chosenCount');
  const nextBtn3 = document.getElementById('nextBtn3');
  const prevBtn3 = document.getElementById('prevBtn3');
  const inflFeedback = document.getElementById('inflFeedback');

  const payLogos = Array.from(document.querySelectorAll('.pay-logo'));
  const paymentForm = document.getElementById('paymentForm');
  const finishBtn = document.getElementById('finishBtn');
  const prevBtn4 = document.getElementById('prevBtn4');
  const finalThank = document.getElementById('finalThank');

  // Form fields - Step 1
  const step1FormFields = {
    firstName: document.getElementById('firstName'),
    lastName: document.getElementById('lastName'),
    email: document.getElementById('email'),
    phone: document.getElementById('phone'),
    whatsapp: document.getElementById('whatsapp'),
    instagram: document.getElementById('instagram'),
    facebook: document.getElementById('facebook')
  };

  // Guests fields (step 2) - selectors with data attributes
  function getGuestInputs(guestIndex){
    return Array.from(document.querySelectorAll(`[data-guest="${guestIndex}"] [data-guest-field]`));
    
  }

  // Persisted data helper
  function loadData(){
    try{
      const raw = localStorage.getItem('dtt_stepdata');
      return raw ? JSON.parse(raw) : {};
    }catch(e){ return {}; }
  }
  function saveData(data){
    try{ localStorage.setItem('dtt_stepdata', JSON.stringify(data)); }catch(e){}
  }

  // Toast helper
  let toastTimer = null;
  function showToast(msg, ms = 3200){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{ toastEl.classList.remove('show'); }, ms);
  }

  // Language switcher (FR / EN) — swap text content / placeholders
  function setLanguage(lang){
    document.documentElement.lang = lang === 'en' ? 'en' : 'fr';
    langButtons.forEach(b => {
      b.classList.toggle('active', b.dataset.lang === lang);
      b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false');
    });
    allTextNodes.forEach(el=>{
      const fr = el.getAttribute('data-fr');
      const en = el.getAttribute('data-en');
      if(fr && en){
        // If element is an input, set placeholder
        if(el.tagName === 'INPUT' || el.tagName === 'TEXTAREA'){
          el.placeholder = (lang === 'en') ? en : fr;
        } else {
          el.textContent = (lang === 'en') ? en : fr;
        }
      }
      // placeholders stored as attributes
      if(el.dataset.frPlaceholder || el.dataset.enPlaceholder){
        const ph = (lang === 'en') ? el.dataset.enPlaceholder : el.dataset.frPlaceholder;
        if(ph) el.placeholder = ph;
      }
    });

    // persist language
    try{ localStorage.setItem('dtt_lang', lang); }catch(e){}
  }

  // Initialize language
  (function initLang(){
    let preferred = 'fr';
    try{ const stored = localStorage.getItem('dtt_lang'); if(stored) preferred = stored;}catch(e){}
    setLanguage(preferred);
  })();

  langButtons.forEach(b => {
    b.addEventListener('click', () => setLanguage(b.dataset.lang));
  });

  // ---- goToStep central function (core of navigation and rendering) ----
  function goToStep(step){
    if(step < 1) step = 1;
    if(step > TOTAL_STEPS) step = TOTAL_STEPS;
    currentStep = step;

    // Update pills
    pills.forEach(p=>{
      const s = Number(p.dataset.step);
      p.classList.toggle('active', s === currentStep);
      // completed if step < currentStep
      if(s < currentStep){
        p.classList.add('completed');
      }else{
        p.classList.remove('completed');
      }
      p.setAttribute('aria-selected', s === currentStep ? 'true' : 'false');
    });

    // Show/hide cards with smooth classes
    stepCards.forEach(card=>{
      const s = Number(card.dataset.step);
      card.classList.remove('active','next-in','prev-out');
      card.style.display = '';
      if(s === currentStep){
        card.classList.add('active');
      } else if(s < currentStep){
        card.classList.add('prev-out');
      } else {
        card.classList.add('next-in');
      }
    });

    // Update global progress (main progress bar and side)
    const pct = Math.round(((currentStep-1)/(TOTAL_STEPS-1))*100);
    mainProgress.style.width = `${pct}%`;
    sideProgress.style.width = `${pct}%`;

    // Buttons enable/disable logic (ensures only valid transitions)
    // Step 1
    prevBtn1.disabled = currentStep === 1;
    // Step 2
    prevBtn2.disabled = currentStep === 1;
    prevBtn3.disabled = currentStep === 1;
    prevBtn4.disabled = currentStep === 1;
    // Step-specific UI updates
    updateUIState();
  }

  // Update UI controls depending on step & validations
  function updateUIState(){
    // Step 1: next enabled only if all required fields filled & email format approx valid
    const s1Valid = validateStep1(false);
    nextBtn1.disabled = !s1Valid;

    // Update status text
    step1Status.textContent = s1Valid ? (document.documentElement.lang === 'en' ? 'Ready' : 'Prêt') : (document.documentElement.lang === 'en' ? 'Please complete fields' : 'Veuillez remplir les champs');

    // Step 2: check all 3 guest forms valid
    //nextBtn2.disabled = !validateStep2(false);
    if(nextBtn2) nextBtn2.disabled = false;

    // Step 3: next enabled when exactly 3 influencers chosen
    nextBtn3.disabled = !(selectedInfluencers.length === maxInfluencers);

    // Payment: finish enabled if payment form visible and valid
    const payVisible = paymentForm.style.display !== 'none';
    if(payVisible){
      // basic check
      const all = ['iban','beneficiary','amount','reference'].every(id => !!document.getElementById(id).value.trim());
      finishBtn.disabled = !all;
    }else{
      finishBtn.disabled = true;
    }

    // Update chosen count
    chosenCount.textContent = `${selectedInfluencers.length} / ${maxInfluencers}`;

    // Update pill completion visuals
    pills.forEach(p => {
      const s = Number(p.dataset.step);
      p.classList.toggle('completed', s < currentStep || (s === currentStep && isStepValidated(s)));
    });

    // If finishing step 4 and donation validated, show final thank when hitting finish
    if(currentStep === 4 && finalThank.style.display === 'block'){
      // ensure progress is 100%
      mainProgress.style.width = '100%';
      sideProgress.style.width = '100%';
    }
  }

  // Validation helpers (return boolean)
  function validateEmailLike(v){
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  }

  // Step 1: check required fields
  function validateStep1(showToastOnError = true){
    const f = step1FormFields;
    const filled = f.firstName.value.trim() && f.lastName.value.trim() && validateEmailLike(f.email.value.trim()) && f.phone.value.trim() && f.whatsapp.value.trim();
    if(!filled && showToastOnError){
      showToast(document.documentElement.lang === 'en' ? 'Complete required fields.' : 'Remplissez les champs obligatoires.');
    }
    return !!filled;
  }

  // Step 2: check guests 1..3 required fields
  function validateStep2(showToastOnError = true){
    let ok = true;
    for(let i=1;i<=3;i++){
      const inputs = getGuestInputs(i);
      for(const inp of inputs){
        if(inp.hasAttribute('required') && !inp.value.trim()){
          ok = false;
          break;
        }
      }
      if(!ok) break;
    }
    if(!ok && showToastOnError){
      showToast(document.documentElement.lang === 'en' ? 'Please complete all 3 guest forms.' : 'Veuillez compléter les 3 formulaires d\'invités.');
    }
    // show small visual validation: mark guest as validated
    for(let i=1;i<=3;i++){
      const guestEl = document.querySelector(`.guest[data-guest="${i}"]`);
      const validatedSpan = guestEl.querySelector('.validated');
      const inputs = getGuestInputs(i);
      const allFilled = inputs.every(el => (!el.hasAttribute('required') || !!el.value.trim()));
      validatedSpan.style.display = allFilled ? 'inline-flex' : 'none';
    }
    return ok;
  }

  // Check if given step is validated (used to fill pastille)
  function isStepValidated(stepNum){
    if(stepNum === 1) return validateStep1(false);
    if(stepNum === 2) return validateStep2(false);
    if(stepNum === 3) return selectedInfluencers.length === maxInfluencers;
    if(stepNum === 4) {
      const d = loadData();
      return !!d.donationConfirmed;
    }
    return false;
  }

  // ---- Event listeners (only bound once) ----

  // Pills click: allow jumping to previous steps only (not forward beyond validated)
  pills.forEach(p => {
    p.addEventListener('click', () => {
      const target = Number(p.dataset.step);
      // Allow jump back freely, only allow jump forward if prior steps validated
      let allow = true;
      for(let s=1;s<target;s++){
        if(!isStepValidated(s)){ allow = false; break; }
      }
      if(allow){
        goToStep(target);
      }else{
        showToast(document.documentElement.lang === 'en' ? 'Please complete previous steps first.' : 'Veuillez d\'abord compléter les étapes précédentes.');
      }
    });
  });

  // Step 1 input listeners — update state on input
  Object.values(step1FormFields).forEach(el => {
    if(!el) return;
    el.addEventListener('input', () => {
      // show next button when valid
      updateUIState();
    });
  });

  // Save Draft step1
  saveDraft1.addEventListener('click', () => {
    if(!validateStep1(true)) return;
    const payload = loadData();
    payload.profile = {
      firstName: step1FormFields.firstName.value.trim(),
      lastName: step1FormFields.lastName.value.trim(),
      email: step1FormFields.email.value.trim(),
      phone: step1FormFields.phone.value.trim(),
      whatsapp: step1FormFields.whatsapp.value.trim(),
      instagram: step1FormFields.instagram.value.trim(),
      facebook: step1FormFields.facebook.value.trim()
    };
    saveData(payload);
    showToast(document.documentElement.lang === 'en' ? 'Profile saved locally.' : 'Profil enregistré localement.');
    updateUIState();
  });

  // Navigation buttons Step1
  nextBtn1.addEventListener('click', () => {
    if(!validateStep1(true)) return;
    // persist step1
    const payload = loadData();
    payload.profile = {
      firstName: step1FormFields.firstName.value.trim(),
      lastName: step1FormFields.lastName.value.trim(),
      email: step1FormFields.email.value.trim(),
      phone: step1FormFields.phone.value.trim(),
      whatsapp: step1FormFields.whatsapp.value.trim(),
      instagram: step1FormFields.instagram.value.trim(),
      facebook: step1FormFields.facebook.value.trim()
    };
    saveData(payload);
    goToStep(2);
  });

  prevBtn1.addEventListener('click', () => goToStep(1)); // safe no-op

  // Step 2: inputs -> update validation & persist
  for(let i=1;i<=3;i++){
    const inputs = getGuestInputs(i);
    inputs.forEach(inp => {
      inp.addEventListener('input', () => {
        updateUIState();
      });
    });
    
  }
  
  nextBtn2.addEventListener('click', () => {
    //if(!validateStep2(true)) return;
    // save guests to localStorage
    const payload = loadData();
    payload.guests = {};
    for(let i=1;i<=3;i++){
      const inputs = getGuestInputs(i);
      payload.guests[`guest${i}`] = {};
      inputs.forEach(inp => {
        const key = inp.getAttribute('data-guest-field');
        payload.guests[`guest${i}`][key] = inp.value.trim();
      });
    }
    saveData(payload);
    showToast(document.documentElement.lang === 'en' ? 'Guests saved.' : 'Invités enregistrés.');
    goToStep(3);
  });

  prevBtn2.addEventListener('click', () => goToStep(1));

  // Influencer selection (Step 3)
  function setInfluencerCardState(card, selected){
    card.classList.toggle('selected', selected);
    // accessibility
    card.setAttribute('aria-pressed', selected ? 'true' : 'false');
  }

  inflList.addEventListener('click', (e) => {
    const card = e.target.closest('.infl-card');
    if(!card) return;
    const name = card.dataset.name;
    const already = selectedInfluencers.indexOf(name) !== -1;
    if(already){
      // deselect
      selectedInfluencers = selectedInfluencers.filter(n => n !== name);
      setInfluencerCardState(card, false);
      inflFeedback.textContent = document.documentElement.lang === 'en' ? `${name} deselected `: `${name} désélectionné`;
    } else {
      if(selectedInfluencers.length >= maxInfluencers){
        showToast(document.documentElement.lang === 'en' ? 'You can select up to 3 influencers.' : 'Vous pouvez choisir jusqu\'à 3 influenceurs.');
        return;
      }
      selectedInfluencers.push(name);
      setInfluencerCardState(card, true);
      inflFeedback.textContent = document.documentElement.lang === 'en' ? `${name} selected `: `${name} sélectionné`;
    }
    updateUIState();
  });

  // keyboard selection (accessibility)
  inflList.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){
      const card = e.target.closest('.infl-card');
      if(card) { card.click(); e.preventDefault(); }
    }
  });

  // Search filter for influencers
  inflSearch.addEventListener('input', () => {
    const q = inflSearch.value.trim().toLowerCase();
    const cards = Array.from(inflList.querySelectorAll('.infl-card'));
    cards.forEach(c => {
      const name = c.dataset.name.toLowerCase();
      c.style.display = name.includes(q) ? '' : 'none';
    });
  });

  // Next on step 3
  nextBtn3.addEventListener('click', () => {
    if(selectedInfluencers.length !== maxInfluencers){
      showToast(document.documentElement.lang === 'en' ? 'Select exactly 3 influencers to continue.' : 'Sélectionnez exactement 3 influenceurs pour continuer.');
      return;
    }
    // persist selection
    const payload = loadData();
    payload.selectedInfluencers = selectedInfluencers.slice();
    saveData(payload);
    goToStep(4);
  });

  prevBtn3.addEventListener('click', () => goToStep(2));

  // Payment logos behavior (Step 4)
  payLogos.forEach(logo => {
    logo.addEventListener('click', () => {
      // toggle active on the clicked one, remove from others
      payLogos.forEach(l => l.classList.remove('active'));
      logo.classList.add('active');
      // show payment form
      paymentForm.style.display = 'block';
      // focus first field
      document.getElementById('iban').focus();
      updateUIState();
    });
    // keyboard accessible
    logo.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') { logo.click(); e.preventDefault(); }
    });
  });

  // Payment form inputs enable finish button when filled
  ['iban','beneficiary','amount','reference'].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener('input', () => updateUIState());
  });

  // Finish button (validate donation)
  finishBtn.addEventListener('click', () => {
    // basic validation
    const iban = document.getElementById('iban').value.trim();
    const ben = document.getElementById('beneficiary').value.trim();
    const amount = document.getElementById('amount').value;
    const ref = document.getElementById('reference').value.trim();

    if(!iban || !ben || !amount || !ref){
      showToast(document.documentElement.lang === 'en' ? 'Please complete payment details.' : 'Veuillez compléter les détails de paiement.');
      return;
    }

    const payload = loadData();
    payload.donation = { iban, beneficiary: ben, amount, reference: ref, method: document.querySelector('.pay-logo.active')?.dataset.pay || null };
    payload.donationConfirmed = true;
    saveData(payload);

    // show toast with instruction to send receipt
    showToast(document.documentElement.lang === 'en' ? 'Please send the receipt to contact@delontenatena.org' : 'Veuillez envoyer votre reçu par mail à contact@delontenatena.org', 6000);

    // display final thank you animation / content
    paymentForm.style.display = 'none';
    finalThank.style.display = 'block';

    // update local state and progress
    goToStep(4);

    // small animation: mark completed and persist time
    payload.completedAt = new Date().toISOString();
    saveData(payload);
  });

  prevBtn4.addEventListener('click', () => goToStep(3));

  // Persist / auto-load saved profile & guests (if any)
  (function hydrateFromStorage(){
    const payload = loadData();
    if(payload.profile){
      Object.keys(step1FormFields).forEach(k => {
        if(payload.profile[k]) step1FormFields[k].value = payload.profile[k];
      });
    }
    if(payload.guests){
      for(let i=1;i<=3;i++){
        const g = payload.guests[`guest${i}`] || {};
        const inputs = getGuestInputs(i);
        inputs.forEach(inp => {
          const key = inp.getAttribute('data-guest-field');
          if(g[key]) inp.value = g[key];
        });
      }
    }
    if(payload.selectedInfluencers){
      selectedInfluencers = payload.selectedInfluencers.slice();
      // mark cards accordingly
      const cards = Array.from(document.querySelectorAll('.infl-card'));
      cards.forEach(c => {
        setInfluencerCardState(c, selectedInfluencers.includes(c.dataset.name));
      });
    }
    updateUIState();
  })();

  // Utility: return translated small messages for toasts if needed
  function t(fr, en){ return document.documentElement.lang === 'en' ? en : fr; }

  // Helper: check each step validated and update UI
  function periodicUpdate(){
    updateUIState();
    // also update step1Status text in current language
    step1Status.textContent = validateStep1(false) ? t('Prêt','Ready') : t('Veuillez remplir les champs','Please complete fields');
  }
  // run once
  periodicUpdate();

  // expose goToStep globally for debugging (optional)
  window.goToStep = goToStep;

  // initial render
  goToStep(1);

  // Accessibility: trap focus inside active card? (light-level — not full modal)
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape'){
      // user convenience: go to previous step
      if(currentStep > 1) goToStep(currentStep - 1);
    }
  });

  // Ensure we don't attach duplicate listeners: all listeners were bound once above.

}); 

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
