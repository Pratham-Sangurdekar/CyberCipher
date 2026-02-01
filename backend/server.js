import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = 3001;

// ============================================================================
// FAILURE SIMULATION PRESETS
// ============================================================================

const FAILURE_PRESETS = {
  NORMAL: {
    name: 'NORMAL',
    targetDistribution: {
      success: 0.92,    // 92%
      failure: 0.03,    // 3%
      retried: 0.03,    // 3%
      cancelled: 0.01,  // 1%
      bounced: 0.01     // 1%
    },
    bankMethodPairs: {
      'HDFC+UPI': { failureRate: 0.08, latencyMultiplier: 1.2 },
      'SBI+Netbanking': { failureRate: 0.05, latencyMultiplier: 1.5 }
    },
    burstProbability: 0.02,    // 2% chance of burst
    retryChainRate: 0.03       // 3% of transactions retry
  },
  
  DEGRADED: {
    name: 'DEGRADED',
    targetDistribution: {
      success: 0.60,    // 60%
      failure: 0.18,    // 18%
      retried: 0.12,    // 12%
      cancelled: 0.07,  // 7%
      bounced: 0.03     // 3%
    },
    bankMethodPairs: {
      'HDFC+UPI': { failureRate: 0.42, latencyMultiplier: 2.5 },
      'SBI+Netbanking': { failureRate: 0.35, latencyMultiplier: 3.0 },
      'ICICI+Card': { failureRate: 0.25, latencyMultiplier: 1.8 },
      'Axis+UPI': { failureRate: 0.30, latencyMultiplier: 2.2 }
    },
    burstProbability: 0.15,    // 15% chance of burst
    retryChainRate: 0.12       // 12% of transactions retry
  },
  
  OUTAGE_SIMULATION: {
    name: 'OUTAGE_SIMULATION',
    targetDistribution: {
      success: 0.35,    // 35%
      failure: 0.40,    // 40%
      retried: 0.15,    // 15%
      cancelled: 0.07,  // 7%
      bounced: 0.03     // 3%
    },
    bankMethodPairs: {
      'HDFC+UPI': { failureRate: 0.75, latencyMultiplier: 4.0 },
      'HDFC+Card': { failureRate: 0.65, latencyMultiplier: 3.5 },
      'SBI+Netbanking': { failureRate: 0.70, latencyMultiplier: 4.5 },
      'SBI+UPI': { failureRate: 0.68, latencyMultiplier: 3.8 },
      'ICICI+Card': { failureRate: 0.55, latencyMultiplier: 2.5 },
      'Axis+UPI': { failureRate: 0.60, latencyMultiplier: 3.2 }
    },
    burstProbability: 0.35,    // 35% chance of burst
    retryChainRate: 0.20       // 20% of transactions retry
  }
};

// Current active preset (can be changed via environment variable)
const ACTIVE_PRESET = process.env.FAILURE_PRESET || 'DEGRADED';
const currentPreset = FAILURE_PRESETS[ACTIVE_PRESET] || FAILURE_PRESETS.DEGRADED;

console.log(`\n🎯 Using failure preset: ${currentPreset.name}`);

// Middleware
app.use(cors());
app.use(express.json());

// ============================================================================
// IN-MEMORY DATA STORE
// ============================================================================

const MAX_EVENTS = 1000;
const events = [];
const metrics = {
  totalTransactions: 0,
  successCount: 0,
  failureCount: 0,
  totalLatency: 0,
  bankStats: {},
  methodStats: {},
  errorCodes: {}
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function addEvent(event) {
  // Add timestamp if not present
  if (!event.timestamp) {
    event.timestamp = new Date().toISOString();
  }

  events.unshift(event);
  if (events.length > MAX_EVENTS) {
    events.pop();
  }

  // Update metrics
  updateMetrics(event);

  // Broadcast to WebSocket clients
  broadcastEvent(event);

  return event;
}

function updateMetrics(event) {
  metrics.totalTransactions++;

  if (event.status === 'success') {
    metrics.successCount++;
  } else if (event.status === 'failure') {
    metrics.failureCount++;
  }

  metrics.totalLatency += parseInt(event.latency) || 0;

  // Bank stats
  if (!metrics.bankStats[event.bank]) {
    metrics.bankStats[event.bank] = { total: 0, success: 0, failure: 0, totalLatency: 0 };
  }
  metrics.bankStats[event.bank].total++;
  if (event.status === 'success') metrics.bankStats[event.bank].success++;
  if (event.status === 'failure') metrics.bankStats[event.bank].failure++;
  metrics.bankStats[event.bank].totalLatency += parseInt(event.latency) || 0;

  // Method stats
  if (!metrics.methodStats[event.method]) {
    metrics.methodStats[event.method] = { total: 0, success: 0, failure: 0, totalLatency: 0 };
  }
  metrics.methodStats[event.method].total++;
  if (event.status === 'success') metrics.methodStats[event.method].success++;
  if (event.status === 'failure') metrics.methodStats[event.method].failure++;
  metrics.methodStats[event.method].totalLatency += parseInt(event.latency) || 0;

  // Error codes
  if (event.error_code) {
    metrics.errorCodes[event.error_code] = (metrics.errorCodes[event.error_code] || 0) + 1;
  }
}

function broadcastEvent(event) {
  const message = JSON.stringify({ type: 'payment_event', data: event });
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(message);
    }
  });
}

