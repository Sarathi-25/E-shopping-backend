import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/authMiddleware.js"; // use authMiddleware instead of verifyToken

const router = express.Router();

router.get("/", authMiddleware, getCart);
router.post("/add", authMiddleware, addToCart);
router.put("/update", authMiddleware, updateCartItem);
router.delete("/item/:productId", authMiddleware, removeCartItem);
router.delete("/", authMiddleware, clearCart);

export default router;
