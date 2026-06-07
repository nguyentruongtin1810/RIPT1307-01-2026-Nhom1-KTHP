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

async function getCascadingUniversityData() {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT u.id AS university_id,
            u.name AS university_name,
            m.id AS major_id,
            m.name AS major_name,
            sg.id AS subject_group_id,
            sg.code AS subject_group_code,
            sg.name AS subject_group_name
     FROM universities u
     JOIN majors m ON m.university_id = u.id
     JOIN major_subject_groups msg ON msg.major_id = m.id
     JOIN subject_groups sg ON sg.id = msg.subject_group_id
     ORDER BY u.name, m.name, sg.code`
  );

  const universityMap = new Map();

  for (const row of rows) {
    if (!universityMap.has(row.university_id)) {
      universityMap.set(row.university_id, {
        value: row.university_id,
        label: row.university_name,
        children: []
      });
    }

    const university = universityMap.get(row.university_id);
    let major = university.children.find((item) => item.value === row.major_id);
    if (!major) {
      major = {
        value: row.major_id,
        label: row.major_name,
        children: []
      };
      university.children.push(major);
    }

    major.children.push({
      value: row.subject_group_id,
      label: `${row.subject_group_code} - ${row.subject_group_name}`,
      code: row.subject_group_code
    });
  }

  return Array.from(universityMap.values());
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

async function getUniversities() {
  return getAllUniversities();
}

async function getMajors(filters = {}) {
  return getAllMajors(filters);
}

module.exports = {
  getAllUniversities,
  getUniversityById,
  getCascadingUniversityData,
  createUniversity,
  updateUniversity,
  deleteUniversity,
  getUniversities,
  getMajors
};
