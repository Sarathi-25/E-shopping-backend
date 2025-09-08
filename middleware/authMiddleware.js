import jwt from "jsonwebtoken";
import User from "../models/user.js";

// -------------------- Auth Middleware --------------------
// Verifies JWT and attaches user to req
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // attach user to request
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(500).json({ message: "Server error in auth middleware" });
  }
};

// -------------------- Admin Middleware --------------------
// Checks if user has admin role
export const isAdmin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }

  next();
};
