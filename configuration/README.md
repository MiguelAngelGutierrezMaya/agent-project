# Configuration Microservice

## 📋 Executive Summary

The **Configuration Microservice** is a serverless API built with **AWS CDK** that provides centralized configuration management for the AI assistant platform. It manages company profiles, documents, products, product categories, and file storage, following **Hexagonal Architecture** principles to ensure maintainability, testability, and scalability.

## 🎯 Purpose

This microservice serves as the central configuration hub for the entire platform, managing:
- **Company Configuration**: AI settings, billing information, menu options, and social media links
- **Documents**: Training materials and knowledge base content for the AI assistant
- **Products**: Product catalog with descriptions, specifications, and pricing
- **Product Categories**: Hierarchical organization of products
- **Files**: S3-based file storage with presigned URL generation
- **Configuration Notifications**: Event-driven updates via AWS SQS

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
│   │   ├── application.ts
│   │   ├── handler-config.ts
│   │   ├── handler-documents.ts
│   │   ├── handler-files.ts
│   │   ├── handler-products.ts
│   │   └── router.ts
│   ├── service/              # Service implementations
│   └── shared/               # Shared infrastructure utilities
└── modules/                  # Feature modules
    ├── config/               # Configuration management
    ├── documents/            # Document management
    ├── files/                # File storage (S3)
    ├── products/             # Product catalog
    └── shared/               # Shared module utilities
```

### CDK Infrastructure

```
lib/
├── application/              # CDK use cases
│   └── use-cases/
│       ├── load-api-use-case.ts
│       ├── load-bucket-use-case.ts
│       ├── load-lambda-use-case.ts
│       ├── load-queue-use-case.ts
│       └── print-use-case.ts
├── domain/                   # CDK domain models
│   └── models/
│       ├── ApiModel.ts
│       ├── BucketStack.ts
│       ├── LambdaModel.ts
│       ├── PrintDataModel.ts
│       ├── QueueModel.ts
│       └── StackModel.ts
└── infrastructure/           # AWS stacks
    ├── ApiStack.ts           # API Gateway stack
    ├── BucketStack.ts        # S3 bucket stack
    ├── LambdaStack.ts        # Lambda functions stack
    ├── PrintOutput.ts        # Output utilities
    └── QueueStack.ts         # SQS queue stack
```

## 🛠️ Technology Stack

### Backend Core
- **Node.js 18.x** - Runtime environment
- **TypeScript 5.9.2** - Static typing
- **AWS Lambda** - Serverless compute
- **AWS API Gateway** - HTTP endpoints

### Infrastructure
- **AWS CDK 2.214.0** - Infrastructure as Code
- **AWS SDK v3** - AWS service interactions

### Data & Storage
- **PostgreSQL** - Primary database
- **pg 8.11.3** - PostgreSQL client
- **AWS S3** - File storage
- **AWS SQS** - Configuration notification queue

### Authentication & Security
- **Clerk 2.14.0** - Authentication provider
- **Custom middleware** - Authorization and tenant isolation

### Utilities
- **Winston 3.17.0** - Structured logging
- **dotenv 17.2.2** - Environment configuration
- **uuid 13.0.0** - Unique identifier generation

## 📊 Key Features

### 1. Configuration Management
- **AI Configuration**: Model settings, temperature, max tokens, system prompts
- **Billing Information**: Subscription plans and payment details
- **Menu Options**: Bot menu structure and options
- **Social Media**: Company social profiles and contact information
- **Change Notifications**: SQS-based event publishing for configuration updates

### 2. Document Management
- **CRUD Operations**: Create, read, update, delete training documents
- **Document Types**: URL-based and PDF documents
- **Pagination**: Efficient listing with offset/limit pagination
- **Multi-tenant**: Schema-based tenant isolation

### 3. Product Catalog
- **Product Management**: Full CRUD for products with specifications
- **Product Categories**: Hierarchical category structure
- **Product Details**: Name, description, price, stock, specifications (JSONB)
- **Featured Products**: Highlight specific products
- **Pagination**: Cursor-based and offset pagination support

### 4. File Storage
- **S3 Integration**: Upload files to S3 with automatic key generation
- **Presigned URLs**: Secure, temporary URLs for file access
- **Base64 Upload**: Direct base64-to-S3 conversion
- **Content Type Detection**: Automatic MIME type handling

### 5. Multi-tenancy
- **Schema Isolation**: Each tenant has a dedicated PostgreSQL schema
- **Secure Access**: Clerk authentication with tenant-specific authorization
- **Request Scoping**: All requests are scoped to the authenticated user's tenant

## 🚀 Installation

### Prerequisites

- **Node.js**: v18.x or higher
- **pnpm**: v10.15.1 (specified in `packageManager`)
- **AWS CLI**: Configured with appropriate credentials
- **PostgreSQL**: Database with required schemas
- **AWS Account**: With permissions to deploy Lambda, API Gateway, S3, and SQS
- **Clerk Account**: For authentication

### Step 1: Install Dependencies

```bash
cd configuration
pnpm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `configuration/` directory:

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

