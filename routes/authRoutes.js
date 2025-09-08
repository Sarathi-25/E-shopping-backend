import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import {
  signup,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  forgotPassword,
} from "../controllers/authController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import { googleLogin } from "../controllers/authController.js";

const router = express.Router();

router.post("/google-login", googleLogin);
// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);

// Private routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

// Admin test
router.get("/admin-test", authMiddleware, isAdmin, (req, res) => {
  res.json({ message: "Admin access granted" });
});

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    // Generate JWT
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Redirect back to frontend with token
    res.redirect(`http://localhost:3000/LoginPage?token=${token}`);
  }
);

// Admin: get all users
router.get("/", authMiddleware, isAdmin, getAllUsers);

export default router;
