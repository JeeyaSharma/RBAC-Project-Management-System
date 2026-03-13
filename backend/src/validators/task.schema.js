const { z } = require("zod");

const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  storyPoints: z.number().int().positive().optional(),
  sprintId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional(),
  assigneeIdentifier: z.string().min(3).optional()
});

const taskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"]);

const updateTaskStatusSchema = z
  .object({
    newStatus: taskStatusEnum.optional(),
    status: taskStatusEnum.optional()
  })
  .refine((data) => data.newStatus || data.status, {
    message: "Status is required"
  });

const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  storyPoints: z.number().int().positive().optional(),
  assigneeId: z.string().uuid().optional(),
  assigneeIdentifier: z.string().min(3).optional(),
  sprintId: z.string().uuid().nullable().optional()
});

module.exports = {
  createTaskSchema,
  updateTaskStatusSchema,
  updateTaskSchema
};
