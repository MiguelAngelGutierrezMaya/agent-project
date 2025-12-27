# Complete Deployment Guide - Chat Service on Elastic Beanstalk

This document describes the complete deployment process for the chat service on AWS Elastic Beanstalk, including initial manual setup and subsequent automatic deployments via CI/CD.

## 📋 Table of Contents

- [Process Overview](#process-overview)
- [Initial Manual Deploy](#initial-manual-deploy)
- [SSL/HTTPS Configuration (One-Time Setup)](#sslhttps-configuration-one-time-setup)
- [Automatic Deploy (CI/CD)](#automatic-deploy-cicd)
- [File Structure](#file-structure)
- [IAM Permissions Configuration](#iam-permissions-configuration)
- [Data Persistence](#data-persistence)
- [Troubleshooting](#troubleshooting)
- [References](#references)

---

## Process Overview

The chat service deployment on Elastic Beanstalk consists of two main phases:

1. **Initial Manual Deploy**: First-time setup including SSL/HTTPS configuration
2. **Automatic Deploy**: All subsequent deployments are performed automatically via GitHub Actions

### General Flow

```
Initial Deploy (Manual)
├── 1. Configure EB environment (AWS Console or EB CLI)
├── 2. Deploy base code
├── 3. Configure DNS (Cloudflare)
├── 4. Obtain SSL certificate (manual, one-time only)
└── 5. Verify HTTPS works

Future Deploys (Automatic)
├── 1. GitHub Actions detects changes in chat/
├── 2. Build project
├── 3. Deploy to EB using EB CLI
├── 4. Automatic SSL restoration (if exists)
└── 5. Deployment verification
```

---

## Initial Manual Deploy

### Prerequisites

- AWS CLI configured with appropriate credentials
- EB CLI installed: `pip install awsebcli`
- Node.js 22.x installed
- Access to Cloudflare DNS

### Step 1: Prepare the Project

```bash
cd chat

# Install dependencies
npm install

# Compile TypeScript
npm run build

# Verify dist/ exists
ls -la dist/
```

### Step 2: Initialize Elastic Beanstalk

```bash
# Initialize EB application (first time only)
eb init -p "64bit Amazon Linux 2023 v6.7.1 running Node.js 22" --region <your-region>

# Create environment (first time only)
eb create <environment-name> \
  --instance-types t3.micro \
  --single \
  --region <your-region>
```

**Note**: If the environment already exists, you can skip this step and proceed with the deploy.

### Step 3: Configure Environment Variables

```bash
# Configure required environment variables
eb setenv \
  PORT=8080 \
  NODE_ENV=development \
  AWS_REGION=<your-region> \
  BUCKET_NAME=<your-bucket-name> \
  FILE_PRESIGNED_EXPIRES_IN=7200 \
  CONFIG_NOTIFICATIONS_QUEUE_URL=<your-sqs-queue-url> \
  MONGODB_URI="mongodb+srv://..." \
  MONGODB_PUBLIC_DATABASE=public \
  MONGODB_MAX_POOL_SIZE=10 \
  MONGODB_MIN_POOL_SIZE=2 \
  MONGODB_SERVER_SELECTION_TIMEOUT=5000 \
  MONGODB_SOCKET_TIMEOUT=45000 \
  WHATSAPP_TOKEN=<your-whatsapp-token> \
  AZURE_OPENAI_API_KEY="<your-azure-openai-key>" \
  AZURE_OPENAI_ENDPOINT="<your-azure-openai-endpoint>" \
  AZURE_OPENAI_DEPLOYMENT_NAME=<your-deployment-name> \
  AZURE_OPENAI_API_VERSION=<api-version> \
  OPENAI_API_KEY="<your-openai-key>" \
  DATABASE_HOST=<your-database-host> \
  DATABASE_PORT=<your-database-port> \
  DATABASE_NAME=<your-database-name> \
  DATABASE_USER=<your-database-user> \
  DATABASE_PASSWORD="<your-database-password>" \
  --environment <environment-name>
```

### Step 4: Initial Deploy

```bash
# From the chat/ directory
make deploy
# or
eb deploy <environment-name>
```

**What happens during this deploy:**

1. **`.ebextensions/01build.config`**: Fixes file permissions
2. **`.ebextensions/02certbot-install.config`**: Automatically installs certbot
3. **`.ebextensions/03security-group-https.config`**: Opens ports 80 and 443 in Security Group
4. **`.platform/nginx/conf.d/https.conf`**: Configures base nginx (HTTP only initially)
5. **`.platform/hooks/postdeploy/01-restore-ssl.sh`**: Executes but doesn't find certificates (they don't exist yet)
6. **Procfile**: Starts the Node.js application

### Step 5: Verify Deploy

```bash
# Get environment URL
eb status

# Verify health check
curl http://<your-env>.elasticbeanstalk.com/health

# View logs
eb logs
```

---

## SSL/HTTPS Configuration (One-Time Setup)

### Step 1: Configure DNS in Cloudflare

1. Get the public IP of the EC2 instance:
   ```bash
   # Option 1: From AWS Console
   # EC2 -> Instances -> Your EB instance -> Public IPv4 address
   
   # Option 2: From SSH
   eb ssh <environment-name>
   curl ifconfig.me
   ```

2. Create **A** record in Cloudflare:
   - **Name**: `<your-domain>.<your-tld>`
   - **Content**: Public IP of your EC2 instance
   - **Proxy**: Disabled (gray) for SSL
   - **TTL**: Auto

3. Wait for DNS propagation (1-5 minutes):
   ```bash
   # Verify propagation
   dig <your-domain>.<your-tld>
   # or
   nslookup <your-domain>.<your-tld>
   ```

### Step 2: Obtain SSL Certificate

Once DNS is configured and propagated:

```bash
# 1. SSH into the instance
eb ssh <environment-name>

# 2. Obtain SSL certificate (MANUAL - ONE TIME ONLY)
sudo certbot --nginx -d <your-domain>.<your-tld>
```

This command:
- ✅ Obtains SSL certificate from Let's Encrypt
- ✅ Modifies `/etc/nginx/conf.d/https.conf` adding:
  - `server` block for HTTPS (port 443)
  - Automatic HTTP → HTTPS redirect
- ✅ Configures auto-renewal (automatic cron job)

### Step 3: Verify SSL Configuration

```bash
# Verify HTTPS works
curl https://<your-domain>.<your-tld>/health

# Verify HTTP → HTTPS redirect
curl -I http://<your-domain>.<your-tld>
# Should show: HTTP/1.1 301 Moved Permanently

# Verify automatic renewal
sudo certbot renew --dry-run
```

---

## Automatic Deploy (CI/CD)

**All subsequent deployments are completely automatic** via GitHub Actions.

### GitHub Actions Configuration

The workflow `.github/workflows/deploy_chat.yml` runs automatically when:

- Push to `main` with changes in `chat/**`
- Manually triggered from GitHub Actions UI

### Automatic Process

1. **Change Detection**: Workflow detects if there are changes in `chat/`
2. **Build**: Compiles TypeScript using `npm run build`
3. **EB CLI Installation**: Installs Elastic Beanstalk CLI
4. **AWS Configuration**: Configures credentials using IAM role
5. **EB CLI Configuration**: Creates minimal configuration for EB CLI
6. **Set Environment Variables**: Updates environment variables in EB (5 minute timeout)
7. **Deploy**: Executes `eb deploy` to deploy code (10 minute timeout)

### Automatic SSL Restoration

During each automatic deploy:

1. **`.ebextensions`**: Executes configurations (certbot, security groups)
2. **`.platform/nginx`**: Copies base configuration (overwrites the one modified by certbot)
3. **`.platform/hooks/postdeploy/01-restore-ssl.sh`**: 
   - Checks if SSL certificates exist (`/etc/letsencrypt/live/<your-domain>.<your-tld>/fullchain.pem`)
   - Checks if nginx already has SSL configured
   - If certificates exist but nginx does NOT have SSL:
     - Executes `certbot install --cert-name <your-domain>.<your-tld> --nginx --redirect`
     - Automatically restores SSL configuration
   - Reloads nginx to apply changes

**Result**: SSL is automatically restored on each deploy without manual intervention.

### Environment Variables in GitHub Secrets

The workflow requires the following variables configured as GitHub Secrets:

```
# AWS Configuration
AWS_REGION
AWS_ROLE_TO_ASSUME
AWS_ROLE_SESSION_NAME

# Elastic Beanstalk
CHAT_EB_ENVIRONMENT_NAME

# Application Configuration
CHAT_PORT
CHAT_NODE_ENV
CHAT_BUCKET_NAME
CHAT_FILE_PRESIGNED_EXPIRES_IN
CHAT_CONFIG_NOTIFICATIONS_QUEUE_URL

# MongoDB Configuration
CHAT_MONGODB_URI
CHAT_MONGODB_PUBLIC_DATABASE
CHAT_MONGODB_MAX_POOL_SIZE
CHAT_MONGODB_MIN_POOL_SIZE
CHAT_MONGODB_SERVER_SELECTION_TIMEOUT
CHAT_MONGODB_SOCKET_TIMEOUT

# WhatsApp Configuration
CHAT_WHATSAPP_TOKEN

# Azure OpenAI Configuration
CHAT_AZURE_OPENAI_API_KEY
CHAT_AZURE_OPENAI_ENDPOINT
CHAT_AZURE_OPENAI_DEPLOYMENT_NAME
CHAT_AZURE_OPENAI_API_VERSION

# OpenAI Configuration
CHAT_OPENAI_API_KEY

# PostgreSQL Configuration
CHAT_DATABASE_HOST
CHAT_DATABASE_PORT
CHAT_DATABASE_NAME
CHAT_DATABASE_USER
CHAT_DATABASE_PASSWORD
```

**Note**: All values should be configured in GitHub Secrets with appropriate values for your environment.

---

## File Structure

The deployment configuration uses the following files:

```
chat/
├── .ebextensions/
│   ├── 01build.config                    # Permisos de archivos
│   ├── 02certbot-install.config          # Instala certbot automáticamente
│   └── 03security-group-https.config     # Abre puertos 80 y 443
│
├── .platform/
│   ├── nginx/
│   │   └── conf.d/
│   │       └── https.conf                # Configuración base de nginx (HTTP inicial)
│   └── hooks/
│       └── postdeploy/
│           └── 01-restore-ssl.sh         # Restaura SSL después de cada deploy
│
├── .elasticbeanstalk/
│   └── config.yml                        # Configuración de EB CLI (generado automáticamente)
│
├── .ebignore                              # Archivos a excluir del deployment ZIP
├── Procfile                               # Comando de inicio de la aplicación
├── Makefile                               # Comandos útiles para desarrollo y deploy
└── package.json                           # Dependencias y scripts
```

### File Description

#### `.ebextensions/01build.config`
- Fixes file permissions for the `webapp` user
- Executes as root before the Procfile runs

#### `.ebextensions/02certbot-install.config`
- Automatically installs `certbot` and `python3-certbot-nginx`
- Idempotent (safe to run multiple times)

#### `.ebextensions/03security-group-https.config`
- Automatically opens ports 80 and 443 in Security Group
- Uses CloudFormation to modify the EB Security Group
- Idempotent (doesn't create duplicates)

#### `.platform/nginx/conf.d/https.conf`
- Base nginx configuration with reverse proxy to port 8080
- Initially HTTP only (port 80)
- Certbot modifies it to add HTTPS (port 443)

#### `.platform/hooks/postdeploy/01-restore-ssl.sh`
- Script that executes after each deploy
- Checks if SSL certificates exist and restores them if needed
- Ensures SSL persists between deploys

#### `.ebignore`
- List of files and directories to exclude from deployment ZIP
- Similar to `.gitignore` but for Elastic Beanstalk
- **Note**: `node_modules/` and `dist/` are included in the ZIP (pre-compiled)

#### `Procfile`
- Defines the application startup command
- Format: `web: npm run start:prod`
- Elastic Beanstalk executes this command as the `webapp` user

---

## IAM Permissions Configuration

The IAM role `<your-github-role-name>` requires specific permissions to perform deploys to Elastic Beanstalk. These permissions are organized in separate statements that **DO NOT affect Lambda deployments with CDK**.

### Permissions Structure

The IAM policy contains the following independent statements:

1. **CDKCloudFormationPermissions**: Permissions for CloudFormation (used by CDK)
2. **CDKS3Permissions**: Permissions for S3 (includes CDK and Elastic Beanstalk buckets)
3. **CDKIAMPermissions**: Permissions for IAM (used by CDK)
4. **CDKLambdaPermissions**: Permissions for Lambda (used by CDK)
5. **ElasticBeanstalkPermissions**: Specific permissions for Elastic Beanstalk
6. **ElasticBeanstalkAutoScalingPermissions**: Permissions for Auto Scaling (used by EB)

### Elastic Beanstalk Permissions

The `ElasticBeanstalkPermissions` statement includes:

```json
{
  "Sid": "ElasticBeanstalkPermissions",
  "Effect": "Allow",
  "Action": [
    "elasticbeanstalk:CreateApplication",
    "elasticbeanstalk:CreateApplicationVersion",
    "elasticbeanstalk:CreateEnvironment",
    "elasticbeanstalk:CreateStorageLocation",
    "elasticbeanstalk:UpdateApplication",
    "elasticbeanstalk:UpdateApplicationVersion",
    "elasticbeanstalk:UpdateEnvironment",
    "elasticbeanstalk:DescribeApplications",
    "elasticbeanstalk:DescribeApplicationVersions",
    "elasticbeanstalk:DescribeEnvironments",
    "elasticbeanstalk:DescribeEnvironmentHealth",
    "elasticbeanstalk:DescribeConfigurationSettings",
    "elasticbeanstalk:DescribeConfigurationOptions",
    "elasticbeanstalk:DescribePlatformVersion",
    "elasticbeanstalk:DescribeEvents",
    "elasticbeanstalk:ListAvailableSolutionStacks",
    "elasticbeanstalk:ListPlatformVersions",
    "elasticbeanstalk:ListPlatformBranches",
    "elasticbeanstalk:ValidateConfigurationSettings",
    "ec2:DescribeImages",
    "ec2:Describe*"
  ],
  "Resource": "*"
}
```

### S3 Permissions for Elastic Beanstalk

The `CDKS3Permissions` statement includes specific permissions for Elastic Beanstalk buckets:

```json
{
  "Sid": "CDKS3Permissions",
  "Effect": "Allow",
  "Action": [
    "s3:ListBucketMultipartUploads",
    "s3:ListMultipartUploadParts",
    "s3:AbortMultipartUpload",
    "s3:CreateBucket",
    "s3:GetObject",
    "s3:PutObject",
    "s3:DeleteObject",
    "s3:ListBucket",
    // ... other S3 permissions
  ],
  "Resource": [
    "arn:aws:s3:::elasticbeanstalk-*",
    "arn:aws:s3:::elasticbeanstalk-*/*",
    // ... other S3 resources
  ]
}
```

### Permissions Separation

✅ **Elastic Beanstalk permissions DO NOT affect Lambda deployments with CDK** because:

1. **Separate permissions**: Each service has its own permission statement
2. **No conflicts**: Elastic Beanstalk actions don't interfere with CDK/Lambda actions
3. **Specific resources**: S3 permissions include both types of buckets (CDK and EB)
4. **Operational independence**: CDK uses CloudFormation directly, EB uses its own API

### Permissions Verification

To verify the current permissions of the role:

```bash
aws iam get-role-policy \
  --role-name <your-github-role-name> \
  --policy-name <your-policy-name> \
  --output json | jq '.PolicyDocument.Statement[] | {Sid: .Sid, Actions: (.Action | length)}'
```

---

## Data Persistence

| Component | Location | Persists in Deploys? | Notes |
|-----------|----------|----------------------|-------|
| **SSL Certificates** | `/etc/letsencrypt/` | ✅ **YES** | Outside `/var/app/current`, persists between deploys |
| **nginx Configuration** | `/etc/nginx/conf.d/https.conf` | ❌ **NO** | Overwritten, but automatically restored |
| **certbot Auto-renewal** | `/etc/cron.d/certbot` | ✅ **YES** | Configured by certbot, persists |
| **Environment Variables** | EB Environment Properties | ✅ **YES** | Configured in EB, persist |

### Why It Works

- SSL certificates are in `/etc/letsencrypt/`, which is **NOT** touched during deploys
- The postdeploy script checks if certificates exist and automatically restores them
- nginx configuration is overwritten but restored using `certbot install`
- Environment variables are configured in EB and persist between deploys

---

## Troubleshooting

### Error: "502 Bad Gateway"

**Cause**: Nginx configured but application is not running on port 8080.

**Solution**:
```bash
eb ssh <environment-name>
sudo systemctl status web.service
sudo journalctl -u web.service -f
```

### Error: "SSL certificate not found"

**Cause**: Certificates don't exist or weren't restored.

**Solution**:
```bash
eb ssh <environment-name>
sudo certbot --nginx -d <your-domain>.<your-tld>
```

### Error: "DNS propagation not complete"

**Cause**: DNS not yet propagated.

**Solution**: Wait a few minutes and verify:
```bash
dig <your-domain>.<your-tld>
```

### Error: "Port 80 or 443 not open"

**Cause**: Security Group doesn't have the ports open.

**Solution**: Verify that `.ebextensions/03security-group-https.config` executed correctly in AWS Console > EC2 > Security Groups.

### Error: "Permission denied" during deploy

**Cause**: Missing permissions in the IAM role.

**Solution**: Verify that the role `<your-github-role-name>` has all necessary permissions (see IAM Permissions section).

### Error: "Timeout waiting for environment update"

**Cause**: The update process takes longer than expected.

**Solution**: 
- The workflow has `continue-on-error: true` in the `eb setenv` step
- The `eb deploy` step has a 10 minute timeout as backup
- EB CLI commands naturally wait until the update completes

### View Postdeploy Logs

The postdeploy script logs appear in Elastic Beanstalk logs:

```bash
eb logs
# or from the instance
sudo tail -f /var/log/eb-hooks.log
```

---

## Execution Order During Deploy

The execution order during a deploy is:

```
1. .ebextensions (container_commands)
   ├── 01build.config → Fixes permissions
   ├── 02certbot-install.config → Installs certbot
   └── 03security-group-https.config → Opens ports (CloudFormation)

2. .platform/nginx → Copies base nginx configuration

3. Application deploys (Procfile executes)

4. .platform/hooks/postdeploy
   └── 01-restore-ssl.sh → Restores SSL if certificates exist
```

---

## Initial Setup Checklist

- [ ] Initial deploy completed
- [ ] DNS configured in Cloudflare (`<your-domain>.<your-tld>` → EC2 IP)
- [ ] Wait for DNS propagation (1-5 minutes)
- [ ] SSH into instance: `eb ssh <environment-name>`
- [ ] Execute: `sudo certbot --nginx -d <your-domain>.<your-tld>`
- [ ] Verify HTTPS: `curl https://<your-domain>.<your-tld>/health`
- [ ] Verify HTTP → HTTPS redirect: `curl -I http://<your-domain>.<your-tld>`

---

## Future Deploys

### For Manual Deploys

```bash
# From the chat/ directory
make deploy
# or
eb deploy <environment-name>
```

**You don't need to do anything else**:
- ✅ Certbot installs automatically
- ✅ Ports open automatically
- ✅ SSL configuration restores automatically
- ✅ Certificates persist (not deleted)
- ✅ Auto-renewal continues working

### For Automatic Deploys (CI/CD)

When using GitHub Actions:

1. The process is exactly the same as manual deploy
2. The postdeploy script executes automatically
3. SSL restores automatically without intervention

### Important Notes

#### If You Change the Domain

1. Update the postdeploy script with the new domain name
2. Obtain a new certificate with certbot:
   ```bash
   sudo certbot --nginx -d <new-domain>.<tld>
   ```

#### If You Need to Reconfigure SSL

```bash
eb ssh <environment-name>
sudo certbot --nginx -d <your-domain>.<your-tld>
```

#### Verify Automatic Renewal

```bash
eb ssh <environment-name>
sudo certbot renew --dry-run
```

---

## References

- [Elastic Beanstalk Platform Hooks](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/platforms-linux-extend.html)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Nginx Plugin](https://certbot.eff.org/instructions?ws=nginx&os=centosrhel7)
- [AWS Elastic Beanstalk CLI](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html)
- [AWS IAM Policies for Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/concepts-roles-user.html)

