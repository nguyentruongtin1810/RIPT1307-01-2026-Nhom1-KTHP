const { getPool } = require("../config/db");

async function getTotalApplications() {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT COUNT(*) AS total FROM applications`);
  return rows[0]?.total || 0;
}

async function getApplicationCountByStatus() {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT status, COUNT(*) AS count FROM applications GROUP BY status`);
  return rows;
}

async function getApplicationCountByMajorAndUniversity() {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT u.name AS university, m.name AS major, COUNT(a.id) AS count
     FROM applications a
     JOIN majors m ON a.major_id = m.id
     JOIN universities u ON m.university_id = u.id
     GROUP BY u.id, m.id
     ORDER BY u.name, m.name`
  );
  return rows;
}

module.exports = { getTotalApplications, getApplicationCountByStatus, getApplicationCountByMajorAndUniversity };
