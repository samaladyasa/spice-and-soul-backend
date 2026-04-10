const handler = require("../../libs/handler-lib");
const dynamodb = require("../../libs/dynamodb-lib");
const { authenticate } = require("../../libs/auth-lib");
const { sendOrderConfirmationEmail } = require("../../libs/email-lib");

module.exports.main = handler(async (event, context) => {
  const auth = authenticate(event);
  const { email } = auth;

  const body = JSON.parse(event.body || "{}");
  const { items, total, name, address, paymentMethod, razorpayPaymentId } = body;

  if (!items || !total) {
    const err = new Error("Missing required fields: items, total");
    err.statusCode = 400;
    throw err;
  }

  const order = {
    userEmail: email.toLowerCase(),
    orderId: `ORDER-${Date.now()}`,
    items,
    total,
    name: name || "",
    address: address || "",
    paymentMethod: paymentMethod || "cod",
    razorpayPaymentId: razorpayPaymentId || null,
    status: paymentMethod === "cod" ? "pending" : "paid",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await dynamodb.call("put", {
    TableName: process.env.DYNAMODB_TABLE_ORDERS,
    Item: order,
  });

  try {
    await sendOrderConfirmationEmail(email, order.orderId, items, total);
  } catch (emailErr) {
    console.warn("Order confirmation email failed:", emailErr);
  }

  console.log(`Order created: ${order.orderId} for user: ${email}`);
  return { success: true, message: "Order created successfully", order };
});
