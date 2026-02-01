const authService = require("./auth.service");

/**
 * POST /auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Minimal input presence check (shape validation comes later)
    if (!email || !password) {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Email and password are required"
      });
    }

    const result = await authService.login(email, password);

    return res.status(200).json({
      message: "Login successful",
      data: result
    });
  } catch (error) {
    // Forward to global error handler
    next(error);
  }
};

/**
 * POST /auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "INVALID_REQUEST",
        message: "Name, email and password are required"
      });
    }

    const result = await authService.signup(name, email, password);

    return res.status(201).json({
      data: result
    });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  login,
  signup
};
