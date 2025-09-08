import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";

dotenv.config();
const app = express();
app.use(express.json());
// ✅ Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*", // frontend URL or allow all
    credentials: true,
  })
);

app.use("/api/categories", categoryRoutes);
// Parse JSON (set high limit for images if sending base64)
app.use(express.json({ limit: "10mb" }));

// ✅ Static folder for uploaded images
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// ✅ API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // <-- product images handled inside
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/home", homeRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.status(200).json({ message: "🚀 API is running..." });
});

// ✅ MongoDB Connection + Server Start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env file");
  process.exit(1);
}

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: "E-Commerce",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server Listening on ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1);
  }
};

startServer();
