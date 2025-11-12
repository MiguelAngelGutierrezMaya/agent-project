# Agent Project - AI Assistant Platform

## 📋 Overview

The **Agent Project** is a comprehensive AI-powered assistant platform designed for businesses to create, configure, and deploy intelligent virtual assistants via WhatsApp. The platform leverages cutting-edge technologies including **OpenAI GPT-4o Mini**, **Azure OpenAI**, **vector embeddings**, and **multi-tenant architecture** to deliver scalable, secure, and customizable AI solutions.

## 🏗️ Architecture

The project follows a **microservices architecture** with **Hexagonal Architecture (Ports & Adapters)** principles across all services, ensuring:
- **Clean separation of concerns**
- **High testability and maintainability**
- **Technology-agnostic core business logic**
- **Easy scalability and deployment**

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Client Layer                                 │
├─────────────────────────────────────────────────────────────────────┤
│  assist-craft-dashboard (React + TypeScript + Vite)                 │
│  - Training Management    - Product Catalog                         │
│  - Configuration UI       - Document Upload                         │
│  - Assistant Testing      - Real-time Chat                          │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ HTTPS/REST
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Microservices Layer                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐ │
│  │  Configuration   │  │   Embedding      │  │      Chat        │ │
│  │   Service        │  │   Service        │  │    Service       │ │
│  │                  │  │                  │  │                  │ │
│  │  - Config CRUD   │  │  - Vector Gen    │  │  - WhatsApp Bot  │ │
│  │  - Products      │  │  - OpenAI API    │  │  - GPT-4o Mini   │ │
│  │  - Documents     │  │  - Batch Process │  │  - Conversation  │ │
│  │  - Files (S3)    │  │  - Event Driven  │  │  - AI Tools      │ │
│  │                  │  │                  │  │                  │ │
│  │  AWS Lambda      │  │  AWS Lambda      │  │  NestJS Server   │ │
│  │  API Gateway     │  │  EventBridge     │  │  Lightsail VPS   │ │
│  └────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘ │
│           │                     │                      │           │
└───────────┼─────────────────────┼──────────────────────┼───────────┘
            │                     │                      │
            │                     │                      │
            ▼                     ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Data Layer                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐│
│  │      PostgreSQL              │  │        MongoDB               ││
│  │                              │  │                              ││
│  │  - Multi-tenant schemas      │  │  - Conversations             ││
│  │  - Products & Categories     │  │  - Messages                  ││
│  │  - Documents                 │  │  - Client Config Cache       ││
│  │  - Vector Embeddings         │  │                              ││
│  │  - pgvector extension        │  │                              ││
│  └──────────────────────────────┘  └──────────────────────────────┘│
│                                                                       │
│  ┌──────────────────────────────┐  ┌──────────────────────────────┐│
│  │       AWS S3                 │  │       AWS SQS                ││
│  │                              │  │                              ││
│  │  - Product Images            │  │  - Config Notifications      ││
│  │  - Training Documents        │  │  - Event Processing          ││
│  │  - Presigned URLs            │  │                              ││
│  └──────────────────────────────┘  └──────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ External Integrations
                                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     External Services                                │
