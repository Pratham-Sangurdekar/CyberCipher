# SlayPay AI Agent

Autonomous agent that monitors payment events, detects anomalies, and proposes corrective actions.

## Installation

```bash
pip install -r requirements.txt
```

## Run

```bash
python agent.py
```

The agent will:
1. Start an API server on port 3002
2. Begin monitoring loop (every 30 seconds)
3. Fetch events from backend (localhost:3001)
4. Analyze patterns and detect anomalies
5. Generate actionable decisions
6. Store decisions in memory

## API Endpoints

### GET /agent/status
Get current agent status and last analysis
```bash
curl http://localhost:3002/agent/status
```

### GET /agent/decisions
Get recent decisions made by agent
```bash
curl http://localhost:3002/agent/decisions
```

### GET /agent/history
Get historical decisions with outcomes
```bash
curl http://localhost:3002/agent/history
```

## How It Works

**Observe** → Fetches payment events from backend
**Reason** → Detects anomalies using heuristics
**Decide** → Proposes actions based on patterns
**Remember** → Stores decisions and tracks outcomes
**Explain** → Generates human-readable justifications

## Anomaly Detection

- **Bank Anomalies**: Detects failure rates > 5%
- **Method Anomalies**: Detects payment method issues
- **Error Patterns**: Identifies repeating error codes

## Decision Confidence

- High confidence (90%+): Critical issues requiring immediate action
- Medium confidence (70-90%): Monitoring and preventive measures
- Low confidence (<70%): Investigation recommended
