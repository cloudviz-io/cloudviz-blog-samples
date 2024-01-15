import { Stack } from 'aws-cdk-lib';
import { resourceName } from '../bin/app-config.js';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Table, AttributeType } from 'aws-cdk-lib/aws-dynamodb';

export class NewsletterCdkStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    // create subscriber DynamoDB table
    const subscriberTable = new Table(this, 'SubscriberTable', {
      tableName: resourceName(`${props.stage}-subscribers`),
      partitionKey: {
        name: 'subscriberId',
        type: AttributeType.STRING,
      },
      billingMode: 'PAY_PER_REQUEST',
    });

    // set default Lambda parameters
    const nodeJsFunctionProps = {
      bundling: {
        externalModules: [
          '@aws-sdk', // Use the '@aws-sdk' available in the Lambda runtime
        ],
        minify: true,
      },
      runtime: Runtime.NODEJS_18_X,
      initialPolicy: [
        new PolicyStatement({
          actions: ['dynamodb:DeleteItem', 'dynamodb:UpdateItem'],
          effect: Effect.ALLOW,
          resources: [subscriberTable.tableArn],
        }),
      ],
      environment: {
        SUBSCRIBERS_TABLE: subscriberTable.tableName,
      },
    };

    // create Lambda functions
    const subscribeLambda = new NodejsFunction(this, 'SubscribeHandler', {
      functionName: resourceName(`${props.stage}-subscribe`),
      entry: 'src/subscribe.js',
      ...nodeJsFunctionProps,
    });

    const unsubscribeLambda = new NodejsFunction(this, 'UnsubscribeHandler', {
      functionName: resourceName(`${props.stage}-unsubscribe`),
      entry: 'src/unsubscribe.js',
      ...nodeJsFunctionProps,
    });

    // create API Gateway endpoints
    const api = new RestApi(this, 'NewsletterApi', {
      restApiName: resourceName(`${props.stage}-api`),
      endpointExportName: resourceName(`${props.stage}-ApiGwUrl`),
      description: 'Newsletter API',
      deployOptions: { stageName: props.stage },
    });

    // attach Lambda functions to API Gateway endpoints
    const subscriberEndpoint = api.root.addResource('subscriber');
    subscriberEndpoint.addMethod('POST', new LambdaIntegration(subscribeLambda));

    const unsubscribeEndpoint = subscriberEndpoint.addResource('{subscriberId}');
    unsubscribeEndpoint.addMethod('DELETE', new LambdaIntegration(unsubscribeLambda));
  }
}
