# Complete AWS Deployment Guide for Family Tree Graph

This comprehensive guide covers deploying the Family Tree Graph monorepo to AWS using **managed services** for optimal ease of use, scalability, and cost-effectiveness.

## 🏗️ Architecture Overview

**Deployment Strategy: Managed Services (Recommended)**

- **Frontend**: AWS Amplify (with built-in CloudFront CDN)
- **Backend**: AWS App Runner (containerized NestJS application)
- **Database**: Supabase (external managed PostgreSQL)
- **Container Registry**: Amazon ECR
- **CI/CD**: Integrated with GitHub for automatic deployments

## 📋 Prerequisites & Setup

### Required Tools & Accounts

Before starting, ensure you have the following installed and configured:

#### 1. AWS Account Setup

- [ ] Active AWS account with billing configured
- [ ] AWS CLI installed (version 2.0 or later)
- [ ] AWS CLI configured with appropriate permissions

#### 2. Development Tools

- [ ] **Node.js**: Version 18.x or later
- [ ] **npm**: Version 9.x or later (comes with Node.js)
- [ ] **Docker**: Version 20.x or later
- [ ] **Git**: For repository management

#### 3. External Services

- [ ] **Supabase Account**: For database management
- [ ] **GitHub Repository**: With your Family Tree Graph code

### Detailed Installation & Configuration

#### AWS CLI Setup

```bash
# Install AWS CLI (macOS)
brew install awscli

# Install AWS CLI (Linux/Windows)
# Download from: https://aws.amazon.com/cli/

# Configure AWS CLI
aws configure
# Enter your:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (e.g., us-east-1)
# - Default output format (json)

# Verify configuration
aws sts get-caller-identity
```

#### Docker Installation

```bash
# macOS (using Homebrew)
brew install --cask docker

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Verify installation
docker --version
docker-compose --version
```

#### Node.js & npm Setup

```bash
# Verify versions
node --version  # Should be 18.x or later
npm --version   # Should be 9.x or later

# Install dependencies in project root
npm install

# Verify turbo is working
npx turbo --version
```

### Environment Variables Setup

Create environment files for different stages:

#### Backend Environment Variables

Create `apps/backend/.env`:

```env
# Database
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application
NODE_ENV=production
PORT=3000

# CORS (will be updated with Amplify URL)
FRONTEND_URL=https://your-amplify-app.amplifyapp.com
```

#### Frontend Environment Variables

Create `apps/frontend/.env.production`:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_API_URL=https://your-app-runner-service.awsapprunner.com
```

---

## 🚀 Part 1: Backend Deployment (AWS App Runner)

AWS App Runner provides a fully managed container service that automatically builds, deploys, and scales your NestJS backend.

### Step 1: Create ECR Repository

Amazon ECR (Elastic Container Registry) will store your Docker images.

```bash
# Set your AWS region
export AWS_REGION=us-east-1

# Create ECR repository
aws ecr create-repository \
    --repository-name family-tree-backend \
    --region $AWS_REGION

# Expected output:
# {
#     "repository": {
#         "repositoryArn": "arn:aws:ecr:us-east-1:123456789012:repository/family-tree-backend",
#         "registryId": "123456789012",
#         "repositoryName": "family-tree-backend",
#         "repositoryUri": "123456789012.dkr.ecr.us-east-1.amazonaws.com/family-tree-backend"
#     }
# }

# Save the repository URI for later use
export ECR_REPOSITORY_URI=$(aws ecr describe-repositories \
    --repository-names family-tree-backend \
    --region $AWS_REGION \
    --query 'repositories[0].repositoryUri' \
    --output text)

echo "ECR Repository URI: $ECR_REPOSITORY_URI"
```

### Step 2: Build and Push Docker Image

```bash
# Get your AWS account ID
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Authenticate Docker to ECR
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build the Docker image (run from project root)
docker build -f apps/backend/Dockerfile -t family-tree-backend .

# Tag the image for ECR
docker tag family-tree-backend:latest $ECR_REPOSITORY_URI:latest

# Push to ECR
docker push $ECR_REPOSITORY_URI:latest

