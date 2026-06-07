const { getTotalApplications, getApplicationCountByStatus, getApplicationCountByMajorAndUniversity } = require("../models/statsModel");
const {
  getApplications,
  updateApplicationStatus,
  getApplicationById
} = require("../models/applicationModel");
const {
  getAllUniversities,
  getUniversityById,
  createUniversity,
  updateUniversity,
  deleteUniversity
} = require("../models/universityModel");
const {
  getAllMajors,
  getMajorById,
  createMajor,
  updateMajor,
  deleteMajor,
  getSubjectGroupIdsByMajorId
} = require("../models/majorModel");
const {
  getAllSubjectGroups,
  getSubjectGroupById,
  createSubjectGroup,
  updateSubjectGroup,
  deleteSubjectGroup
} = require("../models/subjectGroupModel");
const { sendApplicationStatusChangeEmail } = require("../services/emailService");

async function getStats(req, res) {
  const [totalApplications, statusCounts, majorUniversityCounts] = await Promise.all([
    getTotalApplications(),
    getApplicationCountByStatus(),
    getApplicationCountByMajorAndUniversity()
  ]);

  return res.json({ totalApplications, statusCounts, majorUniversityCounts });
}

async function fetchApplications(req, res) {
  const { university_id, major_id, status, page, pageSize } = req.query;
  const filters = {
    universityId: university_id ? Number(university_id) : undefined,
    majorId: major_id ? Number(major_id) : undefined,
    status: status || undefined,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20
  };

  const applications = await getApplications(filters);
  return res.json(applications);
}

async function changeApplicationStatus(req, res) {
  const applicationId = Number(req.params.id);
  const { status, rejection_reason } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be either approved or rejected." });
  }

  if (status === "rejected" && !rejection_reason) {
    return res.status(400).json({ message: "rejection_reason is required when rejecting an application." });
  }

  const application = await updateApplicationStatus(applicationId, status, rejection_reason || null);
  if (!application) {
    return res.status(404).json({ message: "Application not found." });
  }

  try {
    await sendApplicationStatusChangeEmail(application.candidate_email, application.candidate_name, status, application.id);
  } catch (error) {
    console.error("Email send failed", error);
  }

  return res.json(application);
}

async function listUniversities(req, res) {
  const universities = await getAllUniversities();
  return res.json(universities);
}

async function createUniversityController(req, res) {
  const { code, name, logoUrl } = req.body;
  if (!code || !name) {
    return res.status(400).json({ message: "code and name are required." });
  }

  const university = await createUniversity({ code, name, logoUrl });
  return res.status(201).json(university);
}

async function getUniversityController(req, res) {
  const id = Number(req.params.id);
  const university = await getUniversityById(id);
  if (!university) {
    return res.status(404).json({ message: "University not found." });
  }
  return res.json(university);
}

async function updateUniversityController(req, res) {
  const id = Number(req.params.id);
  const { code, name, logoUrl } = req.body;

  const university = await getUniversityById(id);
  if (!university) {
    return res.status(404).json({ message: "University not found." });
  }

  const updated = await updateUniversity(id, { code: code || university.code, name: name || university.name, logoUrl: logoUrl !== undefined ? logoUrl : university.logo_url });
  return res.json(updated);
}

async function deleteUniversityController(req, res) {
  const id = Number(req.params.id);
  const university = await getUniversityById(id);
  if (!university) {
    return res.status(404).json({ message: "University not found." });
  }

  await deleteUniversity(id);
  return res.status(204).send();
}

async function listMajors(req, res) {
  const { university_id } = req.query;
  const filter = {
    universityId: university_id ? Number(university_id) : undefined
  };
  const majors = await getAllMajors(filter);
  const majorsWithGroups = await Promise.all(
    majors.map(async (major) => ({
      ...major,
      subjectGroupIds: await getSubjectGroupIdsByMajorId(major.id)
    }))
  );
  return res.json(majorsWithGroups);
}

async function createMajorController(req, res) {
  const { code, name, quota, universityId, subjectGroupIds } = req.body;
  if (!code || !name || !universityId) {
    return res.status(400).json({ message: "code, name, and universityId are required." });
  }

  const major = await createMajor({
    code,
    name,
    quota: Number(quota) || 0,
    universityId: Number(universityId),
    subjectGroupIds: Array.isArray(subjectGroupIds) ? subjectGroupIds.map(Number) : []
  });

  return res.status(201).json(major);
}

async function getMajorController(req, res) {
  const id = Number(req.params.id);
  const major = await getMajorById(id);
  if (!major) {
    return res.status(404).json({ message: "Major not found." });
  }
  const subjectGroupIds = await getSubjectGroupIdsByMajorId(id);
  return res.json({ ...major, subjectGroupIds });
}

async function updateMajorController(req, res) {
  const id = Number(req.params.id);
  const { code, name, quota, universityId, subjectGroupIds } = req.body;
  const major = await getMajorById(id);
  if (!major) {
    return res.status(404).json({ message: "Major not found." });
  }

  const updated = await updateMajor(id, {
    code: code || major.code,
    name: name || major.name,
    quota: quota !== undefined ? Number(quota) : major.quota,
    universityId: universityId ? Number(universityId) : major.university_id,
    subjectGroupIds: subjectGroupIds === undefined ? undefined : Array.isArray(subjectGroupIds) ? subjectGroupIds.map(Number) : []
  });

  return res.json(updated);
}

async function deleteMajorController(req, res) {
  const id = Number(req.params.id);
  const major = await getMajorById(id);
  if (!major) {
    return res.status(404).json({ message: "Major not found." });
  }

  await deleteMajor(id);
  return res.status(204).send();
}

async function listSubjectGroups(req, res) {
  const subjectGroups = await getAllSubjectGroups();
  return res.json(subjectGroups);
}

async function createSubjectGroupController(req, res) {
  const { code, name } = req.body;
  if (!code || !name) {
    return res.status(400).json({ message: "code and name are required." });
  }

  const subjectGroup = await createSubjectGroup({ code, name });
  return res.status(201).json(subjectGroup);
}

async function getSubjectGroupController(req, res) {
  const id = Number(req.params.id);
  const subjectGroup = await getSubjectGroupById(id);
  if (!subjectGroup) {
    return res.status(404).json({ message: "Subject group not found." });
  }
  return res.json(subjectGroup);
}

async function updateSubjectGroupController(req, res) {
  const id = Number(req.params.id);
  const { code, name } = req.body;
  const subjectGroup = await getSubjectGroupById(id);
  if (!subjectGroup) {
    return res.status(404).json({ message: "Subject group not found." });
  }

  const updated = await updateSubjectGroup(id, {
    code: code || subjectGroup.code,
    name: name || subjectGroup.name
  });
  return res.json(updated);
}

async function deleteSubjectGroupController(req, res) {
  const id = Number(req.params.id);
  const subjectGroup = await getSubjectGroupById(id);
  if (!subjectGroup) {
    return res.status(404).json({ message: "Subject group not found." });
  }

  await deleteSubjectGroup(id);
  return res.status(204).send();
}

module.exports = {
  getStats,
  fetchApplications,
  changeApplicationStatus,
  listUniversities,
  createUniversityController,
  getUniversityController,
  updateUniversityController,
  deleteUniversityController,
  listMajors,
  createMajorController,
  getMajorController,
  updateMajorController,
  deleteMajorController,
  listSubjectGroups,
  createSubjectGroupController,
  getSubjectGroupController,
  updateSubjectGroupController,
  deleteSubjectGroupController
};
