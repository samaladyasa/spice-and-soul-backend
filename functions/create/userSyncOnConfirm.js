const dynamoDb = require("../../libs/dynamodb-lib");

exports.handler = async (event) => {
  const attrs = event.request && event.request.userAttributes ? event.request.userAttributes : {};
  const cognitoId = attrs.sub;

  if (!cognitoId) {
    console.warn("PostConfirmation event missing Cognito sub", { triggerSource: event.triggerSource });
    return event;
  }

  const nowIso = new Date().toISOString();
  const email = attrs.email || null;
  const name = attrs.name || (email ? email.split("@")[0] : null);

  await dynamoDb.call("put", {
    TableName: process.env.DYNAMODB_TABLE_USERS,
    Item: {
      cognitoId,
      email,
      name,
      createdAt: nowIso,
      updatedAt: nowIso,
    },
  });

  return event;
};
