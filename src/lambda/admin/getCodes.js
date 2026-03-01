const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const CODES_TABLE = process.env.DYNAMODB_TABLE_CODES;

exports.handler = async (event) => {
    console.log('Admin: Get all verification codes');

    try {
        const params = {
            TableName: CODES_TABLE
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
                codes: result.Items,
                count: result.Items.length
            })
        };
    } catch (error) {
        console.error('Error fetching codes:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({
                success: false,
                error: 'Failed to fetch verification codes'
            })
        };
    }
};
