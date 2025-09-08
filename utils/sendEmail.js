import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Gmail account (e.g., orders.nexbuy@gmail.com)
        pass: process.env.EMAIL_PASS, // 16-character App Password
      },
    });

    const mailOptions = {
      from: `"NexBuy Orders" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully to", to);
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
  }
};
