const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const taskController = require("./task.controller");
const validate = require("../middlewares/validation.middleware");
const {createTaskSchema,updateTaskStatusSchema,updateTaskSchema} = require("../validators/task.schema");
const {paginationQuerySchema} = require("../validators/pagination.schema");

const router = express.Router();

// Create task (backlog or sprint)
router.post(
  "/projects/:projectId/tasks",
  authMiddleware,
  validate(createTaskSchema),
  taskController.createTask
);

// Update task status
router.patch(
  "/projects/:projectId/tasks/:taskId/status",
  authMiddleware,
  validate(updateTaskStatusSchema),
  taskController.updateTaskStatus
);

// Get tasks for project (with filters)
router.get(
  "/projects/:projectId/tasks",
  authMiddleware,
  validate(paginationQuerySchema, "query"),
  taskController.getProjectTasks
);

// Get tasks for sprint
router.get(
  "/projects/:projectId/sprints/:sprintId/tasks",
  authMiddleware,
  validate(paginationQuerySchema, "query"),
  taskController.getSprintTasks
);

// Get single task
router.get(
  "/tasks/:taskId",
  authMiddleware,
  taskController.getTaskById
);

// Update task details
router.patch(
  "/projects/:projectId/tasks/:taskId",
  authMiddleware,
  validate(updateTaskSchema),
  taskController.updateTask
);


module.exports = router;
