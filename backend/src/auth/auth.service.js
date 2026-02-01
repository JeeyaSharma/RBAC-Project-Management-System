const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRepository = require("../repositories/user.repository");
const {
  UnauthorizedError,
  ForbiddenError,
  AppError
} = require("../common/errors");

/**
 * Authenticate user and generate JWT
 * @param {string} email
 * @param {string} password
 * @returns {Object}
 */
const login = async (email, password) => {
  // 1. Fetch user by email
  const user = await userRepository.findByEmail(email);

  if (!user) {
    // Do NOT reveal whether email exists
    throw new UnauthorizedError("Invalid email or password");
  }

  // 2. Check if user is active
  if (!user.is_active) {
    throw new ForbiddenError("User account is inactive");
  }

  // 3. Compare password
  const passwordMatch = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  // 4. Generate JWT
  const payload = {
    userId: user.id
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m"
  });

  // 5. Return safe response (NO password)
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email
    }
  };
};


const signup = async (name, email, password) => {
  // 1. Check if email already exists
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new AppError(
      "Email already registered",
      409,
      "EMAIL_ALREADY_EXISTS"
    );
  }

  // 2. Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // 3. Create user
  const user = await userRepository.createUser({
    name,
    email,
    passwordHash
  });

  return {
    message: "User registered successfully",
    user
  };
};

module.exports = {
  login,
  signup
};
