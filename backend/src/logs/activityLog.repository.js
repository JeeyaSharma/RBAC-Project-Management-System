const pool = require("../config/db");

/**
 * Create activity log (transaction-aware)
 */
const createActivityLog = async (
  {
    projectId,
    userId,
    entityType,
    entityId,
    action,
    metadata = null
  },
  client = pool
) => {
  const query = `
    INSERT INTO activity_logs
    (project_id, user_id, entity_type, entity_id, action, metadata)
    VALUES ($1, $2, $3, $4, $5, $6);
  `;

  await client.query(query, [
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
