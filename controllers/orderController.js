import Order from "../models/Order.js";
import { sendEmail } from "../utils/sendEmail.js";
import { generateOrderEmail } from "../utils/orderEmailTemplate.js";

// ===================== PLACE ORDER =====================
// POST /api/orders/place
export const placeOrder = async (req, res) => {
  try {
    const { items, shippingDetails, paymentMethod, totalAmount } = req.body;

    // Save order with logged-in user's email from JWT
    const newOrder = new Order({
      items,
      shippingDetails,
      paymentMethod,
      totalAmount,
      userEmail: req.user.email, // from authMiddleware
    });

    await newOrder.save();

    // Prepare email
    const userName = shippingDetails?.fullName || "Customer";

    const emailContent = generateOrderEmail(userName, {
      orderId: newOrder._id,
      items: items.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      totalAmount,
      shippingDetails,
    });

    // Send email
    await sendEmail(
      newOrder.userEmail,
      "Your NexBuy Order is Confirmed!",
      emailContent
    );

    res
      .status(201)
      .json({ message: "Order placed and email sent!", order: newOrder });
  } catch (err) {
    console.error("Place order error:", err.message);
    res.status(500).json({ message: "Failed to place order" });
  }
};

// ===================== CANCEL ORDER =====================
// PUT /api/orders/cancel/:id
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, status: "Processing" },
      { status: "Cancelled" },
      { new: true }
    );

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found or already cancelled" });
    }

    res.json(order);
  } catch (err) {
    console.error("Cancel order error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// ===================== GET USER ORDERS =====================
// GET /api/orders/me
export const getOrdersForUser = async (req, res) => {
  try {
    const userEmail = req.user.email;
    if (!userEmail) {
      return res.status(400).json({ error: "User email not found in token" });
    }

    const orders = await Order.find({ userEmail }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Fetch orders error:", err.message);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// ===================== GET ALL ORDERS (Admin) =====================
// GET /api/orders


export const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments();
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      orders,
      pagination: {
        totalOrders,
        currentPage: page,
        totalPages: Math.ceil(totalOrders / limit),
      },
    });
  } catch (err) {
    console.error("Get all orders error:", err);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
};