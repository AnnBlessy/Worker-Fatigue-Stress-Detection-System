from typing import Dict, List
from datetime import datetime, timedelta
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.config import config

class RiskEngine:
    def __init__(self):
        """Initialize risk calculation engine"""
        self.fatigue_weight = config.FATIGUE_WEIGHT
        self.stress_weight = config.STRESS_WEIGHT
        self.duration_weight = config.DURATION_WEIGHT
        self.risk_levels = config.RISK_LEVELS
    
    def calculate_risk_score(
        self, 
        fatigue_prob: float, 
        stress_prob: float,
        duration_minutes: int = 0
    ) -> Dict:
        """
        Calculate overall risk score
        
        Args:
            fatigue_prob: Probability of fatigue (0-1)
            stress_prob: Probability of stress (0-1)
            duration_minutes: Minutes of continuous work
        
        Returns:
            {
                'risk_score': float (0-100),
                'risk_level': str,
                'fatigue_score': float,
                'stress_score': float,
                'duration_score': float
            }
        """
        # Convert probabilities to scores (0-100)
        fatigue_score = fatigue_prob * 100
        stress_score = stress_prob * 100
        
        # Duration score (increases over time)
        # Peaks at 100 after 8 hours (480 minutes)
        duration_score = min(100, (duration_minutes / 480) * 100)
        
        # Calculate weighted risk score
        risk_score = (
            (self.fatigue_weight * fatigue_score) +
            (self.stress_weight * stress_score) +
            (self.duration_weight * duration_score)
        )
        
        # Determine risk level
        risk_level = self._get_risk_level(risk_score)
        
        return {
            'risk_score': round(risk_score, 2),
            'risk_level': risk_level,
            'fatigue_score': round(fatigue_score, 2),
            'stress_score': round(stress_score, 2),
            'duration_score': round(duration_score, 2)
        }
    
    def _get_risk_level(self, score: float) -> str:
        """Determine risk level from score"""
        for level, (min_val, max_val) in self.risk_levels.items():
            if min_val <= score <= max_val:
                return level
        return "normal"
    
    def calculate_batch_statistics(self, predictions: List[Dict]) -> Dict:
        """
        Calculate statistics from a batch of predictions
        
        Args:
            predictions: List of prediction dictionaries
        
        Returns:
            Statistical summary
        """
        if not predictions:
            return {
                'avg_fatigue': 0,
                'avg_stress': 0,
                'avg_risk': 0,
                'max_risk': 0,
                'total_samples': 0
            }
        
        fatigue_scores = [p['probabilities']['Fatigue'] * 100 for p in predictions]
        stress_scores = [p['probabilities']['Stress'] * 100 for p in predictions]
        
        # Calculate risk for each prediction
        risk_scores = []
        for i, pred in enumerate(predictions):
            risk = self.calculate_risk_score(
                pred['probabilities']['Fatigue'],
                pred['probabilities']['Stress'],
                duration_minutes=i * 5  # Assume 5 min intervals
            )
            risk_scores.append(risk['risk_score'])
        
        return {
            'avg_fatigue': round(sum(fatigue_scores) / len(fatigue_scores), 2),
            'avg_stress': round(sum(stress_scores) / len(stress_scores), 2),
            'avg_risk': round(sum(risk_scores) / len(risk_scores), 2),
            'max_risk': round(max(risk_scores), 2),
            'min_risk': round(min(risk_scores), 2),
            'total_samples': len(predictions)
        }