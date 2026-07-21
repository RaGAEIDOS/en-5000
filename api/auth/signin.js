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
    const { email, password } = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    if (!email?.trim() || !password) return res.status(400).json({ error: "Email and password are required" });

    const result = await query("SELECT id, name, username, email, age, photo, password_hash FROM users WHERE email = $1", [email.trim().toLowerCase()]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid email or password" });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken({ id: user.id, email: user.email });
    return res.status(200).json({ token, user: { id: user.id, name: user.name, username: user.username, email: user.email, age: user.age, photo: user.photo } });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
