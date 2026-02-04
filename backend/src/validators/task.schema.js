const { z } = require("zod");

const createTaskSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  storyPoints: z.number().int().positive().optional(),
  sprintId: z.string().uuid().optional(),
  assigneeId: z.string().uuid().optional()
});

const updateTaskStatusSchema = z.object({
  newStatus: z.enum(["TODO", "IN_PROGRESS", "DONE", "BLOCKED"])
});

const updateTaskSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  storyPoints: z.number().int().positive().optional(),
  assigneeId: z.string().uuid().optional(),
  sprintId: z.string().uuid().nullable().optional()
});

module.exports = {
  createTaskSchema,
  updateTaskStatusSchema,
  updateTaskSchema
};
