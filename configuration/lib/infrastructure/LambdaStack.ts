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
  databaseHost: string;
  databasePort: string;
  databaseName: string;
  databaseUser: string;
  databasePassword: string;
  bucketName: string;
  configNotificationsQueueUrl: string;
}

export class LambdaStack extends Stack implements LambdaModel {
  //
  // Properties
  //
  private readonly props: LambdaStackProps;

  //
  // Lambda integrations
  //
  private configLambdaIntegration: LambdaIntegration;
  private productsLambdaIntegration: LambdaIntegration;
  private documentsLambdaIntegration: LambdaIntegration;
  private filesLambdaIntegration: LambdaIntegration;

  //
  // Lambda functions
  //
  private configLambdaFunction: NodejsFunction;
  private productsLambdaFunction: NodejsFunction;
  private documentsLambdaFunction: NodejsFunction;
  private filesLambdaFunction: NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    this.props = props;
  }

  //
  // Lambda integrations
  //
  public getConfigLambdaIntegration(): LambdaIntegration {
    return this.configLambdaIntegration;
  }

  public getProductsLambdaIntegration(): LambdaIntegration {
    return this.productsLambdaIntegration;
  }

  public getDocumentsLambdaIntegration(): LambdaIntegration {
    return this.documentsLambdaIntegration;
  }

  public getFilesLambdaIntegration(): LambdaIntegration {
    return this.filesLambdaIntegration;
  }

  //
  // Lambda functions
  //
  public getConfigNodeFunction(): NodejsFunction {
    return this.configLambdaFunction;
  }

  public getProductsNodeFunction(): NodejsFunction {
    return this.productsLambdaFunction;
  }

  public getDocumentsNodeFunction(): NodejsFunction {
    return this.documentsLambdaFunction;
  }

  public getFilesNodeFunction(): NodejsFunction {
    return this.filesLambdaFunction;
  }

  init(): void {
    const region = this.props.region;

    this.configLambdaFunction = new NodejsFunction(
      this,
      `ConfigLambdaFunction-${this.props.environment}`,
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
          'handler-config.ts'
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
          DATABASE_HOST: this.props.databaseHost,
          DATABASE_PORT: this.props.databasePort,
          DATABASE_NAME: this.props.databaseName,
          DATABASE_USER: this.props.databaseUser,
          DATABASE_PASSWORD: this.props.databasePassword,
          CONFIG_NOTIFICATIONS_QUEUE_URL:
            this.props.configNotificationsQueueUrl,
        },
      }
    );

    this.productsLambdaFunction = new NodejsFunction(
      this,
      `ProductsLambdaFunction-${this.props.environment}`,
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
          'handler-products.ts'
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
          DATABASE_HOST: this.props.databaseHost,
          DATABASE_PORT: this.props.databasePort,
          DATABASE_NAME: this.props.databaseName,
          DATABASE_USER: this.props.databaseUser,
          DATABASE_PASSWORD: this.props.databasePassword,
        },
      }
    );

    this.documentsLambdaFunction = new NodejsFunction(
      this,
      `DocumentsLambdaFunction-${this.props.environment}`,
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
          'handler-documents.ts'
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
          DATABASE_HOST: this.props.databaseHost,
          DATABASE_PORT: this.props.databasePort,
          DATABASE_NAME: this.props.databaseName,
          DATABASE_USER: this.props.databaseUser,
          DATABASE_PASSWORD: this.props.databasePassword,
        },
      }
    );

    this.filesLambdaFunction = new NodejsFunction(
      this,
      `FilesLambdaFunction-${this.props.environment}`,
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
          'handler-files.ts'
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
          BUCKET_NAME: this.props.bucketName,
        },
      }
    );
  }

  makeIntegration(): void {
    this.configLambdaIntegration = new LambdaIntegration(
      this.configLambdaFunction
    );
    this.productsLambdaIntegration = new LambdaIntegration(
      this.productsLambdaFunction
    );
    this.documentsLambdaIntegration = new LambdaIntegration(
      this.documentsLambdaFunction
    );
    this.filesLambdaIntegration = new LambdaIntegration(
      this.filesLambdaFunction
    );
  }

  addPolicies() {}

  addPermissions() {}
}
