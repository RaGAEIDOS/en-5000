const { query } = require("./_lib/db");
const { requireAuth } = require("./_lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  try {
    const result = await query(`
      SELECT
        u.id,
        u.name,
        u.username,
        u.photo,
        u.last_active,
        COALESCE(SUM(p.xp), 0) AS total_xp,
        COALESCE(SUM(p.total_correct), 0) AS total_correct,
        COALESCE(SUM(p.total_answered), 0) AS total_answered,
        COALESCE(MAX(p.best_streak), 0) AS best_streak,
        COALESCE(MAX(p.day), 1) AS max_day,
        CASE WHEN SUM(p.total_answered) > 0
          THEN ROUND(SUM(p.total_correct)::numeric / SUM(p.total_answered) * 100, 1)
          ELSE 0 END AS accuracy
      FROM users u
      LEFT JOIN progress p ON p.user_id = u.id
      GROUP BY u.id, u.name, u.username, u.photo, u.last_active
      ORDER BY total_xp DESC, best_streak DESC
    `);

    const leaderboard = result.rows.map((row, idx) => {
      const xp = row.total_xp || 0;
      const bestStreak = row.best_streak || 0;
      const accuracy = row.accuracy || 0;
      const day = row.max_day || 1;
      const totalCorrect = row.total_correct || 0;
      const totalAnswered = row.total_answered || 0;

      // Smart rank score: XP (60%) + consistency (20%) + accuracy (20%)
      const rankScore = Math.round(xp * 0.6 + bestStreak * 10 * 0.2 + accuracy * 10 * 0.2);

      // Level from XP
      let level = "Beginner", levelIcon = "🌱", levelColor = "#9CA3AF";
      if (xp >= 20000) { level = "Expert"; levelIcon = "💎"; levelColor = "#EC4899"; }
      else if (xp >= 12000) { level = "Advanced"; levelIcon = "🔥"; levelColor = "#EF4444"; }
      else if (xp >= 7000) { level = "Upper-Int"; levelIcon = "🌟"; levelColor = "#F59E0B"; }
      else if (xp >= 3500) { level = "Intermediate"; levelIcon = "⭐"; levelColor = "#8B5CF6"; }
      else if (xp >= 1500) { level = "Pre-Int"; levelIcon = "📘"; levelColor = "#3B82F6"; }
      else if (xp >= 500) { level = "Elementary"; levelIcon = "🌿"; levelColor = "#22C55E"; }

      // Medal for top 3
      let medal = null;
      if (idx === 0) medal = "🥇";
      else if (idx === 1) medal = "🥈";
      else if (idx === 2) medal = "🥉";

      return {
        rank: idx + 1,
        id: row.id,
        name: row.name,
        username: row.username,
        photo: row.photo,
        lastActive: row.last_active,
        xp,
        bestStreak,
        accuracy,
        day,
        totalCorrect,
        totalAnswered,
        rankScore,
        level,
        levelIcon,
        levelColor,
        medal,
      };
    });

    // Find current user's rank
    let myRank = null;
    const user = requireAuth(req, res);
    if (user) {
      const me = leaderboard.find(u => u.id === user.id);
      if (me) myRank = me.rank;
      else {
        // User not in top 50, find their actual rank
        const myResult = await query(`
          SELECT COUNT(*) + 1 AS rank FROM (
            SELECT u.id, COALESCE(SUM(p.xp), 0) AS total_xp
            FROM users u
            JOIN progress p ON p.user_id = u.id
            GROUP BY u.id
            HAVING COALESCE(SUM(p.xp), 0) > 0
          ) ranked
          WHERE ranked.total_xp > (
            SELECT COALESCE(SUM(xp), 0) FROM progress WHERE user_id = $1
          )
        `, [user.id]);
        myRank = myResult.rows[0]?.rank || null;
      }
    }

    return res.status(200).json({ leaderboard, myRank });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
