// routes/homeRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Home from "../models/homeModel.js";
import {
  authMiddleware as protect,
  isAdmin,
} from "../middleware/authMiddleware.js";

const router = express.Router();

// ----------------- Ensure Upload Folder Exists -----------------
const uploadDir = "uploads/home";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ----------------- Multer Storage -----------------
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// ----------------- GET Slides -----------------
router.get("/slides", async (req, res) => {
  try {
    let home = await Home.findOne();
    if (!home) home = await Home.create({ slides: [] });

    // only return existing files
    const existingSlides = home.slides.filter((s) =>
      fs.existsSync(path.join(process.cwd(), s))
    );

    res.json(existingSlides);
  } catch (err) {
    console.error("GET /slides error:", err);
    res.status(500).json({ message: "Failed to load home slides" });
  }
});

// ----------------- UPLOAD Slides -----------------
router.post(
  "/slides",
  protect,
  isAdmin,
  upload.array("slides", 10),
  async (req, res) => {
    try {
      let home = await Home.findOne();
      if (!home) home = await Home.create({ slides: [] });

      const newSlides = req.files.map((f) => `/${uploadDir}/${f.filename}`);
      home.slides.push(...newSlides);
      await home.save();

      res.json({ message: "Slides uploaded", slides: home.slides });
    } catch (err) {
      console.error("POST /slides error:", err);
      res.status(500).json({ message: "Failed to upload slides" });
    }
  }
);

// ----------------- DELETE Slide -----------------
router.delete("/slides", protect, isAdmin, async (req, res) => {
  try {
    const { slide } = req.body;
    let home = await Home.findOne();
    if (!home) return res.status(404).json({ message: "No home slides found" });

    // Remove from DB
    home.slides = home.slides.filter((s) => s !== slide);
    await home.save();

    // Remove file from server safely
    const filePath = path.join(process.cwd(), slide);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted file: ${filePath}`);
    } else {
      console.warn(`File not found, skipping deletion: ${filePath}`);
    }

    res.json({ message: "Slide deleted", slides: home.slides });
  } catch (err) {
    console.error("DELETE /slides error:", err);
    res.status(500).json({ message: "Failed to delete slide" });
  }
});

export default router;
