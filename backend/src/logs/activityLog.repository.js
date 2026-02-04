const { pool } = require("../config/db");

const createActivityLog = async ({
  projectId,
  userId,
  entityType,
  entityId,
  action,
  metadata = null
}) => {
  const query = `
    INSERT INTO activity_logs
    (project_id, user_id, entity_type, entity_id, action, metadata)
    VALUES ($1, $2, $3, $4, $5, $6);
  `;

  await pool.query(query, [
    projectId,
    userId,
    entityType,
    entityId,
    action,
    metadata
  ]);
};

module.exports = {
  createActivityLog
};
