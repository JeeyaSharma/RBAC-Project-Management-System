const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userRepository = require("../repositories/user.repository");
const {
  UnauthorizedError,
  ForbiddenError,
  AppError
} = require("../common/errors");

const login = async (email, password) => {
  const user = await userRepository.findByEmail(email);

  if (!user) {
    throw new UnauthorizedError("Invalid email or password");
  }

  if (!user.is_active) {
    throw new ForbiddenError("User account is inactive");
  }

  const passwordMatch = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!passwordMatch) {
    throw new UnauthorizedError("Invalid email or password");
  }

  const payload = { userId: user.id };

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
    algorithm: "HS256"
  });

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
  const existingUser = await userRepository.findByEmail(email);

  if (existingUser) {
    throw new AppError(
      "Email already registered",
      409,
      "EMAIL_ALREADY_EXISTS"
    );
  }

  const saltRounds =
    Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await userRepository.createUser({
    name,
    email,
    passwordHash
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email
  };
};

module.exports = {
  login,
  signup
};
