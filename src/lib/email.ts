'use server';

import nodemailer from 'nodemailer';
import type { Order, ProductOrderItem, ShippingDetails } from './types';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendOrderConfirmationEmail(
  shippingDetails: ShippingDetails,
  order: { id: string; total: number; products: ProductOrderItem[], razorpayPaymentId?: string; }
) {
  if (!shippingDetails.email) {
      console.error("Customer email is missing, cannot send confirmation.");
      return;
  }
  if (!process.env.GMAIL_EMAIL || !process.env.GMAIL_APP_PASSWORD) {
      console.warn("Gmail credentials not set in .env file. Skipping email.");
      return;
  }

  const productList = (order.products || [])
      .map(
        (item) =>
          `<li>${item.name} (Size: ${item.size || "One Size"}) - ₹${item.price.toFixed(2)} × ${
            item.quantity || 1
          }</li>`
      )
      .join("");

  const mailOptions = {
    from: `Beeboo Store 🖤 <${process.env.GMAIL_EMAIL}>`,
    to: shippingDetails.email,
    subject: `Your Beeboo Order #${order.id.substring(0, 6)} is Confirmed!`,
    html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #fafafa; color: #333;">
          <h2 style="color:#111;">Thank you for your order, ${shippingDetails.name}!</h2>
          <p>Your payment was successful. Here are your order details:</p>
          <ul style="list-style-type: none; padding: 0;">${productList}</ul>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p><b>Order ID:</b> ${order.id}<br>
          ${order.razorpayPaymentId ? `<b>Payment ID:</b> ${order.razorpayPaymentId}<br>` : ''}
          <b>Amount Paid:</b> ₹${order.total.toFixed(2)}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color:#555;">We’ll notify you once your order ships.</p>
          <p style="font-weight:bold;">— Beeboo Team 🖤</p>
        </div>
      `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${shippingDetails.email}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${shippingDetails.email}:`, error);
    // We don't re-throw the error, as the order itself was successful.
    // We just log it.
  }
}

export async function sendNewOrderAdminNotification(
  order: { id: string; total: number; products: ProductOrderItem[]; },
  shippingDetails: ShippingDetails
) {
    // This is a placeholder for notifying the admin.
    // In a real app, you might send this to a different, fixed admin email address.
    console.log('--- SIMULATING SENDING NEW ORDER NOTIFICATION TO ADMIN ---');
    console.log(`A new order #${order.id.substring(0,6)} was placed by ${shippingDetails.name} for ₹${order.total.toFixed(2)}.`);
    return Promise.resolve();
}