function generateRandomEvent(options = {}) {
  const { 
    baseTimestamp = Date.now(), 
    userId = null, 
    introduceBias = false,
    preset = currentPreset,
    inBurst = false,
    retryChainId = null
  } = options;
  
  const banks = ['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'Yes'];
  const methods = ['UPI', 'Card', 'Netbanking', 'Wallet'];
  const errorCodes = ['BANK_TIMEOUT', 'INSUFFICIENT_FUNDS', 'INVALID_CARD', 'NETWORK_ERROR', 'RATE_LIMIT', 'GATEWAY_ERROR'];

  const bank = banks[Math.floor(Math.random() * banks.length)];
  const method = methods[Math.floor(Math.random() * methods.length)];
  
  let status = 'success';
  let latency = Math.floor(Math.random() * 300) + 100;
  let errorCode = null;
  
  if (introduceBias) {
    const pairKey = `${bank}+${method}`;
    const pairConfig = preset.bankMethodPairs[pairKey];
    
    // Check if this bank+method pair has specific degradation
    if (pairConfig) {
      latency = Math.floor(Math.random() * 300 * pairConfig.latencyMultiplier) + 100;
      
      // Latency spikes often precede failures
      const hasLatencySpike = latency > 800;
      const failureBoost = hasLatencySpike ? 0.15 : 0;
      
      if (Math.random() < (pairConfig.failureRate + failureBoost)) {
        // Determine failure type based on error patterns
        const rand = Math.random();
        if (rand < 0.45) status = 'failure';
        else if (rand < 0.70) status = 'retried';
        else if (rand < 0.85) status = 'cancelled';
        else status = 'bounced';
        
        latency = Math.floor(Math.random() * 1500) + 500;
      }
    }
    // Burst failures - sudden spikes across multiple banks
    else if (inBurst) {
      if (Math.random() < 0.35) { // 35% fail during bursts
        status = Math.random() < 0.7 ? 'failure' : 'cancelled';
        latency = Math.floor(Math.random() * 2000) + 800;
      }
    }
    // Apply target distribution for non-specific pairs
    else {
      const rand = Math.random();
      const dist = preset.targetDistribution;
      
      if (rand < dist.failure) status = 'failure';
      else if (rand < dist.failure + dist.retried) status = 'retried';
      else if (rand < dist.failure + dist.retried + dist.cancelled) status = 'cancelled';
      else if (rand < dist.failure + dist.retried + dist.cancelled + dist.bounced) status = 'bounced';
      else status = 'success';
      
      if (status !== 'success') {
        latency = Math.floor(Math.random() * 1200) + 400;
      }
    }
    
    // Retry chains - same transaction retried multiple times
    if (retryChainId && Math.random() < 0.6) {
      status = 'retried';
      latency = Math.floor(Math.random() * 600) + 300;
    }
    
  } else {
    // Original simple logic
    const statusWeights = ['success', 'success', 'success', 'success', 'success', 'failure', 'retried', 'cancelled'];
    status = statusWeights[Math.floor(Math.random() * statusWeights.length)];
    latency = status === 'success' 
      ? Math.floor(Math.random() * 300) + 100 
      : Math.floor(Math.random() * 500) + 200;
  }

  const amount = Math.floor(Math.random() * 49990) + 10; // ₹10 - ₹50,000
  
  // Assign error code for non-success statuses
  if (status === 'failure' || status === 'bounced') {
    // Correlated error codes - certain banks tend to have specific errors
    if (bank === 'HDFC' && Math.random() < 0.5) {
      errorCode = 'BANK_TIMEOUT';
    } else if (bank === 'SBI' && Math.random() < 0.4) {
      errorCode = 'NETWORK_ERROR';
    } else {
      errorCode = errorCodes[Math.floor(Math.random() * errorCodes.length)];
    }
  }

  const txnId = retryChainId || `TXN_${baseTimestamp}_${Math.floor(Math.random() * 10000)}`;

  return {
    transaction_id: txnId,
    timestamp: new Date(baseTimestamp).toISOString(),
    user_id: userId || `user_${Math.floor(Math.random() * 1000)}@slaypay.com`,
    amount: amount,
    bank: bank,
    method: method,
    status: status,
    latency: latency,
    error_code: errorCode
  };
}

// ============================================================================
// API ROUTES
// ============================================================================

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// POST /payments/simulate - Generate bulk random transactions with realistic patterns
app.post('/payments/simulate', (req, res) => {
  const { count = 1000, preset: requestedPreset } = req.body;
  const numEvents = Math.min(parseInt(count), 5000); // Max 5000 at once
  
  // Allow override of preset via request
  const activePreset = requestedPreset && FAILURE_PRESETS[requestedPreset] 
    ? FAILURE_PRESETS[requestedPreset] 
    : currentPreset;
  
  console.log(`\n🎲 Generating ${numEvents} payment events using ${activePreset.name} preset...`);
  
  const generatedEvents = [];
  const summary = {
    success: 0,
    failure: 0,
    retried: 0,
    cancelled: 0,
    bounced: 0
  };
  
  const startTime = Date.now();
  const timeSpread = 300000; // Spread events over 5 minutes
  
  // Determine if we're in a burst period (happens randomly based on preset)
  let burstWindowStart = null;
  let burstWindowEnd = null;
  if (Math.random() < activePreset.burstProbability) {
    burstWindowStart = startTime - Math.floor(Math.random() * timeSpread * 0.7);
    burstWindowEnd = burstWindowStart - 60000; // 1 minute burst window
    console.log(`  💥 Burst failure period: ${new Date(burstWindowEnd).toISOString()} - ${new Date(burstWindowStart).toISOString()}`);
  }
  
  // Track retry chains
  const retryChains = new Map();
  
  // Generate events with realistic time distribution
  for (let i = 0; i < numEvents; i++) {
    // Spread events over time (not all at once)
    const eventTime = startTime - Math.floor(Math.random() * timeSpread);
    
    // Check if in burst window
    const inBurst = burstWindowStart && eventTime >= burstWindowEnd && eventTime <= burstWindowStart;
    
    // Decide if this should be part of a retry chain
    let retryChainId = null;
    if (Math.random() < activePreset.retryChainRate) {
      // Create or continue a retry chain
      const chainKey = `chain_${Math.floor(i / 3)}`; // Group in chains of 3
      if (!retryChains.has(chainKey)) {
        retryChainId = `TXN_${eventTime}_${Math.floor(Math.random() * 10000)}`;
        retryChains.set(chainKey, retryChainId);
      } else {
        retryChainId = retryChains.get(chainKey);
      }
    }
    
    const event = generateRandomEvent({
      baseTimestamp: eventTime,
      userId: `user_${Math.floor(Math.random() * 500)}@slaypay.com`,
      introduceBias: true,
      preset: activePreset,
      inBurst: inBurst,
      retryChainId: retryChainId
    });
    
    addEvent(event);
    generatedEvents.push(event);
    
    // Track summary
    if (summary[event.status] !== undefined) {
      summary[event.status]++;
    }
  }
  
  console.log(`✓ Generated ${numEvents} events`);
  console.log(`  Success: ${summary.success} (${Math.round(summary.success/numEvents*100)}%)`);
  console.log(`  Failure: ${summary.failure} (${Math.round(summary.failure/numEvents*100)}%)`);
  console.log(`  Retried: ${summary.retried} (${Math.round(summary.retried/numEvents*100)}%)`);
  console.log(`  Cancelled: ${summary.cancelled} (${Math.round(summary.cancelled/numEvents*100)}%)`);
  console.log(`  Bounced: ${summary.bounced} (${Math.round(summary.bounced/numEvents*100)}%)`);

  res.json({
    success: true,
    generated: generatedEvents.length,
    preset: activePreset.name,
    summary: summary,
    events: generatedEvents.slice(0, 10) // Only return first 10 for response size
  });
});

// POST /payments/event - Single payment event
app.post('/payments/event', (req, res) => {
  const event = req.body;
  
  // Validate required fields
  const required = ['transaction_id', 'amount', 'bank', 'method', 'status'];
  const missing = required.filter(field => !event[field]);
  
  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missing.join(', ')}`
    });
  }

  addEvent(event);

  res.json({
    success: true,
    event: event
  });
});

// GET /payments/recent - Latest transactions
app.get('/payments/recent', (req, res) => {
  const { limit = 50 } = req.query;
  const numLimit = Math.min(parseInt(limit), MAX_EVENTS);
  
  res.json({
    success: true,
    count: events.length,
    events: events.slice(0, numLimit)
  });
});

// GET /metrics/summary - Aggregated stats
app.get('/metrics/summary', (req, res) => {
  const successRate = metrics.totalTransactions > 0 
    ? ((metrics.successCount / metrics.totalTransactions) * 100).toFixed(2)
    : 0;

  const failureRate = metrics.totalTransactions > 0 
    ? ((metrics.failureCount / metrics.totalTransactions) * 100).toFixed(2)
    : 0;

  const avgLatency = metrics.totalTransactions > 0
    ? Math.round(metrics.totalLatency / metrics.totalTransactions)
    : 0;

  // Calculate per-bank stats
  const bankMetrics = Object.entries(metrics.bankStats).map(([bank, stats]) => ({
    bank,
    total: stats.total,
    successRate: ((stats.success / stats.total) * 100).toFixed(2),
    failureRate: ((stats.failure / stats.total) * 100).toFixed(2),
    avgLatency: Math.round(stats.totalLatency / stats.total)
  }));

  // Calculate per-method stats
  const methodMetrics = Object.entries(metrics.methodStats).map(([method, stats]) => ({
    method,
    total: stats.total,
    successRate: ((stats.success / stats.total) * 100).toFixed(2),
    failureRate: ((stats.failure / stats.total) * 100).toFixed(2),
    avgLatency: Math.round(stats.totalLatency / stats.total)
  }));

  res.json({
    success: true,
    metrics: {
      totalTransactions: metrics.totalTransactions,
      successCount: metrics.successCount,
      failureCount: metrics.failureCount,
      successRate: `${successRate}%`,
      failureRate: `${failureRate}%`,
      avgLatency: `${avgLatency}ms`,
      byBank: bankMetrics,
      byMethod: methodMetrics,
      topErrors: Object.entries(metrics.errorCodes)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([code, count]) => ({ code, count }))
    }
  });
});

// GET /events - Raw event list (for agent consumption)
app.get('/events', (req, res) => {
  const { since } = req.query;
  
  let filteredEvents = events;
  if (since) {
    const sinceDate = new Date(since);
    filteredEvents = events.filter(e => new Date(e.timestamp) > sinceDate);
  }

  res.json({
    success: true,
    count: filteredEvents.length,
    events: filteredEvents
  });
});

// ============================================================================
// AGENT PROXY ROUTES (pass-through to AI agent)
// ============================================================================

const AGENT_URL = 'http://localhost:3002';

app.get('/agent/insights', async (req, res) => {
  try {
    const response = await fetch(`${AGENT_URL}/agent/insights`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching agent insights:', error.message);
    res.json({
      success: false,
      error: 'Agent service unavailable',
      insights: []
    });
  }
});

app.get('/agent/status', async (req, res) => {
  try {
    const response = await fetch(`${AGENT_URL}/agent/status`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching agent status:', error.message);
    res.json({
      success: false,
      error: 'Agent service unavailable',
      status: { running: false }
    });
  }
});

app.get('/agent/decisions', async (req, res) => {
  try {
    const response = await fetch(`${AGENT_URL}/agent/decisions`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching agent decisions:', error.message);
    res.json({
      success: false,
      error: 'Agent service unavailable',
      decisions: []
    });
  }
});

app.get('/agent/workflow_state', async (req, res) => {
  try {
    const response = await fetch(`${AGENT_URL}/agent/workflow_state`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching agent workflow state:', error.message);
    res.json({
      success: false,
      error: 'Agent service unavailable',
      workflow: {}
    });
  }
});

// ============================================================================
// WEBSOCKET HANDLING
// ============================================================================

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');

  ws.send(JSON.stringify({
    type: 'connection',
    message: 'Connected to SlayPay event stream',
    timestamp: new Date().toISOString()
  }));

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// ============================================================================
// START SERVER
// ============================================================================

server.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 SlayPay Backend Server Running                      ║
║                                                           ║
║   HTTP API: http://localhost:${PORT}                        ║
║   WebSocket: ws://localhost:${PORT}                         ║
║                                                           ║
║   Ready to accept payment events!                        ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Auto-generate sample data on startup (optional)
setTimeout(() => {
  console.log('Generating initial sample data...');
  for (let i = 0; i < 20; i++) {
    addEvent(generateRandomEvent());
  }
  console.log('✓ Generated 20 sample transactions');
}, 1000);
