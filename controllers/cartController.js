import mongoose from "mongoose";
import Cart from "../models/cart.js";
import Product from "../models/Product.js";

// Get cart
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );
    if (!cart) return res.json([]);
    res.json(cart.items);
  } catch (err) {
    console.error("Get cart error:", err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

// Add item to cart
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid productId" });
    }

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });

    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

    const existingItem = cart.items.find(
      (it) => it.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity += Number(quantity);
    } else {
      cart.items.push({ productId, quantity: Number(quantity) });
    }

    await cart.save();
    const updated = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );
    res.json(updated.items);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ error: "Failed to add to cart" });
  }
};

// Update item quantity
export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ error: "Invalid productId" });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    const item = cart.items.find((it) => it.productId.toString() === productId);
    if (!item) return res.status(404).json({ error: "Item not found" });

    item.quantity = Number(quantity);
    await cart.save();

    const updated = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );
    res.json(updated.items);
  } catch (err) {
    console.error("Update cart error:", err);
    res.status(500).json({ error: "Failed to update item" });
  }
};

// Remove item
export const removeCartItem = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ error: "Cart not found" });

    cart.items = cart.items.filter(
      (it) => it.productId.toString() !== productId
    );

    await cart.save();
    const updated = await Cart.findOne({ userId: req.user.id }).populate(
      "items.productId"
    );
    res.json(updated.items);
  } catch (err) {
    console.error("Remove item error:", err);
    res.status(500).json({ error: "Failed to remove item" });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { items: [] } }
    );
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("Clear cart error:", err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
};
