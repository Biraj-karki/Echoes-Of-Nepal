// backend/routes/authRoutes.js
import express from "express";
import {
  register,
  login,
  googleAuth,
  getMe,
  verifyEmail,
  resendVerificationEmail,
} from "../controllers/authController.js";
import {
  requestPasswordReset,
  resetPassword,
} from "../controllers/passwordController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Email/password auth
router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationEmail);
router.post("/login", login);

// Google auth
router.post("/google", googleAuth);

// Current user (protected)
router.get("/me", protect, getMe);

// 🔹 Forgot / reset password
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

export default router;
