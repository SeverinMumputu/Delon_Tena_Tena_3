emailjs.init("YOUR_PUBLIC_KEY");

const API = "http://localhost:3000";

//MENU HAMBURGER
document.getElementById("menuBtn").onclick = () => {
  document.getElementById("adminNav").classList.toggle("show");
};

// ===============================
// 🔍 RECHERCHE GLOBALE HANDLER
// ===============================
document.querySelectorAll('input[type="search"]').forEach(input => {
  input.addEventListener('input', e => {
    const query = e.target.value.trim();
    const type = e.target.dataset.search;

    switch(type){
      case "newsletter":
        searchNewsletter(query);
        break;

      case "stepper":
        searchStepper(query);
        break;

      case "participants":
        searchParticipants(query);
        break;

      case "contact":
        searchContact(query);
        break;
    }
  });
});

//FILTRAGE COTE CLIENT NEWSLETTER(BARRE DE RECHERCHE)
async function searchNewsletter(query){
  const res = await fetch(`${API}/api/newsletter`);
  const data = await res.json();

  const body = document.getElementById("newsletterBody");
  body.innerHTML = "";

  const filtered = data.filter(n =>
    `${n.prenom} ${n.nom} ${n.email} ${n.pays}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  filtered.forEach(n=>{
    body.innerHTML += `
      <tr>
        <td>${n.prenom}</td>
        <td>${n.nom}</td>
        <td>${n.email}</td>
        <td>${n.pays}</td>
        <td>${n.created_at ? new Date(n.created_at).toLocaleDateString() : "—"}</td>
      </tr>`;
  });
}

//FILTRAGE COTE CLIENT BOUTONS FILTRES(BARRE DE RECHERHCHE)
function searchStepper(query){
  if(!query){
    renderAlphaFilter();
    renderStepperByLetter("A");
    return;
  }

  const container = document.getElementById("stepperContainer");
  container.innerHTML = "";

  const filtered = stepperCache.filter(p =>
    `${p.first_name} ${p.last_name} ${p.email}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  if(!filtered.length){
    container.innerHTML = `<p class="empty-state">Aucun résultat</p>`;
    return;
  }

  filtered.forEach(p=>{
    const invites = invitationsMap[p.id] || [];
    const payment = donationsMap[p.id] || "Non renseigné";

    container.innerHTML += `
      <div class="stepper-card enhanced">
        <div class="avatar">
          ${p.last_name[0]}${p.first_name[0]}
        </div>

        <div class="info">
          <strong>${p.last_name} ${p.first_name}</strong>
          <span>${p.email}</span>
        </div>

        <div class="info-block">
          <div class="label">👥 Invités déclarés</div>
          ${
            invites.length
              ? `<ul>${invites.map(n => `<li>${n}</li>`).join("")}</ul>`
              : `<span class="muted">Aucun invité</span>`
          }
        </div>

        <div class="info-block">
          <div class="label">💳 Méthode de paiement</div>
          <span class="payment-badge">${payment}</span>
        </div>
      </div>
    `;
  });
}
//FILTRAGE COTE CLIENT PARTICIPANTS ENREGISTRES(BARRE DE RECHERCHE)
async function searchParticipants(query){
  const res = await fetch(`${API}/api/stepper/participants`);
  const data = await res.json();

  const grid = document.getElementById("participantsGrid");
  grid.innerHTML = "";

  const filtered = data.filter(p =>
    `${p.first_name} ${p.last_name}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  filtered.forEach(p=>{
    grid.innerHTML += `
      <div class="participant-card">
        <div class="participant-name">
          ${p.first_name} ${p.last_name}
        </div>

        <div class="participant-meta">
          Réseau social : ${p.social_network || "—"}
        </div>

        <div class="participant-tags">
          <span class="participant-tag">Participant officiel</span>
        </div>

        <div class="participant-footer">
          ID participant : ${p.id}
        </div>
      </div>
    `;
  });
}
//FILTRAGE COTE CLIENT FEEDBACK CONTACT(BARRE DE RECHERCHE)
async function searchContact(query){
  const res = await fetch(`${API}/api/contact`);
  const data = await res.json();

  const container = document.getElementById("contactContainer");
  container.innerHTML = "";

  const filtered = data.filter(c =>
    `${c.email} ${c.subject} ${c.message}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  filtered.forEach(c=>{
    container.innerHTML += `
      <div class="contact-card">
        <div class="contact-top">
          <div class="contact-email">${c.email}</div>
          <div class="contact-date">
            ${c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}
          </div>
        </div>

        <div class="contact-subject">${c.subject}</div>
        <div class="contact-message">${c.message}</div>

        <div class="contact-footer">
          <button
            class="replyBtn"
            data-email="${c.email}"
            data-subject="${c.subject}">
            Répondre
          </button>
        </div>
      </div>
    `;
  });

  bindReply();
}

// -------- NEWSLETTER ----------
async function loadNewsletter(){
  const res = await fetch(`${API}/api/newsletter`);
  const data = await res.json();

  if (!Array.isArray(data)) {
    console.error("Newsletter invalide:", data);
    return;
  }

  const body = document.getElementById("newsletterBody");
  body.innerHTML = "";

  data.forEach(n=>{
    body.innerHTML += `
      <tr>
        <td>${n.prenom}</td>
        <td>${n.nom}</td>
        <td>${n.email}</td>
        <td>${n.pays}</td>
        <td>${n.created_at ? new Date(n.created_at).toLocaleDateString() : "—"}</td>
      </tr>`;
  });
}


// -------- STEPPER ----------
let stepperCache = [];
let invitationsMap = {};
let donationsMap = {};
async function loadStepper(){
  const res = await fetch(`${API}/api/admin/stepper/full`);
  const {participants, invitations, donations, ranking} = await res.json();

  stepperCache = participants;
  renderAlphaFilter();
  renderStepperByLetter("A");

  const container = document.getElementById("stepperContainer");
  container.innerHTML = "";

  const rankingList = document.getElementById("rankingList");


invitations.forEach(inv => {
  if (!invitationsMap[inv.participant_id]) {
    invitationsMap[inv.participant_id] = [];
  }
  invitationsMap[inv.participant_id].push(
    `${inv.first_name} ${inv.last_name}`
  );
});

donations.forEach(d => {
  donationsMap[d.participant_id] = d.payment_method;
});


  rankingList.innerHTML = "";
  ranking.forEach((r, i) => {
  rankingList.innerHTML += `
    <li class="ranking-card" data-rank="${i + 1}">
      
      <img 
        class="ranking-avatar"
        src="${r.image_path || 'https://via.placeholder.com/150'}"
        alt="${r.influencer_name}"
      />

      <div class="badge-name">
        ${r.influencer_name}
      </div>

      <div class="ranking-meta">
        <div class="badge-rank">
          🏆 #${i + 1}
        </div>
        <div class="badge-votes">
          👍 ${r.total_votes} votes
        </div>
      </div>

    </li>
  `;
});

}
function renderAlphaFilter(){
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const container = document.getElementById("alphaFilter");

  container.innerHTML = alpha.map(l =>
    `<button class="alpha-btn" data-letter="${l}">${l}</button>`
  ).join("");

  document.querySelectorAll(".alpha-btn").forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll(".alpha-btn")
        .forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      renderStepperByLetter(btn.dataset.letter);
    };
  });

  container.querySelector(".alpha-btn").classList.add("active");
}

