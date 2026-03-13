const projectRepository = require("../repositories/project.repository");
const userAnalyticsRepository =
  require("../repositories/user_analytics.repository");
const { ForbiddenError } = require("../common/errors");

/**
 * Get user performance analytics for project
 */
const getUserPerformanceAnalytics = async ({ projectId, userId }) => {
  // 1. RBAC check
  const membership =
    await projectRepository.getUserRoleInProject(projectId, userId);

  if (!membership) {
    throw new ForbiddenError("Access denied");
  }

  // 2. Fetch metrics in parallel
  const [taskMetrics, activityMetrics] = await Promise.all([
    userAnalyticsRepository.getUserTaskMetrics(projectId),
    userAnalyticsRepository.getUserActivityMetrics(projectId)
  ]);

  // 3. Merge metrics by user
  const activityMap = {};
  for (const a of activityMetrics) {
    activityMap[a.user_id] = a;
  }

  return taskMetrics.map((u) => ({
    userId: u.user_id,
    publicUserId: u.user_public_id,
    userName: u.user_name,
    role: u.role,
    tasksAssigned: Number(u.tasks_assigned),
    tasksCompleted: Number(u.tasks_completed),
    tasksInProgress: Number(u.tasks_in_progress),
    storyPointsAssigned: Number(u.story_points_assigned),
    storyPointsCompleted: Number(u.story_points_completed),
    totalActions: activityMap[u.user_id]
      ? Number(activityMap[u.user_id].total_actions)
      : 0,
    lastActivityAt: activityMap[u.user_id]
      ? activityMap[u.user_id].last_activity_at
      : null
  }));
};

module.exports = {
  getUserPerformanceAnalytics
};
