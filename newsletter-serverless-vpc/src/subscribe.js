import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { mapResponse } from "./helper";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Lambda handler to add subscribers to the newsletter
 */
export const handler = async (event) => {
  try {
    console.log(`X-Ray tracing header: ${process.env._X_AMZN_TRACE_ID}`);
    // get email from api request event
    const { email } = JSON.parse(event.body || "{}");

    if (!email) {
      console.log("Email was not provided");
      return mapResponse(400, {
        message: "Email is required",
      });
    }

    // generate id for the subscriber using timestamp and random number
    const uniqueId = Math.floor(Date.now() * Math.random()).toString();

    const command = new UpdateCommand({
      TableName: process.env.SUBSCRIBERS_TABLE,
      Key: { subscriberId: uniqueId },
      UpdateExpression: "set email = :email, emailConfirmed = :emailConfirmed",
      ExpressionAttributeValues: {
        ":email": email,
        ":emailConfirmed": false,
      },
    });

    // add email to the newsletter table
    await docClient.send(command);

    console.log(
      `Email was successfully added to the newsletter table with id: ${uniqueId}`
    );

    return mapResponse(200, {
      subscriberId: uniqueId,
      message: "Email subscribed successfully",
    });
  } catch (error) {
    console.error("Error subscribing email", error);
    return mapResponse(500, {
      message: "Error subscribing email",
    });
  }
};