function renderStepperByLetter(letter){
  const container = document.getElementById("stepperContainer");
  container.innerHTML = "";

  const filtered = stepperCache.filter(p =>
    p.last_name?.toUpperCase().startsWith(letter)
  );

  if (!filtered.length){
    container.innerHTML = `<p class="empty-state">Aucun participant</p>`;
    return;
  }

  filtered.forEach(p => {
    const invites = invitationsMap[p.id] || [];
    const payment = donationsMap[p.id] || "Non renseigné";

    container.innerHTML += `
      <div class="stepper-card enhanced">
        
        <!-- Identité -->
        <div class="avatar">
          ${p.last_name[0]}${p.first_name[0]}
        </div>

        <div class="info">
          <strong>${p.last_name} ${p.first_name}</strong>
          <span>${p.email}</span>
        </div>

        <!-- Bloc invités -->
        <div class="info-block">
          <div class="label">👥 Invités déclarés</div>
          ${
            invites.length
              ? `<ul>${invites.map(n => `<li>${n}</li>`).join("")}</ul>`
              : `<span class="muted">Aucun invité</span>`
          }
        </div>

        <!-- Bloc paiement -->
        <div class="info-block">
          <div class="label">💳 Méthode de paiement</div>
          <span class="payment-badge">${payment}</span>
        </div>

      </div>
    `;
  });
}



