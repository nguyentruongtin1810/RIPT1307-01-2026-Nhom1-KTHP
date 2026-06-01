const { getCascadingUniversityData, getUniversities, getMajors } = require("../models/universityModel");

async function getUniversityLookup(req, res) {
  const data = await getCascadingUniversityData();
  return res.json(data);
}

async function getFilterData(req, res) {
  const [universities, majors] = await Promise.all([getUniversities(), getMajors()]);
  return res.json({ universities, majors });
}

module.exports = { getUniversityLookup, getFilterData };
