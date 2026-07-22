const { query } = require("../_lib/db");
const { requireAuth } = require("../_lib/auth");

module.exports = async function handler(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  try {
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
    res.json({ unread });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
