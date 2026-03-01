// Lambda handlers for Cognito authentication
// These endpoints wrap Cognito logic and keep business logic separate
// Do not change main app logic or database code

const { signUp, confirmSignUp, signIn } = require('../../auth/cognito');

const response = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
  },
  body: JSON.stringify(body)
});

// Signup endpoint
exports.signupHandler = async (event) => {
  try {
    const { email, password, name } = JSON.parse(event.body || '{}');
    if (!email || !password) {
      return response(400, { error: 'Email and password required' });
    }
    await signUp(email, password, name);
    return response(200, { success: true, message: 'Verification code sent to email' });
  } catch (error) {
    return response(500, { error: error.message });
  }
};

// Confirm signup endpoint
exports.confirmSignupHandler = async (event) => {
  try {
    const { email, code } = JSON.parse(event.body || '{}');
    if (!email || !code) {
      return response(400, { error: 'Email and code required' });
    }
    await confirmSignUp(email, code);
    return response(200, { success: true, message: 'Account verified. You can now log in.' });
  } catch (error) {
    return response(500, { error: error.message });
  }
};

// Login endpoint
exports.loginHandler = async (event) => {
  try {
    const { email, password } = JSON.parse(event.body || '{}');
    if (!email || !password) {
      return response(400, { error: 'Email and password required' });
    }
    const authResult = await signIn(email, password);
    return response(200, {
      success: true,
      token: authResult.AuthenticationResult.IdToken,
      refreshToken: authResult.AuthenticationResult.RefreshToken,
      accessToken: authResult.AuthenticationResult.AccessToken
    });
  } catch (error) {
    return response(401, { error: error.message });
  }
};

// Add comments for each step and keep logic modular
