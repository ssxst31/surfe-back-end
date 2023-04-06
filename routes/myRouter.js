import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import * as myController from "../controllers/myController.js";

const router = express.Router();

router.get("/profile", authMiddleware, myController.profile);
router.post("/location", authMiddleware, myController.location);

export default router;
