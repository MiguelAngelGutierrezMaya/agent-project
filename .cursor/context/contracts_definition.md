# Crealo Digital RAG System - API Contracts

API for the RAG system. The system is composed of multiple services:

- **Configuration**: API for system configuration, user management, and brand settings
- **Embedding**: API for document/product embedding generation and vector search
- **Chat**: WhatsApp integration with AI-powered conversational capabilities

## Architecture Overview

### Multi-tenant Architecture

The system uses a **multi-tenant architecture** with schema-based isolation:

- **Public Schema (PostgreSQL)**: Global tables shared across all tenants
  - `companies`: Company/brand registry
  - `user_brand_mapping`: Maps users to their brand schemas
  - `modification_requests`: Generic modification tracking for embedding generation
  - `company_modifications`: Company-specific modification links
  - `company_requests`: Batch processing requests for embeddings
  - `models_details`: AI model specifications (vector dimensions, token limits)

- **Tenant Schemas (PostgreSQL)**: Isolated per brand/company
  - Each company has its own PostgreSQL schema (e.g., `crealodigital`)
  - Contains all business data (users, products, documents, etc.)
  - Contains embedding tables (product_embeddings, document_embeddings)

- **MongoDB Databases**: Per-tenant conversation storage
  - **Public Database**: `client_configs` collection for multi-tenant configuration
  - **Tenant Databases**: Each company has its own MongoDB database
    - `conversations`: Conversation threads
    - `messages`: Individual messages within conversations

### Database Entities

#### PostgreSQL - Public Schema

1. Companies
2. User Brand Mapping
3. Modification Requests
4. Company Modifications
5. Company Requests
6. Models Details

#### PostgreSQL - Tenant Schemas (per brand)

1. Users
2. Billing
3. Config
4. Social Config
5. Options Config
6. AI Config
7. Product Categories
8. Products
9. Product Details
10. Documents
11. Product Embeddings
12. Document Embeddings

#### MongoDB - Per Tenant

1. Client Configs (public database)
2. Conversations (tenant database)
3. Messages (tenant database)

## Entity Definitions

### PostgreSQL - Public Schema Entities

#### Companies

