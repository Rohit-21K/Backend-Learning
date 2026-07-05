import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserProfile,
  updateUserAvatar,
  updateUserCoverImage,
} from "../controllers/user.controller.js";

const router = Router();

// routes define
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),

  registerUser
);
router.route("/login").post(loginUser);
router.route("/refresh-access-token").post(refreshAccessToken);

// secured route

router.route("/logout").post(verifyJWT, logoutUser);
router.route("/update-password").put(verifyJWT, changeCurrentPassword);
router.route("/getUser").put(verifyJWT, getCurrentUser);
router.route("/update-profile").put(verifyJWT, updateUserProfile);
router.route("/update-avatar").put(verifyJWT, updateUserAvatar);
router.route("/update-coverImage").put(verifyJWT, updateUserCoverImage);

export default router;
