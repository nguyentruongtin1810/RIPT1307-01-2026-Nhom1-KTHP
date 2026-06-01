const { getPool } = require("../config/db");

async function createCandidateProfile({ userId, fullName, phone = null, gender = null, dob = null, idCardNumber = null, priorityGroup = null }) {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO candidates (user_id, full_name, phone, gender, dob, id_card_number, priority_group) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, fullName, phone, gender, dob, idCardNumber, priorityGroup]
  );

  return {
    id: result.insertId,
    user_id: userId,
    full_name: fullName,
    phone,
    gender,
    dob,
    id_card_number: idCardNumber,
    priority_group: priorityGroup
  };
}

async function getCandidateByUserId(userId) {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT * FROM candidates WHERE user_id = ?`, [userId]);
  return rows[0] || null;
}

async function getCandidateById(id) {
  const pool = getPool();
  const [rows] = await pool.execute(`SELECT * FROM candidates WHERE id = ?`, [id]);
  return rows[0] || null;
}

module.exports = { createCandidateProfile, getCandidateByUserId, getCandidateById };
