import express from "express";
import {
  placeOrder,
  cancelOrder,
  getOrdersForUser,
  getAllOrders,
} from "../controllers/orderController.js";

import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Place a new order (user info taken from token)
router.post("/place", authMiddleware, placeOrder);

// ✅ Cancel an order
router.put("/cancel/:id", authMiddleware, cancelOrder);

// ✅ Get orders for logged-in user
router.get("/me", authMiddleware, getOrdersForUser);

// ✅ Admin - Get all orders
router.get("/", authMiddleware, isAdmin, getAllOrders);

export default router;
