const pool = require("../config/db");
const projectRepository = require("../repositories/project.repository");
const activityLogService = require("../logs/activityLog.service");
const {
  ForbiddenError,
  NotFoundError,
  AppError
} = require("../common/errors");
const { PROJECT_ROLES } = require("../constants/roles");

/**
 * Create project + OWNER membership
 */
const createProject = async ({ name, description, userId }) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Create project
    const project = await projectRepository.createProject(client, {
      name,
      description,
      createdBy: userId
    });

    // 2. Assign OWNER role
    await projectRepository.addProjectMember(client, {
      projectId: project.id,
      userId,
      role: PROJECT_ROLES.OWNER
    });

    // 3. Log activity
    await activityLogService.logActivity({
      projectId: project.id,
      userId,
      entityType: "PROJECT",
      entityId: project.id,
      action: "CREATED"
    });

    await client.query("COMMIT");

    return project;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get projects for logged-in user
 */
const getMyProjects = async (userId) => {
  return projectRepository.getProjectsForUser(userId);
};

/**
 * Add member to project (RBAC protected)
 */
const addProjectMember = async ({
  projectId,
  requesterId,
  newUserId,
  role
}) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Project must exist
    const project = await projectRepository.getProjectById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    // 2. Requester must have permission
    const requesterMembership =
      await projectRepository.getUserRoleInProject(projectId, requesterId);

    if (
      !requesterMembership ||
      ![
        PROJECT_ROLES.OWNER,
        PROJECT_ROLES.PROJECT_MANAGER
      ].includes(requesterMembership.role)
    ) {
      throw new ForbiddenError("You do not have permission to add members");
    }

    // 3. Prevent duplicate membership
    const existingMembership =
      await projectRepository.getUserRoleInProject(projectId, newUserId);

    if (existingMembership) {
      throw new AppError(
        "User is already a project member",
        409,
        "ALREADY_MEMBER"
      );
    }

    // 4. Add member
    await projectRepository.addProjectMember(client, {
      projectId,
      userId: newUserId,
      role
    });

    // 5. Log activity
    await activityLogService.logActivity({
      projectId,
      userId: requesterId,
      entityType: "MEMBER",
      entityId: newUserId,
      action: "ADDED",
      metadata: { role }
    });

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  createProject,
  getMyProjects,
  addProjectMember
};
