module.exports = function handler(lambda) {
  return async function (event, context) {
    let body, statusCode;

    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers: corsHeaders(),
        body: "",
      };
    }

    try {
      body = await lambda(event, context);
      statusCode = 200;
    } catch (e) {
      console.error("Handler error:", e);
      body = { error: e.message || "Internal server error" };
      statusCode = e.statusCode || 500;
    }

    return {
      statusCode,
      body: JSON.stringify(body),
      headers: corsHeaders(),
    };
  };
};

function corsHeaders() {
  return {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": process.env.CORS_ORIGIN || "*",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Credentials": true,
  };
}
