const handler = require("../../libs/handler-lib");
const AWS = require("aws-sdk");
const { authenticate, requireAdmin } = require("../../libs/auth-lib");

const s3 = new AWS.S3({ region: process.env.AWS_REGION || "ap-south-1" });
const BUCKET = process.env.S3_MENU_IMAGES_BUCKET;

module.exports.main = handler(async (event, context) => {
  const auth = authenticate(event);
  requireAdmin(auth);

  const body = JSON.parse(event.body || "{}");
  const { fileName, contentType } = body;

  if (!fileName || !contentType) {
    const err = new Error("fileName and contentType are required");
    err.statusCode = 400;
    throw err;
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(contentType)) {
    const err = new Error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF");
    err.statusCode = 400;
    throw err;
  }

  const key = `menu-images/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const imageUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${key}`;

  const uploadUrl = await s3.getSignedUrlPromise("putObject", {
    Bucket: BUCKET,
    Key: key,
    ContentType: contentType,
    Expires: 300,
  });

  return { success: true, uploadUrl, imageUrl, key };
});
