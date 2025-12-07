

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
      [1,2,3,4,5].forEach(n=>{
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
    if (step === 2) return 'Invitez 3 à 5 personnes en remplissant leurs informations.';
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
      // build array of boolean for each invite (1..5)
      const invites = [1,2,3,4,5].map(n=>{
        const lastEl = form.querySelector(`[name=i${n}-last]`);
        const firstEl = form.querySelector(`[name=i${n}-first]`);
        const socialEl = form.querySelector(`[name=i${n}-social]`);
        const profileEl = form.querySelector(`[name=i${n}-profile]`);

        const last = lastEl ? String(lastEl.value).trim() : '';
        const first = firstEl ? String(firstEl.value).trim() : '';
        const social = socialEl ? String(socialEl.value).trim() : '';

        // Require profile if social provided; if social empty, profile must be hidden or empty
        let profileOk = true;
        if (social) {
          const profileVal = profileEl ? String(profileEl.value).trim() : '';
          profileOk = profileVal.length > 0;
        } else {
          if (profileEl) {
            const wrap = profileEl.closest('.profile-wrap');
            if (wrap && getComputedStyle(wrap).display !== 'none') {
              profileOk = false;
            }
          }
        }

        return last && first && social && profileOk;
      });

      // count valid invites (must be between 3 and 5)
      const validCount = invites.filter(Boolean).length;
      return validCount >= 3 && validCount <= 5;
    }
    else if (step === 3) {
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
          // clear profile input when social deselected
          const profileInput = e.target.closest('.invite').querySelector('[name$="-profile"]');
          if (profileInput) profileInput.value = '';
        }
        nextBtn2.disabled = !validateStep(2);
      });
    });

 // any input change triggers validation & partial save
    s2Form.addEventListener('input', ()=>{
      // build invites structure for 1..5
      const v = {};
      [1,2,3,4,5].forEach(n=>{
        const last = s2Form.querySelector(`[name=i${n}-last]`)?.value.trim() || '';
        const first = s2Form.querySelector(`[name=i${n}-first]`)?.value.trim() || '';
        const social = s2Form.querySelector(`[name=i${n}-social]`)?.value || '';
        const profile = s2Form.querySelector(`[name=i${n}-profile]`)?.value || '';
        v[`invite${n}`] = { last, first, social, profile };
      });
      saveData({ invites: v });

      // compute how many invites are currently valid
      const validCount = Object.values(v).filter(inv=>{
        const last = inv.last;
        const first = inv.first;
        const social = inv.social;
        let profileOk = true;
        if (social) {
          profileOk = (inv.profile || '').trim().length > 0;
        }
        return last && first && social && profileOk;
      }).length;

      // visual micro-feedback
      if (validCount >= 3) {
        s2Hint.textContent = '✔ Les invitations sont complètes.';
        s2Hint.style.color = 'var(--deep-green)';
      } else {
        s2Hint.textContent = '';
      }

      // enable next when validation passes
      nextBtn2.disabled = !validateStep(2);
      if (validateStep(2)) {
        nextBtn2.removeAttribute('disabled');
      }
    });

