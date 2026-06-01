const express = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const { requireAuth } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { getStudentDashboard, getMyApplicationStatus } = require("../controllers/studentController");

const router = express.Router();
router.use(requireAuth, requireRole("student"));
router.get("/dashboard", asyncHandler(getStudentDashboard));
router.get("/application/my-status", asyncHandler(getMyApplicationStatus));

module.exports = router;
