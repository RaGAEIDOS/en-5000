const { query } = require("../_lib/db");
const { requireAuth } = require("../_lib/auth");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const user = requireAuth(req, res);
  if (!user) return;
  try {
    const { receiverId, message } = req.body;
    if (!receiverId || !message || !message.trim()) {
      return res.status(400).json({ error: "receiverId and message required" });
    }
    const text = message.trim().slice(0, 1000);
    const r = await query(
      "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNING id, sender_id, receiver_id, message, created_at",
      [user.id, receiverId, text]
    );
    res.json({ msg: r.rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
