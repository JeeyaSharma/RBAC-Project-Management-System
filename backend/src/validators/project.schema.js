const { z } = require("zod");
const { PROJECT_ROLES_ARRAY } = require("../constants/roles");

const createProjectSchema = z.object({
  name: z.string().min(3, "Project name must be at least 3 characters"),
  description: z.string().optional()
});

const addProjectMemberSchema = z.object({
  userId: z.string().uuid("Invalid userId"),
//   role: z.enum([
//     "OWNER",
//     "PROJECT_MANAGER",
//     "DEVELOPER",
//     "VIEWER"
//   ])
    role: z.enum(PROJECT_ROLES_ARRAY)
});

module.exports = {
  createProjectSchema,
  addProjectMemberSchema
};
