const { getCandidateByUserId } = require("../models/candidateModel");
const { getLatestApplicationByCandidateId } = require("../models/applicationModel");

async function getStudentDashboard(req, res) {
  const candidate = await getCandidateByUserId(req.user.userId);
  if (!candidate) {
    return res.status(404).json({ message: "Candidate profile not found." });
  }

  const application = await getLatestApplicationByCandidateId(candidate.id);
  const status = application ? application.status : "none";
  const statusBadge = {
    pending: { label: "Pending", color: "orange" },
    approved: { label: "Approved", color: "green" },
    rejected: { label: "Rejected", color: "red" },
    none: { label: "No application", color: "grey" }
  }[status] || { label: "Unknown", color: "default" };

  const schedule = [
    { stage: "Application opens", date: "2026-06-01", completed: true },
    { stage: "Application deadline", date: "2026-07-15", completed: false },
    { stage: "Shortlist announcement", date: "2026-08-01", completed: false },
    { stage: "Final admission decision", date: "2026-08-10", completed: false }
  ];

  return res.json({
    candidate: {
      id: candidate.id,
      fullName: candidate.full_name,
      phone: candidate.phone,
      email: req.user.email,
      priorityGroup: candidate.priority_group
    },
    application: application || null,
    applicationStatus: status,
    statusBadge,
    schedule
  });
}

async function getMyApplicationStatus(req, res) {
  const candidate = await getCandidateByUserId(req.user.userId);
  if (!candidate) {
    return res.status(404).json({ message: "Candidate profile not found." });
  }

  const application = await getLatestApplicationByCandidateId(candidate.id);
  if (!application) {
    return res.status(404).json({ message: "No application found for this student." });
  }

  const timeline = [
    { stage: "Submitted", completed: true, timestamp: application.created_at },
    { stage: "Under review", completed: application.status !== "pending", timestamp: application.updated_at },
    { stage: "Decision made", completed: application.status !== "pending", timestamp: application.updated_at }
  ];

  return res.json({
    application,
    timeline,
    rejectionReason: application.rejection_reason || null
  });
}

module.exports = { getStudentDashboard, getMyApplicationStatus };
