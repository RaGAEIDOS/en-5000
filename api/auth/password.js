const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { query } = require("../_lib/db");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const action = req.query.action || "forgot";

  try {
    if (action === "forgot") {
      const { email } = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      if (!email?.trim()) return res.status(400).json({ error: "Email is required" });
      const result = await query("SELECT id FROM users WHERE email = $1", [email.trim().toLowerCase()]);
      if (result.rows.length === 0) return res.status(200).json({ message: "If an account exists with this email, a reset link has been sent." });
      const userId = result.rows[0].id;
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      await query("UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE", [userId]);
      await query("INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)", [userId, token, expires]);
      return res.status(200).json({ message: "If an account exists with this email, a reset link has been sent.", resetToken: token });
    }

    if (action === "reset") {
      const { token, password } = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
      if (!token || !password) return res.status(400).json({ error: "Token and new password are required" });
      if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });
      const result = await query(
        "SELECT id, user_id, expires_at, used FROM password_resets WHERE token = $1 ORDER BY created_at DESC LIMIT 1",
        [token]
      );
      if (result.rows.length === 0) return res.status(400).json({ error: "Invalid or expired reset token" });
      const row = result.rows[0];
      if (row.used) return res.status(400).json({ error: "This reset token has already been used" });
      if (new Date(row.expires_at) < new Date()) return res.status(400).json({ error: "This reset token has expired" });
      const hash = await bcrypt.hash(password, 10);
      await query("UPDATE users SET password_hash = $1 WHERE id = $2", [hash, row.user_id]);
      await query("UPDATE password_resets SET used = TRUE WHERE id = $1", [row.id]);
      return res.status(200).json({ message: "Password has been reset successfully. You can now sign in." });
    }

    return res.status(400).json({ error: "Unknown action" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
