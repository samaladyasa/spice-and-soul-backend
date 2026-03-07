const handler = require("../../libs/handler-lib");
const dynamodb = require("../../libs/dynamodb-lib");
const { authenticate, requireAdmin } = require("../../libs/auth-lib");

module.exports.main = handler(async (event, context) => {
  const auth = authenticate(event);
  requireAdmin(auth);

  const body = JSON.parse(event.body || "{}");
  const { name, price, img, alt, rating, desc, categories, section } = body;

  if (!name || price === undefined || !section) {
    const err = new Error("Missing required fields: name, price, section");
    err.statusCode = 400;
    throw err;
  }

  if (typeof Number(price) !== "number" || isNaN(Number(price)) || Number(price) <= 0) {
    const err = new Error("Price must be a positive number");
    err.statusCode = 400;
    throw err;
  }

  const item = {
    itemId: `ITEM-${Date.now()}`,
    name,
    price: Number(price),
    img: img || "",
    alt: alt || name,
    rating: rating || "★★★★☆ 4.0",
    desc: desc || "",
    categories: categories || [],
    section: section || "starters",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await dynamodb.call("put", {
    TableName: process.env.DYNAMODB_TABLE_MENU_ITEMS,
    Item: item,
  });

  console.log(`Menu item created: ${item.itemId}`);
  return { success: true, message: "Menu item created", item };
});
