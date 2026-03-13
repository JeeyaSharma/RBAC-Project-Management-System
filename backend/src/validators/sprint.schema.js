const { z } = require("zod");

// Create Sprint
const createSprintSchema = z.object({
  name: z.string().min(3, "Sprint name must be at least 3 characters"),
  startDate: z.string().datetime("Invalid startDate (ISO format)"),
  endDate: z.string().datetime("Invalid endDate (ISO format)")
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: "startDate must be before endDate",
    path: ["endDate"]
  }
);

// Start Sprint (no body needed, but keep schema explicit)
const startSprintSchema = z.object({}).optional().transform(() => ({}));

// Complete Sprint
const completeSprintSchema = z.object({}).optional().transform(() => ({}));

module.exports = {
  createSprintSchema,
  startSprintSchema,
  completeSprintSchema
};
