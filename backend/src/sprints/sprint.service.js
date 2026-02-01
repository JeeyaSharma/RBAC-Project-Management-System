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

module.exports = {
  createSprint
};
