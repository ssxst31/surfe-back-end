import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import * as myController from "../controllers/myController.js";

import { upload } from "../utils/multer.js";

const router = express.Router();

router.get("/profile", authMiddleware, myController.profile);
router.post("/location", authMiddleware, myController.location);
router.post(
  "/upload",
  authMiddleware,
  upload.single("image"),
  myController.upload
);
router.post("/friends", authMiddleware, myController.addFriend);
router.post("/friends/cancel", authMiddleware, myController.deleteFriend);
router.get("/friends", authMiddleware, myController.friendList);
router.get("/friend-requests", authMiddleware, myController.friendRequestList);

export default router;