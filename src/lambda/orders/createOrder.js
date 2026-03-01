const dynamodb = require('../../utils/dynamodb');
const emailClient = require('../../utils/email');
const { requireAuth, protectedResponse } = require('../../middleware/auth');

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
  },
  body: JSON.stringify(body)
});

exports.handler = async (event) => {
  try {
    // Verify JWT token
    const auth = requireAuth(event);
    if (!auth.valid) {
      return protectedResponse(401, { error: auth.error });
    }

    const { userId, email } = auth.payload;
    const { userEmail, items, total } = JSON.parse(event.body || '{}');

    if (!userEmail || !items || !total) {
      return protectedResponse(400, { error: 'Missing required fields: userEmail, items, total' });
    }

    // Verify user exists
    const user = await dynamodb.getUser(userEmail);
    if (!user) {
      return protectedResponse(404, { error: 'User not found' });
    }

    // Create order
    const order = await dynamodb.createOrder({
      userEmail,
      items,
      total
    });

    // Send order confirmation email
    try {
      await emailClient.sendOrderConfirmationEmail(userEmail, order.orderId, items, total);
    } catch (emailError) {
      console.warn('Order confirmation email failed:', emailError);
      // Don't fail the order creation
    }

    console.log(`Order created: ${order.orderId} for user: ${email}`);

    return protectedResponse(201, {
      success: true,
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Error in createOrder:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};
