/* ===========================
  Script complet (JS)
  - Validation légère côté client
  - Sauvegarde temporaire dans localStorage
  - Navigation entre étapes, animation des pastilles, barre de progression
  - Gestion des invites, sélection d'influenceurs (max 3), toast
  - Paiement simple: affichage du formulaire et simulation d'envoi + toast
  - Bascule de langue (réutilise setLanguage si présent)
  - Ne renommez pas les fonctions header existantes (setLanguage etc.)
=========================== */

(() => {
  /* -------------------
     Helpers & DOM refs
     ------------------- */
  const qs = s => document.querySelector(s);
  const qsa = s => Array.from(document.querySelectorAll(s));
  const cards = qsa('.step-card');
  const stepPills = qsa('.step-pill');
  const progressAfter = document.querySelector('.progress-bar')?.style;
  const toastEl = qs('#toast');
  const thankOverlay = qs('#thankyouOverlay');
  const finishBtn = qs('#finishBtn');

  // Current step index (1-based)
  let currentStep = 1;
  const maxStep = 4;

  // Storage key
  const STORE_KEY = 'dtt_stepper_data_v1';

  // initial progress percentages per step
  const progressPercents = {1: 20, 2: 45, 3: 75, 4: 100};

  // Influencers dataset (mock data)
  const influencers = [
    {id: 'inf1', name: 'Amina Diallo', img: '', bio: ''},
    {id: 'inf2', name: 'Koffi Mensah', img: '', bio: ''},
    {id: 'inf3', name: 'Sophie Mbaye', img: '', bio: ''},
    {id: 'inf4', name: 'Youssou N.', img: '', bio: ''},
    {id: 'inf5', name: 'Mariam T.', img: '', bio: ''},
    {id: 'inf6', name: 'Lamine S.', img: '', bio: ''},
    {id: 'inf7', name: 'Rita K.', img: '', bio: ''},
  ];

  /* -------------------
     Language quick toggles (reuses setLanguage if available)
     ------------------- */
  qsa('.lang-quick').forEach(btn => {
    btn.addEventListener('click', () => {
      const lang = btn.dataset.lang;
      // If header's setLanguage exists, use it to keep behavior consistent
      if (typeof setLanguage === 'function') {
        setLanguage(lang);
      } else {
        // fallback: swap data attributes ourselves
        document.body.classList.remove('fr','en'); document.body.classList.add(lang);
        qsa('[data-fr]').forEach(el => {
          const fr = el.getAttribute('data-fr'); const en = el.getAttribute('data-en');
          if (fr && en) el.textContent = (lang === 'en') ? en : fr;
        });
      }
      try { localStorage.setItem('dtt_lang', lang); } catch (e){}
    });
  });

  /* -------------------
     Utility: toast
     ------------------- */
  function showToast(message, ms = 2800) {
    toastEl.textContent = message;
    toastEl.hidden = false;
    setTimeout(()=> toastEl.classList.add('show'), 20);
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(()=> {
      toastEl.classList.remove('show');
      setTimeout(()=> toastEl.hidden = true, 300);
    }, ms);
  }

  /* -------------------
     Persistence (localStorage)
     ------------------- */
  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) { return {}; }
  }
  function saveState(obj) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(obj)); } catch (e) {}
  }

  /* -------------------
     Step navigation & UI sync
     ------------------- */
  function goToStep(n, direction = 'forward') {
    if (n < 1 || n > maxStep) return;
    currentStep = n;
    // hide all, show relevant
    cards.forEach(card => {
      const s = Number(card.dataset.step);
      if (s === n) {
        card.hidden = false;
        card.classList.add('active');
        card.setAttribute('aria-hidden', 'false');
      } else {
        card.classList.remove('active');
        card.setAttribute('aria-hidden', 'true');
        card.hidden = true;
      }
    });
    // update pills
    stepPills.forEach(p => {
      const s = Number(p.dataset.step);
      p.setAttribute('aria-selected', s === n ? 'true' : (s < n ? 'true' : 'false'));
    });
    // update progress bar
    const perc = progressPercents[n] || 0;
    const pb = qs('.progress-bar');
    if (pb) pb.style.setProperty('--p', `${perc}%`);
    // update pseudo-element width via inline style
    const bar = document.querySelector('.progress-bar');
    if (bar) bar.style.setProperty('--unused','');
    // animate pseudo by direct style
    const after = document.querySelector('.progress-bar')?.style;
    if (after) {
      const el = document.querySelector('.progress-bar');
      if (el) el.querySelector('::after');
      // fallback: set data attribute and use CSS var - but simpler: directly set width of inner via CSS manipulation:
      el.style.setProperty('--progress', `${perc}%`);
      // use the pseudo by changing style of ::after via stylesheet is tricky - instead animate a child element
      if (!el._inner) {
        const inner = document.createElement('div');
        inner.style.position='absolute'; inner.style.left='0'; inner.style.top='0'; inner.style.bottom='0';
        inner.style.width='0'; inner.style.borderRadius='6px';
        inner.style.background='linear-gradient(90deg,var(--green-soft),#B6E2B9)'; inner.style.transition='width .6s cubic-bezier(.2,.9,.3,1)';
        el.style.position='relative';
        el.appendChild(inner);
        el._inner = inner;
      }
      el._inner.style.width = `${perc}%`;
      el.setAttribute('aria-valuenow', perc);
    }
  }

  /* Attach prev/next actions globally using event delegation */
  document.body.addEventListener('click', (e) => {
    if (e.target.matches('.next-btn')) {
      e.preventDefault();
      handleNext();
    } else if (e.target.matches('.prev-btn')) {
      e.preventDefault();
      handlePrev();
    }
  });

  function handleNext() {
    // validation before moving depending on step
    if (currentStep === 1) {
      if (!validateStep1()) return;
      persistStep1();
      goToStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) return;
      persistStep2();
      goToStep(3);
    } else if (currentStep === 3) {
      if (!validateStep3()) return;
      persistStep3();
      goToStep(4);
    } else if (currentStep === 4) {
      // at donation step, next may not be used — donation handled via form submission
    }
  }
  function handlePrev(){ if (currentStep > 1) goToStep(currentStep - 1); }

  /* Initialize UI to step 1 */
  goToStep(1);

  /* -------------------
     STEP 1: Validation & persistence
     ------------------- */
  const formStep1 = qs('#formStep1');
  const inputsStep1 = {
    lastName: qs('#lastName'),
    firstName: qs('#firstName'),
    email: qs('#email'),
    phone: qs('#phone'),
    whatsapp: qs('#whatsapp'),
    instagram: qs('#instagram'),
    facebook: qs('#facebook')
  };

  // basic validator for step1; toggles next button visibility
  function validateStep1() {
    const values = Object.fromEntries(Object.entries(inputsStep1).map(([k,v])=>[k, v.value.trim()]));
    let ok = true;
    // required: lastName, firstName, email, phone, whatsapp
    ['lastName','firstName','email','phone','whatsapp'].forEach(k => {
      if (!values[k]) {
        ok = false;
        inputsStep1[k].closest('.field').setAttribute('aria-invalid','true');
      } else {
        inputsStep1[k].closest('.field').removeAttribute('aria-invalid');
      }
    });
    // email basic pattern
    const em = values.email;
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) { ok = false; inputsStep1.email.closest('.field').setAttribute('aria-invalid','true'); }
    // phone minimal length
    if (values.phone && values.phone.replace(/\D/g,'').length < 6) { ok = false; inputsStep1.phone.closest('.field').setAttribute('aria-invalid','true'); }

    // show/hide next button
    const btn = qs('#nextFrom1');
    if (btn) btn.disabled = !ok;
    return ok;
  }

  // attach input listeners
  Object.values(inputsStep1).forEach(inp => inp && inp.addEventListener('input', validateStep1));

  function persistStep1() {
    const state = loadState();
    state.user = {};
    Object.entries(inputsStep1).forEach(([k,el]) => state.user[k] = el.value.trim());
    saveState(state);
    // animate the pill as validated
    const pill = document.querySelector('.step-pill[data-step="1"]');
    if (pill) pill.setAttribute('aria-selected','true');
  }

  // prefill if local
  (function prefillStep1(){
    const st = loadState();
    if (st.user) {
      Object.entries(inputsStep1).forEach(([k,el]) => { if (st.user[k]) el.value = st.user[k]; });
      validateStep1();
    }
  })();

  /* -------------------
     STEP 2: Invites (3 invites)
     ------------------- */
  const invitesWrap = qs('#invitesWrap');
  const inviteTpl = qs('#inviteTpl').content;
  // render 3 invite forms
  for (let i=0;i<3;i++){
    const clone = document.importNode(inviteTpl,true);
    const block = clone.querySelector('.invite-block');
    block.dataset.index = i;
    invitesWrap.appendChild(clone);
  }

  // gather invite blocks
  function validateInviteBlock(block) {
    const inputs = Array.from(block.querySelectorAll('input'));
    let ok = true;
    inputs.forEach(inp => {
      if (inp.hasAttribute('required') && !inp.value.trim()) ok = false;
    });
    if (ok) block.classList.add('valid'); else block.classList.remove('valid');
    return ok;
  }

  // listen inputs
  invitesWrap.addEventListener('input', (e) => {
    const block = e.target.closest('.invite-block');
    if (!block) return;
    validateInviteBlock(block);
    // enable next only when all three are valid
    const all = Array.from(invitesWrap.querySelectorAll('.invite-block'));
    const allOk = all.every(validateInviteBlock);
    qs('#nextFrom2').disabled = !allOk;
  });

  function validateStep2(){ 
    const all = Array.from(invitesWrap.querySelectorAll('.invite-block'));
    return all.every(validateInviteBlock);
  }

  function persistStep2(){
    const st = loadState();
    st.invites = Array.from(invitesWrap.querySelectorAll('.invite-block')).map(block => {
      const data = {};
      Array.from(block.querySelectorAll('input')).forEach(inp => data[inp.name || inp.placeholder] = inp.value.trim());
      return data;
    });
    saveState(st);
    const pill = document.querySelector('.step-pill[data-step="2"]');
    if (pill) pill.setAttribute('aria-selected','true');
  }

  // try prefill
  (function prefillInvites(){
    const st = loadState();
    if (st.invites && st.invites.length){
      const blocks = Array.from(invitesWrap.querySelectorAll('.invite-block'));
      blocks.forEach((b,i) => {
        const inputs = Array.from(b.querySelectorAll('input'));
        inputs.forEach(inp => {
          const key = inp.name || inp.placeholder;
          if (st.invites[i] && st.invites[i][key]) inp.value = st.invites[i][key];
        });
        validateInviteBlock(b);
      });
      qs('#nextFrom2').disabled = !Array.from(invitesWrap.querySelectorAll('.invite-block')).every(validateInviteBlock);
    }
  })();

  /* -------------------
     STEP 3: Influencer voting
     ------------------- */
  const influGrid = qs('#influGrid');
  const influSearch = qs('#influSearch');
  const votesCountEl = qs('#votesCount');
  const MAX_VOTES = 3;
  let selectedInfluencers = new Set();

  function renderInfluencers(list) {
    influGrid.innerHTML = '';
    list.forEach(inf => {
      const el = document.createElement('div');
      el.className = 'influ-card';
      el.setAttribute('role','listitem');
      el.dataset.id = inf.id;
      el.innerHTML = `
        <img alt="${inf.name}" src="data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' width='360' height='220'><rect width='100%' height='100%' fill='#E9F7F0'/><text x='50%' y='50%' font-size='20' dominant-baseline='middle' text-anchor='middle' fill='#2E4631'>${inf.name}</text></svg>`) }" />
        <div class="name">${inf.name}</div>
        <div class="check-btm" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#fff"><path d="M20.3 6.7L9 18 3.7 12.7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      `;
      influGrid.appendChild(el);
    });
  }

  // initial render
  renderInfluencers(influencers);

  // search filter
  influSearch.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = influencers.filter(i => i.name.toLowerCase().includes(q));
    renderInfluencers(filtered);
    // reapply selections visually
    selectedInfluencers.forEach(id => {
      const card = influGrid.querySelector(`.influ-card[data-id="${id}"]`);
      if (card) card.classList.add('selected');
    });
  });

  // click to select influencers
  influGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.influ-card');
    if (!card) return;
    const id = card.dataset.id;
    if (selectedInfluencers.has(id)) {
      selectedInfluencers.delete(id);
      card.classList.remove('selected');
    } else {
      if (selectedInfluencers.size >= MAX_VOTES) {
        // toast warning
        const lang = document.body.classList.contains('en') ? 'en' : 'fr';
        showToast(lang === 'en' ? 'You can only choose 3 influencers.' : 'Vous ne pouvez sélectionner que 3 influenceurs.');
        return;
      }
      selectedInfluencers.add(id);
      card.classList.add('selected');
    }
    updateVotesUI();
  });

  function updateVotesUI(){
    votesCountEl.textContent = (document.body.classList.contains('en') ? 'Selected votes: ' : 'Votes sélectionnés : ') + selectedInfluencers.size;
    qs('#nextFrom3').disabled = selectedInfluencers.size !== 3;
  }

  function validateStep3(){ return selectedInfluencers.size === 3; }

  function persistStep3(){
    const st = loadState();
    st.votes = Array.from(selectedInfluencers);
    saveState(st);
    const pill = document.querySelector('.step-pill[data-step="3"]');
    if (pill) pill.setAttribute('aria-selected','true');
  }

  // prefill votes if any
  (function prefillVotes(){
    const st = loadState();
    if (st.votes && Array.isArray(st.votes)){
      selectedInfluencers = new Set(st.votes);
      // visually re-select any present in current rendered set
      Array.from(influGrid.querySelectorAll('.influ-card')).forEach(card => {
        if (selectedInfluencers.has(card.dataset.id)) card.classList.add('selected');
      });
      updateVotesUI();
    }
  })();

  /* -------------------
     STEP 4: Payments & donation
     ------------------- */
  const payButtons = qsa('.pay-logo');
  const paymentForm = qs('#paymentForm');
  const donateBtn = qs('#donateBtn');

  payButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      payButtons.forEach(b => b.setAttribute('aria-pressed','false'));
      btn.setAttribute('aria-pressed','true');
      // show the payment form
      paymentForm.hidden = false;
      // focus first input
      paymentForm.querySelector('input')?.focus();
    });
  });

  // donation submission handler
  paymentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // basic validation
    const name = qs('#benefName').value.trim();
    const iban = qs('#iban').value.trim();
    const amount = parseFloat(qs('#amount').value);
    if (!name || !iban || !(amount > 0)) {
      showToast(document.body.classList.contains('en') ? 'Please fill donation details correctly.' : 'Merci de remplir correctement les informations de paiement.');
      return;
    }
    // simulate saving transaction and ask for receipt sending
    const st = loadState();
    st.donation = {name, iban, amount, ref: qs('#ref').value.trim(), method: qsa('.pay-logo[aria-pressed="true"]')[0]?.dataset.method || ''};
    saveState(st);

    const lang = document.body.classList.contains('en') ? 'en' : 'fr';
    showToast(lang === 'en' ? 'Please send your receipt by email to contact@delontenatena.org' : 'Veuillez envoyer votre reçu par mail à contact@delontenatena.org', 3800);

    // mark step 4 pill validated and show thank you
    const pill = document.querySelector('.step-pill[data-step="4"]');
    if (pill) pill.setAttribute('aria-selected','true');

    // small delay then show the thank you overlay
    setTimeout(()=> {
      thankOverlay.hidden = false;
      thankOverlay.querySelector('h3').focus();
      // animated logo effect: simple scale
      const logo = thankOverlay.querySelector('.logo-anim');
      logo.animate([{transform:'translateY(-8px) scale(.9)', opacity:0.8},{transform:'translateY(0) scale(1)', opacity:1}], {duration:700, easing:'cubic-bezier(.2,.9,.3,1)'});
    }, 600);
  });

  // finish button: close overlay and reset (optionally clear storage)
  finishBtn.addEventListener('click', () => {
    thankOverlay.hidden = true;
    showToast(document.body.classList.contains('en') ? 'Thank you — your support matters.' : 'Merci — votre soutien compte.', 2400);
    // Optionally clear the stored progression but keep language
    const lang = localStorage.getItem('dtt_lang');
    localStorage.removeItem(STORE_KEY);
    if (lang) localStorage.setItem('dtt_lang', lang);
    // reset UI
    selectedInfluencers.clear();
    renderInfluencers(influencers);
    goToStep(1);
  });

  /* -------------------
     Validate before allowing Next button to show on each step (early UI)
     ------------------- */
  // When pages load, ensure Next/Prev buttons show/hide appropriately
  document.addEventListener('click', (e) => {
    // handle enabling/disabling prev per step
    qsa('.prev-btn').forEach(b => {
      b.disabled = currentStep === 1;
    });
  });

  /* -------------------
     Bind specific next button states on load
     ------------------- */
  // Attempt to enable next buttons based on existing data
  setTimeout(() => {
    validateStep1();
    // if invites prefilled
    qs('#nextFrom2').disabled = !validateStep2();
    qs('#nextFrom3').disabled = !validateStep3();
  }, 80);

  /* -------------------
     Persist on unload (autosave)
     ------------------- */
  window.addEventListener('beforeunload', () => {
    // persist minimal current inputs
    try {
      const state = loadState();
      state._lastStep = currentStep;
      // gather dynamic fields
      state.user = {};
      Object.entries(inputsStep1).forEach(([k,v]) => state.user[k] = v.value.trim());
      // invites
      state.invites = Array.from(invitesWrap.querySelectorAll('.invite-block')).map(b => {
        const obj = {};
        Array.from(b.querySelectorAll('input')).forEach(inp => obj[inp.name || inp.placeholder] = inp.value.trim());
        return obj;
      });
      state.votes = Array.from(selectedInfluencers);
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch (e) {}
  });

  /* -------------------
     Public small API: allow other header scripts to jump to campaign
     ------------------- */
  window.dttCampaign = {
    goToStep: (n) => { goToStep(n); },
    getState: () => loadState()
  };

  /* -------------------
     Accessibility / small polish
     ------------------- */
  // Close toast on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!thankOverlay.hidden) { thankOverlay.hidden = true; }
      if (!toastEl.hidden) { toastEl.classList.remove('show'); setTimeout(()=> toastEl.hidden=true,220); }
    }
  });

  /* END of IIFE */
})();