**Option 1: Using deployment script (recommended)**

```bash
pnpm run cdk:deploy:dev
```

This command will:
1. Set `NODE_ENV=development`
2. Bootstrap the CDK environment
3. Synthesize CloudFormation templates
4. Deploy all stacks
5. Save outputs to `outputs.json`

**Option 2: Deploy with stack exclusions**

```bash
# Exclude specific stacks (e.g., FilesBucketStack if it already exists)
pnpm run cdk:deploy:dev -- --exclude FilesBucketStack
```

### Step 5: Deploy to Production

```bash
pnpm run cdk:deploy:prod
```

Or with exclusions:

```bash
pnpm run cdk:deploy:prod -- --exclude FilesBucketStack
```

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

# List stacks
pnpm run cdk:list:dev       # List development stacks
pnpm run cdk:list:prod      # List production stacks

# Deploy stacks
pnpm run cdk:deploy:dev     # Deploy to development
pnpm run cdk:deploy:prod    # Deploy to production

# Destroy stacks
pnpm run cdk:destroy:dev    # Destroy development stacks
pnpm run cdk:destroy:prod   # Destroy production stacks
```

### Deployment Script Features

The `scripts/deploy-stacks.sh` script provides advanced deployment options:

```bash
# Deploy all stacks
./scripts/deploy-stacks.sh development

# Deploy with bootstrap
./scripts/deploy-stacks.sh development --bootstrap

# Exclude specific stacks
./scripts/deploy-stacks.sh development --exclude FilesBucketStack

# Exclude multiple stacks
./scripts/deploy-stacks.sh development --exclude FilesBucketStack,QueueStack

# Custom output file
./scripts/deploy-stacks.sh development --output custom-outputs.json

# Skip synth step
./scripts/deploy-stacks.sh development --no-synth

# Require approval for changes
./scripts/deploy-stacks.sh development --require-approval any-change
```

**Environment Variables for Scripts:**
```bash
# Alternative to CLI args
EXCLUDE=FilesBucketStack pnpm run cdk:deploy:dev
BOOTSTRAP=true pnpm run cdk:deploy:dev
OUTPUT_FILE=custom.json pnpm run cdk:deploy:dev
```

## 🔍 Project Structure Details

### Core Modules

#### 1. Config Module
Manages company configuration including AI settings, billing, menu options, and social media.

**Domain Models:**
- `Config`: Master configuration object
- `AiConfig`: AI model settings and prompts
- `Billing`: Subscription and payment information
- `OptionsConfig`: Bot menu options
- `SocialConfig`: Social media profiles

**Key Use Cases:**
- `ConfigUseCase`: Get and update configuration
- `SendConfigNotificationUseCase`: Publish configuration change events to SQS

**Repositories:**
- `ConfigRepository`: Configuration CRUD operations
- `NotificationRepository`: SQS notification publishing

#### 2. Documents Module
Manages training documents and knowledge base content.

**Domain Models:**
- `Document`: Training document metadata
- `DocumentEmbedding`: Vector embeddings for documents

**Key Use Cases:**
- `DocumentUseCase`: CRUD operations for documents

**Repositories:**
- `DocumentRepository`: Document CRUD operations

#### 3. Products Module
Manages product catalog with categories and specifications.

**Domain Models:**
- `Product`: Product entity with name, description, price, stock
- `ProductCategory`: Hierarchical product categories
- `ProductEmbedding`: Vector embeddings for products

**Key Use Cases:**
- `ProductUseCase`: CRUD operations for products
- `ProductCategoryUseCase`: CRUD operations for categories

**Repositories:**
- `ProductRepository`: Product CRUD operations
- `ProductCategoryRepository`: Category CRUD operations

#### 4. Files Module
Manages file uploads to S3 and presigned URL generation.

**Domain Models:**
- `File`: File metadata with S3 key and URL

**Key Use Cases:**
- `CreateFileUseCase`: Upload files to S3
- `GetFileUseCase`: Generate presigned URLs

**Repositories:**
- `FileRepository`: File operations

**Datasources:**
- `S3FileDatasourceImp`: S3 SDK integration

### Shared Infrastructure

#### Authentication Middleware
- **ClerkAuthMiddlewareImp**: Validates JWT tokens, extracts user ID, enforces tenant isolation

#### Error Handling
- **Domain Errors**: Business logic validation errors
- **Service Errors**: Infrastructure-level errors
- **HTTP Status Mapping**: Automatic error-to-status-code conversion

#### CORS Configuration
- **Dynamic origins**: Configurable allowed origins
- **Preflight support**: OPTIONS request handling

## 🌐 API Endpoints

### Configuration Endpoints

#### GET /config
Get the current configuration for the authenticated user's tenant.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "schema": "tenant_schema",
    "aiConfig": { /* AI settings */ },
    "billing": { /* Billing info */ },
    "menuOptions": [ /* Menu options */ ],
    "socialMedia": { /* Social profiles */ }
  }
}
```

