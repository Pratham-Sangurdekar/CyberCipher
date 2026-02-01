"""
SlayPay AI Agent - Reasoning Module
Detects patterns and anomalies in payment data with severity classification
"""

from typing import Dict, List, Tuple
from datetime import datetime

# Thresholds for anomaly detection
FAILURE_RATE_THRESHOLD = 5.0  # % - alert if failure rate exceeds this
LATENCY_THRESHOLD = 400  # ms - alert if avg latency exceeds this
MIN_SAMPLE_SIZE = 10  # minimum transactions to consider

# Severity classification thresholds
SEVERITY_THRESHOLDS = {
    'LOW': {'failure_rate': 5.0, 'affected_min': 10},
    'MEDIUM': {'failure_rate': 15.0, 'affected_min': 30},
    'HIGH': {'failure_rate': 30.0, 'affected_min': 50}
}

def classify_severity(failure_rate: float, sample_size: int, baseline: float = 5.0) -> str:
    """
    Classify severity based on magnitude, duration, and affected transactions
    
    Args:
        failure_rate: Current failure rate percentage
        sample_size: Number of transactions analyzed
        baseline: Baseline failure rate for comparison
    
    Returns:
        'LOW', 'MEDIUM', or 'HIGH'
    """
    # Calculate how much worse than baseline
    degradation_factor = failure_rate / baseline if baseline > 0 else failure_rate
    
    # HIGH severity: >30% failure OR >6x baseline with significant sample
    if failure_rate >= SEVERITY_THRESHOLDS['HIGH']['failure_rate']:
        return 'HIGH'
    if degradation_factor >= 6.0 and sample_size >= SEVERITY_THRESHOLDS['HIGH']['affected_min']:
        return 'HIGH'
    
    # MEDIUM severity: 15-30% failure OR >3x baseline with moderate sample
    if failure_rate >= SEVERITY_THRESHOLDS['MEDIUM']['failure_rate']:
        return 'MEDIUM'
    if degradation_factor >= 3.0 and sample_size >= SEVERITY_THRESHOLDS['MEDIUM']['affected_min']:
        return 'MEDIUM'
    
    # LOW severity: 5-15% failure OR >1.5x baseline
    if failure_rate >= SEVERITY_THRESHOLDS['LOW']['failure_rate']:
        return 'LOW'
    if degradation_factor >= 1.5 and sample_size >= SEVERITY_THRESHOLDS['LOW']['affected_min']:
        return 'LOW'
    
    return 'LOW'

def detect_bank_anomalies(structured_data: Dict) -> List[Dict]:
    """Detect banks with unusual failure rates or latency"""
    anomalies = []
    
    for bank, stats in structured_data.get('by_bank', {}).items():
        if stats['total'] < MIN_SAMPLE_SIZE:
            continue
        
        failure_rate = (stats['failures'] / stats['total']) * 100
        
        if failure_rate > FAILURE_RATE_THRESHOLD:
            severity = classify_severity(failure_rate, stats['total'], FAILURE_RATE_THRESHOLD)
            
            anomalies.append({
                'type': 'high_failure_rate',
                'entity': bank,
                'entity_type': 'bank',
                'severity': severity,
                'value': round(failure_rate, 2),
                'threshold': FAILURE_RATE_THRESHOLD,
                'sample_size': stats['total'],
                'failures_count': stats['failures']
            })
    
    return anomalies

def detect_method_anomalies(structured_data: Dict) -> List[Dict]:
    """Detect payment methods with unusual failure rates"""
    anomalies = []
    
    for method, stats in structured_data.get('by_method', {}).items():
        if stats['total'] < MIN_SAMPLE_SIZE:
            continue
        
        failure_rate = (stats['failures'] / stats['total']) * 100
        
        if failure_rate > FAILURE_RATE_THRESHOLD:
            severity = classify_severity(failure_rate, stats['total'], FAILURE_RATE_THRESHOLD)
            
            anomalies.append({
                'type': 'high_failure_rate',
                'entity': method,
                'entity_type': 'method',
                'severity': severity,
                'value': round(failure_rate, 2),
                'threshold': FAILURE_RATE_THRESHOLD,
                'sample_size': stats['total'],
                'failures_count': stats['failures']
            })
    
    return anomalies

def detect_error_patterns(structured_data: Dict) -> List[Dict]:
    """Detect repeating error codes that might indicate systemic issues"""
    patterns = []
    recent_failures = structured_data.get('recent_failures', [])
    
    if not recent_failures:
        return patterns
    
    # Count error codes
    error_counts = {}
    for failure in recent_failures:
        error_code = failure.get('error_code', 'UNKNOWN')
        error_counts[error_code] = error_counts.get(error_code, 0) + 1
    
    # Alert if same error appears too frequently
    for error_code, count in error_counts.items():
        if count >= 3:  # 3+ occurrences of same error
            patterns.append({
                'type': 'repeated_error',
                'error_code': error_code,
                'severity': 'medium',
                'occurrences': count,
                'total_failures': len(recent_failures)
            })
    
    return patterns

def analyze_all(structured_data: Dict) -> Dict:
    """Run all anomaly detection algorithms"""
    bank_anomalies = detect_bank_anomalies(structured_data)
    method_anomalies = detect_method_anomalies(structured_data)
    error_patterns = detect_error_patterns(structured_data)
    
    return {
        'bank_anomalies': bank_anomalies,
        'method_anomalies': method_anomalies,
        'error_patterns': error_patterns,
        'total_anomalies': len(bank_anomalies) + len(method_anomalies) + len(error_patterns)
    }
