import { useState, useEffect } from 'react'
import './App.css'
import './workflow-styles.css'

const BACKEND_URL = 'http://localhost:3001'
const AGENT_URL = 'http://localhost:3002'

function App() {
  const [activeNav, setActiveNav] = useState('overview')
  const [streamPaused, setStreamPaused] = useState(false)
  const [expandedEvent, setExpandedEvent] = useState(null)
  
  // Real data from backend
  const [events, setEvents] = useState([])
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  
  // Agent data from backend/agent
  const [agentInsights, setAgentInsights] = useState([])
  const [agentStatus, setAgentStatus] = useState(null)
  const [agentLoading, setAgentLoading] = useState(true)
  
  // Workflow viewer state
  const [workflowViewerOpen, setWorkflowViewerOpen] = useState(false)
  const [workflowState, setWorkflowState] = useState(null)
  
  // Historical data for mini-charts (last 20 data points)
  const [historyData, setHistoryData] = useState({
    totalPayments: [],
    successRate: [],
    failureRate: [],
    avgLatency: [],
    activeIncidents: []
  })
  
  // Incidents state (keeping this for now as it's UI-only)
  const [incidents, setIncidents] = useState([
    {
      id: 'INC_001',
      severity: 'high',
      title: 'HDFC UPI Failure Spike',
      timestamp: '14:15:23',
      status: 'investigating',
      affectedPayments: 147,
      expanded: false,
      timeline: [
        { time: '14:15:23', event: 'Incident detected by anomaly detector' },
        { time: '14:16:45', event: 'Agent escalated to on-call engineer' },
        { time: '14:18:12', event: 'Investigation started - bank API issues suspected' }
      ]
    },
    {
      id: 'INC_002',
      severity: 'medium',
      title: 'Increased latency on ICICI Netbanking',
      timestamp: '13:42:10',
      status: 'resolved',
      affectedPayments: 89,
      expanded: false,
      timeline: [
        { time: '13:42:10', event: 'Latency spike detected (avg 450ms)' },
        { time: '13:43:30', event: 'Auto-scaled payment workers by 2x' },
        { time: '13:48:15', event: 'Latency normalized - incident resolved' }
      ]
    },
    {
      id: 'INC_003',
      severity: 'low',
      title: 'Kotak Card payment success rate dip',
      timestamp: '12:30:05',
      status: 'monitoring',
      affectedPayments: 23,
      expanded: false,
      timeline: [
        { time: '12:30:05', event: 'Success rate dropped to 96.2%' },
        { time: '12:35:20', event: 'Monitoring for trend - no action needed yet' }
      ]
    }
  ])

  // Fetch data from backend
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/metrics/summary`)
      const data = await response.json()
      if (data.success) {
        setMetrics(data.metrics)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/payments/recent?limit=50`)
      const data = await response.json()
      if (data.success) {
        setEvents(data.events)
      }
    } catch (error) {
      console.error('Failed to fetch events:', error)
    }
  }

  const fetchAll = async () => {
    setLoading(true)
    await Promise.all([fetchMetrics(), fetchEvents(), fetchAgentData()])
    setLoading(false)
  }

  // Fetch agent insights and status
  const fetchAgentData = async () => {
    try {
      setAgentLoading(true)
      
      // Fetch insights
      const insightsResponse = await fetch(`${BACKEND_URL}/agent/insights`)
      if (insightsResponse.ok) {
        const insightsData = await insightsResponse.json()
        if (insightsData.success) {
          setAgentInsights(insightsData.insights || [])
        }
      }
      
      // Fetch status
      const statusResponse = await fetch(`${BACKEND_URL}/agent/status`)
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        if (statusData.success) {
          setAgentStatus(statusData.status)
        }
      }
      
      // Fetch workflow state if viewer is open
      if (workflowViewerOpen) {
        const workflowResponse = await fetch(`${BACKEND_URL}/agent/workflow_state`)
        if (workflowResponse.ok) {
          const workflowData = await workflowResponse.json()
          if (workflowData.success) {
            setWorkflowState(workflowData.workflow)
          }
        }
      }
      
      setAgentLoading(false)
    } catch (error) {
      console.error('Failed to fetch agent data:', error)
      setAgentLoading(false)
    }
  }

  // Poll backend every 3 seconds
  useEffect(() => {
    fetchAll()
    const interval = setInterval(() => {
      if (!streamPaused) {
        fetchAll()
      }
    }, 3000)
    return () => clearInterval(interval)
  }, [streamPaused, workflowViewerOpen])
  
  // Update historical data when metrics change
  useEffect(() => {
    if (metrics) {
      setHistoryData(prev => ({
        totalPayments: [...prev.totalPayments, metrics.totalTransactions].slice(-20),
        successRate: [...prev.successRate, parseFloat(metrics.successRate)].slice(-20),
        failureRate: [...prev.failureRate, parseFloat(metrics.failureRate)].slice(-20),
        avgLatency: [...prev.avgLatency, parseInt(metrics.avgLatency)].slice(-20),
        activeIncidents: [...prev.activeIncidents, 2].slice(-20)
      }))
    }
  }, [metrics])

  // Compute KPIs from real metrics
  const getKPIs = () => {
    if (!metrics) {
      return [
        { label: 'Total Payments', value: '-', trend: '-', status: 'good' },
        { label: 'Success Rate', value: '-', trend: '-', status: 'good' },
        { label: 'Failure Rate', value: '-', trend: '-', status: 'warning' },
        { label: 'Avg Latency', value: '-', trend: '-', status: 'warning' },
        { label: 'Active Incidents', value: '2', trend: '-', status: 'error' }
      ]
    }

    const successRate = parseFloat(metrics.successRate)
    const failureRate = parseFloat(metrics.failureRate)
    const avgLatency = parseInt(metrics.avgLatency)

    return [
      { 
        label: 'Total Payments', 
        value: metrics.totalTransactions.toLocaleString(), 
        trend: `${metrics.totalTransactions} total`, 
        status: 'good' 
      },
      { 
        label: 'Success Rate', 
        value: metrics.successRate, 
        trend: `${metrics.successCount} succeeded`, 
        status: successRate >= 95 ? 'good' : successRate >= 90 ? 'warning' : 'error' 
      },
      { 
        label: 'Failure Rate', 
        value: metrics.failureRate, 
        trend: `${metrics.failureCount} failed`, 
        status: failureRate <= 2 ? 'good' : failureRate <= 5 ? 'warning' : 'error' 
      },
      { 
        label: 'Avg Latency', 
        value: metrics.avgLatency, 
        trend: avgLatency < 300 ? 'Fast' : avgLatency < 500 ? 'Moderate' : 'Slow', 
        status: avgLatency < 300 ? 'good' : avgLatency < 500 ? 'warning' : 'error' 
      },
      { 
        label: 'Active Incidents', 
        value: '2', 
        trend: 'Manual tracking', 
        status: 'error' 
      }
    ]
  }

  // Compute chart data from real metrics
  const getFailureByBank = () => {
    if (!metrics || !metrics.byBank) return []
    return metrics.byBank.map(bank => ({
      name: bank.bank,
      value: parseFloat(bank.failureRate)
    }))
  }

  const getFailureByMethod = () => {
    if (!metrics || !metrics.byMethod) return []
    return metrics.byMethod.map(method => ({
      name: method.method,
      value: parseFloat(method.failureRate)
    }))
  }

  const getLatencyByBank = () => {
    if (!metrics || !metrics.byBank) return []
    return metrics.byBank.map(bank => ({
      name: bank.bank,
      value: bank.avgLatency
    }))
  }

  const getLatencyByMethod = () => {
    if (!metrics || !metrics.byMethod) return []
    return metrics.byMethod.map(method => ({
      name: method.method,
      value: method.avgLatency
    }))
  }

  const kpis = getKPIs()
  const failureByBank = getFailureByBank()
  const failureByMethod = getFailureByMethod()
  const latencyByBank = getLatencyByBank()
  const latencyByMethod = getLatencyByMethod()

  const toggleIncident = (id) => {
    setIncidents(incidents.map(inc => 
      inc.id === id ? { ...inc, expanded: !inc.expanded } : inc
    ))
  }
  
  // Render mini sparkline chart
  const renderMiniChart = (data, color = '#10b981') => {
    if (!data || data.length === 0) return null
    
    const max = Math.max(...data, 1)
    const min = Math.min(...data, 0)
    const range = max - min || 1
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1 || 1)) * 100
      const y = 100 - ((value - min) / range) * 100
      return `${x},${y}`
    }).join(' ')
    
    return (
      <svg className="mini-chart" viewBox="0 0 100 30" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    )
  }

  return (
    <div className="app">
      {/* SIDEBAR */}
      <div className="sidebar">
        <div className="logo">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <rect width="40" height="40" rx="8" fill="#c91219"/>
            <path d="M12 20 L20 12 L28 20 L20 28 Z" fill="#d4a017"/>
          </svg>
          <span>SlayPay</span>
        </div>

        <div className="nav-section">
          <div 
            className={`nav-item ${activeNav === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveNav('overview')}
          >
            <svg viewBox="0 0 24 24">
              <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" fill="currentColor"/>
            </svg>
            <span>Overview</span>
          </div>
          <div 
            className={`nav-item ${activeNav === 'live-payments' ? 'active' : ''}`}
            onClick={() => setActiveNav('live-payments')}
          >
            <svg viewBox="0 0 24 24">
              <path d="M13 2.05v2.02c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93v2.02c5.05-.5 9-4.76 9-9.95s-3.95-9.45-9-9.95zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" fill="currentColor"/>
            </svg>
            <span>Live Payments</span>
          </div>
          <div 
            className={`nav-item ${activeNav === 'failures' ? 'active' : ''}`}
            onClick={() => setActiveNav('failures')}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 5.99L19.53 19H4.47L12 5.99M12 2L1 21h22L12 2zm1 14h-2v2h2v-2zm0-6h-2v4h2v-4z" fill="currentColor"/>
            </svg>
            <span>Failures & Anomalies</span>
          </div>
          <div 
            className={`nav-item ${activeNav === 'agent-activity' ? 'active' : ''}`}
            onClick={() => setActiveNav('agent-activity')}
          >
            <svg viewBox="0 0 24 24">
              <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zm-2 10H6V7h12v12z" fill="currentColor"/>
            </svg>
            <span>Agent Activity</span>
          </div>
          <div 
            className={`nav-item ${activeNav === 'system-logs' ? 'active' : ''}`}
            onClick={() => setActiveNav('system-logs')}
          >
            <svg viewBox="0 0 24 24">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/>
            </svg>
            <span>System Logs</span>
          </div>
        </div>

        <div className="sidebar-footer">
          <div 
            className={`nav-item ${activeNav === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveNav('settings')}
          >
            <svg viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>
            </svg>
            <span>Settings</span>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="main-content">
        {/* TOP BAR */}
        <div className="top-bar">
          <div className="top-left">
            <div className="mode-toggle">
              <div className="green-dot"></div>
              <span>Live Mode</span>
            </div>
          </div>
          <div className="top-right">
            <button className="icon-btn">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" fill="currentColor"/>
              </svg>
            </button>
            <button className="icon-btn">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z" fill="currentColor"/>
              </svg>
            </button>
            <button className="icon-btn">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
              </svg>
            </button>
            <button className="icon-btn profile">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

       
        {/* OVERVIEW PAGE */}
        {activeNav === 'overview' && (
          <>
            <div className="overview-header">
              <div className="overview-title">
                <h2>System Health Overview</h2>
                <div className="last-updated">
                  <span>🔄</span>
                  <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
                </div>
              </div>
              <button className="refresh-btn" onClick={fetchAll}>Refresh</button>
            </div>

            {/* SECTION 1: KPI Cards */}
            <div className="kpi-grid">
              {kpis.map((kpi, index) => (
                <div key={index} className={`kpi-card ${kpi.status}`}>
                  <div className="kpi-header">
                    <div className="kpi-label">{kpi.label}</div>
                    <div className={`kpi-status-dot ${kpi.status}`}></div>
                  </div>
                  <div className="kpi-value">{kpi.value}</div>
                  <div className="kpi-trend">{kpi.trend}</div>
                </div>
              ))}
            </div>
            
            {/* SECTION 2: Metric Trend Charts (2x2 Grid) */}
            <div className="metric-charts-section">
              <h3 className="section-title">Real-Time Metric Trends</h3>
              <div className="metric-charts-grid">
                {/* Total Payments Chart */}
                <div className="metric-chart-card">
                  <div className="metric-chart-header">
                    <h4>Total Payments</h4>
                    <span className="metric-current">{kpis[0].value}</span>
                  </div>
                  <div className="metric-chart-body">
                    {historyData.totalPayments.length > 0 ? (
                      <svg className="metric-chart" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="gradient-payments" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>
                        {(() => {
                          const data = historyData.totalPayments
                          const max = Math.max(...data, 1)
                          const min = Math.min(...data, 0)
                          const range = max - min || 1
                          const points = data.map((value, index) => {
                            const x = (index / (data.length - 1 || 1)) * 100
                            const y = 40 - ((value - min) / range) * 35
                            return `${x},${y}`
                          }).join(' ')
                          const areaPoints = `0,40 ${points} 100,40`
                          return (
                            <>
                              <polygon points={areaPoints} fill="url(#gradient-payments)" />
                              <polyline points={points} fill="none" stroke="#10b981" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            </>
                          )
                        })()}
                      </svg>
                    ) : (
                      <div className="metric-chart-empty">Collecting data...</div>
                    )}
                  </div>
                </div>
                
                {/* Success Rate Chart */}
                <div className="metric-chart-card">
                  <div className="metric-chart-header">
                    <h4>Success Rate</h4>
                    <span className="metric-current">{kpis[1].value}</span>
                  </div>
                  <div className="metric-chart-body">
                    {historyData.successRate.length > 0 ? (
                      <svg className="metric-chart" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="gradient-success" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>
                        {(() => {
                          const data = historyData.successRate
                          const max = 100
                          const min = Math.min(...data, 0)
                          const range = max - min || 1
                          const points = data.map((value, index) => {
                            const x = (index / (data.length - 1 || 1)) * 100
                            const y = 40 - ((value - min) / range) * 35
                            return `${x},${y}`
                          }).join(' ')
                          const areaPoints = `0,40 ${points} 100,40`
                          const color = kpis[1].status === 'good' ? '#10b981' : kpis[1].status === 'warning' ? '#f59e0b' : '#ff0040'
                          return (
                            <>
                              <polygon points={areaPoints} fill={`url(#gradient-success)`} />
                              <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            </>
                          )
                        })()}
                      </svg>
                    ) : (
                      <div className="metric-chart-empty">Collecting data...</div>
                    )}
                  </div>
                </div>
                
                {/* Failure Rate Chart */}
                <div className="metric-chart-card">
                  <div className="metric-chart-header">
                    <h4>Failure Rate</h4>
                    <span className="metric-current">{kpis[2].value}</span>
                  </div>
                  <div className="metric-chart-body">
                    {historyData.failureRate.length > 0 ? (
                      <svg className="metric-chart" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="gradient-failure" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#ff0040" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#ff0040" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>
                        {(() => {
                          const data = historyData.failureRate
                          const max = Math.max(...data, 10)
                          const min = 0
                          const range = max - min || 1
                          const points = data.map((value, index) => {
                            const x = (index / (data.length - 1 || 1)) * 100
                            const y = 40 - ((value - min) / range) * 35
                            return `${x},${y}`
                          }).join(' ')
                          const areaPoints = `0,40 ${points} 100,40`
                          return (
                            <>
                              <polygon points={areaPoints} fill="url(#gradient-failure)" />
                              <polyline points={points} fill="none" stroke="#ff0040" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            </>
                          )
                        })()}
                      </svg>
                    ) : (
                      <div className="metric-chart-empty">Collecting data...</div>
                    )}
                  </div>
                </div>
                
                {/* Avg Latency Chart */}
                <div className="metric-chart-card">
                  <div className="metric-chart-header">
                    <h4>Average Latency</h4>
                    <span className="metric-current">{kpis[3].value}</span>
                  </div>
                  <div className="metric-chart-body">
                    {historyData.avgLatency.length > 0 ? (
                      <svg className="metric-chart" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="gradient-latency" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.05" />
                          </linearGradient>
                        </defs>
                        {(() => {
                          const data = historyData.avgLatency
                          const max = Math.max(...data, 500)
                          const min = Math.min(...data, 0)
                          const range = max - min || 1
                          const points = data.map((value, index) => {
                            const x = (index / (data.length - 1 || 1)) * 100
                            const y = 40 - ((value - min) / range) * 35
                            return `${x},${y}`
                          }).join(' ')
                          const areaPoints = `0,40 ${points} 100,40`
                          const color = kpis[3].status === 'good' ? '#10b981' : kpis[3].status === 'warning' ? '#f59e0b' : '#ff0040'
                          return (
                            <>
                              <polygon points={areaPoints} fill="url(#gradient-latency)" />
                              <polyline points={points} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                            </>
                          )
                        })()}
                      </svg>
                    ) : (
                      <div className="metric-chart-empty">Collecting data...</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* FAILURES & ANOMALIES PAGE */}
        {activeNav === 'failures' && (
          <>
            <div className="overview-header">
              <div className="overview-title">
                <h2>Failure & Latency Analysis</h2>
              </div>
              <button className="refresh-btn" onClick={fetchAll}>Refresh</button>
            </div>

            {/* SECTION 2: Failure & Latency Breakdown Charts */}
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                Loading analytics...
              </div>
            ) : !metrics || !metrics.byBank || metrics.byBank.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                No data available. Generate payments to see analytics.
              </div>
            ) : (
              <div className="charts-section">
                <div className="charts-grid">
                  {/* Failure by Bank */}
                  <div className="chart-container">
                    <div className="chart-header">
                      <h4>Failure Rate by Bank</h4>
                      <span className="chart-unit">%</span>
                    </div>
                    <div className="chart-bars">
                      {failureByBank.map((item) => (
                        <div key={item.name} className="bar-row">
                          <span className="bar-label">{item.name}</span>
                          <div className="bar-track">
                            <div 
                              className="bar-fill failure" 
                              style={{ width: `${Math.min(item.value, 100)}%` }}
                            ></div>
                          </div>
                          <span className="bar-value">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Failure by Method */}
                  <div className="chart-container">
                    <div className="chart-header">
                      <h4>Failure Rate by Method</h4>
                      <span className="chart-unit">%</span>
                    </div>
                    <div className="chart-bars">
                      {failureByMethod.map((item) => (
                        <div key={item.name} className="bar-row">
                          <span className="bar-label">{item.name}</span>
                          <div className="bar-track">
                            <div 
                              className="bar-fill failure" 
                              style={{ width: `${Math.min(item.value, 100)}%` }}
                            ></div>
                          </div>
                          <span className="bar-value">{item.value}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Latency by Bank */}
                  <div className="chart-container">
                    <div className="chart-header">
                      <h4>Avg Latency by Bank</h4>
                      <span className="chart-unit">ms</span>
                    </div>
                    <div className="chart-bars">
                      {latencyByBank.map((item) => (
                        <div key={item.name} className="bar-row">
                          <span className="bar-label">{item.name}</span>
                          <div className="bar-track">
                            <div 
                              className="bar-fill latency" 
                              style={{ width: `${Math.min((item.value / 1000) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="bar-value">{item.value}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Latency by Method */}
                  <div className="chart-container">
                    <div className="chart-header">
                      <h4>Avg Latency by Method</h4>
                      <span className="chart-unit">ms</span>
                    </div>
                    <div className="chart-bars">
                      {latencyByMethod.map((item) => (
                        <div key={item.name} className="bar-row">
                          <span className="bar-label">{item.name}</span>
                          <div className="bar-track">
                            <div 
                              className="bar-fill latency" 
                              style={{ width: `${Math.min((item.value / 1000) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <span className="bar-value">{item.value}ms</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* LIVE PAYMENTS PAGE */}
        {activeNav === 'live-payments' && (
          <>
            <div className="overview-header">
              <div className="overview-title">
                <h2>Live Payment Monitoring</h2>
              </div>
              <button className="refresh-btn" onClick={fetchAll}>Refresh</button>
            </div>

            {/* Live Event Stream */}
            <div className="event-stream-section">
              <div className="stream-header">
                <h3 className="section-title">Real-time Payment Events</h3>
                <div className="stream-controls">
                  <div className="stream-status">
                    {!streamPaused && <div className="pulse-dot"></div>}
                    <span>{streamPaused ? 'Paused' : 'Live'}</span>
                  </div>
                  <button 
                    className={`stream-btn ${streamPaused ? 'paused' : 'live'}`}
                    onClick={() => setStreamPaused(!streamPaused)}
                  >
                    {streamPaused ? '▶ Resume' : '⏸ Pause'}
                  </button>
                </div>
              </div>
              {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  Loading events...
                </div>
              ) : events.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  No payment events yet. Generate payments from the merchant portal.
                </div>
              ) : (
                <div className="event-table">
                  <div className="event-table-header">
                    <span>TXN ID</span>
                    <span>Timestamp</span>
                    <span>Bank</span>
                    <span>Method</span>
                    <span>Status</span>
                    <span>Latency</span>
                    <span>Error Code</span>
                  </div>
                  <div className="event-table-body">
                    {events.map((event) => (
                      <div key={event.transaction_id}>
                        <div 
                          className="event-row"
                          onClick={() => setExpandedEvent(expandedEvent === event.transaction_id ? null : event.transaction_id)}
                        >
                          <div className="event-col">
                            <span className="event-id">{event.transaction_id}</span>
                          </div>
                          <div className="event-col">{new Date(event.timestamp).toLocaleTimeString()}</div>
                          <div className="event-col">{event.bank}</div>
                          <div className="event-col">{event.method}</div>
                          <div className="event-col">
                            <span className={`event-status ${event.status}`}>{event.status}</span>
                          </div>
                          <div className="event-col">{event.latency}ms</div>
                          <div className="event-col">{event.error_code || '-'}</div>
                        </div>
                        {expandedEvent === event.transaction_id && (
                          <div className="event-details">
                            <div className="detail-row">
                              <strong>Full Event Data</strong>
                              <pre>{JSON.stringify(event, null, 2)}</pre>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* AGENT ACTIVITY PAGE */}
        {activeNav === 'agent-activity' && (
          <>
            <div className="overview-header">
              <div className="overview-title">
                <h2>AI Agent Activity Log</h2>
                <div className="last-updated">
                  <span>🤖</span>
                  <span>Automated Decision Engine</span>
                </div>
              </div>
              <button className="refresh-btn" onClick={fetchAll}>Refresh</button>
            </div>

            {/* Agent Decisions */}
            <div className="agent-activity-section">
              <h3 className="section-title">Recent Agent Decisions & Actions</h3>
              
              {/* Agent Status Banner */}
              {agentStatus && (
                <div style={{ 
                  padding: '16px', 
                  marginBottom: '20px', 
                  background: agentStatus.running ? '#d1fae5' : '#fef3c7', 
                  border: `1px solid ${agentStatus.running ? '#10b981' : '#fbbf24'}`, 
                  borderRadius: '8px', 
                  color: agentStatus.running ? '#065f46' : '#78350f' 
                }}>
                  {agentStatus.running ? '✅' : '⏸️'} Agent {agentStatus.running ? 'Running' : 'Stopped'} 
                  {agentStatus.last_run && ` • Last analysis: ${new Date(agentStatus.last_run).toLocaleTimeString()}`}
                  {agentStatus.total_runs && ` • Total cycles: ${agentStatus.total_runs}`}
                </div>
              )}
              
              {/* Loading State */}
              {agentLoading && agentInsights.length === 0 && (
                <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</div>
                  <div>Loading agent insights...</div>
                </div>
              )}
              
              {/* No Insights */}
              {!agentLoading && agentInsights.length === 0 && (
                <div className="decision-card medium">
                  <div className="decision-header">
                    <span className="decision-timestamp">No issues detected</span>
                    <div className="decision-badges">
                      <span className="risk-badge low">ALL CLEAR</span>
                    </div>
                  </div>
                  <div className="decision-content">
                    <div className="decision-row">
                      <span className="decision-text">
                        {agentStatus?.running 
                          ? "The AI agent is actively monitoring payment events. All systems operating normally."
                          : "Agent service is not running. Start the agent to enable automatic anomaly detection."}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Agent Insights */}
              {agentInsights.length > 0 && (
                <div className="decision-cards">
                  {agentInsights.map((insight, index) => (
                    <div key={insight.decision_id || index} className={`decision-card ${insight.severity?.toLowerCase() || insight.risk_level}`}>
                      <div className="decision-header">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span className="decision-timestamp">
                            {insight.timestamp ? new Date(insight.timestamp).toLocaleTimeString() : 'Now'}
                          </span>
                          {insight.persistence_status && (
                            <span style={{
                              fontSize: '11px',
                              color: insight.persistence_status === 'NEW' ? '#10b981' : insight.persistence_status === 'ONGOING' ? '#dc2626' : '#f59e0b',
                              fontWeight: '600'
                            }}>
                              {insight.persistence_status === 'NEW' && '🆕 New Issue'}
                              {insight.persistence_status === 'ONGOING' && '⚠️ Ongoing Issue'}
                              {insight.persistence_status === 'RECURRING' && '🔄 Recurring Issue'}
                            </span>
                          )}
                          {insight.first_detected && insight.persistence_status !== 'NEW' && (
                            <span style={{ fontSize: '10px', color: '#9ca3af' }}>
                              First detected: {new Date(insight.first_detected).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        <div className="decision-badges">
                          <span className={`risk-badge ${insight.severity?.toLowerCase() || 'medium'}`} style={{
                            background: insight.severity === 'HIGH' ? '#dc2626' : insight.severity === 'MEDIUM' ? '#f59e0b' : '#10b981',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: '700'
                          }}>
                            {insight.severity || 'MEDIUM'}
                          </span>
                          <span className="confidence-badge">
                            {Math.round(insight.confidence * 100)}% confidence
                          </span>
                        </div>
                      </div>
                      
                      <div className="decision-content">
                        <div className="decision-row">
                          <span className="decision-label">Issue Type:</span>
                          <span className="decision-text">
                            <strong>{insight.issue_type.replace(/_/g, ' ')}</strong> — {insight.scope}
                          </span>
                        </div>
                        
                        {insight.evidence && Object.keys(insight.evidence).length > 0 && (
                          <div className="decision-row">
                            <span className="decision-label">Evidence:</span>
                            <div className="decision-text">
                              {Object.entries(insight.evidence).map(([key, value]) => (
                                <div key={key} style={{ marginBottom: '4px' }}>
                                  <strong>{key.replace(/_/g, ' ')}:</strong> {value}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="decision-row">
                          <span className="decision-label">Explanation:</span>
                          <span className="decision-text">{insight.explanation}</span>
                        </div>
                        
                        <div className="decision-row">
                          <span className="decision-label">Recommended Action:</span>
                          <span className="decision-text">
                            <strong>{insight.recommended_action}</strong>
                            {insight.auto_executed && (
                              <span style={{ 
                                marginLeft: '8px', 
                                padding: '2px 8px', 
                                background: '#10b981', 
                                color: 'white', 
                                borderRadius: '4px', 
                                fontSize: '11px' 
                              }}>
                                AUTO-EXECUTED
                              </span>
                            )}
                            {!insight.auto_executed && (
                              <span style={{ 
                                marginLeft: '8px', 
                                padding: '2px 8px', 
                                background: '#6b7280', 
                                color: 'white', 
                                borderRadius: '4px', 
                                fontSize: '11px' 
                              }}>
                                SIMULATED
                              </span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Related Incidents */}
            <div className="incident-timeline-section">
              <h3 className="section-title">Related Incidents</h3>
              <div className="timeline-container">
                {incidents.map((incident) => (
                  <div key={incident.id} className={`incident-card ${incident.severity}`}>
                    <div 
                      className="incident-header"
                      onClick={() => toggleIncident(incident.id)}
                    >
                      <div className="incident-left">
                        <span className={`severity-badge ${incident.severity}`}>
                          {incident.severity.toUpperCase()}
                        </span>
                        <span className="incident-time">{incident.timestamp}</span>
                        <span className="incident-affected">{incident.title}</span>
                      </div>
                      <div className="incident-right">
                        <span className={`incident-status ${incident.status}`}>
                          {incident.status}
                        </span>
                        <button className="expand-incident-btn">
                          {incident.expanded ? '▼' : '▶'}
                        </button>
                      </div>
                    </div>
                    {incident.expanded && (
                      <div className="incident-details-expanded">
                        <div className="incident-detail-row">
                          <strong>Affected Payments</strong>
                          <p>{incident.affectedPayments} transactions impacted</p>
                        </div>
                        <div className="incident-detail-row">
                          <strong>Timeline</strong>
                          {incident.timeline.map((entry, idx) => (
                            <p key={idx}>
                              <strong style={{color: '#6b7280', fontSize: '13px'}}>{entry.time}</strong> - {entry.event}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* SYSTEM LOGS PAGE */}
        {activeNav === 'system-logs' && (
          <>
            <div className="overview-header">
              <div className="overview-title">
                <h2>System Event Logs</h2>
              </div>
              <button className="refresh-btn" onClick={fetchAll}>Refresh</button>
            </div>

            {/* System Logs Table */}
            <div className="event-stream-section">
              <div className="stream-header">
                <h3 className="section-title">System Events & Activity</h3>
                <div className="stream-controls">
                  <div className="stream-status">
                    <div className="pulse-dot"></div>
                    <span>Live</span>
                  </div>
                </div>
              </div>
              <div className="event-table">
                <div className="event-table-header">
                  <span>Event ID</span>
                  <span>Timestamp</span>
                  <span>Type</span>
                  <span>Component</span>
                  <span>Severity</span>
                  <span>Message</span>
                  <span>Details</span>
                </div>
                <div className="event-table-body">
                  <div className="event-row">
                    <div className="event-col">
                      <span className="event-id">SYS_001</span>
                    </div>
                    <div className="event-col">14:35:12</div>
                    <div className="event-col">API</div>
                    <div className="event-col">Payment Gateway</div>
                    <div className="event-col">
                      <span className="event-status success">info</span>
                    </div>
                    <div className="event-col">API health check passed</div>
                    <div className="event-col">-</div>
                  </div>
                  <div className="event-row">
                    <div className="event-col">
                      <span className="event-id">SYS_002</span>
                    </div>
                    <div className="event-col">14:33:45</div>
                    <div className="event-col">Database</div>
                    <div className="event-col">Connection Pool</div>
                    <div className="event-col">
                      <span className="event-status failure">warning</span>
                    </div>
                    <div className="event-col">Connection pool at 85% capacity</div>
                    <div className="event-col">Auto-scaling triggered</div>
                  </div>
                  <div className="event-row">
                    <div className="event-col">
                      <span className="event-id">SYS_003</span>
                    </div>
                    <div className="event-col">14:32:18</div>
                    <div className="event-col">Security</div>
                    <div className="event-col">Authentication</div>
                    <div className="event-col">
                      <span className="event-status success">info</span>
                    </div>
                    <div className="event-col">API key rotated successfully</div>
                    <div className="event-col">-</div>
                  </div>
                  <div className="event-row">
                    <div className="event-col">
                      <span className="event-id">SYS_004</span>
                    </div>
                    <div className="event-col">14:30:55</div>
                    <div className="event-col">Worker</div>
                    <div className="event-col">Payment Processor</div>
                    <div className="event-col">
                      <span className="event-status success">info</span>
                    </div>
                    <div className="event-col">Worker scaled up: 10 → 15 instances</div>
                    <div className="event-col">Load increased 40%</div>
                  </div>
                  <div className="event-row">
                    <div className="event-col">
                      <span className="event-id">SYS_005</span>
                    </div>
                    <div className="event-col">14:28:30</div>
                    <div className="event-col">Cache</div>
                    <div className="event-col">Redis</div>
                    <div className="event-col">
                      <span className="event-status failure">error</span>
                    </div>
                    <div className="event-col">Cache miss rate exceeded threshold</div>
                    <div className="event-col">Warming cache</div>
                  </div>
                  <div className="event-row">
                    <div className="event-col">
                      <span className="event-id">SYS_006</span>
                    </div>
                    <div className="event-col">14:25:15</div>
                    <div className="event-col">Network</div>
                    <div className="event-col">Load Balancer</div>
                    <div className="event-col">
                      <span className="event-status success">info</span>
                    </div>
                    <div className="event-col">Traffic distributed evenly across zones</div>
                    <div className="event-col">-</div>
                  </div>
                  <div className="event-row">
                    <div className="event-col">
                      <span className="event-id">SYS_007</span>
                    </div>
                    <div className="event-col">14:20:08</div>
                    <div className="event-col">Monitoring</div>
                    <div className="event-col">Alert Manager</div>
                    <div className="event-col">
                      <span className="event-status failure">warning</span>
                    </div>
                    <div className="event-col">Latency spike detected on HDFC</div>
                    <div className="event-col">Alert sent to on-call</div>
                  </div>
                  <div className="event-row">
                    <div className="event-col">
                      <span className="event-id">SYS_008</span>
                    </div>
                    <div className="event-col">14:18:42</div>
                    <div className="event-col">Backup</div>
                    <div className="event-col">Data Replication</div>
                    <div className="event-col">
                      <span className="event-status success">info</span>
                    </div>
                    <div className="event-col">Automated backup completed</div>
                    <div className="event-col">2.3GB replicated</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* SETTINGS PAGE */}
        {activeNav === 'settings' && (
          <div className="page-header">
            <h1>Dashboard Settings</h1>
            <p>Coming soon...</p>
          </div>
        )}

      </div>

      {/* WORKFLOW VIEWER BUTTON */}
      <button 
        className="workflow-viewer-btn"
        onClick={() => setWorkflowViewerOpen(!workflowViewerOpen)}
      >
        {workflowViewerOpen ? 'Close Agent Workflow' : 'View Agent Workflow'}
      </button>

      {/* WORKFLOW VIEWER PANEL */}
      {workflowViewerOpen && (
        <div className="workflow-viewer-panel">
          <div className="workflow-viewer-content">
            <div className="workflow-viewer-header">
              <div className="workflow-header-content">
                <h2>Agent Reasoning Pipeline</h2>
                <p>Visual explanation of how the SlayPay AI agent thinks and makes decisions</p>
              </div>
              <button 
                className="workflow-close-btn"
                onClick={() => setWorkflowViewerOpen(false)}
                aria-label="Close workflow viewer"
              >
                ✕
              </button>
            </div>

            <div className="workflow-nodes-container">
              {/* Orchestrator Node */}
              <div className="workflow-orchestrator">
                <div className="workflow-node orchestrator">
                  <div className="node-header">
                    <span className="node-title">Agent Orchestrator</span>
                    <span className="node-file">agent.py</span>
                  </div>
                  <div className="node-desc">
                    Coordinates the entire reasoning pipeline, running every 30 seconds
                  </div>
                </div>
              </div>

              {/* Main Pipeline Nodes */}
              <div className="workflow-pipeline">
                {/* Observe Node */}
                <div className="workflow-node-wrapper">
                  <div className={`workflow-node ${workflowState?.observe?.status || 'idle'}`}>
                    <div className="node-header">
                      <div>
                        <span className="node-title">1. Observe</span>
                        <span className="node-file">observe.py</span>
                      </div>
                      <span className={`status-indicator ${workflowState?.observe?.status || 'idle'}`}>
                        {workflowState?.observe?.status === 'running' && '⚙️'}
                        {workflowState?.observe?.status === 'completed' && '✓'}
                        {workflowState?.observe?.status === 'idle' && '○'}
                        {workflowState?.observe?.status === 'warning' && '⚠️'}
                      </span>
                    </div>
                    <div className="node-desc">
                      The Observe stage continuously pulls recent payment events from the backend, focusing on non-successful transactions such as failures and retries.
                    </div>
                    {workflowState?.observe?.summary && (
                      <div className="node-summary">
                        <strong>Last Run:</strong> {workflowState.observe.summary}
                      </div>
                    )}
                  </div>
                  <div className="connector-line"></div>
                </div>

                {/* Reason Node */}
                <div className="workflow-node-wrapper">
                  <div className={`workflow-node ${workflowState?.reason?.status || 'idle'}`}>
                    <div className="node-header">
                      <div>
                        <span className="node-title">2. Reason</span>
                        <span className="node-file">reason.py</span>
                      </div>
                      <span className={`status-indicator ${workflowState?.reason?.status || 'idle'}`}>
                        {workflowState?.reason?.status === 'running' && '⚙️'}
                        {workflowState?.reason?.status === 'completed' && '✓'}
                        {workflowState?.reason?.status === 'idle' && '○'}
                        {workflowState?.reason?.status === 'warning' && '⚠️'}
                      </span>
                    </div>
                    <div className="node-desc">
                      The Reason stage analyzes structured data to detect anomalies using statistical thresholds, classifying issues by severity (LOW/MEDIUM/HIGH).
                    </div>
                    {workflowState?.reason?.summary && (
                      <div className="node-summary">
                        <strong>Last Run:</strong> {workflowState.reason.summary}
                      </div>
                    )}
                  </div>
                  <div className="connector-line"></div>
                </div>

                {/* Decide Node */}
                <div className="workflow-node-wrapper">
                  <div className={`workflow-node ${workflowState?.decide?.status || 'idle'}`}>
                    <div className="node-header">
                      <div>
                        <span className="node-title">3. Decide</span>
                        <span className="node-file">decide.py</span>
                      </div>
                      <span className={`status-indicator ${workflowState?.decide?.status || 'idle'}`}>
                        {workflowState?.decide?.status === 'running' && '⚙️'}
                        {workflowState?.decide?.status === 'completed' && '✓'}
                        {workflowState?.decide?.status === 'idle' && '○'}
                        {workflowState?.decide?.status === 'warning' && '⚠️'}
                      </span>
                    </div>
                    <div className="node-desc">
                      The Decide stage generates actionable recommendations based on detected anomalies, tracking issue persistence (NEW/RECURRING/ONGOING).
                    </div>
                    {workflowState?.decide?.summary && (
                      <div className="node-summary">
                        <strong>Last Run:</strong> {workflowState.decide.summary}
                      </div>
                    )}
                  </div>
                  <div className="connector-line"></div>
                </div>

                {/* Explain Node */}
                <div className="workflow-node-wrapper">
                  <div className={`workflow-node ${workflowState?.explain?.status || 'idle'}`}>
                    <div className="node-header">
                      <div>
                        <span className="node-title">4. Explain</span>
                        <span className="node-file">explain.py</span>
                      </div>
                      <span className={`status-indicator ${workflowState?.explain?.status || 'idle'}`}>
                        {workflowState?.explain?.status === 'running' && '⚙️'}
                        {workflowState?.explain?.status === 'completed' && '✓'}
                        {workflowState?.explain?.status === 'idle' && '○'}
                        {workflowState?.explain?.status === 'warning' && '⚠️'}
                      </span>
                    </div>
                    <div className="node-desc">
                      The Explain stage formats decisions into human-readable explanations with evidence, reasoning, and recommended actions.
                    </div>
                    {workflowState?.explain?.summary && (
                      <div className="node-summary">
                        <strong>Last Run:</strong> {workflowState.explain.summary}
                      </div>
                    )}
                  </div>
                  <div className="connector-line"></div>
                </div>

                {/* Memory Node */}
                <div className="workflow-node-wrapper">
                  <div className={`workflow-node ${workflowState?.memory?.status || 'idle'}`}>
                    <div className="node-header">
                      <div>
                        <span className="node-title">5. Memory / Learn</span>
                        <span className="node-file">memory.py</span>
                      </div>
                      <span className={`status-indicator ${workflowState?.memory?.status || 'idle'}`}>
                        {workflowState?.memory?.status === 'running' && '⚙️'}
                        {workflowState?.memory?.status === 'completed' && '✓'}
                        {workflowState?.memory?.status === 'idle' && '○'}
                        {workflowState?.memory?.status === 'warning' && '⚠️'}
                      </span>
                    </div>
                    <div className="node-desc">
                      The Memory stage stores decisions and tracks issue history across cycles to detect recurring patterns and measure success rates.
                    </div>
                    {workflowState?.memory?.summary && (
                      <div className="node-summary">
                        <strong>Last Run:</strong> {workflowState.memory.summary}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="workflow-footer">
              <p>
                <strong>This is a read-only explainability view.</strong> It shows how the agent processes data internally.
                The agent runs automatically every 30 seconds, progressing through each stage sequentially.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
