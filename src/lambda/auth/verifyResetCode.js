const dynamodb = require('../../utils/dynamodb');

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
    const { email: rawEmail, code } = JSON.parse(event.body || '{}');
    const email = rawEmail ? rawEmail.toLowerCase().trim() : '';

    if (!email || !code) {
      return response(400, { error: 'Email and code are required' });
    }

    // Get stored code from DynamoDB
    const storedCodeData = await dynamodb.getVerificationCode(email);

    if (!storedCodeData) {
      return response(400, { error: 'No verification code found. Please request a new code.' });
    }

    // Check expiry
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime > storedCodeData.expiry) {
      await dynamodb.deleteVerificationCode(email);
      return response(400, { error: 'Verification code has expired. Please try again.' });
    }

    // Verify code
    if (storedCodeData.code !== code.trim()) {
      return response(400, { error: 'Invalid verification code. Please try again.' });
    }

    console.log(`Code verified successfully for ${email}`);

    return response(200, {
      success: true,
      message: 'Code verified successfully'
    });
  } catch (error) {
    console.error('Error in verifyResetCode:', error);
    return response(500, { error: 'Internal server error' });
  }
};