nextBtn2.addEventListener('click', function () {
      if (!validateStep(2)) {
        showToast('Complétez entre 3 et 5 invitations pour continuer.');
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
        [1,2,3,4,5].forEach(n=>{
          const inv = s.invites[`invite${n}`];
          if (!inv) return;
          const form = s2Form;
          const lastEl = form.querySelector(`[name=i${n}-last]`);
          const firstEl = form.querySelector(`[name=i${n}-first]`);
          const socialEl = form.querySelector(`[name=i${n}-social]`);
          const profileEl = form.querySelector(`[name=i${n}-profile]`);
          if (lastEl) lastEl.value = inv.last || '';
          if (firstEl) firstEl.value = inv.first || '';
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

// analytics-popup.js (UPDATED - only changes inside original IIFE; drop-in replacement for the file)
// Usage: inclure ce script après le DOM (ou bundler). Conserve le même style modulaire et non-invasif.
// Changements principaux :
// 1) meilleure extraction du nom "réel" depuis .influencer-meta (cherche <strong> d'abord).
// 2) le bouton "Voter" appelle maintenant la logique de sélection existante en déclenchant un click
//    sur la carte .influencer correspondante (donc *n'altère pas* la logique du stepper mais la réutilise).
//    Il gère aussi les cas : déjà voté / max atteint, et affiche des toasts pertinents.
// Rappel : ce script n'essaie PAS d'accéder à selectedInfluencers en tant que variable JS (scopée dans le stepper).
//         Il se base sur l'état DOM (.influencer.selected) et déclenche les évènements natifs pour réutiliser
//         la logique du stepper (toggleCard) définie ailleurs.

(function () {
  'use strict';

  // --- Helper: safe access to existing global toast function (reuse si disponible) ---
  function showLocalToast(msg, ms = 2500) {
    if (typeof window.showToast === 'function') {
      try { window.showToast(msg, ms); return; } catch (e) { /* fallback */ }
    }
    // Fallback: small local toast (kept minimal so on-page toast remains authoritative)
    let t = document.getElementById('analytics-local-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'analytics-local-toast';
      t.className = 'toast';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(()=> t.classList.remove('show'), ms);
  }

  // Use this helper everywhere to prefer global showToast when available
  function showBestToast(msg, ms = 2500) {
    if (typeof window.showToast === 'function') {
      try { window.showToast(msg, ms); return; } catch(e) {}
    }
    showLocalToast(msg, ms);
  }

  // --- DOM refs (modal is static in DOM as requested) ---
  const modal = document.getElementById('analyticsModal');
  const overlay = document.getElementById('analyticsOverlay');
  const closeBtn = document.getElementById('analyticsClose');
  const photoEl = document.getElementById('analyticsPhoto');
  const nameEl = document.getElementById('analyticsName');
  const sectorEl = document.getElementById('analyticsSector');
  const statusEl = document.getElementById('analyticsStatus');
  const votesEl = document.getElementById('analyticsVotes');
  const percentEl = document.getElementById('analyticsPercent');
  const rankEl = document.getElementById('analyticsRank');
  const trendsEl = document.getElementById('analyticsTrends');
  const voteBtn = document.getElementById('analyticsVoteBtn');

  const canvasBar = document.getElementById('analyticsBar3D');
  const canvasLine = document.getElementById('analyticsLine3D');

  // Keep references to Three.js resources for cleanup
  let threeContexts = { bar: null, line: null };

  // Keep reference to the influencer card currently opened in the modal
  let currentCard = null;
  // Keep the dataset.name for safety (string)
  let currentDataName = '';

  // Small utility to safely call external translation function
  function callUpdateLocalLang() {
    if (typeof window.updateLocalLang === 'function') {
      try { window.updateLocalLang(); } catch (e) { /* ignore errors */ }
    } else {
      const langClass = document.body.classList.contains('en') ? 'en' : 'fr';
      document.querySelectorAll('[data-fr]').forEach(el=>{
        const fr = el.getAttribute('data-fr');
        const en = el.getAttribute('data-en');
        if (!fr || !en) return;
        el.textContent = (langClass === 'en') ? en : fr;
      });
    }
  }

  // --- Open modal with data from an influencer card ---
  function openModalFromCard(cardEl) {
    if (!cardEl) return;
    currentCard = cardEl; // store for vote button usage
    currentDataName = String(cardEl.dataset.name || '').trim();

    // 1) Extract a robust display name from .influencer-meta:
    //    Prefer a strong tag inside .influencer-meta (common pattern). Fall back to full textContent.
    let displayName = '';
    const metaWrap = cardEl.querySelector('.influencer-meta');
    if (metaWrap) {
      const strong = metaWrap.querySelector('strong');
      if (strong && strong.innerText && strong.innerText.trim()) {
        displayName = strong.innerText.trim();
      } else if (metaWrap.innerText && metaWrap.innerText.trim()) {
        displayName = metaWrap.innerText.trim();
      }
    }
    // Lastly fall back to dataset.name if nothing found
    if (!displayName) displayName = currentDataName || '—';

    // Extract background image (if any)
    const picEl = cardEl.querySelector('.influencer-pic');
    let bg = '';
    if (picEl) {
      const style = getComputedStyle(picEl);
      const bgImage = style.backgroundImage || '';
      const m = bgImage.match(/url\((['"]?)(.+?)\1\)/);
      if (m && m[2]) bg = m[2];
    }

    // Populate modal fields (non-destructive)
    nameEl.textContent = displayName;
    nameEl.setAttribute('data-fr', nameEl.getAttribute('data-fr') || displayName);
    nameEl.setAttribute('data-en', nameEl.getAttribute('data-en') || displayName);

    // photo
    if (bg) {
      photoEl.style.backgroundImage = `url("${bg}")`;
    } else {
      photoEl.style.backgroundImage = `linear-gradient(180deg,var(--green-soft, #cfead6), #fff)`;
    }

    // Simulated analytics payload (since backend non-branché)
    const simulated = generateSimulatedMetrics(displayName);

    votesEl.textContent = simulated.votes.toString();
    percentEl.textContent = simulated.percent + '%';
    rankEl.textContent = simulated.rank.toString();
    trendsEl.textContent = simulated.trend;

    // ensure sector & status can be set by data attributes optionally on the card (extensible)
    const sector = cardEl.dataset.sector || 'Musique';
    const status = cardEl.dataset.status || 'Actif';
    sectorEl.textContent = sector;
    sectorEl.setAttribute('data-fr', sector);
    sectorEl.setAttribute('data-en', sector);
    statusEl.textContent = status;
    statusEl.setAttribute('data-fr', status);
    statusEl.setAttribute('data-en', status);

    // Unhiding & accessibility
    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');

    // Re-run translation hook to translate inserted strings
    callUpdateLocalLang();

    // Initialize charts (Three.js)
    try {
      initBarChart3D(canvasBar, simulated.barData);
      initLineChart3D(canvasLine, simulated.lineData);
    } catch (e) {
      // If Three.js not available or error, degrade silently with simple 2D fallback
      drawFallbackBar(canvasBar, simulated.barData);
      drawFallbackLine(canvasLine, simulated.lineData);
    }

    // Focus management
    closeBtn.focus();
  }

  // --- Close modal & cleanup ---
  function closeModal() {
    // Remove Three.js scenes if created
    try {
      if (threeContexts.bar && typeof threeContexts.bar.dispose === 'function') threeContexts.bar.dispose();
      if (threeContexts.line && typeof threeContexts.line.dispose === 'function') threeContexts.line.dispose();
      if (threeContexts.bar && threeContexts.bar.stop) threeContexts.bar.stop();
      if (threeContexts.line && threeContexts.line.stop) threeContexts.line.stop();
    } catch (e) {}
    // clear canvases
    if (canvasBar) {
      const ctx = canvasBar.getContext('2d'); if (ctx) ctx.clearRect(0,0,canvasBar.width, canvasBar.height);
    }
    if (canvasLine) {
      const ctx = canvasLine.getContext('2d'); if (ctx) ctx.clearRect(0,0,canvasLine.width, canvasLine.height);
    }

    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    // reset photo background to none (optional)
    photoEl.style.backgroundImage = 'none';
    // reset tracked card ref
    currentCard = null;
    currentDataName = '';
  }

  // --- Simulated metrics generator (unchanged) ---
  function generateSimulatedMetrics(seed) {
    let s = 0;
    for (let i = 0; i < (seed || '').length; i++) s = (s * 31 + seed.charCodeAt(i)) & 0xffffffff;
    const base = Math.abs(s % 1000) + 120;
    const votes = base;
    const percent = Math.min(99, Math.round((votes / 2000) * 100));
    const rank = Math.max(1, 1 + (s % 10));
    const trend = (s % 3) === 0 ? '↗' : ((s % 3) === 1 ? '→' : '↘');
    const barData = Array.from({length:6}, (_,i) => Math.round((Math.abs((s >> (i+2)) % 50) + 10) * (1 + i*0.12)));
    const lineData = Array.from({length:20}, (_,i) => Math.round((Math.abs((s >> (i+3)) % 60) + 8) * (1 + Math.sin(i/3) * 0.4)));
    return { votes, percent, rank, trend, barData, lineData };
  }

  // --- Vote button handling (now calls the stepper selection by simulating a card click) ---
  voteBtn.addEventListener('click', function (ev) {
    ev.stopPropagation();
    ev.preventDefault();

    // Ensure we have a currently opened card
    const card = currentCard;
    if (!card) {
      showBestToast(document.body.classList.contains('en') ? 'No influencer selected.' : 'Aucun influenceur sélectionné.');
      return;
    }

    // Determine current selected count via DOM (reliable, does not access stepper internal vars)
    const currentlySelected = Array.from(document.querySelectorAll('.influencer.selected')).length;
    const alreadySelected = card.classList.contains('selected');

    // Messages (localized minimal)
    const msgAlready = document.body.classList.contains('en') ? 'This influencer is already voted.' : 'Cet influenceur a déjà été voté.';
    const msgMax = document.body.classList.contains('en') ? 'Maximum votes reached (3).' : 'Nombre maximal de votes atteint (3).';
    const msgSuccess = document.body.classList.contains('en') ? 'Vote enregistré.' : 'Vote enregistré.';

    // If already selected -> notify and optionally close
    if (alreadySelected) {
      showBestToast(msgAlready, 2200);
      // still animate to give feedback
      voteBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.96)' }, { transform: 'scale(1)' }], { duration: 220 });
      return;
    }

    // If max reached -> notify (do not select)
    if (currentlySelected >= 3) {
      showBestToast(msgMax, 2600);
      voteBtn.animate([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'translateX(0)' }], { duration: 260 });
      return;
    }

    // Otherwise — simulate a user click on the card element so the existing stepper selection logic runs.
    // This is intentionally a native MouseEvent with bubbles true so existing handlers receive it.
    try {
      const clickEv = new MouseEvent('click', { view: window, bubbles: true, cancelable: true });
      // Dispatch the click on the card (not on .influencer-pic) to ensure toggleCard is executed.
      const dispatched = card.dispatchEvent(clickEv);

      // After dispatch, the stepper's click handler should have updated the DOM (added .selected),
      // and saved state via saveData() (existing code).
      // Provide user feedback
      if (dispatched) {
        showBestToast(msgSuccess, 1800);
        // Animate the vote button quickly
        voteBtn.animate([{ transform: 'scale(1)' }, { transform: 'scale(0.94)' }, { transform: 'scale(1)' }], { duration: 200 });

        // Optional: show the flag visually in the modal if card now selected and has a .influencer-flag text
        // We won't modify DOM of card here (toggleCard already does it). But to ensure visual parity in modal,
        // we can briefly flash the card's flag if present.
        const flag = card.querySelector('.influencer-flag');
        if (flag) {
          // small micro-animation so user sees it
          flag.animate([{ transform: 'scale(.8)', opacity: 0.6 }, { transform: 'scale(1.06)', opacity: 1 }, { transform: 'scale(1)' }], { duration: 300 });
        }
      } else {
        // If dispatch was canceled by some handler, still inform user gracefully
        showBestToast(document.body.classList.contains('en') ? 'Vote attempt canceled.' : 'Tentative de vote annulée.', 1800);
      }
    } catch (err) {
      // If dispatch fails for any reason, fall back to UI-only: add class + save minimal state to localStorage
      try {
        card.classList.add('selected');
        // Attempt to update persisted selection by reading/writing localStorage key used by stepper (best-effort):
        try {
          const storageKey = 'dtt_stepper_data';
          const current = JSON.parse(localStorage.getItem(storageKey) || '{}');
          const selected = current.selectedInfluencers || [];
          if (!selected.includes(currentDataName)) {
            selected.push(currentDataName);
            current.selectedInfluencers = selected;
            localStorage.setItem(storageKey, JSON.stringify(current));
          }
        } catch (e) { /* ignore persistence fallback errors */ }
        showBestToast(msgSuccess, 1800);
      } catch (e) {
        showBestToast(document.body.classList.contains('en') ? 'Unable to register vote.' : 'Impossible d\'enregistrer le vote.', 2000);
      }
    }
  });

  // --- Close handlers (unchanged) ---
  closeBtn.addEventListener('click', function (ev) { ev.stopPropagation(); closeModal(); });
  overlay.addEventListener('click', function () { closeModal(); });

  // Close on Escape
  function onKeyUp(e) {
    if (e.key === 'Escape') closeModal();
  }
  document.addEventListener('keyup', onKeyUp);

  // --- Attach listeners to influencer images (only the image opens analytics) ---
  // The listener itself remains the same but we ensure it sets currentCard properly via openModalFromCard.
  function onPicClickHandler(ev) {
    if (ev.type === 'click' && ev.button !== 0) return;
    const pic = ev.currentTarget;
    const card = pic.closest('.influencer');
    if (!card) return;
    ev.stopPropagation();
    ev.preventDefault();
    openModalFromCard(card);
  }

  function initListeners() {
    const pics = Array.from(document.querySelectorAll('.influencer .influencer-pic'));
    pics.forEach(pic => {
      pic.removeEventListener('click', onPicClickHandler);
      pic.addEventListener('click', onPicClickHandler, { passive: false });
      pic.setAttribute('tabindex', '0');
      pic.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault(); e.stopPropagation();
          onPicClickHandler.call(pic, e);
        }
      });
    });
  }

  initListeners();

  // Observe influencer grid for future additions
  const grid = document.getElementById('influencerGrid');
  if (grid) {
    const obs = new MutationObserver((mutations) => { initListeners(); });
    obs.observe(grid, { childList: true, subtree: true });
  }

  // --- Three.js initializers and fallbacks (unchanged, kept for completeness) ---
  function initBarChart3D(canvas, data) {
    if (!canvas) return;
    if (typeof window.THREE === 'undefined') throw new Error('THREE not found');
    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(canvas.width, canvas.height, false);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, canvas.width / canvas.height, 0.1, 1000);
    camera.position.set(0, 45, 80);
    camera.lookAt(0, 0, 0);
    const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.9);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(0, 50, 20);
    scene.add(dir);
    const group = new THREE.Group();
    const spacing = 6;
    data = data || [10, 18, 9, 22, 14, 28];
    data.forEach((v,i) => {
      const h = Math.max(2, v / 1.5);
      const geom = new THREE.BoxGeometry(3.6, h, 3.6);
      const mat = new THREE.MeshStandardMaterial({ color: 0x2e6b48, metalness: 0.2, roughness: 0.6 });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set((i - (data.length-1)/2) * spacing, h/2, 0);
      group.add(mesh);
    });
    scene.add(group);
    const gridHelper = new THREE.GridHelper(120, 10, 0x2E6B48, 0xEAEAEA);
    gridHelper.position.y = 0;
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);
    let running = true;
    function animate() {
      if (!running) return;
      group.rotation.y += 0.008;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
    threeContexts.bar = {
      scene, camera, renderer, group,
      stop() { running = false; },
      dispose() {
        try {
          renderer.dispose();
          scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (Array.isArray(o.material)) o.material.forEach(m=>m.dispose()); else o.material.dispose(); } });
        } catch (e){}
      }
    };
    return threeContexts.bar;
  }

  function initLineChart3D(canvas, data) {
    if (!canvas) return;
    if (typeof window.THREE === 'undefined') throw new Error('THREE not found');
    const THREE = window.THREE;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(canvas.width, canvas.height, false);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, canvas.width / canvas.height, 0.1, 1000);
    camera.position.set(0, 28, 80);
    camera.lookAt(0, 8, 0);
    const light = new THREE.DirectionalLight(0xffffff, 0.9);
    light.position.set(20, 40, 20);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    data = data || Array.from({length:20}, (_,i)=>10 + Math.sin(i/3) * 6 + Math.abs(i-10)/2);
    const points = data.map((v,i) => new THREE.Vector3((i - (data.length/2)) * 3.2, v, Math.cos(i/3) * 2));
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, 64, 0.8, 8, false);
    const material = new THREE.MeshStandardMaterial({ color: 0x3ea489, metalness: 0.2, roughness: 0.4 });
    const tube = new THREE.Mesh(geometry, material);
    scene.add(tube);
    const markerGeom = new THREE.SphereGeometry(1.2, 12, 12);
    const markerMat = new THREE.MeshStandardMaterial({ color: 0xffcc33 });
    const marker = new THREE.Mesh(markerGeom, markerMat);
    scene.add(marker);
    let t = 0;
    let running = true;
    function animate() {
      if (!running) return;
      t += 0.002;
      const p = curve.getPointAt((t % 1 + 1) % 1);
      marker.position.copy(p);
      tube.rotation.y = Math.sin(t * 0.6) * 0.06;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }
    animate();
    threeContexts.line = {
      scene, camera, renderer, tube, marker,
      stop() { running = false; },
      dispose() {
        try {
          renderer.dispose();
          scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) { if (Array.isArray(o.material)) o.material.forEach(m=>m.dispose()); else o.material.dispose(); } });
        } catch (e){}
      }
    };
    return threeContexts.line;
  }

  function drawFallbackBar(canvas, data) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const w = canvas.width;
    const h = canvas.height;
    const pad = 20;
    const barW = Math.max(8, (w - pad*2) / data.length - 8);
    const max = Math.max(...data, 1);
    data.forEach((v,i) => {
      const bw = barW;
      const x = pad + i*(bw + 8);
      const bh = Math.round((v/max) * (h - pad*2));
      ctx.fillStyle = '#2e6b48';
      ctx.fillRect(x, h - pad - bh, bw, bh);
    });
  }
  function drawFallbackLine(canvas, data) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    const w = canvas.width; const h = canvas.height; const pad = 18;
    const max = Math.max(...data,1); const min = Math.min(...data,0);
    ctx.beginPath();
    data.forEach((v,i) => {
      const x = pad + (i/(data.length-1)) * (w - pad*2);
      const y = pad + (1 - (v - min)/(max - min || 1)) * (h - pad*2);
      if (i === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.strokeStyle = '#3ea489'; ctx.lineWidth = 2; ctx.stroke();
  }

  // --- cleanup when page unloads to avoid memory leaks ---
  window.addEventListener('unload', function () {
    try { closeModal(); } catch (e){}
    document.removeEventListener('keyup', onKeyUp);
  });

  // expose a small API if needed by host (non-invasive)
  window.DTTAnalyticsModal = {
    openForCard: openModalFromCard,
    close: closeModal
  };

})();

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

