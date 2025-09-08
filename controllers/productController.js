import Product from "../models/Product.js";

// ---------------- PUBLIC ----------------

// Get all products
export const listProducts = async (_req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("List products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Get product error:", err);
    res.status(400).json({ error: "Invalid product ID" });
  }
};

// ---------------- ADMIN ----------------

// Create a new product
export const createProduct = async (req, res) => {
  try {
    const { name, price, category, brand, description, specifications, stock } =
      req.body;

    // ✅ Store only filename, not `/uploads/...`
    const image = req.file ? req.file.filename : "";

    const product = new Product({
      name,
      price,
      category,
      brand,
      description,
      stock,
      specifications: specifications
        ? specifications.split(",").map((s) => s.trim())
        : [],
      image,
      images: image ? [image] : [],
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("❌ Create product error:", err);
    res.status(400).json({ error: err.message || "Failed to create product" });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.specifications) {
      updates.specifications = updates.specifications
        .split(",")
        .map((s) => s.trim());
    }

    if (req.file) {
      const img = req.file.filename;
      updates.image = img;

      const prod = await Product.findById(id);
      updates.images = Array.isArray(prod.images)
        ? [...prod.images, img]
        : [img];
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedProduct)
      return res.status(404).json({ error: "Product not found" });

    res.json(updatedProduct);
  } catch (err) {
    console.error("❌ Update product error:", err);
    res.status(400).json({ error: err.message || "Failed to update product" });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Delete product error:", err);
    res.status(400).json({ error: err.message || "Failed to delete product" });
  }
};

// Upload / update product image only
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image provided" });

    const img = req.file.filename;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { image: img, $push: { images: img } },
      { new: true }
    );

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json({ message: "Image uploaded successfully", product });
  } catch (err) {
    console.error("❌ Upload image error:", err);
    res.status(500).json({ error: err.message || "Failed to upload image" });
  }
};
