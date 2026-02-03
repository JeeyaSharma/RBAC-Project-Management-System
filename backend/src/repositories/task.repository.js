const pool = require("../config/db");

/**
 * Create task
 */
const createTask = async ({
  projectId,
  sprintId,
  title,
  description,
  storyPoints,
  assigneeId,
  createdBy
}) => {
  const query = `
    INSERT INTO tasks (
      project_id,
      sprint_id,
      title,
      description,
      story_points,
      assignee_id,
      created_by,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, 'TODO')
    RETURNING
      id,
      project_id,
      sprint_id,
      title,
      description,
      story_points,
      assignee_id,
      status,
      created_at;
  `;

  const values = [
    projectId,
    sprintId || null,
    title,
    description || null,
    storyPoints || null,
    assigneeId || null,
    createdBy
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Get task by ID
 */
const getTaskById = async (taskId) => {
  const query = `
    SELECT id, project_id, status, assignee_id
    FROM tasks
    WHERE id = $1;
  `;

  const result = await pool.query(query, [taskId]);
  return result.rows[0] || null;
};

/**
 * Update task status
 */
const updateTaskStatus = async (taskId, status) => {
  const query = `
    UPDATE tasks
    SET status = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING id, status, updated_at;
  `;

  const result = await pool.query(query, [status, taskId]);
  return result.rows[0];
};

/**
 * Get all tasks for a project (optionally filtered)
 */
const getTasksByProject = async ({
  projectId,
  status,
  assigneeId
}) => {
  let query = `
    SELECT
      id,
      project_id,
      sprint_id,
      title,
      description,
      status,
      story_points,
      assignee_id,
      created_by,
      created_at,
      updated_at
    FROM tasks
    WHERE project_id = $1
  `;

  const values = [projectId];
  let idx = 2;

  if (status) {
    query += ` AND status = $${idx++}`;
    values.push(status);
  }

  if (assigneeId) {
    query += ` AND assignee_id = $${idx++}`;
    values.push(assigneeId);
  }

  query += ` ORDER BY created_at DESC`;

  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Get tasks for a sprint
 */
const getTasksBySprint = async (sprintId) => {
  const query = `
    SELECT
      id,
      project_id,
      sprint_id,
      title,
      description,
      status,
      story_points,
      assignee_id,
      created_by,
      created_at,
      updated_at
    FROM tasks
    WHERE sprint_id = $1
    ORDER BY created_at DESC;
  `;

  const result = await pool.query(query, [sprintId]);
  return result.rows;
};

/**
 * Get single task by ID
 */
const getTaskDetailById = async (taskId) => {
  const query = `
    SELECT
      id,
      project_id,
      sprint_id,
      title,
      description,
      status,
      story_points,
      assignee_id,
      created_by,
      created_at,
      updated_at
    FROM tasks
    WHERE id = $1;
  `;

  const result = await pool.query(query, [taskId]);
  return result.rows[0] || null;
};

/**
 * Update task fields
 */
const updateTask = async (taskId, fields) => {
  const allowedFields = [
    "title",
    "description",
    "story_points",
    "assignee_id",
    "sprint_id"
  ];

  const updates = [];
  const values = [];
  let idx = 1;

  for (const key of allowedFields) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = $${idx++}`);
      values.push(fields[key]);
    }
  }

  if (updates.length === 0) {
    return null;
  }

  const query = `
    UPDATE tasks
    SET ${updates.join(", ")},
        updated_at = NOW()
    WHERE id = $${idx}
    RETURNING
      id,
      project_id,
      sprint_id,
      title,
      description,
      status,
      story_points,
      assignee_id,
      updated_at;
  `;

  values.push(taskId);

  const result = await pool.query(query, values);
  return result.rows[0] || null;
};


module.exports = {
  createTask,
  getTaskById,
  updateTaskStatus,
  getTasksByProject,
  getTasksBySprint,
  getTaskDetailById,
  updateTask
};
