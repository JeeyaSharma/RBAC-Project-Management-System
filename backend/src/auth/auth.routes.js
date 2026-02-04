const express = require("express");
const authController = require("./auth.controller");
const validate = require("../middlewares/validation.middleware");
const {signupSchema,loginSchema} = require("../validators/auth.schema");

const router = express.Router();

// POST /auth/login
router.post("/login", validate(loginSchema), authController.login);

// POST /auth/signup
router.post("/signup", validate(signupSchema), authController.signup);


module.exports = router;
