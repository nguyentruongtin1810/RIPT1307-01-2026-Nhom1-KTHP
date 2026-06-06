const {
  getCandidateByUserId
} = require("../models/candidateModel");
const {
  createApplication,
  getLatestApplicationByCandidateId
} = require("../models/applicationModel");
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

  if (!universityId || !majorId || !subjectGroupId || scoreMath == null || scoreLiterature == null || scoreEnglish == null) {
    return res.status(400).json({ message: "Các trường bắt buộc chưa được điền đầy đủ." });
  }

  const candidate =
  await getCandidateByUserId(
    req.user.userId
  );
  if (!candidate) {
    return res.status(404).json({ message: "Thí sinh không tồn tại." });
  }

  const application =
  await createApplication({
    candidateId: candidate.id,

    majorId,
    subjectGroupId,

    scores: {
      Math: scoreMath,
      Literature: scoreLiterature,
      English: scoreEnglish
    },

    documentUrl:
      Array.isArray(documents)
        ? documents[0]
        : null
  });

  return res.status(201).json(application);
}

async function getApplicationStatus(req, res) {
  const candidate =
  await getCandidateByUserId(
    req.user.userId
  );

  if (!candidate) {
    return res.status(404).json({ message: "Thí sinh không tồn tại." });
  }

  const application =
  await getLatestApplicationByCandidateId(
    candidate.id
  );
  if (!application) {
    return res.status(404).json({ message: "Không tìm thấy hồ sơ của thí sinh." });
  }

  return res.json(application);
}

async function getProfile(req, res) {
  const candidate =
  await getCandidateByUserId(
    req.user.userId
  );
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
