const express = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const { requireAuth } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { getUniversities, getMajorsForUniversity } = require("../controllers/universityController");

const router = express.Router();
router.use(requireAuth, requireRole("student"));
router.get("/", asyncHandler(getUniversities));
router.get("/:univId/majors", asyncHandler(getMajorsForUniversity));

module.exports = router;
