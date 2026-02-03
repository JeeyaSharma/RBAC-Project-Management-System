const pool = require("../config/db");

/**
 * Task-based user metrics
 */
const getUserTaskMetrics = async (projectId) => {
  const query = `
    SELECT
      pm.user_id,
      pm.role,
      COUNT(t.id) FILTER (WHERE t.assignee_id = pm.user_id) AS tasks_assigned,
      COUNT(t.id) FILTER (
        WHERE t.assignee_id = pm.user_id AND t.status = 'DONE'
      ) AS tasks_completed,
      COUNT(t.id) FILTER (
        WHERE t.assignee_id = pm.user_id AND t.status = 'IN_PROGRESS'
      ) AS tasks_in_progress,
      COALESCE(SUM(t.story_points) FILTER (
        WHERE t.assignee_id = pm.user_id
      ), 0) AS story_points_assigned,
      COALESCE(SUM(t.story_points) FILTER (
        WHERE t.assignee_id = pm.user_id AND t.status = 'DONE'
      ), 0) AS story_points_completed
    FROM project_members pm
    LEFT JOIN tasks t
      ON t.project_id = pm.project_id
    WHERE pm.project_id = $1
    GROUP BY pm.user_id, pm.role;
  `;

  const result = await pool.query(query, [projectId]);
  return result.rows;
};

/**
 * Activity-based user metrics
 */
const getUserActivityMetrics = async (projectId) => {
  const query = `
    SELECT
      user_id,
      COUNT(*) AS total_actions,
      MAX(created_at) AS last_activity_at
    FROM activity_logs
    WHERE project_id = $1
    GROUP BY user_id;
  `;

  const result = await pool.query(query, [projectId]);
  return result.rows;
};

module.exports = {
  getUserTaskMetrics,
  getUserActivityMetrics
};
