# CDK Deployment Scripts

Automated scripts for deploying and managing CDK stacks with flexible exclusion support.

## Available Scripts

### List Stacks

View all available stacks for a specific environment:

```bash
pnpm cdk:list:dev
pnpm cdk:list:prod
```

### Deploy Stacks

Deploy all stacks (no confirmation required, suitable for local and CI/CD):

```bash
# Development
pnpm cdk:deploy:dev

# Production
pnpm cdk:deploy:prod
```

#### Deploy with exclusions

```bash
# Development - exclude FilesBucketStack
pnpm cdk:deploy:dev --exclude FilesBucketStack

# Development - exclude multiple stacks (comma-separated, no spaces)
pnpm cdk:deploy:dev --exclude FilesBucketStack,ConfigNotificationsQueueStack

# Production - exclude FilesBucketStack
pnpm cdk:deploy:prod --exclude FilesBucketStack
```

### Destroy Stacks

Destroy all stacks (no confirmation required, use with caution):

```bash
# Development
pnpm cdk:destroy:dev

# Production
pnpm cdk:destroy:prod
```

#### Destroy with exclusions

```bash
# Development - preserve FilesBucketStack
pnpm cdk:destroy:dev --exclude FilesBucketStack

# Development - preserve multiple stacks (comma-separated, no spaces)
pnpm cdk:destroy:dev --exclude FilesBucketStack,ConfigNotificationsQueueStack

# Production - preserve FilesBucketStack
pnpm cdk:destroy:prod --exclude FilesBucketStack
```

## Available Stacks

Stacks are automatically discovered from your CDK app. Common stacks include:

1. **FilesBucketStack** - S3 bucket for file storage
2. **ConfigNotificationsQueueStack** - SQS queue for configuration notifications
3. **ConfigLambdaStack** - Lambda functions for configuration service
4. **ConfigurationApiStack** - API Gateway for REST endpoints

View all available stacks with: `pnpm cdk:list:dev` or `pnpm cdk:list:prod`

## Common Use Cases

### Initial deployment

Deploy everything for the first time:

```bash
pnpm cdk:deploy:dev
```

### Update without touching the bucket

When you want to redeploy but keep the existing S3 bucket:

```bash
pnpm cdk:deploy:dev --exclude FilesBucketStack
```

### Update only Lambda and API

Deploy only the application stacks, preserving infrastructure:

```bash
pnpm cdk:deploy:dev --exclude FilesBucketStack,ConfigNotificationsQueueStack
```

### Clean up development environment but keep the bucket

```bash
pnpm cdk:destroy:dev --exclude FilesBucketStack
```

## Excluding Stacks

To exclude stacks from deployment or destruction, use the `--exclude` flag:

```bash
# Exclude single stack
pnpm cdk:deploy:dev --exclude FilesBucketStack

# Exclude multiple stacks (comma-separated, no spaces)
pnpm cdk:deploy:dev --exclude FilesBucketStack,ConfigNotificationsQueueStack
```

**Note:** You can use either the base stack name (e.g., `FilesBucketStack`) or the full name with environment (e.g., `FilesBucketStack-development`).

## Advanced Options

### Direct Script Usage

For advanced usage, you can call the scripts directly:

```bash
# Deploy with custom options
./scripts/deploy-stacks.sh development --exclude FilesBucketStack --no-synth

# Destroy with exclusions
./scripts/destroy-stacks.sh production --exclude FilesBucketStack
```

### Additional Options

You can combine multiple options:

```bash
# Deploy with exclusions (bootstrap is included by default)
pnpm cdk:deploy:dev --exclude FilesBucketStack

# Use scripts directly for more control
./scripts/deploy-stacks.sh development --exclude FilesBucketStack --no-synth
```

### Available Script Options

**deploy-stacks.sh:**

- `--exclude stack1,stack2` - Exclude specific stacks
- `--bootstrap` - Run CDK bootstrap before deployment
- `--no-synth` - Skip CDK synth step
- `--output filename` - Custom outputs file (default: outputs.json)
- `--require-approval [never|any-change|broadening]` - Set approval requirement (default: never)

**destroy-stacks.sh:**

- `--exclude stack1,stack2` - Exclude specific stacks from destruction
- `--yes` / `-y` / `--force` - Skip confirmation prompt (for CI/CD)

## CI/CD Usage

All commands are designed to work in automated pipelines without any prompts:

```yaml
# GitHub Actions example
- name: Deploy to Development
  run: pnpm cdk:deploy:dev --exclude FilesBucketStack

- name: Deploy to Production
  run: pnpm cdk:deploy:prod --exclude FilesBucketStack

- name: Destroy Development Environment
  run: pnpm cdk:destroy:dev
```

**All commands are CI/CD ready:**

- ✅ No interactive prompts
- ✅ No confirmation required (deploy has `--require-approval never`, destroy has `--yes`)
- ✅ Suitable for both local development and automated pipelines
- ⚠️ Destroy commands have no safety confirmations - use with caution

## Notes

- Stack names are automatically discovered from CDK (no manual maintenance needed)
- Stacks are automatically suffixed with environment (e.g., `FilesBucketStack-development`)
- You can use either the base name or the full name when excluding stacks
- All commands work without prompts for seamless local and CI/CD usage
- Deploy commands use `--require-approval never` (no approval needed)
- Destroy commands use `--yes` flag (no confirmation needed) - use with caution
- Stacks are destroyed in reverse dependency order to avoid conflicts
- If you need manual confirmation for destroy, call the script directly: `./scripts/destroy-stacks.sh development` (without --yes)
