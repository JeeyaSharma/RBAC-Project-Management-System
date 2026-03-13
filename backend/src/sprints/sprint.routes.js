const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const sprintController = require("./sprint.controller");
const validate = require("../middlewares/validation.middleware");
const {createSprintSchema,startSprintSchema,completeSprintSchema} = require("../validators/sprint.schema");

const router = express.Router();

// Get sprints under project
router.get(
  "/projects/:projectId/sprints",
  authMiddleware,
  sprintController.getProjectSprints
);

// Create sprint under project
router.post(
  "/projects/:projectId/sprints",
  authMiddleware,
  validate(createSprintSchema),
  sprintController.createSprint
);

// Start sprint
router.patch(
  "/projects/:projectId/sprints/:sprintId/start",
  authMiddleware,
  validate(startSprintSchema),
  sprintController.startSprint
);

// Complete Sprint
router.patch(
  "/projects/:projectId/sprints/:sprintId/complete",
  authMiddleware,
  validate(completeSprintSchema),
  sprintController.completeSprint
);


module.exports = router;
