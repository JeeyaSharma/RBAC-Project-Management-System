const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const userAnalyticsController =
  require("./user_analytics.controller");

const router = express.Router();

router.get(
  "/projects/:projectId/analytics/users",
  authMiddleware,
  userAnalyticsController.getUserPerformanceAnalytics
);

module.exports = router;
