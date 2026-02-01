const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const projectController = require("./project.controller");

const router = express.Router();

// Protected: Create project
router.post("/", authMiddleware, projectController.createProject);

// Get projects for logged-in user
router.get("/my", authMiddleware, projectController.getMyProjects);

// Add member to project (RBAC protected)
router.post(
  "/:projectId/members",
  authMiddleware,
  projectController.addProjectMember
);


module.exports = router;
