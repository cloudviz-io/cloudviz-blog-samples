import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { mapResponse } from "./helper";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

/**
 * Lambda handler to remove subscribers from the newsletter
 */
export const handler = async (event) => {
  try {
    console.log(`X-Ray tracing header: ${process.env._X_AMZN_TRACE_ID}`);
    // get subscriberId from path parameter
    const { subscriberId } = event.pathParameters;

    if (!subscriberId) {
      console.log("SubscriberId is missing");
      return mapResponse(400, {
        message: "subscriberId is missing",
      });
    }
    const command = new DeleteCommand({
      TableName: process.env.SUBSCRIBERS_TABLE,
      Key: { subscriberId },
    });

    // remove subscriber from the newsletter table
    await docClient.send(command);

    console.log(
      `Email was successfully removed from the newsletter table with id: ${subscriberId}`
    );

    return mapResponse(200, {
      message: "Email unsubscribed successfully",
    });
  } catch (error) {
    console.error("Error unsubscribing email", error);
    return mapResponse(500, {
      message: "Error unsubscribing email",
    });
  }
};
