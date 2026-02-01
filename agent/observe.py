"""
SlayPay AI Agent - Data Observation Module
Pulls and structures payment events from backend
"""

import requests
from datetime import datetime
from typing import List, Dict

BACKEND_URL = "http://localhost:3001"

def fetch_recent_events(limit: int = 100) -> List[Dict]:
    """Fetch recent payment events from backend"""
    try:
        response = requests.get(f"{BACKEND_URL}/payments/recent?limit={limit}")
        if response.status_code == 200:
            data = response.json()
            return data.get('events', [])
    except Exception as e:
        print(f"Error fetching events: {e}")
    return []

def fetch_metrics() -> Dict:
    """Fetch aggregated metrics from backend"""
    try:
        response = requests.get(f"{BACKEND_URL}/metrics/summary")
        if response.status_code == 200:
            data = response.json()
            return data.get('metrics', {})
    except Exception as e:
        print(f"Error fetching metrics: {e}")
    return {}

def structure_events(events: List[Dict]) -> Dict:
    """Structure events for easier analysis"""
    if not events:
        return {
            'total': 0,
            'by_status': {},
            'by_bank': {},
            'by_method': {},
            'recent_failures': []
        }
    
    structured = {
        'total': len(events),
        'by_status': {},
        'by_bank': {},
        'by_method': {},
        'recent_failures': []
    }
    
    for event in events:
        # Count by status
        status = event.get('status', 'unknown')
        structured['by_status'][status] = structured['by_status'].get(status, 0) + 1
        
        # Count by bank
        bank = event.get('bank', 'unknown')
        if bank not in structured['by_bank']:
            structured['by_bank'][bank] = {'total': 0, 'failures': 0, 'successes': 0}
        structured['by_bank'][bank]['total'] += 1
        if status == 'failure':
            structured['by_bank'][bank]['failures'] += 1
        elif status == 'success':
            structured['by_bank'][bank]['successes'] += 1
        
        # Count by method
        method = event.get('method', 'unknown')
        if method not in structured['by_method']:
            structured['by_method'][method] = {'total': 0, 'failures': 0, 'successes': 0}
        structured['by_method'][method]['total'] += 1
        if status == 'failure':
            structured['by_method'][method]['failures'] += 1
        elif status == 'success':
            structured['by_method'][method]['successes'] += 1
        
        # Track recent failures
        if status == 'failure':
            structured['recent_failures'].append({
                'transaction_id': event.get('transaction_id'),
                'bank': bank,
                'method': method,
                'error_code': event.get('error_code'),
                'timestamp': event.get('timestamp')
            })
    
    return structured
