const sprintRepository = require("../repositories/sprint.repository");
const projectRepository = require("../repositories/project.repository");
const { ForbiddenError, NotFoundError, AppError } = require("../common/errors");

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
    !["OWNER", "PROJECT_MANAGER"].includes(membership.role)
  ) {
    throw new ForbiddenError(
      "You do not have permission to create a sprint"
    );
  }

  // 3. Date validation (if provided)
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    throw new AppError(
      "Sprint start date cannot be after end date",
      400,
      "INVALID_DATES"
    );
  }

  // 4. Agile rule: only one ACTIVE sprint
  const hasActive = await sprintRepository.hasActiveSprint(projectId);
  if (hasActive) {
    throw new AppError(
      "An active sprint already exists for this project",
      409,
      "ACTIVE_SPRINT_EXISTS"
    );
  }

  // 5. Create sprint
  return sprintRepository.createSprint({
    projectId,
    name,
    goal,
    startDate,
    endDate
  });
};

/**
 * Start sprint
 */
const startSprint = async ({ projectId, sprintId, userId }) => {
  // 1. Sprint must exist
  const sprint = await sprintRepository.getSprintById(sprintId);
  if (!sprint || sprint.project_id !== projectId) {
    throw new NotFoundError("Sprint not found");
  }

  // 2. RBAC check
  const membership =
    await projectRepository.getUserRoleInProject(projectId, userId);

  if (
    !membership ||
    !["OWNER", "PROJECT_MANAGER"].includes(membership.role)
  ) {
    throw new ForbiddenError(
      "You do not have permission to start the sprint"
    );
  }

  // 3. Sprint must be PLANNED
  if (sprint.status !== "PLANNED") {
    throw new AppError(
      "Only planned sprints can be started",
      400,
      "INVALID_SPRINT_STATE"
    );
  }

  // 4. Only one ACTIVE sprint per project
  const hasActive = await sprintRepository.hasActiveSprint(projectId);
  if (hasActive) {
    throw new AppError(
      "Another active sprint already exists",
      409,
      "ACTIVE_SPRINT_EXISTS"
    );
  }

  // 5. Start sprint
  return sprintRepository.updateSprintStatus(sprintId, "ACTIVE");
};

/**
 * Complete sprint
 */
const completeSprint = async ({ projectId, sprintId, userId }) => {
  // 1. Sprint must exist
  const sprint = await sprintRepository.getSprintById(sprintId);
  if (!sprint || sprint.project_id !== projectId) {
    throw new NotFoundError("Sprint not found");
  }

  // 2. RBAC check
  const membership =
    await projectRepository.getUserRoleInProject(projectId, userId);

  if (
    !membership ||
    !["OWNER", "PROJECT_MANAGER"].includes(membership.role)
  ) {
    throw new ForbiddenError(
      "You do not have permission to complete the sprint"
    );
  }

  // 3. Sprint must be ACTIVE
  if (sprint.status !== "ACTIVE") {
    throw new AppError(
      "Only active sprints can be completed",
      400,
      "INVALID_SPRINT_STATE"
    );
  }

  // 4. Complete sprint
  return sprintRepository.updateSprintStatus(sprintId, "COMPLETED");
};


module.exports = {
  createSprint,
  startSprint,
  completeSprint
};
