const express = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const { requireAuth } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const { submitApplication } = require("../controllers/applicationController");

const router = express.Router();
router.use(requireAuth, requireRole("student"));
router.post("/", asyncHandler(submitApplication));

module.exports = router;
