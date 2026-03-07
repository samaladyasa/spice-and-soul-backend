const handler = require("../../libs/handler-lib");
const dynamodb = require("../../libs/dynamodb-lib");
const { authenticate, requireAdmin } = require("../../libs/auth-lib");

module.exports.main = handler(async (event, context) => {
  const auth = authenticate(event);
  requireAdmin(auth);

  const { itemId } = event.pathParameters || {};
  if (!itemId) {
    const err = new Error("itemId is required");
    err.statusCode = 400;
    throw err;
  }

  await dynamodb.call("delete", {
    TableName: process.env.DYNAMODB_TABLE_MENU_ITEMS,
    Key: { itemId },
  });

  console.log(`Menu item deleted: ${itemId}`);
  return { success: true, message: "Menu item deleted", deleted: true, itemId };
});
