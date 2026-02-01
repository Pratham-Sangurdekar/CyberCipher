# SlayPay System Architecture

## Overview

```
┌──────────────────┐         ┌──────────────────┐
│                  │         │                  │
│  Merchant Portal │         │  Ops Dashboard   │
│  (localhost:5173)│         │ (localhost:5174) │
│                  │         │                  │
└────────┬─────────┘         └────────┬─────────┘
         │                            │
         │ POST /payments/*           │ GET /payments/*
         │                            │ GET /metrics/*
         ▼                            ▼
    ┌────────────────────────────────────────┐
    │                                        │
    │         Backend Server                 │
    │         (localhost:3001)               │
    │                                        │
    │  - Ingests payment events              │
    │  - Stores transactions                 │
    │  - Exposes metrics APIs                │
    │  - WebSocket event stream              │
    │                                        │
    └──────────────────┬─────────────────────┘
                       │
                       │ GET /events
                       │ GET /metrics
                       ▼
              ┌─────────────────────┐
              │                     │
              │     AI Agent        │
              │  (localhost:3002)   │
              │                     │
              │  - Observes events  │
              │  - Detects patterns │
              │  - Proposes actions │
              │  - Learns outcomes  │
              │                     │
              └─────────────────────┘
```

## Component Responsibilities

### Backend (Node.js/Express)
- **Single source of truth** for all payment data
- Accepts payment events from merchant frontend
- Stores recent transactions in memory
- Provides read-only APIs for ops dashboard
- Emits clean event stream for agent
- No business logic or decision-making

### AI Agent (Python/Flask)
- Runs independently with periodic polling
- Analyzes payment patterns and anomalies
- Detects bank/method failures
- Proposes corrective actions
- Tracks decision outcomes
- Provides explanations

### Merchant Frontend (React)
- Simulates payment generation
- Sends events to backend
- Displays transaction status
- **Never talks to agent directly**

### Ops Dashboard (React)
- Reads live payment data from backend
- Displays agent decisions via backend proxy
- Shows metrics and KPIs
- Real-time event stream
- **Never talks to agent directly**

## Data Flow

### Payment Creation Flow
```
Merchant UI → POST /payments/event → Backend → Store → WebSocket broadcast
```

### Agent Analysis Flow
```
Agent (every 30s) → GET /events → Backend → Analyze → POST decisions → Memory
```

### Ops Dashboard Flow
```
Ops UI → GET /metrics/summary → Backend → Display
Ops UI → GET /agent/decisions → Agent API → Display
```

## API Contracts

### Backend APIs

#### POST /payments/simulate
Generate bulk random transactions
```json
{
  "count": 10
}
```

#### POST /payments/event
Submit single payment
```json
{
  "transaction_id": "TXN_001",
  "amount": 1500,
  "bank": "HDFC",
  "method": "UPI",
  "status": "success",
  "latency": 234,
  "error_code": null
}
```

#### GET /payments/recent?limit=50
Get recent transactions

#### GET /metrics/summary
Get aggregated metrics

#### GET /events?since=timestamp
Get raw events (for agent)

### Agent APIs

#### GET /agent/status
Get agent health and stats

#### GET /agent/decisions
Get recent decisions

#### GET /agent/history
Get decision history with outcomes

## Quick Start

1. **Install Dependencies**
```bash
cd backend && npm install
cd ../agent && pip install -r requirements.txt
cd ../merchant && npm install
cd ../ops && npm install
```

2. **Start Services**
```bash
# From CyberCipher root
chmod +x start.sh
./start.sh
```

3. **Test Flow**
- Open Merchant Portal: http://localhost:5173
- Generate payments (use simulate button)
- Open Ops Dashboard: http://localhost:5174
- Watch live events appear
- Check Agent Activity page for AI decisions

## Development

### Run Individual Services

**Backend:**
```bash
cd backend
npm start
```

**Agent:**
```bash
cd agent
python agent.py
```

**Merchant:**
```bash
cd merchant
npm run dev
```

**Ops:**
```bash
cd ops
npm run dev -- --port 5174
```

## Testing the System

1. **Generate Chaotic Data**
   - Go to merchant portal
   - Click "Simulate 50 Payments"
   - Repeat to create traffic spike

2. **Trigger Anomaly**
   - Create 20+ failed HDFC transactions
   - Agent should detect high failure rate
   - Check /agent/decisions for proposed actions

3. **Monitor in Ops Dashboard**
   - Overview: See KPI changes
   - Live Payments: Watch event stream
   - Failures & Anomalies: View charts
   - Agent Activity: See AI decisions

## Configuration

### Backend
- Port: 3001
- Max stored events: 1000
- WebSocket: ws://localhost:3001

### Agent
- Port: 3002
- Poll interval: 30 seconds
- Failure threshold: 5%
- Latency threshold: 400ms

### Frontends
- Merchant: 5173
- Ops: 5174

## Next Steps

1. **Add Real-Time Updates** - Use WebSocket to push events to frontends
2. **Implement Actions** - Allow agent to actually route traffic
3. **Add Metrics Dashboard** - Historical trend analysis
4. **Enhance Agent** - More sophisticated anomaly detection
5. **Add Authentication** - Secure API endpoints
