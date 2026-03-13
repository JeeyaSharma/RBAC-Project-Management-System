const taskService = require("./task.service");

/**
 * POST /projects/:projectId/tasks
 */
const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const {
      title,
      description,
      storyPoints,
      sprintId,
      assigneeId,
      assigneeIdentifier
    } = req.body;

    const task = await taskService.createTask({
      projectId,
      userId: req.user.id,
      title,
      description,
      storyPoints,
      sprintId,
      assigneeId,
      assigneeIdentifier
    });

    return res.status(201).json({
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /projects/:projectId/tasks/:taskId/status
 */
const updateTaskStatus = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const { newStatus, status } = req.body;

    const updatedTask = await taskService.updateTaskStatus({
      projectId,
      taskId,
      userId: req.user.id,
      newStatus: newStatus || status
    });

    return res.status(200).json({
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /projects/:projectId/tasks
 */
const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { status, assigneeId, page, limit } = req.query;

    const result = await taskService.getProjectTasks({
      projectId,
      userId: req.user.id,
      status,
      assigneeId,
      page,
      limit
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /projects/:projectId/sprints/:sprintId/tasks
 */
const getSprintTasks = async (req, res, next) => {
  try {
    const { projectId, sprintId } = req.params;
    const { page, limit } = req.query;

    const result = await taskService.getSprintTasks({
      projectId,
      sprintId,
      userId: req.user.id,
      page,
      limit
    });

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /tasks/:taskId
 */
const getTaskById = async (req, res, next) => {
  try {
    const { taskId } = req.params;

    const task = await taskService.getTaskById({
      taskId,
      userId: req.user.id
    });

    return res.status(200).json({
      data: task
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /projects/:projectId/tasks/:taskId
 */
const updateTask = async (req, res, next) => {
  try {
    const { projectId, taskId } = req.params;
    const {
      title,
      description,
      storyPoints,
      assigneeId,
      assigneeIdentifier,
      sprintId
    } = req.body;

    const task = await taskService.updateTask({
      projectId,
      taskId,
      userId: req.user.id,
      title,
      description,
      storyPoints,
      assigneeId,
      assigneeIdentifier,
      sprintId
    });

    return res.status(200).json({
      data: task
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  updateTaskStatus,
  getProjectTasks,
  getSprintTasks,
  getTaskById,
  updateTask
};
