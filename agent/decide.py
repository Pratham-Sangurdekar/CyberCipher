"""
SlayPay AI Agent - Decision Module
Proposes actions based on detected anomalies with severity and persistence awareness
"""

from typing import Dict, List
from datetime import datetime

def propose_action_for_bank_anomaly(anomaly: Dict, persistence: Dict = None) -> Dict:
    """Propose action for bank-specific anomaly"""
    bank = anomaly['entity']
    failure_rate = anomaly['value']
    severity = anomaly.get('severity', 'MEDIUM').upper()
    sample_size = anomaly['sample_size']
    failures_count = anomaly.get('failures_count', 0)
    
    # Adjust action based on severity
    if severity == 'HIGH' or failure_rate > 30:
        action = f"CRITICAL: Temporarily route {bank} traffic to backup banks"
        confidence = 95
        risk = "high"
    elif severity == 'MEDIUM' or failure_rate > 15:
        action = f"Reduce {bank} traffic allocation by 40%"
        confidence = 85
        risk = "medium"
    else:
        action = f"Monitor {bank} closely - increase logging"
        confidence = 70
        risk = "low"
    
    # Build reasoning with persistence info
    reasoning = f"Based on {sample_size} transactions, {bank} showing {failure_rate}% failure rate (baseline: {anomaly['threshold']}%). {failures_count} transactions failed."
    
    if persistence:
        status = persistence.get('status', 'NEW')
        duration = persistence.get('duration_minutes', 0)
        occurrence_count = persistence.get('occurrence_count', 1)
        
        if status == 'ONGOING':
            reasoning += f" This degradation has persisted across {occurrence_count} observation windows ({duration} minutes)."
        elif status == 'RECURRING':
            reasoning += f" This issue has occurred {occurrence_count} times in the past {duration} minutes."
        else:
            reasoning += " This is a newly detected issue."
    
    reasoning += f" Severity: {severity}."
    
    return {
        'decision_id': f"DEC_{int(datetime.now().timestamp())}_{bank}",
        'timestamp': datetime.now().isoformat(),
        'issue': f"Detected {bank} failure spike ({failure_rate}%)",
        'action': action,
        'confidence': confidence,
        'risk': risk,
        'reasoning': reasoning,
        'entity': bank,
        'entity_type': 'bank',
        'severity': severity,
        'persistence': persistence,
        'outcome': 'pending'
    }

def propose_action_for_method_anomaly(anomaly: Dict, persistence: Dict = None) -> Dict:
    """Propose action for payment method anomaly"""
    method = anomaly['entity']
    failure_rate = anomaly['value']
    severity = anomaly.get('severity', 'MEDIUM').upper()
    sample_size = anomaly['sample_size']
    failures_count = anomaly.get('failures_count', 0)
    
    # Adjust action based on severity
    if severity == 'HIGH' or failure_rate > 30:
        action = f"CRITICAL: Disable {method} temporarily and investigate"
        confidence = 95
        risk = "high"
    elif severity == 'MEDIUM' or failure_rate > 15:
        action = f"Add retry logic and circuit breaker for {method}"
        confidence = 85
        risk = "medium"
    else:
        action = f"Monitor {method} performance - increase timeout thresholds"
        confidence = 75
        risk = "low"
    
    # Build reasoning with persistence info
    reasoning = f"{method} showing elevated failure rate of {failure_rate}% across {sample_size} transactions. {failures_count} transactions failed."
    
    if persistence:
        status = persistence.get('status', 'NEW')
        duration = persistence.get('duration_minutes', 0)
        occurrence_count = persistence.get('occurrence_count', 1)
        
        if status == 'ONGOING':
            reasoning += f" Pattern persisting across {occurrence_count} cycles ({duration} minutes)."
        elif status == 'RECURRING':
            reasoning += f" Recurring issue - {occurrence_count} occurrences in {duration} minutes."
        else:
            reasoning += " Newly identified pattern."
    
    reasoning += f" Severity: {severity}."
    
    return {
        'decision_id': f"DEC_{int(datetime.now().timestamp())}_{method}",
        'timestamp': datetime.now().isoformat(),
        'issue': f"Detected {method} payment failures ({failure_rate}%)",
        'action': action,
        'confidence': confidence,
        'risk': risk,
        'reasoning': reasoning,
        'entity': method,
        'entity_type': 'method',
        'severity': severity,
        'persistence': persistence,
        'outcome': 'pending'
    }

def propose_action_for_error_pattern(pattern: Dict, persistence: Dict = None) -> Dict:
    """Propose action for repeating error patterns"""
    error_code = pattern['error_code']
    occurrences = pattern['occurrences']
    
    action = f"Investigate root cause of {error_code}"
    confidence = 70
    risk = "medium"
    
    if error_code == 'BANK_TIMEOUT':
        action = "Increase timeout threshold and add circuit breaker"
        confidence = 85
    elif error_code == 'INSUFFICIENT_FUNDS':
        action = "Enhanced pre-validation before payment attempt"
        confidence = 80
    
    # Build reasoning with persistence info
    reasoning = f"Error {error_code} occurred {occurrences} times, suggesting systemic issue"
    
    if persistence:
        status = persistence.get('status', 'NEW')
        duration = persistence.get('duration_minutes', 0)
        occurrence_count = persistence.get('occurrence_count', 1)
        
        if status == 'ONGOING':
            reasoning += f" Pattern persisting across {occurrence_count} cycles ({duration} minutes)."
        elif status == 'RECURRING':
            reasoning += f" Recurring issue - {occurrence_count} occurrences in {duration} minutes."
        else:
            reasoning += " Newly identified pattern."
    
    return {
        'decision_id': f"DEC_{int(datetime.now().timestamp())}_E",
        'timestamp': datetime.now().isoformat(),
        'issue': f"Repeated {error_code} errors detected",
        'action': action,
        'confidence': confidence,
        'risk': risk,
        'reasoning': reasoning,
        'entity': error_code,
        'entity_type': 'error',
        'severity': 'MEDIUM',
        'persistence': persistence,
        'outcome': 'pending'
    }

def generate_decisions(analysis: Dict, memory=None) -> List[Dict]:
    """Generate actionable decisions from analysis with persistence tracking"""
    decisions = []
    
    # Process bank anomalies
    for anomaly in analysis.get('bank_anomalies', []):
        persistence = None
        if memory:
            issue_key = f"{anomaly['entity']}_failure_spike"
            persistence = memory.track_issue(issue_key, anomaly)
        
        decision = propose_action_for_bank_anomaly(anomaly, persistence)
        decisions.append(decision)
    
    # Process method anomalies
    for anomaly in analysis.get('method_anomalies', []):
        persistence = None
        if memory:
            issue_key = f"{anomaly['entity']}_method_failures"
            persistence = memory.track_issue(issue_key, anomaly)
        
        decision = propose_action_for_method_anomaly(anomaly, persistence)
        decisions.append(decision)
    
    # Process error patterns
    for pattern in analysis.get('error_patterns', []):
        persistence = None
        if memory:
            issue_key = f"{pattern['error_code']}_repeated_error"
            persistence = memory.track_issue(issue_key, pattern)
        
        decision = propose_action_for_error_pattern(pattern, persistence)
        decisions.append(decision)
    
    return decisions
