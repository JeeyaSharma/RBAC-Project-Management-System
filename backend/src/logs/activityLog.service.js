const activityLogRepository = require("./activityLog.repository");

const logActivity = async ({
  projectId,
  userId,
  entityType,
  entityId,
  action,
  metadata
}) => {
  // Fail-safe: logging must NEVER break main flow
  try {
    await activityLogRepository.createActivityLog({
      projectId,
      userId,
      entityType,
      entityId,
      action,
      metadata
    });
  } catch (error) {
    console.error("Activity log failed:", error.message);
  }
};

module.exports = {
  logActivity
};
