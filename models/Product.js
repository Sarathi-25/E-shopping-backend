import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price must be a positive number"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    brand: {
      type: String,
      default: "Generic",
    },
    description: {
      type: String,
      default: "",
    },
    image: {
      type: String, // main image (URL or base64 for now)
      default: "",
    },
    images: {
      type: [String], // optional gallery of images
      default: [],
    },
    specifications: {
      type: [String],
      default: [],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    numericId: {
      type: Number,
      unique: true,
    },
  },
  { timestamps: true }
);

// ✅ Auto-increment numericId before saving
productSchema.pre("save", async function (next) {
  if (!this.numericId) {
    const last = await this.constructor.findOne().sort({ numericId: -1 });
    this.numericId = last ? last.numericId + 1 : 1;
  }
  next();
});

export default mongoose.model("Product", productSchema);
