const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const USERS_TABLE = process.env.DYNAMODB_TABLE_USERS;

exports.handler = async (event) => {
    console.log('Admin: Get all users');

    try {
        const params = {
            TableName: USERS_TABLE
        };

        const result = await dynamodb.scan(params).promise();

        // Remove password hashes from response for security
        const users = result.Items.map(user => ({
            email: user.email,
            name: user.name,
            isActive: user.isActive !== false,
            createdAt: user.createdAt
        }));

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                success: true,
                users: users,
                count: users.length
            })
        };
    } catch (error) {
        console.error('Error fetching users:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch users'
            })
        };
    }
};
