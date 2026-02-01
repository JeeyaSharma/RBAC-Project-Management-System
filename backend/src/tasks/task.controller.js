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
      assigneeId
    } = req.body;

    if (!title) {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Task title is required"
      });
    }

    const task = await taskService.createTask({
      projectId,
      userId: req.user.id,
      title,
      description,
      storyPoints,
      sprintId,
      assigneeId
    });

    return res.status(201).json({
      message: "Task created successfully",
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
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Status is required"
      });
    }

    const updatedTask = await taskService.updateTaskStatus({
      projectId,
      taskId,
      userId: req.user.id,
      newStatus: status
    });

    return res.status(200).json({
      message: "Task status updated successfully",
      data: updatedTask
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  createTask,
  updateTaskStatus
};
