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
  configLambdaIntegration: LambdaIntegration;
  productsLambdaIntegration: LambdaIntegration;
  documentsLambdaIntegration: LambdaIntegration;
  filesLambdaIntegration: LambdaIntegration;
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
  private configurationResource: Resource;
  private productsResource: Resource;
  private productsCategoriesResource: Resource;
  private documentsResource: Resource;
  private filesResource: Resource;

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

  public getConfigurationResource(): Resource {
    return this.configurationResource;
  }

  public getProductsResource(): Resource {
    return this.productsResource;
  }

  public getProductsCategoriesResource(): Resource {
    return this.productsCategoriesResource;
  }

  public getDocumentsResource(): Resource {
    return this.documentsResource;
  }

  public getFilesResource(): Resource {
    return this.filesResource;
  }

  async init(): Promise<void> {
    this.api = new RestApi(this, `CrealoDigitalConfig-${this.env_name}`, {
      restApiName: `CrealoDigitalConfig-${this.env_name}`,
      description: `API para la configuracion de usuarios en el sistema RAG ${this.env_name}`,
      deployOptions: {
        stageName: this.env_name,
      },
    });

    //
    // Configuration
    //
    this.configurationResource = this.api.root.addResource(
      'config',
      this.options
    );
    this.configurationResource.addMethod(
      'GET',
      this.props?.configLambdaIntegration
    );
    this.configurationResource.addMethod(
      'POST',
      this.props?.configLambdaIntegration
    );
    this.configurationResource.addMethod(
      'PUT',
      this.props?.configLambdaIntegration
    );
    this.configurationResource.addMethod(
      'DELETE',
      this.props?.configLambdaIntegration
    );

    //
    // Products
    //
    this.productsResource = this.api.root.addResource('products', this.options);
    this.productsResource.addMethod(
      'GET',
      this.props?.productsLambdaIntegration
    );
    this.productsResource.addMethod(
      'POST',
      this.props?.productsLambdaIntegration
    );
    this.productsResource.addMethod(
      'PUT',
      this.props?.productsLambdaIntegration
    );
    this.productsResource.addMethod(
      'DELETE',
      this.props?.productsLambdaIntegration
    );

    //
    // Products Categories
    //
    this.productsCategoriesResource = this.productsResource.addResource(
      'categories',
      this.options
    );
    this.productsCategoriesResource.addMethod(
      'GET',
      this.props?.productsLambdaIntegration
    );
    this.productsCategoriesResource.addMethod(
      'POST',
      this.props?.productsLambdaIntegration
    );
    this.productsCategoriesResource.addMethod(
      'PUT',
      this.props?.productsLambdaIntegration
    );
    this.productsCategoriesResource.addMethod(
      'DELETE',
      this.props?.productsLambdaIntegration
    );

    //
    // Documents
    //
    this.documentsResource = this.api.root.addResource(
      'documents',
      this.options
    );
    this.documentsResource.addMethod(
      'GET',
      this.props?.documentsLambdaIntegration
    );
    this.documentsResource.addMethod(
      'POST',
      this.props?.documentsLambdaIntegration
    );
    this.documentsResource.addMethod(
      'PUT',
      this.props?.documentsLambdaIntegration
    );
    this.documentsResource.addMethod(
      'DELETE',
      this.props?.documentsLambdaIntegration
    );

    //
    // Files
    //
    this.filesResource = this.api.root.addResource('files', this.options);
    this.filesResource.addMethod('GET', this.props?.filesLambdaIntegration);
    this.filesResource.addMethod('POST', this.props?.filesLambdaIntegration);
    this.filesResource.addMethod('PUT', this.props?.filesLambdaIntegration);
    this.filesResource.addMethod('DELETE', this.props?.filesLambdaIntegration);
  }
}
