const sprintService = require("./sprint.service");

/**
 * POST /projects/:projectId/sprints
 */
const createSprint = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { name, goal, startDate, endDate } = req.body;

    const sprint = await sprintService.createSprint({
      projectId,
      userId: req.user.id,
      name,
      goal,
      startDate,
      endDate
    });

    return res.status(201).json({
      data: sprint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /projects/:projectId/sprints/:sprintId/start
 */
const startSprint = async (req, res, next) => {
  try {
    const { projectId, sprintId } = req.params;

    const sprint = await sprintService.startSprint({
      projectId,
      sprintId,
      userId: req.user.id
    });

    return res.status(200).json({
      data: sprint
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /projects/:projectId/sprints/:sprintId/complete
 */
const completeSprint = async (req, res, next) => {
  try {
    const { projectId, sprintId } = req.params;

    const sprint = await sprintService.completeSprint({
      projectId,
      sprintId,
      userId: req.user.id
    });

    return res.status(200).json({
      data: sprint
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSprint,
  startSprint,
  completeSprint
};
