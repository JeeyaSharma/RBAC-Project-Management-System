const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const analyticsController = require("./analytics.controller");

const router = express.Router();

router.get(
  "/projects/:projectId/sprints/:sprintId/analytics",
  authMiddleware,
  analyticsController.getSprintAnalytics
);

module.exports = router;
