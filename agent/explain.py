"""
SlayPay AI Agent - Explanation Module
Generates human-readable explanations for decisions
"""

from typing import Dict, List

def explain_decision(decision: Dict) -> str:
    """Generate detailed explanation for a decision"""
    explanation = f"""
Decision: {decision.get('decision_id')}
Timestamp: {decision.get('timestamp')}

Issue Detected:
  {decision.get('issue')}

Reasoning:
  {decision.get('reasoning')}

Proposed Action:
  {decision.get('action')}

Confidence Level: {decision.get('confidence')}%
Risk Assessment: {decision.get('risk')}

Status: {decision.get('outcome', 'pending')}
"""
    return explanation.strip()

def explain_analysis(analysis: Dict, structured_data: Dict) -> str:
    """Generate summary of analysis"""
    total_txns = structured_data.get('total', 0)
    anomalies = analysis.get('total_anomalies', 0)
    
    explanation = f"""
Analysis Summary
================

Total Transactions Analyzed: {total_txns}
Anomalies Detected: {anomalies}

"""
    
    # Bank anomalies
    if analysis.get('bank_anomalies'):
        explanation += "Bank Issues:\n"
        for anomaly in analysis['bank_anomalies']:
            explanation += f"  • {anomaly['entity']}: {anomaly['value']}% failure rate (severity: {anomaly['severity']})\n"
        explanation += "\n"
    
    # Method anomalies
    if analysis.get('method_anomalies'):
        explanation += "Payment Method Issues:\n"
        for anomaly in analysis['method_anomalies']:
            explanation += f"  • {anomaly['entity']}: {anomaly['value']}% failure rate (severity: {anomaly['severity']})\n"
        explanation += "\n"
    
    # Error patterns
    if analysis.get('error_patterns'):
        explanation += "Error Patterns:\n"
        for pattern in analysis['error_patterns']:
            explanation += f"  • {pattern['error_code']}: {pattern['occurrences']} occurrences\n"
        explanation += "\n"
    
    if anomalies == 0:
        explanation += "All systems operating normally. No anomalies detected.\n"
    
    return explanation.strip()

def format_decision_for_dashboard(decision: Dict) -> Dict:
    """Format decision for ops dashboard consumption"""
    return {
        'id': decision.get('decision_id'),
        'timestamp': decision.get('timestamp'),
        'issue': decision.get('issue'),
        'action': decision.get('action'),
        'confidence': decision.get('confidence'),
        'risk': decision.get('risk'),
        'outcome': decision.get('outcome', 'pending')
    }