```json
{
  "id": "uuid",
  "company_name": "Crealo Digital",
  "schema_name": "crealodigital",
  "status": "active | inactive | suspended",
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### User Brand Mapping

```json
{
  "clerk_user_id": "user_abc123",
  "brand_schema": "crealodigital",
  "status": "active | inactive | suspended",
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### Modification Requests

```json
{
  "id": "uuid",
  "schema_name": "crealodigital",
  "table_name": "products | documents",
  "status": "pending | reviewed",
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### Company Modifications

```json
{
  "id": "uuid",
  "modification_request_id": "uuid",
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### Company Requests

```json
{
  "id": "uuid",
  "modification_request_id": "uuid",
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### Models Details

```json
{
  "id": "uuid",
  "name": "text-embedding-3-small",
  "vector_number": 1536,
  "max_tokens": 8191,
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

### PostgreSQL - Tenant Schema Entities

#### Users

```json
{
  "id": "uuid",
  "clerk_user_id": "user_abc123",
  "name": "John",
  "last_name": "Doe",
  "email": "john.doe@example.com",
  "status": "active | inactive | suspended",
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### Billing

```json
{
  "id": "uuid",
  "amount": 100.50,
  "currency": "USD",
  "status": "pending | paid | failed | refunded | cancelled",
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### Config

```json
{
  "id": "uuid",
  "bot_name": "Bot Assistant",
  "social_config_uuid": "uuid",
  "options_config_uuid": "uuid",
  "ai_config_uuid": "uuid",
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### Social Config

```json
{
  "id": "uuid",
  "whatsapp_number": "+1234567890",
  "whatsapp_access_token": "encrypted_token",
  "whatsapp_business_phone_id": "123456789012345",
  "whatsapp_display_phone": "+1234567890",
  "facebook_endpoint": "https://graph.facebook.com/v21.0",
  "whatsapp_api_version": "v21.0",
  "facebook_page_url": "https://www.facebook.com/crealodigital",
  "instagram_page_url": "https://www.instagram.com/crealodigital",
  "whatsapp_list_description": "Choose an option from the list below",
  "whatsapp_button_options_title": "Ver opciones",
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### Options Config

```json
{
  "id": "uuid",
  "config_data": {
    "show_products": true,
    "visit_website": true,
    "human_support": true
  },
  "company_information": {
    "business_hours": "Mon-Fri 9am-6pm",
    "address": "123 Main St, City, Country",
    "phone": "+1234567890",
    "email": "info@company.com"
  },
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### AI Config

```json
{
  "id": "uuid",
  "chat_model": "azure-openai-gpt-4o-mini",
  "embedding_model": "text-embedding-3-small",
  "temperature": 0.30,
  "max_tokens": 500,
  "batch_embedding": true,
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### Product Categories

```json
{
  "id": "uuid",
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "icon": "🔌",
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### Products

```json
{
  "id": "uuid",
  "category_id": "uuid",
  "name": "Gaming Laptop",
  "type": "product | service",
  "description": "High-performance gaming laptop with RTX 4060",
  "image_url": "https://s3.amazonaws.com/bucket/products/laptop.jpg",
  "is_embedded": true,
  "is_featured": false,
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### Product Details

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "price": 1499.99,
  "currency": "USD",
  "detailed_description": "Comprehensive product specifications and features",
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### Documents

```json
{
  "id": "uuid",
  "name": "Product Manual",
  "type": "pdf | url",
  "url": "https://www.example.com/manual.pdf",
  "is_embedded": true,
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z",
  "deleted_at": null
}
```

#### Product Embeddings

```json
{
  "id": "uuid",
  "product_id": "uuid",
  "content_markdown": "# Gaming Laptop\n\nHigh-performance laptop...",
  "embedding": "[0.123, -0.456, ...]",
  "embedding_model": "text-embedding-3-small",
  "embedding_status": "pending | processing | completed | failed",
  "batch_id": "batch_abc123",
  "metadata": {
    "category": "Electronics",
    "price": 1499.99
  },
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z"
}
```

#### Document Embeddings

```json
{
  "id": "uuid",
  "document_id": "uuid",
  "content_markdown": "# Product Manual\n\nSection 1: Getting Started...",
  "embedding": "[0.789, -0.234, ...]",
  "embedding_model": "text-embedding-3-small",
  "embedding_status": "pending | processing | completed | failed",
  "batch_id": "batch_xyz789",
  "is_chunk": true,
  "metadata": {
    "chunk_index": 0,
    "total_chunks": 5
  },
  "created_at": "2021-01-01T00:00:00Z",
  "updated_at": "2021-01-01T00:00:00Z"
}
```

### MongoDB Entities

#### Client Configs (Public Database)

```json
{
  "_id": "ObjectId",
  "id": "uuid",
  "schema": "crealodigital",
  "botName": "Assistant Bot",
  "socialConfig": {
    "whatsappNumber": "+1234567890",
    "whatsappAccessToken": "encrypted_token",
    "whatsappBusinessPhoneId": "123456789012345",
    "whatsappDisplayPhone": "+1234567890",
    "facebookEndpoint": "https://graph.facebook.com/v21.0",
    "whatsappApiVersion": "v21.0",
    "whatsappListDescription": "Choose an option",
    "whatsappButtonOptionsTitle": "Ver opciones"
  },
  "aiConfig": {
    "chatModel": "azure-openai-gpt-4o-mini",
    "embeddingModel": "text-embedding-3-small",
    "temperature": 0.30,
    "maxTokens": 500,
    "batchEmbedding": true
  },
  "optionsConfig": {
    "showProducts": true,
    "visitWebsite": true,
    "humanSupport": true
  },
  "billing": {
    "status": "active",
    "plan": "premium"
  },
  "createdAt": "2021-01-01T00:00:00Z",
  "updatedAt": "2021-01-01T00:00:00Z"
}
```

#### Conversations (Tenant Database)

```json
{
  "_id": "ObjectId",
  "conversationId": "507f1f77bcf86cd799439011",
  "schema": "crealodigital",
  "clientId": "uuid",
  "user": {
    "phoneNumber": "+1234567890",
    "name": "John Doe"
  },
  "status": "with_bot | with_human | closed | inactive",
  "aiContext": {
    "summary": "User is inquiring about gaming laptops",
    "turns": 5,
    "lastSummaryAt": "2021-01-01T00:00:00Z",
    "messagesSinceLastSummary": 2
  },
  "metadata": {
    "businessPhoneNumberId": "123456789012345"
  },
  "whatsappWindow": {
    "status": "open | closed",
    "expiresAt": "2021-01-02T00:00:00Z",
    "lastUserMessageAt": "2021-01-01T12:00:00Z"
  },
  "createdAt": "2021-01-01T00:00:00Z",
  "lastActivityAt": "2021-01-01T12:30:00Z",
  "closedAt": null
}
```

#### Messages (Tenant Database)

```json
{
  "_id": "ObjectId",
  "messageId": "wamid.HBgMNTczMTEzMjMwMDMz...",
  "whatsappMessageId": "wamid.HBgMNTczMTEzMjMwMDMz...",
  "conversationId": "507f1f77bcf86cd799439011",
  "direction": "inbound | outbound",
  "sender": "user | bot | system",
  "type": "text | image | video | audio | document | interactive | sticker",
  "content": {
    "text": {
      "body": "Hello, I'm looking for a gaming laptop"
    }
  },
  "status": "sending | sent | delivered | read | failed",
  "aiMetadata": {
    "isAiGenerated": true,
    "model": "azure-openai-gpt-4o-mini",
    "tokensUsed": 150,
    "temperature": 0.30,
    "generationTime": 1200
  },
  "error": {
    "code": "429",
    "message": "Rate limit exceeded"
  },
  "timestamp": "2021-01-01T12:00:00Z",
  "readAt": "2021-01-01T12:01:00Z",
  "context": {
    "messageId": "previous_message_id",
    "from": "+1234567890"
  },
  "interactiveDetails": {
    "type": "list_reply | button_reply",
    "selectedOption": {
      "id": "option_1",
      "title": "Gaming Laptops",
      "description": "View gaming laptop options"
    }
  }
}
```

## Key Relationships and Notes

### Multi-tenant Data Flow

1. **User Authentication Flow**:
   - User authenticates with Clerk → Gets `clerk_user_id`
   - System looks up `clerk_user_id` in `public.user_brand_mapping`
   - Retrieves `brand_schema` to access tenant-specific data
   - All subsequent queries use the tenant schema for data isolation

2. **Configuration Sync**:
   - PostgreSQL stores the authoritative configuration (`config`, `social_config`, `options_config`, `ai_config`)
   - MongoDB `client_configs` stores a denormalized copy for fast read access by WhatsApp service
   - Configuration changes in PostgreSQL should trigger updates to MongoDB

3. **Embedding Generation Flow**:
   - Product/Document modified in tenant schema
   - System creates entry in `public.modification_requests`
   - Links to `public.company_modifications` or `public.company_requests`
   - Embedding service processes the request
   - Updates `product_embeddings` or `document_embeddings` in tenant schema
   - Marks modification request as `reviewed`

### Important Constraints

#### PostgreSQL

- **Foreign Key Cascades**:
  - `products.category_id` → `product_categories(id)` ON DELETE RESTRICT (cannot delete category with products)
  - `product_details.product_id` → `products(id)` ON DELETE CASCADE (details deleted with product)
  - Config references use ON DELETE SET NULL (config can exist without references)

- **Soft Deletes**:
  - All tables support soft deletes via `deleted_at` timestamp
  - Queries should filter `WHERE deleted_at IS NULL` for active records
  - Indexes are optimized for non-deleted records

- **Embedding Tables**:
  - `product_embeddings.product_id` must be UNIQUE (one embedding per product)
  - `document_embeddings.document_id` can have multiple entries (chunking support via `is_chunk`)
  - Vector dimensions dynamically determined from `public.models_details` during migration

#### MongoDB

- **Index Strategies**:
  - `conversations.user.phoneNumber` is UNIQUE per tenant database
  - `messages.messageId` is UNIQUE globally
  - `messages.whatsappMessageId` is UNIQUE and SPARSE (only for outbound messages)
  - Compound indexes optimize conversation timeline queries

- **WhatsApp Window Management**:
  - `whatsappWindow.expiresAt` determines when free-form messaging is allowed
  - 24-hour window from last user message
  - System must check window status before sending non-template messages

### Status Enums Reference

#### Conversation Status
- `with_bot`: AI is actively handling the conversation
- `with_human`: Conversation transferred to human agent
- `closed`: Conversation has been closed/resolved
- `inactive`: Conversation inactive (no messages for extended period)

#### Message Status (Outbound only)
- `sending`: Message being sent to WhatsApp API
- `sent`: WhatsApp confirmed receipt
- `delivered`: Message delivered to user's device
- `read`: User opened the message
- `failed`: Message failed to send

#### Embedding Status
- `pending`: Awaiting embedding generation
- `processing`: Currently being embedded
- `completed`: Embedding successfully generated
- `failed`: Embedding generation failed

#### WhatsApp Window Status
- `open`: Within 24-hour window, free-form messages allowed
- `closed`: Outside 24-hour window, only template messages allowed

### Security Considerations

1. **Sensitive Data**:
   - `social_config.whatsapp_access_token` should be encrypted at rest
   - Never expose WhatsApp tokens in logs or API responses
   - Use environment variables for encryption keys

2. **Schema Isolation**:
   - Always validate user's `brand_schema` before querying tenant data
   - Use parameterized queries with schema context to prevent SQL injection
   - Row Level Security (RLS) enabled on embedding tables

3. **Rate Limiting**:
   - WhatsApp API has rate limits (1000 messages/second per phone number)
   - Monitor `aiMetadata.tokensUsed` to control AI costs
   - Implement circuit breakers for failed message attempts

### Performance Optimization

1. **Database Indexes**:
   - All foreign keys have corresponding indexes
   - Compound indexes for common query patterns (e.g., `status + lastActivityAt`)
   - Partial indexes for filtered queries (e.g., `WHERE deleted_at IS NULL`)
   - GIN indexes for JSONB fields in `options_config`

2. **Embedding Vector Search**:
   - Use pgvector's `<->` operator for cosine distance queries
   - Create HNSW or IVFFlat indexes for large embedding tables
   - Consider vector dimensions vs. accuracy trade-offs

3. **MongoDB Queries**:
   - Use projection to limit returned fields
   - Leverage covering indexes for high-frequency queries
   - Implement pagination for message history

### Maintenance Tasks

1. **Regular Cleanup**:
   - Archive old conversations (inactive > 90 days)
   - Prune modification requests marked as `reviewed` (> 30 days)
   - Clean up failed embeddings periodically

2. **Monitoring**:
   - Track embedding generation success rate
   - Monitor WhatsApp window expiration for proactive re-engagement
   - Alert on message delivery failures

3. **Backup Strategy**:
   - PostgreSQL: Daily backups of all schemas (public + tenant schemas)
   - MongoDB: Separate backups for public and tenant databases
   - Test restore procedures regularly
