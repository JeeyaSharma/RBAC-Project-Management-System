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


module.exports = {
  createTask,
  getTaskById,
  updateTaskStatus
};
