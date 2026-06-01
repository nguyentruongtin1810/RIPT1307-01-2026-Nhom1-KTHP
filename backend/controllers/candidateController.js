const { findCandidateById } = require("../models/candidateModel");
const { createApplication, getApplicationByCandidateId } = require("../models/applicationModel");

async function submitApplication(req, res) {
  const {
    universityId,
    majorId,
    subjectGroupId,
    scoreMath,
    scoreLiterature,
    scoreEnglish,
    priority,
    documents
  } = req.body;
  const candidateId = req.user.userId;

  if (!universityId || !majorId || !subjectGroupId || scoreMath == null || scoreLiterature == null || scoreEnglish == null) {
    return res.status(400).json({ message: "Các trường bắt buộc chưa được điền đầy đủ." });
  }

  const candidate = await findCandidateById(candidateId);
  if (!candidate) {
    return res.status(404).json({ message: "Thí sinh không tồn tại." });
  }

  const application = await createApplication({
    candidateId,
    universityId,
    majorId,
    subjectGroupId,
    scoreMath,
    scoreLiterature,
    scoreEnglish,
    priority: priority || "None",
    documents: Array.isArray(documents) ? documents : []
  });

  return res.status(201).json(application);
}

async function getApplicationStatus(req, res) {
  const candidateId = req.user.userId;
  const candidate = await findCandidateById(candidateId);

  if (!candidate) {
    return res.status(404).json({ message: "Thí sinh không tồn tại." });
  }

  const application = await getApplicationByCandidateId(candidateId);
  if (!application) {
    return res.status(404).json({ message: "Không tìm thấy hồ sơ của thí sinh." });
  }

  return res.json(application);
}

async function getProfile(req, res) {
  const candidateId = req.user.userId;
  const candidate = await findCandidateById(candidateId);
  if (!candidate) {
    return res.status(404).json({ message: "Thí sinh không tồn tại." });
  }
  return res.json({
    candidateId: candidate.candidate_id,
    fullName: candidate.full_name,
    email: candidate.email,
    phone: candidate.phone,
    address: candidate.address,
    createdAt: candidate.created_at
  });
}

module.exports = { submitApplication, getApplicationStatus, getProfile };
