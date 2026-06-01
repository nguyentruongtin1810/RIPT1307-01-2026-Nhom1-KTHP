const express = require("express");
const { getUniversityLookup, getFilterData } = require("../controllers/publicController");

const router = express.Router();
router.get("/university-data", getUniversityLookup);
router.get("/filters", getFilterData);

module.exports = router;
