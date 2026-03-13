const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const userController = require("./user.controller");

const router = express.Router();

router.get("/me/profile", authMiddleware, userController.getMyProfile);
router.get("/search", authMiddleware, userController.searchUsers);

module.exports = router;
