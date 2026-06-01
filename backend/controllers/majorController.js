const { getSubjectGroupsByMajorId } = require("../models/subjectGroupModel");
const { getMajorById } = require("../models/majorModel");

async function getSubjectGroupsByMajor(req, res) {
  const majorId = Number(req.params.majorId);
  if (!majorId) {
    return res.status(400).json({ message: "Invalid major ID." });
  }

  const major = await getMajorById(majorId);
  if (!major) {
    return res.status(404).json({ message: "Major not found." });
  }

  const subjectGroups = await getSubjectGroupsByMajorId(majorId);
  return res.json({ major, subjectGroups });
}

module.exports = { getSubjectGroupsByMajor };
