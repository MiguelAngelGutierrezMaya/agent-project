# Embedding Microservice

## 📋 Executive Summary

The **Embedding Microservice** is a serverless solution built with **AWS CDK** that processes documents and products to generate vector embeddings using OpenAI's embedding models. It follows **Hexagonal Architecture** principles to ensure clean separation of concerns, testability, and scalability.

## 🎯 Purpose

This microservice handles the automatic generation and storage of vector embeddings for:

- **Documents**: Training materials, PDFs, and knowledge base content
- **Products**: Product catalog with descriptions and specifications

The embeddings enable semantic search capabilities across the platform, allowing AI assistants to find relevant information based on context rather than exact keyword matches.

## 🏛️ Architecture

### Hexagonal Architecture (Ports & Adapters)

```
src/
├── application/              # Application layer (Use Cases)
│   └── use-cases/
│       └── AuthUseCases.ts
├── domain/                   # Domain layer (Core Business Logic)
│   └── services/
│       ├── Auth.ts
│       └── Logger.ts
├── infrastructure/           # Infrastructure layer (Adapters)
│   ├── presentation/         # HTTP/API adapters
│   ├── service/              # Service implementations
│   └── shared/               # Shared infrastructure utilities
└── modules/                  # Feature modules
    └── embedding/
        ├── application/      # Embedding use cases
        ├── domain/           # Embedding business logic
        └── infrastructure/   # Embedding adapters
```

### CDK Infrastructure

```
lib/
├── application/              # CDK use cases
│   └── use-cases/
│       ├── load-api-use-case.ts
│       ├── load-lambda-use-case.ts
│       └── print-use-case.ts
├── domain/                   # CDK domain models
│   ├── interfaces/
│   └── models/
└── infrastructure/           # AWS stacks
    ├── ApiStack.ts           # API Gateway stack
    ├── EventBridgeStack.ts   # Event processing stack
    ├── LambdaStack.ts        # Lambda functions stack
    └── PrintOutput.ts        # Output utilities
```

## 🛠️ Technology Stack

### Backend Core

- **Node.js 18.x** - Runtime environment
- **TypeScript 5.9.2** - Static typing
- **AWS Lambda** - Serverless compute
- **AWS API Gateway** - HTTP endpoints
- **AWS EventBridge** - Event-driven processing

### Infrastructure

- **AWS CDK 2.214.0** - Infrastructure as Code
- **AWS SDK v3** - AWS service interactions

### Data & Storage

- **PostgreSQL** - Primary database with pgvector extension
- **pg 8.16.3** - PostgreSQL client

### AI & Embeddings

- **OpenAI API 6.7.0** - Text embedding generation
- **text-embedding-3-small** - Embedding model

### Authentication & Security

- **Clerk 2.14.0** - Authentication provider
- **Custom middleware** - Authorization and tenant isolation

### Utilities

- **Winston 3.17.0** - Structured logging
- **dotenv 17.2.2** - Environment configuration

## 📊 Key Features

### 1. Vector Embedding Generation

- **Automatic processing**: Triggered by configuration changes via EventBridge
- **Batch processing**: Handles multiple documents/products in a single operation
- **Direct processing**: Real-time embedding generation for immediate needs
- **Markdown conversion**: Structured content transformation before embedding

### 2. Multi-tenant Architecture

- **Schema isolation**: Each tenant has a dedicated PostgreSQL schema
- **Secure access**: Clerk authentication with tenant-specific authorization
- **Request tracking**: Company modification requests for audit trails

### 3. Embedding Strategies

#### Processing Modes

- **BatchProcessingMode**: Queues items for background processing
- **DirectProcessingMode**: Immediate synchronous processing

#### Provider Strategies

- **OpenAI Text Embedding Small**: Optimized for cost and performance
- Extensible for additional embedding providers

#### Markdown Generation

- **DocumentMarkdownStrategy**: Converts documents to structured markdown
- **ProductMarkdownStrategy**: Formats product data with specifications

### 4. Change Detection

- **Modification tracking**: Monitors configuration changes
- **Status management**: Tracks pending, processing, completed, and failed states
- **Batch status checking**: Verifies completion of bulk operations

## 🚀 Installation

### Prerequisites

- **Node.js**: v18.x or higher
- **pnpm**: v10.15.1 (specified in `packageManager`)
- **AWS CLI**: Configured with appropriate credentials
- **PostgreSQL**: Database with pgvector extension
- **AWS Account**: With permissions to deploy Lambda, API Gateway, and EventBridge

