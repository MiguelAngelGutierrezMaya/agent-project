# MongoDB Migrations

MongoDB migrations for multi-tenant chat application. This project handles database schema migrations and index management for both public and tenant databases.

## Overview

This migration system provides:

- **Multi-tenant support**: Handles both public and tenant database migrations
- **Index management**: Automated index creation and synchronization
- **Collection management**: Creates and manages collections for chat functionality
- **Dry run support**: Test migrations without making changes
- **Comprehensive logging**: Detailed execution logs and error reporting

## Collections

### Public Database (`chat_public`)

- **`client_configs`**: Global client configuration and tenant mapping

### Tenant Databases

- **`config`**: Tenant-specific configuration
- **`conversations`**: Chat conversations between users and bots
- **`messages`**: Individual messages within conversations

## Installation

```bash
# Install dependencies
pnpm install
```

## Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Configure the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
MONGODB_PUBLIC_DATABASE=chat_public
MONGODB_MAX_POOL_SIZE=10
MONGODB_MIN_POOL_SIZE=2
MONGODB_SERVER_SELECTION_TIMEOUT_MS=5000
MONGODB_SOCKET_TIMEOUT_MS=45000

# Migration Configuration
MIGRATION_BATCH_SIZE=100
MIGRATION_DRY_RUN=false
MIGRATION_LOG_LEVEL=info
```

## Usage

### Available Commands

#### Run All Migrations

```bash
# Run all migrations
pnpm run migrate

# Dry run (no changes made)
pnpm run migrate -- --dry-run

# Run only public database migrations
pnpm run migrate -- --public-only

# Run only tenant database migrations
pnpm run migrate -- --tenants-only

# Run migrations for specific collection
pnpm run migrate -- --collection=conversations
```

#### Sync Indexes

```bash
# Sync all indexes
pnpm run sync:indexes

# Dry run
pnpm run sync:indexes -- --dry-run
```

#### List Migrations

```bash
# List all available migrations
pnpm run list
```

#### Check Status

```bash
# Show database status and migration information
pnpm run status
```

### Scripts

- `pnpm run build` - Build the project
- `pnpm run dev` - Run in development mode
- `pnpm run migrate` - Run migrations
- `pnpm run sync:indexes` - Sync indexes
- `pnpm run clean` - Clean build artifacts

## Migration Structure

```
migrations/
├── config/
│   ├── indexes.ts
│   └── 001-create-config-collection.ts
├── conversations/
│   ├── indexes.ts
│   └── 001-create-conversations-collection.ts
├── messages/
│   ├── indexes.ts
│   └── 001-create-messages-collection.ts
└── index.ts
```

Each migration includes:

- **Index definitions**: Optimized for common query patterns
- **Collection creation**: Ensures collections exist with proper structure
- **Up/Down functions**: Forward and rollback migration logic
- **Multi-tenant support**: Handles both public and tenant databases

## Index Strategy

### Config Collection (Public)

- `idx_config_id`: Unique client ID lookup
- `idx_config_schema`: Unique schema mapping
- `idx_whatsapp_display_phone`: WhatsApp webhook routing
- `idx_billing_status_updated`: Billing operations
- `idx_updated_at`: Audit trail
- `idx_created_at`: Analytics

### Config Collection (Tenant)

- `idx_config_id`: Unique client ID lookup
- `idx_config_schema`: Unique schema mapping
- `idx_billing_status_updated`: Billing operations
- `idx_config_updated`: Audit trail
- `idx_config_created`: Analytics

### Conversations Collection (Tenant)

- `idx_conversations_user_phone`: Unique user conversations
- `idx_conversations_status_activity`: Status + activity queries
- `idx_conversations_last_activity`: Recent conversations
- `idx_conversations_window_expiration`: WhatsApp window management
- `idx_conversations_window_status`: Window status filtering
- `idx_conversations_created`: Creation date sorting
- `idx_conversations_status_user`: Status + user queries
- `idx_conversations_closed`: Closed conversations (sparse)

### Messages Collection (Tenant)

- `idx_messages_message_id`: Unique message ID lookup
- `idx_messages_whatsapp_message_id`: WhatsApp message ID lookup (sparse)
- `idx_messages_conversation_timestamp`: Conversation history (ascending)
- `idx_messages_conversation_timestamp_desc`: Conversation history (descending)
- `idx_messages_conversation_direction_timestamp`: Direction filtering
- `idx_messages_conversation_sender_timestamp`: Sender filtering
- `idx_messages_timestamp`: Global message queries
- `idx_messages_status_timestamp`: Status queries (sparse)
- `idx_messages_direction`: Direction filtering
- `idx_messages_sender`: Sender filtering
- `idx_messages_ai_generated`: AI message analysis (sparse)
- `idx_messages_read_at`: Read status tracking (sparse)

## Development

### Adding New Migrations

1. Create a new migration file in the appropriate collection folder
2. Define the migration using the `CollectionMigration` interface
3. Add the migration to the `MIGRATIONS` array in `migrations/index.ts`
4. Test the migration with dry run mode

### Migration Interface

```typescript
interface CollectionMigration {
  collectionName: string;
  name: string;
  description: string;
  version: string;
  isPublic: boolean;
  isTenant: boolean;
  indexes: CollectionIndexSpec[];
  up: (db: Db, collectionName: string) => Promise<void>;
  down: (db: Db, collectionName: string) => Promise<void>;
}
```

## Error Handling

The migration system includes comprehensive error handling:

- **Connection errors**: Automatic retry and connection management
- **Index creation errors**: Detailed error reporting with context
- **Collection errors**: Graceful handling of missing collections
- **Tenant database errors**: Continues processing other tenants if one fails

## Logging

The system provides detailed logging at multiple levels:

- **Migration execution**: Start, progress, and completion
- **Index operations**: Creation, verification, and error reporting
- **Database operations**: Connection, collection, and query logging
- **Error reporting**: Detailed error messages with context

## Performance Considerations

- **Batch processing**: Configurable batch sizes for large operations
- **Connection pooling**: Efficient database connection management
- **Index optimization**: Carefully designed indexes for common query patterns
- **Parallel processing**: Tenant database operations run in parallel where possible

## Troubleshooting

### Common Issues

1. **Connection failures**: Check MongoDB URI and network connectivity
2. **Index creation errors**: Verify index specifications and existing indexes
3. **Tenant database errors**: Ensure tenant databases exist and are accessible
4. **Permission errors**: Verify database user permissions

### Debug Mode

Enable debug logging by setting:

```env
MIGRATION_LOG_LEVEL=debug
```

### Dry Run Mode

Test migrations without making changes:

```bash
npm run migrate -- --dry-run
```

## Contributing

1. Follow the existing code structure and patterns
2. Add comprehensive error handling
3. Include detailed logging
4. Test with both dry run and actual execution
5. Update documentation for new features

## License

UNLICENSED - Crealo Digital
