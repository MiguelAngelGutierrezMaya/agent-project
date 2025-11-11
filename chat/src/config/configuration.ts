/**
 * Default port number for the application server.
 * Used when PORT environment variable is not defined.
 */
const DEFAULT_PORT = 3000;

/**
 * Default AWS region.
 * Used when AWS_REGION environment variable is not defined.
 */
const DEFAULT_AWS_REGION = 'us-east-1';
const DEFAULT_AWS_S3_PRESIGNED_EXPIRES_IN = 60 * 60 * 2;

/**
 * Default MongoDB config.
 * Used when
 * - MONGODB_PUBLIC_DATABASE,
 * - MONGODB_URI,
 * - MONGODB_MAX_POOL_SIZE,
 * - MONGODB_MIN_POOL_SIZE,
 * - MONGODB_SERVER_SELECTION_TIMEOUT,
 * - MONGODB_SOCKET_TIMEOUT
 * environment variable is not defined.
 */
const DEFAULT_MONGODB_URI = 'mongodb://localhost:27017';
const DEFAULT_MONGODB_PUBLIC_DATABASE = 'public';
const DEFAULT_MONGODB_MAX_POOL_SIZE = 10;
const DEFAULT_MONGODB_MIN_POOL_SIZE = 2;
const DEFAULT_MONGODB_SERVER_SELECTION_TIMEOUT = 5000;
const DEFAULT_MONGODB_SOCKET_TIMEOUT = 45000;

/**
 * Default WhatsApp/Facebook API config.
 * Used when
 * - FACEBOOK_ENDPOINT,
 * - API_VERSION,
 * - BUSINESS_PHONE,
 * - WHATSAPP_ACCESS_TOKEN,
 * - WHATSAPP_TOKEN
 * environment variables are not defined.
 */
const DEFAULT_FACEBOOK_ENDPOINT = 'https://graph.facebook.com';
const DEFAULT_API_VERSION = 'v24.0';

/**
 * Default Azure OpenAI config.
 */
const DEFAULT_AZURE_OPENAI_API_KEY = '';
const DEFAULT_AZURE_OPENAI_ENDPOINT = '';
const DEFAULT_AZURE_OPENAI_DEPLOYMENT_NAME = '';
const DEFAULT_AZURE_OPENAI_API_VERSION = '2024-02-15-preview';

/**
 * Default OpenAI config.
 */
const DEFAULT_OPENAI_API_KEY = '';

/**
 * Configuration factory for the application.
 * This function is called by ConfigModule to load configuration values.
 *
 * @returns Configuration object with application settings
 */
export default () => ({
  port: parseInt(process.env.PORT ?? DEFAULT_PORT.toString(), 10),
  aws: {
    region: process.env.AWS_REGION ?? DEFAULT_AWS_REGION,
    sqs: {
      configNotificationsQueueUrl: process.env.CONFIG_NOTIFICATIONS_QUEUE_URL,
    },
  },
  mongodb: {
    /* MongoDB cluster connection URI */
    uri: process.env.MONGODB_URI ?? DEFAULT_MONGODB_URI,

    /* Public/shared database name (for user mapping and shared data) */
    publicDatabase:
      process.env.MONGODB_PUBLIC_DATABASE ?? DEFAULT_MONGODB_PUBLIC_DATABASE,

    /* Connection pool size */
    maxPoolSize: parseInt(
      process.env.MONGODB_MAX_POOL_SIZE ??
        DEFAULT_MONGODB_MAX_POOL_SIZE.toString(),
      10
    ),

    /* Minimum pool size */
    minPoolSize: parseInt(
      process.env.MONGODB_MIN_POOL_SIZE ??
        DEFAULT_MONGODB_MIN_POOL_SIZE.toString(),
      10
    ),

    /* Server selection timeout in milliseconds */
    serverSelectionTimeoutMS: parseInt(
      process.env.MONGODB_SERVER_SELECTION_TIMEOUT ??
        DEFAULT_MONGODB_SERVER_SELECTION_TIMEOUT.toString(),
      10
    ),

    /* Socket timeout in milliseconds */
    socketTimeoutMS: parseInt(
      process.env.MONGODB_SOCKET_TIMEOUT ??
        DEFAULT_MONGODB_SOCKET_TIMEOUT.toString(),
      10
    ),
  },
  whatsapp: {
    /* Facebook Graph API endpoint */
    facebookEndpoint:
      process.env.FACEBOOK_ENDPOINT ?? DEFAULT_FACEBOOK_ENDPOINT,

    /* Facebook Graph API version */
    apiVersion: process.env.API_VERSION ?? DEFAULT_API_VERSION,

    /* WhatsApp Business Phone Number ID */
    businessPhone: process.env.BUSINESS_PHONE ?? '',

    /* WhatsApp Access Token for API calls */
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN ?? '',

    /* WhatsApp Webhook Verification Token */
    verifyToken: process.env.WHATSAPP_TOKEN ?? '',
  },
  azure: {
    openai: {
      /* Azure OpenAI API Key */
      apiKey: process.env.AZURE_OPENAI_API_KEY ?? DEFAULT_AZURE_OPENAI_API_KEY,

      /* Azure OpenAI Endpoint */
      endpoint:
        process.env.AZURE_OPENAI_ENDPOINT ?? DEFAULT_AZURE_OPENAI_ENDPOINT,

      /* Azure OpenAI Deployment Name */
      deploymentName:
        process.env.AZURE_OPENAI_DEPLOYMENT_NAME ??
        DEFAULT_AZURE_OPENAI_DEPLOYMENT_NAME,

      /* Azure OpenAI API Version */
      apiVersion:
        process.env.AZURE_OPENAI_API_VERSION ??
        DEFAULT_AZURE_OPENAI_API_VERSION,
    },
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? DEFAULT_OPENAI_API_KEY,
  },
  files: {
    bucketName: process.env.BUCKET_NAME ?? '',
    presignedExpiresIn: parseInt(
      process.env.FILE_PRESIGNED_EXPIRES_IN ??
        DEFAULT_AWS_S3_PRESIGNED_EXPIRES_IN.toString(),
      10
    ),
  },
});
