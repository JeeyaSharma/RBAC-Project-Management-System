const pool = require("../config/db");

/**
 * Create sprint
 */
const createSprint = async (
  { projectId, name, goal, startDate, endDate },
  client = pool
) => {
  const query = `
    INSERT INTO sprints (
      project_id,
      name,
      goal,
      start_date,
      end_date,
      status
    )
    VALUES ($1, $2, $3, $4, $5, 'PLANNED')
    RETURNING
      id,
      project_id,
      name,
      goal,
      start_date,
      end_date,
      status,
      created_at;
  `;

  const values = [
    projectId,
    name,
    goal || null,
    startDate || null,
    endDate || null
  ];

  const result = await client.query(query, values);
  return result.rows[0];
};

/**
 * Check if an active sprint already exists
 */
const hasActiveSprint = async (projectId, client = pool) => {
  const query = `
    SELECT 1
    FROM sprints
    WHERE project_id = $1 AND status = 'ACTIVE'
    LIMIT 1;
  `;

  const result = await client.query(query, [projectId]);
  return result.rows.length > 0;
};

/**
 * Get sprint by ID
 */
const getSprintById = async (sprintId, client = pool) => {
  const query = `
    SELECT id, project_id, status
    FROM sprints
    WHERE id = $1;
  `;

  const result = await client.query(query, [sprintId]);
  return result.rows[0] || null;
};

/**
 * Update sprint status
 */
const updateSprintStatus = async (
  sprintId,
  status,
  client = pool
) => {
  const query = `
    UPDATE sprints
    SET status = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING id, project_id, name, status, updated_at;
  `;

  const result = await client.query(query, [status, sprintId]);
  return result.rows[0] || null;
};

module.exports = {
  createSprint,
  hasActiveSprint,
  getSprintById,
  updateSprintStatus
};
