const projectService = require("./project.service");

/**
 * POST /projects
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await projectService.createProject({
      name,
      description,
      userId: req.user.id
    });

    return res.status(201).json({
      data: project
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /projects/my
 */
const getMyProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getMyProjects(req.user.id);

    return res.status(200).json({
      data: projects
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /projects/:projectId/members
 */
const addProjectMember = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { identifier, role } = req.body;

    await projectService.addProjectMember({
      projectId,
      requesterId: req.user.id,
      newUserIdentifier: identifier,
      role
    });

    return res.status(201).json({
      data: { success: true }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getMyProjects,
  addProjectMember
};
