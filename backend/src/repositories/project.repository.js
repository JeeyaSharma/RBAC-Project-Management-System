const pool = require("../config/db");

/**
 * Create a new project
 */
const createProject = async (client, { name, description, createdBy }) => {
  const query = `
    INSERT INTO projects (name, description, created_by)
    VALUES ($1, $2, $3)
    RETURNING id, name, description, created_by, created_at;
  `;

  const values = [name, description || null, createdBy];
  const result = await client.query(query, values);

  return result.rows[0];
};

/**
 * Add project member (RBAC)
 */
// const addProjectMember = async (projectId, userId, role ) => {
//   const query = `
//     INSERT INTO project_members (project_id, user_id, role)
//     VALUES ($1, $2, $3);
//   `;

//   await pool.query(query, [projectId, userId, role]);
// };
/**
 * Add project member (RBAC)
 */
const addProjectMember = async (client, { projectId, userId, role }) => {
  const query = `
    INSERT INTO project_members (project_id, user_id, role)
    VALUES ($1, $2, $3);
  `;

  await client.query(query, [projectId, userId, role]);
};


/**
 * Get all projects for a user (RBAC-based)
 */
const getProjectsForUser = async (userId) => {
  const query = `
    SELECT
      p.id,
      p.name,
      p.description,
      p.created_at,
      pm.role
    FROM projects p
    JOIN project_members pm
      ON pm.project_id = p.id
    WHERE pm.user_id = $1
    ORDER BY p.created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

/**
 * Get user's role in a project
 */
const getUserRoleInProject = async (projectId, userId) => {
  const query = `
    SELECT role
    FROM project_members
    WHERE project_id = $1 AND user_id = $2;
  `;

  const result = await pool.query(query, [projectId, userId]);
  return result.rows[0] || null;
};

/**
 * Check if project exists
 */
const getProjectById = async (projectId) => {
  const query = `
    SELECT id, name
    FROM projects
    WHERE id = $1;
  `;

  const result = await pool.query(query, [projectId]);
  return result.rows[0] || null;
};



module.exports = {
  createProject,
  addProjectMember,
  getProjectsForUser,
  getProjectById,
  getUserRoleInProject
};
