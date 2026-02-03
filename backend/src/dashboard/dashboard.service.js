const dashboardRepository = require("../repositories/dashboard.repository");
const projectRepository = require("../repositories/project.repository");
const analyticsRepository = require("../repositories/analytics.repository");
const { ForbiddenError, NotFoundError } = require("../common/errors");

/**
 * Get project dashboard (RBAC protected)
 */
const getProjectDashboard = async ({ projectId, userId }) => {
  // 1. RBAC check
  const membership =
    await projectRepository.getUserRoleInProject(projectId, userId);

  if (!membership) {
    throw new ForbiddenError("Access denied");
  }

  // 2. Project must exist
  const project =
    await dashboardRepository.getProjectInfo(projectId);

  if (!project) {
    throw new NotFoundError("Project not found");
  }

  // 3. Fetch dashboard data in parallel
  const [
    activeSprint,
    taskSummary,
    members,
    activity
  ] = await Promise.all([
    dashboardRepository.getActiveSprint(projectId),
    dashboardRepository.getTaskSummary(projectId),
    dashboardRepository.getProjectMembers(projectId),
    dashboardRepository.getRecentActivity(projectId)
  ]);

  // 4. Sprint analytics (if active sprint exists)
  let sprintAnalytics = null;
  if (activeSprint) {
    sprintAnalytics =
      await analyticsRepository.getSprintTaskSummary(
        activeSprint.id
      );
  }

  return {
    project,
    userRole: membership.role,
    activeSprint,
    sprintAnalytics: sprintAnalytics
      ? {
          totalTasks: Number(sprintAnalytics.total_tasks),
          completedTasks: Number(sprintAnalytics.completed_tasks),
          completionPercentage:
            sprintAnalytics.total_tasks === "0"
              ? 0
              : Math.round(
                  (sprintAnalytics.completed_tasks /
                    sprintAnalytics.total_tasks) *
                    100
                )
        }
      : null,
    taskSummary: {
      total: Number(taskSummary.total),
      todo: Number(taskSummary.todo),
      inProgress: Number(taskSummary.in_progress),
      done: Number(taskSummary.done),
      blocked: Number(taskSummary.blocked)
    },
    members,
    recentActivity: activity
  };
};

module.exports = {
  getProjectDashboard
};
