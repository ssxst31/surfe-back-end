const express = require("express");

const authController = require("../controllers/authController.js");

const router = express.Router();

router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/create", authController.signUp);
router.post("/kakaoLogin", authController.kakaoLogin);

module.exports = router;
