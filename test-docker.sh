#!/bin/bash

# Docker Build and Test Script
# Verifies Docker setup works correctly

echo "🐳 SlayPay Docker Verification"
echo "================================"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running"
    echo "   Please start Docker Desktop and try again"
    exit 1
fi
echo "✓ Docker is running"
echo ""

# Build the image
echo "📦 Building Docker image..."
if docker build -t slaypay-backend:test . ; then
    echo "✓ Docker image built successfully"
else
    echo "❌ Docker build failed"
    exit 1
fi
echo ""

# Run the container
echo "🚀 Starting container..."
CONTAINER_ID=$(docker run -d -p 3001:3001 -p 3002:3002 slaypay-backend:test)

if [ -z "$CONTAINER_ID" ]; then
    echo "❌ Failed to start container"
    exit 1
fi

echo "✓ Container started: $CONTAINER_ID"
echo ""

# Wait for services to start
echo "⏳ Waiting for services to initialize (15 seconds)..."
sleep 15
echo ""

# Test services
echo "🔍 Testing services..."
echo ""

# Test backend
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "✓ Backend API responding on port 3001"
else
    echo "❌ Backend API not responding"
fi

# Test agent
if curl -s http://localhost:3002/health > /dev/null 2>&1; then
    echo "✓ AI Agent responding on port 3002"
else
    echo "❌ AI Agent not responding"
fi

echo ""
echo "📋 Container logs (last 20 lines):"
echo "--------------------------------"
docker logs --tail 20 $CONTAINER_ID
echo ""

# Cleanup
echo "🧹 Cleanup"
echo "To stop the container, run:"
echo "  docker stop $CONTAINER_ID"
echo ""
echo "To remove the container, run:"
echo "  docker rm $CONTAINER_ID"
echo ""
echo "To view logs, run:"
echo "  docker logs -f $CONTAINER_ID"
echo ""

# Ask user if they want to stop now
read -p "Stop and remove container now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker stop $CONTAINER_ID
    docker rm $CONTAINER_ID
    echo "✓ Container stopped and removed"
else
    echo "Container still running at http://localhost:3001"
fi
