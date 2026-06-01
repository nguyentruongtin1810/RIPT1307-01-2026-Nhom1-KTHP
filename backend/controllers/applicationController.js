const { getCandidateByUserId } = require("../models/candidateModel");
const { createApplication, getActiveApplicationByCandidateId } = require("../models/applicationModel");

async function submitApplication(req, res) {
  const candidate = await getCandidateByUserId(req.user.userId);
  if (!candidate) {
    return res.status(404).json({ message: "Candidate profile not found." });
  }

  const { majorId, subjectGroupId, scores, documentUrl } = req.body;

  if (!majorId || !subjectGroupId || !scores || typeof scores !== "object") {
    return res.status(400).json({ message: "majorId, subjectGroupId, and scores are required." });
  }

  const activeApplication = await getActiveApplicationByCandidateId(candidate.id);
  if (activeApplication) {
    return res.status(409).json({ message: "An active application already exists. You cannot submit another application at this time." });
  }

  const application = await createApplication({
    candidateId: candidate.id,
    majorId: Number(majorId),
    subjectGroupId: Number(subjectGroupId),
    scores,
    documentUrl
  });

  return res.status(201).json(application);
}

module.exports = { submitApplication };
