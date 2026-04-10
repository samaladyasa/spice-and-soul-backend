function authenticate(event) {
  const claims =
    event.requestContext &&
    event.requestContext.authorizer &&
    event.requestContext.authorizer.claims;

  if (!claims || !claims.email) {
    const err = new Error("Unauthorized — no valid Cognito claims");
    err.statusCode = 401;
    throw err;
  }

  let groups = [];
  const rawGroups = claims["cognito:groups"];
  if (rawGroups) {
    if (Array.isArray(rawGroups)) {
      groups = rawGroups;
    } else {
      groups = rawGroups.replace(/^\[|\]$/g, "").split(",").map((g) => g.trim()).filter(Boolean);
    }
  }

  return {
    email: claims.email,
    sub: claims.sub,
    groups,
  };
}

function requireAdmin(authPayload) {
  if (
    !authPayload ||
    !authPayload.groups ||
    !authPayload.groups.includes("admin")
  ) {
    const err = new Error("Admin access required");
    err.statusCode = 403;
    throw err;
  }
}

module.exports = { authenticate, requireAdmin };

