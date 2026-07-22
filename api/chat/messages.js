const { query } = require("../_lib/db");
const { requireAuth } = require("../_lib/auth");

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  const otherId = Number(req.query.with);
  if (!otherId) return res.status(400).json({ error: "Missing ?with= param" });
  try {
    const r = await query(
      `SELECT id, sender_id, receiver_id, message, read, created_at
       FROM messages
       WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC
       LIMIT 200`,
      [user.id, otherId]
    );
    // Mark messages from other user as read
    await query(
      "UPDATE messages SET read = TRUE WHERE sender_id = $1 AND receiver_id = $2 AND read = FALSE",
      [otherId, user.id]
    );
    res.json({ messages: r.rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
