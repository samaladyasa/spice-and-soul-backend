const dynamodb = require('../../utils/dynamodb');
const emailClient = require('../../utils/email');

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
  },
  body: JSON.stringify(body)
});

const generateCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.handler = async (event) => {
  try {
    const { email: rawEmail } = JSON.parse(event.body || '{}');
    const email = rawEmail ? rawEmail.toLowerCase().trim() : '';

    if (!email) {
      return response(400, { error: 'Email is required' });
    }

    // Check if user exists
    const user = await dynamodb.getUser(email);
    if (!user) {
      return response(400, { error: 'No account found with this email' });
    }

    // Generate code
    const code = generateCode();

    // Save code to DynamoDB
    await dynamodb.saveVerificationCode(email, code);

    console.log(`Reset code for ${email}: ${code}`);

    // Try to send email
    try {
      await emailClient.sendResetCodeEmail(email, code);
    } catch (emailError) {
      console.warn('Email sending failed, but code is saved:', emailError);
      // Don't fail the request, code is stored in DynamoDB
    }

    return response(200, {
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Error in sendResetCode:', error);
    return response(500, { error: 'Internal server error' });
  }
};
