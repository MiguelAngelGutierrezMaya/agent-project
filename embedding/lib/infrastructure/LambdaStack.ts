import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { LambdaModel } from '@lib/domain/models/LambdaModel';
import { LambdaIntegration } from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';

import { join } from 'path';

interface LambdaStackProps extends StackProps {
  environment: string;
  region: string;
  clerkSecretKey: string;
  clerkPublishableKey: string;
  clerkJwtKey: string;
  clerkAuthorizedParties: string;
  allowedMethods: string;
  eventBridgePassword: string;
  openAIAPIKey: string;
  databaseHost: string;
  databasePort: string;
  databaseName: string;
  databaseUser: string;
  databasePassword: string;
}

export class LambdaStack extends Stack implements LambdaModel {
  //
  // Properties
  //
  private readonly props: LambdaStackProps;

  //
  // Lambda integrations
  //
  private embeddingLambdaIntegration: LambdaIntegration;

  //
  // Lambda functions
  //
  private embeddingLambdaFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.props = props;
  }

  public getEmbeddingLambdaIntegration(): LambdaIntegration {
    return this.embeddingLambdaIntegration;
  }

  public getEmbeddingNodeFunction(): NodejsFunction {
    return this.embeddingLambdaFunction;
  }

  init(): void {
    const region = this.props.region;

    this.embeddingLambdaFunction = new NodejsFunction(
      this,
      `EmbeddingLambdaFunction-${this.props.environment}`,
      {
        runtime: Runtime.NODEJS_22_X,
        handler: 'handler',
        timeout: Duration.seconds(30),
        entry: join(
          __dirname,
          '..',
          '..',
          'src',
          'infrastructure',
          'presentation',
          'handler.ts'
        ),
        bundling: {
          nodeModules: [],
        },
        environment: {
          REGION: region,
          CLERK_SECRET_KEY: this.props.clerkSecretKey,
          CLERK_PUBLISHABLE_KEY: this.props.clerkPublishableKey,
          CLERK_JWT_KEY: this.props.clerkJwtKey,
          CLERK_AUTHORIZED_PARTIES: this.props.clerkAuthorizedParties,
          ALLOWED_METHODS: this.props.allowedMethods,
          EVENT_BRIDGE_PASSWORD: this.props.eventBridgePassword,
          OPENAI_API_KEY: this.props.openAIAPIKey,
          DATABASE_HOST: this.props.databaseHost,
          DATABASE_PORT: this.props.databasePort,
          DATABASE_NAME: this.props.databaseName,
          DATABASE_USER: this.props.databaseUser,
          DATABASE_PASSWORD: this.props.databasePassword,
        },
      }
    );
  }

  makeIntegration(): void {
    this.embeddingLambdaIntegration = new LambdaIntegration(
      this.embeddingLambdaFunction
    );
  }

  addPolicies() {}

  addPermissions() {}
}
