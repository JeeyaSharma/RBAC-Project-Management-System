const express = require("express");
const cors = require("cors");

const authRoutes = require("./auth/auth.routes");
const errorHandler = require("./middlewares/error.middleware");
const projectRoutes = require("./projects/project.routes");
const sprintRoutes = require("./sprints/sprint.routes");
const taskRoutes = require("./tasks/task.routes");
const analyticsRoutes = require("./analytics/analytics.routes");
const dashboardRoutes = require("./dashboard/dashboard.routes");
const userAnalyticsRoutes = require("./analytics/user_analytics.routes");
const userRoutes = require("./users/user.routes");

const app = express();

// Global middlewares
// app.use(cors());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// app.use(express.json());
app.use(express.json({ limit: "1mb" }));


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
app.use(dashboardRoutes);
app.use(userAnalyticsRoutes);
app.use("/users", userRoutes);

// 404 handler (must be before error handler)
app.use((req, res) => {
  res.status(404).json({
    error: "NOT_FOUND",
    message: "Route not found"
  });
});


// Global error handler (MUST be last)
app.use(errorHandler);

module.exports = app;
