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
    const [result, userResult, settingsResult, perfResult] = await Promise.all([
      query(
        "SELECT progress_type, day, streak, last_date, total_correct, total_answered, xp, best_streak FROM progress WHERE user_id = $1",
        [user.id]
      ),
      query("SELECT id, name, username, email, age, photo FROM users WHERE id = $1", [user.id]),
      query("SELECT settings FROM user_settings WHERE user_id = $1", [user.id]),
      query("SELECT history FROM performance_history WHERE user_id = $1", [user.id])
    ]);

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

    const profile = userResult.rows[0] || null;
    const settings = settingsResult.rows[0]?.settings || { sound: true, dark: false };
    const perfHistory = perfResult.rows[0]?.history || [];

    return res.status(200).json({ progress, profile, settings, perfHistory });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
