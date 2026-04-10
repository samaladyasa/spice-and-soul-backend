const handler = require("../../libs/handler-lib");
const dynamodb = require("../../libs/dynamodb-lib");
const { authenticate, requireAdmin } = require("../../libs/auth-lib");

module.exports.main = handler(async (event, context) => {
  const auth = authenticate(event);
  requireAdmin(auth);

  const result = await dynamodb.call("scan", {
    TableName: process.env.DYNAMODB_TABLE_ORDERS,
  });

  return {
    success: true,
    orders: result.Items || [],
    count: (result.Items || []).length,
  };
});
