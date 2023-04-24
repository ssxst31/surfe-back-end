import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.get("/nearby", authMiddleware, userController.userListByMeDistance);
router.get("/profile/:userId", authMiddleware, userController.profile);

export default router;
