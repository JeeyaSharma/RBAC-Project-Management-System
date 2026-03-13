const { z } = require("zod");
const { PROJECT_ROLES_ARRAY } = require("../constants/roles");

const createProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().optional()
});

const addProjectMemberSchema = z.object({
  identifier: z.string().min(3, "Enter a public ID or email"),
  role: z.enum(PROJECT_ROLES_ARRAY)
});

module.exports = {
  createProjectSchema,
  addProjectMemberSchema
};
