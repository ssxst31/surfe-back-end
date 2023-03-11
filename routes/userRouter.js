import express from "express";

import * as authController from "../controllers/authController.js";

const router = express.Router();

router.post("/login", authController.login);
router.post("/create", authController.signUp);
router.post("/profile", authController.profile);

export default router;
