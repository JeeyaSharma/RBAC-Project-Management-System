const pool = require("../config/db");

/**
 * Log activity
 */
const logActivity = async ({
  projectId,
  userId,
  entityType,
  entityId,
  action,
  metadata
}) => {
  const query = `
    INSERT INTO activity_logs (
      project_id,
      user_id,
      entity_type,
      entity_id,
      action,
      metadata
    )
    VALUES ($1, $2, $3, $4, $5, $6);
  `;

  await pool.query(query, [
    projectId,
    userId,
    entityType,
    entityId,
    action,
    metadata || null
  ]);
};

module.exports = {
  logActivity
};
