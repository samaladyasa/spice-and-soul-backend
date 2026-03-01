const nodemailer = require('nodemailer');

// Create transporter with Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

class EmailClient {
  async sendResetCodeEmail(email, code) {
    try {
      const mailOptions = {
        from: `"Spice & Soul" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Password Reset Code - Spice & Soul',
        html: this.getResetCodeEmailTemplate(code)
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  getResetCodeEmailTemplate(code) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d35400;">Password Reset Request</h2>
        <p>Hello,</p>
        <p>You requested to reset your password for your Spice & Soul account. Please use the code below to proceed:</p>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <h1 style="color: #d35400; letter-spacing: 5px; margin: 0;">${code}</h1>
        </div>
        <p><strong>This code will expire in 1 hour.</strong></p>
        <p>If you didn't request a password reset, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">© 2026 Spice & Soul Restaurant. All rights reserved.</p>
      </div>
    `;
  }

  async sendOrderConfirmationEmail(email, orderId, items, total) {
    try {
      const mailOptions = {
        from: `"Spice & Soul" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Order Confirmation - ${orderId}`,
        html: this.getOrderConfirmationTemplate(orderId, items, total)
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Order confirmation email sent:', result.messageId);
      return result;
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      throw error;
    }
  }

  getOrderConfirmationTemplate(orderId, items, total) {
    const itemsList = items
      .map(item => `<li>${item.name} × ${item.qty} = ₹${item.price * item.qty}</li>`)
      .join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d35400;">Order Confirmation</h2>
        <p>Thank you for your order!</p>
        <h3>Order ID: ${orderId}</h3>
        <h4>Items Ordered:</h4>
        <ul>${itemsList}</ul>
        <h3 style="color: #d35400;">Total: ₹${total}</h3>
        <p>Your order will be delivered soon. Track your order status on our website.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">© 2026 Spice & Soul Restaurant. All rights reserved.</p>
      </div>
    `;
  }
}

module.exports = new EmailClient();