// Header 2 permanent
(function() {
  const desktopToggle = document.getElementById('campaignToggle'); // lien desktop
  const subHeader = document.getElementById('subHeader');
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileInner = mobileMenu ? mobileMenu.querySelector('.mobile-menu-inner') || mobileMenu : null;

  if (!desktopToggle || !subHeader) return;

  let isOpen = false;

  // Fonction unique : ouvre le subHeader une fois et le rend permanent
  function openSubHeaderOnce() {
    if (isOpen) return;
    subHeader.classList.add('is-open');
    subHeader.setAttribute('aria-hidden', 'false');
    desktopToggle.setAttribute('aria-expanded', 'true');
    isOpen = true;
  }

  // Désactive toutes fermetures existantes
  function disableClosures() {
    window.removeEventListener('scroll', null);
    document.removeEventListener('keydown', null);
  }

  // Gestion desktop : clic unique
  desktopToggle.addEventListener('click', function(e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openSubHeaderOnce();
  }, { passive: false });

  // Gestion mobile : clic sur le lien dans le menu hamburger
  if (mobileInner) {
    const mobileCampaignLink = mobileInner.querySelector(
      'a.nav-link[data-fr="Campagne pour ceux qu\\\'on aime"], a.nav-link[data-fr="Campagne pour ceux qu\'on aime"]'
    );
    if (mobileCampaignLink) {
      mobileCampaignLink.addEventListener('click', function(e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        // Déplace le subHeader dans le menu mobile si nécessaire
        if (!mobileInner.contains(subHeader)) {
          subHeader.classList.add('mobile-mode');
          const mobileList = mobileInner.querySelector('.mobile-list');
          if (mobileList && mobileList.parentNode === mobileInner) {
            mobileInner.insertBefore(subHeader, mobileList.nextSibling);
          } else {
            mobileInner.appendChild(subHeader);
          }
        }
        openSubHeaderOnce();
      }, { passive: false });
    }
  }

  // On désactive toutes les fermetures automatiques
  disableClosures();

  // Déplacement initial selon largeur
  function moveSubHeaderInitial() {
    if (window.innerWidth <= 992 && mobileInner) {
      if (!mobileInner.contains(subHeader)) {
        subHeader.classList.add('mobile-mode');
        const mobileList = mobileInner.querySelector('.mobile-list');
        if (mobileList && mobileList.parentNode === mobileInner) {
          mobileInner.insertBefore(subHeader, mobileList.nextSibling);
        } else {
          mobileInner.appendChild(subHeader);
        }
      }
    } else {
      subHeader.classList.remove('mobile-mode');
      if (subHeader.parentNode !== desktopToggle.parentNode) {
        desktopToggle.parentNode.appendChild(subHeader);
      }
    }
  }

  window.addEventListener('resize', moveSubHeaderInitial);
  moveSubHeaderInitial();
})();
//fin header 2