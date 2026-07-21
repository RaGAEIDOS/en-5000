const bcrypt = require("bcryptjs");
const { query } = require("../_lib/db");
const { signToken } = require("../_lib/auth");

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { name, username, email, password, age } = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    if (!name?.trim()) return res.status(400).json({ error: "Name is required" });
    if (!username?.trim()) return res.status(400).json({ error: "Username is required" });
    if (!email?.trim()) return res.status(400).json({ error: "Email is required" });
    if (!password || password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters" });

    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanUsername.length < 3) return res.status(400).json({ error: "Username must be at least 3 characters (letters, numbers, underscores)" });
    if (cleanUsername.length > 30) return res.status(400).json({ error: "Username must be 30 characters or less" });
    if (/^[0-9]/.test(cleanUsername)) return res.status(400).json({ error: "Username cannot start with a number" });

    const existing = await query("SELECT id FROM users WHERE email = $1", [email.trim().toLowerCase()]);
    if (existing.rows.length > 0) return res.status(409).json({ error: "An account with this email already exists" });

    const existingUser = await query("SELECT id FROM users WHERE username = $1", [cleanUsername]);
    if (existingUser.rows.length > 0) return res.status(409).json({ error: "This username is already taken" });

    const hash = await bcrypt.hash(password, 10);
    const result = await query(
      "INSERT INTO users (name, username, email, password_hash, age) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, username, email, age, photo",
      [name.trim(), cleanUsername, email.trim().toLowerCase(), hash, age || null]
    );
    const user = result.rows[0];

    await query(
      "INSERT INTO progress (user_id, progress_type) VALUES ($1, 'general'), ($1, 'cs') ON CONFLICT DO NOTHING",
      [user.id]
    );

    const token = signToken({ id: user.id, email: user.email });
    return res.status(201).json({ token, user: { id: user.id, name: user.name, username: user.username, email: user.email, age: user.age, photo: user.photo } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
