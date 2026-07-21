const { query } = require("../_lib/db");
const { requireAuth } = require("../_lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = requireAuth(req, res);
  if (!user) return;

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { general, cs, settings, perfHistory } = body;

    if (general) {
      await query(
        `INSERT INTO progress (user_id, progress_type, day, streak, last_date, total_correct, total_answered, xp, best_streak, updated_at)
         VALUES ($1, 'general', $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (user_id, progress_type) DO UPDATE SET
           day = GREATEST(progress.day, EXCLUDED.day),
           streak = EXCLUDED.streak,
           last_date = EXCLUDED.last_date,
           total_correct = GREATEST(progress.total_correct, EXCLUDED.total_correct),
           total_answered = GREATEST(progress.total_answered, EXCLUDED.total_answered),
           xp = GREATEST(progress.xp, EXCLUDED.xp),
           best_streak = GREATEST(progress.best_streak, EXCLUDED.best_streak),
           updated_at = NOW()`,
        [user.id, general.day || 1, general.streak || 0, general.lastDate || null,
         general.totalCorrect || 0, general.totalAnswered || 0, general.xp || 0, general.bestStreak || 0]
      );
    }

    if (cs) {
      await query(
        `INSERT INTO progress (user_id, progress_type, day, streak, last_date, total_correct, total_answered, xp, best_streak, updated_at)
         VALUES ($1, 'cs', $2, $3, $4, $5, $6, $7, $8, NOW())
         ON CONFLICT (user_id, progress_type) DO UPDATE SET
           day = GREATEST(progress.day, EXCLUDED.day),
           streak = EXCLUDED.streak,
           last_date = EXCLUDED.last_date,
           total_correct = GREATEST(progress.total_correct, EXCLUDED.total_correct),
           total_answered = GREATEST(progress.total_answered, EXCLUDED.total_answered),
           xp = GREATEST(progress.xp, EXCLUDED.xp),
           best_streak = GREATEST(progress.best_streak, EXCLUDED.best_streak),
           updated_at = NOW()`,
        [user.id, cs.day || 1, cs.streak || 0, cs.lastDate || null,
         cs.totalCorrect || 0, cs.totalAnswered || 0, cs.xp || 0, cs.bestStreak || 0]
      );
    }

    if (settings) {
      await query(
        `INSERT INTO user_settings (user_id, settings, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET settings = EXCLUDED.settings, updated_at = NOW()`,
        [user.id, JSON.stringify(settings)]
      );
    }

    if (perfHistory) {
      await query(
        `INSERT INTO performance_history (user_id, history, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (user_id) DO UPDATE SET history = EXCLUDED.history, updated_at = NOW()`,
        [user.id, JSON.stringify(perfHistory)]
      );
    }

    return res.status(200).json({ message: "Progress saved to cloud" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
