const { query } = require("../_lib/db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: "Username is required" });

    const cleanUsername = username.toLowerCase().trim();

    const userResult = await query(
      "SELECT id, name, username, photo, created_at FROM users WHERE username = $1",
      [cleanUsername]
    );
    if (userResult.rows.length === 0) return res.status(404).json({ error: "User not found" });

    const user = userResult.rows[0];

    const progressResult = await query(
      `SELECT progress_type, day, streak, total_correct, total_answered, xp, best_streak
       FROM progress WHERE user_id = $1`,
      [user.id]
    );

    let generalXP = 0, generalCorrect = 0, generalAnswered = 0, generalStreak = 0, generalDay = 1, generalBestStreak = 0;
    let csXP = 0, csCorrect = 0, csAnswered = 0, csDay = 1;

    for (const row of progressResult.rows) {
      if (row.progress_type === "general") {
        generalXP = row.xp || 0;
        generalCorrect = row.total_correct || 0;
        generalAnswered = row.total_answered || 0;
        generalStreak = row.streak || 0;
        generalDay = row.day || 1;
        generalBestStreak = row.best_streak || 0;
      } else if (row.progress_type === "cs") {
        csXP = row.xp || 0;
        csCorrect = row.total_correct || 0;
        csAnswered = row.total_answered || 0;
        csDay = row.day || 1;
      }
    }

    const totalXP = generalXP + csXP;
    const totalCorrect = generalCorrect + csCorrect;
    const totalAnswered = generalAnswered + csAnswered;
    const accuracy = totalAnswered > 0 ? Math.round(totalCorrect / totalAnswered * 100) : 0;

    let level = "Beginner", levelIcon = "🌱", levelColor = "#9CA3AF";
    if (totalXP >= 20000) { level = "Expert"; levelIcon = "💎"; levelColor = "#EC4899"; }
    else if (totalXP >= 12000) { level = "Advanced"; levelIcon = "🔥"; levelColor = "#EF4444"; }
    else if (totalXP >= 7000) { level = "Upper-Int"; levelIcon = "🌟"; levelColor = "#F59E0B"; }
    else if (totalXP >= 3500) { level = "Intermediate"; levelIcon = "⭐"; levelColor = "#8B5CF6"; }
    else if (totalXP >= 1500) { level = "Pre-Int"; levelIcon = "📘"; levelColor = "#3B82F6"; }
    else if (totalXP >= 500) { level = "Elementary"; levelIcon = "🌿"; levelColor = "#22C55E"; }

    const rankResult = await query(
      `SELECT COUNT(*) + 1 AS rank FROM (
        SELECT u2.id, COALESCE(SUM(p2.xp), 0) AS total_xp
        FROM users u2
        LEFT JOIN progress p2 ON p2.user_id = u2.id
        GROUP BY u2.id
      ) ranked WHERE ranked.total_xp > $1`,
      [totalXP]
    );
    const rank = rankResult.rows[0]?.rank || null;

    return res.status(200).json({
      profile: {
        id: user.id,
        name: user.name,
        username: user.username,
        photo: user.photo,
        joinedAt: user.created_at,
        rank,
        totalXP,
        totalCorrect,
        totalAnswered,
        accuracy,
        bestStreak: generalBestStreak,
        currentStreak: generalStreak,
        level,
        levelIcon,
        levelColor,
        general: { day: generalDay, xp: generalXP, correct: generalCorrect, answered: generalAnswered },
        cs: { day: csDay, xp: csXP, correct: csCorrect, answered: csAnswered },
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
