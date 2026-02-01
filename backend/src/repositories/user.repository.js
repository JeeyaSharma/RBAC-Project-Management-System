const pool = require("../config/db");

/**
 * Fetch a user by email
 * @param {string} email
 * @returns {Object|null}
 */
const findByEmail = async (email) => {
  const query = `
    SELECT
      id,
      name,
      email,
      password_hash,
      is_active,
      created_at
    FROM users
    WHERE email = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [email]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

/**
 * Fetch a user by ID
 * @param {string} id
 * @returns {Object|null}
 */
const findById = async (id) => {
  const query = `
    SELECT
      id,
      name,
      email,
      is_active,
      created_at
    FROM users
    WHERE id = $1
    LIMIT 1;
  `;

  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return null;
  }

  return result.rows[0];
};

/**
 * Create a new user
 * @param {Object} user
 * @returns {Object}
 */
const createUser = async ({ name, email, passwordHash }) => {
  const query = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at;
  `;

  const values = [name, email, passwordHash];
  const result = await pool.query(query, values);

  return result.rows[0];
};


module.exports = {
  findByEmail,
  findById,
  createUser
};
