const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const dashboardController = require("./dashboard.controller");

const router = express.Router();

router.get(
  "/projects/:projectId/dashboard",
  authMiddleware,
  dashboardController.getProjectDashboard
);

module.exports = router;
