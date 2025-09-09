import express from "express";
import {
  signup,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  forgotPassword,
  googleLogin,
} from "../controllers/authController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// -------- PUBLIC ROUTES --------
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/google-login", googleLogin); // ✅ Google login via token

// -------- PRIVATE ROUTES --------
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// -------- ADMIN ROUTES --------
router.get("/admin-test", authMiddleware, isAdmin, (req, res) => {
  res.json({ message: "Admin access granted" });
});

router.get("/", authMiddleware, isAdmin, getAllUsers);

export default router;
