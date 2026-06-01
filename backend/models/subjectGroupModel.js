const { getPool } = require("../config/db");

async function getSubjectGroupsByMajorId(majorId) {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT sg.id, sg.code, sg.name
     FROM subject_groups sg
     JOIN major_subject_groups msg ON sg.id = msg.subject_group_id
     WHERE msg.major_id = ?
     ORDER BY sg.code`,
    [majorId]
  );
  return rows;
}

async function getSubjectGroupById(id) {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT id, code, name, created_at, updated_at FROM subject_groups WHERE id = ?`, [id]);
  return rows[0] || null;
}

async function getAllSubjectGroups() {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT id, code, name, created_at, updated_at FROM subject_groups ORDER BY code`);
  return rows;
}

async function createSubjectGroup({ code, name }) {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO subject_groups (code, name) VALUES (?, ?)`,
    [code, name]
  );
  return getSubjectGroupById(result.insertId);
}

async function updateSubjectGroup(id, { code, name }) {
  const pool = getPool();
  await pool.execute(`UPDATE subject_groups SET code = ?, name = ? WHERE id = ?`, [code, name, id]);
  return getSubjectGroupById(id);
}

async function deleteSubjectGroup(id) {
  const pool = getPool();
  await pool.execute(`DELETE FROM subject_groups WHERE id = ?`, [id]);
  return true;
}

module.exports = {
  getSubjectGroupsByMajorId,
  getSubjectGroupById,
  getAllSubjectGroups,
  createSubjectGroup,
  updateSubjectGroup,
  deleteSubjectGroup
};
