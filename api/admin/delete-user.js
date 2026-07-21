const { query } = require("../_lib/db");

module.exports = async function handler(req, res) {
  const key = req.query.key || req.headers["x-admin-key"];
  if (key !== "en5k-admin-2026") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  const id = req.query.id;
  if (!id) {
    return res.status(400).json({ error: "Missing id param" });
  }

  try {
    await query("DELETE FROM performance_history WHERE user_id = $1", [id]);
    await query("DELETE FROM user_settings WHERE user_id = $1", [id]);
    await query("DELETE FROM password_resets WHERE user_id = $1", [id]);
    await query("DELETE FROM progress WHERE user_id = $1", [id]);
    const r = await query("DELETE FROM users WHERE id = $1 RETURNING id, name, email", [id]);
    res.json({ deleted: r.rows[0] || null });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
