#!/bin/bash

# SlayPay Docker Startup Script
# Starts backend and AI agent only (frontends deployed separately)

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🚀 Starting SlayPay Backend + AI Agent                 ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Ensure we're in the right directory
cd /app 2>/dev/null || cd "$(dirname "$0")"

# Create logs directory if it doesn't exist
mkdir -p logs

# Start AI Agent in background
echo "1️⃣  Starting AI Agent (port 3002)..."
cd agent
python3 main.py > ../logs/agent.log 2>&1 &
AGENT_PID=$!
cd ..
echo "   ✓ Agent started (PID: $AGENT_PID)"
echo ""

# Wait for agent to initialize
sleep 3

# Start Backend in foreground (keeps container alive)
echo "2️⃣  Starting Backend Server (port 3001)..."
cd backend

# Set NODE_ENV if not already set
export NODE_ENV=${NODE_ENV:-production}

echo "   Starting Node.js backend..."
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ✅ SlayPay Services Running                            ║"
echo "║                                                           ║"
echo "║   🔌 Backend API:        Port 3001                       ║"
echo "║   🤖 AI Agent API:       Port 3002                       ║"
echo "║                                                           ║"
echo "║   📝 Logs: /app/logs/                                    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Run backend in foreground
# If this exits, the container will stop
node server.js

# If backend crashes, kill agent and exit
echo ""
echo "❌ Backend process exited"
kill $AGENT_PID 2>/dev/null
exit 1
