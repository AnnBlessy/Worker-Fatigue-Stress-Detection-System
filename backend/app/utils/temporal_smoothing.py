from collections import deque
from typing import Dict, Optional
import numpy as np
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.config import config

class TemporalSmoother:
    def __init__(self, window_size: int = None):
        """
        Initialize temporal smoothing buffer
        
        Args:
            window_size: Number of predictions to average (default from config)
        """
        self.window_size = window_size or config.SMOOTHING_WINDOW
        self.fatigue_buffer = deque(maxlen=self.window_size)
        self.stress_buffer = deque(maxlen=self.window_size)
        self.normal_buffer = deque(maxlen=self.window_size)
    
    def add_prediction(self, probabilities: Dict[str, float]):
        """Add new prediction to buffers"""
        self.fatigue_buffer.append(probabilities.get('Fatigue', 0))
        self.stress_buffer.append(probabilities.get('Stress', 0))
        self.normal_buffer.append(probabilities.get('Normal', 0))
    
    def get_smoothed_probabilities(self) -> Optional[Dict[str, float]]:
        """
        Get smoothed probabilities using moving average
        
        Returns:
            Smoothed probabilities or None if buffer is empty
        """
        if not self.fatigue_buffer:
            return None
        
        return {
            'Fatigue': float(np.mean(self.fatigue_buffer)),
            'Stress': float(np.mean(self.stress_buffer)),
            'Normal': float(np.mean(self.normal_buffer))
        }
    
    def get_trend(self) -> Optional[str]:
        """
        Analyze trend direction
        
        Returns:
            'increasing', 'decreasing', or 'stable'
        """
        if len(self.fatigue_buffer) < 5:
            return None
        
        # Calculate trend for fatigue (main indicator)
        recent = list(self.fatigue_buffer)
        first_half = np.mean(recent[:len(recent)//2])
        second_half = np.mean(recent[len(recent)//2:])
        
        diff = second_half - first_half
        
        if diff > 0.1:
            return 'increasing'
        elif diff < -0.1:
            return 'decreasing'
        else:
            return 'stable'
    
    def reset(self):
        """Clear all buffers"""
        self.fatigue_buffer.clear()
        self.stress_buffer.clear()
        self.normal_buffer.clear()
    
    def get_buffer_size(self) -> int:
        """Get current buffer size"""
        return len(self.fatigue_buffer)
    
    def update(self, stress_prob: float) -> Optional[float]:
        """
        Convenience method: add a single stress probability and return smoothed stress value.
        
        This is useful for streaming scenarios where you only track one metric.
        Assumes fatigue, stress, normal probs sum to 1, so we estimate others as equal distribution of remainder.
        
        Args:
            stress_prob: Stress probability value (0-1)
        
        Returns:
            Smoothed stress probability or None if buffer is empty
        """
        # For a single stress value, estimate the other two as equal distribution of remainder
        remainder = (1.0 - stress_prob) / 2.0
        self.add_prediction({
            'Fatigue': remainder,
            'Stress': stress_prob,
            'Normal': remainder
        })
        
        smoothed = self.get_smoothed_probabilities()
        if smoothed:
            return smoothed['Stress']
        return None
