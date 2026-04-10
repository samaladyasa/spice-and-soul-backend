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

  const existing = await dynamodb.call("get", {
    TableName: process.env.DYNAMODB_TABLE_MENU_ITEMS,
    Key: { itemId },
  });
  if (!existing.Item) {
    const err = new Error("Menu item not found");
    err.statusCode = 404;
    throw err;
  }

  const body = JSON.parse(event.body || "{}");

  if (body.price !== undefined && (isNaN(Number(body.price)) || Number(body.price) <= 0)) {
    const err = new Error("Price must be a positive number");
    err.statusCode = 400;
    throw err;
  }

  const expressions = [];
  const attrValues = {};
  const attrNames = {};

  const fields = ["name", "price", "img", "alt", "rating", "desc", "categories", "section"];
  fields.forEach((field) => {
    if (body[field] !== undefined) {
      expressions.push(`#${field} = :${field}`);
      attrValues[`:${field}`] = body[field];
      attrNames[`#${field}`] = field;
    }
  });

  expressions.push("#updatedAt = :updatedAt");
  attrValues[":updatedAt"] = new Date().toISOString();
  attrNames["#updatedAt"] = "updatedAt";

  const result = await dynamodb.call("update", {
    TableName: process.env.DYNAMODB_TABLE_MENU_ITEMS,
    Key: { itemId },
    UpdateExpression: "SET " + expressions.join(", "),
    ExpressionAttributeValues: attrValues,
    ExpressionAttributeNames: attrNames,
    ReturnValues: "ALL_NEW",
  });

  console.log(`Menu item updated: ${itemId}`);
  return { success: true, message: "Menu item updated", item: result.Attributes };
});
