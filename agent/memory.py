"""
SlayPay AI Agent - Memory Module
Tracks past decisions and their outcomes for learning
Also tracks issue persistence across cycles
"""

from typing import Dict, List
from datetime import datetime
import json
import os

MEMORY_FILE = "agent_memory.json"

class AgentMemory:
    def __init__(self):
        self.decisions = []
        self.issue_history = {}  # Track issues across cycles
        self.load()
    
    def load(self):
        """Load previous decisions and issue history from disk"""
        if os.path.exists(MEMORY_FILE):
            try:
                with open(MEMORY_FILE, 'r') as f:
                    data = json.load(f)
                    self.decisions = data.get('decisions', [])
                    self.issue_history = data.get('issue_history', {})
            except Exception as e:
                print(f"Error loading memory: {e}")
                self.decisions = []
                self.issue_history = {}
    
    def save(self):
        """Save decisions and issue history to disk"""
        try:
            with open(MEMORY_FILE, 'w') as f:
                json.dump({
                    'decisions': self.decisions,
                    'issue_history': self.issue_history
                }, f, indent=2)
        except Exception as e:
            print(f"Error saving memory: {e}")
    
    def record_decision(self, decision: Dict):
        """Record a new decision"""
        self.decisions.append(decision)
        # Keep only last 100 decisions
        if len(self.decisions) > 100:
            self.decisions = self.decisions[-100:]
        self.save()
    
    def track_issue(self, issue_key: str, anomaly: Dict) -> Dict:
        """
        Track an issue across cycles to determine if it's new, recurring, or ongoing
        
        Args:
            issue_key: Unique identifier for the issue (e.g., "HDFC_failure_spike")
            anomaly: Current anomaly data
        
        Returns:
            Dict with persistence info: status, first_detected, occurrence_count, duration_minutes
        """
        now = datetime.now().isoformat()
        
        if issue_key not in self.issue_history:
            # New issue
            self.issue_history[issue_key] = {
                'first_detected': now,
                'last_seen': now,
                'occurrence_count': 1,
                'severity_history': [anomaly.get('severity', 'MEDIUM')],
                'resolved': False
            }
            status = 'NEW'
        else:
            # Existing issue
            issue = self.issue_history[issue_key]
            issue['last_seen'] = now
            issue['occurrence_count'] += 1
            issue['severity_history'].append(anomaly.get('severity', 'MEDIUM'))
            
            # Keep only last 10 severity records
            if len(issue['severity_history']) > 10:
                issue['severity_history'] = issue['severity_history'][-10:]
            
            # Determine if ongoing or recurring
            if issue['occurrence_count'] >= 3:
                status = 'ONGOING'
            else:
                status = 'RECURRING'
        
        self.save()
        
        # Calculate duration
        first_detected = datetime.fromisoformat(self.issue_history[issue_key]['first_detected'])
        duration_minutes = int((datetime.now() - first_detected).total_seconds() / 60)
        
        return {
            'status': status,
            'first_detected': self.issue_history[issue_key]['first_detected'],
            'occurrence_count': self.issue_history[issue_key]['occurrence_count'],
            'duration_minutes': duration_minutes
        }
    
    def mark_resolved(self, issue_key: str):
        """Mark an issue as resolved"""
        if issue_key in self.issue_history:
            self.issue_history[issue_key]['resolved'] = True
            self.issue_history[issue_key]['resolved_at'] = datetime.now().isoformat()
            self.save()
    
    def cleanup_old_issues(self, max_age_hours: int = 24):
        """Remove resolved issues older than max_age_hours"""
        now = datetime.now()
        to_remove = []
        
        for key, issue in self.issue_history.items():
            if issue.get('resolved', False):
                resolved_at = datetime.fromisoformat(issue.get('resolved_at', now.isoformat()))
                age_hours = (now - resolved_at).total_seconds() / 3600
                if age_hours > max_age_hours:
                    to_remove.append(key)
        
        for key in to_remove:
            del self.issue_history[key]
        
        if to_remove:
            self.save()
    
    def update_outcome(self, decision_id: str, outcome: str, reward: float = 0.0):
        """Update the outcome of a decision"""
        for decision in self.decisions:
            if decision.get('decision_id') == decision_id:
                decision['outcome'] = outcome
                decision['reward'] = reward
                decision['updated_at'] = datetime.now().isoformat()
                break
        self.save()
    
    def get_decisions(self, limit: int = 10) -> List[Dict]:
        """Get recent decisions"""
        return self.decisions[-limit:]
    
    def get_success_rate(self) -> float:
        """Calculate success rate of past decisions"""
        if not self.decisions:
            return 0.0
        
        completed = [d for d in self.decisions if d.get('outcome') not in ['pending', None]]
        if not completed:
            return 0.0
        
        successful = [d for d in completed if d.get('reward', 0) > 0]
        return len(successful) / len(completed) * 100
    
    def get_stats(self) -> Dict:
        """Get memory statistics"""
        active_issues = len([i for i in self.issue_history.values() if not i.get('resolved', False)])
        
        return {
            'total_decisions': len(self.decisions),
            'recent_decisions': len([d for d in self.decisions if d.get('outcome') == 'pending']),
            'success_rate': round(self.get_success_rate(), 2),
            'last_decision': self.decisions[-1] if self.decisions else None,
            'active_issues': active_issues,
            'total_tracked_issues': len(self.issue_history)
        }

