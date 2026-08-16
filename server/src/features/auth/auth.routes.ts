import { Router } from "express";
import { sendOtp, verifyOtp, updateProfile, getMe } from "./auth.controller";
import { authenticate } from "../../middleware/authMiddleware";

const router = Router();

// Public OTP endpoints
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Protected user endpoints (Require Bearer Token)
router.put("/profile", authenticate, updateProfile);
router.get("/me", authenticate, getMe);

export default router;
