const authService = require("./auth.service");

/**
 * POST /auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);

    return res.status(200).json({
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /auth/signup
 */
const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

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
