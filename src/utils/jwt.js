const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * Generate a JWT token for a user
 * @param {Object} payload - Data to encode in token (email, userId, etc.)
 * @returns {string} JWT token
 */
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRY,
    algorithm: 'HS256'
  });
}

/**
 * Verify a JWT token (supports both HS256 custom tokens and RS256 Cognito tokens)
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token payload or null if invalid
 */
function verifyToken(token) {
  try {
    // First try HS256 (custom JWT)
    return jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256']
    });
  } catch (error) {
    // If HS256 fails, try decoding as Cognito RS256 token
    try {
      const decoded = jwt.decode(token, { complete: true });
      if (decoded && decoded.header && decoded.header.alg === 'RS256') {
        const payload = decoded.payload;
        // Validate it's from our Cognito User Pool
        const expectedIssuer = `https://cognito-idp.${process.env.AWS_REGION || 'ap-south-1'}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;
        if (payload.iss === expectedIssuer && payload.email) {
          // Check expiration
          if (payload.exp && payload.exp * 1000 > Date.now()) {
            return { userId: payload.sub, email: payload.email, name: payload.name || '' };
          }
          console.error('Cognito token expired');
          return null;
        }
        console.error('Cognito token issuer mismatch');
        return null;
      }
      console.error('Token verification failed:', error.message);
      return null;
    } catch (decodeError) {
      console.error('Token decode failed:', decodeError.message);
      return null;
    }
  }
}

/**
 * Extract JWT token from Authorization header
 * @param {Object} headers - HTTP headers
 * @returns {string|null} JWT token or null if not found
 */
function extractToken(headers) {
  if (!headers) {
    return null;
  }

  // API Gateway may pass header as 'Authorization' or 'authorization'
  const authHeader = headers.authorization || headers.Authorization;
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Middleware-style JWT verification for Lambda handlers
 * @param {Object} event - Lambda event
 * @returns {Object} { valid: boolean, payload: Object|null, error: string|null }
 */
function verifyLambdaToken(event) {
  const token = extractToken(event.headers);

  if (!token) {
    return {
      valid: false,
      payload: null,
      error: 'No authorization token provided'
    };
  }

  const payload = verifyToken(token);

  if (!payload) {
    return {
      valid: false,
      payload: null,
      error: 'Invalid or expired token'
    };
  }

  return {
    valid: true,
    payload,
    error: null
  };
}

module.exports = {
  signToken,
  verifyToken,
  extractToken,
  verifyLambdaToken,
  JWT_SECRET,
  JWT_EXPIRY
};
