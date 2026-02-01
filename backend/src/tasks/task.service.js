const taskRepository = require("../repositories/task.repository");
const projectRepository = require("../repositories/project.repository");
const sprintRepository = require("../repositories/sprint.repository");
const activityRepository = require("../repositories/activity.repository");
const { ForbiddenError, NotFoundError, AppError } = require("../common/errors");

/**
 * Create task (RBAC protected)
 */
const createTask = async ({
  projectId,
  userId,
  title,
  description,
  storyPoints,
  sprintId,
  assigneeId
}) => {
  // 1. Project must exist
  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  // 2. User must be project member
  const membership =
    await projectRepository.getUserRoleInProject(projectId, userId);

  if (
    !membership ||
    !["OWNER", "PROJECT_MANAGER", "DEVELOPER"].includes(membership.role)
  ) {
    throw new ForbiddenError(
      "You do not have permission to create tasks"
    );
  }

  // 3. Validate sprint (if provided)
  if (sprintId) {
    const sprint = await sprintRepository.getSprintById(sprintId);

    if (!sprint || sprint.project_id !== projectId) {
      throw new AppError(
        "Invalid sprint for this project",
        400,
        "INVALID_SPRINT"
      );
    }
  }

  // 4. Create task
  return taskRepository.createTask({
    projectId,
    sprintId,
    title,
    description,
    storyPoints,
    assigneeId,
    createdBy: userId
  });
};

/**
 * Update task status (RBAC + workflow)
 */
const updateTaskStatus = async ({
  projectId,
  taskId,
  userId,
  newStatus
}) => {
  // 1. Fetch task
  const task = await taskRepository.getTaskById(taskId);
  if (!task || task.project_id !== projectId) {
    throw new NotFoundError("Task not found in this project");
  }

  // 2. RBAC check
  const membership =
    await projectRepository.getUserRoleInProject(projectId, userId);

  if (
    !membership ||
    !["OWNER", "PROJECT_MANAGER", "DEVELOPER"].includes(membership.role)
  ) {
    throw new ForbiddenError(
      "You do not have permission to update task status"
    );
  }

  // 3. Validate status
  const allowedStatuses = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED"];
  if (!allowedStatuses.includes(newStatus)) {
    throw new AppError("Invalid task status", 400, "INVALID_STATUS");
  }

  // 4. Validate transition
  const invalidTransitions = {
    DONE: ["TODO"],
    TODO: ["DONE"]
  };

  if (
    invalidTransitions[task.status] &&
    invalidTransitions[task.status].includes(newStatus)
  ) {
    throw new AppError(
      `Invalid status transition from ${task.status} to ${newStatus}`,
      400,
      "INVALID_TRANSITION"
    );
  }

  // 5. Update status
  const updatedTask =
    await taskRepository.updateTaskStatus(taskId, newStatus);

  // 6. Log activity
  await activityRepository.logActivity({
    projectId,
    userId,
    entityType: "TASK",
    entityId: taskId,
    action: "STATUS_UPDATED",
    metadata: {
      from: task.status,
      to: newStatus
    }
  });

  return updatedTask;
};

module.exports = {
  createTask,
  updateTaskStatus
};
