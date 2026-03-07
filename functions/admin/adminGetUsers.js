const AWS = require("aws-sdk");
const handler = require("../../libs/handler-lib");
const { authenticate, requireAdmin } = require("../../libs/auth-lib");

const cognito = new AWS.CognitoIdentityServiceProvider();

module.exports.main = handler(async (event, context) => {
  const auth = authenticate(event);
  requireAdmin(auth);

  const allUsers = [];
  let paginationToken;

  do {
    const params = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Limit: 60,
    };
    if (paginationToken) params.PaginationToken = paginationToken;

    const result = await cognito.listUsers(params).promise();

    for (const user of result.Users || []) {
      const attr = (name) =>
        (user.Attributes || []).find((a) => a.Name === name)?.Value || null;

      allUsers.push({
        email: attr("email"),
        name: attr("name") || attr("email")?.split("@")[0],
        status: user.UserStatus,
        enabled: user.Enabled,
        createdAt: user.UserCreateDate?.toISOString(),
      });
    }

    paginationToken = result.PaginationToken;
  } while (paginationToken);

  return { success: true, users: allUsers, count: allUsers.length };
});
