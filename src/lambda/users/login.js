const dynamodb = require('../../utils/dynamodb');
const { verifyPassword } = require('../../utils/password');
const { signToken } = require('../../utils/jwt');

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
    const { email: rawEmail, password } = JSON.parse(event.body || '{}');
    const email = rawEmail.toLowerCase().trim();

    // Validate input
    if (!email || !password) {
      return response(400, { error: 'Email and password are required' });
    }

    // Get user from DynamoDB
    const user = await dynamodb.getUser(email);

    if (!user) {
      return response(401, { error: 'Invalid email or password' });
    }

    // Verify password against hash
    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      return response(401, { error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = signToken({
      userId: user.userId,
      email: user.email,
      name: user.name
    });

    console.log(`User logged in: ${email}`);

    return response(200, {
      success: true,
      message: 'Login successful',
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name
      },
      token,
      expiresIn: '24h'
    });
  } catch (error) {
    console.error('Error in login:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};
