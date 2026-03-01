const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

class DynamoDBClient {
  constructor() {
    this.tablePrefixes = {
      users: process.env.DYNAMODB_TABLE_USERS,
      orders: process.env.DYNAMODB_TABLE_ORDERS,
      codes: process.env.DYNAMODB_TABLE_CODES
    };
  }

  async getUser(email) {
    try {
      const result = await dynamodb
        .get({
          TableName: this.tablePrefixes.users,
          Key: { email: email.toLowerCase() }
        })
        .promise();
      return result.Item;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const params = {
        TableName: this.tablePrefixes.users,
        Item: {
          email: userData.email.toLowerCase(),
          userId: userData.userId,
          passwordHash: userData.passwordHash, // Store hashed password, never plain text
          name: userData.name,
          isActive: userData.isActive !== false, // Default to true
          createdAt: userData.createdAt || new Date().toISOString(),
          updatedAt: userData.updatedAt || new Date().toISOString()
        }
      };
      await dynamodb.put(params).promise();
      return params.Item;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUserPassword(email, passwordHash) {
    try {
      const params = {
        TableName: this.tablePrefixes.users,
        Key: { email: email.toLowerCase() },
        UpdateExpression: 'SET passwordHash = :passwordHash, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
          ':passwordHash': passwordHash,
          ':updatedAt': new Date().toISOString()
        },
        ReturnValues: 'ALL_NEW'
      };
      const result = await dynamodb.update(params).promise();
      return result.Attributes;
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    }
  }

  async saveVerificationCode(email, code) {
    try {
      const expiry = Math.floor(Date.now() / 1000) + 3600; // 1 hour
      const params = {
        TableName: this.tablePrefixes.codes,
        Item: {
          email: email.toLowerCase(),
          code: code,
          expiry: expiry,
          createdAt: new Date().toISOString()
        }
      };
      await dynamodb.put(params).promise();
      return params.Item;
    } catch (error) {
      console.error('Error saving verification code:', error);
      throw error;
    }
  }

  async getVerificationCode(email) {
    try {
      const result = await dynamodb
        .get({
          TableName: this.tablePrefixes.codes,
          Key: { email: email.toLowerCase() }
        })
        .promise();
      return result.Item;
    } catch (error) {
      console.error('Error getting verification code:', error);
      throw error;
    }
  }

  async deleteVerificationCode(email) {
    try {
      await dynamodb
        .delete({
          TableName: this.tablePrefixes.codes,
          Key: { email: email.toLowerCase() }
        })
        .promise();
    } catch (error) {
      console.error('Error deleting verification code:', error);
      throw error;
    }
  }

  async createOrder(orderData) {
    try {
      const params = {
        TableName: this.tablePrefixes.orders,
        Item: {
          userEmail: orderData.userEmail.toLowerCase(),
          orderId: `ORDER-${Date.now()}`,
          items: orderData.items,
          total: orderData.total,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };
      await dynamodb.put(params).promise();
      return params.Item;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrders(userEmail) {
    try {
      const result = await dynamodb
        .query({
          TableName: this.tablePrefixes.orders,
          KeyConditionExpression: 'userEmail = :email',
          ExpressionAttributeValues: {
            ':email': userEmail.toLowerCase()
          }
        })
        .promise();
      return result.Items;
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  }
}

module.exports = new DynamoDBClient();
