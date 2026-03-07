const handler = require("../../libs/handler-lib");
const Razorpay = require("razorpay");

module.exports.main = handler(async (event, context) => {
  const body = JSON.parse(event.body);
  const { amount, currency = "INR", receipt } = body;

  if (!amount) {
    const err = new Error("Amount is required");
    err.statusCode = 400;
    throw err;
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency,
    receipt: receipt || `receipt_${Date.now()}`,
    payment_capture: 1,
  });

  console.log("Razorpay order created:", order.id);

  return {
    success: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: process.env.RAZORPAY_KEY_ID,
  };
});
