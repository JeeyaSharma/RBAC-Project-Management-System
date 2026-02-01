const analyticsRepository = require("../repositories/analytics.repository");
const projectRepository = require("../repositories/project.repository");
const sprintRepository = require("../repositories/sprint.repository");
const { ForbiddenError, NotFoundError } = require("../common/errors");

/**
 * Get sprint analytics (RBAC protected)
 */
const getSprintAnalytics = async ({ projectId, sprintId, userId }) => {
  // 1. Sprint must exist
  const sprint = await sprintRepository.getSprintById(sprintId);
  if (!sprint || sprint.project_id !== projectId) {
    throw new NotFoundError("Sprint not found");
  }

  // 2. User must be project member
  const membership =
    await projectRepository.getUserRoleInProject(projectId, userId);

  if (!membership) {
    throw new ForbiddenError("Access denied");
  }

  // 3. Fetch analytics
  const summary =
    await analyticsRepository.getSprintTaskSummary(sprintId);

  const userContribution =
    await analyticsRepository.getSprintUserContribution(sprintId);

  // 4. Compute derived metrics
  const completionPercentage =
    summary.total_tasks === "0"
      ? 0
      : Math.round(
          (summary.completed_tasks / summary.total_tasks) * 100
        );

  return {
    sprintId,
    summary: {
      totalTasks: Number(summary.total_tasks),
      completedTasks: Number(summary.completed_tasks),
      inProgressTasks: Number(summary.in_progress_tasks),
      blockedTasks: Number(summary.blocked_tasks),
      completionPercentage,
      totalStoryPoints: Number(summary.total_story_points),
      completedStoryPoints: Number(summary.completed_story_points)
    },
    userContribution: userContribution.map((u) => ({
      userId: u.user_id,
      completedTasks: Number(u.completed_tasks),
      completedStoryPoints: Number(u.completed_story_points)
    }))
  };
};

module.exports = {
  getSprintAnalytics
};
