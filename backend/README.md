# SlayPay Backend

Payment gateway backend service that ingests, stores, and exposes payment events.

## Installation

```bash
npm install
```

## Run

```bash
npm start
# or for development with auto-reload:
npm run dev
```

## API Endpoints

### POST /payments/simulate
Generate bulk random transactions for testing
```bash
curl -X POST http://localhost:3001/payments/simulate \
  -H "Content-Type: application/json" \
  -d '{"count": 10}'
```

### POST /payments/event
Submit a single payment event
```bash
curl -X POST http://localhost:3001/payments/event \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "TXN_001",
    "amount": 1500,
    "bank": "HDFC",
    "method": "UPI",
    "status": "success",
    "latency": 234
  }'
```

### GET /payments/recent
Get recent transactions (default: 50)
```bash
curl http://localhost:3001/payments/recent?limit=10
```

### GET /metrics/summary
Get aggregated metrics and stats
```bash
curl http://localhost:3001/metrics/summary
```

### GET /events
Get raw event list (for agent)
```bash
curl http://localhost:3001/events
```

## WebSocket Stream

Connect to `ws://localhost:3001` to receive live payment events.
