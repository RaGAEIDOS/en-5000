const { query } = require("../_lib/db");

module.exports = async function handler(req, res) {
  const key = req.query.key || req.headers["x-admin-key"];
  if (key !== "en5k-admin-2026") {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    const r = await query(
      "SELECT id, name, username, email, age, photo IS NOT NULL as has_photo, created_at FROM users ORDER BY id"
    );
    res.json({ users: r.rows, total: r.rowCount });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
