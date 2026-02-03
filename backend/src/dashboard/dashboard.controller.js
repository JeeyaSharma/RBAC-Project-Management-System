const dashboardService = require("./dashboard.service");

/**
 * GET /projects/:projectId/dashboard
 */
const getProjectDashboard = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const dashboard =
      await dashboardService.getProjectDashboard({
        projectId,
        userId: req.user.id
      });

    return res.status(200).json({
      data: dashboard
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectDashboard
};
