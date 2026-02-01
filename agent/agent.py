"""
SlayPay AI Agent - Main Loop
Orchestrates observation, reasoning, decision-making, and learning
"""

from flask import Flask, jsonify
import threading
import time
from datetime import datetime

# Import agent modules
from observe import fetch_recent_events, fetch_metrics, structure_events
from reason import analyze_all
from decide import generate_decisions
from memory import AgentMemory
from explain import explain_analysis, explain_decision, format_decision_for_dashboard

app = Flask(__name__)

# Global state
agent_status = {
    'running': False,
    'last_run': None,
    'last_analysis': None,
    'total_runs': 0
}

current_decisions = []
memory = AgentMemory()

# Workflow state tracking for explainability
workflow_state = {
    'observe': {
        'status': 'idle',
        'summary': 'Waiting for next cycle',
        'last_updated': None,
        'details': {}
    },
    'reason': {
        'status': 'idle',
        'summary': 'Waiting for data',
        'last_updated': None,
        'details': {}
    },
    'decide': {
        'status': 'idle',
        'summary': 'Waiting for analysis',
        'last_updated': None,
        'details': {}
    },
    'explain': {
        'status': 'idle',
        'summary': 'Waiting for decisions',
        'last_updated': None,
        'details': {}
    },
    'memory': {
        'status': 'idle',
        'summary': 'Waiting for outcome feedback',
        'last_updated': None,
        'details': {}
    }
}

# Agent configuration
AGENT_LOOP_INTERVAL = 30  # seconds

def agent_loop():
    """Main agent loop - runs periodically"""
    global agent_status, current_decisions, workflow_state
    
    print("🤖 Agent loop starting...")
    agent_status['running'] = True
    
    while agent_status['running']:
        try:
            print(f"\n{'='*60}")
            print(f"Agent Cycle #{agent_status['total_runs'] + 1} - {datetime.now().isoformat()}")
            print(f"{'='*60}\n")
            
            # Step 1: Observe - Fetch data from backend
            workflow_state['observe']['status'] = 'running'
            workflow_state['observe']['last_updated'] = datetime.now().isoformat()
            print("📊 Observing payment events...")
            
            events = fetch_recent_events(limit=100)
            structured_data = structure_events(events)
            
            workflow_state['observe']['status'] = 'completed'
            workflow_state['observe']['summary'] = f"Analyzed {structured_data['total']} recent events across {len(structured_data.get('by_bank', {}))} banks and {len(structured_data.get('by_method', {}))} payment methods"
            workflow_state['observe']['details'] = {
                'total_events': structured_data['total'],
                'banks': len(structured_data.get('by_bank', {})),
                'methods': len(structured_data.get('by_method', {})),
                'statuses': structured_data.get('by_status', {})
            }
            print(f"   Analyzed {structured_data['total']} transactions")
            
            # Step 2: Reason - Detect anomalies
            workflow_state['reason']['status'] = 'running'
            workflow_state['reason']['last_updated'] = datetime.now().isoformat()
            print("🧠 Analyzing patterns...")
            
            analysis = analyze_all(structured_data)
            agent_status['last_analysis'] = analysis
            
            workflow_state['reason']['status'] = 'completed'
            anomaly_summary = []
            if analysis.get('bank_anomalies'):
                anomaly_summary.append(f"{len(analysis['bank_anomalies'])} bank issues")
            if analysis.get('method_anomalies'):
                anomaly_summary.append(f"{len(analysis['method_anomalies'])} payment method issues")
            if analysis.get('error_patterns'):
                anomaly_summary.append(f"{len(analysis['error_patterns'])} error patterns")
            
            workflow_state['reason']['summary'] = f"Detected {analysis['total_anomalies']} anomalies: {', '.join(anomaly_summary) if anomaly_summary else 'none'}"
            workflow_state['reason']['details'] = {
                'total_anomalies': analysis['total_anomalies'],
                'bank_anomalies': len(analysis.get('bank_anomalies', [])),
                'method_anomalies': len(analysis.get('method_anomalies', [])),
                'error_patterns': len(analysis.get('error_patterns', []))
            }
            print(f"   Found {analysis['total_anomalies']} anomalies")
            
            # Print analysis summary
            print("\n" + explain_analysis(analysis, structured_data))
            
            # Step 3: Decide - Generate actions with persistence tracking
            workflow_state['decide']['status'] = 'running'
            workflow_state['decide']['last_updated'] = datetime.now().isoformat()
            print("\n💡 Generating decisions...")
            
            decisions = generate_decisions(analysis, memory)
            current_decisions = decisions
            
            workflow_state['decide']['status'] = 'completed'
            high_priority = sum(1 for d in decisions if d.get('severity') == 'HIGH')
            medium_priority = sum(1 for d in decisions if d.get('severity') == 'MEDIUM')
            workflow_state['decide']['summary'] = f"Generated {len(decisions)} recommended actions ({high_priority} high priority, {medium_priority} medium priority)"
            workflow_state['decide']['details'] = {
                'total_decisions': len(decisions),
                'high_priority': high_priority,
                'medium_priority': medium_priority,
                'low_priority': len(decisions) - high_priority - medium_priority
            }
            print(f"   Proposed {len(decisions)} actions")
            
            # Step 4: Explain - Format decisions
            workflow_state['explain']['status'] = 'running'
            workflow_state['explain']['last_updated'] = datetime.now().isoformat()
            
            # Step 5: Remember - Store decisions
            workflow_state['memory']['status'] = 'running'
            workflow_state['memory']['last_updated'] = datetime.now().isoformat()
            
            for decision in decisions:
                memory.record_decision(decision)
                print(f"\n{explain_decision(decision)}")
            
            workflow_state['explain']['status'] = 'completed'
            workflow_state['explain']['summary'] = f"Generated human-readable explanations for {len(decisions)} decisions with evidence and reasoning"
            workflow_state['explain']['details'] = {
                'decisions_explained': len(decisions)
            }
            
            # Cleanup old resolved issues
            memory.cleanup_old_issues(max_age_hours=24)
            
            workflow_state['memory']['status'] = 'completed'
            mem_stats = memory.get_stats()
            workflow_state['memory']['summary'] = f"Stored {len(decisions)} decisions. Tracking {mem_stats.get('active_issues', 0)} active issues across {mem_stats.get('total_decisions', 0)} total decisions"
            workflow_state['memory']['details'] = {
                'total_decisions': mem_stats.get('total_decisions', 0),
                'active_issues': mem_stats.get('active_issues', 0),
                'success_rate': mem_stats.get('success_rate', 0)
            }
            
            # Update status
            agent_status['last_run'] = datetime.now().isoformat()
            agent_status['total_runs'] += 1
            
            print(f"\n✓ Cycle complete. Sleeping for {AGENT_LOOP_INTERVAL}s...\n")
            
            # Reset workflow states to idle for next cycle
            time.sleep(AGENT_LOOP_INTERVAL)
            
            for stage in workflow_state:
                if workflow_state[stage]['status'] == 'completed':
                    workflow_state[stage]['status'] = 'idle'
            
        except Exception as e:
            print(f"❌ Error in agent loop: {e}")
            # Mark current stage as warning
            for stage in workflow_state:
                if workflow_state[stage]['status'] == 'running':
                    workflow_state[stage]['status'] = 'warning'
                    workflow_state[stage]['summary'] = f"Error: {str(e)}"

