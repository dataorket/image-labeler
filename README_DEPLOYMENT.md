# Image Labeler - Deployment Guide

This document provides instructions for deploying the Image Labeler application to production.

## Architecture

- **Frontend**: React + TypeScript + Vite → Deployed on Vercel
- **Backend**: Node.js + Express + TypeScript → Deployed on Google Cloud Run
- **AI Service**: Google Cloud Vision API

## Prerequisites

1. **Google Cloud Account**
   - Active Google Cloud project
   - Billing enabled
   - Cloud Vision API enabled
   - Service account with Vision API permissions

2. **GitHub Account**
   - Repository created (e.g., `dataorket/image-labeler`)

3. **Vercel Account**
   - Connected to your GitHub account

4. **Local Tools**
   - Node.js 20+
   - npm
   - gcloud CLI installed and configured
   - Git

## Backend Deployment (Google Cloud Run)

### 1. Setup Google Cloud Project

```bash
# Set your project ID
gcloud config set project YOUR_PROJECT_ID

# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable vision.googleapis.com
```

### 2. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create image-labeler-sa \
    --display-name="Image Labeler Service Account"

# Grant Vision API permissions
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:image-labeler-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/cloudvision.admin"

# Create and download key (for local development only)
gcloud iam service-accounts keys create credentials.json \
    --iam-account=image-labeler-sa@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

**Important**: Add `*.json` to `.gitignore` to prevent committing credentials!

### 3. Deploy Backend to Cloud Run

```bash
cd backend

# Build and deploy
gcloud run deploy image-labeler-backend \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --platform managed \
  --memory 512Mi \
  --timeout 300s
```

After deployment, you'll receive a service URL like:
```
https://image-labeler-backend-XXXXXXXXX.us-central1.run.app
```

### 4. Configure Environment Variables (Optional)

If you need to set environment variables:

```bash
gcloud run services update image-labeler-backend \
  --region us-central1 \
  --set-env-vars="NODE_ENV=production"
```

## Frontend Deployment (Vercel)

### 1. Update API URL

In `frontend/src/App.tsx` and `frontend/src/ImageCard.tsx`, update the `API_URL`:

```typescript
const API_URL = "https://image-labeler-backend-XXXXXXXXX.us-central1.run.app";
```

### 2. Push to GitHub

```bash
# Add remote if not already done
git remote add origin https://github.com/YOUR_USERNAME/image-labeler.git

# Push code
git add .
git commit -m "Update backend URL for production"
git push origin main
```

### 3. Deploy to Vercel

#### Option A: Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

#### Option B: Vercel CLI

```bash
cd frontend

# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### 4. Configure Custom Domain (Optional)

In Vercel dashboard:
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Post-Deployment Verification

### Test Backend

```bash
# Health check
curl https://YOUR_BACKEND_URL.run.app/api

# Upload test image
curl -X POST https://YOUR_BACKEND_URL.run.app/api \
  -F "images=@test-image.jpg"
```

### Test Frontend

1. Visit your Vercel URL
2. Upload an image
3. Verify labels are detected
4. Check History tab shows uploaded images
5. Click on history images to view analysis results

## Environment Variables

### Backend (Cloud Run)

The backend uses Application Default Credentials (ADC) in production, so no environment variables are needed for Google Cloud authentication.

Optional variables:
- `PORT` - Automatically set by Cloud Run (default: 8080)
- `NODE_ENV` - Set to `production`

### Frontend (Vercel)

No environment variables required - API URL is hardcoded in the source.

## Monitoring & Logs

### Backend Logs (Cloud Run)

```bash
# View logs
gcloud run services logs read image-labeler-backend \
  --region us-central1 \
  --limit 50

# Stream logs
gcloud run services logs tail image-labeler-backend \
  --region us-central1
```

### Cloud Run Metrics

View in Google Cloud Console:
- Cloud Run → image-labeler-backend → Metrics
- Monitor: Requests, Latency, Error rate, Container instances

### Vercel Logs

View in Vercel Dashboard:
- Project → Deployments → Click deployment → Runtime Logs

## Scaling Configuration

### Backend (Cloud Run)

```bash
# Update scaling settings
gcloud run services update image-labeler-backend \
  --region us-central1 \
  --min-instances 0 \
  --max-instances 10 \
  --concurrency 80
```

### Frontend (Vercel)

Vercel automatically scales based on traffic. No configuration needed.

## Costs Estimation

### Google Cloud Run
- **Free tier**: 2 million requests/month
- **Compute**: ~$0.00002400 per vCPU-second
- **Memory**: ~$0.00000250 per GiB-second
- **Typical cost**: $0-5/month for low traffic

### Google Cloud Vision API
- **Free tier**: 1,000 units/month
- **After free tier**: $1.50 per 1,000 units
- **Typical cost**: $0-10/month for low traffic

### Vercel
- **Hobby Plan**: Free for personal projects
- **Pro Plan**: $20/month (if needed)

## Troubleshooting

### Backend won't deploy

```bash
# Check Docker build locally
cd backend
npm run build
docker build -t test-image .

# View detailed logs
gcloud builds log $(gcloud builds list --limit=1 --format="value(id)")
```

### Images not loading

1. Verify backend URL in frontend code
2. Check CORS settings in `backend/src/server.ts`
3. Verify images are being stored in `backend/storage/`
4. Check Cloud Run logs for errors

### Vision API errors

1. Verify API is enabled: `gcloud services list | grep vision`
2. Check service account permissions
3. Verify credentials are not in `.gitignore`

## CI/CD Setup (Optional)

### GitHub Actions for Backend

Create `.github/workflows/deploy-backend.yml`:

```yaml
name: Deploy Backend to Cloud Run

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: google-github-actions/setup-gcloud@v1
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ secrets.GCP_PROJECT_ID }}
      
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy image-labeler-backend \
            --source ./backend \
            --region us-central1 \
            --allow-unauthenticated
```

### Vercel (Auto-deploys from GitHub)

Vercel automatically deploys on every push to `main` branch. No additional configuration needed.

## Security Best Practices

1. **Never commit credentials** - Use `.gitignore` for `*.json` files
2. **Use environment variables** for sensitive data
3. **Enable authentication** if storing user data
4. **Regular updates** - Keep dependencies updated
5. **Monitor logs** for suspicious activity
6. **CORS configuration** - Restrict to your domain in production

## Rollback

### Backend

```bash
# List revisions
gcloud run revisions list --service image-labeler-backend --region us-central1

# Rollback to previous revision
gcloud run services update-traffic image-labeler-backend \
  --region us-central1 \
  --to-revisions REVISION_NAME=100
```

### Frontend

In Vercel Dashboard:
1. Go to Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

## Support

For issues:
1. Check logs (Cloud Run and Vercel)
2. Verify all environment variables
3. Test API endpoints manually
4. Review recent code changes

## Useful Commands

```bash
# Backend - Rebuild and redeploy
cd backend && gcloud run deploy image-labeler-backend --source . --region us-central1

# Frontend - Redeploy
cd frontend && vercel --prod

# View all Cloud Run services
gcloud run services list

# Delete Cloud Run service
gcloud run services delete image-labeler-backend --region us-central1

# Check Git remote
git remote -v
```

## Live Deployment

**Backend URL**: https://image-labeler-backend-325931483644.us-central1.run.app  
**Frontend URL**: https://image-labeler-theta.vercel.app  
**GitHub Repository**: https://github.com/dataorket/image-labeler
