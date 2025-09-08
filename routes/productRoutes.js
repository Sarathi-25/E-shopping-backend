import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImage,
} from "../controllers/productController.js";

import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";

// ----------------- Multer setup -----------------
const UPLOAD_DIR = "uploads";
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) =>
    cb(
      null,
      Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        path.extname(file.originalname)
    ),
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (!allowed)
      return cb(new Error("Only image files are allowed (jpg/png/webp)"));
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// ----------------- Routes -----------------
const router = Router();

// -------- Public Routes --------
router.get("/", listProducts);
router.get("/:id", getProductById);

// -------- Admin Routes --------
// Create a product
router.post(
  "/",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      await createProduct(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Update a product
router.put(
  "/:id",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      await updateProduct(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// Delete a product
router.delete("/:id", authMiddleware, isAdmin, async (req, res, next) => {
  try {
    await deleteProduct(req, res);
  } catch (err) {
    next(err);
  }
});

// Upload/Update product image only
router.post(
  "/:id/image",
  authMiddleware,
  isAdmin,
  upload.single("image"),
  async (req, res, next) => {
    try {
      await uploadProductImage(req, res);
    } catch (err) {
      next(err);
    }
  }
);

// -------- Error Handler for multer & routes --------
router.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  res.status(500).json({ message: err.message });
});

export default router;
