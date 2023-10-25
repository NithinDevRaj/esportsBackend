import express, { Router } from "express";
const router = express.Router();
import {
  loginUser,
  registerUser,
  logoutUser,
  changePassword,
  sentOtpForgotPasword,
  sentOtpRegister,
  googleAuth,
} from "../controllers/authController.js";
import { acceptRecruitment, getProfile, getSchedule, getStream } from "../controllers/fansController.js";
import { updateProfile } from "../controllers/fansController.js";
import { upload, videoUpload } from "../middlewares/multer.js";
import { protect } from "../middlewares/authMiddleware.js";

// Login User (POST)
router.post("/login", loginUser);

// Register User (POST)
router.post("/register", registerUser);

// Logout User (POST)
router.post("/logout", logoutUser);

// Send OTP for Registration (POST)
router.post("/sentOtp", sentOtpRegister);

// Send OTP for Forgot Password (POST)
router.post("/sentOtpForgotpassword", sentOtpForgotPasword);

// Update Password (PATCH)
router.patch("/updatePassword", changePassword);

//Goole Login and Register (POST)
router.post("/google-auth", googleAuth);

//profile update

router.post("/profile", upload.single("profilePhoto"), updateProfile);
router.patch("/profile",getProfile)
router.patch("/accept-recruit", videoUpload.single("file"), acceptRecruitment);
router.get("/getStreams",getStream)
router.get("/schedule",getSchedule)
export default router;
