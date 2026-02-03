const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const sprintController = require("./sprint.controller");

const router = express.Router();

// Create sprint under project
router.post(
  "/projects/:projectId/sprints",
  authMiddleware,
  sprintController.createSprint
);

// Start sprint
router.patch(
  "/projects/:projectId/sprints/:sprintId/start",
  authMiddleware,
  sprintController.startSprint
);

// Complete Sprint
router.patch(
  "/projects/:projectId/sprints/:sprintId/complete",
  authMiddleware,
  sprintController.completeSprint
);


module.exports = router;