# Verify the image was pushed
aws ecr list-images --repository-name family-tree-backend --region $AWS_REGION
```

### Step 3: Create App Runner Service

#### Option A: Using AWS Console (Recommended for first-time setup)

1. **Navigate to App Runner Console**
   - Go to [AWS App Runner Console](https://console.aws.amazon.com/apprunner/)
   - Click **"Create service"**

2. **Configure Source**
   - **Source**: Container registry
   - **Provider**: Amazon ECR
   - **Container image URI**: Select your `family-tree-backend` repository
   - **Deployment trigger**: Automatic (deploys on new image push)

3. **Configure Service**
   - **Service name**: `family-tree-backend-service`
   - **Virtual CPU**: 1 vCPU
   - **Memory**: 2 GB
   - **Port**: `3000`

4. **Environment Variables**
   Add the following environment variables:

   ```
   SUPABASE_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   NODE_ENV=production
   PORT=3000
   ```

5. **Auto Scaling**
   - **Min instances**: 1
   - **Max instances**: 10
   - **Concurrency**: 100

6. **Health Check**
   - **Path**: `/health` (if you have a health endpoint)
   - **Interval**: 20 seconds
   - **Timeout**: 5 seconds
   - **Healthy threshold**: 2
   - **Unhealthy threshold**: 5

#### Option B: Using AWS CLI

```bash
# Create apprunner.yaml configuration file
cat > apprunner.yaml << EOF
version: 1.0
runtime: docker
build:
  commands:
    build:
      - echo "No build commands needed for pre-built image"
run:
  runtime-version: latest
  command: node dist/main
  network:
    port: 3000
    env:
      - name: NODE_ENV
        value: production
      - name: PORT
        value: "3000"
      - name: SUPABASE_URL
        value: "https://your-project-ref.supabase.co"
      - name: SUPABASE_ANON_KEY
        value: "your-supabase-anon-key-here"
EOF

# Create the App Runner service
aws apprunner create-service \
    --service-name family-tree-backend-service \
    --source-configuration '{
        "ImageRepository": {
            "ImageIdentifier": "'$ECR_REPOSITORY_URI':latest",
            "ImageConfiguration": {
                "Port": "3000"
            },
            "ImageRepositoryType": "ECR"
        },
        "AutoDeploymentsEnabled": true
    }' \
    --instance-configuration '{
        "Cpu": "1 vCPU",
        "Memory": "2 GB"
    }' \
    --region $AWS_REGION
```

### Step 4: Verify Backend Deployment

```bash
# Get service status
aws apprunner describe-service \
    --service-arn $(aws apprunner list-services \
        --query 'ServiceSummaryList[?ServiceName==`family-tree-backend-service`].ServiceArn' \
        --output text) \
    --region $AWS_REGION

# Get the service URL
export BACKEND_URL=$(aws apprunner describe-service \
    --service-arn $(aws apprunner list-services \
        --query 'ServiceSummaryList[?ServiceName==`family-tree-backend-service`].ServiceArn' \
        --output text) \
    --region $AWS_REGION \
    --query 'Service.ServiceUrl' \
    --output text)

echo "Backend URL: https://$BACKEND_URL"

# Test the backend (once deployed)
curl https://$BACKEND_URL/health
```

---

## 🌐 Part 2: Frontend Deployment (AWS Amplify)

AWS Amplify provides a complete hosting solution with built-in CI/CD, CDN, and SSL certificates.

### Step 1: Connect GitHub Repository

#### Using AWS Console (Recommended)

1. **Navigate to Amplify Console**
   - Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
   - Click **"Create new app"**

2. **Connect Repository**
   - Select **"GitHub"**
   - Click **"Continue"**
   - Authorize AWS Amplify to access your GitHub account
   - Select your repository: `family-tree-graph`
   - Select branch: `main`
   - Click **"Next"**

### Step 2: Configure Build Settings

1. **App Settings**
   - **App name**: `family-tree-frontend`
   - **Environment name**: `production`

2. **Build Settings**
   Amplify should auto-detect the monorepo structure. Verify these settings:

   ```yaml
   version: 1
   applications:
     - appRoot: apps/frontend
       frontend:
         phases:
           preBuild:
             commands:
               - npm ci
           build:
             commands:
               - npm run build
         artifacts:
           baseDirectory: dist
           files:
             - "**/*"
         cache:
           paths:
             - node_modules/**/*
   ```

3. **Advanced Settings**
   - **App root**: `apps/frontend`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Node.js version**: `18`

### Step 3: Configure Environment Variables

Add the following environment variables in the Amplify Console:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
VITE_API_URL=https://your-backend-url.awsapprunner.com
```

**Important**: Replace `your-backend-url.awsapprunner.com` with the actual App Runner service URL from Part 1.

### Step 4: Deploy and Verify

1. **Start Deployment**
   - Click **"Save and deploy"**
   - Monitor the build process in the Amplify Console

2. **Build Phases**
   The deployment will go through these phases:
   - **Provision**: Setting up build environment
   - **Build**: Installing dependencies and building the app
   - **Deploy**: Uploading files to CloudFront CDN
   - **Verify**: Running post-deployment checks

