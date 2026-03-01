const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const ORDERS_TABLE = process.env.DYNAMODB_TABLE_ORDERS;

exports.handler = async (event) => {
    console.log('Admin: Get all orders');

    try {
        const params = {
            TableName: ORDERS_TABLE
        };

        const result = await dynamodb.scan(params).promise();

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                success: true,
                orders: result.Items,
                count: result.Items.length
            })
        };
    } catch (error) {
        console.error('Error fetching orders:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch orders'
            })
        };
    }
};
