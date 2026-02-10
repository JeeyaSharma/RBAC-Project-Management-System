const pool = require("../config/db");
const sprintRepository = require("../repositories/sprint.repository");
const projectRepository = require("../repositories/project.repository");
const activityLogService = require("../logs/activityLog.service");
const { ForbiddenError, NotFoundError, AppError } = require("../common/errors");
const { PROJECT_ROLES } = require("../constants/roles");

/**
 * Create sprint (RBAC protected)
 */
const createSprint = async ({
  projectId,
  userId,
  name,
  goal,
  startDate,
  endDate
}) => {
  // 1. Project must exist
  const project = await projectRepository.getProjectById(projectId);
  if (!project) {
    throw new NotFoundError("Project not found");
  }

  // 2. RBAC check
  const membership =
    await projectRepository.getUserRoleInProject(projectId, userId);

  if (
    !membership ||
    ![PROJECT_ROLES.OWNER, PROJECT_ROLES.PROJECT_MANAGER].includes(
      membership.role
    )
  ) {
    throw new ForbiddenError(
      "You do not have permission to create a sprint"
    );
  }

  // 3. Date validation
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new AppError(
      "Sprint start date cannot be after end date",
      400,
      "INVALID_DATES"
    );
  }

  // 4. Only one ACTIVE sprint
  const hasActive = await sprintRepository.hasActiveSprint(projectId);
  if (hasActive) {
    throw new AppError(
      "An active sprint already exists for this project",
      409,
      "ACTIVE_SPRINT_EXISTS"
    );
  }

  // 5. Create sprint
  const sprint = await sprintRepository.createSprint({
    projectId,
    name,
    goal,
    startDate,
    endDate
  });

  // 6. Log activity
  await activityLogService.logActivity({
    projectId,
    userId,
    entityType: "SPRINT",
    entityId: sprint.id,
    action: "CREATED"
  });

  return sprint;
};

/**
 * Start sprint (transactional)
 */
const startSprint = async ({ projectId, sprintId, userId }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const sprint = await sprintRepository.getSprintById(sprintId);
    if (!sprint || sprint.project_id !== projectId) {
      throw new NotFoundError("Sprint not found");
    }

    const membership =
      await projectRepository.getUserRoleInProject(projectId, userId);

    if (
      !membership ||
      ![PROJECT_ROLES.OWNER, PROJECT_ROLES.PROJECT_MANAGER].includes(
        membership.role
      )
    ) {
      throw new ForbiddenError(
        "You do not have permission to start the sprint"
      );
    }

    if (sprint.status !== "PLANNED") {
      throw new AppError(
        "Only planned sprints can be started",
        400,
        "INVALID_SPRINT_STATE"
      );
    }

    const hasActive = await sprintRepository.hasActiveSprint(projectId, client);
    if (hasActive) {
      throw new AppError(
        "Another active sprint already exists",
        409,
        "ACTIVE_SPRINT_EXISTS"
      );
    }

    const updated = await sprintRepository.updateSprintStatus(
      sprintId,
      "ACTIVE",
      client
    );

    await activityLogService.logActivity({
      projectId,
      userId,
      entityType: "SPRINT",
      entityId: sprintId,
      action: "STARTED"
    });

    await client.query("COMMIT");
    return updated;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Complete sprint (transactional)
 */
const completeSprint = async ({ projectId, sprintId, userId }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const sprint = await sprintRepository.getSprintById(sprintId);
    if (!sprint || sprint.project_id !== projectId) {
      throw new NotFoundError("Sprint not found");
    }

    const membership =
      await projectRepository.getUserRoleInProject(projectId, userId);

    if (
      !membership ||
      ![PROJECT_ROLES.OWNER, PROJECT_ROLES.PROJECT_MANAGER].includes(
        membership.role
      )
    ) {
      throw new ForbiddenError(
        "You do not have permission to complete the sprint"
      );
    }

    if (sprint.status !== "ACTIVE") {
      throw new AppError(
        "Only active sprints can be completed",
        400,
        "INVALID_SPRINT_STATE"
      );
    }

    const updated = await sprintRepository.updateSprintStatus(
      sprintId,
      "COMPLETED",
      client
    );

    await activityLogService.logActivity({
      projectId,
      userId,
      entityType: "SPRINT",
      entityId: sprintId,
      action: "COMPLETED"
    });

    await client.query("COMMIT");
    return updated;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createSprint,
  startSprint,
  completeSprint
};
