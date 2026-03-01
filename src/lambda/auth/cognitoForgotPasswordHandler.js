// Lambda handler for Cognito forgot password
// Step 1: /forgot-password   -> sends reset code to email
// Step 2: /confirm-forgot-password -> verifies code and sets new password

const { forgotPassword, confirmForgotPassword } = require('../../auth/cognitoForgotPassword');

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
  },
  body: JSON.stringify(body)
});

// Step 1: Request a password reset code via Cognito
exports.forgotPasswordHandler = async (event) => {
  try {
    const { email } = JSON.parse(event.body || '{}');
    if (!email) {
      return response(400, { error: 'Email required' });
    }
    await forgotPassword(email);
    return response(200, { success: true, message: 'Password reset code sent to your email' });
  } catch (error) {
    console.error('forgotPasswordHandler error:', error.code, error.message);
    return response(500, { error: error.message });
  }
};

// Step 2: Confirm the reset code and set a new password
exports.confirmForgotPasswordHandler = async (event) => {
  try {
    const { email, code, newPassword } = JSON.parse(event.body || '{}');
    if (!email || !code || !newPassword) {
      return response(400, { error: 'Email, code, and newPassword are required' });
    }
    await confirmForgotPassword(email, code, newPassword);
    return response(200, { success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (error) {
    console.error('confirmForgotPasswordHandler error:', error.code, error.message);
    return response(500, { error: error.message });
  }
};
