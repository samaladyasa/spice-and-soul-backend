const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendOrderConfirmationEmail(email, orderId, items, total) {
  const itemRows = items
    .map(
      (i) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #f5efe8;color:#333;font-size:14px;">${i.name}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f5efe8;text-align:center;color:#666;font-size:14px;">${i.qty}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #f5efe8;text-align:right;color:#333;font-size:14px;font-weight:600;">₹${i.price * i.qty}</td>
        </tr>`
    )
    .join("");

  const mailOptions = {
    from: `"Spice & Soul" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Order Confirmed — ${orderId}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f0eb;font-family:'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0eb;padding:30px 10px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <tr>
        <td style="background:linear-gradient(135deg,#d35400 0%,#ff9a56 100%);padding:36px 30px 28px;text-align:center;">
          <h1 style="margin:0;font-family:'Georgia','Times New Roman',serif;font-size:26px;color:#ffffff;font-weight:700;letter-spacing:0.5px;">Spice &amp; Soul</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Authentic Indian Cuisine</p>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 40px 20px;">

          <div style="text-align:center;margin:0 0 24px;">
            <span style="display:inline-block;background:#e8f8ef;color:#27ae60;font-size:14px;font-weight:700;padding:8px 20px;border-radius:20px;">
              ✓ Order Confirmed
            </span>
          </div>

          <h2 style="margin:0 0 4px;font-size:20px;color:#2c2c2c;font-weight:700;">Thank you for your order!</h2>
          <p style="margin:0 0 20px;color:#888;font-size:13px;">Order ID: <strong style="color:#d35400;">${orderId}</strong></p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;border-radius:10px;overflow:hidden;border:1px solid #f0e8e0;">
            <tr style="background:#fef8f2;">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:#b07040;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Item</th>
              <th style="padding:10px 12px;text-align:center;font-size:12px;color:#b07040;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Qty</th>
              <th style="padding:10px 12px;text-align:right;font-size:12px;color:#b07040;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Amount</th>
            </tr>
            ${itemRows}
          </table>

          <div style="background:linear-gradient(135deg,#fff8f3 0%,#ffeedd 100%);border-radius:10px;padding:16px 20px;text-align:right;margin:0 0 24px;">
            <span style="font-size:13px;color:#888;margin-right:12px;">Total</span>
            <span style="font-size:24px;font-weight:800;color:#d35400;">₹${total}</span>
          </div>

          <p style="color:#666;font-size:14px;line-height:1.6;margin:0;text-align:center;">
            🚀 Your order is being prepared and will be delivered soon!
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:0 40px;">
          <hr style="border:none;border-top:1px solid #f0e8e0;margin:0;">
        </td>
      </tr>

      <tr>
        <td style="padding:20px 40px 28px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;color:#d35400;font-weight:600;">Spice &amp; Soul Restaurant</p>
          <p style="margin:0 0 12px;color:#aaa;font-size:11px;">Authentic flavours, unforgettable experiences</p>
          <p style="margin:0;color:#ccc;font-size:11px;">&copy; ${new Date().getFullYear()} Spice &amp; Soul. All rights reserved.</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>
    `,
  };
  const result = await transporter.sendMail(mailOptions);
  console.log("Order confirmation email sent:", result.messageId);
  return result;
}

async function sendReservationEmails({ name, email, phone, date, time, guests, requests }) {
  const year = new Date().getFullYear();

  if (email) {
    await transporter.sendMail({
      from: `"Spice & Soul" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "🍽️ Your Table is Booked — Spice & Soul",
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f0eb;font-family:'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0eb;padding:30px 10px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr>
        <td style="background:linear-gradient(135deg,#d35400 0%,#ff9a56 100%);padding:36px 30px 28px;text-align:center;">
          <h1 style="margin:0;font-family:'Georgia','Times New Roman',serif;font-size:26px;color:#ffffff;font-weight:700;">Spice &amp; Soul</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Authentic Indian Cuisine</p>
        </td>
      </tr>
      <tr>
        <td style="padding:36px 40px 20px;">
          <div style="text-align:center;margin:0 0 24px;">
            <span style="display:inline-block;background:#e8f8ef;color:#27ae60;font-size:14px;font-weight:700;padding:8px 20px;border-radius:20px;">✓ Booking Confirmed</span>
          </div>
          <h2 style="margin:0 0 8px;font-size:22px;color:#2c2c2c;font-weight:700;">Your table is reserved!</h2>
          <p style="margin:0 0 24px;color:#666;font-size:15px;line-height:1.6;">Hi ${name}, we're looking forward to welcoming you. Here are your booking details:</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;border-radius:10px;overflow:hidden;border:1px solid #f0e8e0;">
            <tr style="background:#fef8f2;">
              <td style="padding:12px 16px;font-size:13px;color:#b07040;font-weight:600;text-transform:uppercase;letter-spacing:1px;width:40%;">Date</td>
              <td style="padding:12px 16px;font-size:15px;color:#2c2c2c;font-weight:600;">${date}</td>
            </tr>
            <tr style="border-top:1px solid #f0e8e0;">
              <td style="padding:12px 16px;font-size:13px;color:#b07040;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Time</td>
              <td style="padding:12px 16px;font-size:15px;color:#2c2c2c;font-weight:600;">${time}</td>
            </tr>
            <tr style="border-top:1px solid #f0e8e0;">
              <td style="padding:12px 16px;font-size:13px;color:#b07040;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Guests</td>
              <td style="padding:12px 16px;font-size:15px;color:#2c2c2c;font-weight:600;">${guests} ${guests === "1" ? "person" : "people"}</td>
            </tr>
            <tr style="border-top:1px solid #f0e8e0;">
              <td style="padding:12px 16px;font-size:13px;color:#b07040;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Phone</td>
              <td style="padding:12px 16px;font-size:15px;color:#2c2c2c;font-weight:600;">${phone}</td>
            </tr>
            ${requests ? `<tr style="border-top:1px solid #f0e8e0;"><td style="padding:12px 16px;font-size:13px;color:#b07040;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Requests</td><td style="padding:12px 16px;font-size:14px;color:#555;">${requests}</td></tr>` : ""}
          </table>
          <div style="background:#fef8f2;border-left:4px solid #d35400;border-radius:0 8px 8px 0;padding:14px 18px;margin:0 0 10px;">
            <p style="margin:0;color:#666;font-size:14px;line-height:1.6;">📞 We will call <strong style="color:#2c2c2c;">${phone}</strong> shortly to confirm your reservation.</p>
          </div>
        </td>
      </tr>
      <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #f0e8e0;margin:0;"></td></tr>
      <tr>
        <td style="padding:20px 40px 28px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;color:#d35400;font-weight:600;">Spice &amp; Soul Restaurant</p>
          <p style="margin:0 0 12px;color:#aaa;font-size:11px;">Near College Square, Main Road, Bhawanipatna, Odisha 766001</p>
          <p style="margin:0;color:#ccc;font-size:11px;">&copy; ${year} Spice &amp; Soul. All rights reserved.</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
    });
    console.log("Reservation customer email sent to:", email);
  }


  await transporter.sendMail({
    from: `"Spice & Soul Reservations" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: `📋 New Reservation — ${name} on ${date} at ${time}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f4f0eb;font-family:'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0eb;padding:30px 10px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
      <tr>
        <td style="background:linear-gradient(135deg,#d35400 0%,#ff9a56 100%);padding:28px 30px;text-align:center;">
          <h1 style="margin:0;font-family:'Georgia',serif;font-size:22px;color:#ffffff;font-weight:700;">New Table Reservation</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.85);font-size:12px;letter-spacing:1px;text-transform:uppercase;">Spice &amp; Soul</p>
        </td>
      </tr>
      <tr>
        <td style="padding:30px 40px 20px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #f0e8e0;">
            <tr style="background:#fef8f2;">
              <td style="padding:12px 16px;font-size:13px;color:#b07040;font-weight:600;text-transform:uppercase;letter-spacing:1px;width:35%;">Name</td>
              <td style="padding:12px 16px;font-size:15px;color:#2c2c2c;font-weight:700;">${name}</td>
            </tr>
            <tr style="border-top:1px solid #f0e8e0;">
              <td style="padding:12px 16px;font-size:13px;color:#b07040;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Phone</td>
              <td style="padding:12px 16px;font-size:15px;color:#2c2c2c;font-weight:700;">${phone}</td>
            </tr>
            ${email ? `<tr style="border-top:1px solid #f0e8e0;"><td style="padding:12px 16px;font-size:13px;color:#b07040;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Email</td><td style="padding:12px 16px;font-size:15px;color:#2c2c2c;">${email}</td></tr>` : ""}
            <tr style="border-top:1px solid #f0e8e0;">
              <td style="padding:12px 16px;font-size:13px;color:#b07040;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Date</td>
              <td style="padding:12px 16px;font-size:15px;color:#2c2c2c;font-weight:600;">${date}</td>
            </tr>
            <tr style="border-top:1px solid #f0e8e0;">
              <td style="padding:12px 16px;font-size:13px;color:#b07040;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Time</td>
              <td style="padding:12px 16px;font-size:15px;color:#2c2c2c;font-weight:600;">${time}</td>
            </tr>
            <tr style="border-top:1px solid #f0e8e0;">
              <td style="padding:12px 16px;font-size:13px;color:#b07040;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Guests</td>
              <td style="padding:12px 16px;font-size:15px;color:#2c2c2c;font-weight:600;">${guests} ${guests === "1" ? "person" : "people"}</td>
            </tr>
            ${requests ? `<tr style="border-top:1px solid #f0e8e0;"><td style="padding:12px 16px;font-size:13px;color:#b07040;font-weight:600;text-transform:uppercase;letter-spacing:1px;">Requests</td><td style="padding:12px 16px;font-size:14px;color:#555;">${requests}</td></tr>` : ""}
          </table>
          <div style="background:#fff3cd;border-left:4px solid #d35400;border-radius:0 8px 8px 0;padding:14px 18px;margin:20px 0 0;">
            <p style="margin:0;color:#666;font-size:14px;font-weight:600;">📞 ACTION REQUIRED: Call <strong style="color:#d35400;">${phone}</strong> to confirm this reservation.</p>
          </div>
        </td>
      </tr>
      <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #f0e8e0;margin:0;"></td></tr>
      <tr>
        <td style="padding:16px 40px 24px;text-align:center;">
          <p style="margin:0;color:#ccc;font-size:11px;">Spice &amp; Soul Reservation System &copy; ${year}</p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`,
  });
  console.log("Reservation admin notification sent");
}

module.exports = { sendOrderConfirmationEmail, sendReservationEmails };
