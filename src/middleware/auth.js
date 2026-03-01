const { verifyLambdaToken } = require('../utils/jwt');

/**
 * Middleware for verifying JWT tokens in Lambda handlers
 * Usage: Use inside your Lambda handler to protect routes
 * 
 * Example:
 * const auth = requireAuth(event);
 * if (!auth.valid) {
 *   return response(401, { error: auth.error });
 * }
 * const { userId, email } = auth.payload;
 */
function requireAuth(event) {
  return verifyLambdaToken(event);
}

/**
 * Protected response helper
 */
function protectedResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': process.env.CORS_ORIGIN || '*'
    },
    body: JSON.stringify(body)
  };
}

module.exports = {
  requireAuth,
  protectedResponse
};
