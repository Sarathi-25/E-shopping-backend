import { Router } from "express";
import Product from "../models/Product.js"; // Make sure schema matches
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/multer.js";

const router = Router();

// Create product
router.post(
  "/",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const { name, price, category, brand, description, specifications } =
        req.body;
      const image = req.file ? `/${req.file.path}`.replace(/\\/g, "/") : "";

      const product = await Product.create({
        name,
        price,
        category,
        brand,
        description,
        specifications: specifications
          ? specifications.split(",").map((s) => s.trim())
          : [],
        image,
        images: image ? [image] : [],
      });

      res.json(product);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Update product
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      const updates = { ...req.body };
      if (updates.specifications)
        updates.specifications = updates.specifications
          .split(",")
          .map((s) => s.trim());
      if (req.file) {
        const img = `/${req.file.path}`.replace(/\\/g, "/");
        updates.image = img;
        const prod = await Product.findById(req.params.id);
        updates.images = Array.isArray(prod.images)
          ? [...prod.images, img]
          : [img];
      }

      const updated = await Product.findByIdAndUpdate(req.params.id, updates, {
        new: true,
      });
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete product
router.delete("/:id", authMiddleware, isAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
