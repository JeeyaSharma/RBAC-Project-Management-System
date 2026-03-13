const pool = require("../config/db");

const PUBLIC_ID_SQL = `
  ('USR-' || SUBSTRING(REPLACE(UPPER(id::text), '-', '') FROM 1 FOR 10))
`;

/**
 * Fetch a user by email
 * @param {string} email
 * @returns {Object|null}
 */
const findByEmail = async (email) => {
  const query = `
    SELECT
      id,
      name,
      email,
      ${PUBLIC_ID_SQL} AS public_id,
      password_hash,
      is_active,
      created_at
    FROM users
    WHERE email = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [email]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

/**
 * Fetch a user by ID
 * @param {string} id
 * @returns {Object|null}
 */
const findById = async (id) => {
  const query = `
    SELECT
      id,
      name,
      email,
      ${PUBLIC_ID_SQL} AS public_id,
      is_active,
      created_at
    FROM users
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

/**
 * Create a new user
 * @param {Object} user
 * @returns {Object}
 */
const createUser = async ({ name, email, passwordHash }) => {
  const query = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, ${PUBLIC_ID_SQL} AS public_id, created_at;
  `;

  const values = [name, email, passwordHash];
  const result = await pool.query(query, values);

  return result.rows[0];
};

/**
 * Fetch a user by short public ID
 * @param {string} publicId
 * @returns {Object|null}
 */
const findByPublicId = async (publicId) => {
  const normalized = String(publicId || "").toUpperCase();

  const query = `
    SELECT
      id,
      name,
      email,
      ${PUBLIC_ID_SQL} AS public_id,
      is_active,
      created_at
    FROM users
    WHERE ${PUBLIC_ID_SQL} = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [normalized]);
  return result.rows[0] || null;
};

/**
 * Search active users by name, email, or public ID prefix
 */
const searchUsers = async ({ query, limit = 10, excludeUserId }) => {
  const normalized = String(query || "").trim();
  const values = [`%${normalized}%`, `${normalized.toUpperCase()}%`, limit];
  let excludeClause = "";

  if (excludeUserId) {
    values.push(excludeUserId);
    excludeClause = ` AND id <> $${values.length}`;
  }

  const sql = `
    SELECT
      id,
      name,
      email,
      ${PUBLIC_ID_SQL} AS public_id,
      created_at
    FROM users
    WHERE is_active = TRUE
      AND (
        name ILIKE $1 OR
        email ILIKE $1 OR
        ${PUBLIC_ID_SQL} LIKE $2
      )
      ${excludeClause}
    ORDER BY created_at DESC
    LIMIT $3;
  `;

  const result = await pool.query(sql, values);
  return result.rows;
};

/**
 * Aggregate current user's own work across projects.
 */
const getProfileSummary = async (userId) => {
  const query = `
    SELECT
      (SELECT COUNT(*) FROM project_members WHERE user_id = $1) AS projects_count,
      (SELECT COUNT(*) FROM tasks WHERE assignee_id = $1) AS assigned_tasks,
      (SELECT COUNT(*) FROM tasks WHERE assignee_id = $1 AND status = 'DONE') AS completed_tasks,
      (SELECT COUNT(*) FROM tasks WHERE assignee_id = $1 AND status = 'IN_PROGRESS') AS in_progress_tasks,
      (SELECT COUNT(*) FROM tasks WHERE assignee_id = $1 AND status = 'BLOCKED') AS blocked_tasks,
      (SELECT COALESCE(SUM(story_points), 0) FROM tasks WHERE assignee_id = $1) AS story_points_assigned,
      (SELECT COALESCE(SUM(story_points), 0) FROM tasks WHERE assignee_id = $1 AND status = 'DONE') AS story_points_completed,
      (SELECT COUNT(*) FROM activity_logs WHERE user_id = $1) AS total_actions,
      (SELECT MAX(created_at) FROM activity_logs WHERE user_id = $1) AS last_activity_at;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows[0];
};

const getProjectPerformance = async (userId) => {
  const query = `
    SELECT
      p.id AS project_id,
      p.name AS project_name,
      pm.role,
      COUNT(t.id) AS tasks_assigned,
      COUNT(t.id) FILTER (WHERE t.status = 'DONE') AS tasks_completed,
      COUNT(t.id) FILTER (WHERE t.status = 'IN_PROGRESS') AS tasks_in_progress,
      COUNT(t.id) FILTER (WHERE t.status = 'BLOCKED') AS tasks_blocked,
      COALESCE(SUM(t.story_points), 0) AS story_points_assigned,
      COALESCE(SUM(t.story_points) FILTER (WHERE t.status = 'DONE'), 0) AS story_points_completed,
      COALESCE(a.total_actions, 0) AS total_actions,
      a.last_activity_at
    FROM project_members pm
    JOIN projects p
      ON p.id = pm.project_id
    LEFT JOIN tasks t
      ON t.project_id = pm.project_id
      AND t.assignee_id = pm.user_id
    LEFT JOIN (
      SELECT
        project_id,
        COUNT(*) AS total_actions,
        MAX(created_at) AS last_activity_at
      FROM activity_logs
      WHERE user_id = $1
      GROUP BY project_id
    ) a
      ON a.project_id = pm.project_id
    WHERE pm.user_id = $1
    GROUP BY p.id, p.name, pm.role, p.created_at, a.total_actions, a.last_activity_at
    ORDER BY p.created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

const getRecentAssignedTasks = async (userId, limit = 8) => {
  const query = `
    SELECT
      t.id,
      t.title,
      t.status,
      t.story_points,
      t.updated_at,
      t.project_id,
      p.name AS project_name
    FROM tasks t
    JOIN projects p
      ON p.id = t.project_id
    WHERE t.assignee_id = $1
    ORDER BY t.updated_at DESC NULLS LAST, t.created_at DESC
    LIMIT $2;
  `;

  const result = await pool.query(query, [userId, limit]);
  return result.rows;
};

const getRecentUserActivity = async (userId, limit = 10) => {
  const query = `
    SELECT
      a.project_id,
      p.name AS project_name,
      a.entity_type,
      a.entity_id,
      a.action,
      a.metadata,
      a.created_at
    FROM activity_logs a
    LEFT JOIN projects p
      ON p.id = a.project_id
    WHERE a.user_id = $1
    ORDER BY a.created_at DESC
    LIMIT $2;
  `;

  const result = await pool.query(query, [userId, limit]);
  return result.rows;
};


module.exports = {
  findByEmail,
  findById,
  createUser,
  findByPublicId,
  searchUsers,
  getProfileSummary,
  getProjectPerformance,
  getRecentAssignedTasks,
  getRecentUserActivity
};
