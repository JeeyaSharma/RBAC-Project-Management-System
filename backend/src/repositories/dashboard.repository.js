const pool = require("../config/db");

/**
 * Project basic info
 */
const getProjectInfo = async (projectId) => {
  const result = await pool.query(
    `
    SELECT id, name, description, created_at
    FROM projects
    WHERE id = $1
    `,
    [projectId]
  );

  return result.rows[0] || null;
};

/**
 * Active sprint
 */
const getActiveSprint = async (projectId) => {
  const result = await pool.query(
    `
    SELECT id, name, goal, start_date, end_date, status
    FROM sprints
    WHERE project_id = $1 AND status = 'ACTIVE'
    LIMIT 1
    `,
    [projectId]
  );

  return result.rows[0] || null;
};

/**
 * Task summary for project
 */
const getTaskSummary = async (projectId) => {
  const result = await pool.query(
    `
    SELECT
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE status = 'TODO') AS todo,
      COUNT(*) FILTER (WHERE status = 'IN_PROGRESS') AS in_progress,
      COUNT(*) FILTER (WHERE status = 'DONE') AS done,
      COUNT(*) FILTER (WHERE status = 'BLOCKED') AS blocked
    FROM tasks
    WHERE project_id = $1
    `,
    [projectId]
  );

  return result.rows[0];
};

/**
 * Project members
 */
const getProjectMembers = async (projectId) => {
  const result = await pool.query(
    `
    SELECT
      pm.user_id,
      u.name,
      ('USR-' || SUBSTRING(REPLACE(UPPER(u.id::text), '-', '') FROM 1 FOR 10)) AS user_public_id,
      pm.role
    FROM project_members pm
    JOIN users u
      ON u.id = pm.user_id
    WHERE pm.project_id = $1
    `,
    [projectId]
  );

  return result.rows;
};

/**
 * Recent activity
 */
const getRecentActivity = async (projectId) => {
  const result = await pool.query(
    `
    SELECT
      a.user_id,
      u.name AS user_name,
      ('USR-' || SUBSTRING(REPLACE(UPPER(u.id::text), '-', '') FROM 1 FOR 10)) AS user_public_id,
      a.entity_type,
      a.entity_id,
      a.action,
      a.metadata,
      a.created_at
    FROM activity_logs a
    LEFT JOIN users u
      ON u.id = a.user_id
    WHERE a.project_id = $1
    ORDER BY a.created_at DESC
    LIMIT 10
    `,
    [projectId]
  );

  return result.rows;
};

module.exports = {
  getProjectInfo,
  getActiveSprint,
  getTaskSummary,
  getProjectMembers,
  getRecentActivity
};
