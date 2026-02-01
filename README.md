<div align="center">

# 🔐 SlayPay Agent

### AI-Powered Payment Gateway Intelligence Platform

*Real-time anomaly detection • Autonomous decision making • Intelligent routing optimization*

---

[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)](https://github.com/Pratham-Sangurdekar/CyberCipher)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.9+-blue?style=for-the-badge&logo=python)](https://python.org)
[![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org)

[Quick Start](#-quick-start) • [Features](#-key-features) • [Architecture](#-architecture) • [Documentation](#-documentation) • [API Reference](#-api-reference)

</div>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [What Makes CyberCipher Special](#-what-makes-cybercipher-special)
- [Quick Start](#-quick-start)
- [System Architecture](#-system-architecture)
- [Key Features](#-key-features)
- [The AI Agent Brain](#-the-ai-agent-brain)
- [Component Deep Dive](#-component-deep-dive)
- [Installation & Setup](#-installation--setup)
- [Testing & Verification](#-testing--verification)
- [API Reference](#-api-reference)
- [Configuration](#-configuration)
- [Workflow Viewer](#-workflow-viewer)
- [Advanced Features](#-advanced-features)
- [Troubleshooting](#-troubleshooting)
- [Development Guide](#-development-guide)
- [Performance & Scaling](#-performance--scaling)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)

---

## Overview

**CyberCipher** is a next-generation payment gateway intelligence platform that combines real-time transaction processing with autonomous AI-powered monitoring and decision-making. Built for modern fintech operations, it provides instant visibility into payment flows while automatically detecting and responding to anomalies across banks, payment methods, and error patterns.

### What Problem Does It Solve?

In modern payment systems, **every millisecond matters**. Traditional monitoring solutions are reactive—by the time humans notice a problem, thousands of transactions may have already failed. CyberCipher solves this with:

- **Autonomous Monitoring**: AI agent analyzes every transaction in real-time
- **Instant Detection**: Anomalies detected within 30 seconds of occurrence
- **Intelligent Response**: Automated decision-making with human-readable explanations
- **Zero Downtime**: Continuous operation with graceful degradation
- **Complete Visibility**: Full transaction lifecycle tracking across all payment rails

---

## What Makes CyberCipher Special

### Autonomous AI Agent
Not just alerts—**actual intelligence**. The AI agent:
- Runs continuously in a 30-second observation loop
- Detects patterns across banks, payment methods, and error codes
- Generates actionable decisions with confidence scores
- Explains its reasoning in human-readable language
- Tracks outcomes to improve future decisions
- Visualizes its thought process in a workflow viewer

### Real-Time Everything
- **Sub-3-second latency** from payment to dashboard
- Live WebSocket streams for instant updates
- Auto-refreshing metrics and KPIs
- Animated workflow visualization showing agent thinking

### Advanced Analytics
- **Severity Classification**: LOW/MEDIUM/HIGH based on failure rates
- **Persistence Tracking**: NEW/RECURRING/ONGOING issue detection
- **Correlated Failure Patterns**: Bank+method pair analysis
- **Burst Detection**: Identifies sudden failure spikes
- **Retry Chain Analysis**: Tracks cascading retry failures

### Beautiful Visualizations
- n8n-style workflow viewer with cascading animations
- Real-time charts and graphs
- Severity badges and persistence indicators
- Interactive timeline of agent decisions

---

## Quick Start

### One-Command Launch

```bash
git clone https://github.com/Pratham-Sangurdekar/CyberCipher.git
cd CyberCipher
./start.sh
```

**That's it!** All services will start automatically:

| Service | URL | Description |
|---------|-----|-------------|
|  **Merchant Portal** | http://localhost:5173 | Generate test payments |
|  **Ops Dashboard** | http://localhost:5174 | Monitor & analyze |
|  **Backend API** | http://localhost:3001 | Core services |
|  **AI Agent** | http://localhost:3002 | Intelligence engine |

### First Transaction in 30 Seconds

```bash
# Generate 20 test payments
curl -X POST http://localhost:3001/payments/simulate \
  -H "Content-Type: application/json" \
  -d '{"count": 20}'

# Watch them appear in real-time at:
# → http://localhost:5174
```

---

##  System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     CyberCipher Platform                         │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐              ┌──────────────┐
│   Merchant   │◄────────────►│     Ops      │
│    Portal    │   Real-time  │  Dashboard   │
│              │    Updates   │              │
│   React +    │              │  React +     │
│   Vite       │              │  Vite        │
│   :5173      │              │  :5174       │
└──────┬───────┘              └──────┬───────┘
       │                             │
       │         REST APIs           │
       │      WebSocket Stream       │
       └────────┬───────────┬────────┘
                │           │
          ┌─────▼───────────▼─────┐
          │   Backend Server      │
          │   Express + Node.js   │
          │   :3001              │
          │                       │
          │  • Event Storage      │
          │  • Metrics Engine     │
          │  • WebSocket Hub      │
          │  • Failure Presets    │
          └─────┬─────────────────┘
                │
                │ HTTP Polling
                │ Every 30s
                │
          ┌─────▼─────────────────┐
          │    AI Agent           │
          │    Flask + Python     │
          │    :3002             │
          │                       │
          │  ┌─────────────────┐  │
          │  │  Orchestrator   │  │
          │  └────────┬────────┘  │
          │           │           │
          │  ┌────────▼────────┐  │
          │  │    Observe      │  │
          │  │  (observe.py)   │  │
          │  └────────┬────────┘  │
          │           │           │
          │  ┌────────▼────────┐  │
          │  │     Reason      │  │
          │  │  (reason.py)    │  │
          │  └────────┬────────┘  │
          │           │           │
          │  ┌────────▼────────┐  │
          │  │     Decide      │  │
          │  │  (decide.py)    │  │
          │  └────────┬────────┘  │
          │           │           │
          │  ┌────────▼────────┐  │
          │  │    Explain      │  │
          │  │  (explain.py)   │  │
          │  └────────┬────────┘  │
          │           │           │
          │  ┌────────▼────────┐  │
          │  │     Memory      │  │
          │  │  (memory.py)    │  │
          │  └─────────────────┘  │
          └───────────────────────┘
```

### Data Flow Diagram

```
Merchant Portal                 Backend                  AI Agent                 Ops Dashboard
─────────────                 ─────────                ─────────                ─────────────

     │                           │                         │                          │
     │  POST /payments/event     │                         │                          │
     ├──────────────────────────►│                         │                          │
     │                           │                         │                          │
     │  201 Created              │                         │                          │
     │◄──────────────────────────┤                         │                          │
     │                           │                         │                          │
     │                           │ Store Event             │                          │
     │                           │ Update Metrics          │                          │
     │                           │ Broadcast WebSocket     │                          │
     │                           │                         │                          │
     │                           │  GET /payments/recent   │                          │
     │                           │◄────────────────────────┤                          │
     │                           │                         │                          │
     │                           │  [Events Array]         │                          │
     │                           ├────────────────────────►│                          │
     │                           │                         │                          │
     │                           │                         │ Analyze Patterns         │
     │                           │                         │ Detect Anomalies         │
     │                           │                         │ Generate Decisions       │
     │                           │                         │                          │
     │                           │                         │                          │
     │                           │                         │   GET /agent/insights    │
     │                           │                         │◄─────────────────────────┤
     │                           │                         │                          │
     │                           │                         │   [Decisions Array]      │
     │                           │                         ├─────────────────────────►│
     │                           │                         │                          │
     │                           │  GET /metrics/summary   │                          │
     │                           │◄────────────────────────┼──────────────────────────┤
     │                           │                         │                          │
     │                           │  [KPIs + Charts]        │                          │
     │                           ├─────────────────────────┼─────────────────────────►│
     │                           │                         │                          │
     │                           │                         │                    Display Dashboard
     │                           │                         │                    Update Charts
     │                           │                         │                    Show AI Insights
```

---

##  Key Features

### Real-Time Transaction Processing
```javascript
// Every payment flows through the system instantly
Payment → Backend (< 10ms) → Storage → Metrics → Dashboard (< 3s)
```

- **Sub-second ingestion**: Payments processed in < 100ms
- **Instant visibility**: Appears in dashboard within 3 seconds
- **Zero data loss**: In-memory store with persistence ready
- **Auto-aggregation**: KPIs update on every transaction

###  Intelligent Failure Detection

**3-Tier Severity Classification**:
- 🟢 **LOW** (5-15% failure): Minor issues, routine monitoring
- 🟡 **MEDIUM** (15-30% failure): Elevated concern, investigation needed
- 🔴 **HIGH** (>30% failure): Critical issue, immediate action required

**Persistence Tracking**:
-  **NEW**: Just detected, first occurrence
-  **RECURRING**: Seen before, pattern emerging  
-  **ONGOING**: Persistent issue, requires intervention

### 📡 Advanced Failure Simulation

**Three Operational Modes**:

| Mode | Success Rate | Failure Rate | Use Case |
|------|--------------|--------------|----------|
| 🟢 **NORMAL** | 92% | 3% | Healthy operations |
| 🟡 **DEGRADED** | 60% | 18% | Stress testing |
| 🔴 **OUTAGE** | 35% | 40% | Disaster scenarios |

**Correlated Failure Patterns**:
- **Bank+Method Pairs**: Specific combinations fail together (e.g., HDFC+UPI)
- **Retry Chains**: 12% of failures trigger retry cascades
- **Burst Failures**: 15% chance of sudden spikes
- **Latency Correlation**: High latency predicts failures

###  Visual Workflow Explainability

**n8n-Style Pipeline Viewer**:
- See exactly how the AI agent thinks
- 5-stage visual pipeline with cascading animations
- Real-time status indicators (⚙️ running, ✓ completed)
- Human-readable explanations at each step
- Updates every 30 seconds with latest analysis

###  Comprehensive Analytics

**Bank-Level Insights**:
- Failure rates by bank (HDFC, ICICI, SBI, Axis, Kotak, PNB)
- Average latency per bank
- Transaction volume distribution
- Error pattern clustering

**Payment Method Analysis**:
- Card, UPI, Netbanking, Wallet performance
- Method-specific failure modes
- Latency characteristics
- Usage patterns

**Error Code Intelligence**:
- Automatic pattern recognition
- Recurring error detection
- Impact assessment
- Suggested remediations

---

## 🤖 The AI Agent Brain

### How It Works

The AI agent operates in a continuous **30-second observation loop**:

```python
while True:
    # 1️⃣ OBSERVE
    events = fetch_recent_payments(100)  # Last 100 transactions
    metrics = calculate_statistics(events)
    
    # 2️⃣ REASON
    anomalies = detect_patterns(metrics)
    severity = classify_severity(anomalies)
    persistence = track_issue_history(anomalies)
    
    # 3️⃣ DECIDE  
    decisions = generate_actions(anomalies, severity, persistence)
    confidence = calculate_confidence(decisions)
    
    # 4️⃣ EXPLAIN
    explanations = create_human_readable(decisions)
    
    # 5️⃣ MEMORY
    store_decisions(decisions)
    track_outcomes(decisions)
    
    sleep(30)  # Wait for next cycle
```

### Anomaly Detection Logic

**Bank Failure Detection**:
```python
for bank in banks:
    failure_rate = (failures / total) * 100
    
    if failure_rate > 30:
        severity = "HIGH"
        action = "Immediately disable bank routing"
    elif failure_rate > 15:
        severity = "MEDIUM"
        action = "Reduce traffic allocation by 50%"
    elif failure_rate > 5:
        severity = "LOW"
        action = "Monitor closely, consider gradual reduction"
```

**Pattern Correlation**:
```python
# Detect bank+method combinations
if hdfc_upi_failures > threshold:
    decision = "Route HDFC UPI traffic to backup processor"
    
# Detect retry chains
if consecutive_retries > 3:
    decision = "Implement exponential backoff"
    
# Detect burst failures
if failures_in_last_minute > surge_threshold:
    decision = "Activate circuit breaker"
```

### Decision Generation

Each anomaly triggers a structured decision:

```json
{
  "decision_id": "DEC_1738387200",
  "timestamp": "2026-02-01T12:00:00Z",
  "issue": "HDFC Bank showing HIGH failure rate (35.2%)",
  "severity": "HIGH",
  "persistence": "ONGOING",
  "duration_minutes": 45,
  "action": "Immediately reduce HDFC traffic allocation to 20%",
  "confidence": 95,
  "risk_level": "high",
  "reasoning": "Based on analysis of 150 transactions over 45 minutes. HDFC failures exceed 30% threshold (35.2%). Issue persists across multiple cycles. Impact: 23 failed transactions affecting 15 customers.",
  "evidence": {
    "total_transactions": 150,
    "failed_transactions": 53,
    "failure_rate": 35.2,
    "affected_customers": 15,
    "duration_minutes": 45
  },
  "outcome": "pending"
}
```

### Memory & Learning

The agent maintains:
- **Decision History**: All past decisions with outcomes
- **Issue Tracking**: Active problems with state (NEW/RECURRING/ONGOING)
- **Pattern Library**: Learned failure signatures
- **Outcome Metrics**: Success rate of past interventions

---

##  Component Deep Dive

###  Backend Server (Node.js + Express)

**Core Responsibilities**:
- Transaction ingestion and validation
- Real-time metrics calculation
- WebSocket event broadcasting
- API gateway for all services
- Failure mode simulation

**Key Files**:
- `server.js` - Main Express application
- `FAILURE_PRESETS` - Configurable failure scenarios
- `generateRandomEvent()` - Realistic payment simulation
- `calculateMetrics()` - Real-time aggregation engine

**APIs Provided**:
```javascript
// Health & Status
GET  /health
GET  /metrics/summary

// Payment Operations  
POST /payments/event
POST /payments/simulate
GET  /payments/recent?limit=100

// Agent Integration
GET  /agent/status
GET  /agent/insights
GET  /agent/workflow_state

// WebSocket
WS   ws://localhost:3001
```

**Failure Simulation Features**:
```javascript
// Bank-specific failure rates
const BANK_FAILURE_RATES = {
  'HDFC': 0.15,    // 15% failure rate
  'ICICI': 0.08,   // 8% failure rate
  'SBI': 0.12,     // 12% failure rate
  // ...
};

// Correlated failures
if (bank === 'HDFC' && method === 'UPI') {
  failureBoost = 2.0;  // Double the failure rate
}

// Burst detection
if (Math.random() < 0.15) {
  triggerBurst();  // Sudden spike
}
```

###  AI Agent (Python + Flask)

**Architecture**:
```
agent/
├── main.py          # Flask server & health endpoints
├── agent.py         # Orchestrator & main loop
├── observe.py       # Data fetching & preprocessing
├── reason.py        # Anomaly detection & classification
├── decide.py        # Action generation & prioritization
├── explain.py       # Natural language generation
└── memory.py        # Decision storage & tracking
```

**Module Breakdown**:

**1. Observe Module** (`observe.py`):
```python
def fetch_recent_events(limit=100):
    """Fetch and structure payment data"""
    events = requests.get(f'{BACKEND_URL}/payments/recent')
    
    return {
        'by_bank': group_by_bank(events),
        'by_method': group_by_method(events),
        'by_status': group_by_status(events),
        'errors': extract_errors(events),
        'timeline': create_timeline(events)
    }
```

**2. Reason Module** (`reason.py`):
```python
def detect_bank_anomalies(metrics):
    """Identify failing banks with severity"""
    anomalies = []
    
    for bank, stats in metrics['by_bank'].items():
        failure_rate = stats['failure_rate']
        severity = classify_severity(failure_rate)
        
        if severity in ['MEDIUM', 'HIGH']:
            anomalies.append({
                'type': 'bank_failure',
                'bank': bank,
                'failure_rate': failure_rate,
                'severity': severity,
                'sample_size': stats['total']
            })
    
    return anomalies

def classify_severity(failure_rate):
    """3-tier severity classification"""
    if failure_rate > 30:
        return 'HIGH'
    elif failure_rate > 15:
        return 'MEDIUM'
    elif failure_rate > 5:
        return 'LOW'
    return None
```

**3. Decide Module** (`decide.py`):
```python
def generate_action(anomaly):
    """Create actionable decision"""
    severity = anomaly['severity']
    persistence = anomaly.get('persistence', 'NEW')
    
    if severity == 'HIGH':
        action = f"Immediately disable {anomaly['bank']} routing"
        confidence = 95
        risk = 'high'
    elif severity == 'MEDIUM':
        action = f"Reduce {anomaly['bank']} allocation by 50%"
        confidence = 80
        risk = 'medium'
    else:
        action = f"Monitor {anomaly['bank']} closely"
        confidence = 65
        risk = 'low'
    
    return {
        'action': action,
        'confidence': confidence,
        'risk_level': risk,
        'persistence': persistence
    }
```

**4. Explain Module** (`explain.py`):
```python
def create_explanation(decision, anomaly):
    """Generate human-readable explanation"""
    template = """
    Detected {severity} severity issue with {bank}.
    
     Evidence:
    - Failure rate: {failure_rate}%
    - Sample size: {total} transactions
    - Duration: {duration} minutes
    - Status: {persistence}
    
     Recommendation:
    {action}
    
    🎯 Confidence: {confidence}%
    ⚠️ Risk Level: {risk_level}
    
     Reasoning:
    {detailed_analysis}
    """
    
    return template.format(**decision, **anomaly)
```

**5. Memory Module** (`memory.py`):
```python
class DecisionMemory:
    def __init__(self):
        self.decisions = []
        self.active_issues = {}
        
    def track_issue(self, anomaly):
        """Track issue persistence"""
        key = f"{anomaly['type']}_{anomaly['bank']}"
        
        if key in self.active_issues:
            issue = self.active_issues[key]
            issue['occurrences'] += 1
            issue['persistence'] = 'RECURRING'
            
            if issue['occurrences'] > 3:
                issue['persistence'] = 'ONGOING'
        else:
            self.active_issues[key] = {
                'first_seen': datetime.now(),
                'occurrences': 1,
                'persistence': 'NEW'
            }
        
        return self.active_issues[key]['persistence']
```

###  Merchant Portal (React + Vite)

**Features**:
- One-click payment simulation
- Bulk transaction generation
- Real-time success/failure feedback
- Transaction history view
- Custom amount and method selection

**Key Components**:
```jsx
function PaymentSimulator() {
  const [loading, setLoading] = useState(false);
  
  const simulatePayments = async (count) => {
    setLoading(true);
    
    const response = await fetch('http://localhost:3001/payments/simulate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count })
    });
    
    const result = await response.json();
    toast.success(`Generated ${count} payments!`);
    setLoading(false);
  };
  
  return (
    <div className="simulator">
      <button onClick={() => simulatePayments(10)}>
        Generate 10 Payments
      </button>
      <button onClick={() => simulatePayments(50)}>
        Generate 50 Payments
      </button>
      <button onClick={() => simulatePayments(100)}>
        Generate 100 Payments
      </button>
    </div>
  );
}
```

###  Ops Dashboard (React + Vite)

**Pages**:

1. **Overview** - System health KPIs
   - Total transactions
   - Success rate
   - Failure rate
   - Average latency
   - Recent activity timeline

2. **Live Payments** - Real-time transaction feed
   - Auto-scrolling event stream
   - Status color coding
   - Pause/resume controls
   - Transaction details

3. **Failure Analysis** - Deep dive charts
   - Failure rate by bank (bar charts)
   - Failure rate by method (bar charts)
   - Average latency by bank
   - Average latency by method
   - All charts update in real-time

4. **Agent Activity** - AI decisions
   - Recent agent decisions
   - Severity badges (🔴🟡🟢)
   - Persistence indicators (🆕🔄⚠️)
   - Confidence scores
   - Detailed reasoning

**Workflow Viewer**:
```jsx
function WorkflowViewer() {
  const [workflowState, setWorkflowState] = useState(null);
  
  useEffect(() => {
    // Fetch workflow state every 3 seconds
    const interval = setInterval(async () => {
      const response = await fetch('http://localhost:3001/agent/workflow_state');
      const data = await response.json();
      setWorkflowState(data.workflow);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="workflow-panel">
      <WorkflowNode 
        title="Observe"
        status={workflowState?.observe?.status}
        summary={workflowState?.observe?.summary}
        delay="0s"
      />
      <WorkflowNode 
        title="Reason"
        status={workflowState?.reason?.status}
        summary={workflowState?.reason?.summary}
        delay="1.5s"
      />
      {/* ... more nodes with cascading delays ... */}
    </div>
  );
}
```

**Auto-Refresh Logic**:
```jsx
useEffect(() => {
  const fetchData = async () => {
    // Fetch metrics
    const metricsRes = await fetch('http://localhost:3001/metrics/summary');
    const metrics = await metricsRes.json();
    setKpis(metrics);
    
    // Fetch recent events
    const eventsRes = await fetch('http://localhost:3001/payments/recent?limit=50');
    const events = await eventsRes.json();
    setEvents(events);
    
    // Fetch agent insights
    const agentRes = await fetch('http://localhost:3001/agent/insights');
    const insights = await agentRes.json();
    setInsights(insights);
  };
  
  // Fetch immediately
  fetchData();
  
  // Refresh every 3 seconds
  const interval = setInterval(fetchData, 3000);
  
  return () => clearInterval(interval);
}, []);
```

---

##  Installation & Setup

### Prerequisites

| Requirement | Version | Check Command |
|-------------|---------|---------------|
| **Node.js** | 18.0+ | `node --version` |
| **Python** | 3.9+ | `python3 --version` |
| **npm** | 8.0+ | `npm --version` |
| **pip** | 21.0+ | `pip3 --version` |
| **Git** | 2.0+ | `git --version` |

### Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/Pratham-Sangurdekar/CyberCipher.git
cd CyberCipher

# Run the magic script
./start.sh
```

The `start.sh` script automatically:
- ✅ Installs all Node.js dependencies
- ✅ Creates Python virtual environment
- ✅ Installs Python packages
- ✅ Starts backend server (port 3001)
- ✅ Starts AI agent (port 3002)
- ✅ Starts merchant portal (port 5173)
- ✅ Starts ops dashboard (port 5174)
- ✅ Generates initial test data
- ✅ Opens browser tabs automatically

### Manual Setup (Advanced Users)

**Step 1: Backend Server**
```bash
cd backend
npm install
npm start

# Expected output:
# ✓ Backend server running on http://localhost:3001
# ✓ WebSocket server ready
# ✓ In-memory store initialized
```

**Step 2: AI Agent**
```bash
cd agent

# Create virtual environment
python3 -m venv venv

# Activate (macOS/Linux)
source venv/bin/activate

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start agent
python main.py

# Expected output:
# ✓ Agent server running on http://localhost:3002
# ✓ Observation loop started (30s interval)
# ✓ Backend connection verified
```

**Step 3: Merchant Portal**
```bash
cd merchant
npm install
npm run dev

# Expected output:
# ✓ VITE ready in 234ms
# ✓ Local: http://localhost:5173
```

**Step 4: Ops Dashboard**
```bash
cd ops
npm install
npm run dev -- --port 5174

# Expected output:
# ✓ VITE ready in 245ms
# ✓ Local: http://localhost:5174
```

### Verification Checklist

After installation, verify all services:

```bash
# Check backend
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"...","version":"1.0.0"}

# Check agent
curl http://localhost:3002/health
# Expected: {"status":"ok","timestamp":"...","loop_active":true}

# Check merchant (should return HTML)
curl http://localhost:5173

# Check ops (should return HTML)
curl http://localhost:5174
```

### First Transaction Test

```bash
# Generate a single test payment
curl -X POST http://localhost:3001/payments/event \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "TEST_001",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "user_id": "test@cybercipher.com",
    "amount": 1000,
    "bank": "HDFC",
    "method": "UPI",
    "status": "success",
    "latency": 234,
    "error_code": null
  }'

# Verify it was stored
curl 'http://localhost:3001/payments/recent?limit=1' | jq '.[0].transaction_id'
# Expected: "TEST_001"

# Check it in ops dashboard
open http://localhost:5174
# Should see TEST_001 in Live Payments within 3 seconds
```

---

##  Testing & Verification

### Quick Tests

**1. Health Checks**
```bash
./test.sh health
```
Verifies all 4 services are running.

**2. Data Flow Test**
```bash
./test.sh flow
```
Sends a payment through the entire pipeline and verifies it appears in all components.

**3. Load Test**
```bash
./test.sh load
```
Generates 1000 transactions and measures system performance.

### Manual Test Scenarios

#### Scenario 1: Normal Operations
```bash
# Generate healthy traffic
curl -X POST http://localhost:3001/payments/simulate \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'

# Expected results:
# - Success rate: ~92%
# - Avg latency: ~250ms
# - No HIGH severity alerts
# - Agent generates 0-2 LOW severity insights
```

#### Scenario 2: Bank Failure Spike
```bash
# Switch to DEGRADED mode (in backend/server.js)
# Set: ACTIVE_PRESET = 'DEGRADED'
# Restart backend

# Generate traffic
curl -X POST http://localhost:3001/payments/simulate \
  -H "Content-Type: application/json" \
  -d '{"count": 100}'

# Expected results:
# - Success rate: ~60%
# - Failure rate: ~18%
# - Multiple MEDIUM/HIGH severity alerts
# - Agent generates 5-10 decisions
# - Workflow viewer shows active reasoning
```

#### Scenario 3: Retry Chain Detection
```bash
# Generate 200 transactions to trigger retry patterns
curl -X POST http://localhost:3001/payments/simulate \
  -H "Content-Type: application/json" \
  -d '{"count": 200}'

# Wait 60 seconds for agent cycles

# Check for retry chain detection
curl http://localhost:3002/agent/insights | jq '.[] | select(.issue | contains("retry"))'

# Expected:
# - Detection of retry chain patterns
# - Recommendations for exponential backoff
# - Circuit breaker suggestions
```

### End-to-End Validation

**Complete System Test**:
```bash
# 1. Start all services
./start.sh

# 2. Generate initial baseline (should be healthy)
curl -X POST http://localhost:3001/payments/simulate -H "Content-Type: application/json" -d '{"count": 30}'

# 3. Wait 35 seconds (agent cycle)
sleep 35

# 4. Check baseline - should see LOW or no issues
curl http://localhost:3002/agent/insights

# 5. Introduce failures (switch to DEGRADED in backend)
# Edit backend/server.js: ACTIVE_PRESET = 'DEGRADED'
# Restart backend

# 6. Generate stressed traffic
curl -X POST http://localhost:3001/payments/simulate -H "Content-Type: application/json" -d '{"count": 100}'

# 7. Wait for agent analysis
sleep 35

# 8. Verify HIGH severity detections
curl http://localhost:3002/agent/insights | jq '[.[] | select(.severity == "HIGH")] | length'
# Expected: >= 1

# 9. Check ops dashboard
open http://localhost:5174
# Should see:
#   - Red severity badges
#   - ⚠️ Ongoing indicators
#   - Workflow viewer showing active processing
#   - Failure charts with elevated bars

# 10. Verify persistence tracking
curl http://localhost:3002/agent/insights | jq '[.[] | select(.persistence == "ONGOING")] | length'
# Expected: >= 1 (issues persist across cycles)
```

### Performance Benchmarks

Expected performance on standard hardware (16GB RAM, 4-core CPU):

| Metric | Target | Acceptable | Critical |
|--------|--------|------------|----------|
| Payment Ingestion | < 10ms | < 50ms | < 100ms |
| Dashboard Update Latency | < 3s | < 5s | < 10s |
| Agent Cycle Time | 30s | 35s | 45s |
| Concurrent Requests | 100/s | 50/s | 25/s |
| Memory Usage (Backend) | < 200MB | < 500MB | < 1GB |
| Memory Usage (Agent) | < 150MB | < 300MB | < 500MB |

**Run Benchmark**:
```bash
# Install Apache Bench
# macOS: brew install httpd
# Ubuntu: apt-get install apache2-utils

# Test payment ingestion
ab -n 1000 -c 10 -p payment.json -T application/json \
   http://localhost:3001/payments/event

# Expected results:
# Requests per second: > 100
# 95th percentile: < 50ms
# No failed requests
```

---

##  API Reference

### Backend API

#### Health & Status

**GET `/health`**
```bash
curl http://localhost:3001/health
```
Response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-01T12:00:00.000Z",
  "version": "1.0.0",
  "uptime": 3600,
  "memory": {
    "used": 145000000,
    "total": 200000000
  }
}
```

**GET `/metrics/summary`**
```bash
curl http://localhost:3001/metrics/summary
```
Response:
```json
{
  "overview": {
    "totalTransactions": 1247,
    "successRate": 91.8,
    "failureRate": 8.2,
    "avgLatency": 267
  },
  "byBank": [
    {
      "name": "HDFC",
      "total": 421,
      "success": 385,
      "failed": 36,
      "failureRate": 8.5,
      "avgLatency": 245
    }
  ],
  "byMethod": [
    {
      "name": "UPI",
      "total": 534,
      "success": 495,
      "failed": 39,
      "failureRate": 7.3,
      "avgLatency": 198
    }
  ],
  "timeline": [
    {
      "timestamp": "2026-02-01T12:00:00Z",
      "total": 45,
      "success": 41,
      "failed": 4
    }
  ]
}
```

#### Payment Operations

**POST `/payments/event`**
Submit a single payment transaction.

```bash
curl -X POST http://localhost:3001/payments/event \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_id": "TXN_123456",
    "timestamp": "2026-02-01T12:00:00Z",
    "user_id": "user@example.com",
    "amount": 5000,
    "bank": "HDFC",
    "method": "UPI",
    "status": "success",
    "latency": 234,
    "error_code": null
  }'
```

Response:
```json
{
  "success": true,
  "transaction_id": "TXN_123456",
  "stored_at": "2026-02-01T12:00:00.123Z"
}
```

**POST `/payments/simulate`**
Generate bulk test transactions.

```bash
curl -X POST http://localhost:3001/payments/simulate \
  -H "Content-Type: application/json" \
  -d '{"count": 50}'
```

Response:
```json
{
  "success": true,
  "generated": 50,
  "summary": {
    "success": 46,
    "failed": 4,
    "successRate": 92.0
  }
}
```

**GET `/payments/recent`**
Retrieve recent transactions.

```bash
curl 'http://localhost:3001/payments/recent?limit=10'
```

Query Parameters:
- `limit` (optional): Number of transactions (default: 50, max: 500)

Response:
```json
[
  {
    "transaction_id": "TXN_123456",
    "timestamp": "2026-02-01T12:00:00Z",
    "user_id": "user@example.com",
    "amount": 5000,
    "bank": "HDFC",
    "method": "UPI",
    "status": "success",
    "latency": 234,
    "error_code": null
  }
]
```

#### Agent Integration

**GET `/agent/status`**
Get current agent status.

```bash
curl http://localhost:3001/agent/status
```

Response:
```json
{
  "status": "active",
  "last_cycle": "2026-02-01T12:00:30Z",
  "next_cycle": "2026-02-01T12:01:00Z",
  "cycle_count": 42,
  "decisions_generated": 15
}
```

**GET `/agent/insights`**
Get recent agent decisions.

```bash
curl http://localhost:3001/agent/insights
```

Response:
```json
[
  {
    "decision_id": "DEC_1738387200",
    "timestamp": "2026-02-01T12:00:00Z",
    "issue": "HDFC Bank showing HIGH failure rate (35.2%)",
    "severity": "HIGH",
    "persistence": "ONGOING",
    "action": "Immediately reduce HDFC traffic allocation to 20%",
    "confidence": 95,
    "risk_level": "high",
    "reasoning": "Based on analysis of 150 transactions over 45 minutes..."
  }
]
```

**GET `/agent/workflow_state`**
Get current workflow visualization state.

```bash
curl http://localhost:3001/agent/workflow_state
```

Response:
```json
{
  "success": true,
  "workflow": {
    "observe": {
      "status": "completed",
      "summary": "Analyzed 100 events across 6 banks and 4 methods",
      "last_updated": "2026-02-01T12:00:15Z",
      "details": {
        "banks": 6,
        "methods": 4,
        "total_events": 100
      }
    },
    "reason": {
      "status": "completed",
      "summary": "Detected 7 anomalies (3 HIGH, 2 MEDIUM, 2 LOW)",
      "details": {
        "total_anomalies": 7,
        "high_severity": 3,
        "medium_severity": 2,
        "low_severity": 2
      }
    }
  }
}
```

### AI Agent API

#### Health & Status

**GET `/health`**
```bash
curl http://localhost:3002/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-01T12:00:00.000Z",
  "loop_active": true,
  "last_cycle": "2026-02-01T11:59:30Z",
  "backend_connection": "ok"
}
```

#### Decision Management

**GET `/agent/decisions`**
Get all decisions with filtering.

```bash
# Get all decisions
curl http://localhost:3002/agent/decisions

# Filter by severity
curl 'http://localhost:3002/agent/decisions?severity=HIGH'

# Filter by persistence
curl 'http://localhost:3002/agent/decisions?persistence=ONGOING'

# Limit results
curl 'http://localhost:3002/agent/decisions?limit=10'
```

**GET `/agent/history`**
Get decision history with outcomes.

```bash
curl http://localhost:3002/agent/history
```

Response includes outcome tracking:
```json
[
  {
    "decision_id": "DEC_123",
    "issue": "HDFC failure spike",
    "action": "Reduce traffic",
    "outcome": "resolved",
    "resolution_time": 180,
    "effectiveness": 0.85
  }
]
```

### WebSocket API

**Connection**:
```javascript
const ws = new WebSocket('ws://localhost:3001');

ws.onopen = () => {
  console.log('Connected to payment stream');
};

ws.onmessage = (event) => {
  const payment = JSON.parse(event.data);
  console.log('New payment:', payment);
};
```

**Event Format**:
```json
{
  "type": "payment",
  "data": {
    "transaction_id": "TXN_123456",
    "status": "success",
    "bank": "HDFC",
    "method": "UPI",
    "amount": 5000,
    "latency": 234
  }
}
```

---

##  Configuration

### Backend Configuration

**File**: `backend/server.js`

```javascript
// Server Configuration
const PORT = process.env.PORT || 3001;
const MAX_STORED_EVENTS = 1000;

// Failure Presets
const ACTIVE_PRESET = 'NORMAL';  // Options: NORMAL, DEGRADED, OUTAGE_SIMULATION

const FAILURE_PRESETS = {
  NORMAL: {
    baseSuccessRate: 0.92,
    baseFailureRate: 0.03,
    // ...
  },
  DEGRADED: {
    baseSuccessRate: 0.60,
    baseFailureRate: 0.18,
    burstFailureProbability: 0.15,
    retryChainRate: 0.12,
    // ...
  },
  OUTAGE_SIMULATION: {
    baseSuccessRate: 0.35,
    baseFailureRate: 0.40,
    // ...
  }
};

// Bank Configuration
const BANKS = ['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'PNB'];

// Payment Methods
const PAYMENT_METHODS = ['Card', 'UPI', 'Netbanking', 'Wallet'];

// Latency Configuration
const LATENCY_RANGES = {
  min: 50,
  max: 800,
  avg: 250
};
```

### Agent Configuration

**File**: `agent/agent.py`

```python
# Loop Configuration
AGENT_LOOP_INTERVAL = 30  # seconds
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:3001')

# Detection Thresholds
FAILURE_RATE_THRESHOLD = 5.0  # %
LATENCY_THRESHOLD = 400  # ms
SAMPLE_SIZE_MIN = 20  # minimum transactions for analysis

# Severity Classification
SEVERITY_THRESHOLDS = {
    'HIGH': 30.0,    # >= 30% failure rate
    'MEDIUM': 15.0,  # >= 15% failure rate
    'LOW': 5.0       # >= 5% failure rate
}

# Confidence Scoring
CONFIDENCE_WEIGHTS = {
    'sample_size': 0.3,
    'pattern_strength': 0.4,
    'historical_accuracy': 0.3
}

# Memory Settings
MAX_DECISION_HISTORY = 500
ISSUE_EXPIRY_TIME = 3600  # seconds (1 hour)
```

### Frontend Configuration

**Merchant Portal** - `merchant/src/config.js`:
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const REFRESH_INTERVAL = 3000; // ms
export const SIMULATION_PRESETS = [10, 50, 100, 500];
```

**Ops Dashboard** - `ops/src/config.js`:
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
export const AUTO_REFRESH_INTERVAL = 3000; // ms
export const WORKFLOW_UPDATE_INTERVAL = 3000; // ms
export const MAX_EVENT_DISPLAY = 100;
export const CHART_ANIMATION_DURATION = 600; // ms
```

### Environment Variables

Create `.env` files for custom configuration:

**Backend** (`.env` in backend/):
```bash
PORT=3001
NODE_ENV=development
ACTIVE_PRESET=NORMAL
LOG_LEVEL=info
MAX_EVENTS=1000
```

**Agent** (`.env` in agent/):
```bash
AGENT_PORT=3002
BACKEND_URL=http://localhost:3001
LOOP_INTERVAL=30
LOG_LEVEL=info
PYTHON_ENV=development
```

**Frontends** (`.env` in merchant/ and ops/):
```bash
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001
VITE_ENV=development
```

## Development

### Project Structure
```
CyberCipher/
├── backend/          # Node.js/Express API
│   ├── server.js     # Main server
│   └── package.json
├── agent/            # Python AI agent
│   ├── agent.py      # Main loop
│   ├── observe.py    # Data fetching
│   ├── reason.py     # Anomaly detection
│   ├── decide.py     # Action generation
│   ├── memory.py     # Decision tracking
│   └── explain.py    # Explanations
├── merchant/         # Merchant frontend
│   └── src/
├── ops/              # Ops dashboard
│   └── src/
├── logs/             # Runtime logs
├── start.sh          # Startup script
├── test.sh           # Test script
└── ARCHITECTURE.md   # Detailed architecture
```

### Adding New Anomaly Detection
1. Add detection logic in `agent/reason.py`
2. Add action proposal in `agent/decide.py`
3. Add explanation in `agent/explain.py`
4. Agent will automatically pick it up

### Adding Backend APIs
1. Add route in `backend/server.js`
2. Update metrics if needed
3. Document in README

## Troubleshooting

**Backend won't start:**
```bash
# Kill existing process
lsof -ti:3001 | xargs kill -9
# Restart
cd backend && npm start
```

**Agent errors:**
```bash
# Check backend is running
curl http://localhost:3001/health

# Check Python dependencies
cd agent && pip install -r requirements.txt
```

**Frontend blank screen:**
- Check browser console for errors
- Verify backend is running
- Check CORS settings

## Documentation

- [Architecture Details](ARCHITECTURE.md)
- [Backend README](backend/README.md)
- [Agent README](agent/README.md)

## Next Steps

1. **Connect frontends to backend** - Replace mock data with API calls
2. **Add WebSocket support** - Real-time event streaming
3. **Implement agent actions** - Actually route traffic based on decisions
4. **Add authentication** - Secure API endpoints
5. **Add database** - Persistent storage
6. **Deploy** - Production deployment guide

##  Documentation

- **[QUICKSTART.md](QUICKSTART.md)** - Quick reference guide for system usage
- **[E2E_TEST_RESULTS.md](E2E_TEST_RESULTS.md)** - Detailed test documentation and results
- **[CHANGES.md](CHANGES.md)** - Summary of all changes made for real data integration
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete system architecture details
- **[Backend README](backend/README.md)** - Backend API documentation
- **[Agent README](agent/README.md)** - AI agent documentation

---

##  System Status

### What's Real (Backend-Driven) ✅
- ✅ **Overview KPIs**: Total payments, success rate, failure rate, avg latency
- ✅ **Live Payments Table**: Real transaction IDs, timestamps, statuses, latencies
- ✅ **Failure Charts**: Bank/method failure rates computed from real events
- ✅ **Latency Charts**: Bank/method latencies computed from real events
- ✅ **Merchant Payments**: All payments sent to backend and stored

### What's Static (UI-Only) ⚠️
- ⚠️ **Agent Decisions**: Placeholder message (agent service ready but not required to start)
- ⚠️ **Incidents**: Sample timeline data (for UI demonstration)
- ⚠️ **System Logs**: Static sample events (backend integration planned)

### What's Next (Optional Future Work) 🔮
-  Start agent service: `cd agent && python agent.py`
-  Wire agent decisions to ops dashboard
-  Add WebSocket real-time streaming
-  Replace in-memory store with database
-  Add authentication and authorization

---

## License

MIT

## 👥 Contributors

Built for SlayPay Payment Gateway System
