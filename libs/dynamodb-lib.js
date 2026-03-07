const AWS = require("aws-sdk");

const client = new AWS.DynamoDB.DocumentClient();

module.exports = {
  call: (action, params) => client[action](params).promise(),
};
