import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Lambda handler to add subscribers to the newsletter
 */
export const handler = async (event) => {
  // get email from api request event
  const { email } = JSON.parse(event.body || '{}');

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'Email is required',
      }),
    };
  }

  // generate id for the subscriber using timestamp and random number
  const uniqueId = Math.floor(Date.now() * Math.random()).toString();

  const command = new UpdateCommand({
    TableName: process.env.SUBSCRIBERS_TABLE,
    Key: { subscriberId: uniqueId },
    UpdateExpression: 'set email = :email, emailConfirmed = :emailConfirmed',
    ExpressionAttributeValues: {
      ':email': email,
      ':emailConfirmed': false,
    },
  });

  // add email to the newsletter table
  await docClient.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({
      subscriberId: uniqueId,
      message: 'Email subscribed successfully',
    }),
  };
};
