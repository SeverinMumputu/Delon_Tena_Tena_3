document.addEventListener('DOMContentLoaded', function () {
  // Centralized state
  let currentStep = 1;
  const TOTAL_STEPS = 4;
  const storageKey = 'dtt_stepper_data';

  // Elements
  const stepCards = Array.from(document.querySelectorAll('.step-card'));
  const stepDots = Array.from(document.querySelectorAll('.step-dot'));
  const progressBar = document.querySelector('.progress-bar');
  const toastEl = document.getElementById('toast');
  const thanksPanel = document.getElementById('thanksPanel');
  // ✅ Correction robuste : forcer le masquage complet au chargement
  if (thanksPanel) {
    // Masquer immédiatement sans attendre le DOM rendering
    thanksPanel.style.display = 'none';
    thanksPanel.hidden = true;
    thanksPanel.setAttribute('aria-hidden', 'true');
  }
  const yearFooter = document.getElementById('yearFooter');

  // Step-specific elements
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn1 = document.getElementById('nextBtn1');
  const prevBtn2 = document.getElementById('prevBtn2');
  const nextBtn2 = document.getElementById('nextBtn2');
  const prevBtn3 = document.getElementById('prevBtn3');
  const nextBtn3 = document.getElementById('nextBtn3');
  const prevBtn4 = document.getElementById('prevBtn4');
  const finishBtn = document.getElementById('finishBtn');

  // Step 1 fields
  const s1Fields = {
    last: document.getElementById('s1-last'),
    first: document.getElementById('s1-first'),
    email: document.getElementById('s1-email'),
    phone: document.getElementById('s1-phone'),
    social: document.getElementById('s1-social'),
    profileWrap: document.getElementById('s1-profile-wrap'),
    profile: document.getElementById('s1-profile'),
    hint: document.getElementById('s1-hint')
  };

  // Step 2
  const s2Form = document.getElementById('form-step-2');
  const s2Hint = document.getElementById('s2-hint');

  // Step 3
  const influencerGrid = document.getElementById('influencerGrid');
  const influencerCards = Array.from(document.querySelectorAll('.influencer'));
  const infCount = document.getElementById('inf-count');
  const infSearch = document.getElementById('influencer-search');
  const s3Hint = document.getElementById('s3-hint');
  let selectedInfluencers = [];

  // Step 4
  const donorButtons = Array.from(document.querySelectorAll('.donor-logo'));
  const donationOutput = document.getElementById('donation-output');

  // Local helpers
  function saveData(partial) {
    const current = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const merged = Object.assign({}, current, partial);
    localStorage.setItem(storageKey, JSON.stringify(merged));
  }
  function getData(){ return JSON.parse(localStorage.getItem(storageKey) || '{}'); }

  // 🔧 PATCH A INSÉRER ICI
  // Reset helper to clear UI + state related to the stepper (used on "Retour à la page")
  function resetStepperState() {
    // Pourquoi: Remettre à zéro l'UI et l'état JS sans renommer de variables.
    try {
      // clear storage key used by stepper
      localStorage.removeItem(storageKey);
    } catch(e){}

    // Step1 clear
    if (s1Fields.last) s1Fields.last.value = '';
    if (s1Fields.first) s1Fields.first.value = '';
    if (s1Fields.email) s1Fields.email.value = '';
    if (s1Fields.phone) s1Fields.phone.value = '';
    if (s1Fields.social) s1Fields.social.value = '';
    if (s1Fields.profile) s1Fields.profile.value = '';
    if (s1Fields.profileWrap) s1Fields.profileWrap.style.display = 'none';

    // Step2 clear invites
    if (s2Form) {
      [1,2,3].forEach(n=>{
        const lastEl = s2Form.querySelector(`[name=i${n}-last]`);
        const firstEl = s2Form.querySelector(`[name=i${n}-first]`);
        const socialEl = s2Form.querySelector(`[name=i${n}-social]`);
        const profileEl = s2Form.querySelector(`[name=i${n}-profile]`);
        if (lastEl) lastEl.value = '';
        if (firstEl) firstEl.value = '';
        if (socialEl) socialEl.value = '';
        if (profileEl) { profileEl.value = ''; 
          const wrap = profileEl.closest('.profile-wrap');
          if (wrap) wrap.style.display = 'none';
        }
      });
      if (s2Hint) { s2Hint.textContent = ''; }
    }

    // Step3 clear selections
    selectedInfluencers = [];
    influencerCards.forEach(card => card.classList.remove('selected'));
    if (infCount) infCount.textContent = '0 / 3';

    // Step4 clear donation output and donor buttons selection
    if (donationOutput) donationOutput.innerHTML = '';
    donorButtons.forEach(b => b.classList.remove('selected'));

    // reset stepper UI to step 1
    goToStep(1);
  }
  // 🔧 END PATCH A

  // Toast helper
  let toastTimer = null;
  function showToast(text, ms = 3000) {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{ toastEl.classList.remove('show'); }, ms);
  }

  // Progress calculation
  function updateProgress() {
    const pct = ((currentStep - 1) / (TOTAL_STEPS - 1)) * 100;
    if (progressBar) progressBar.style.width = pct + '%';

    stepDots.forEach(btn=>{
      const s = Number(btn.dataset.step);
      btn.classList.toggle('active', s === currentStep);
      btn.classList.toggle('completed', s < currentStep);
      btn.setAttribute('aria-current', s === currentStep ? 'step' : 'false');
    });
  }

  // Central goToStep function — shows requested step and updates UI
  function goToStep(stepNumber) {
    if (stepNumber < 1 || stepNumber > TOTAL_STEPS) return;
    // validate that we cannot jump forward unless previous steps completed
    if (stepNumber > currentStep) {
      // require validations for forward navigation
      const ok = validateStep(currentStep);
      if (!ok) {
        showToast(getStepHint(currentStep) || 'Veuillez compléter les champs requis.');
        return;
      }
    }
    // update current
    currentStep = stepNumber;

    // Show/hide step cards
    stepCards.forEach(card=>{
      const s = Number(card.dataset.step);
      if (s === currentStep) {
        card.hidden = false;
        // small animation: add active class after rendering
        setTimeout(()=>{ card.classList.add('active'); }, 20);
      } else {
        card.classList.remove('active');
        // hide non-active after transition
        setTimeout(()=>{ if (Number(card.dataset.step) !== currentStep) card.hidden = true; }, 320);
      }
    });

    // Enable/disable prev buttons
    prevBtn.disabled = currentStep === 1;
    prevBtn2.disabled = currentStep === 1;
    prevBtn3.disabled = currentStep === 1;
    prevBtn4.disabled = currentStep === 1;

    // Manage Next/Finish availability per step
    // Step 1
    nextBtn1.disabled = !validateStep(1);

    // Step 3
    nextBtn3.disabled = !(selectedInfluencers.length === 3);
    // Finish

    // update progress visuals
    updateProgress();
  }

  // Return a human hint for a step (for toast)
  function getStepHint(step){
    if (step === 1) return 'Complétez tous les champs de l\'enregistrement.';
    if (step === 2) return 'Invitez 3 personnes en remplissant leurs informations.';
    if (step === 3) return 'Sélectionnez exactement 3 influenceurs.';
    if (step === 4) return 'Sélectionnez une méthode de don.';
    return '';
  }

  // Validate step inputs — returns boolean
  function validateStep(step) {
    if (step === 1) {
      const last = s1Fields.last.value.trim();
      const first = s1Fields.first.value.trim();
      const email = s1Fields.email.value.trim();
      const phone = s1Fields.phone.value.trim();
      // simple email and phone checks
      const emailOk = /\S+@\S+\.\S+/.test(email);
      const phoneOk = phone.length >= 7;

      // 🔧 PATCH B INSÉRER ICI
      // Include profile validation when a social network is selected
      const socialVal = s1Fields.social ? String(s1Fields.social.value).trim() : '';
      let profileOk = true;
      if (socialVal) {
        const profileVal = s1Fields.profile ? String(s1Fields.profile.value).trim() : '';
        profileOk = profileVal.length > 0;
      }
      // 🔧 END PATCH B

      const ok = last && first && emailOk && phoneOk && profileOk;
      return Boolean(ok);
    } 
    else if (step === 2) {
      const form = s2Form;
      const invites = [1,2,3].map(n=>{
        const lastEl = form.querySelector(`[name=i${n}-last]`);
        const firstEl = form.querySelector(`[name=i${n}-first]`);
        const socialEl = form.querySelector(`[name=i${n}-social]`);
        const profileEl = form.querySelector(`[name=i${n}-profile]`);

        const last = lastEl ? String(lastEl.value).trim() : '';
        const first = firstEl ? String(firstEl.value).trim() : '';
        const social = socialEl ? String(socialEl.value).trim() : '';

        // 🔧 PATCH C INSÉRER ICI
        // Require social to be provided for each invite; if social provided, require profile
        let profileOk = true;
        if (social) {
          const profileVal = profileEl ? String(profileEl.value).trim() : '';
          profileOk = profileVal.length > 0;
        } else {
          // if social empty then profile must be hidden / ignored
          if (profileEl) {
            const wrap = profileEl.closest('.profile-wrap');
            if (wrap && getComputedStyle(wrap).display !== 'none') {
              // if profile-wrap is visible but social empty -> treat as invalid
              profileOk = false;
            }
          }
        }
        // 🔧 END PATCH C

        // Require name, firstname and social for each invite, plus profileOk when social exists
        return last && first && social && profileOk;
      });
      return invites.every(Boolean);
    } else if (step === 3) {
      return selectedInfluencers.length === 3;
    } 
    return false;
  }

  (function step1Init(){
    // handle social selector
    s1Fields.social.addEventListener('change', function (e) {
      if (e.target.value) {
        s1Fields.profileWrap.style.display = 'flex';
        s1Fields.profile.setAttribute('required','true');
      } else {
        s1Fields.profileWrap.style.display = 'none';
        s1Fields.profile.removeAttribute('required');
        s1Fields.profile.value = ''; // 🔧 PATCH D: clear profile when social removed (one-line)
      }
      // save small update
      saveData({ social: e.target.value });
      nextBtn1.disabled = !validateStep(1);
    });

    // on input validation
    ['last','first','email','phone','profile'].forEach(key=>{
      const el = s1Fields[key];
      if (!el) return;
      el.addEventListener('input', function () {
        // validate and save
        const payload = {
          lastName: s1Fields.last.value,
          firstName: s1Fields.first.value,
          email: s1Fields.email.value,
          phone: s1Fields.phone.value,
          social: s1Fields.social.value,
          profile: s1Fields.profile.value
        };
        saveData(payload);
        nextBtn1.disabled = !validateStep(1);
      });
    });

    // Next button for step1
    nextBtn1.addEventListener('click', function () {
      if (!validateStep(1)) {
        showToast('Veuillez compléter tous les champs d\'enregistrement.');
        return;
      }
      // Save final fields of step1
      saveData({
        lastName: s1Fields.last.value.trim(),
        firstName: s1Fields.first.value.trim(),
        email: s1Fields.email.value.trim(),
        phone: s1Fields.phone.value.trim(),
        social: s1Fields.social.value,
        profile: s1Fields.profile.value
      });
      goToStep(2);
    });
  })();

  (function step2Init(){
    // handle change on each select: show profile input
    s2Form.querySelectorAll('select').forEach(sel=>{
        
      sel.addEventListener('change', (e)=>{
        const wrap = e.target.closest('.invite').querySelector('.profile-wrap');
        if (e.target.value) wrap.style.display = 'flex';
        else {
          wrap.style.display = 'none';
          // 🔧 PATCH E: clear profile input when social deselected (one-line)
          const profileInput = e.target.closest('.invite').querySelector('[name$="-profile"]');
          if (profileInput) profileInput.value = '';
        }
        nextBtn2.disabled = !validateStep(2);
      });
    });

    // any input change triggers validation & partial save
    s2Form.addEventListener('input', ()=>{
      // build invites structure
      const v = {};
      [1,2,3].forEach(n=>{
        const last = s2Form.querySelector(`[name=i${n}-last]`).value.trim();
        const first = s2Form.querySelector(`[name=i${n}-first]`).value.trim();
        //const phone = s2Form.querySelector([name=i${n}-phone]).value.trim();
        const social = s2Form.querySelector(`[name=i${n}-social]`)?.value || '';
        const profile = s2Form.querySelector(`[name=i${n}-profile]`)?.value || '';
        v[`invite${n}`] = { last, first /** , phone */, social, profile };
      });
      saveData({ invites: v });
      // visual micro-feedback
      if (validateStep(2)) {
        s2Hint.textContent = '✔ Les 3 invitations sont complètes.';
        s2Hint.style.color = 'var(--deep-green)';
      } else {
        s2Hint.textContent = '';
      }
      nextBtn2.disabled = !validateStep(2);
      if (validateStep(2)) {
        nextBtn2.removeAttribute('disabled');
      }
    });

    nextBtn2.addEventListener('click', function () {
      if (!validateStep(2)) {
        showToast('Complétez les 3 invitations pour continuer.');
        return;
      }
      // final save
      const stored = getData();
      stored.invitesValidated = true;
      localStorage.setItem(storageKey, JSON.stringify(stored));
      // small validation animation on the dots
      stepDots[1].classList.add('completed');
      showToast('Invitations prêtes — étape validée', 1800);
      setTimeout(()=>goToStep(3), 600);
    });
  })();

  (function step3Init(){
    function updateInfCount(){ infCount.textContent = selectedInfluencers.length + ' / 3'; nextBtn3.disabled = selectedInfluencers.length !== 3; }

    influencerCards.forEach(card=>{
      const name = card.dataset.name || '';
      card.addEventListener('click', toggleCard);
      card.addEventListener('keydown', (e)=>{ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleCard.call(card); }});

      function toggleCard(){
        const n = card.dataset.name;
        const idx = selectedInfluencers.indexOf(n);
        if (idx !== -1) {
          // unselect
          selectedInfluencers.splice(idx,1);
          card.classList.remove('selected');
        } else {
          if (selectedInfluencers.length >= 3) {
            showToast('Vous pouvez sélectionner uniquement 3 influenceurs.');
            // small shake
            card.animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:260});
            return;
          }
          selectedInfluencers.push(n);
          card.classList.add('selected');
        }
        updateInfCount();
        saveData({ selectedInfluencers });
      }
    });

    // search filter
    infSearch.addEventListener('input', function (e) {
      const q = e.target.value.trim().toLowerCase();
      influencerCards.forEach(card=>{
        const name = card.dataset.name.toLowerCase();
        card.style.display = name.includes(q) ? '' : 'none';
      });
    });

    nextBtn3.addEventListener('click', function () {
      if (selectedInfluencers.length !== 3) {
        showToast('Sélectionnez exactement 3 influenceurs.');
        return;
      }
      saveData({ selectedInfluencers });
      showToast('Votes enregistrés — merci.', 1500);
      setTimeout(()=>goToStep(4), 600);
    });
  })();

  (function step4Init(){

    const fixedDonation = {
      method: 'info',
      donorbox: { url: 'https://donorbox.org' },
      orange: { number: '77 123 45 67', name: 'Fondation Delon Tena Tena' },
      mpesa: { number: '60123456', name: 'Fondation Delon Tena Tena' }
    };

    // Render the fixed block into donationOutput (keeps the same visual layout)
    function renderFixedDonation() {
      if (!donationOutput) return;
      donationOutput.innerHTML = `
        <div class="donation-info">
          <h4>DonorBox</h4>
          <p><a href="${fixedDonation.donorbox.url}" target="_blank" rel="noopener">Faire un don via DonorBox</a></p>

          <h4>Orange Money</h4>
          <p>Numéro : ${fixedDonation.orange.number}<br/>Titulaire : ${fixedDonation.orange.name}</p>

          <h4>M-Pesa</h4>
          <p>Numéro : ${fixedDonation.mpesa.number}<br/>Titulaire : ${fixedDonation.mpesa.name}</p>
        </div>
      `;
    }

    // Save the fixed donation details into storage so existing validation logic continues to work
    saveData({ donation: fixedDonation });

    // render immediately (hydrateFromStorage pourra écraser si l'utilisateur a déjà autre chose enregistré)
    renderFixedDonation();

    if (finishBtn) {
      // finishBtn.disabled will be managed by goToStep's logic (which checks getData().donation)
      // but for immediate UX, enable it now
      finishBtn.disabled = false;
    }
    try {
      donorButtons.forEach(b=>{
        b.setAttribute('aria-hidden','true');
        b.setAttribute('tabindex','-1');
        // keep visual classes intact
      });
    } catch(e){ /* ignore if donorButtons not present */ }

    // Note: hydrateFromStorage() (déjà présent) s'exécutera au chargement et remplacera donationOutput
    // si l'utilisateur a des données en localStorage. C'est voulu — on conserve la persistance.
  });

  finishBtn.addEventListener('click', function () {
    // ensure previous steps are validated
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      showToast('Veuillez d\'abord valider les étapes précédentes.');
      return;
    }

    // Show final toast and simulate finish
    showToast('Veuillez envoyer votre reçu par mail à contact@delontenatena.org', 4000);

    // show animated thank you
    setTimeout(()=>{
      thanksPanel.style.display = 'flex'; // <-- rendre visible ici seulement
      thanksPanel.hidden = false;
      thanksPanel.setAttribute('aria-hidden','false');
      // petite animation d’entrée
      thanksPanel.querySelector('.thanks-inner').animate(
        [
          { opacity: 0, transform: 'translateY(8px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 400, easing: 'cubic-bezier(.2,.9,.3,1)' }
      );
    }, 700);
  });

  // close thanks
  document.getElementById('closeThanks').addEventListener('click', function () {
    // 🔧 PATCH F INSÉRER ICI
    // Clear all stepper data, reset UI and redirect to home (one-line reason below)
    // Pourquoi: vider le localStorage lié au stepper + réinitialiser l'UI avant redirection
    try {
      resetStepperState(); // resets UI + removes storageKey
    } catch(e){}
    // redirection vers la page d'accueil
    window.location.href = "index.html";
    // 🔧 END PATCH F
  });

  prevBtn.addEventListener('click', ()=>{ goToStep(Math.max(1, currentStep - 1)); });
  prevBtn2.addEventListener('click', ()=>{ goToStep(Math.max(1, currentStep - 1)); });
  prevBtn3.addEventListener('click', ()=>{ goToStep(Math.max(1, currentStep - 1)); });
  prevBtn4.addEventListener('click', ()=>{ goToStep(Math.max(1, currentStep - 1)); });

  stepDots.forEach(btn=>{
    btn.addEventListener('click', function () {
      const target = Number(btn.dataset.step);
      if (target <= currentStep) {
        goToStep(target);
      } else {
        // attempt forward requires validation
        goToStep(target);
      }
    });
  });

  (function hydrateFromStorage(){
    const s = getData();
    if (s) {
      if (s.lastName) s1Fields.last.value = s.lastName;
      if (s.firstName) s1Fields.first.value = s.firstName;
      if (s.email) s1Fields.email.value = s.email;
      if (s.phone) s1Fields.phone.value = s.phone;
      if (s.social) {
        s1Fields.social.value = s.social;
        s1Fields.profileWrap.style.display = s.social ? 'flex' : 'none';
        if (s.profile) s1Fields.profile.value = s.profile;
      }
      // invites
      if (s.invites) {
        [1,2,3].forEach(n=>{
          const inv = s.invites[`invite${n}`];
          if (!inv) return;
          const form = s2Form;
          const lastEl = form.querySelector(`[name=i${n}-last]`);
          const firstEl = form.querySelector(`[name=i${n}-first]`);
          const socialEl = form.querySelector(`[name=i${n}-social]`);
          const profileEl = form.querySelector(`[name=i${n}-profile]`);
          if (lastEl) lastEl.value = inv.last || '';
          if (firstEl) firstEl.value = inv.first || '';
          //form.querySelector([name=i${n}-phone]).value = inv.phone || '';
          if (inv.social && socialEl) {
            socialEl.value = inv.social;
            if (profileEl) {
              profileEl.closest('.profile-wrap').style.display = 'flex';
              profileEl.value = inv.profile || '';
            }
          } else {
            if (profileEl) {
              const wrap = profileEl.closest('.profile-wrap');
              if (wrap) wrap.style.display = 'none';
              profileEl.value = '';
            }
          }
        });
      }

      if (s.selectedInfluencers) {
        selectedInfluencers = s.selectedInfluencers;
        influencerCards.forEach(card=>{
          if (selectedInfluencers.includes(card.dataset.name)) card.classList.add('selected');
        });
      }
      // donation
      if (s.donation) {
        donationOutput.innerHTML = (s.donation.method === 'donorbox') ? '<strong>DonorBox</strong> — <a href="https://donorbox.org" target="_blank">DonorBox</a>' : '<div>Méthode: '+s.donation.method+'</div>';
        donorButtons.forEach(b=>{ if (b.dataset.method === s.donation.method) b.classList.add('selected'); });
      }
    }
    // update counts & progress
    infCount.textContent = selectedInfluencers.length + ' / 3';
    updateProgress();
    // populate footer year
    if (yearFooter) yearFooter.textContent = new Date().getFullYear();
  })();

  document.querySelectorAll('.local-lang .lang-btn').forEach(btn=>{
    btn.addEventListener('click', function(){
      const lang = btn.dataset.lang;
      // if global setLanguage exists (provided by header), call it (don't overwrite)
      if (typeof window.setLanguage === 'function') {
        window.setLanguage(lang);
        try{ localStorage.setItem('dtt_lang', lang); }catch(e){}
        return;
      }
      // fallback: simple swap
      document.body.classList.remove('fr','en');
      document.body.classList.add(lang);
      // update local buttons active
      document.querySelectorAll('.local-lang .lang-btn').forEach(b=>{ b.classList.toggle('active', b.dataset.lang === lang); b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false'); });
      // swap text for elements with data-fr/data-en
      document.querySelectorAll('[data-fr]').forEach(el=>{
        const fr = el.getAttribute('data-fr'); const en = el.getAttribute('data-en');
        if (!fr || !en) return;
        el.textContent = (lang === 'en') ? en : fr;
      });
    });
  });

  // Finally, show step 1
  goToStep(1);

  // small accessibility: move focus to step card when changing step
  const observer = new MutationObserver(()=> {
    const active = document.querySelector('.step-card.active');
    if (active) active.focus?.();
  });
  observer.observe(document.body, { attributes: true, childList: true, subtree: true });

});

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
