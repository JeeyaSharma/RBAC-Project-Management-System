const express = require("express");
const cors = require("cors");

const authRoutes = require("./auth/auth.routes");
const errorHandler = require("./middlewares/error.middleware");
const projectRoutes = require("./projects/project.routes");
const sprintRoutes = require("./sprints/sprint.routes");
const taskRoutes = require("./tasks/task.routes");
const analyticsRoutes = require("./analytics/analytics.routes");

const app = express();

// Global middlewares
app.use(cors());
app.use(express.json());


// Health check (always useful)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Routes
app.use("/auth", authRoutes);
app.use("/projects", projectRoutes);
app.use(sprintRoutes);
app.use(taskRoutes);
app.use(analyticsRoutes);

// Global error handler (MUST be last)
app.use(errorHandler);

module.exports = app;
