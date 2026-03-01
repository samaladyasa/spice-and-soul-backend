// Modular AWS Cognito authentication logic
// This file handles signup, email verification, and login using Cognito User Pool
// Do not change business logic, UI, or database code in other files
// All Cognito config should be set via environment variables

const AWS = require('aws-sdk');

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.COGNITO_REGION
});

const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;

// Only compute SECRET_HASH if client secret is configured
function getOptionalSecretHash(username) {
  if (!CLIENT_SECRET) return undefined;
  const { getSecretHash } = require('./cognitoSecretHash');
  return getSecretHash(username, CLIENT_ID, CLIENT_SECRET);
}

/**
 * Sign up a new user (email-based)
 * Sends verification code to user's email
 */
async function signUp(email, password, name) {
  const userAttributes = [
    { Name: 'email', Value: email }
  ];
  if (name) {
    userAttributes.push({ Name: 'name', Value: name });
  }
  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: userAttributes
  };
  const hash = getOptionalSecretHash(email);
  if (hash) params.SecretHash = hash;
  try {
    return await cognito.signUp(params).promise();
  } catch (err) {
    console.error('SignUp error:', err.code, err.message, err.stack);
    throw err;
  }
}

/**
 * Confirm user signup with verification code
 */
async function confirmSignUp(email, code) {
  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code
  };
  const hash = getOptionalSecretHash(email);
  if (hash) params.SecretHash = hash;
  try {
    return await cognito.confirmSignUp(params).promise();
  } catch (err) {
    console.error('ConfirmSignUp error:', err.code, err.message, err.stack);
    throw err;
  }
}

/**
 * Sign in user and return Cognito JWT tokens
 */
async function signIn(email, password) {
  const authParams = {
    USERNAME: email,
    PASSWORD: password
  };
  const hash = getOptionalSecretHash(email);
  if (hash) authParams.SECRET_HASH = hash;
  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: authParams
  };
  try {
    return await cognito.initiateAuth(params).promise();
  } catch (err) {
    console.error('Login error:', err.code, err.message, err.stack);
    throw err;
  }
}

module.exports = {
  signUp,
  confirmSignUp,
  signIn
};

// Security best practices:
// - Never expose CLIENT_SECRET or tokens to frontend
// - Always use HTTPS for API endpoints
// - Store Cognito config in environment variables
// - Validate JWT tokens on protected routes
// - Enforce strong password policy in Cognito User Pool
// - Add rate limiting and logging for auth endpoints
