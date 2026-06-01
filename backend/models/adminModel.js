const { getPool } = require("../config/db");

async function findAdminByEmail(email) {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT * FROM admins WHERE email = ?`, [email]);
  return rows[0] || null;
}

async function findAdminById(adminId) {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT * FROM admins WHERE admin_id = ?`, [adminId]);
  return rows[0] || null;
}

async function createAdmin({ fullName, email, passwordHash }) {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO admins (full_name, email, password_hash) VALUES (?, ?, ?)`,
    [fullName, email, passwordHash]
  );
  return {
    admin_id: result.insertId,
    full_name: fullName,
    email
  };
}

module.exports = { findAdminByEmail, findAdminById, createAdmin };