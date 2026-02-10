const pool = require("../config/db");
const activityLogRepository = require("./activityLog.repository");

/**
 * Log activity (fail-safe, transaction-aware)
 */
const logActivity = async (
  {
    projectId,
    userId,
    entityType,
    entityId,
    action,
    metadata
  },
  client = pool
) => {
  // Logging must NEVER break main flow
  try {
    await activityLogRepository.createActivityLog(
      {
        projectId,
        userId,
        entityType,
        entityId,
        action,
        metadata
      },
      client
    );
  } catch (error) {
    console.error(
      "Activity log failed:",
      error.message
    );
  }
};

module.exports = {
  logActivity
};
