const userRepository = require("../repositories/user.repository");

const getMyProfile = async (userId) => {
	const [user, summary, projectBreakdown, recentTasks, recentActivity] = await Promise.all([
		userRepository.findById(userId),
		userRepository.getProfileSummary(userId),
		userRepository.getProjectPerformance(userId),
		userRepository.getRecentAssignedTasks(userId),
		userRepository.getRecentUserActivity(userId)
	]);

	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			publicId: user.public_id,
			createdAt: user.created_at
		},
		summary: {
			projectsCount: Number(summary.projects_count),
			assignedTasks: Number(summary.assigned_tasks),
			completedTasks: Number(summary.completed_tasks),
			inProgressTasks: Number(summary.in_progress_tasks),
			blockedTasks: Number(summary.blocked_tasks),
			storyPointsAssigned: Number(summary.story_points_assigned),
			storyPointsCompleted: Number(summary.story_points_completed),
			totalActions: Number(summary.total_actions),
			lastActivityAt: summary.last_activity_at
		},
		projectBreakdown: projectBreakdown.map((row) => ({
			projectId: row.project_id,
			projectName: row.project_name,
			role: row.role,
			tasksAssigned: Number(row.tasks_assigned),
			tasksCompleted: Number(row.tasks_completed),
			tasksInProgress: Number(row.tasks_in_progress),
			tasksBlocked: Number(row.tasks_blocked),
			storyPointsAssigned: Number(row.story_points_assigned),
			storyPointsCompleted: Number(row.story_points_completed),
			totalActions: Number(row.total_actions),
			lastActivityAt: row.last_activity_at
		})),
		recentTasks: recentTasks.map((task) => ({
			id: task.id,
			title: task.title,
			status: task.status,
			storyPoints: task.story_points,
			updatedAt: task.updated_at,
			projectId: task.project_id,
			projectName: task.project_name
		})),
		recentActivity: recentActivity.map((item) => ({
			projectId: item.project_id,
			projectName: item.project_name,
			entityType: item.entity_type,
			entityId: item.entity_id,
			action: item.action,
			metadata: item.metadata,
			createdAt: item.created_at
		}))
	};
};

const searchUsers = async ({ query, requesterId }) => {
	return userRepository.searchUsers({
		query,
		limit: 8,
		excludeUserId: requesterId
	});
};

module.exports = {
	getMyProfile,
	searchUsers
};
