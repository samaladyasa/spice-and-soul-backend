const handler = require("../../libs/handler-lib");

module.exports.hello = handler(async (event, context) => {
  return {
    message: "Welcome to Spice & Soul API",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  };
});

module.exports.health = handler(async (event, context) => {
  return {
    status: "healthy",
    service: "spice-and-soul",
    timestamp: new Date().toISOString(),
  };
});
