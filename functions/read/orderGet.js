const handler = require("../../libs/handler-lib");
const dynamodb = require("../../libs/dynamodb-lib");
const { authenticate } = require("../../libs/auth-lib");

module.exports.main = handler(async (event, context) => {
  const auth = authenticate(event);
  const { email } = auth;

  const result = await dynamodb.call("query", {
    TableName: process.env.DYNAMODB_TABLE_ORDERS,
    KeyConditionExpression: "userEmail = :email",
    ExpressionAttributeValues: {
      ":email": email.toLowerCase(),
    },
  });

  console.log(`Retrieved ${result.Items.length} orders for ${email}`);
  return { success: true, orders: result.Items || [] };
});
