const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "en5000_fallback_secret_change_me";
const EXPIRES_IN = "30d";

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}

function getTokenFromReq(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

function requireAuth(req, res) {
  const token = getTokenFromReq(req);
  if (!token) {
    res.status(401).json({ error: "Not authenticated. Please sign in." });
    return null;
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    res.status(401).json({ error: "Session expired. Please sign in again." });
    return null;
  }
  return decoded;
}

module.exports = { signToken, verifyToken, getTokenFromReq, requireAuth };
