import express from "express";

import * as userController from "../controllers/userController.js";

const router = express.Router();

router.post("/profile", userController.profile);
router.get("/list", userController.list);

export default router;
