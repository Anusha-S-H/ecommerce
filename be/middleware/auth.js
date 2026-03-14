const jwt = require("jsonwebtoken");
const db = require("../config/db");

const dbPromise = db.promise();

function serializeUser(user) {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
  };
}

async function authRequired(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authorization token missing" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const [users] = await dbPromise.query(
      "SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1",
      [payload.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "User not found for token" });
    }

    req.user = serializeUser(users[0]);
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function adminRequired(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
}

module.exports = {
  authRequired,
  adminRequired,
};
