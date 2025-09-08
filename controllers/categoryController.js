import Category from "../models/Category.js";
import fs from "fs";

// GET all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// POST add category
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: "Category name required" });
    }

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: "Category already exists" });
    }

    const category = await Category.create({ name });
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add category" });
  }
};

export const uploadCategoryImage = async (req, res) => {
  try {
    const { id } = req.params; // category id
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ error: "Category not found" });

    // Save file path (assuming multer saves in /uploads)
    category.slides.push(`/uploads/${req.file.filename}`);
    await category.save();

    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Remove image from category
export const deleteSlide = async (req, res) => {
  try {
    const { id } = req.params;
    const { slide } = req.body; // frontend sends { slide: "/uploads/xyz.jpg" }

    const category = await Category.findById(id);
    if (!category)
      return res.status(404).json({ message: "Category not found" });

    // Remove slide from DB
    category.slides = category.slides.filter((s) => s !== slide);
    await category.save();

    // Optionally also delete file from server
    const filePath = `.${slide}`;
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      message: "Slide deleted successfully",
      slides: category.slides,
    });
  } catch (err) {
    console.error("Delete slide error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const uploadCategorySlides = async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Convert uploaded files into paths
    const newSlides = req.files.map((file) => `/uploads/${file.filename}`);

    // Append new slides to existing ones
    category.slides = [...(category.slides || []), ...newSlides];
    await category.save();

    res.json(category); // ✅ return updated category
  } catch (err) {
    console.error("Upload slides error:", err);
    res.status(500).json({ error: "Failed to upload slides" });
  }
};
// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Optional: also remove all slide files from server
    if (category.slides && category.slides.length > 0) {
      category.slides.forEach((slide) => {
        const filePath = `.${slide}`;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("Delete category error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
