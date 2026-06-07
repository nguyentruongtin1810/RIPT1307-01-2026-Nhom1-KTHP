const { getCandidateByUserId, updateCandidateProfile } = require("../models/candidateModel");
const {
  createApplication,
  getLatestApplicationByCandidateId,
  getActiveApplicationByCandidateId
} = require("../models/applicationModel");

async function submitApplication(req, res) {
  const {
    universityId,
    majorId,
    subjectGroupId,
    scores,
    priority,
    documents,
    profile
  } = req.body;

  if (!universityId || !majorId || !subjectGroupId || !scores || typeof scores !== "object") {
    return res.status(400).json({ message: "Các trường bắt buộc chưa được điền đầy đủ." });
  }

  const candidate = await getCandidateByUserId(req.user.userId);
  if (!candidate) {
    return res.status(404).json({ message: "Thí sinh không tồn tại." });
  }

  const activeApplication = await getActiveApplicationByCandidateId(candidate.id);
  if (activeApplication) {
    return res.status(409).json({ message: "Bạn đang có hồ sơ đang xử lý. Không thể nộp thêm hồ sơ mới." });
  }

  if (profile && typeof profile === "object") {
    await updateCandidateProfile(req.user.userId, {
      fullName: profile.fullName || candidate.full_name,
      phone: profile.phone || candidate.phone,
      gender: profile.gender || candidate.gender,
      dob: profile.dob || candidate.dob,
      idCardNumber: profile.idCardNumber || candidate.id_card_number,
      priorityGroup: profile.priorityGroup || candidate.priority_group
    });
  }

  const application = await createApplication({
    candidateId: candidate.id,
    majorId: Number(majorId),
    subjectGroupId: Number(subjectGroupId),
    scores,
    documents: Array.isArray(documents) ? documents : []
  });

  return res.status(201).json(application);
}

async function getApplicationStatus(req, res) {
  const candidate = await getCandidateByUserId(req.user.userId);
  if (!candidate) {
    return res.status(404).json({ message: "Thí sinh không tồn tại." });
  }

  const application = await getLatestApplicationByCandidateId(candidate.id);
  if (!application) {
    return res.status(404).json({ message: "Không tìm thấy hồ sơ của thí sinh." });
  }

  return res.json(application);
}

async function getProfile(req, res) {
  const candidate = await getCandidateByUserId(req.user.userId);
  if (!candidate) {
    return res.status(404).json({ message: "Thí sinh không tồn tại." });
  }

  return res.json({
    candidateId: candidate.id,
    fullName: candidate.full_name,
    phone: candidate.phone,
    gender: candidate.gender,
    dob: candidate.dob,
    idCardNumber: candidate.id_card_number,
    priorityGroup: candidate.priority_group,
    createdAt: candidate.created_at,
    updatedAt: candidate.updated_at
  });
}

module.exports = { submitApplication, getApplicationStatus, getProfile };
