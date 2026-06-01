const { getPool } = require("../config/db");

async function createUser({ username, email, passwordHash, role }) {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)`,
    [username, email, passwordHash, role]
  );

  return {
    id: result.insertId,
    username,
    email,
    role
  };
}

async function getUserByEmail(email) {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT * FROM users WHERE email = ?`, [email]);
  return rows[0] || null;
}

async function getUserByUsername(username) {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT * FROM users WHERE username = ?`, [username]);
  return rows[0] || null;
}

async function findUserByEmailOrUsername(identifier) {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT * FROM users WHERE email = ? OR username = ? LIMIT 1`,
    [identifier, identifier]
  );
  return rows[0] || null;
}

async function getUserById(id) {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT * FROM users WHERE id = ?`, [id]);
  return rows[0] || null;
}

module.exports = { createUser, getUserByEmail, getUserByUsername, findUserByEmailOrUsername, getUserById };