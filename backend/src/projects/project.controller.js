const projectService = require("./project.service");

/**
 * POST /projects
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Project name is required"
      });
    }

    const project = await projectService.createProject({
      name,
      description,
      userId: req.user.id
    });

    return res.status(201).json({
      message: "Project created successfully",
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
    const { userId, role } = req.body;

    if (!userId || !role) {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "userId and role are required"
      });
    }

    await projectService.addProjectMember({
      projectId,
      requesterId: req.user.id,
      newUserId: userId,
      role
    });

    return res.status(201).json({
      message: "Project member added successfully"
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
