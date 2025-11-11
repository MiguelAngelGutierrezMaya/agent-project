# Environment Variables

This document describes all environment variables used by the MongoDB migration system.

## Required Variables

### `MONGODB_URI`

- **Description**: MongoDB connection URI
- **Default**: `mongodb://localhost:27017`
- **Example**: `mongodb://username:password@localhost:27017/database`

### `MONGODB_PUBLIC_DATABASE`

- **Description**: Name of the public database
- **Default**: `public`
- **Example**: `chat_public`

## Optional Variables

### `IGNORE_DATABASES`

- **Description**: Comma-separated list of databases to ignore when listing tenants
- **Default**: `admin,config,local,sample_mflix`
- **Example**: `admin,config,local,sample_mflix,test-database,temp-data`
- **Note**: These databases will not be considered as tenant databases during migrations

### `MONGODB_MAX_POOL_SIZE`

- **Description**: Maximum number of connections in the connection pool
- **Default**: `10`
- **Example**: `20`

### `MONGODB_MIN_POOL_SIZE`

- **Description**: Minimum number of connections in the connection pool
- **Default**: `2`
- **Example**: `5`

### `MONGODB_SERVER_SELECTION_TIMEOUT_MS`

- **Description**: Server selection timeout in milliseconds
- **Default**: `5000`
- **Example**: `10000`

### `MONGODB_SOCKET_TIMEOUT_MS`

- **Description**: Socket timeout in milliseconds
- **Default**: `45000`
- **Example**: `60000`

### `MIGRATION_BATCH_SIZE`

- **Description**: Number of documents to process in each batch
- **Default**: `100`
- **Example**: `500`

### `MIGRATION_DRY_RUN`

- **Description**: Enable dry run mode (no actual changes)
- **Default**: `false`
- **Example**: `true`

### `MIGRATION_LOG_LEVEL`

- **Description**: Log level for migration operations
- **Default**: `info`
- **Options**: `debug`, `info`, `warn`, `error`
- **Example**: `debug`

## Example Configuration

```bash
# .env file
MONGODB_URI=mongodb://username:password@localhost:27017
MONGODB_PUBLIC_DATABASE=chat_public
IGNORE_DATABASES=admin,config,local,sample_mflix,test-database,temp-data
MONGODB_MAX_POOL_SIZE=20
MONGODB_MIN_POOL_SIZE=5
MIGRATION_LOG_LEVEL=debug
```

## Tenant Database Detection

The system automatically detects tenant databases by:

1. Listing all databases in MongoDB
2. Excluding databases listed in `IGNORE_DATABASES`
3. Excluding the public database (`MONGODB_PUBLIC_DATABASE`)
4. Treating all remaining databases as tenant databases

This approach allows you to:

- Control which databases are considered tenants
- Exclude test databases, temporary databases, or system databases
- Add new tenants without modifying code
