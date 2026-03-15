const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const dbPromise = db.promise();
let cachedPasswordColumn = null;

async function getPasswordColumn() {
  if (cachedPasswordColumn) {
    return cachedPasswordColumn;
  }

  const [columns] = await dbPromise.query("SHOW COLUMNS FROM users");
  const fieldNames = columns.map((column) => column.Field);
  cachedPasswordColumn = fieldNames.includes("password_hash") ? "password_hash" : "password";
  return cachedPasswordColumn;
}

function serializeUser(user) {
  return {
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
  };
}

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );
}

async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "name, email and password are required" });
  }

  const normalizedEmail = email.toLowerCase();

  try {
    const passwordColumn = await getPasswordColumn();

    const [existingUsers] = await dbPromise.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const insertQuery = `INSERT INTO users (name, email, ${passwordColumn}, role) VALUES (?, ?, ?, ?)`;
    const [result] = await dbPromise.query(
      insertQuery,
      [name, normalizedEmail, password_hash, "user"]
    );

    const user = {
      id: result.insertId,
      name,
      email: normalizedEmail,
      role: "user",
      created_at: new Date().toISOString(),
    };

    const safeUser = serializeUser(user);
    const token = signToken(safeUser);

    return res.status(201).json({ user: safeUser, token });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }

  try {
    const passwordColumn = await getPasswordColumn();
    const normalizedEmail = email.toLowerCase();
    const loginQuery = `SELECT id, name, email, role, ${passwordColumn} AS password_value FROM users WHERE email = ? LIMIT 1`;
    const [results] = await dbPromise.query(
      loginQuery,
      [normalizedEmail]
    );

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = results[0];
    let isMatch = false;

    if (typeof user.password_value === "string") {
      try {
        isMatch = await bcrypt.compare(password, user.password_value);
      } catch (error) {
        isMatch = false;
      }

      if (!isMatch) {
        isMatch = user.password_value === password;
      }
    }

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const safeUser = serializeUser(user);
    const token = signToken(safeUser);

    return res.json({ user: safeUser, token });
  } catch (error) {
    return res.status(500).json({ message: "Failed to login" });
  }
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = {
  register,
  login,
  me,
};