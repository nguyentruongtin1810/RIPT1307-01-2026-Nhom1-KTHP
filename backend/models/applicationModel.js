const { getPool } = require("../config/db");

async function createApplication({ candidateId, majorId, subjectGroupId, scores, documentUrl }) {
  const pool = getPool();
  const [result] = await pool.execute(
    `INSERT INTO applications (candidate_id, major_id, subject_group_id, scores, document_url, status) VALUES (?, ?, ?, ?, ?, 'pending')`,
    [candidateId, majorId, subjectGroupId, JSON.stringify(scores), documentUrl || null]
  );
  return getApplicationById(result.insertId);
}

async function getApplicationById(id) {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT a.id,
            a.candidate_id,
            c.full_name AS candidate_name,
            cu.email AS candidate_email,
            u.id AS university_id,
            u.code AS university_code,
            u.name AS university,
            m.id AS major_id,
            m.code AS major_code,
            m.name AS major,
            sg.id AS subject_group_id,
            sg.code AS subject_group_code,
            sg.name AS subject_group,
            a.scores,
            a.status,
            a.rejection_reason,
            a.document_url,
            a.created_at,
            a.updated_at
     FROM applications a
     JOIN candidates c ON a.candidate_id = c.id
     JOIN users cu ON c.user_id = cu.id
     JOIN majors m ON a.major_id = m.id
     JOIN universities u ON m.university_id = u.id
     JOIN subject_groups sg ON a.subject_group_id = sg.id
     WHERE a.id = ?`,
    [id]
  );

  if (!rows.length) {
    return null;
  }

  const application = rows[0];
  application.scores = typeof application.scores === "string" ? JSON.parse(application.scores) : application.scores;
  return application;
}

async function getLatestApplicationByCandidateId(candidateId) {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT a.id,
            a.candidate_id,
            c.full_name AS candidate_name,
            cu.email AS candidate_email,
            u.id AS university_id,
            u.code AS university_code,
            u.name AS university,
            m.id AS major_id,
            m.code AS major_code,
            m.name AS major,
            sg.id AS subject_group_id,
            sg.code AS subject_group_code,
            sg.name AS subject_group,
            a.scores,
            a.status,
            a.rejection_reason,
            a.document_url,
            a.created_at,
            a.updated_at
     FROM applications a
     JOIN candidates c ON a.candidate_id = c.id
     JOIN users cu ON c.user_id = cu.id
     JOIN majors m ON a.major_id = m.id
     JOIN universities u ON m.university_id = u.id
     JOIN subject_groups sg ON a.subject_group_id = sg.id
     WHERE a.candidate_id = ?
     ORDER BY a.created_at DESC
     LIMIT 1`,
    [candidateId]
  );

  if (!rows.length) {
    return null;
  }

  const application = rows[0];
  application.scores = typeof application.scores === "string" ? JSON.parse(application.scores) : application.scores;
  return application;
}

async function getActiveApplicationByCandidateId(candidateId) {
  const pool = getPool();
  const [rows] = await pool.execute(
    `SELECT a.id,
            a.candidate_id,
            a.status
     FROM applications a
     WHERE a.candidate_id = ? AND a.status IN ('pending', 'approved')
     ORDER BY a.created_at DESC
     LIMIT 1`,
    [candidateId]
  );
  return rows[0] || null;
}

async function getApplications({ universityId, majorId, status, page = 1, pageSize = 20 }) {
  const pool = getPool();
  const conditions = [];
  const params = [];

  if (universityId) {
    conditions.push("u.id = ?");
    params.push(universityId);
  }
  if (majorId) {
    conditions.push("m.id = ?");
    params.push(majorId);
  }
  if (status) {
    conditions.push("a.status = ?");
    params.push(status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const offset = (page - 1) * pageSize;

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM applications a
     JOIN majors m ON a.major_id = m.id
     JOIN universities u ON m.university_id = u.id
     ${whereClause}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT a.id,
            c.full_name AS candidate_name,
            cu.email AS candidate_email,
            c.id AS candidate_id,
            u.id AS university_id,
            u.name AS university,
            m.id AS major_id,
            m.name AS major,
            sg.id AS subject_group_id,
            sg.name AS subject_group,
            a.scores,
            a.status,
            a.rejection_reason,
            a.document_url,
            a.created_at,
            a.updated_at
     FROM applications a
     JOIN candidates c ON a.candidate_id = c.id
     JOIN users cu ON c.user_id = cu.id
     JOIN majors m ON a.major_id = m.id
     JOIN universities u ON m.university_id = u.id
     JOIN subject_groups sg ON a.subject_group_id = sg.id
     ${whereClause}
     ORDER BY a.updated_at DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  return {
    total: countRows[0]?.total || 0,
    page,
    pageSize,
    data: rows.map((row) => ({
      ...row,
      scores: typeof row.scores === "string" ? JSON.parse(row.scores) : row.scores
    }))
  };
}

async function updateApplicationStatus(id, status, rejectionReason = null) {
  const pool = getPool();
  await pool.execute(
    `UPDATE applications SET status = ?, rejection_reason = ?, updated_at = NOW() WHERE id = ?`,
    [status, rejectionReason, id]
  );
  return getApplicationById(id);
}

module.exports = {
  createApplication,
  getLatestApplicationByCandidateId,
  getActiveApplicationByCandidateId,
  getApplications,
  updateApplicationStatus,
  getApplicationById
};
