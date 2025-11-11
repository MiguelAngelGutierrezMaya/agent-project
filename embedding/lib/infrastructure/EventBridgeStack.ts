import {
  EmbeddingAction,
  EmbeddingEvent,
  EmbeddingSchedule,
  HttpMethod,
} from '@lib/domain/interfaces/EmbeddingEvent';
import { Stack, StackProps, Duration } from 'aws-cdk-lib';
import { Rule, Schedule, RuleTargetInput } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Function } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

interface EventBridgeStackProps extends StackProps {
  embeddingLambda: Function;
  config: { [key: string]: any };
}

export class EventBridgeStack extends Stack {
  private props: EventBridgeStackProps;
  private readonly env_name: string;

  constructor(scope: Construct, id: string, props: EventBridgeStackProps) {
    super(scope, id, props);
    this.props = props;
    this.env_name = props.config.environment;
  }

  init(): void {
    // Rule 1: Generate embeddings every 3 minutes
    const generateEmbeddingsRule = new Rule(
      this,
      `EmbeddingGenerateRule-${this.env_name}`,
      {
        ruleName: `embedding-generate-${this.env_name}`,
        description: 'Triggers embedding generation every 3 minutes',
        schedule: Schedule.rate(Duration.minutes(3)),
      }
    );

    const genericData: Partial<EmbeddingEvent> = {
      source: 'aws.events',
      detailType: 'Scheduled Event',
      httpMethod: HttpMethod.EVENT_BRIDGE,
      requestContext: {
        domainName: this.props.config.domainName,
      },
      headers: {
        Authorization: this.props.config.authorization,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    };

    const generateEmbeddingsEventData: Partial<EmbeddingEvent> = {
      action: EmbeddingAction.GENERATE_EMBEDDINGS,
      schedule: EmbeddingSchedule.EVERY_3_MINUTES,
    };

    const generateEmbeddingsEvent = {
      ...generateEmbeddingsEventData,
      ...genericData,
      body: JSON.stringify(generateEmbeddingsEventData),
      path: '/embedding/generate',
      metadata: {
        ruleName: EmbeddingAction.GENERATE_EMBEDDINGS,
        executionTime: '$.time',
        region: this.props.config.region,
      },
    } as EmbeddingEvent;

    generateEmbeddingsRule.addTarget(
      new LambdaFunction(this.props.embeddingLambda, {
        event: RuleTargetInput.fromObject(generateEmbeddingsEvent),
      })
    );

    // Rule 2: Check embedding status every 5 minutes
    const checkStatusRule = new Rule(
      this,
      `EmbeddingStatusRule-${this.env_name}`,
      {
        ruleName: `embedding-status-check-${this.env_name}`,
        description: 'Triggers embedding status check every 5 minutes',
        schedule: Schedule.rate(Duration.minutes(5)),
      }
    );

    const checkEmbeddingsEventData: Partial<EmbeddingEvent> = {
      action: EmbeddingAction.CHECK_EMBEDDING_STATUS,
      schedule: EmbeddingSchedule.EVERY_5_MINUTES,
    };

    const checkEmbeddingsEvent = {
      ...checkEmbeddingsEventData,
      ...genericData,
      path: '/embedding/status',
      body: JSON.stringify(checkEmbeddingsEventData),
      metadata: {
        ruleName: EmbeddingAction.CHECK_EMBEDDING_STATUS,
        executionTime: '$.time',
        region: this.props.config.region,
      },
    } as EmbeddingEvent;

    checkStatusRule.addTarget(
      new LambdaFunction(this.props.embeddingLambda, {
        event: RuleTargetInput.fromObject(checkEmbeddingsEvent),
      })
    );
  }
}
