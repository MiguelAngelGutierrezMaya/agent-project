import { Duration, Stack, StackProps } from 'aws-cdk-lib';
import { Queue, QueueEncryption } from 'aws-cdk-lib/aws-sqs';
import { QueueModel } from '@lib/domain/models/QueueModel';
import { Construct } from 'constructs';

/**
 * Queue stack properties
 *
 * @interface QueueStackProps
 * @extends {StackProps}
 *
 * @property {string} queueId - Unique identifier for the queue construct
 * @property {string} queueName - Name of the SQS queue
 * @property {string} environment - Deployment environment (development, staging, production)
 */
interface QueueStackProps extends StackProps {
  queueId: string;
  queueName: string;
  environment: string;
}

/**
 * Queue stack implementation
 *
 * @description Creates and manages an SQS queue for configuration change notifications.
 * This queue will be used to notify other microservices when configuration changes occur.
 *
 * @class QueueStack
 * @extends {Stack}
 * @implements {QueueModel}
 */
export class QueueStack extends Stack implements QueueModel {
  private queue: Queue;
  private props: QueueStackProps;

  /**
   * Creates an instance of QueueStack.
   *
   * @param {Construct} scope - The scope in which to define this construct
   * @param {string} id - The scoped construct ID
   * @param {QueueStackProps} props - Stack properties
   */
  constructor(scope: Construct, id: string, props: QueueStackProps) {
    super(scope, id, props);
    this.props = props;
  }

  /**
   * Gets the SQS queue instance
   *
   * @returns {Queue} The SQS queue
   */
  public getQueue(): Queue {
    return this.queue;
  }

  /**
   * Initializes the SQS queue with the specified configuration
   *
   * @description Creates an SQS queue with encryption, dead letter queue,
   * and appropriate retention settings for configuration change notifications.
   *
   * @returns {void}
   */
  init(): void {
    /* Create the dead letter queue for failed messages */
    const deadLetterQueue = new Queue(this, `${this.props.queueId}-DLQ`, {
      queueName: `${this.props.queueName}-dlq`,
      encryption: QueueEncryption.SQS_MANAGED,
      retentionPeriod: Duration.days(14),
    });

    /* Create the main configuration notifications queue */
    this.queue = new Queue(this, this.props.queueId, {
      queueName: this.props.queueName,
      encryption: QueueEncryption.SQS_MANAGED,
      visibilityTimeout: Duration.seconds(300),
      retentionPeriod: Duration.days(7),
      receiveMessageWaitTime: Duration.seconds(20),
      deadLetterQueue: {
        queue: deadLetterQueue,
        maxReceiveCount: 3,
      },
    });
  }
}
