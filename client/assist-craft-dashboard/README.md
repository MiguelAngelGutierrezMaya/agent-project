# Assist Craft Dashboard

A modern dashboard for managing enterprise AI assistants, built with React, TypeScript, and a robust modular architecture.

## 📋 Project Description

Assist Craft Dashboard is a comprehensive platform for configuring, training, and managing AI virtual assistants for businesses. It allows users to upload training documents, configure bot menu options, manage contacts, and test the assistant in real-time.

## 🏗️ Project Architecture

### Modular Structure

The project is organized into independent modules, each with its own component structure:

```
src/modules/
├── home/           # Main dashboard with metrics and statistics
├── profile/        # Company profile and settings management
├── training/       # AI training data upload and management
├── assistant/      # Virtual assistant chat interface
├── Config/         # Bot configuration and menu options
└── shared/         # Shared components and layout
```

### Component Pattern

Each module follows a consistent component pattern:

```
src/modules/[module]/presentation/
├── components/
│   ├── [ComponentName]/
│   │   └── index.tsx      # Individual component
│   ├── types.ts           # TypeScript interfaces
│   ├── constants.ts       # Data and configurations
│   └── index.ts          # Centralized exports
└── pages/
    └── [PageName]/
        └── [PageName]Page.tsx
```

## 🚀 Key Features

### 🏠 Dashboard (Home)

- **Real-time metrics**: Training statistics, processed documents, generated embeddings
- **Recent activity**: Action history and file processing
- **Quick actions**: Direct access to main functions
- **System status**: Service and API monitoring

### 👤 Company Profile (Profile)

- **Company information**: Corporate data and contact details
- **Security settings**: Password changes and authentication
- **Account statistics**: Usage metrics and activity
- **Logo management**: Upload and brand customization

### 🎓 Training Management (Training)

- **Document upload**: PDF support and URL extraction
- **Real-time processing**: Progress indicators and status
- **Training history**: Processed file tracking
- **Future features**: CSV, DOCX support and bulk processing

### 🤖 Virtual Assistant (Assistant)

- **Real-time chat**: Conversation interface with the assistant
- **Assistant status**: Model and training information
- **Knowledge base**: Available documents and coverage areas
- **Quick actions**: Predefined questions for ease of use

### ⚙️ Bot Configuration (Config)

- **General configuration**: Bot name and service URLs
- **Contact management**: WhatsApp, Facebook, Instagram
- **Menu options**: Products, web services, human advisor
- **Custom messages**: Welcome and default responses
- **Custom options**: Dynamic menu creation

## 🛠️ Technologies Used

### Frontend

- **React 18.3.1** - User interface library
- **TypeScript 5.5.3** - Static typing for JavaScript
- **Vite 5.4.1** - Build tool and development server
- **React Router DOM 6.26.2** - Client-side routing

### UI/UX

- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI components
- **Radix UI** - Accessible primitive components
- **Lucide React** - Consistent iconography
- **Tailwind Animate** - Animations and transitions

### State and Data

- **React Hook Form 7.56.4** - Form management
- **TanStack React Query 5.56.2** - Server state management
- **Zod 3.23.8** - Schema validation

### Authentication

- **Clerk 5.46.2** - Authentication and user management

### Development Tools

- **ESLint 9.9.0** - JavaScript/TypeScript linter
- **Prettier 3.5.3** - Code formatter
- **TypeScript ESLint** - TypeScript-specific rules

## 📦 Installation and Configuration

### Prerequisites

- **Node.js**: v22.14.0 or higher
- **pnpm**: v10.10.0 or higher (specified in package.json)
- **Git**: For version control
- **Clerk Account**: Sign up at https://clerk.com for authentication
- **Configuration API**: Backend API endpoint deployed and running

### Step-by-Step Installation

#### 1. Navigate to Project Directory

```bash
cd client/assist-craft-dashboard
```

#### 2. Install Dependencies

```bash
pnpm install
```

This will install all required dependencies including:

- React 18.3.1
- TypeScript 5.5.3
- Vite 5.4.1
- Shadcn/ui components
- Clerk authentication

#### 3. Configure Environment Variables

Create a `.env` file in the `client/assist-craft-dashboard/` directory:

```bash
# Clerk Authentication (Required)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx

# Configuration API (Required)
VITE_CONFIG_API_BASE_URL=https://your-config-api.execute-api.us-east-1.amazonaws.com

# Stage/Environment (Required)
VITE_STAGE=development
```

**Where to get these values:**

1. **VITE_CLERK_PUBLISHABLE_KEY**:
   - Go to https://dashboard.clerk.com
   - Select your application
   - Navigate to "API Keys"
   - Copy the "Publishable Key"

