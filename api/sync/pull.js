const { query } = require("../_lib/db");
const { requireAuth } = require("../_lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET" && req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const result = await query(
      "SELECT progress_type, day, streak, last_date, total_correct, total_answered, xp, best_streak FROM progress WHERE user_id = $1",
      [user.id]
    );

    const progress = { general: null, cs: null };
    for (const row of result.rows) {
      progress[row.progress_type] = {
        day: row.day,
        streak: row.streak,
        lastDate: row.last_date,
        totalCorrect: row.total_correct,
        totalAnswered: row.total_answered,
        xp: row.xp,
        bestStreak: row.best_streak,
      };
    }

    return res.status(200).json({ progress });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