#### PUT /config
Update configuration for the authenticated user's tenant.

**Request Body:**
```json
{
  "aiConfig": {
    "model": "gpt-4o-mini",
    "temperature": 0.7,
    "maxTokens": 2000
  },
  "billing": {
    "plan": "premium",
    "status": "active"
  }
}
```

### Document Endpoints

#### POST /documents
Create a new document.

**Request Body:**
```json
{
  "name": "Product Guide",
  "type": "PDF",
  "url": "path/to/document.pdf",
  "isActive": true
}
```

#### GET /documents
List documents with pagination.

**Query Parameters:**
- `offset` (number): Pagination offset
- `limit` (number): Number of results per page

**Response:**
```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "id": "uuid",
        "name": "Product Guide",
        "type": "PDF",
        "url": "path/to/document.pdf",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "offset": 0,
    "limit": 10
  }
}
```

#### PUT /documents/:id
Update an existing document.

#### DELETE /documents/:id
Delete a document.

### Product Endpoints

#### POST /products
Create a new product.

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "stock": 100,
  "categoryId": "uuid",
  "specifications": {
    "color": "red",
    "size": "large"
  },
  "isFeatured": false,
  "isActive": true
}
```

#### GET /products
List products with pagination.

**Query Parameters:**
- `offset` (number): Pagination offset
- `limit` (number): Number of results per page
- `categoryId` (string, optional): Filter by category

#### PUT /products/:id
Update an existing product.

#### DELETE /products/:id
Delete a product.

#### GET /products/categories
List all product categories.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Electronics",
      "description": "Electronic products",
      "parentId": null
    }
  ]
}
```

### File Endpoints

#### POST /files
Upload a file to S3.

**Request Body:**
```json
{
  "base64": "base64-encoded-file-content",
  "fileName": "document.pdf",
  "fileType": "application/pdf",
  "folder": "documents"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "key": "tenant_schema/documents/uuid-document.pdf",
    "url": "https://bucket-name.s3.amazonaws.com/..."
  }
}
```

#### POST /files/presigned-url
Get a presigned URL for file access.

**Request Body:**
```json
{
  "key": "tenant_schema/documents/uuid-document.pdf"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "presignedUrl": "https://bucket-name.s3.amazonaws.com/...?X-Amz-Algorithm=..."
  }
}
```

## 🔐 Security

### Authentication
- **Clerk JWT validation**: All requests must include valid Clerk session tokens
- **Authorized parties validation**: Requests must originate from approved domains

### Authorization
- **Tenant isolation**: Each request is scoped to the authenticated user's tenant schema
- **Schema-based separation**: Database schemas isolate tenant data
- **User ID extraction**: Clerk userId is extracted and used for tenant mapping

### SQS Security
- **Queue access policies**: Restricted to authorized AWS principals
- **Message encryption**: Server-side encryption for messages at rest

### S3 Security
- **Bucket policies**: Restricted public access
- **Presigned URL expiration**: Time-limited access to files
- **IAM role permissions**: Lambda functions have minimal required permissions

