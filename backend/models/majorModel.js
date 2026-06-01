const { getPool } = require("../config/db");

async function getMajorsByUniversityId(universityId) {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT id, code, name, quota, university_id FROM majors WHERE university_id = ? ORDER BY name`,
    [universityId]
  );
  return rows;
}

async function getMajorById(id) {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT id, code, name, quota, university_id, created_at, updated_at FROM majors WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function getAllMajors(filters = {}) {
  const pool = getPool();
  const conditions = [];
  const params = [];

  if (filters.universityId) {
    conditions.push("university_id = ?");
    params.push(filters.universityId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows] = await pool.execute(
    `SELECT id, code, name, quota, university_id, created_at, updated_at FROM majors ${whereClause} ORDER BY name`,
    params
  );
  return rows;
}

async function getSubjectGroupIdsByMajorId(majorId) {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT subject_group_id FROM major_subject_groups WHERE major_id = ?`,
    [majorId]
  );
  return rows.map((row) => row.subject_group_id);
}

async function setSubjectGroupsForMajor(majorId, subjectGroupIds = []) {
  const pool = getPool();
  await pool.execute(`DELETE FROM major_subject_groups WHERE major_id = ?`, [majorId]);

  if (!Array.isArray(subjectGroupIds) || subjectGroupIds.length === 0) {
    return;
  }

  const values = subjectGroupIds.map((subjectGroupId) => [majorId, subjectGroupId]);
  await pool.query(`INSERT INTO major_subject_groups (major_id, subject_group_id) VALUES ?`, [values]);
}

async function createMajor({ code, name, quota, universityId, subjectGroupIds = [] }) {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO majors (university_id, code, name, quota) VALUES (?, ?, ?, ?)`,
    [universityId, code, name, quota || 0]
  );
  const majorId = result.insertId;
  await setSubjectGroupsForMajor(majorId, subjectGroupIds);
  return getMajorById(majorId);
}

async function updateMajor(id, { code, name, quota, universityId, subjectGroupIds }) {
  const pool = getPool();
  await pool.execute(
    `UPDATE majors SET code = ?, name = ?, quota = ?, university_id = ? WHERE id = ?`,
    [code, name, quota || 0, universityId, id]
  );

  if (subjectGroupIds !== undefined) {
    await setSubjectGroupsForMajor(id, subjectGroupIds);
  }

  return getMajorById(id);
}

async function deleteMajor(id) {
  const pool = getPool();
  await pool.execute(`DELETE FROM majors WHERE id = ?`, [id]);
  return true;
}

module.exports = {
  getMajorsByUniversityId,
  getMajorById,
  getAllMajors,
  getSubjectGroupIdsByMajorId,
  setSubjectGroupsForMajor,
  createMajor,
  updateMajor,
  deleteMajor
};
