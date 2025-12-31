require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();

/* ---------- Middleware ---------- */
app.use(cors());
app.use(express.json());

/* ---------- Désormain une connexion déployable sur héberheur backend ---------- */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10
});


/* ---------- Routes ---------- */

/* Subscribe */
app.post("/api/newsletter/subscribe", async (req, res) => {
  const { prenom, nom, email, pays } = req.body;

  if (!prenom || !nom || !email || !pays) {
    return res.status(400).json({ message: "Données invalides." });
  }

  try {
    await pool.execute(
      `INSERT INTO newsletter (prenom, nom, email, pays)
       VALUES (?, ?, ?, ?)`,
      [prenom, nom, email, pays]
    );

    res.status(201).json({ message: "Abonnement enregistré." });
    console.log("Abonnement réussi à la newsletter.");

  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Email déjà abonné." });
    }
    res.status(500).json({ message: "Erreur serveur." });
    
  }
});

/* Unsubscribe */
app.delete("/api/newsletter/unsubscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email requis." });
  }

  const [result] = await pool.execute(
    "DELETE FROM newsletter WHERE email = ?",
    [email]
  );

  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Email non trouvé." });
  }

  res.json({ message: "Désabonnement effectué." });
});
// Stepper Étape 1 — Création participant (avec anti-duplicat email)
app.post('/api/stepper/step1', async (req, res) => {
  console.log('➡️ POST /api/stepper/step1', req.body);

  const { lastName, firstName, email, phone, social, profile } = req.body;

  if (!lastName || !firstName || !email) {
    console.warn('❌ Données step1 incomplètes');
    return res.status(400).json({ error: 'Données incomplètes' });
  }

  try {
    // 🔍 Vérification email déjà utilisé
    const [[existing]] = await pool.execute(
      `SELECT id FROM stepper_participants WHERE email = ? LIMIT 1`,
      [email]
    );

    if (existing) {
      console.warn('⚠️ Email déjà utilisé :', email);
      return res.status(409).json({
        error: 'EMAIL_ALREADY_USED',
        message: 'Cet email est déjà associé à un participant.'
      });
    }

    // ✅ Insertion
    const [result] = await pool.execute(
      `INSERT INTO stepper_participants 
       (last_name, first_name, email, phone, social_network, social_profile)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [lastName, firstName, email, phone, social || null, profile || null]
    );

    console.log('✅ Participant créé ID =', result.insertId);
    res.json({ participantId: result.insertId });

  } catch (err) {
    console.error('❌ Erreur step1', err);
    res.status(500).json({ error: 'Erreur serveur step1' });
  }
});

//Update nouveau partcipant
app.put('/api/stepper/participant/:id', async (req, res) => {
  console.log(`➡️ PUT /api/stepper/participant/${req.params.id}`, req.body);

  const fields = [];
  const values = [];

  for (const [key, val] of Object.entries(req.body)) {
    fields.push(`${key} = ?`);
    values.push(val);
  }

  if (!fields.length) {
    return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
  }

  values.push(req.params.id);

  await pool.execute(
    `UPDATE stepper_participants SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  console.log('✅ Participant mis à jour', req.params.id);

  res.json({ success: true });
});
// 📥 Lecture de tous les participants (Pour la Campagne)
app.get('/api/stepper/participants', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        id,
        first_name,
        last_name,
        social_network
      FROM stepper_participants
      ORDER BY last_name ASC
    `);

    res.json(rows);

  } catch (err) {
    console.error('❌ Erreur lecture participants', err);
    res.status(500).json({ error: 'Erreur lecture participants' });
  }
});
//Stepper Etape 2
app.post('/api/stepper/step2', async (req, res) => {
  console.log('➡️ POST /api/stepper/step2', req.body);

  const { participantId, invites } = req.body;

  if (!participantId || !Array.isArray(invites)) {
    return res.status(400).json({
      error: 'INVALID_DATA',
      message: 'Données invalides'
    });
  }

  try {
    // 🔥 Nettoyage anti-doublon
    await pool.execute(
      `DELETE FROM stepper_invitations WHERE participant_id = ?`,
      [participantId]
    );

    let inserted = 0;

    for (const inv of invites) {
      const { last, first, social, profile } = inv;

      if (!last || !first || !social || !profile) continue;

      await pool.execute(
        `INSERT INTO stepper_invitations
         (participant_id, last_name, first_name, social_network, social_profile)
         VALUES (?, ?, ?, ?, ?)`,
        [participantId, last, first, social, profile]
      );

      inserted++;
    }

    console.log(`✅ ${inserted} invitations enregistrées`);

    return res.status(200).json({
      success: true,
      message: 'Invitations enregistrées avec succès',
      inserted
    });

  } catch (err) {
    console.error('❌ Erreur step2', err);
    return res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'Erreur serveur lors de l’enregistrement'
    });
  }
});

//Stepper Etape 3 VOTE 
app.post('/api/analytics/vote', async (req, res) => {
  const { participantId, influencerNames } = req.body;

  for (const name of influencerNames) {
    const [[inf]] = await pool.execute(
      `SELECT id FROM analytics WHERE influencer_name = ?`,
      [name]
    );

    await pool.execute(
      `INSERT IGNORE INTO analytics_votes (influencer_id, participant_id)
       VALUES (?, ?)`,
      [inf.id, participantId]
    );

    await pool.execute(
      `UPDATE analytics SET total_votes = total_votes + 1 WHERE id = ?`,
      [inf.id]
    );
  }
  res.json({ success: true });
});
// 📥 Lecture de tous les influenceurs (STEP 3)
app.get('/api/analytics/influencers', async (req, res) => {
  console.log('📥 GET /api/analytics/influencers');

  try {
    const [rows] = await pool.execute(`
      SELECT 
        id,
        influencer_name,
        image_path,
        sector,
        status
      FROM analytics
      ORDER BY influencer_name ASC
    `);

    console.log(`✅ ${rows.length} influenceurs chargés`);
    res.json(rows);

  } catch (err) {
    console.error('❌ Erreur lecture analytics', err);
    res.status(500).json({ error: 'Erreur serveur analytics' });
  }
});
//Barre de recherche Etape 3
app.get('/api/analytics/search', async (req, res) => {
  const q = `%${req.query.q || ''}%`;
  console.log('🔍 SEARCH analytics:', q);

  try {
    const [rows] = await pool.execute(`
      SELECT 
        id,
        influencer_name,
        image_path,
        sector,
        status
      FROM analytics
      WHERE influencer_name LIKE ?
      ORDER BY influencer_name ASC
    `, [q]);

    console.log(`✅ ${rows.length} résultat(s) search`);
    res.json(rows);

  } catch (err) {
    console.error('❌ Erreur search analytics', err);
    res.status(500).json({ error: 'Erreur search analytics' });
  }
});
// 📊Calculs Analytiques réels pour un influenceur
app.get('/api/analytics/stats/:name', async (req, res) => {
  const influencerName = req.params.name;

  try {
    // 🔢 Votes totaux globaux
    const [[total]] = await pool.execute(
      `SELECT SUM(total_votes) AS totalVotes FROM analytics`
    );

    // 🎯 Données influenceur + ranking
    const [rows] = await pool.execute(`
      SELECT 
        a.id,
        a.influencer_name,
        a.total_votes,
        RANK() OVER (ORDER BY a.total_votes DESC) AS rank_position
      FROM analytics a
    `);

    const current = rows.find(r => r.influencer_name === influencerName);
    if (!current) return res.status(404).json({ error: 'Influenceur introuvable' });

    // 📈 Évolution des votes (line chart)
    const [timeline] = await pool.execute(`
      SELECT 
        DATE(av.created_at) AS vote_date,
        COUNT(*) AS votes
      FROM analytics_votes av
      JOIN analytics a ON a.id = av.influencer_id
      WHERE a.influencer_name = ?
      GROUP BY vote_date
      ORDER BY vote_date ASC
    `, [influencerName]);

    // 📊 Bar chart (comparaison)
    const [bars] = await pool.execute(`
      SELECT influencer_name, total_votes
      FROM analytics
      ORDER BY total_votes DESC
      LIMIT 6
    `);

    res.json({
      votes: current.total_votes,
      percent: total.totalVotes
        ? Math.round((current.total_votes / total.totalVotes) * 100)
        : 0,
      rank: current.rank_position,
      trend: timeline.length > 1 &&
             timeline[timeline.length - 1].votes >
             timeline[timeline.length - 2].votes
             ? '↗' : '→',
      barData: bars.map(b => b.total_votes),
      barLabels: bars.map(b => b.influencer_name),
      lineData: timeline.map(t => t.votes)
    });

  } catch (err) {
    console.error('❌ Analytics error', err);
    res.status(500).json({ error: 'Erreur analytics' });
  }
});
//Lecture par le participant
app.get('/api/stepper/participant/:id', async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT * FROM stepper_participants WHERE id = ?`,
    [req.params.id]
  );

  res.json(rows[0] || null);
});
// Stepper Étape 4 — Donation
app.post('/api/stepper/step4', async (req, res) => {
  console.log('➡️ POST /api/stepper/step4', req.body);

  const { participantId, paymentMethod } = req.body;

  if (!participantId || !paymentMethod) {
    return res.status(400).json({ error: 'participantId et paymentMethod requis' });
  }

  try {
    // 🔁 Anti-doublon : 1 choix par participant
    await pool.execute(
      `DELETE FROM stepper_donations WHERE participant_id = ?`,
      [participantId]
    );

    await pool.execute(
      `INSERT INTO stepper_donations (participant_id, payment_method)
       VALUES (?, ?)`,
      [participantId, paymentMethod]
    );

    console.log('✅ Donation enregistrée', participantId, paymentMethod);
    res.json({ success: true });

  } catch (err) {
    console.error('❌ Erreur step4 donation', err);
    res.status(500).json({ error: 'Erreur serveur donation' });
  }
});
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`, req.body);
  next();
});
/* ----------Formulaire Contact ---------- */
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'Données invalides.' });
  }

  try {
    await pool.execute(
      `INSERT INTO contact (name, email, subject, message)
       VALUES (?, ?, ?, ?)`,
      [name, email, subject, message]
    );

    console.log('📩 Nouveau message contact enregistré');
    res.status(201).json({ success: true });

  } catch (err) {
    console.error('❌ Erreur contact', err);
    res.status(500).json({ message: 'Erreur serveur contact.' });
  }
});
// 📥 ADMIN — Lecture newsletter
app.get('/api/newsletter', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT prenom, nom, email, pays, created_at
      FROM newsletter
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('❌ Newsletter admin error', err);
    res.status(500).json({ error: 'Erreur lecture newsletter' });
  }
});
// 📥 ADMIN — Lecture messages contact
app.get('/api/contact', async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, name, email, subject, message, created_at
      FROM contact
      ORDER BY created_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error('❌ Contact admin error', err);
    res.status(500).json({ error: 'Erreur lecture contact' });
  }
});
// 📥 ADMIN — Vue complète Stepper
app.get('/api/admin/stepper/full', async (req, res) => {
  try {
    const [participants] = await pool.execute(`
      SELECT *
      FROM stepper_participants
      ORDER BY created_at DESC
    `);

    const [invitations] = await pool.execute(`
      SELECT *
      FROM stepper_invitations
    `);

    const [donations] = await pool.execute(`
      SELECT *
      FROM stepper_donations
    `);

    // ✅ AJOUT image_path
    const [ranking] = await pool.execute(`
      SELECT influencer_name, total_votes, image_path
      FROM analytics
      ORDER BY total_votes DESC
    `);

    res.json({
      participants,
      invitations,
      donations,
      ranking
    });

  } catch (err) {
    console.error('❌ Admin stepper full error', err);
    res.status(500).json({ error: 'Erreur stepper admin' });
  }
});


app.get("/", (req, res) => {
  res.send("✅ API Fondation Delon opérationnelle");
});
/* ---------- Server ---------- */
console.log("ENV DB HOST =", process.env.DB_HOST);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur fondation delon tena tena actif sur http://localhost:${PORT}`);
});