const { query } = require("../_lib/db");

module.exports = async function handler(req, res) {
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
    res.json({ online });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
