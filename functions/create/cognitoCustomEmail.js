const LOGO_URL = process.env.EMAIL_LOGO_URL || "https://spice-and-soul-menu-images-dev.s3.ap-south-1.amazonaws.com/favicon.png";

function emailShell(heading, bodyHtml) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f0eb;font-family:'Segoe UI',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f0eb;padding:30px 10px;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

      <!-- Header -->
      <tr>
        <td style="background:linear-gradient(135deg,#d35400 0%,#ff9a56 100%);padding:36px 30px 28px;text-align:center;">
          <img src="${LOGO_URL}" alt="&#127835;" width="48" height="48" style="display:block;margin:0 auto 8px;border-radius:50%;"/>
          <h1 style="margin:12px 0 0;font-family:'Georgia','Times New Roman',serif;font-size:26px;color:#ffffff;font-weight:700;letter-spacing:0.5px;">Spice &amp; Soul</h1>
          <p style="margin:6px 0 0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:1px;text-transform:uppercase;">Authentic Indian Cuisine</p>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:36px 40px 20px;">
          <h2 style="margin:0 0 8px;font-size:22px;color:#2c2c2c;font-weight:700;">${heading}</h2>
          ${bodyHtml}
        </td>
      </tr>

      <!-- Divider -->
      <tr>
        <td style="padding:0 40px;">
          <hr style="border:none;border-top:1px solid #f0e8e0;margin:0;">
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:20px 40px 28px;text-align:center;">
          <p style="margin:0 0 4px;font-size:13px;color:#d35400;font-weight:600;">Spice &amp; Soul Restaurant</p>
          <p style="margin:0 0 12px;color:#aaa;font-size:11px;">Authentic flavours, unforgettable experiences</p>
          <p style="margin:0;color:#ccc;font-size:11px;">&copy; ${year} Spice &amp; Soul. All rights reserved.</p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function codeBox(label) {
  return `<div style="background:linear-gradient(135deg,#fff8f3 0%,#ffeedd 100%);border:2px dashed #d35400;border-radius:12px;padding:24px 20px;text-align:center;margin:0 0 24px;">
            <p style="margin:0 0 8px;font-size:12px;color:#b07040;text-transform:uppercase;letter-spacing:2px;font-weight:600;">${label}</p>
            <h1 style="margin:0;font-size:40px;color:#d35400;letter-spacing:8px;font-weight:800;font-family:'Courier New',monospace;">{####}</h1>
          </div>`;
}

function getVerificationEmailHtml() {
  return emailShell("Verify Your Email", `
          <p style="margin:0 0 24px;color:#666;font-size:15px;line-height:1.6;">
            Welcome to Spice &amp; Soul! Use the code below to verify your email address and activate your account.
          </p>
          ${codeBox("Your Verification Code")}
          <div style="text-align:center;margin:0 0 28px;">
            <span style="display:inline-block;background:#fef3e7;color:#d35400;font-size:13px;font-weight:600;padding:6px 16px;border-radius:20px;">
              &#9201; Code expires in 10 minutes
            </span>
          </div>
          <p style="color:#888;font-size:13px;line-height:1.6;margin:0 0 6px;">Enter this code on the verification page to activate your account.</p>
          <p style="color:#aaa;font-size:12px;line-height:1.5;margin:0;">If you didn't sign up for Spice &amp; Soul, please ignore this email.</p>`);
}

function getForgotPasswordEmailHtml() {
  return emailShell("Reset Your Password", `
          <p style="margin:0 0 24px;color:#666;font-size:15px;line-height:1.6;">
            We received a request to reset your password. Use the code below to set a new password.
          </p>
          ${codeBox("Your Reset Code")}
          <div style="text-align:center;margin:0 0 28px;">
            <span style="display:inline-block;background:#fef3e7;color:#d35400;font-size:13px;font-weight:600;padding:6px 16px;border-radius:20px;">
              &#9201; Code expires in 10 minutes
            </span>
          </div>
          <p style="color:#888;font-size:13px;line-height:1.6;margin:0 0 6px;">Enter this code on the password-reset page to create a new password.</p>
          <p style="color:#aaa;font-size:12px;line-height:1.5;margin:0;">If you didn't request this, you can safely ignore this email &mdash; your password won't change.</p>`);
}

exports.handler = async (event) => {
  console.log("CustomMessage trigger:", event.triggerSource);

  switch (event.triggerSource) {
    case "CustomMessage_SignUp":
    case "CustomMessage_ResendCode":
      event.response.emailSubject = "Verify Your Email — Spice & Soul";
      event.response.emailMessage = getVerificationEmailHtml();
      break;

    case "CustomMessage_ForgotPassword":
      event.response.emailSubject = "Reset Your Password — Spice & Soul";
      event.response.emailMessage = getForgotPasswordEmailHtml();
      break;

    case "CustomMessage_AdminCreateUser":
      event.response.emailSubject = "Welcome to Spice & Soul";
      event.response.emailMessage = getVerificationEmailHtml();
      break;

    default:
      event.response.emailSubject = "Your Code — Spice & Soul";
      event.response.emailMessage = getVerificationEmailHtml();
      break;
  }

  return event;
};
