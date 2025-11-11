# PostgreSQL Migration System

This directory contains the PostgreSQL migration system for the Crealo Digital Workspace backend.

## Structure

```
postgresql/
├── migrations/           # Migration files
│   ├── config/          # Configuration files
│   ├── types/           # TypeScript type definitions
│   └── *.ts            # Migration files
├── scripts/             # Utility scripts
└── package.json         # Dependencies
```

## Environment Variables

Create a `.env` file in this directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=crealo_digital_workspace
DB_USER=your_username
DB_PASSWORD=your_password
DB_SSL=false

# Schema Configuration
# No schema configuration needed - uses companies table automatically

# Connection Pool Configuration
DB_POOL_MIN=2
DB_POOL_MAX=10
DB_POOL_IDLE_TIMEOUT=30000
DB_POOL_CONNECTION_TIMEOUT=2000

# Logging Configuration
LOG_LEVEL=info
LOG_MIGRATIONS=true
```

## Usage

### Install Dependencies

```bash
npm install
```

### Run Migrations

```bash
# Run all pending migrations across all active company schemas
npm run migrate:up
```

### Build

```bash
npm run build
```

## Companies-Based Schema Management

This migration system uses a **companies-based schema discovery** approach:

### **Companies Table**

- The system queries the `companies` table in the `public` schema
- Only processes schemas for companies with `status = 'active'` and `deleted_at IS NULL`
- This allows for dynamic addition/removal of clients without code changes

**Note**: The system requires the `companies` table to be present. If you need to create it, run the migrations first.

## Migration Files

Migration files should be named with the following pattern:
`{version}_{description}.ts`

Example: `001_create_embedding_tables.ts`

## Migration Structure

Each migration file should export a migration object with the following structure:

```typescript
import { PoolClient } from 'pg';
import { Migration } from './types/migration';

export const migration: Migration = {
  version: '001',
  name: 'create_embedding_tables',

  /**
   * Execute migration up
   */
  up: async (client: PoolClient) => {
    // Migration up logic
    // Example:
    // await client.query(\`
    //   CREATE TABLE IF NOT EXISTS example_table (
    //     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    //     name VARCHAR(255) NOT NULL,
    //     created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    //   );
    // \`);
  },
};
```

## Features

- **Companies-Based Schema Discovery**: Automatically discovers active company schemas from database
- **Safe Operations**: Uses `IF NOT EXISTS` and `IF EXISTS` clauses
- **Concurrent Index Creation**: Uses `CONCURRENTLY` for index operations
- **Transaction Safety**: Each migration runs in its own transaction per schema
- **Error Handling**: Comprehensive error handling and logging
- **Schema Validation**: Validates schema existence before operations
- **Row Level Security**: RLS enabled for all embedding tables

## Companies Table Schema

The system uses a `companies` table in the `public` schema:

```sql
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL UNIQUE,
    schema_name VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);
```

## Adding New Companies

To add a new company/client:

1. **Insert into companies table**:

   ```sql
   INSERT INTO companies (company_name, schema_name, status)
   VALUES ('New Company', 'newcompany', 'active');
   ```

2. **Create the schema**:

   ```sql
   CREATE SCHEMA IF NOT EXISTS newcompany;
   ```

3. **Run migrations**:
   ```bash
   npm run migrate:up
   ```

The system will automatically detect the new company and apply all migrations to its schema.

## Migration Order

The system includes the following migrations:

1. **001_create_embedding_tables**: Creates product_embeddings and document_embeddings tables with RLS
2. **002_create_embedding_indexes**: Creates HNSW indexes for vector similarity search

## Tables Created

### product_embeddings

Stores embeddings for product content with the following structure:

- `id`: UUID primary key
- `product_id`: UUID reference to the product
- `content_markdown`: TEXT content in markdown format
- `embedding`: VECTOR(dynamic) for the embedding (dimensions based on client configuration)
- `embedding_model`: VARCHAR(100) model used for embedding
- `embedding_status`: VARCHAR(20) status (pending, processing, completed, failed)
- `metadata`: JSONB for additional data
- `created_at`, `updated_at`: Timestamps

### document_embeddings

Stores embeddings for document content with the same structure as product_embeddings but for documents.

## Dynamic Vector Dimensions

The migration system automatically determines the vector dimensions based on each client's configuration:

1. **Query client configuration**: Looks up `ai_config.embedding_model` in the client's schema
2. **Get model details**: Joins with `public.models_details` to get `vector_number`
3. **Create tables**: Uses the specific vector dimensions for that client
4. **Fallback**: Defaults to 1536 dimensions if no configuration is found

### Example:

- Client A uses `text-embedding-3-large` → Creates `VECTOR(3072)` tables
- Client B uses `text-embedding-ada-002` → Creates `VECTOR(1536)` tables
- Client C has no config → Creates `VECTOR(1536)` tables (default)
