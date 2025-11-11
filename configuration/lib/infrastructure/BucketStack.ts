import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { BucketStack as BucketStackModel } from '@lib/domain/models/BucketStack';
import { Construct } from 'constructs';
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  BucketEncryption,
  HttpMethods,
} from 'aws-cdk-lib/aws-s3';

interface BucketStackProps extends StackProps {
  bucketId: string;
  bucketName: string;
}

export class BucketStack extends Stack implements BucketStackModel {
  private bucket: Bucket;
  private props: BucketStackProps;

  constructor(scope: Construct, id: string, props: BucketStackProps) {
    super(scope, id, props);
    this.props = props;
  }

  public getBucket(): Bucket {
    return this.bucket;
  }

  init(): void {
    this.bucket = new Bucket(this, this.props.bucketId, {
      bucketName: this.props.bucketName,
      cors: [
        {
          allowedMethods: [HttpMethods.GET, HttpMethods.POST],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
        },
      ],
      accessControl: BucketAccessControl.PRIVATE,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      autoDeleteObjects: false,
      removalPolicy: RemovalPolicy.DESTROY,
    });
  }
}
