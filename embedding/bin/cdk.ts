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
import { EventBridgeStack } from '@lib/infrastructure/EventBridgeStack';
import { LambdaIntegration, Resource } from 'aws-cdk-lib/aws-apigateway';
import { LoadApiUseCase } from '@lib/application/use-cases/load-api-use-case';

const app = new App();

const ENV_VARS: { [key: string]: any } = {
  region: process.env.AWS_REGION,
  environment: process.env.NODE_ENV || 'development',
  clerkSecretKey: process.env.CLERK_SECRET_KEY || '',
  clerkPublishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
  clerkJwtKey: process.env.CLERK_JWT_KEY || '',
  clerkAuthorizedParties: process.env.CLERK_AUTHORIZED_PARTIES || '',
  allowedMethods: process.env.ALLOWED_METHODS || '',
  eventBridgeAuthorizedParties:
    process.env.EVENT_BRIDGE_AUTHORIZED_PARTIES || '',
  eventBridgePassword: process.env.EVENT_BRIDGE_PASSWORD || '',
  domainName: process.env.DOMAIN_NAME || '',
  openAIAPIKey: process.env.OPENAI_API_KEY || '',
  databaseHost: process.env.DATABASE_HOST || '',
  databasePort: process.env.DATABASE_PORT || '5432',
  databaseName: process.env.DATABASE_NAME || '',
  databaseUser: process.env.DATABASE_USER || '',
  databasePassword: process.env.DATABASE_PASSWORD || '',
};

//
// UseCase 1: Initialize LambdaStack
//
const embeddingLambdaStack: LambdaStack = new LambdaStack(
  app,
  `EmbeddingLambdaStack-${ENV_VARS.environment}`,
  {
    environment: ENV_VARS.environment,
    region: ENV_VARS.region,
    clerkSecretKey: ENV_VARS.clerkSecretKey,
    clerkPublishableKey: ENV_VARS.clerkPublishableKey,
    clerkJwtKey: ENV_VARS.clerkJwtKey,
    clerkAuthorizedParties: ENV_VARS.clerkAuthorizedParties,
    allowedMethods: ENV_VARS.allowedMethods,
    eventBridgePassword: ENV_VARS.eventBridgePassword,
    openAIAPIKey: ENV_VARS.openAIAPIKey,
    databaseHost: ENV_VARS.databaseHost,
    databasePort: ENV_VARS.databasePort,
    databaseName: ENV_VARS.databaseName,
    databaseUser: ENV_VARS.databaseUser,
    databasePassword: ENV_VARS.databasePassword,
  }
);
const loadLambdaUseCase: LoadLambdaUseCase = new LoadLambdaUseCase(
  embeddingLambdaStack
);
loadLambdaUseCase.execute().then();

const embeddingNodeFunction: NodejsFunction =
  embeddingLambdaStack.getEmbeddingNodeFunction();
const loadLambdaOutput: PrintOutput = new PrintOutput(
  embeddingLambdaStack,
  `EmbeddingLambdaFunctionOutput-${ENV_VARS.environment}`,
  {
    value: `Embedding Node Function: ${embeddingNodeFunction.functionName} - ARN: ${embeddingNodeFunction.functionArn}`,
  }
);
const printLambdaUseCase: PrintUseCase = new PrintUseCase(loadLambdaOutput);
printLambdaUseCase.execute();

//
// UseCase 2: Initialize ApiStack
//

const embeddingLambdaIntegration: LambdaIntegration =
  embeddingLambdaStack.getEmbeddingLambdaIntegration();

const apiStack: ApiStack = new ApiStack(
  app,
  `EmbeddingApiStack-${ENV_VARS.environment}`,
  {
    config: {
      environment: ENV_VARS.environment,
      allowedMethods: ENV_VARS.allowedMethods,
    },
    embeddingLambdaIntegration: embeddingLambdaIntegration,
  }
);

const loadApiUseCase: LoadApiUseCase = new LoadApiUseCase(apiStack);
loadApiUseCase.execute().then();

const embeddingResource: Resource = apiStack.getEmbeddingResource();

const loadApiOutput: PrintOutput = new PrintOutput(
  apiStack,
  `EmbeddingApiOutput-${ENV_VARS.environment}`,
  {
    value: `Embedding API: ${embeddingResource.api.restApiName} - Resource: ${embeddingResource.resourceId}`,
  }
);
const printApiUseCase: PrintUseCase = new PrintUseCase(loadApiOutput);
printApiUseCase.execute();

//
// UseCase 3: Initialize EventBridgeStack
//
const eventBridgeStack: EventBridgeStack = new EventBridgeStack(
  app,
  `EmbeddingEventBridgeStack-${ENV_VARS.environment}`,
  {
    config: {
      environment: ENV_VARS.environment,
      region: ENV_VARS.region,
      authorization: ENV_VARS.eventBridgeAuthorizedParties,
      domainName: ENV_VARS.domainName,
    },
    embeddingLambda: embeddingNodeFunction,
  }
);
eventBridgeStack.init();

const loadEventBridgeOutput: PrintOutput = new PrintOutput(
  eventBridgeStack,
  `EmbeddingEventBridgeOutput-${ENV_VARS.environment}`,
  {
    value: `EventBridge Rules created for embedding generation and status checking`,
  }
);
const printEventBridgeUseCase: PrintUseCase = new PrintUseCase(
  loadEventBridgeOutput
);
printEventBridgeUseCase.execute();
