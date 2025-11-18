// script.js
// Logic for sticky header, donate dropdown, mobile menu, and hero carousel
// Accessible interactions: keyboard, focus, aria attributes

(() => {
  /* ---------- Header behavior (sticky) ---------- */
  const header = document.getElementById('siteHeader');
  const SCROLL_THRESHOLD = 80; // px

  function onScroll() {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    header.classList.toggle('scrolled', scrolled);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Donate dropdown (hover + focus + click outside) ---------- */
  const donateBtn = document.getElementById('donateBtn');
  const donateDropdown = document.getElementById('donateDropdown');
  const donateWrapper = document.getElementById('donateWrapper');

  function openDonate() {
    donateDropdown.style.opacity = '1';
    donateDropdown.style.pointerEvents = 'auto';
    donateDropdown.style.transform = 'translateY(0) scale(1)';
    donateBtn.setAttribute('aria-expanded', 'true');
    donateDropdown.setAttribute('aria-hidden', 'false');
  }
  function closeDonate() {
    donateDropdown.style.opacity = '';
    donateDropdown.style.pointerEvents = '';
    donateDropdown.style.transform = '';
    donateBtn.setAttribute('aria-expanded', 'false');
    donateDropdown.setAttribute('aria-hidden', 'true');
  }

  // Hover (desktop)
  donateWrapper.addEventListener('mouseenter', () => {
    if (window.matchMedia('(hover: hover)').matches) openDonate();
  });
  donateWrapper.addEventListener('mouseleave', () => {
    if (window.matchMedia('(hover: hover)').matches) closeDonate();
  });

  // Toggle on click / keyboard
  donateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const expanded = donateBtn.getAttribute('aria-expanded') === 'true';
    if (expanded) closeDonate(); else openDonate();
  });
  donateBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDonate();
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!donateWrapper.contains(e.target)) closeDonate();
  });

  /* ---------- Language buttons (simple aria-pressed toggle) ---------- */
 
  // 🌍 Fonction de changement de langue dynamique
  const setLanguage = (lang) => {
    // Sélection de tous les éléments ayant les attributs data-fr et data-en
    const translatableElements = document.querySelectorAll('[data-fr][data-en]');

    translatableElements.forEach((el) => {
      // Mise à jour du texte selon la langue choisie
      if (lang === 'fr') {
        el.textContent = el.getAttribute('data-fr');
      } else if (lang === 'en') {
        el.textContent = el.getAttribute('data-en');
      }
    });

    // Mise à jour de l'état visuel des boutons de langue
    const langButtons = document.querySelectorAll('.lang-btn');
    langButtons.forEach((btn) => {
      const isActive = btn.getAttribute('data-lang') === lang;
      btn.setAttribute('aria-pressed', isActive);
    });

    // Enregistrement de la langue dans localStorage
    localStorage.setItem('selectedLang', lang);
  };

  // ⚡ Gestion des clics sur les boutons de langue
  const langButtons = document.querySelectorAll('.lang-btn');
  langButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const selectedLang = btn.getAttribute('data-lang');
      setLanguage(selectedLang);
    });
  });

  // 🧩 Chargement initial : récupération de la langue sauvegardée ou défaut à FR
  const savedLang = localStorage.getItem('selectedLang') || 'fr';
  setLanguage(savedLang);


  /* ---------- Mobile menu (hamburger) ---------- */
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobileNav');

  function openMobile() {
    hamburger.setAttribute('aria-expanded', 'true');
    mobileNav.setAttribute('aria-hidden', 'false');
    mobileNav.style.display = 'block';
  }
  function closeMobile() {
    hamburger.setAttribute('aria-expanded', 'false');
    mobileNav.setAttribute('aria-hidden', 'true');
    mobileNav.style.display = 'none';
  }

  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    if (expanded) closeMobile(); else openMobile();
  });

  // Mobile accordion for donate in mobile nav
  document.querySelectorAll('.mobile-accordion').forEach(btn => {
    const panel = btn.nextElementSibling;
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      if (!expanded) {
        panel.hidden = false;
      } else {
        panel.hidden = true;
      }
    });
  });

  /* ---------- Hero Carousel ---------- */
  const hero = document.getElementById('hero');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const dotsContainer = document.getElementById('heroDots');
  const playPauseBtn = document.getElementById('heroPlayPause');

  let currentSlide = 0;
  const totalSlides = slides.length;
  let intervalId = null;
  const AUTO_MS = 6000;
  let isPlaying = true;

  // Create dots
  slides.forEach((s, i) => {
    const btn = document.createElement('button');
    btn.setAttribute('aria-label', `Aller à la diapositive ${i+1}`);
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.dataset.index = String(i);
    btn.addEventListener('click', () => goToSlide(i, true));
    dotsContainer.appendChild(btn);
  });

  function updateDots() {
    dotsContainer.querySelectorAll('button').forEach((b, idx) => {
      b.setAttribute('aria-selected', idx === currentSlide ? 'true' : 'false');
    });
  }

  function goToSlide(index, userTriggered = false) {
    index = ((index % totalSlides) + totalSlides) % totalSlides;
    if (index === currentSlide && !userTriggered) return;
    slides[currentSlide].classList.remove('active');
    slides[index].classList.add('active');
    currentSlide = index;
    updateDots();
  }

  function startAutoSlide() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    stopAutoSlide();
    isPlaying = true;
    playPauseBtn.setAttribute('aria-pressed', 'false'); // pressed false -> playing (label shows pause)
    playPauseBtn.textContent = '⏸';
    intervalId = setInterval(() => goToSlide(currentSlide + 1), AUTO_MS);
  }
  function stopAutoSlide() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
    isPlaying = false;
    playPauseBtn.setAttribute('aria-pressed', 'true'); // pressed true -> paused
    playPauseBtn.textContent = '▶';
  }

  // Play/Pause button toggles
  playPauseBtn.addEventListener('click', () => {
    if (isPlaying) stopAutoSlide(); else startAutoSlide();
  });

  // Dots are clickable (done above). Keyboard navigation between slides:
  dotsContainer.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') goToSlide(currentSlide - 1, true);
    if (e.key === 'ArrowRight') goToSlide(currentSlide + 1, true);
  });

  // Auto-pause when hero is out of viewport
  const heroObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) {
        stopAutoSlide();
      } else {
        // resume only if user didn't explicitly pause
        if (!playPauseBtn.getAttribute('data-user-paused')) startAutoSlide();
      }
    });
  }, { threshold: 0.45 });
  heroObserver.observe(hero);

  // Mark user intent to pause/resume
  playPauseBtn.addEventListener('click', () => {
    // toggle user paused flag
    const userPaused = playPauseBtn.getAttribute('data-user-paused') === 'true';
    if (userPaused) {
      playPauseBtn.removeAttribute('data-user-paused');
    } else {
      playPauseBtn.setAttribute('data-user-paused', 'true');
    }
  });

  // Touch swipe support for mobile
  (function enableSwipe() {
    let startX = 0;
    let startY = 0;
    let threshold = 30; // px

    hero.addEventListener('touchstart', (e) => {
      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;
    }, { passive: true });

    hero.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        if (dx < 0) goToSlide(currentSlide + 1, true);
        else goToSlide(currentSlide - 1, true);
        // user interaction pauses autoplay temporarily
        stopAutoSlide();
        setTimeout(() => { if (!playPauseBtn.getAttribute('data-user-paused')) startAutoSlide(); }, 5000);
      }
    }, { passive: true });
  })();

  // Initialize slide show
  updateDots();
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) startAutoSlide();

  /* ---------- Close dropdowns & menus on Escape ---------- */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDonate();
      closeMobile();
    }
  });

  /* ---------- Close mobile menu when viewport resizes to desktop ---------- */
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      closeMobile();
    }
  });

  /* ---------- Prevent header covering content when focused via fragment links ---------- */
  // If the user navigates to an anchor inside hero/content, scroll a bit to account for fixed header.
  document.addEventListener('click', (e) => {
    if (e.target && e.target.matches('a[href^="#"]')) {
      setTimeout(() => { window.scrollBy(0, -80); }, 10);
    }
  });

})();


    (function(){
      'use strict';

      const $ = (s, ctx=document) => ctx.querySelector(s);
      const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

      const cards = $$('.join-card');
      const drawer = $('#joinDrawer');
      const drawerContent = $('#drawerContent');
      const drawerCloseBtn = $('#drawerCloseBtn');

      // Detect touch devices to replace hover by tap
      const isTouch = window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches;

      // IntersectionObserver for entry + stagger
      const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if(entry.isIntersecting){
            const el = entry.target;
            const idx = Number(el.getAttribute('data-index') || 0);
            const step = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--stagger-step')) || 80;
            const delay = idx * step;
            el.style.setProperty('--delay', `${delay}ms`);
            el.classList.add('in-view');
            obs.unobserve(el);
          }
        });
      }, { root:null, rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

      cards.forEach(c => io.observe(c));

      // Focus trap helper
      function createFocusTrap(container){
        const selector = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
        return {
          handleKey(e){
            if(e.key !== 'Tab') return;
            const nodes = Array.from(container.querySelectorAll(selector));
            if(nodes.length === 0) return;
            const first = nodes[0], last = nodes[nodes.length-1];
            if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
            else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
          }
        };
      }

      // Open / close micro-popup
      function openPopup(card){
        const popup = card.querySelector('.join-popup');
        if(!popup) return;
        popup.setAttribute('data-open','true');
        popup.setAttribute('aria-hidden','false');
        card.setAttribute('aria-expanded','true');
        card.classList.add('popup-open');
      }
      function closePopup(card){
        const popup = card.querySelector('.join-popup');
        if(!popup) return;
        popup.setAttribute('data-open','false');
        popup.setAttribute('aria-hidden','true');
        card.setAttribute('aria-expanded','false');
        card.classList.remove('popup-open');
      }

      // Attach per-card events
      cards.forEach(card => {
        // ensure focusable
        if(!card.hasAttribute('tabindex')) card.setAttribute('tabindex','0');
        // hover for non-touch
        card.addEventListener('mouseenter', (e) => { if(!isTouch) openPopup(card); });
        card.addEventListener('mouseleave', (e) => { if(!isTouch) closePopup(card); });

        // keyboard accessibility
        card.addEventListener('focusin', () => openPopup(card));
        card.addEventListener('focusout', () => {
          setTimeout(()=> { if(!card.contains(document.activeElement)) closePopup(card); }, 10);
        });

        // click: on mobile, open drawer; on desktop allow navigation
        card.addEventListener('click', (e) => {
          if(e.metaKey || e.ctrlKey || e.button === 1) return; // let user open in new tab
          if(isTouch){
            e.preventDefault();
            openDrawerForCard(card);
            return;
          }
        });
      });

      // Click outside closes popups
      document.addEventListener('click', (e) => {
        cards.forEach(c => { if(c.classList.contains('popup-open') && !c.contains(e.target)) closePopup(c); });
      }, true);

      // ESC closes popups/drawer
      document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape' || e.key === 'Esc'){
          cards.forEach(c => { if(c.classList.contains('popup-open')) closePopup(c); });
          if(drawer.classList.contains('open')) closeDrawer();
        }
      });

      /* ===== Drawer (mobile) ===== */
      function openDrawerForCard(card){
        const title = card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : '';
        const desc = card.querySelector('p') ? card.querySelector('p').textContent.trim() : '';
        const href = card.getAttribute('href') || '#';

        drawerContent.innerHTML = `
          <div style="display:flex;gap:12px;align-items:center;">
            <div style="flex:1">
              <h3 style="margin:0 0 8px">${escapeHtml(title)}</h3>
              <p style="margin:0 0 12px;color:#58606e">${escapeHtml(desc)}</p>
            </div>
          </div>
          <div style="display:flex;gap:10px;margin-top:12px;">
            <a class="join-cta" href="${escapeAttr(href)}">Voir la page</a>
            <button id="drawerMore" class="join-cta" style="background:#f1f1f1;color:#081016">En savoir plus</button>
          </div>
        `;

        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden','false');

        const trap = createFocusTrap(drawer);
        function onKey(e){ trap.handleKey(e); }
        drawer.addEventListener('keydown', onKey);

        // close on outside click
        setTimeout(()=> window.addEventListener('click', outsideClick), 10);

        const first = drawer.querySelector('a, button, [tabindex]:not([tabindex="-1"])');
        if(first) first.focus();

        drawerCloseBtn.onclick = (ev) => { ev.preventDefault(); closeDrawer(); };

        function outsideClick(e){
          if(!drawer.contains(e.target)) closeDrawer();
        }

        function closeDrawer(){
          drawer.classList.remove('open');
          drawer.setAttribute('aria-hidden','true');
          drawer.removeEventListener('keydown', onKey);
          window.removeEventListener('click', outsideClick);
          // restore focus to card
          card.focus();
        }
      }

      function closeDrawer(){
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden','true');
      }

      /* Accessibility initial setup */
      cards.forEach(c => {
        const popupId = c.getAttribute('aria-controls');
        if(popupId){
          const popup = document.getElementById(popupId);
          if(popup){
            popup.setAttribute('role','dialog');
            popup.setAttribute('aria-hidden','true');
          }
        }
        if(!c.hasAttribute('aria-expanded')) c.setAttribute('aria-expanded','false');
      });

      /* Utilities */
      function escapeHtml(s){ return String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[ch]); }
      function escapeAttr(s){ return escapeHtml(s).replace(/"/g,'&quot;'); }

    })();

    
  // ==========================
  // Actualités
  // ==========================
  (function(){
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(prefersReduced){
      // If user prefers reduced motion, simply show all
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
      return;
    }

    const items = Array.from(document.querySelectorAll('.reveal'));
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const el = entry.target;
          const index = items.indexOf(el) || 0;
          // stagger delay: index * 80ms
          const delay = Math.min(index * 80, 400);
          setTimeout(() => el.classList.add('revealed'), delay);
          obs.unobserve(el);
        }
      });
    },{threshold:0.12});

    items.forEach(it => observer.observe(it));
  })();

  // Accessibility: allow Enter key on article to open first link
  document.querySelectorAll('.news-card').forEach(card =>{
    card.addEventListener('keydown', e =>{
      if(e.key === 'Enter' || e.key === ' '){
        const firstLink = card.querySelector('.news-cta');
        if(firstLink){ firstLink.focus(); }
      }
    });
  });

  //newsletter
  
    function isValidEmail(email){
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  return re.test(String(email).trim());
}

    (function(){
      const toastEl=document.getElementById('toast');
      let toastTimer=null;
      window.showToast=function(message='',type='info'){
        if(!toastEl)return;
        toastEl.className='toast';
        toastEl.innerHTML='';
        const icon=document.createElement('div');icon.className='icon';icon.setAttribute('aria-hidden','true');
        const content=document.createElement('div');content.className='content';content.textContent=message;
        if(type==='success'){toastEl.classList.add('success');icon.textContent='✓';}
        else if(type==='error'){toastEl.classList.add('error');icon.textContent='⚠';}
        else{toastEl.classList.add('info');icon.textContent='ℹ';}
        toastEl.append(icon,content);
        toastEl.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer=setTimeout(()=>toastEl.classList.remove('show'),3000);
      };
    })();

    (function(){
      const form=document.getElementById('newsletterForm');
      if(!form)return;
      const fname=form.querySelector('#prenom');
      const lname=form.querySelector('#nom');
      const email=form.querySelector('#email');
      const pays=form.querySelector('#pays');
      const inputs=[fname,lname,email,pays];

      function markInvalid(el){if(!el)return;el.classList.remove('success');el.classList.add('invalid');setTimeout(()=>el.classList.remove('invalid'),900);}
      function markSuccess(el){if(!el)return;el.classList.remove('invalid');el.classList.add('success');setTimeout(()=>el.classList.remove('success'),1200);}

      form.addEventListener('submit',function(e){
        e.preventDefault();
        const vF=fname.value.trim();
        const vL=lname.value.trim();
        const vE=email.value.trim();
        const vP=pays.value.trim();
        if(!vF||!vL||!vE||!vP){
          inputs.forEach(inp=>{if(!inp.value.trim())markInvalid(inp);});
          showToast("Veuillez remplir tous les champs avant de continuer.","error");
          return;
        }
        if(!isValidEmail(vE)){
          markInvalid(email);
          showToast("Adresse email invalide.","error");
          return;
        }
        inputs.forEach(inp=>markSuccess(inp));
        showToast("Merci ! Vous êtes maintenant abonné à la newsletter.","success");
        setTimeout(()=>inputs.forEach(i=>i.value=''),700);
      });
    })();

    (function(){
      const reveals=document.querySelectorAll('.reveal');
      if(!('IntersectionObserver'in window)||!reveals.length){reveals.forEach(el=>el.classList.add('in-view'));return;}
      const io=new IntersectionObserver((entries,obs)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');obs.unobserve(entry.target);}});},{threshold:0.12});
      reveals.forEach(el=>io.observe(el));
    })();

    (function(){
      const toast=document.getElementById('toast');
      const originalShow=window.showToast;
      if(!toast||typeof originalShow!=='function')return;
      window.showToast=function(message,type){
        originalShow(message,type);
        if(type==='error'){
          const prev=document.activeElement;
          toast.setAttribute('tabindex','-1');toast.focus({preventScroll:true});
          setTimeout(()=>{if(prev&&typeof prev.focus==='function')prev.focus();toast.removeAttribute('tabindex');},700);
        }
      };
    })();