const analyticsService = require("./analytics.service");

/**
 * GET /projects/:projectId/sprints/:sprintId/analytics
 */
const getSprintAnalytics = async (req, res, next) => {
  try {
    const { projectId, sprintId } = req.params;

    const analytics =
      await analyticsService.getSprintAnalytics({
        projectId,
        sprintId,
        userId: req.user.id
      });

    return res.status(200).json({
      data: analytics
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSprintAnalytics
};