// -------- PARTICIPANTS ----------
async function loadParticipants(){
  const res = await fetch(`${API}/api/stepper/participants`);
  const data = await res.json();

  document.getElementById("participantCount").textContent = data.length;

  const grid = document.getElementById("participantsGrid");
  grid.innerHTML = "";

  data.forEach(p=>{
    grid.innerHTML += `
      <div class="participant-card">
        <div class="participant-name">
          ${p.first_name} ${p.last_name}
        </div>

        <div class="participant-meta">
          Réseau social : ${p.social_network || "—"}
        </div>

        <div class="participant-tags">
          <span class="participant-tag">Participant officiel</span>
        </div>

        <div class="participant-footer">
          ID participant : ${p.id}
        </div>
      </div>
    `;
  });
}


// -------- CONTACT ----------
async function loadContact(){
  const res = await fetch(`${API}/api/contact`);
  const data = await res.json();

  const contactContainer = document.getElementById("contactContainer");
  contactContainer.innerHTML = "";

  data.forEach(c=>{
    contactContainer.innerHTML += `
      <div class="contact-card">
        <div class="contact-top">
          <div class="contact-email">${c.email}</div>
          <div class="contact-date">
            ${c.created_at ? new Date(c.created_at).toLocaleDateString() : ""}
          </div>
        </div>

        <div class="contact-subject">${c.subject}</div>

        <div class="contact-message">
          ${c.message}
        </div>

        <div class="contact-footer">
          <button
            class="replyBtn"
            data-email="${c.email}"
            data-subject="${c.subject}"
          >
            Répondre
          </button>
        </div>
      </div>
    `;
  });

  bindReply();
}
//----------TOAST CONTACT-----------
document.getElementById("closeModalAlt").onclick =
document.getElementById("closeModal").onclick = ()=>{
  document.getElementById("replyModal").style.display="none";
};
function showToast(message){
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(()=>{
    toast.classList.remove("show");
  },3000);
}


// -------- EMAILJS ----------
function bindReply(){
  document.querySelectorAll(".replyBtn").forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelector("#replyForm [name=to_email]").value = btn.dataset.email;
      document.querySelector("#replyForm [name=subject]").value = "RE: "+btn.dataset.subject;
      document.getElementById("replyModal").style.display = "flex";
    };
  });
}

document.getElementById("replyForm").onsubmit = e=>{
  e.preventDefault();
  emailjs.send("SERVICE_ID","TEMPLATE_ID",{
    to_email:e.target.to_email.value,
    subject:e.target.subject.value,
    message:e.target.message.value
  });
  showToast("✅ Message envoyé avec succès");
  document.getElementById("replyModal").style.display="none";
};

document.getElementById("closeModal").onclick=()=>{
  document.getElementById("replyModal").style.display="none";
};

// INIT
loadNewsletter();
loadStepper();
loadParticipants();
loadContact();
