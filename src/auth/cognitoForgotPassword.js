// Modular AWS Cognito forgot password logic
// This file handles sending a password reset code using Cognito User Pool
// All Cognito config should be set via environment variables

const AWS = require('aws-sdk');

const cognito = new AWS.CognitoIdentityServiceProvider({
  region: process.env.COGNITO_REGION
});

const CLIENT_ID = process.env.COGNITO_CLIENT_ID;
const CLIENT_SECRET = process.env.COGNITO_CLIENT_SECRET;

function getOptionalSecretHash(username) {
  if (!CLIENT_SECRET) return undefined;
  const { getSecretHash } = require('./cognitoSecretHash');
  return getSecretHash(username, CLIENT_ID, CLIENT_SECRET);
}

/**
 * Step 1: Send forgot password code to user's email via Cognito.
 */
async function forgotPassword(email) {
  const params = {
    ClientId: CLIENT_ID,
    Username: email
  };
  const hash = getOptionalSecretHash(email);
  if (hash) params.SecretHash = hash;
  try {
    return await cognito.forgotPassword(params).promise();
  } catch (err) {
    console.error('ForgotPassword error:', err.code, err.message, err.stack);
    throw err;
  }
}

/**
 * Step 2: Confirm forgot password - submit the code and new password.
 */
async function confirmForgotPassword(email, code, newPassword) {
  const params = {
    ClientId: CLIENT_ID,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword
  };
  const hash = getOptionalSecretHash(email);
  if (hash) params.SecretHash = hash;
  try {
    return await cognito.confirmForgotPassword(params).promise();
  } catch (err) {
    console.error('ConfirmForgotPassword error:', err.code, err.message, err.stack);
    throw err;
  }
}

module.exports = {
  forgotPassword,
  confirmForgotPassword
};

// Security best practices:
// - Never expose CLIENT_SECRET or tokens to frontend
// - Always use HTTPS for API endpoints
// - Store Cognito config in environment variables
// - Validate JWT tokens on protected routes
// - Enforce strong password policy in Cognito User Pool
// - Add rate limiting and logging for auth endpoints
