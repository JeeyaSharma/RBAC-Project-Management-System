const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const taskController = require("./task.controller");

const router = express.Router();

// Create task (backlog or sprint)
router.post(
  "/projects/:projectId/tasks",
  authMiddleware,
  taskController.createTask
);

// Update task status
router.patch(
  "/projects/:projectId/tasks/:taskId/status",
  authMiddleware,
  taskController.updateTaskStatus
);


module.exports = router;
