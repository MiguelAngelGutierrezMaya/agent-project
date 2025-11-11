import { Stack, StackProps } from 'aws-cdk-lib';
import { ApiModel } from '@lib/domain/models/ApiModel';
import {
  Cors,
  LambdaIntegration,
  Resource,
  ResourceOptions,
  RestApi,
} from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';

interface ApiStackProps extends StackProps {
  embeddingLambdaIntegration: LambdaIntegration;
  config: { [key: string]: any };
}

export class ApiStack extends Stack implements ApiModel {
  //
  // Properties
  //
  private props: ApiStackProps;
  private api: RestApi;
  private readonly env_name: string;

  //
  // Resources
  //
  private embeddingResource: Resource;

  //
  // CORS Options
  //
  private options: ResourceOptions;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    this.props = props;
    this.env_name = props.config.environment;
    this.options = {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: props.config.allowedMethods.split(','),
      },
    };
  }

  public getEmbeddingResource(): Resource {
    return this.embeddingResource;
  }

  init(): void {
    this.api = new RestApi(this, `CrealoDigitalEmbedding-${this.env_name}`, {
      restApiName: `CrealoDigitalEmbedding-${this.env_name}`,
      description: `API para operaciones de embedding y vectores en el sistema RAG ${this.env_name}`,
      deployOptions: {
        stageName: this.env_name,
      },
    });

    // Create embedding resource
    this.embeddingResource = this.api.root.addResource(
      'embedding',
      this.options
    );

    // POST /embedding/generate - Generate embeddings
    const generateResource = this.embeddingResource.addResource('generate');
    generateResource.addMethod('GET', this.props?.embeddingLambdaIntegration);
    generateResource.addMethod('POST', this.props?.embeddingLambdaIntegration);
    generateResource.addMethod('PUT', this.props?.embeddingLambdaIntegration);
    generateResource.addMethod(
      'DELETE',
      this.props?.embeddingLambdaIntegration
    );

    // POST /embedding/status - Check embedding status
    const statusResource = this.embeddingResource.addResource('status');
    statusResource.addMethod('GET', this.props?.embeddingLambdaIntegration);
    statusResource.addMethod('POST', this.props?.embeddingLambdaIntegration);
    statusResource.addMethod('PUT', this.props?.embeddingLambdaIntegration);
    statusResource.addMethod('DELETE', this.props?.embeddingLambdaIntegration);
  }
}
