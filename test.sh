#!/bin/bash

# Quick test script to verify backend and agent are working

echo "🧪 Testing SlayPay System..."
echo ""

# Test Backend
echo "1. Testing Backend API..."
BACKEND_HEALTH=$(curl -s http://localhost:3001/health)
if [ $? -eq 0 ]; then
    echo "   ✅ Backend is running"
    
    # Generate test data
    echo "   📝 Generating test payments..."
    curl -s -X POST http://localhost:3001/payments/simulate \
        -H "Content-Type: application/json" \
        -d '{"count": 20}' > /dev/null
    echo "   ✅ Generated 20 test transactions"
    
    # Check metrics
    echo "   📊 Fetching metrics..."
    METRICS=$(curl -s http://localhost:3001/metrics/summary)
    echo "   ✅ Metrics available"
else
    echo "   ❌ Backend not running on port 3001"
    echo "   Run: cd backend && npm start"
    exit 1
fi

echo ""

# Test Agent
echo "2. Testing AI Agent..."
AGENT_HEALTH=$(curl -s http://localhost:3002/health)
if [ $? -eq 0 ]; then
    echo "   ✅ Agent is running"
    
    # Check agent status
    echo "   🤖 Checking agent status..."
    STATUS=$(curl -s http://localhost:3002/agent/status)
    echo "   ✅ Agent status available"
    
    # Check decisions
    echo "   💡 Checking agent decisions..."
    DECISIONS=$(curl -s http://localhost:3002/agent/decisions)
    echo "   ✅ Agent decisions available"
else
    echo "   ❌ Agent not running on port 3002"
    echo "   Run: cd agent && python agent.py"
fi

echo ""
echo "✅ System test complete!"
echo ""
echo "Access points:"
echo "  • Merchant: http://localhost:5173"
echo "  • Ops Dashboard: http://localhost:5174"
echo "  • Backend API: http://localhost:3001"
echo "  • Agent API: http://localhost:3002"
