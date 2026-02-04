const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const projectController = require("./project.controller");
const validate = require("../middlewares/validation.middleware");
const {createProjectSchema,addProjectMemberSchema} = require("../validators/project.schema");


const router = express.Router();

// Protected: Create project
router.post("/", authMiddleware, validate(createProjectSchema), projectController.createProject);

// Get projects for logged-in user
router.get("/my", authMiddleware, projectController.getMyProjects);

// Add member to project (RBAC protected)
router.post(
  "/:projectId/members",
  authMiddleware,
  validate(addProjectMemberSchema),
  projectController.addProjectMember
);


module.exports = router;
