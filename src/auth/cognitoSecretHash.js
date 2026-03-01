// Modular helper for Cognito SECRET_HASH generation
const crypto = require('crypto');

/**
 * Generate Cognito SECRET_HASH for authentication requests.
 * @param {string} username - The user's email/username.
 * @param {string} clientId - Cognito App Client ID.
 * @param {string} clientSecret - Cognito App Client Secret.
 * @returns {string} - Base64-encoded HMAC SHA256 hash.
 */
function getSecretHash(username, clientId, clientSecret) {
  return crypto
    .createHmac('sha256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

module.exports = { getSecretHash };