# ============================================================================
# API ROUTES (for ops dashboard to query agent)
# ============================================================================

@app.route('/agent/status', methods=['GET'])
def get_status():
    """Get current agent status"""
    return jsonify({
        'success': True,
        'status': {
            'running': agent_status['running'],
            'last_run': agent_status['last_run'],
            'total_runs': agent_status['total_runs'],
            'memory_stats': memory.get_stats(),
            'last_analysis': agent_status['last_analysis']
        }
    })

@app.route('/agent/insights', methods=['GET'])
def get_insights():
    """Get agent insights with structured format including severity and persistence"""
    insights = []
    
    # Convert current decisions into structured insights
    for decision in current_decisions:
        # Build evidence object from decision data
        evidence = {}
        if decision.get('entity_type') == 'bank' or decision.get('entity_type') == 'method':
            # Extract failure rate from reasoning
            reasoning = decision.get('reasoning', '')
            if 'showing ' in reasoning and '%' in reasoning:
                try:
                    parts = reasoning.split('showing ')[1].split('%')[0]
                    failure_rate = parts.strip()
                    evidence['failure_rate'] = f"{failure_rate}%"
                except:
                    evidence['failure_rate'] = "N/A"
            
            # Extract baseline from reasoning
            if 'baseline:' in reasoning:
                try:
                    baseline = reasoning.split('baseline: ')[1].split('%')[0]
                    evidence['baseline'] = f"{baseline}%"
                except:
                    evidence['baseline'] = "5%"
            
            # Add sample size and failures count
            if 'transactions' in reasoning:
                try:
                    sample = reasoning.split('Based on ')[1].split(' transactions')[0]
                    evidence['sample_size'] = sample
                except:
                    pass
            
            evidence['window'] = "last 100-300 transactions"
        
        # Map confidence to float
        confidence = decision.get('confidence', 70) / 100.0
        
        # Get persistence info
        persistence = decision.get('persistence', {})
        persistence_status = persistence.get('status', 'NEW') if persistence else 'NEW'
        first_detected = persistence.get('first_detected') if persistence else decision.get('timestamp')
        
        # Build structured insight
        insight = {
            'issue_type': 'FAILURE_SPIKE' if 'failure' in decision.get('issue', '').lower() else 'ANOMALY_DETECTED',
            'scope': decision.get('entity', 'unknown'),
            'confidence': round(confidence, 2),
            'severity': decision.get('severity', 'MEDIUM').upper(),
            'evidence': evidence,
            'recommended_action': decision.get('action'),
            'risk_level': decision.get('risk', 'medium'),
            'auto_executed': False,
            'explanation': decision.get('reasoning'),
            'timestamp': decision.get('timestamp'),
            'decision_id': decision.get('decision_id'),
            'persistence_status': persistence_status,
            'first_detected': first_detected
        }
        
        insights.append(insight)
    
    return jsonify({
        'success': True,
        'count': len(insights),
        'insights': insights
    })

@app.route('/agent/decisions', methods=['GET'])
def get_decisions():
    """Get recent decisions"""
    formatted_decisions = [format_decision_for_dashboard(d) for d in current_decisions]
    
    return jsonify({
        'success': True,
        'count': len(formatted_decisions),
        'decisions': formatted_decisions,
        'memory': {
            'total_decisions': len(memory.decisions),
            'success_rate': memory.get_success_rate()
        }
    })

@app.route('/agent/history', methods=['GET'])
def get_history():
    """Get decision history"""
    return jsonify({
        'success': True,
        'decisions': memory.get_decisions(limit=20),
        'stats': memory.get_stats()
    })

@app.route('/health', methods=['GET'])
def health():
    """Health check"""
    return jsonify({
        'status': 'ok',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/agent/workflow_state', methods=['GET'])
def get_workflow_state():
    """Get current workflow state for explainability view"""
    return jsonify({
        'success': True,
        'workflow': workflow_state,
        'timestamp': datetime.now().isoformat()
    })
