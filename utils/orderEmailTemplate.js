export const generateOrderEmail = (userName, order) => {
  // Estimated delivery: 7 days from now
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  const deliveryDateStr = deliveryDate.toDateString();

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:12px; font-size:14px; font-weight:500;">${item.name}</td>
          <td style="padding:12px; font-size:14px;">${item.quantity}</td>
          <td style="padding:12px; font-size:14px;">₹${item.price}</td>
        </tr>`
    )
    .join("");

  return `
  <div style="font-family: 'Helvetica', Arial, sans-serif; max-width:800px; margin:auto; background:#f7f7f7; padding:20px; border-radius:10px; border:1px solid #ddd;">
    
    <div style="background:#fff; padding:25px; border-radius:12px;">
      <h2 style="color:#FF9900; text-align:center; margin-bottom:20px;">🛒 NexBuy Order Confirmed!</h2>
      <p style="font-size:16px;">Hi <strong>${userName}</strong>,</p>
      <p style="font-size:14px;">Thank you for shopping with NexBuy! Your order <strong>#${order.orderId}</strong> has been placed successfully.</p>
      
      <!-- Progress Tracker -->
      <div style="margin:50px 0;">
        <h3 style="margin-bottom:25px; font-size:18px;">Order Progress</h3>
        <div style="position:relative; display:flex; justify-content:space-between; align-items:flex-start; gap:60px; margin:0 10px;">
          <div style="position:absolute; top:27px; left:40px; right:40px; height:4px; background:#ccc; z-index:0;"></div>

          <div style="width:80px; text-align:center; position:relative; z-index:1;">
            <div style="width:60px; height:60px; border-radius:50%; background:#4CAF50; margin:auto; line-height:60px; color:white; font-weight:bold; font-size:22px;">✔</div>
            <small style="display:block; margin-top:12px; font-size:15px;">Confirmed</small>
          </div>

          <div style="width:80px; text-align:center; position:relative; z-index:1;">
            <div style="width:60px; height:60px; border-radius:50%; background:#FF9800; margin:auto; line-height:60px; color:white; font-weight:bold; font-size:22px;">📦</div>
            <small style="display:block; margin-top:12px; font-size:15px;">Packed</small>
          </div>

          <div style="width:80px; text-align:center; position:relative; z-index:1;">
            <div style="width:60px; height:60px; border-radius:50%; background:#ccc; margin:auto; line-height:60px; color:#555; font-weight:bold; font-size:22px;">🚚</div>
            <small style="display:block; margin-top:12px; font-size:15px;">Shipped</small>
          </div>

          <div style="width:80px; text-align:center; position:relative; z-index:1;">
            <div style="width:60px; height:60px; border-radius:50%; background:#ccc; margin:auto; line-height:60px; color:#555; font-weight:bold; font-size:22px;">🏠</div>
            <small style="display:block; margin-top:12px; font-size:15px;">Delivered</small>
          </div>
        </div>
        <div style="text-align:right; margin-top:20px; font-size:15px; color:#333;">
          Estimated Delivery: <strong>${deliveryDateStr}, 9AM - 9PM</strong>
        </div>
      </div>

      <!-- Order Summary Card -->
      <table style="width:100%; border-collapse:collapse; background:#fff; padding:20px; border-radius:10px; border:1px solid #eee; margin-bottom:20px;">
        <tr>
          <th style="padding:12px; text-align:left; background:#f5f5f5;">Product</th>
          <th style="padding:12px; text-align:left; background:#f5f5f5;">Qty</th>
          <th style="padding:12px; text-align:left; background:#f5f5f5;">Price</th>
        </tr>
        ${itemsHtml}
        <tr>
          <td colspan="2" style="padding:12px; text-align:right; font-weight:bold;">Total</td>
          <td style="padding:12px; font-weight:bold;">₹${order.totalAmount}</td>
        </tr>
      </table>

      <!-- Track Order Button (VISIBLE FIRST) -->
      <div style="text-align:center; margin-bottom:20px;">
        <a href="https://www.nexbuy.com/orders/${order.orderId}" 
          style="background:#FF9900; color:white; text-decoration:none; padding:15px 35px; border-radius:6px; display:inline-block; font-weight:bold; font-size:16px;">
          Track Your Order
        </a>
      </div>

      <!-- Shipping Info Card -->
      <table style="width:100%; border-collapse:collapse; background:#fff; padding:20px; border-radius:10px; border:1px solid #eee; margin-bottom:20px;">
        <tr>
          <th style="text-align:left; font-size:16px; padding-bottom:10px;">Shipping Details</th>
        </tr>
        <tr>
          <td style="font-size:14px; padding:4px;"><strong>${order.shippingDetails.fullName}</strong></td>
        </tr>
        <tr>
          <td style="font-size:14px; padding:4px;">${order.shippingDetails.address}</td>
        </tr>
        <tr>
          <td style="font-size:14px; padding:4px;">${order.shippingDetails.city}, ${order.shippingDetails.postalCode}</td>
        </tr>
        <tr>
          <td style="font-size:14px; padding:4px;">📞 ${order.shippingDetails.phone}</td>
        </tr>
      </table>

      <hr style="margin:30px 0; border:none; border-top:1px solid #eee;" />

      <!-- Extra Shopping Info -->
      <div style="font-size:13px; color:#666; line-height:1.6;">
        <p>🔄 Easy Returns: Items can be returned within <strong>7 days</strong> of delivery.</p>
        <p>💳 Secure Payment: All transactions are processed safely with encryption.</p>
        <p>📞 Customer Support: For queries, call us at <strong>1800-577-846</strong> or email <a href="mailto:support@nexbuy.com">support@nexbuy.com</a>.</p>
        <p>🚚 Free Delivery: Enjoy free shipping on orders above ₹499.</p>
      </div>

      <p style="font-size:12px; color:#777; margin-top:20px;">If you did not place this order, contact NexBuy support immediately.</p>
      <p style="font-size:12px; color:#777;">&copy; 2025 NexBuy. All rights reserved.</p>
    </div>
  </div>
  `;
};
