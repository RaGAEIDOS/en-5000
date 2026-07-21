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
    const { name, username, age, photo, email } = body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined) { fields.push(`name = $${idx++}`); values.push(name.trim()); }
    if (username !== undefined && username.trim()) {
      const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
      if (cleanUsername.length < 3) return res.status(400).json({ error: "Username must be at least 3 characters" });
      if (cleanUsername.length > 30) return res.status(400).json({ error: "Username must be 30 characters or less" });
      if (/^[0-9]/.test(cleanUsername)) return res.status(400).json({ error: "Username cannot start with a number" });
      const exists = await query("SELECT id FROM users WHERE username = $1 AND id != $2", [cleanUsername, user.id]);
      if (exists.rows.length > 0) return res.status(409).json({ error: "This username is already taken" });
      fields.push(`username = $${idx++}`); values.push(cleanUsername);
    }
    if (age !== undefined) { fields.push(`age = $${idx++}`); values.push(age || null); }
    if (photo !== undefined) { fields.push(`photo = $${idx++}`); values.push(photo || null); }
    if (email !== undefined && email.trim() && email.trim() !== user.email) {
      const exists = await query("SELECT id FROM users WHERE email = $1 AND id != $2", [email.trim().toLowerCase(), user.id]);
      if (exists.rows.length > 0) return res.status(409).json({ error: "Email already in use" });
      fields.push(`email = $${idx++}`); values.push(email.trim().toLowerCase());
    }

    if (fields.length === 0) return res.status(400).json({ error: "No fields to update" });

    values.push(user.id);
    const result = await query(
      `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, name, username, email, age, photo`,
      values
    );

    const updated = result.rows[0];
    return res.status(200).json({ user: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
