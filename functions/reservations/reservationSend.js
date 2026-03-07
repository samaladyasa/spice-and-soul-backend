const handler = require("../../libs/handler-lib");
const { sendReservationEmails } = require("../../libs/email-lib");

module.exports.main = handler(async (event, context) => {
  const body = JSON.parse(event.body);
  const { name, email, phone, date, time, guests, requests } = body;

  if (!name || !phone || !date || !time || !guests) {
    const err = new Error("Missing required fields");
    err.statusCode = 400;
    throw err;
  }

  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let emailSent = false;
  let emailError = null;

  try {
    await sendReservationEmails({ name, email, phone, date: formattedDate, time, guests, requests });
    emailSent = true;
  } catch (error) {
    console.error("Email sending failed:", error);
    emailError = error.message;
    console.log("===== RESERVATION (Manual Followup Required) =====");
    console.log(`Customer: ${name}, Phone: ${phone}, Date: ${formattedDate}, Time: ${time}, Guests: ${guests}`);
  }

  return {
    success: true,
    message: emailSent
      ? "Reservation confirmed! We will call you shortly to confirm."
      : "Reservation confirmed! We will contact you soon.",
    emailSent,
    emailError,
    data: { name, phone, date: formattedDate, time, guests },
  };
});
