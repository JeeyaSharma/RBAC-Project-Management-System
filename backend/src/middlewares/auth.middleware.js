const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/user.repository");
const { UnauthorizedError } = require("../common/errors");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // 1. Check Authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authentication token missing");
    }

    // 2. Extract token
    const token = authHeader.split(" ")[1];

    // 3. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw new UnauthorizedError("Invalid or expired token");
    }

    // 4. Extract userId from token
    const { userId } = decoded;

    if (!userId) {
      throw new UnauthorizedError("Invalid token payload");
    }

    // 5. Fetch user from DB
    const user = await userRepository.findById(userId);

    if (!user || !user.is_active) {
      throw new UnauthorizedError("User not authorized");
    }

    // 6. Attach user to request
    req.user = user;

    // 7. Continue
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
