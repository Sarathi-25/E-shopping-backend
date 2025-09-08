// categoryRoutes.js
import express from "express";
import {
  getCategories,
  addCategory,
  uploadCategorySlides,
  deleteSlide,
  deleteCategory,
} from "../controllers/categoryController.js";
import { authMiddleware, isAdmin } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// ✅ Setup Multer here
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

const upload = multer({ storage });

router.get("/", getCategories);
router.post("/", authMiddleware, isAdmin, addCategory);

// ✅ Use the inline multer setup
router.post(
  "/:id/slides",
  authMiddleware,
  isAdmin,
  upload.array("slides", 5), // multiple uploads
  uploadCategorySlides
);

router.delete("/:id/slides", authMiddleware, isAdmin, deleteSlide);
router.delete("/:id", authMiddleware, isAdmin, deleteCategory);

export default router;
