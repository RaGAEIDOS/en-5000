const { query } = require("./_lib/db");
const { requireAuth } = require("./_lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const action = req.query.action || "heartbeat";

  if (action === "heartbeat") {
    if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
    const user = requireAuth(req, res);
    if (!user) return;
    try {
      await query("UPDATE users SET last_active = NOW() WHERE id = $1", [user.id]);
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (action === "online") {
    const ids = req.query.ids;
    if (!ids) return res.json({ online: {} });
    try {
      const idArr = ids.split(",").map(Number).filter(Boolean);
      if (idArr.length === 0) return res.json({ online: {} });
      const r = await query(
        `SELECT id, last_active FROM users WHERE id = ANY($1)`,
        [idArr]
      );
      const now = Date.now();
      const online = {};
      for (const row of r.rows) {
        if (row.last_active) {
          const diff = now - new Date(row.last_active).getTime();
          online[row.id] = diff < 120000;
        }
      }
      return res.json({ online });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(400).json({ error: "Unknown action" });
};
