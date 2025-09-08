// models/Order.js
import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userEmail: { type: String, required: true },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
      },
    ],
    shippingDetails: {
      fullName: String,
      address: String,
      city: String,
      postalCode: String,
      phone: String,
    },
    paymentMethod: String,
    totalAmount: Number,
    orderDate: {
      type: String,
      default: () => new Date().toISOString(),
    },
    status: {
      type: String,
      enum: ["Processing", "Cancelled", "Completed"],
      default: "Processing",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
