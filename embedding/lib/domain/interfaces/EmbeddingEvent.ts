/**
 * Enums for embedding actions
 */
export enum EmbeddingAction {
  GENERATE_EMBEDDINGS = 'generate_embeddings',
  CHECK_EMBEDDING_STATUS = 'check_embedding_status',
}

/**
 * Types for embedding actions
 */
export type EmbeddingActionType =
  (typeof EmbeddingAction)[keyof typeof EmbeddingAction];

/**
 * Enums for embedding schedules
 */
export enum EmbeddingSchedule {
  EVERY_3_MINUTES = 'every_3_minutes',
  EVERY_5_MINUTES = 'every_5_minutes',
}

/**
 * Types for embedding schedules
 */
export type EmbeddingScheduleType =
  (typeof EmbeddingSchedule)[keyof typeof EmbeddingSchedule];

/**
 * Interface for the request context
 */
export interface RequestContext {
  domainName: string;
}

/**
 * Enums for HTTP methods
 */
export enum HttpMethod {
  EVENT_BRIDGE = 'EVENT_BRIDGE',
}

/**
 * Types for HTTP methods
 */
export type HttpMethodType = (typeof HttpMethod)[keyof typeof HttpMethod];

/**
 * Interface for embedding events that can be triggered by EventBridge
 */
export interface EmbeddingEvent {
  /** Event source */
  source: string;

  /** Event detail type */
  detailType: string;

  /** The action to perform */
  action: EmbeddingActionType;
  /** The schedule frequency */
  schedule: EmbeddingScheduleType;

  /** The HTTP method to use */
  httpMethod: HttpMethodType;

  /** The path to use */
  path: string;

  /** The request context */
  requestContext: RequestContext;

  /** The headers to use */
  headers: Record<string, string>;

  /** The body to use */
  body: string;

  /** Additional metadata for the event */
  metadata: {
    /** Name of the rule that triggered the event */
    ruleName: string;
    /** Execution time (can use EventBridge variables like $.time) */
    executionTime: string;
    /** AWS region where the event was triggered */
    region: string;
  };
}
