const express = require("express");
const { submitApplication, getApplicationStatus, getProfile } = require("../controllers/candidateController");
const { requireAuth, requireRole } = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(requireAuth, requireRole("student"));
router.post("/application", submitApplication);
router.get("/application", getApplicationStatus);
router.get("/profile", getProfile);

module.exports = router;
