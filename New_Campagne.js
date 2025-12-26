
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


   // --- CONFIGURATION DE LA DURÉE ---
        // Définition simple de la durée de campagne (6 mois)
        const DUREE_MOIS = 6; 
        
        // Calcul de la date de fin
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(now.getMonth() + DUREE_MOIS);
        
        // --- THREE.JS SETUP ---
        const container = document.getElementById('scoreboard-container');
        
        // Scène
        const scene = new THREE.Scene();
        // Pas de couleur de fond pour la transparence (blending avec le CSS body)
        
        // Caméra
        const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        
        // Fonction pour ajuster la position Z de la caméra en fonction de la largeur (responsive)
        function updateCameraZ(width) {
            if (width <= 480) {
                // Pour très petits écrans, reculer un peu plus
                camera.position.z = 25;
            } else if (width <= 768) {
                // Pour tablettes/petits PC
                camera.position.z = 22;
            } else {
                // Desktop
                camera.position.z = 18;
            }
            camera.position.y = 0;
            camera.updateProjectionMatrix();
        }

        // Initialisation de la position Z de la caméra
        updateCameraZ(container.clientWidth);


        // Renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        container.innerHTML = ''; // Clear loading text
        container.appendChild(renderer.domElement);

        // --- ÉCLAIRAGE (Atmosphère Premium) ---
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8); 
        scene.add(ambientLight);

        const spotLight = new THREE.SpotLight(0xffffff, 1.2);
        spotLight.position.set(10, 20, 20);
        spotLight.angle = 0.3;
        spotLight.penumbra = 0.5;
        spotLight.castShadow = true;
        scene.add(spotLight);

        // Lumière d'accentuation interne pour simuler un contre-jour
        const backLight = new THREE.PointLight(0x3EB489, 0.5, 50); 
        backLight.position.set(0, 5, -5);
        scene.add(backLight);

        // --- CRÉATION DU SCOREBOARD (Structure 3D) ---
        
        // Dimensions du board, rendues variables pour l'ajustement
        let boardWidth = 26;
        let boardHeight = 8;
        
        // 1. Le cadre principal (Board Architecture)
        const boardGeometry = new THREE.BoxGeometry(boardWidth, boardHeight, 1);
        const boardMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x2E6B4F, // --deep-green
            roughness: 0.3,
            metalness: 0.1,
            clearcoat: 0.2
        });
        const board = new THREE.Mesh(boardGeometry, boardMaterial);
        board.castShadow = true;
        board.receiveShadow = true;
        
        // 2. L'écran (Canvas dynamique)
        const canvas = document.createElement('canvas');
        canvas.width = 2048; // Haute résolution
        canvas.height = 600;
        const ctx = canvas.getContext('2d');

        const screenTexture = new THREE.CanvasTexture(canvas);
        screenTexture.minFilter = THREE.LinearFilter;
        screenTexture.magFilter = THREE.LinearFilter;
        
        // Dimensions de l'écran basées sur le board
        let screenWidth = boardWidth - 2; // 24
        let screenHeight = boardHeight - 1.5; // 6.5

        const screenGeometry = new THREE.PlaneGeometry(screenWidth, screenHeight);
        
        // Couleur d'émission subtile (vert très clair)
        const lightGreenColor = new THREE.Color(0x9FE8C4); 

        const screenMaterial = new THREE.MeshStandardMaterial({
            map: screenTexture,
            emissive: lightGreenColor, // Couleur d'émission (Vert-Blanc)
            emissiveMap: screenTexture,
            emissiveIntensity: 0.4, // Intensité réduite 
            roughness: 0.2,
            metalness: 0.1
        });
        
        const screenMesh = new THREE.Mesh(screenGeometry, screenMaterial);
        screenMesh.position.z = 0.51; // Juste devant le board
        board.add(screenMesh);
        
        scene.add(board);

        // --- LOGIQUE DE DESSIN DU CANVAS (UI du Scoreboard) ---
        
        function drawScoreboard(d, h, m, s, t) {
            // Fond de l'écran - Gradient subtil vert profond
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#2E6B4F'); // Deep green
            gradient.addColorStop(1, '#1e4d38'); // Slightly darker
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Effet grille LED (plus subtil et clair)
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            for(let i=0; i<canvas.width; i+=12) {
                ctx.fillRect(i, 0, 2, canvas.height);
            }
            
            // Configuration Texte
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            
            // Positions X pour les 5 unités
            const positions = [
                { x: 300, label: 'JOURS', val: d },
                { x: 700, label: 'HEURES', val: h },
                { x: 1100, label: 'MINUTES', val: m },
                { x: 1500, label: 'SECONDES', val: s },
                { x: 1850, label: 'TIERCES', val: t } 
            ];

            positions.forEach((pos, index) => {
                // Boite de fond pour chaque chiffre (Style Card plus lumineuse)
                const boxW = index === 4 ? 200 : 300; 
                const boxH = 350;
                const boxX = pos.x - boxW/2;
                const boxY = 100;

                // Fond des cases beaucoup plus clair et transparent pour l'effet "verre éclairé"
                ctx.fillStyle = 'rgba(62, 180, 137, 0.15)'; // --green-soft très transparent
                ctx.fillRect(boxX, boxY, boxW, boxH);
                
                // Bordure plus vive
                ctx.strokeStyle = '#5A9E78'; // --green-deep
                ctx.lineWidth = 6;
                ctx.strokeRect(boxX, boxY, boxW, boxH);

                // Valeur (Digits) - Blanc pur avec glow modéré
                ctx.font = index === 4 ? 'bold 180px "Chakra Petch"' : 'bold 220px "Chakra Petch"';
                ctx.fillStyle = '#FFFFFF'; 
                
                if (index === 4) ctx.fillStyle = '#E6D8B9'; // Tierces en beige doré
                
                let valStr = pos.val.toString().padStart(2, '0');
                if (index === 0 && pos.val > 99) valStr = pos.val.toString();

                // Effet Glow Texte (Modéré)
                ctx.shadowColor = "rgba(62, 180, 137, 0.4)"; 
                ctx.shadowBlur = 20; 
                ctx.fillText(valStr, pos.x, boxY + boxH/2 + 20);
                ctx.shadowBlur = 0; // Reset

                // Label (Plus contrasté)
                ctx.font = '700 45px "Manrope"';
                ctx.fillStyle = '#3EB489'; // --green-soft vif
                ctx.fillText(pos.label, pos.x, 530);
            });
            
            // Trigger texture update
            screenTexture.needsUpdate = true;
        }

        // --- BOUCLE D'ANIMATION ET TEMPS ---

        function updateTime() {
            const current = new Date();
            const distance = endDate - current;

            if (distance < 0) {
                drawScoreboard(0, 0, 0, 0, 0);
                return;
            }

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            const tierces = Math.floor((distance % 1000) / 10); 

            drawScoreboard(days, hours, minutes, seconds, tierces);
        }

        // Interaction Souris (Parallax subtil)
        let mouseX = 0;
        let mouseY = 0;
        let targetRotationX = 0;
        let targetRotationY = 0;

        document.addEventListener('mousemove', (event) => {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        function animate() {
            requestAnimationFrame(animate);

            updateTime();

            // Animation douce du board
            targetRotationY = mouseX * 0.1;
            targetRotationX = mouseY * 0.1;

            board.rotation.y += (targetRotationY - board.rotation.y) * 0.05;
            board.rotation.x += (targetRotationX - board.rotation.x) * 0.05;
            
            // Respiration subtile
            const time = Date.now() * 0.001;
            board.position.y = Math.sin(time) * 0.2;

            renderer.render(scene, camera);
        }

        // Gestion du redimensionnement
        window.addEventListener('resize', () => {
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            renderer.setSize(width, height);
            camera.aspect = width / height;
            
            // Mise à jour de la caméra responsive
            updateCameraZ(width); 
        });

        // Lancement
        animate();



/* ===== Participants campagne =====
*/
(function(){
  const API_BASE = 'http://localhost:3000';
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

   