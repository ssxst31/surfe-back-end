import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", authMiddleware, userController.profile);
router.get(
  "/userListByMeDistance",
  authMiddleware,
  userController.userListByMeDistance
);

export default router;
