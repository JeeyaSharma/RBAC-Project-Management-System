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

module.exports = router;