2. **VITE_CONFIG_API_BASE_URL**:
   - This is the URL of your deployed configuration microservice
   - After deploying the configuration CDK stack, find it in `configuration/outputs.json`
   - Should look like: `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com`

3. **VITE_STAGE**:
   - Use `development` for local development
   - Use `production` for production builds

#### 4. Start Development Server

```bash
pnpm dev
```

The application will be available at:

- **URL**: http://localhost:5173
- **Hot Reload**: Enabled automatically
- **Network Access**: Available on your local network

#### 5. Verify Installation

Open your browser and navigate to `http://localhost:5173`. You should see:

1. **Login Page**: Clerk authentication screen
2. **Sign in** with your Clerk credentials
3. **Dashboard**: Main dashboard with metrics and navigation

**If you see errors:**

- ✅ Verify all environment variables are set correctly
- ✅ Check that the Configuration API is running and accessible
- ✅ Ensure your Clerk publishable key is valid
- ✅ Check browser console for specific error messages

#### 6. Build for Production

```bash
pnpm build
```

This creates an optimized production build in the `dist/` directory with:

- Minified JavaScript and CSS
- Tree-shaken dependencies
- Optimized assets
- Source maps (optional)

#### 7. Preview Production Build Locally

```bash
pnpm preview
```

This serves the production build locally at `http://localhost:4173` for testing.

#### 8. Deploy to AWS S3 (Optional)

Configure additional environment variables for deployment:

```bash
# AWS Credentials (for deployment only)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
S3_CLIENT_BUCKET_NAME=your-s3-bucket-name
```

Deploy to S3:

```bash
pnpm run deploy-to-s3
```

This script:

1. Builds the production bundle
2. Uploads all files to S3
3. Sets proper Content-Type headers
4. Makes files publicly accessible

### Available Scripts

```bash
# Development
npm run dev              # Development server with hot reload

# Build
npm run build            # Production build
npm run build:dev        # Development build
npm run preview          # Preview the build

# Code quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting

# Deployment
npm run deploy-to-s3     # Deploy to AWS S3
```

## 🔧 Project Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

# API Configuration
VITE_API_BASE_URL=your_api_base_url

# AWS S3 (for deployment)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
S3_BUCKET_NAME=your_s3_bucket_name
```

### TypeScript Configuration

The project uses strict TypeScript configuration with:

- Path mapping for absolute imports (`@/`)
- Separate configuration for app and node
- Strict type rules

### Tailwind Configuration

- Custom configuration in `tailwind.config.ts`
- Support for custom animations
- Shadcn/ui integration

## 🏛️ Component Architecture

### Design Principles

1. **Separation of Concerns**: Each component has a specific function
2. **Composition over Inheritance**: Small components that combine
3. **Props Interface**: Strong typing for all props
4. **Constants Separation**: Data separated from logic
5. **Index Exports**: Centralized exports

### Implemented Patterns

- **Component Composition**: Reusable modular components
- **Custom Hooks**: Extracted reusable logic
- **TypeScript Interfaces**: Clear contracts between components
- **Constants Management**: Centralized configuration

## 📊 Code Metrics

### Complexity Reduction

| Module    | Before    | After   | Reduction |
| --------- | --------- | ------- | --------- |
| Home      | 280       | 24      | 91%       |
| Profile   | 287       | 89      | 69%       |
| Training  | 227       | 111     | 51%       |
| Assistant | 284       | 98      | 65%       |
| Config    | 394       | 26      | 93%       |
| **TOTAL** | **1,472** | **348** | **76%**   |

### Benefits Achieved

- ✅ **76% reduction** in main page code lines
- ✅ **Reusable and testable** components
- ✅ **Clear separation** of responsibilities
- ✅ **Strong typing** with TypeScript
- ✅ **Improved maintainability**

## 🚀 Deployment

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy to S3
npm run deploy-to-s3
```

### Custom Domain

1. Navigate to Project > Settings > Domains
2. Click Connect Domain
3. Follow the [configuration guide](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## 🤝 Contributing

### Commit Structure

```
feat: new functionality
fix: bug fixes
docs: documentation updates
style: formatting changes
refactor: code refactoring
test: add or modify tests
chore: maintenance tasks
```

### Workflow

1. Create feature branch from `main`
2. Implement changes following established patterns
3. Run `npm run lint` and `npm run format`
4. Create Pull Request with detailed description
5. Review and merge to `main`

## 📚 Additional Documentation

- [Component Guide](./docs/components.md)
- [Architecture Patterns](./docs/architecture.md)
- [Contributing Guide](./docs/contributing.md)
- [API Documentation](./docs/api.md)

## 📄 License

This project is under the MIT License. See the [LICENSE](./LICENSE) file for more details.

---

**Developed with ❤️ using React, TypeScript, and modern modular architecture.**

## How can I edit this code?

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
