#!/bin/bash

# SlayPay System Startup Script
# Starts backend, agent, and both frontends

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   🚀 Starting SlayPay Complete System                    ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "agent" ] || [ ! -d "merchant" ] || [ ! -d "ops" ]; then
    echo "❌ Error: Must run from CyberCipher root directory"
    exit 1
fi

# Function to check if port is in use
check_port() {
    lsof -ti:$1 > /dev/null 2>&1
}

# Kill existing processes on our ports
echo "🧹 Cleaning up existing processes..."
for port in 3001 3002 5173 5174; do
    if check_port $port; then
        echo "   Killing process on port $port"
        lsof -ti:$port | xargs kill -9 2>/dev/null
    fi
done
echo ""

# Start Backend
echo "1️⃣  Starting Backend Server (port 3001)..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "   Installing backend dependencies..."
    npm install
fi
npm start > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..
echo "   ✓ Backend started (PID: $BACKEND_PID)"
echo ""

# Wait for backend to be ready
sleep 2

# Start Agent
echo "2️⃣  Starting AI Agent (port 3002)..."
cd agent
if [ ! -d "venv" ]; then
    echo "   Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "   Installing agent dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi
python agent.py > ../logs/agent.log 2>&1 &
AGENT_PID=$!
cd ..
echo "   ✓ Agent started (PID: $AGENT_PID)"
echo ""

# Wait for agent to be ready
sleep 2

# Start Merchant Frontend
echo "3️⃣  Starting Merchant Frontend (port 5173)..."
cd merchant
if [ ! -d "node_modules" ]; then
    echo "   Installing merchant dependencies..."
    npm install
fi
npm run dev > ../logs/merchant.log 2>&1 &
MERCHANT_PID=$!
cd ..
echo "   ✓ Merchant frontend started (PID: $MERCHANT_PID)"
echo ""

# Start Ops Frontend
echo "4️⃣  Starting Ops Dashboard (port 5174)..."
cd ops
if [ ! -d "node_modules" ]; then
    echo "   Installing ops dependencies..."
    npm install
fi
npm run dev -- --port 5174 > ../logs/ops.log 2>&1 &
OPS_PID=$!
cd ..
echo "   ✓ Ops dashboard started (PID: $OPS_PID)"
echo ""

# Wait for services to initialize
echo "⏳ Waiting for services to initialize..."
sleep 5

# Test services
echo ""
echo "🔍 Testing services..."

if curl -s http://localhost:3001/health > /dev/null; then
    echo "   ✓ Backend healthy"
else
    echo "   ❌ Backend not responding"
fi

if curl -s http://localhost:3002/health > /dev/null; then
    echo "   ✓ Agent healthy"
else
    echo "   ❌ Agent not responding"
fi

if curl -s http://localhost:5173 > /dev/null; then
    echo "   ✓ Merchant frontend healthy"
else
    echo "   ❌ Merchant frontend not responding"
fi

if curl -s http://localhost:5174 > /dev/null; then
    echo "   ✓ Ops dashboard healthy"
else
    echo "   ❌ Ops dashboard not responding"
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║   ✅ SlayPay System Running                              ║"
echo "║                                                           ║"
echo "║   🏪 Merchant Portal:    http://localhost:5173           ║"
echo "║   📊 Ops Dashboard:      http://localhost:5174           ║"
echo "║   🔌 Backend API:        http://localhost:3001           ║"
echo "║   🤖 AI Agent API:       http://localhost:3002           ║"
echo "║                                                           ║"
echo "║   📝 Logs available in ./logs/                           ║"
echo "║                                                           ║"
echo "║   Press Ctrl+C to stop all services                      ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Save PIDs
echo "$BACKEND_PID $AGENT_PID $MERCHANT_PID $OPS_PID" > .pids

# Wait for Ctrl+C
trap "echo ''; echo '🛑 Stopping all services...'; kill $BACKEND_PID $AGENT_PID $MERCHANT_PID $OPS_PID 2>/dev/null; rm .pids; echo '✓ All services stopped'; exit 0" INT

# Keep script running
wait
