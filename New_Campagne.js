
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

 
/* ==== TIMER CAMPAGNE – 6 MOIS ==== */
(function(){

  const startDate = new Date(); // lancement au chargement
  const endDate   = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 6);

  const els = {
    months: document.querySelector('[data-unit="months"]'),
    days: document.querySelector('[data-unit="days"]'),
    hours: document.querySelector('[data-unit="hours"]'),
    minutes: document.querySelector('[data-unit="minutes"]'),
    seconds: document.querySelector('[data-unit="seconds"]'),
    milliseconds: document.querySelector('[data-unit="milliseconds"]')
  };

  function updateTimer(){
    const now = new Date();
    let diff = endDate - now;

    if(diff <= 0){
      Object.values(els).forEach(el => el.textContent = "0");
      return;
    }

    const ms = diff % 1000;
    diff = Math.floor(diff / 1000);

    const s = diff % 60;
    diff = Math.floor(diff / 60);

    const m = diff % 60;
    diff = Math.floor(diff / 60);

    const h = diff % 24;
    diff = Math.floor(diff / 24);

    const totalDays = diff;
    const months = Math.floor(totalDays / 30);
    const days = totalDays % 30;

    els.months.textContent = months;
    els.days.textContent = days;
    els.hours.textContent = String(h).padStart(2,'0');
    els.minutes.textContent = String(m).padStart(2,'0');
    els.seconds.textContent = String(s).padStart(2,'0');
    els.milliseconds.textContent = String(ms).padStart(3,'0');
  }

  setInterval(updateTimer, 50);
  updateTimer();

})();


/* ===== Participants campagne =====
*/
(function(){
  const API_BASE = CONFIG.API_BASE_URL;

  const DURATION_MS = 1000; // ~1 seconde

  /* ---------- Counter animation (smooth, requestAnimationFrame) ---------- */
  const counterEl = document.getElementById('counter');

  // animate number from 0 to TARGET_COUNT over DURATION_MS
  function animateCounter(target, duration) {
    const start = performance.now();
    const initial = 0;
    const diff = target - initial;

    // easeOutCubic for a pleasing effect
    function easeOutCubic(t){ return 1 - Math.pow(1 - t, 3); }

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const value = Math.round(initial + diff * eased);
      counterEl.textContent = value.toLocaleString('fr-FR'); // localized formatting
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // ensure final exact value
        counterEl.textContent = target.toLocaleString('fr-FR');
      }
    }
    requestAnimationFrame(step);
  }

  function getInitials(first, last) {
  return `${first?.[0] || ''}${last?.[0] || ''}`.toUpperCase();
}
function createParticipantItem(p) {
  const fullName = `${p.first_name} ${p.last_name}`;

  const item = document.createElement('div');
  item.className = 'participant-item';
  item.setAttribute('data-name', fullName);

  item.innerHTML = `
    <div class="participant-avatar">${getInitials(p.first_name, p.last_name)}</div>
    <div class="participant-meta">
      <div class="participant-name">${fullName}</div>
      <div class="participant-sub">
        Participant
      </div>
    </div>
  `;
//  ${p.social_network || 'Participant'}
  return item;
}

async function loadParticipants() {
  try {
    const res = await fetch(`${API_BASE}/api/stepper/participants`);
    const participants = await res.json();

    listContainer.innerHTML = '';

    participants.forEach(p => {
      listContainer.appendChild(createParticipantItem(p));
    });

    // 🔤 Re-tri alphabétique (ta logique existante)
    ParticipantsUI.sortAlphabetically();

    // 🔢 Mise à jour compteur
    ParticipantsUI.animateCounterTo(participants.length);

  } catch (err) {
    console.error('❌ Chargement participants échoué', err);
  }
}

window.addEventListener('load', () => {
  loadParticipants();
});


  /* ---------- Popup open/close logic ---------- */
  const openBtn = document.getElementById('openListBtn');
  const overlay = document.getElementById('overlay');
  const closeBtn = document.getElementById('closeModal');
  const searchInput = document.getElementById('searchInput');
  const listContainer = document.getElementById('listContainer');
  const emptyNote = document.getElementById('emptyNote');

  // Accessibility: remember previously focused element
  let lastFocused = null;

  function openModal(){
    lastFocused = document.activeElement;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    // Ensure modal content visible; focus search input
    setTimeout(()=> searchInput.focus(), 120);
    // prevent background scroll (but keep header visible on top due to overlay fixed)
    document.documentElement.style.overflow = 'hidden';
  }

  function closeModal(){
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    document.documentElement.style.overflow = '';
    // restore focus
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    // reset search
    searchInput.value = '';
    filterList('');
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  // Close when clicking backdrop (but not when clicking inside modal)
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('show')) closeModal();
  });

  /* ---------- Utility: gather participant items, sort alphabetically by data-name ---------- */
  function getParticipantItems(){
    return Array.from(listContainer.querySelectorAll('.participant-item'));
  }

  function sortParticipantsAlpha(){
    const items = getParticipantItems();
    // sort by data-name (case-insensitive, diacritics considered by localeCompare)
    items.sort((a,b) => {
      const na = (a.getAttribute('data-name') || '').trim();
      const nb = (b.getAttribute('data-name') || '').trim();
      return na.localeCompare(nb, 'fr', {sensitivity:'base'});
    });
    // re-append in sorted order
    items.forEach(it => listContainer.appendChild(it));
  }

  // Initial sort on script load
  sortParticipantsAlpha();

  /* ---------- Search / Filter logic (instant, case-insensitive) ---------- */
  function filterList(query){
    const q = (query || '').trim().toLowerCase();
    const items = getParticipantItems();
    let visibleCount = 0;
    if (q === ''){
      // show all
      items.forEach(it => {
        it.style.display = '';
        visibleCount++;
      });
    } else {
      items.forEach(it => {
        const name = (it.getAttribute('data-name') || '').toLowerCase();
        if (name.indexOf(q) !== -1){
          it.style.display = '';
          visibleCount++;
        } else {
          it.style.display = 'none';
        }
      });
    }
    // Show empty note when none visible
    emptyNote.style.display = visibleCount === 0 ? 'block' : 'none';
  }

  // Input event with immediate filtering; debounce not necessary (instant request)
  searchInput.addEventListener('input', (e) => {
    const q = e.target.value;
    filterList(q);
  });

  window.ParticipantsUI = {
    sortAlphabetically: sortParticipantsAlpha,
    filter: filterList,
    open: openModal,
    close: closeModal,
    animateCounterTo: (newTarget, duration = DURATION_MS) => {
      // allow dynamic change of total
      animateCounter(newTarget, duration);
    }
  };

  (function ensureAvatars(){
    getParticipantItems().forEach(it => {
      const avatar = it.querySelector('.participant-avatar');
      const name = (it.getAttribute('data-name') || '').trim();
      if (avatar && name){
        const initials = name.split(/\s+/).map(s => s.charAt(0)).slice(0,2).join('').toUpperCase();
        if (!avatar.textContent.trim()) avatar.textContent = initials;
      }
    });
  })();

})();

   