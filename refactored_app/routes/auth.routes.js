import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";

const router = Router();

// Authentication endpoints
router.get("/sing-in", authController.getSignIn);
router.post("/sing-in", authController.postSignIn);
router.post("/sing-out", authController.postSignOut);

router.get("/sing-up", authController.getSignUp);
router.post("/sing-up", authController.postSignUp);

// Verification code handling
router.get("/verify", authController.getVerify);
router.post("/verify", authController.postVerify);

// Password operations
router.get("/change-password", authController.getChangePassword);
router.post("/change-password", authController.postChangePassword);
router.post("/change-passwordr", authController.postChangePasswordR);

router.get("/forget-password", authController.getForgetPassword);
router.post("/forget-password", authController.postForgetPassword);
router.post("/verforget-password", authController.postVerForgetPassword);

export default router;
