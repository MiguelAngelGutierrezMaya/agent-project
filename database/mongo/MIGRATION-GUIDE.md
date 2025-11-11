# MongoDB Migration Guide

This guide explains how to use the new MongoDB migration system that has been separated from the chat project.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd database/mongo
pnpm install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your MongoDB configurations
```

### 3. Run Migrations

```bash
# Run all migrations
pnpm run migrate

# Only public database migrations
pnpm run migrate -- --public-only

# Only tenant database migrations
pnpm run migrate -- --tenants-only

# Specific collection migration
pnpm run migrate -- --collection=conversations
```

## 📋 Available Commands

### Migrations

```bash
# Run all migrations
pnpm run migrate

# Dry-run mode (no real changes)
pnpm run migrate -- --dry-run

# Only public database
pnpm run migrate -- --public-only

# Only tenant databases
pnpm run migrate -- --tenants-only

# Specific collection
pnpm run migrate -- --collection=config
pnpm run migrate -- --collection=conversations
pnpm run migrate -- --collection=messages
```

### Index Synchronization

```bash
# Synchronize all indexes
pnpm run sync:indexes

# Dry-run mode
pnpm run sync:indexes -- --dry-run
```

### Utilities

```bash
# List all available migrations
pnpm run list

# View database status
pnpm run status
```

## 🏗️ Project Structure

```
database/mongo/
├── src/                          # Source code
│   ├── types/                    # Type definitions
│   ├── utils/                    # Utilities
│   │   ├── database-connection.ts
│   │   └── index-manager.ts
│   ├── migration-service.ts      # Main service
│   └── index.ts                  # Entry point
├── migrations/                   # Migration definitions
│   ├── config/                   # Configuration migrations
│   │   ├── indexes.ts
│   │   └── 001-create-config-collection.ts
│   ├── conversations/            # Conversation migrations
│   │   ├── indexes.ts
│   │   └── 001-create-conversations-collection.ts
│   ├── messages/                 # Message migrations
│   │   ├── indexes.ts
│   │   └── 001-create-messages-collection.ts
│   └── index.ts                  # Migration registry
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🗄️ Collections and Databases

### Public Database (`chat_public`)

- **`client_configs`**: Global client configuration and tenant mapping

### Tenant Databases

- **`config`**: Tenant-specific configuration
- **`conversations`**: Chat conversations between users and bots
- **`messages`**: Individual messages within conversations

## 🔧 Configuration

### Environment Variables

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

## 📊 Index Strategy

### Config Collection (Public)

- `idx_config_id`: Unique search by client ID
- `idx_config_schema`: Unique schema mapping
- `idx_whatsapp_display_phone`: WhatsApp webhook routing
- `idx_billing_status_updated`: Billing operations
- `idx_updated_at`: Audit trail
- `idx_created_at`: Analytics

### Config Collection (Tenant)

- `idx_config_id`: Unique search by client ID
- `idx_config_schema`: Unique schema mapping
- `idx_billing_status_updated`: Billing operations
- `idx_config_updated`: Audit trail
- `idx_config_created`: Analytics

### Conversations Collection (Tenant)

- `idx_conversations_user_phone`: Unique conversations per user
- `idx_conversations_status_activity`: Status + activity queries
- `idx_conversations_last_activity`: Recent conversations
- `idx_conversations_window_expiration`: WhatsApp window management
- `idx_conversations_window_status`: Window status filtering
- `idx_conversations_created`: Creation date sorting
- `idx_conversations_status_user`: Status + user queries
- `idx_conversations_closed`: Closed conversations (sparse)

### Messages Collection (Tenant)

- `idx_messages_message_id`: Unique search by message ID
- `idx_messages_whatsapp_message_id`: WhatsApp message ID search (sparse)
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

## 🚨 Migration from Chat Project

### Changes Made

1. **Separation of concerns**: Migrations are now in an independent project
2. **Command removal**: Removed `sync:indexes` from chat package.json
3. **New system**: More robust migrations with multi-tenant support
4. **Better logging**: Improved logging system with more details

### Previous vs New Commands

| Previous Command                  | New Command                            |
| --------------------------------- | -------------------------------------- |
| `pnpm run sync:indexes` (in chat) | `pnpm run migrate` (in mongo)          |
| N/A                               | `pnpm run sync:indexes` (indexes only) |
| N/A                               | `pnpm run list` (list migrations)      |
| N/A                               | `pnpm run status` (database status)    |

## 🔍 Dry Run Mode

Always test migrations in dry-run mode first:

```bash
# See what would be executed without making changes
pnpm run migrate -- --dry-run

# See what indexes would be synchronized
pnpm run sync:indexes -- --dry-run
```

## 🐛 Troubleshooting

### Common Errors

1. **Connection error**: Verify MongoDB URI and connectivity
2. **Permission error**: Verify database user permissions
3. **Index error**: Verify existing index specifications
4. **Tenant error**: Ensure tenant databases exist

### Debug Logs

```bash
# Enable detailed logs
MIGRATION_LOG_LEVEL=debug pnpm run migrate
```

### Check Status

```bash
# View current database status
pnpm run status
```

## 📝 Adding New Migrations

1. Create migration file in the appropriate folder
2. Define the migration using the `CollectionMigration` interface
3. Add the migration to the `MIGRATIONS` array in `migrations/index.ts`
4. Test with dry-run mode

### New Migration Example

```typescript
export const myNewMigration: CollectionMigration = {
  collectionName: 'my_collection',
  name: 'create-my-collection',
  description: 'Create my new collection',
  version: '002',
  isPublic: false,
  isTenant: true,
  indexes: [
    {
      key: { field: 1 },
      options: { name: 'idx_my_field' },
    },
  ],
  async up(db: Db, collectionName: string): Promise<void> {
    // Migration logic
  },
  async down(db: Db, collectionName: string): Promise<void> {
    // Rollback logic
  },
};
```

## 🎯 Best Practices

1. **Always use dry-run**: Test before executing
2. **Data backup**: Backup before important migrations
3. **Indexes first**: Create indexes before migrating data
4. **Detailed logs**: Use appropriate log level for debugging
5. **Rollback plan**: Have rollback plan for critical migrations

## 📞 Support

For problems or questions about migrations:

1. Review detailed error logs
2. Verify environment variable configuration
3. Test with dry-run mode
4. Consult MongoDB documentation for specific errors
