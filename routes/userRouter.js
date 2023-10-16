const express = require("express");

const { authMiddleware } = require("../middlewares/authMiddleware.js");
const userController = require("../controllers/userController.js");

const router = express.Router();

router.get("/nearby", authMiddleware, userController.userListByMeDistance);
router.get("/profile/:userId", authMiddleware, userController.profile);
router.get("/:userId", userController.checkUserId);

module.exports = router;
