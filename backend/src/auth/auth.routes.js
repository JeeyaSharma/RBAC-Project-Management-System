const express = require("express");
const authController = require("./auth.controller");

const router = express.Router();

// POST /auth/login
router.post("/login", authController.login);

// POST /auth/signup
router.post("/signup", authController.signup);


module.exports = router;
