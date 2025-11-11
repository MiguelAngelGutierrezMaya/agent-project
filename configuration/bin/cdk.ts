#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { config } from 'dotenv';

if (process.env.NODE_ENV === 'development') {
  // Load environment variables from .env file
  config();
}

import { LambdaStack } from '@lib/infrastructure/LambdaStack';
import { LoadLambdaUseCase } from '@lib/application/use-cases/load-lambda-use-case';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { PrintOutput } from '@lib/infrastructure/PrintOutput';
import { PrintUseCase } from '@lib/application/use-cases/print-use-case';
import { ApiStack } from '@lib/infrastructure/ApiStack';
import { LambdaIntegration, Resource } from 'aws-cdk-lib/aws-apigateway';
import { LoadApiUseCase } from '@lib/application/use-cases/load-api-use-case';
import { BucketStack } from '@lib/infrastructure/BucketStack';
import { LoadBucketUserCase } from '@lib/application/use-cases/load-bucket-use-case';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { QueueStack } from '@lib/infrastructure/QueueStack';
import { LoadQueueUseCase } from '@lib/application/use-cases/load-queue-use-case';
import { Queue } from 'aws-cdk-lib/aws-sqs';

const app = new App();

const ENV_VARS: { [key: string]: any } = {
  region: process.env.AWS_REGION,
  environment: process.env.NODE_ENV || 'development',
  clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
  clerkJwtKey: process.env.CLERK_JWT_KEY || '',
  clerkAuthorizedParties: process.env.CLERK_AUTHORIZED_PARTIES || '',
  allowedMethods: process.env.ALLOWED_METHODS || '',
  databaseHost: process.env.DATABASE_HOST || '',
  databasePort: process.env.DATABASE_PORT || '5432',
  databaseName: process.env.DATABASE_NAME || '',
  databaseUser: process.env.DATABASE_USER || '',
  databasePassword: process.env.DATABASE_PASSWORD || '',
};

// UseCase 1: Initialize BucketStack and print the bucket name and ARN
const filesBucketStack: BucketStack = new BucketStack(
  app,
  `FilesBucketStack-${ENV_VARS.environment}`,
  {
    bucketId: `FilesBucket-${ENV_VARS.environment}`,
    bucketName: `files-bucket-${ENV_VARS.environment}-${Date.now()}`,
  }
);
const loadBucket: LoadBucketUserCase = new LoadBucketUserCase(filesBucketStack);
loadBucket.execute();

// Get bucket reference after it's created
const bucket: Bucket = filesBucketStack.getBucket();

const loadBucketOutput: PrintOutput = new PrintOutput(
  filesBucketStack,
  `FilesBucketStackOutput-${ENV_VARS.environment}`,
  {
    value: `${bucket.bucketName} - ${bucket.bucketArn} - ${bucket.bucketWebsiteUrl} - ${process.env.AWS_REGION}`,
  }
);

const printBucketUseCase: PrintUseCase = new PrintUseCase(loadBucketOutput);
printBucketUseCase.execute();

//
// UseCase 2: Initialize QueueStack for configuration notifications
//
const configNotificationsQueueStack: QueueStack = new QueueStack(
  app,
  `ConfigNotificationsQueueStack-${ENV_VARS.environment}`,
  {
    queueId: `ConfigNotificationsQueue-${ENV_VARS.environment}`,
    queueName: `config-notifications-queue-${ENV_VARS.environment}`,
    environment: ENV_VARS.environment,
  }
);
const loadQueueUseCase: LoadQueueUseCase = new LoadQueueUseCase(
  configNotificationsQueueStack
);
loadQueueUseCase.execute();

/* Get queue reference after it's created */
const configNotificationsQueue: Queue =
  configNotificationsQueueStack.getQueue();

const loadQueueOutput: PrintOutput = new PrintOutput(
  configNotificationsQueueStack,
  `ConfigNotificationsQueueOutput-${ENV_VARS.environment}`,
  {
    value: `Config Notifications Queue: ${configNotificationsQueue.queueName} - ARN: ${configNotificationsQueue.queueArn} - URL: ${configNotificationsQueue.queueUrl}`,
  }
);
const printQueueUseCase: PrintUseCase = new PrintUseCase(loadQueueOutput);
printQueueUseCase.execute();

