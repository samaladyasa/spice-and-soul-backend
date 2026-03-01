const dynamodb = require('../../utils/dynamodb');
const { hashPassword } = require('../../utils/password');

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
    const { email: rawEmail, code, newPassword } = JSON.parse(event.body || '{}');
    const email = rawEmail ? rawEmail.toLowerCase().trim() : '';

    if (!email || !code || !newPassword) {
      return response(400, { error: 'Email, code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return response(400, { error: 'Password must be at least 6 characters' });
    }

    // Verify code again
    const storedCodeData = await dynamodb.getVerificationCode(email);

    if (!storedCodeData) {
      return response(400, { error: 'No verification code found' });
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime > storedCodeData.expiry || storedCodeData.code !== code.trim()) {
      return response(400, { error: 'Invalid or expired verification code' });
    }

    // Hash the new password
    const passwordHash = await hashPassword(newPassword);

    // Update password with hash
    await dynamodb.updateUserPassword(email, passwordHash);

    // Delete verification code
    await dynamodb.deleteVerificationCode(email);

    console.log(`Password reset successfully for ${email}`);

    return response(200, {
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return response(500, { error: 'Internal server error' });
  }
};
