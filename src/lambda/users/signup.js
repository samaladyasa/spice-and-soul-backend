const dynamodb = require('../../utils/dynamodb');
const { hashPassword } = require('../../utils/password');
const { signToken } = require('../../utils/jwt');
const { v4: uuidv4 } = require('uuid');

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
    const { name, email: rawEmail, password } = JSON.parse(event.body || '{}');
    const email = rawEmail.toLowerCase().trim();

    // Validate input
    if (!name || !email || !password) {
      return response(400, { error: 'Name, email, and password are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return response(400, { error: 'Invalid email format' });
    }

    // Validate password strength (minimum 8 characters)
    if (password.length < 8) {
      return response(400, { error: 'Password must be at least 8 characters long' });
    }

    // Check if user already exists
    const existingUser = await dynamodb.getUser(email);
    if (existingUser) {
      return response(400, { error: 'Email already registered' });
    }

    // Hash password securely using bcryptjs
    const passwordHash = await hashPassword(password);

    // Generate unique user ID
    const userId = uuidv4();

    // Create user with hashed password
    const newUser = {
      email,
      passwordHash, // Store hashed password, NOT plain text
      name,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamodb.createUser(newUser);

    // Generate JWT token
    const token = signToken({
      userId,
      email,
      name
    });

    console.log(`New user created: ${email}`);

    return response(201, {
      success: true,
      message: 'Account created successfully',
      user: {
        userId,
        email,
        name
      },
      token,
      expiresIn: '24h'
    });
  } catch (error) {
    console.error('Error in signup:', error);
    return response(500, { error: 'Internal server error', message: error.message });
  }
};
