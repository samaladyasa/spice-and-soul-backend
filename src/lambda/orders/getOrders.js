const dynamodb = require('../../utils/dynamodb');
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

    const { email: tokenEmail } = auth.payload;
    const { email } = event.pathParameters || {};

    if (!email) {
      return protectedResponse(400, { error: 'Email is required' });
    }

    // Ensure user can only view their own orders
    if (email !== tokenEmail) {
      return protectedResponse(403, { error: 'You can only view your own orders' });
    }

    // Get orders for user
    const orders = await dynamodb.getOrders(email);

    console.log(`Retrieved ${orders.length} orders for ${email}`);

    return protectedResponse(200, {
      success: true,
      orders: orders || []
    });
  } catch (error) {
    console.error('Error in getOrders:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};