## 📊 Database Schema

### Tables

#### config
- `id` (UUID, PK)
- `schema` (VARCHAR) - Tenant identifier
- `ai_config` (JSONB) - AI model settings
- `billing` (JSONB) - Billing information
- `menu_options` (JSONB) - Bot menu structure
- `social_media` (JSONB) - Social profiles
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### documents
- `id` (UUID, PK)
- `schema` (VARCHAR) - Tenant identifier
- `name` (VARCHAR)
- `type` (VARCHAR) - 'URL' or 'PDF'
- `url` (TEXT)
- `is_active` (BOOLEAN)
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
- `price` (DECIMAL)
- `stock` (INTEGER)
- `category_id` (UUID, FK)
- `specifications` (JSONB)
- `image_key` (VARCHAR) - S3 key for product image
- `is_featured` (BOOLEAN)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### product_categories
- `id` (UUID, PK)
- `schema` (VARCHAR) - Tenant identifier
- `name` (VARCHAR)
- `description` (TEXT)
- `parent_id` (UUID, FK, nullable)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### product_embeddings
- `id` (UUID, PK)
- `product_id` (UUID, FK)
- `embedding` (VECTOR) - pgvector type
- `metadata` (JSONB)
- `created_at` (TIMESTAMP)

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

#### 2. Stack Already Exists
**Problem**: FilesBucketStack already exists and deployment fails

**Solution**: 
```bash
# Exclude the existing stack from deployment
pnpm run cdk:deploy:dev -- --exclude FilesBucketStack
```

#### 3. Database Connection Issues
**Problem**: Cannot connect to PostgreSQL

**Solution**: 
- Verify `DATABASE_*` environment variables
- Check security group rules for Lambda
- Ensure database accepts connections from Lambda VPC

#### 4. S3 Upload Fails
**Problem**: File upload returns 403 Forbidden

**Solution**:
- Verify Lambda execution role has S3 permissions
- Check bucket policy allows Lambda to PutObject
- Verify bucket name is correct in environment variables

#### 5. SQS Message Not Sent
**Problem**: Configuration update doesn't trigger notification

**Solution**:
- Verify SQS queue URL is correct
- Check Lambda execution role has SQS SendMessage permission
- Review CloudWatch logs for error messages

## 📈 Monitoring

### CloudWatch Logs
- Lambda execution logs: `/aws/lambda/configuration-function-{env}`
- API Gateway logs: `/aws/apigateway/configuration-api-{env}`

### Metrics to Monitor
- **Lambda duration**: Should be < 10 seconds for most operations
- **API Gateway 4xx/5xx**: Should be < 1%
- **Database connection pool**: Monitor for connection exhaustion
- **S3 upload success rate**: Should be > 99%
- **SQS message delivery**: Should be 100%

### Alarms (Recommended)
- Lambda errors > 10 in 5 minutes
- API Gateway 5xx errors > 5% in 5 minutes
- Database connection failures
- S3 upload failures > 5% in 5 minutes

## 🔄 CI/CD

### GitHub Actions Workflow

The microservice is automatically deployed via GitHub Actions when changes are pushed to the `main` branch in the `configuration/` directory.

**Workflow:** `.github/workflows/deploy_configuration.yml`

**Triggers:**
- Push to `main` branch affecting `configuration/**`
- Manual workflow dispatch

**Steps:**
1. Detect changes in configuration directory
2. Checkout repository
3. Configure Node.js and pnpm
4. Install dependencies
5. Configure AWS credentials
6. Deploy CDK stacks (development or production based on input)
7. Exclude FilesBucketStack from deployment (already exists)

## 📚 AWS Resources Created

### Lambda Functions
- **ConfigurationLambda**: Handles all API requests for configuration, documents, products, and files

### API Gateway
- **ConfigurationAPI**: REST API with CORS support and Clerk authorization

### S3 Buckets
- **FilesBucket**: Stores uploaded files (documents, product images)

### SQS Queues
- **ConfigNotificationsQueue**: Receives configuration change notifications

### IAM Roles
- **ConfigurationLambdaExecutionRole**: Lambda execution role with permissions for:
  - CloudWatch Logs
  - PostgreSQL access (via VPC)
  - S3 read/write
  - SQS SendMessage

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

