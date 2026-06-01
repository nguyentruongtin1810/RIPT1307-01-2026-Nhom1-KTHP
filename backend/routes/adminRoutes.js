const express = require("express");
const asyncHandler = require("../middlewares/asyncHandler");
const { requireAuth } = require("../middlewares/authMiddleware");
const { requireRole } = require("../middlewares/roleMiddleware");
const {
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
} = require("../controllers/adminController");

const router = express.Router();
router.use(requireAuth, requireRole("admin"));

router.get("/stats", asyncHandler(getStats));
router.get("/applications", asyncHandler(fetchApplications));
router.put("/applications/:id/status", asyncHandler(changeApplicationStatus));

router.get("/universities", asyncHandler(listUniversities));
router.post("/universities", asyncHandler(createUniversityController));
router.get("/universities/:id", asyncHandler(getUniversityController));
router.put("/universities/:id", asyncHandler(updateUniversityController));
router.delete("/universities/:id", asyncHandler(deleteUniversityController));

router.get("/majors", asyncHandler(listMajors));
router.post("/majors", asyncHandler(createMajorController));
router.get("/majors/:id", asyncHandler(getMajorController));
router.put("/majors/:id", asyncHandler(updateMajorController));
router.delete("/majors/:id", asyncHandler(deleteMajorController));

router.get("/subject-groups", asyncHandler(listSubjectGroups));
router.post("/subject-groups", asyncHandler(createSubjectGroupController));
router.get("/subject-groups/:id", asyncHandler(getSubjectGroupController));
router.put("/subject-groups/:id", asyncHandler(updateSubjectGroupController));
router.delete("/subject-groups/:id", asyncHandler(deleteSubjectGroupController));

module.exports = router;