├─────────────────────────────────────────────────────────────────────┤
│  - Clerk (Authentication)                                            │
│  - OpenAI API (Embeddings)                                           │
│  - Azure OpenAI (GPT-4o Mini)                                        │
│  - WhatsApp Business API                                             │
└─────────────────────────────────────────────────────────────────────┘
```

## 🚀 Services Overview

### 1. Configuration Service
**Location:** `configuration/`  
**Documentation:** [configuration/README.md](configuration/README.md)

**Purpose:** Central configuration hub managing company profiles, products, documents, and file storage.

**Key Features:**
- ✅ Company configuration (AI settings, billing, menu options, social media)
- ✅ Product catalog with categories and specifications
- ✅ Document management for AI training
- ✅ S3-based file storage with presigned URLs
- ✅ SQS-based configuration change notifications
- ✅ Multi-tenant architecture with schema isolation

**Technology Stack:**
- Node.js + TypeScript
- AWS Lambda + API Gateway
- AWS CDK for infrastructure
- PostgreSQL
- AWS S3 + SQS
- Clerk authentication

**Deployment:** Serverless via AWS CDK

---

### 2. Embedding Service
**Location:** `embedding/`  
**Documentation:** [embedding/README.md](embedding/README.md)

**Purpose:** Generates and manages vector embeddings for semantic search capabilities.

**Key Features:**
- ✅ Automatic vector embedding generation for documents and products
- ✅ OpenAI text-embedding-3-small integration
- ✅ Batch and direct processing modes
- ✅ Markdown conversion strategies
- ✅ Event-driven processing via EventBridge
- ✅ pgvector-powered semantic search

**Technology Stack:**
- Node.js + TypeScript
- AWS Lambda + EventBridge
- AWS CDK for infrastructure
- PostgreSQL with pgvector
- OpenAI API
- Clerk authentication

**Deployment:** Serverless via AWS CDK

---

### 3. Chat Service
**Location:** `chat/`  
**Documentation:** [chat/README.md](chat/README.md)

**Purpose:** WhatsApp-based AI assistant with conversational capabilities and intelligent tool usage.

**Key Features:**
- ✅ WhatsApp Business API integration
- ✅ Azure OpenAI GPT-4o Mini for conversations
- ✅ Multi-tool support (product search, company info, featured products, transfer to human)
- ✅ Semantic product search using vector embeddings
- ✅ Conversation history management
- ✅ SQS-based configuration updates
- ✅ Multi-tenant support

**Technology Stack:**
- Node.js + TypeScript + NestJS
- Azure OpenAI GPT-4o Mini
- LangChain for AI orchestration
- PostgreSQL (product data)
- MongoDB (conversations)
- AWS SQS (config notifications)
- WhatsApp Business API

**Deployment:** AWS Lightsail VPS (for persistent SQS consumer)

---

### 4. Client Dashboard
**Location:** `client/assist-craft-dashboard/`  
**Documentation:** [client/assist-craft-dashboard/README.md](client/assist-craft-dashboard/README.md)

**Purpose:** Web-based dashboard for managing and configuring AI assistants.

**Key Features:**
- ✅ Training data management (documents and products)
- ✅ Product catalog with categories
- ✅ Bot configuration (AI settings, menu options, messages)
- ✅ Real-time assistant testing
- ✅ Company profile management
- ✅ File upload with S3 integration
- ✅ Modular architecture (76% code reduction)

**Technology Stack:**
- React 18.3 + TypeScript 5.5
- Vite 5.4
- Tailwind CSS + Shadcn/ui
- TanStack React Query
- Clerk authentication
- React Hook Form + Zod validation

**Deployment:** AWS S3 + AWS Amplify

---

### 5. Database Infrastructure
**Location:** `database/`

#### PostgreSQL (`database/postgresql/`)
**Purpose:** Primary database for structured data with vector search capabilities.

**Features:**
- ✅ Multi-tenant schema separation
- ✅ pgvector extension for embeddings
- ✅ TypeScript-based migrations
- ✅ Products, documents, and configuration tables

#### MongoDB (`database/mongo/`)
**Purpose:** NoSQL database for conversations and real-time data.

**Features:**
- ✅ Conversation history storage
- ✅ Message tracking
- ✅ Client configuration caching
- ✅ TypeScript-based migrations

---

## 📦 Monorepo Structure

```
agent-project/
├── .github/
│   ├── actions/
│   │   ├── configure_pnpm/        # Reusable action for Node.js + pnpm setup
│   │   └── detect_path_changes/   # Reusable action for change detection
│   └── workflows/
│       ├── deploy_configuration.yml
│       ├── deploy_embedding.yml
│       ├── deploy_to_s3.yml
│       └── deploy_to_amplify.yml
├── chat/                           # WhatsApp bot service (NestJS)
├── client/
│   └── assist-craft-dashboard/     # React dashboard
├── configuration/                  # Configuration API (CDK + Lambda)
├── database/
│   ├── mongo/                      # MongoDB migrations
│   └── postgresql/                 # PostgreSQL migrations
├── embedding/                      # Embedding generation API (CDK + Lambda)
├── package.json                    # Root package for workspace scripts
└── README.md                       # This file
```

## 🛠️ Technology Stack Summary

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.5** - Static typing
- **Vite 5.4** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **TanStack React Query** - Server state management

### Backend
- **Node.js 18.x** - Runtime
- **TypeScript 5.9** - Static typing
- **NestJS 10.x** - Backend framework (chat service)
- **AWS Lambda** - Serverless compute
- **AWS CDK 2.214** - Infrastructure as Code

### AI & ML
- **Azure OpenAI GPT-4o Mini** - Conversational AI
- **OpenAI text-embedding-3-small** - Vector embeddings
- **LangChain** - AI orchestration
- **pgvector** - Vector similarity search

### Databases
- **PostgreSQL** - Relational database with pgvector
- **MongoDB** - NoSQL database for conversations

### Cloud & Infrastructure
- **AWS Lambda** - Serverless compute
- **AWS API Gateway** - HTTP endpoints
- **AWS S3** - File storage
- **AWS SQS** - Message queuing
- **AWS EventBridge** - Event routing
- **AWS Lightsail** - VPS for chat service
- **AWS CDK** - Infrastructure provisioning

### Authentication
- **Clerk** - User authentication and management

### DevOps
- **GitHub Actions** - CI/CD automation
- **pnpm 10.15.1** - Package manager
- **Prettier** - Code formatting
- **ESLint** - Code linting

## 📚 Installation

### Prerequisites

- **Node.js**: v22.14.0 or higher
- **pnpm**: v10.15.1 (managed via package.json)
- **AWS CLI**: Configured with appropriate credentials
- **PostgreSQL**: Database with pgvector extension
- **MongoDB**: Database for conversations
- **Clerk Account**: For authentication
- **OpenAI API Key**: For embeddings
- **Azure OpenAI Access**: For GPT-4o Mini
- **WhatsApp Business Account**: For chat integration

### Quick Start

#### 1. Clone and Install Root Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd agent-project

# Install root workspace dependencies
pnpm install
```

