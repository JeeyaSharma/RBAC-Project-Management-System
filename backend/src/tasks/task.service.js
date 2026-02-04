const taskRepository = require("../repositories/task.repository");
const projectRepository = require("../repositories/project.repository");
const sprintRepository = require("../repositories/sprint.repository");
const activityLogService = require("../logs/activityLog.service");
const { ForbiddenError, NotFoundError, AppError } = require("../common/errors");
const { PROJECT_ROLES } = require("../constants/roles");
const {TASK_STATUS_ARRAY, TASK_INVALID_TRANSITIONS} = require("../constants/taskStatus");

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
    // !["OWNER", "PROJECT_MANAGER", "DEVELOPER"].includes(membership.role)
    ![
      PROJECT_ROLES.OWNER,
      PROJECT_ROLES.PROJECT_MANAGER,
      PROJECT_ROLES.DEVELOPER
    ].includes(membership.role)
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
  const task =  await taskRepository.createTask({
    projectId,
    sprintId,
    title,
    description,
    storyPoints,
    assigneeId,
    createdBy: userId
  });

  await activityLogService.logActivity({
    projectId,
    userId,
    entityType: "TASK",
    entityId: task.id,
    action: "CREATED",
    metadata: {
      sprintId,
      assigneeId
    }
  });

  return task;
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
  // const allowedStatuses = ["TODO", "IN_PROGRESS", "DONE", "BLOCKED"];
  // if (!allowedStatuses.includes(newStatus)) {
  //   throw new AppError("Invalid task status", 400, "INVALID_STATUS");
  // }
  if (!TASK_STATUS_ARRAY.includes(newStatus)) {
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
  await activityLogService.logActivity({
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

/**
 * Get tasks for project (RBAC protected)
 */
const getProjectTasks = async ({
  projectId,
  userId,
  status,
  assigneeId,
  page,
  limit
}) => {
  const membership =
    await projectRepository.getUserRoleInProject(projectId, userId);

  if (!membership) {
    throw new ForbiddenError("Access denied");
  }
  const offset = (page - 1) * limit;
  return taskRepository.getTasksByProject({
    projectId,
    status,
    assigneeId
  });
};

/**
 * Get tasks for sprint
 */
const getSprintTasks = async ({ projectId, sprintId, userId }) => {
  const membership =
    await projectRepository.getUserRoleInProject(projectId, userId);

  if (!membership) {
    throw new ForbiddenError("Access denied");
  }

  const sprint = await sprintRepository.getSprintById(sprintId);
  if (!sprint || sprint.project_id !== projectId) {
    throw new NotFoundError("Sprint not found");
  }

  return taskRepository.getTasksBySprint(sprintId);
};

/**
 * Get single task details
 */
const getTaskById = async ({ taskId, userId }) => {
  const task = await taskRepository.getTaskDetailById(taskId);
  if (!task) {
    throw new NotFoundError("Task not found");
  }

  const membership =
    await projectRepository.getUserRoleInProject(task.project_id, userId);

  if (!membership) {
    throw new ForbiddenError("Access denied");
  }

  return task;
};

/**
 * Update task details (RBAC protected)
 */
const updateTask = async ({
  projectId,
  taskId,
  userId,
  title,
  description,
  storyPoints,
  assigneeId,
  sprintId
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
      "You do not have permission to update tasks"
    );
  }

  // 3. Validate sprint move (if provided)
  if (sprintId !== undefined) {
    if (sprintId === null) {
      // moving task back to backlog → allowed
    } else {
      const sprint = await sprintRepository.getSprintById(sprintId);
      if (!sprint || sprint.project_id !== projectId) {
        throw new AppError(
          "Invalid sprint for this project",
          400,
          "INVALID_SPRINT"
        );
      }
    }
  }

  // 4. Prepare fields
  const updatedTask = await taskRepository.updateTask(taskId, {
    title,
    description,
    story_points: storyPoints,
    assignee_id: assigneeId,
    sprint_id: sprintId
  });

  if (!updatedTask) {
    throw new AppError("No fields to update", 400, "NO_UPDATES");
  }

  await activityLogService.logActivity({
    projectId,
    userId,
    entityType: "TASK",
    entityId: taskId,
    action: "UPDATED",
    metadata: {
      title,
      description,
      storyPoints,
      assigneeId,
      sprintId
    }
  });

  return updatedTask;
};


module.exports = {
  createTask,
  updateTaskStatus,
  getProjectTasks,
  getSprintTasks,
  getTaskById,
  updateTask
};
