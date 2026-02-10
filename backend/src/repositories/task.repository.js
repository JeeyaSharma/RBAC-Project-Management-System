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
      created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
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
      updated_at;
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
 * Get task by ID (supports transactions)
 */
const getTaskById = async (taskId, client = pool) => {
  const query = `
    SELECT
      id,
      project_id,
      sprint_id,
      status,
      assignee_id
    FROM tasks
    WHERE id = $1;
  `;

  const result = await client.query(query, [taskId]);
  return result.rows[0] || null;
};

/**
 * Get full task details by ID
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
 * Update task status (transaction-safe)
 */
const updateTaskStatus = async (
  taskId,
  status,
  client = pool
) => {
  const query = `
    UPDATE tasks
    SET status = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING
      id,
      project_id,
      status,
      updated_at;
  `;

  const result = await client.query(query, [status, taskId]);
  return result.rows[0] || null;
};

/**
 * Update task fields dynamically
 */
const updateTask = async (taskId, fields) => {
  const keys = Object.keys(fields).filter(
    key => fields[key] !== undefined
  );

  if (keys.length === 0) {
    return null;
  }

  const setClause = keys
    .map((key, idx) => `${key} = $${idx + 1}`)
    .join(", ");

  const values = keys.map(key => fields[key]);

  const query = `
    UPDATE tasks
    SET ${setClause},
        updated_at = NOW()
    WHERE id = $${keys.length + 1}
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

  const result = await pool.query(query, [...values, taskId]);
  return result.rows[0] || null;
};

/**
 * Get tasks for a project (with pagination)
 */
const getTasksByProject = async ({
  projectId,
  status,
  assigneeId,
  limit,
  offset,
  page
}) => {
  let baseQuery = `
    FROM tasks
    WHERE project_id = $1
  `;

  const values = [projectId];
  let idx = 2;

  if (status) {
    baseQuery += ` AND status = $${idx++}`;
    values.push(status);
  }

  if (assigneeId) {
    baseQuery += ` AND assignee_id = $${idx++}`;
    values.push(assigneeId);
  }

  const dataQuery = `
    SELECT
      id,
      project_id,
      sprint_id,
      title,
      status,
      assignee_id,
      created_at
    ${baseQuery}
    ORDER BY created_at DESC
    LIMIT $${idx++} OFFSET $${idx};
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    ${baseQuery};
  `;

  const dataResult = await pool.query(
    dataQuery,
    [...values, limit, offset]
  );

  const countResult = await pool.query(countQuery, values);

  const total = Number(countResult.rows[0].total);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get tasks for a sprint (with pagination)
 */
const getTasksBySprint = async ({
  sprintId,
  limit,
  offset,
  page
}) => {
  const dataQuery = `
    SELECT
      id,
      project_id,
      sprint_id,
      title,
      status,
      assignee_id,
      created_at
    FROM tasks
    WHERE sprint_id = $1
    ORDER BY created_at DESC
    LIMIT $2 OFFSET $3;
  `;

  const countQuery = `
    SELECT COUNT(*) AS total
    FROM tasks
    WHERE sprint_id = $1;
  `;

  const dataResult = await pool.query(dataQuery, [
    sprintId,
    limit,
    offset
  ]);

  const countResult = await pool.query(countQuery, [sprintId]);

  const total = Number(countResult.rows[0].total);

  return {
    data: dataResult.rows,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  createTask,
  getTaskById,
  getTaskDetailById,
  updateTaskStatus,
  updateTask,
  getTasksByProject,
  getTasksBySprint
};
