import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import * as userController from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", authMiddleware, userController.profile);
router.get(
  "/userListByMeDistance",
  authMiddleware,
  userController.userListByMeDistance
);
router.post("/location", authMiddleware, userController.location);

export default router;
