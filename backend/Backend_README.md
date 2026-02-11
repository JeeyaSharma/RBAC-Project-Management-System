# 🚀 RBAC Agile Project Management System -- Backend

------------------------------------------------------------------------

# 📌 1. Introduction

This backend powers a **Role-Based Agile Project Management System**.

It provides REST APIs for:

-   User Authentication
-   Role-Based Project Management
-   Sprint Lifecycle Management
-   Task Management & Workflow
-   Activity Logging
-   Sprint Analytics & Performance Dashboard

The system is built with production-level engineering standards
including:

-   JWT Authentication
-   RBAC (Role-Based Access Control)
-   Transaction-safe operations
-   Pagination
-   Centralized error handling
-   Zod validation
-   PostgreSQL (Supabase)

------------------------------------------------------------------------

# 🏗️ 2. Technology Stack

  Layer              Technology
  ------------------ ---------------------------------------------
  Backend Runtime    Node.js
  Framework          Express.js
  Database           PostgreSQL (Supabase)
  Authentication     JWT
  Password Hashing   bcrypt
  Validation         Zod
  Architecture       Layered (Controller → Service → Repository)

------------------------------------------------------------------------

# 🏛️ 3. Architecture Overview

The backend follows a strict layered architecture:

Routes → Controller → Service → Repository → Database

### Responsibilities

  Layer        Purpose
  ------------ ---------------------------------------
  Routes       Define endpoints & attach middleware
  Controller   Handle HTTP request & response
  Service      Business logic (RBAC, workflow rules)
  Repository   Database queries only
  Middleware   Auth, validation, error handling

------------------------------------------------------------------------

# 🔐 4. Authentication System

Authentication uses JWT (JSON Web Token).

## 🔑 How Authentication Works

1.  User signs up or logs in.
2.  Backend returns a JWT.
3.  Frontend stores the token.
4.  All protected routes must include:

Authorization: Bearer `<token>`{=html}

------------------------------------------------------------------------

# 👥 5. Role-Based Access Control (RBAC)

Each project has members assigned roles:

  Role              Description
  ----------------- -------------------------
  OWNER             Full control of project
  PROJECT_MANAGER   Manage sprints & tasks
  DEVELOPER         Work on tasks

## 🧠 How Roles Are Assigned

### 1️⃣ During Project Creation

When a user creates a new project:

-   That user is automatically inserted into the `project_members`
    table.
-   Their role is set to `OWNER`.
-   This guarantees that every project always has exactly one initial
    OWNER.

### 2️⃣ Adding Members to a Project

Only users with roles: - OWNER - PROJECT_MANAGER

can add new members to a project.

Endpoint: POST /projects/:projectId/members

Request body: { "userId": "...", "role": "DEVELOPER" }

The role is stored in the `project_members` table and enforced at the
service layer.

### 3️⃣ How RBAC Is Enforced

RBAC checks happen in the Service Layer:

-   Before creating tasks
-   Before starting/completing sprints
-   Before updating status
-   Before adding members

Frontend role checks are only for UI --- security is enforced strictly
by backend.

------------------------------------------------------------------------

# 📡 6. API Endpoints Overview

## 🔐 Authentication

POST /auth/signup\
POST /auth/login

## 📁 Projects

POST /projects\
GET /projects\
POST /projects/:projectId/members

## 🏃 Sprints

POST /projects/:projectId/sprints\
PATCH /projects/:projectId/sprints/:sprintId/start\
PATCH /projects/:projectId/sprints/:sprintId/complete

## 📝 Tasks

POST /projects/:projectId/tasks\
GET /projects/:projectId/tasks\
GET /projects/:projectId/sprints/:sprintId/tasks\
GET /tasks/:taskId\
PATCH /projects/:projectId/tasks/:taskId\
PATCH /projects/:projectId/tasks/:taskId/status

## 📊 Analytics

GET /projects/:projectId/sprints/:sprintId/analytics

------------------------------------------------------------------------

# 📄 7. Response Format

## Success (Single Resource)

{ "data": { ... } }

## Success (Paginated List)

{ "data": \[ ... \], "pagination": { "page": 1, "limit": 10, "total":
45, "totalPages": 5 } }

## Error Format

{ "error": "ERROR_CODE", "message": "Readable error message" }

------------------------------------------------------------------------

# 📊 8. Pagination

Supported query params:

?page=1&limit=10

Defaults: - page = 1 - limit = 10 - max limit = 100

------------------------------------------------------------------------

# 🗄️ 9. Database Overview

Main tables:

-   users
-   projects
-   project_members
-   sprints
-   tasks
-   activity_logs

Indexes are applied for performance on: - project lookups - sprint
filtering - task filtering - activity logs

------------------------------------------------------------------------

# 🔒 10. Security Measures

-   JWT authentication
-   bcrypt password hashing
-   Zod input validation
-   RBAC enforced server-side
-   Transaction-safe writes
-   Parameterized SQL queries
-   CORS protection
-   Pagination limits

------------------------------------------------------------------------

# 🧪 11. Local Development Setup

1️⃣ Install dependencies

npm install

2️⃣ Create .env file

NODE_ENV=development PORT=4000
DATABASE_URL=your_supabase_connection_string JWT_SECRET=super_secret_key
JWT_EXPIRES_IN=7d CORS_ORIGIN=http://localhost:3000

3️⃣ Run server

npm run dev

Server runs at: http://localhost:4000

------------------------------------------------------------------------

# 🚀 12. Deployment Notes

Before production:

-   Set NODE_ENV=production
-   Configure environment variables
-   Apply DB indexes
-   Verify Supabase connection
-   Set correct CORS origin

------------------------------------------------------------------------

# 🏁 Backend Status

✔ Fully implemented\
✔ RBAC enforced\
✔ Transaction-safe\
✔ Analytics ready\
✔ Logging implemented\
✔ Production-ready

------------------------------------------------------------------------

Backend Developer: Project Owner\
Frontend Developer: Team Member
