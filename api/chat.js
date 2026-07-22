const { query } = require("./_lib/db");
const { requireAuth } = require("./_lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();

  const user = requireAuth(req, res);
  if (!user) return;

  const action = req.query.action || (req.method === "POST" ? "send" : "unread");

  try {
    if (action === "send") {
      if (req.method !== "POST") return res.status(405).json({ error: "POST required" });
      const { receiverId, message } = req.body;
      if (!receiverId || !message || !message.trim()) {
        return res.status(400).json({ error: "receiverId and message required" });
      }
      const text = message.trim().slice(0, 1000);
      const r = await query(
        "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING id, sender_id, receiver_id, message, created_at",
        [user.id, receiverId, text]
      );
      return res.json({ msg: r.rows[0] });
    }

    if (action === "messages") {
      const otherId = Number(req.query.with);
      if (!otherId) return res.status(400).json({ error: "Missing ?with= param" });
      const r = await query(
        `SELECT id, sender_id, receiver_id, message, read, created_at
         FROM messages
         WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
         ORDER BY created_at ASC
         LIMIT 200`,
        [user.id, otherId]
      );
      await query(
        "UPDATE messages SET read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND read = FALSE",
        [otherId, user.id]
      );
      return res.json({ messages: r.rows });
    }

    if (action === "unread") {
      const r = await query(
        `SELECT sender_id, COUNT(*) as unread
         FROM messages
         WHERE receiver_id = $1 AND read = FALSE
         GROUP BY sender_id`,
        [user.id]
      );
      const unread = {};
      for (const row of r.rows) {
        unread[row.sender_id] = Number(row.unread);
      }
      return res.json({ unread });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