//
// UseCase 3: Initialize LambdaStack
//
const configLambdaStack: LambdaStack = new LambdaStack(
  app,
  `ConfigLambdaStack-${ENV_VARS.environment}`,
  {
    environment: ENV_VARS.environment,
    region: ENV_VARS.region,
    clerkSecretKey: ENV_VARS.clerkSecretKey,
    clerkPublishableKey: ENV_VARS.clerkPublishableKey,
    clerkJwtKey: ENV_VARS.clerkJwtKey,
    clerkAuthorizedParties: ENV_VARS.clerkAuthorizedParties,
    allowedMethods: ENV_VARS.allowedMethods,
    databaseHost: ENV_VARS.databaseHost,
    databasePort: ENV_VARS.databasePort,
    databaseName: ENV_VARS.databaseName,
    databaseUser: ENV_VARS.databaseUser,
    databasePassword: ENV_VARS.databasePassword,
    bucketName: bucket.bucketName,
    configNotificationsQueueUrl: configNotificationsQueue.queueUrl,
  }
);
const loadLambdaUseCase: LoadLambdaUseCase = new LoadLambdaUseCase(
  configLambdaStack
);
loadLambdaUseCase.execute();

const configNodeFunction: NodejsFunction =
  configLambdaStack.getConfigNodeFunction();

/* Add bucket permissions to the files lambda after both stacks are created */
const filesLambdaFunction = configLambdaStack.getFilesNodeFunction();
bucket.grantReadWrite(filesLambdaFunction);

/* Add queue permissions to the config lambda to send messages */
configNotificationsQueue.grantSendMessages(configNodeFunction);
const productsNodeFunction: NodejsFunction =
  configLambdaStack.getProductsNodeFunction();
const documentsNodeFunction: NodejsFunction =
  configLambdaStack.getDocumentsNodeFunction();
const loadLambdaOutput: PrintOutput = new PrintOutput(
  configLambdaStack,
  `ConfigLambdaFunctionOutput-${ENV_VARS.environment}`,
  {
    value: `Config Node Function: ${configNodeFunction.functionName} - ARN: ${configNodeFunction.functionArn} - Products Node Function: ${productsNodeFunction.functionName} - ARN: ${productsNodeFunction.functionArn} - Documents Node Function: ${documentsNodeFunction.functionName} - ARN: ${documentsNodeFunction.functionArn}`,
  }
);
const printLambdaUseCase: PrintUseCase = new PrintUseCase(loadLambdaOutput);
printLambdaUseCase.execute();

//
// UseCase 4: Initialize ApiStack
//

const configurationLambdaIntegration: LambdaIntegration =
  configLambdaStack.getConfigLambdaIntegration();

const productsLambdaIntegration: LambdaIntegration =
  configLambdaStack.getProductsLambdaIntegration();

const documentsLambdaIntegration: LambdaIntegration =
  configLambdaStack.getDocumentsLambdaIntegration();

const filesLambdaIntegration: LambdaIntegration =
  configLambdaStack.getFilesLambdaIntegration();

const apiStack: ApiStack = new ApiStack(
  app,
  `ConfigurationApiStack-${ENV_VARS.environment}`,
  {
    config: {
      environment: ENV_VARS.environment,
      allowedMethods: ENV_VARS.allowedMethods,
    },
    configLambdaIntegration: configurationLambdaIntegration,
    productsLambdaIntegration: productsLambdaIntegration,
    documentsLambdaIntegration: documentsLambdaIntegration,
    filesLambdaIntegration: filesLambdaIntegration,
  }
);

const loadApiUseCase: LoadApiUseCase = new LoadApiUseCase(apiStack);
loadApiUseCase.execute();

const configurationResource: Resource = apiStack.getConfigurationResource();
const productsResource: Resource = apiStack.getProductsResource();
const productsCategoriesResource: Resource =
  apiStack.getProductsCategoriesResource();
const documentsResource: Resource = apiStack.getDocumentsResource();
const filesResource: Resource = apiStack.getFilesResource();

const loadApiOutput: PrintOutput = new PrintOutput(
  apiStack,
  `ConfigurationApiOutput-${ENV_VARS.environment}`,
  {
    value: `Configuration API: ${configurationResource.api.restApiName} - Resource: ${configurationResource.resourceId} - Products API: ${productsResource.api.restApiName} - Resource: ${productsResource.resourceId} - Products Categories API: ${productsCategoriesResource.api.restApiName} - Resource: ${productsCategoriesResource.resourceId} - Documents API: ${documentsResource.api.restApiName} - Resource: ${documentsResource.resourceId} - Files API: ${filesResource.api.restApiName} - Resource: ${filesResource.resourceId}`,
  }
);
const printApiUseCase: PrintUseCase = new PrintUseCase(loadApiOutput);
printApiUseCase.execute();
