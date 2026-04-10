const handler = require("../../libs/handler-lib");
const dynamodb = require("../../libs/dynamodb-lib");

module.exports.main = handler(async (event, context) => {
  const result = await dynamodb.call("scan", {
    TableName: process.env.DYNAMODB_TABLE_MENU_ITEMS,
  });

  return {
    success: true,
    items: result.Items || [],
    count: (result.Items || []).length,
  };
});