#### 2. Install Service Dependencies

Each service needs its dependencies installed independently:

```bash
# Configuration service
cd configuration
pnpm install
cd ..

# Embedding service
cd embedding
pnpm install
cd ..

# Chat service
cd chat
pnpm install
cd ..

# Client dashboard
cd client/assist-craft-dashboard
pnpm install
cd ../..

# Database migrations (PostgreSQL)
cd database/postgresql
pnpm install
cd ../..

# Database migrations (MongoDB)
cd database/mongo
pnpm install
cd ../..
```

#### 3. Configure Environment Variables

Each service requires its own `.env` file. Refer to the individual service documentation:

- **Configuration**: See [configuration/README.md](configuration/README.md#step-2-configure-environment-variables)
- **Embedding**: See [embedding/README.md](embedding/README.md#step-2-configure-environment-variables)
- **Chat**: See [chat/README.md](chat/README.md) (environment variables section)
- **Client Dashboard**: See [client/assist-craft-dashboard/README.md](client/assist-craft-dashboard/README.md#3-configure-environment-variables)

#### 4. Deploy Infrastructure

**Configuration Service:**
```bash
cd configuration
pnpm run cdk:deploy:dev
cd ..
```

**Embedding Service:**
```bash
cd embedding
pnpm run cdk:deploy:dev
cd ..
```

**Chat Service:**
```bash
cd chat
# Deploy to AWS Lightsail (manual setup required)
# See chat/README.md for detailed instructions
```

**Client Dashboard:**
```bash
cd client/assist-craft-dashboard
pnpm run build
pnpm run deploy-to-s3
cd ../..
```

## 📜 Available Root Scripts

The root `package.json` provides workspace-level scripts:

```bash
# Code Formatting
pnpm format              # Format all files with Prettier
pnpm format:check        # Check formatting without modifying files
pnpm format:staged       # Format only staged files (pre-commit)

# Testing (if implemented)
pnpm test                # Run tests across all services
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflows

The project uses GitHub Actions for automated deployment:

#### 1. Configuration Deployment
**Workflow:** `.github/workflows/deploy_configuration.yml`

**Triggers:**
- Push to `main` affecting `configuration/**`
- Manual workflow dispatch

**Actions:**
- Detects changes using `detect_path_changes` action
- Deploys CDK stacks (excludes FilesBucketStack)
- Runs only when configuration files are modified

#### 2. Embedding Deployment
**Workflow:** `.github/workflows/deploy_embedding.yml`

**Triggers:**
- Push to `main` affecting `embedding/**`
- Manual workflow dispatch

**Actions:**
- Detects changes using `detect_path_changes` action
- Deploys CDK stacks
- Runs only when embedding files are modified

#### 3. Client Dashboard Deployment
**Workflow:** `.github/workflows/deploy_to_s3.yml`

**Triggers:**
- Push to `main` affecting `client/assist-craft-dashboard/**`

**Actions:**
- Detects changes using `detect_path_changes` action
- Builds production bundle
- Deploys to S3
- Triggers Amplify deployment

#### 4. Amplify Deployment
**Workflow:** `.github/workflows/deploy_to_amplify.yml`

**Triggers:**
- Successful completion of `deploy_to_s3` workflow

**Actions:**
- Triggers AWS Amplify deployment from S3 bucket

### Reusable Actions

#### configure_pnpm
**Location:** `.github/actions/configure_pnpm/`

**Purpose:** Centralized Node.js and pnpm setup for all workflows.

**Usage:**
```yaml
- uses: ./.github/actions/configure_pnpm
```

#### detect_path_changes
**Location:** `.github/actions/detect_path_changes/`

**Purpose:** Detects which files have changed to conditionally run workflows.

**Usage:**
```yaml
- uses: ./.github/actions/detect_path_changes
  with:
    filters: |
      configuration:
        - 'configuration/**'
```

## 🧪 Testing Strategy

### Unit Tests
- Located in `__test__/` folders next to components
- Tests business logic in isolation
- Uses Jest for all services

### Integration Tests
- Tests API endpoints and service interactions
- Located in `test/` directories

### End-to-End Tests
- Tests complete user flows
- Client dashboard: User interactions and API calls
- Chat service: WhatsApp message flow

## 🔐 Security

### Authentication & Authorization
- **Clerk JWT tokens** for all authenticated requests
- **Multi-tenant isolation** via PostgreSQL schemas
- **API Gateway authorizers** for Lambda functions
- **IAM roles** with least-privilege permissions

### Data Security
- **Encryption at rest** for S3 and databases
- **Encryption in transit** via HTTPS/TLS
- **Presigned URLs** with expiration for file access
- **Environment variables** for sensitive credentials

### Network Security
- **VPC isolation** for Lambda functions accessing databases
- **Security groups** restricting inbound/outbound traffic
- **CORS policies** limiting frontend origins

## 📈 Monitoring & Observability

### CloudWatch Logs
- Lambda function execution logs
- API Gateway access logs
- NestJS application logs

### Metrics
- Lambda duration and errors
- API Gateway 4xx/5xx responses
- Database connection pool usage
- SQS message delivery rates

### Alarms (Recommended)
- Lambda errors > threshold
- API Gateway 5xx > 5%
- Database connection failures
- S3 upload failures

## 🚨 Troubleshooting

### Common Issues

#### 1. Service Dependencies Not Installed
**Problem:** `Cannot find module` errors

**Solution:** Ensure you've run `pnpm install` in each service directory.

#### 2. Environment Variables Missing
**Problem:** Service fails to start or deploy

**Solution:** Check that all required `.env` files are configured per service documentation.

#### 3. AWS Credentials Not Configured
**Problem:** CDK deployment fails

**Solution:**
```bash
aws configure
# Enter your AWS Access Key ID, Secret Access Key, and region
```

#### 4. Database Connection Issues
**Problem:** Services can't connect to PostgreSQL or MongoDB

**Solution:**
- Verify database credentials in `.env` files
- Check network connectivity
- Ensure databases are running

#### 5. GitHub Actions Workflow Not Triggered
**Problem:** Push to `main` doesn't trigger deployment

**Solution:**
- Verify changes are in monitored paths (e.g., `configuration/**`)
- Check workflow file syntax in `.github/workflows/`
- Review GitHub Actions logs for errors

## 📚 Additional Resources

### Service Documentation
- [Configuration Service](configuration/README.md)
- [Embedding Service](embedding/README.md)
- [Chat Service](chat/README.md)
- [Client Dashboard](client/assist-craft-dashboard/README.md)
- [PostgreSQL Migrations](database/postgresql/README.md)
- [MongoDB Migrations](database/mongo/README.md)

### External Documentation
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [LangChain Documentation](https://js.langchain.com/)
- [Clerk Documentation](https://clerk.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [pgvector Documentation](https://github.com/pgvector/pgvector)

## 🤝 Contributing

### Development Workflow

1. **Create a feature branch** from `main`
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following project conventions
   - Use TypeScript strict mode
   - Follow hexagonal architecture patterns
   - Add tests for new functionality
   - Update relevant README files

3. **Format your code**
   ```bash
   pnpm format
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(service): description of changes"
   ```
   Follow [Conventional Commits](https://www.conventionalcommits.org/) format.

5. **Push and create a pull request**
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Quality Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Testing**: Colocated tests in `__test__/` folders
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with consistent configuration
- **Architecture**: Hexagonal architecture (Ports & Adapters)
- **Documentation**: JSDoc comments for public APIs

## 📝 License

ISC License - See LICENSE file for details

---

## 🎯 Project Status

**Current Version:** 1.0.0  
**Status:** Active Development  

### Completed Features
- ✅ Multi-tenant configuration management
- ✅ Product catalog with categories
- ✅ Document management
- ✅ Vector embedding generation
- ✅ WhatsApp chat integration
- ✅ Azure OpenAI GPT-4o Mini integration
- ✅ Semantic product search
- ✅ Client dashboard with modular architecture
- ✅ CI/CD with GitHub Actions
- ✅ Multi-database support (PostgreSQL + MongoDB)

### In Progress
- 🔄 Advanced analytics and reporting
- 🔄 Multi-language support for AI responses
- 🔄 Enhanced conversation handoff workflows

### Planned Features
- 📋 Voice message support
- 📋 Image recognition for product queries
- 📋 Automated testing framework
- 📋 Performance optimization and caching
- 📋 Admin dashboard for system monitoring

---

**For questions, support, or contributions, please contact the development team or open an issue in the repository.**