3. **Get Frontend URL**
   ```bash
   # Using AWS CLI to get the app URL
   aws amplify get-app \
       --app-id $(aws amplify list-apps \
           --query 'apps[?name==`family-tree-frontend`].appId' \
           --output text) \
       --query 'app.defaultDomain' \
       --output text
   ```

### Step 5: Update Backend CORS Settings

Update your backend environment variables to include the Amplify frontend URL:

```bash
# Update App Runner service with frontend URL
aws apprunner update-service \
    --service-arn $(aws apprunner list-services \
        --query 'ServiceSummaryList[?ServiceName==`family-tree-backend-service`].ServiceArn' \
        --output text) \
    --source-configuration '{
        "ImageRepository": {
            "ImageIdentifier": "'$ECR_REPOSITORY_URI':latest",
            "ImageConfiguration": {
                "Port": "3000",
                "RuntimeEnvironmentVariables": {
                    "NODE_ENV": "production",
                    "PORT": "3000",
                    "SUPABASE_URL": "https://your-project-ref.supabase.co",
                    "SUPABASE_ANON_KEY": "your-supabase-anon-key-here",
                    "FRONTEND_URL": "https://your-amplify-app.amplifyapp.com"
                }
            }
        }
    }' \
    --region $AWS_REGION
```

---

## 🔧 Configuration & Security

### SSL/TLS Certificates

Both Amplify and App Runner provide automatic SSL certificates:

- **Amplify**: Automatically provisions and manages SSL certificates
- **App Runner**: Provides HTTPS endpoints by default

### Custom Domain Setup (Optional)

#### For Amplify Frontend:

1. Go to Amplify Console → Domain management
2. Add your custom domain
3. Follow DNS verification steps
4. SSL certificate will be automatically provisioned

#### For App Runner Backend:

1. Go to App Runner Console → Custom domains
2. Add your API domain (e.g., `api.yourdomain.com`)
3. Update DNS records as instructed
4. Certificate will be automatically managed

### Environment-Specific Configurations

#### Development Environment

```bash
# Create development branch deployment
aws amplify create-branch \
    --app-id your-app-id \
    --branch-name develop \
    --description "Development environment"
```

#### Staging Environment

```bash
# Create staging branch deployment
aws amplify create-branch \
    --app-id your-app-id \
    --branch-name staging \
    --description "Staging environment"
```

---

## 📊 Monitoring & Logging

### CloudWatch Integration

Both services automatically integrate with CloudWatch:

#### App Runner Metrics:

- Request count and latency
- CPU and memory utilization
- Active instances
- HTTP response codes

#### Amplify Metrics:

- Build success/failure rates
- Deployment duration
- Traffic and bandwidth usage

### Setting Up Alerts

```bash
# Create CloudWatch alarm for App Runner high latency
aws cloudwatch put-metric-alarm \
    --alarm-name "AppRunner-HighLatency" \
    --alarm-description "Alert when App Runner latency is high" \
    --metric-name "ResponseTime" \
    --namespace "AWS/AppRunner" \
    --statistic "Average" \
    --period 300 \
    --threshold 1000 \
    --comparison-operator "GreaterThanThreshold" \
    --evaluation-periods 2
```

---

## 💰 Cost Optimization

### App Runner Pricing

- **vCPU**: $0.064 per vCPU per hour
- **Memory**: $0.007 per GB per hour
- **Requests**: $0.40 per million requests

### Amplify Pricing

- **Build minutes**: $0.01 per build minute
- **Storage**: $0.023 per GB per month
- **Data transfer**: $0.15 per GB (first 15 GB free)

### Cost Optimization Tips

1. **Right-size App Runner instances**

   ```bash
   # Monitor CPU/Memory usage and adjust
   # Start with 0.25 vCPU, 0.5 GB for low traffic
   ```

2. **Use Amplify build caching**

   ```yaml
   # In amplify.yml
   cache:
     paths:
       - node_modules/**/*
       - .next/cache/**/*
   ```

3. **Set up auto-scaling limits**
   ```bash
   # Limit max instances to control costs
   # Set based on expected traffic patterns
   ```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

#### Backend Deployment Issues

**Issue**: Docker build fails

```bash
# Solution: Check Dockerfile syntax and dependencies
docker build -f apps/backend/Dockerfile -t test-build .
docker run --rm test-build node --version
```

**Issue**: App Runner service fails to start

```bash
# Check service logs
aws logs describe-log-groups --log-group-name-prefix "/aws/apprunner"
aws logs get-log-events --log-group-name "/aws/apprunner/family-tree-backend-service"
```

