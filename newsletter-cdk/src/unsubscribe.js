import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Lambda handler to remove subscribers from the newsletter
 */
export const handler = async (event) => {
  // get subscriberId from path parameter
  const { subscriberId } = event.pathParameters;

  if (!subscriberId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'subscriberId is missing',
      }),
    };
  }
  const command = new DeleteCommand({
    TableName: process.env.SUBSCRIBERS_TABLE,
    Key: { subscriberId },
  });

  // remove subscriber from the newsletter table
  await docClient.send(command);

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Email unsubscribed successfully',
    }),
  };
};
