const userAnalyticsService =
  require("./user_analytics.service");

/**
 * GET /projects/:projectId/analytics/users
 */
const getUserPerformanceAnalytics = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const analytics =
      await userAnalyticsService.getUserPerformanceAnalytics({
        projectId,
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
  getUserPerformanceAnalytics
};
