const pool = require("../config/db");

/**
 * Sprint task summary
 */
const getSprintTaskSummary = async (sprintId) => {
  const query = `
    SELECT
      COUNT(*) AS total_tasks,
      COUNT(*) FILTER (WHERE status = 'DONE') AS completed_tasks,
      COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress_tasks,
      COUNT(*) FILTER (WHERE status = 'BLOCKED') AS blocked_tasks,
      COALESCE(SUM(story_points), 0) AS total_story_points,
      COALESCE(SUM(story_points) FILTER (WHERE status = 'DONE'), 0) AS completed_story_points
    FROM tasks
    WHERE sprint_id = $1;
  `;

  const result = await pool.query(query, [sprintId]);
  return result.rows[0];
};

/**
 * User contribution within sprint
 */
const getSprintUserContribution = async (sprintId) => {
  const query = `
    SELECT
      t.assignee_id AS user_id,
      u.name AS user_name,
      ('USR-' || SUBSTRING(REPLACE(UPPER(u.id::text), '-', '') FROM 1 FOR 10)) AS user_public_id,
      COUNT(*) FILTER (WHERE status = 'DONE') AS completed_tasks,
      COALESCE(SUM(story_points) FILTER (WHERE status = 'DONE'), 0) AS completed_story_points
    FROM tasks t
    JOIN users u
      ON u.id = t.assignee_id
    WHERE t.sprint_id = $1
      AND t.assignee_id IS NOT NULL
    GROUP BY t.assignee_id, u.id, u.name;
  `;

  const result = await pool.query(query, [sprintId]);
  return result.rows;
};

module.exports = {
  getSprintTaskSummary,
  getSprintUserContribution
};