### Step 1: Install Dependencies

```bash
cd embedding
pnpm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `embedding/` directory:

```bash
# AWS Configuration
AWS_REGION=us-east-1

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_xxxxx
CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_JWT_KEY=xxxxx
CLERK_AUTHORIZED_PARTIES=https://your-domain.com

# API Configuration
ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS

# EventBridge Configuration
EVENT_BRIDGE_AUTHORIZED_PARTIES=your-authorized-party
EVENT_BRIDGE_PASSWORD=your-secure-password

# Domain Configuration
DOMAIN_NAME=your-api-domain.com

# OpenAI Configuration
OPENAI_API_KEY=sk-xxxxx

# Database Configuration
DATABASE_HOST=your-postgres-host
DATABASE_PORT=5432
DATABASE_NAME=your_database_name
DATABASE_USER=your_database_user
DATABASE_PASSWORD=your_database_password
```

### Step 3: Bootstrap AWS CDK (First Time Only)

```bash
pnpm run cdk:bootstrap
```

### Step 4: Deploy to Development

```bash
pnpm run cdk:deploy:dev
```

This command will:

1. Set `NODE_ENV=development`
2. Bootstrap the CDK environment
3. Synthesize CloudFormation templates
4. Deploy all stacks without approval prompts
5. Save outputs to `outputs.json`

### Step 5: Deploy to Production

```bash
pnpm run cdk:deploy:prod
```

This command follows the same process but with `NODE_ENV=production`.

## 📜 Available Scripts

### Development

```bash
pnpm dev                    # Run in development mode with tsx
pnpm build                  # Compile TypeScript and resolve aliases
pnpm start                  # Run compiled code from dist/
pnpm clean                  # Remove dist/ directory
```

### Testing

```bash
pnpm test                   # Run Jest tests
```

### CDK Operations

```bash
pnpm run cdk                # Run CDK CLI directly
pnpm run cdk:bootstrap      # Bootstrap CDK environment
pnpm run cdk:synth          # Synthesize CloudFormation templates
pnpm run cdk:deploy         # Deploy stacks manually
pnpm run cdk:deploy:dev     # Deploy to development (automated)
pnpm run cdk:deploy:prod    # Deploy to production (automated)
pnpm run cdk:destroy:dev    # Destroy development stacks
pnpm run cdk:destroy:prod   # Destroy production stacks
```

## 🔍 Project Structure Details

### Domain Models

#### Core Models

- **EmbeddingConfig**: Configuration for embedding generation
- **EmbeddingProcessingItem**: Individual items to be processed
- **EmbeddingResult**: Result of embedding generation
- **EmbeddingStatus**: Status tracking (pending, processing, completed, failed)

#### Entity Models

- **Document**: Training documents and knowledge base content
- **DocumentEmbedding**: Generated embeddings for documents
- **Product**: Product catalog items
- **ProductEmbedding**: Generated embeddings for products
- **CompanyRequest**: Configuration change requests
- **CompanyModification**: Tracked modifications for audit

### Use Cases

#### Embedding Processing

1. **ProcessEmbeddingsWithMarkdownUseCase**
   - Converts content to markdown
   - Generates embeddings using selected provider
   - Stores embeddings in database
   - Updates modification status

2. **CheckBatchEmbeddingsStatusUseCase**
   - Verifies completion of batch operations
   - Updates modification request status
   - Handles partial failures

### Repositories

Each entity has a dedicated repository following the repository pattern:

- **DocumentRepository**: Document CRUD operations
- **ProductRepository**: Product CRUD operations
- **CompanyRequestRepository**: Configuration request management
- **CompanyModificationRepository**: Modification tracking

### Datasources

PostgreSQL implementations for data access:

- **PgDocumentDatasourceImp**: Document database operations
- **PgProductDatasourceImp**: Product database operations
- **PgCompanyRequestDatasourceImp**: Request database operations
- **PgCompanyModificationDatasourceImp**: Modification database operations

## 🌐 API Endpoints

### POST /embedding/process

Process embeddings for documents and products based on a configuration change request.

**Request Body:**

```json
{
  "companyRequestId": "uuid-of-request",
  "processingMode": "batch" | "direct"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "modificationsProcessed": 5,
    "status": "completed"
  }
}
```

### GET /embedding/status/:requestId

Check the status of a batch embedding operation.

**Response:**

```json
{
  "success": true,
  "data": {
    "status": "completed",
    "totalModifications": 10,
    "completedModifications": 10,
    "failedModifications": 0
  }
}
```

## 🔐 Security

### Authentication

- **Clerk JWT validation**: All requests must include valid Clerk session tokens
- **Authorized parties validation**: Requests must originate from approved domains

### Authorization

- **Tenant isolation**: Each request is scoped to the authenticated user's tenant
- **Schema-based separation**: Database schemas isolate tenant data
- **Row-level security**: Additional PostgreSQL policies for data access

### EventBridge Security

- **Password-based authentication**: EventBridge events require password header
- **Authorized party validation**: Events must come from approved sources

## 📊 Database Schema

### Tables

#### documents

- `id` (UUID, PK)
- `schema` (VARCHAR) - Tenant identifier
- `name` (VARCHAR)
- `type` (VARCHAR)
- `url` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### document_embeddings

- `id` (UUID, PK)
- `document_id` (UUID, FK)
- `embedding` (VECTOR) - pgvector type
- `metadata` (JSONB)
- `created_at` (TIMESTAMP)

#### products

- `id` (UUID, PK)
- `schema` (VARCHAR) - Tenant identifier
- `name` (VARCHAR)
- `description` (TEXT)
- `specifications` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### product_embeddings

- `id` (UUID, PK)
- `product_id` (UUID, FK)
- `embedding` (VECTOR) - pgvector type
- `metadata` (JSONB)
- `created_at` (TIMESTAMP)

#### company_requests

- `id` (UUID, PK)
- `schema` (VARCHAR)
- `request_type` (VARCHAR)
- `status` (VARCHAR)
- `created_at` (TIMESTAMP)

#### company_modifications

- `id` (UUID, PK)
- `company_request_id` (UUID, FK)
- `entity_type` (VARCHAR) - 'document' or 'product'
- `entity_id` (UUID)
- `operation` (VARCHAR) - 'create', 'update', 'delete'
- `status` (VARCHAR) - 'pending', 'processing', 'completed', 'failed'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## 🧪 Testing

### Run Tests

```bash
pnpm test
```

### Test Structure

```
test/
├── unit/                 # Unit tests for business logic
├── integration/          # Integration tests for APIs
└── e2e/                 # End-to-end tests
```

## 🚨 Troubleshooting

### Common Issues

#### 1. CDK Bootstrap Fails

**Problem**: `CDKToolkit stack not found`
**Solution**:

```bash
aws configure  # Verify AWS credentials
pnpm run cdk:bootstrap
```

#### 2. Lambda Timeout

**Problem**: Embedding generation times out
**Solution**: Increase Lambda timeout in `LambdaStack.ts` or switch to batch processing mode

#### 3. Database Connection Issues

**Problem**: Cannot connect to PostgreSQL
**Solution**:

- Verify `DATABASE_*` environment variables
- Check security group rules for Lambda
- Ensure pgvector extension is installed

#### 4. OpenAI API Errors

**Problem**: Embedding generation fails
**Solution**:

- Verify `OPENAI_API_KEY` is valid
- Check OpenAI API rate limits
- Review error logs in CloudWatch

## 📈 Monitoring

### CloudWatch Logs

- Lambda execution logs: `/aws/lambda/embedding-function-{env}`
- API Gateway logs: `/aws/apigateway/embedding-api-{env}`

### Metrics to Monitor

- **Lambda duration**: Should be < 30 seconds for most operations
- **API Gateway 4xx/5xx**: Should be < 1%
- **Embedding generation success rate**: Should be > 99%
- **Database connection pool**: Monitor for connection exhaustion

## 🔄 CI/CD

### GitHub Actions Workflow

The microservice is automatically deployed via GitHub Actions when changes are pushed to the `main` branch in the `embedding/` directory.

**Workflow:** `.github/workflows/deploy_embedding.yml`

**Triggers:**

- Push to `main` branch affecting `embedding/**`
- Manual workflow dispatch

**Steps:**

1. Detect changes in embedding directory
2. Checkout repository
3. Configure Node.js and pnpm
4. Install dependencies
5. Configure AWS credentials
6. Deploy CDK stacks (development or production based on input)

## 📚 Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Clerk Authentication](https://clerk.com/docs)

## 🤝 Contributing

1. Create a feature branch from `main`
2. Follow the hexagonal architecture patterns
3. Add tests for new functionality
4. Update this README if adding new features
5. Submit a pull request for review

## 📝 License

ISC License - See LICENSE file for details

---

**For questions or support, contact the development team.**
