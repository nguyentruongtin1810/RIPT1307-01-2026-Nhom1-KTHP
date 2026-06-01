const express = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const { requireAuth } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { getSubjectGroupsByMajor } = require("../controllers/majorController");

const router = express.Router();
router.use(requireAuth, requireRole("student"));
router.get("/:majorId/subject-groups", asyncHandler(getSubjectGroupsByMajor));

module.exports = router;