**Issue**: Environment variables not loading

- Verify variables are set in App Runner console
- Check for typos in variable names
- Ensure Supabase credentials are correct

#### Frontend Deployment Issues

**Issue**: Amplify build fails

```bash
# Check build logs in Amplify console
# Common fixes:
# 1. Verify Node.js version compatibility
# 2. Check package.json scripts
# 3. Ensure all dependencies are listed
```

**Issue**: Environment variables not working

- Verify variables are set in Amplify console
- Check variable names match your code
- Restart deployment after adding variables

**Issue**: API calls failing (CORS errors)

- Verify VITE_API_URL points to correct App Runner URL
- Check backend CORS configuration
- Ensure both services are in same AWS region

### Health Checks & Debugging

#### Backend Health Check

```bash
# Test backend directly
curl https://your-app-runner-url.awsapprunner.com/health

# Check specific endpoints
curl https://your-app-runner-url.awsapprunner.com/api/family-trees
```

#### Frontend Health Check

```bash
# Test frontend loading
curl -I https://your-amplify-app.amplifyapp.com

# Check console for JavaScript errors
# Open browser dev tools → Console tab
```

### Performance Optimization

#### Backend Optimization

```bash
# Monitor App Runner metrics
aws cloudwatch get-metric-statistics \
    --namespace AWS/AppRunner \
    --metric-name CPUUtilization \
    --start-time 2024-01-01T00:00:00Z \
    --end-time 2024-01-02T00:00:00Z \
    --period 3600 \
    --statistics Average
```

#### Frontend Optimization

- Enable Amplify's built-in compression
- Use Amplify's CDN caching effectively
- Optimize bundle size with code splitting

---

## 🔄 CI/CD Pipeline

### Automatic Deployments

Both services support automatic deployments:

#### Backend (App Runner)

- Automatically deploys when new image is pushed to ECR
- Can be triggered by GitHub Actions or other CI tools

#### Frontend (Amplify)

- Automatically deploys on git push to connected branch
- Supports branch-based deployments for different environments

### GitHub Actions Integration

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1

      - name: Build and push Docker image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: family-tree-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -f apps/backend/Dockerfile -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Amplify
        run: |
          echo "Frontend deployment handled automatically by Amplify"
          echo "Triggered by git push to main branch"
```

---

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] AWS CLI configured and tested
- [ ] Docker installed and running
- [ ] Supabase database set up and accessible
- [ ] Environment variables prepared
- [ ] GitHub repository accessible

### Backend Deployment

- [ ] ECR repository created
- [ ] Docker image built successfully
- [ ] Image pushed to ECR
- [ ] App Runner service created
- [ ] Environment variables configured
- [ ] Service health check passing
- [ ] Backend URL accessible

### Frontend Deployment

- [ ] Amplify app created
- [ ] GitHub repository connected
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Deployment successful
- [ ] Frontend URL accessible
- [ ] API integration working

### Post-Deployment

- [ ] End-to-end functionality tested
- [ ] CORS configuration verified
- [ ] SSL certificates active
- [ ] Monitoring and alerts configured
- [ ] Custom domains configured (if applicable)
- [ ] Performance baseline established

---

## 📞 Support & Resources

### AWS Documentation

- [AWS App Runner User Guide](https://docs.aws.amazon.com/apprunner/)
- [AWS Amplify User Guide](https://docs.aws.amazon.com/amplify/)
- [Amazon ECR User Guide](https://docs.aws.amazon.com/ecr/)

### Troubleshooting Resources

- [App Runner Troubleshooting](https://docs.aws.amazon.com/apprunner/latest/dg/troubleshooting.html)
- [Amplify Troubleshooting](https://docs.aws.amazon.com/amplify/latest/userguide/troubleshooting.html)

### Cost Management

- [AWS Pricing Calculator](https://calculator.aws/)
- [AWS Cost Explorer](https://aws.amazon.com/aws-cost-management/aws-cost-explorer/)

---

## 🎉 Conclusion

You now have a fully deployed Family Tree Graph application on AWS using managed services! This setup provides:

- **Scalability**: Automatic scaling based on demand
- **Reliability**: Managed infrastructure with high availability
- **Security**: Built-in SSL, VPC isolation, and IAM controls
- **Cost-Effectiveness**: Pay-per-use pricing model
- **Maintainability**: Minimal infrastructure management required

Your application is now accessible at:

- **Frontend**: `https://your-amplify-app.amplifyapp.com`
- **Backend API**: `https://your-app-runner-service.awsapprunner.com`

For ongoing maintenance, monitor the CloudWatch dashboards and set up appropriate alerts for your production workload.
