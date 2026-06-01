const { getPool } = require("../config/db");

async function getAllUniversities() {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT id, code, name, logo_url, created_at, updated_at FROM universities ORDER BY name`);
  return rows;
}

async function getUniversityById(id) {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT id, code, name, logo_url, created_at, updated_at FROM universities WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function createUniversity({ code, name, logoUrl }) {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO universities (code, name, logo_url) VALUES (?, ?, ?)`,
    [code, name, logoUrl || null]
  );
  return getUniversityById(result.insertId);
}

async function updateUniversity(id, { code, name, logoUrl }) {
  const pool = getPool();
  await pool.execute(
    `UPDATE universities SET code = ?, name = ?, logo_url = ? WHERE id = ?`,
    [code, name, logoUrl || null, id]
  );
  return getUniversityById(id);
}

async function deleteUniversity(id) {
  const pool = getPool();
  await pool.execute(`DELETE FROM universities WHERE id = ?`, [id]);
  return true;
}

module.exports = { getAllUniversities, getUniversityById, createUniversity, updateUniversity, deleteUniversity };
