# SlayPay Docker Deployment Guide

This guide covers deploying the SlayPay backend and AI agent as a single Docker container on Render.

## Architecture

**What's in the Docker container:**
- ✅ Backend API (Node.js, port 3001)
- ✅ AI Agent (Python Flask, port 3002)

**What's deployed separately:**
- ❌ Merchant Frontend (Vercel)
- ❌ Ops Dashboard (Vercel)

## Files

- `Dockerfile` - Multi-stage build for Python + Node.js
- `start-docker.sh` - Container entrypoint script
- `.dockerignore` - Excludes unnecessary files from build

## Local Testing

### Build the Docker image:
```bash
docker build -t slaypay-backend .
```

### Run the container:
```bash
docker run -p 3001:3001 -p 3002:3002 slaypay-backend
```

### Test the services:
```bash
# Backend health check
curl http://localhost:3001/health

# Agent health check
curl http://localhost:3002/health

# Agent status
curl http://localhost:3002/status
```

## Render Deployment

### Prerequisites
1. Push code to GitHub repository
2. Create Render account

### Steps

1. **Create New Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure Service**
   - **Name:** `slaypay-backend` (or your choice)
   - **Environment:** Docker
   - **Region:** Choose closest to your users
   - **Branch:** `main` (or your branch)
   - **Root Directory:** Leave empty (uses repo root)

3. **Environment Variables** (if needed)
   - `NODE_ENV=production`
   - Add any custom environment variables

4. **Advanced Settings**
   - **Dockerfile Path:** `Dockerfile`
   - **Docker Command:** (leave empty, uses CMD from Dockerfile)
   - **Health Check Path:** `/health`

5. **Deploy**
   - Click "Create Web Service"
   - Wait for build and deployment

### After Deployment

1. **Get your service URL**
   - Format: `https://slaypay-backend-xxxx.onrender.com`

2. **Update Frontend Environment Variables**
   
   In Vercel (Merchant):
   ```
   VITE_API_BASE_URL=https://slaypay-backend-xxxx.onrender.com
   ```
   
   In Vercel (Ops):
   ```
   VITE_API_BASE_URL=https://slaypay-backend-xxxx.onrender.com
   VITE_AGENT_API_URL=https://slaypay-backend-xxxx.onrender.com
   ```

3. **Redeploy Frontends**
   - Go to Vercel dashboard
   - Redeploy both merchant and ops applications

## Monitoring

### View Logs
In Render dashboard → Your service → Logs tab

### Expected Startup Sequence
```
🚀 Starting SlayPay Backend + AI Agent
1️⃣ Starting AI Agent (port 3002)...
   ✓ Agent started
2️⃣ Starting Backend Server (port 3001)...
   ✅ SlayPay Services Running
```

### Health Checks
```bash
# Backend
curl https://slaypay-backend-xxxx.onrender.com/health

# Agent
curl https://slaypay-backend-xxxx.onrender.com:3002/health
```

## Troubleshooting

### Container won't start
- Check Render logs for build errors
- Verify Dockerfile syntax
- Ensure all dependencies are in requirements.txt and package.json

### Agent not responding
- Check logs: `/app/logs/agent.log`
- Verify Python dependencies installed
- Ensure port 3002 is exposed

### Backend crashes
- Check logs: `/app/logs/backend.log`  
- Verify Node.js version compatibility
- Check for missing environment variables

### Connection refused from frontends
- Verify frontend environment variables point to correct Render URL
- Check CORS settings in backend
- Ensure services are running (check Render status)

## Free Tier Limitations

Render free tier:
- ⚠️ Service spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes 30-60 seconds
- ⚠️ 750 hours/month free compute

To keep service alive:
- Upgrade to paid plan ($7/month)
- Or use external ping service (not recommended for production)

## Production Considerations

For production deployment:
1. ✅ Use paid Render plan for always-on service
2. ✅ Add proper environment variable management
3. ✅ Enable auto-deploy from main branch
4. ✅ Set up monitoring/alerting
5. ✅ Configure proper logging
6. ✅ Add database persistence (if needed)
7. ✅ Enable HTTPS (Render does this automatically)

## Local Development

For local development, continue using the original `start.sh`:
```bash
./start.sh
```

This runs:
- Backend on port 3001
- Agent on port 3002  
- Merchant frontend on port 5173
- Ops frontend on port 5174

## Support

If issues persist:
1. Check Render logs
2. Verify all environment variables
3. Test locally with Docker first
4. Review backend/agent logs in `/app/logs/`
