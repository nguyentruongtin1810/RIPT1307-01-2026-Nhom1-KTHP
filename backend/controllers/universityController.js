const { getAllUniversities, getUniversityById } = require("../models/universityModel");
const { getMajorsByUniversityId } = require("../models/majorModel");

async function getUniversities(req, res) {
  const universities = await getAllUniversities();
  return res.json(universities);
}

async function getMajorsForUniversity(req, res) {
  const universityId = Number(req.params.univId);
  if (!universityId) {
    return res.status(400).json({ message: "Invalid university ID." });
  }

  const university = await getUniversityById(universityId);
  if (!university) {
    return res.status(404).json({ message: "University not found." });
  }

  const majors = await getMajorsByUniversityId(universityId);
  return res.json({ university, majors });
}

module.exports = { getUniversities, getMajorsForUniversity };
