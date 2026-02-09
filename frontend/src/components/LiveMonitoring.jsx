import { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const LiveMonitoring = () => {
  const { colors, isDark } = useTheme();
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [error, setError] = useState(null);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsStreaming(true);
        setError(null);
        
        // Start analysis every 2 seconds
        intervalRef.current = setInterval(captureAndAnalyze, 2000);
      }
    } catch (err) {
      setError('Failed to access camera: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsStreaming(false);
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    
    // Convert to blob
    canvas.toBlob(async (blob) => {
      try {
        const result = await api.analyzeFrame(blob);
        
        if (result.status === 'success') {
          setCurrentData(result);
          
          // Add to history
          setHistoryData(prev => {
            const newData = [...prev, {
              time: new Date().toLocaleTimeString(),
              fatigue: result.smoothed_prediction.probabilities.Fatigue * 100,
              stress: result.smoothed_prediction.probabilities.Stress * 100,
              risk: result.risk_assessment.risk_score
            }];
            return newData.slice(-30); // Keep last 30 points
          });
        }
      } catch (err) {
        console.error('Analysis error:', err);
      }
    }, 'image/jpeg', 0.8);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getRiskColor = (level) => {
    const colors = {
      normal: '#10b981',
      warning: '#f59e0b',
      critical: '#ef4444'
    };
    return colors[level] || colors.normal;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <TrendingUp size={16} />;
    if (trend === 'decreasing') return <TrendingDown size={16} />;
    return <Minus size={16} />;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: colors.textPrimary, marginBottom: '0.5rem' }}>
          Live Monitoring
        </h1>
        <p style={{ color: colors.textSecondary, fontSize: '1rem' }}>
          Real-time worker fatigue and stress detection system
        </p>
      </div>

      {/* Main Layout: Face Scan + Metrics in One Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Left: Rectangular Facial Scan - No outer box */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '500px' }}>
          {/* Rectangular Container with Curved Edges */}
          <div style={{
  position: 'relative',
  width: '100%',
  height: '480px',
  borderRadius: '16px',
  overflow: 'hidden',
  border: `2px solid ${colors.accent}`,
  background: isDark ? '#000' : '#e2e8f0'
}}>
  <video
    ref={videoRef}
    autoPlay
    playsInline
    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
  />
  <canvas ref={canvasRef} style={{ display: 'none' }} />

  {!isStreaming && (
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)'
    }}>
      <Camera size={48} style={{ marginBottom: '1rem' }} />
      <p style={{ fontSize: '0.85rem' }}>Click to start</p>
    </div>
  

            )}

            
          </div>

          

          {/* Camera Control Button */}
          <button
            onClick={isStreaming ? stopCamera : startCamera}
            className={isStreaming ? 'btn-secondary' : 'btn-primary'}
            style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
          >
            {isStreaming ? <CameraOff size={18} /> : <Camera size={18} />}
            {isStreaming ? 'Stop Camera' : 'Start Camera'}
          </button>

          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem',
              background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.2)',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              color: '#ef4444',
              fontSize: '0.85rem',
              textAlign: 'center',
              maxWidth: '100%'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Right: Live Metrics */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'fit-content' }}>
          {/* Overall Operational Strain Score */}
          <div style={{ 
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '1rem',
            height: '120px',
            overflow: 'hidden'
          }}>
            <p style={{ fontSize: '0.75rem', color: colors.textSecondary, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Overall Operational Strain Score
            </p>
            {currentData ? (
              <div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700',
                  color: getRiskColor(currentData.risk_assessment.risk_level),
                  marginBottom: '0.5rem'
                }}>
                  {currentData.risk_assessment.risk_score}%
                </div>
                <div style={{
                  height: '6px',
                  background: isDark ? 'rgba(107, 92, 255, 0.2)' : 'rgba(107, 92, 255, 0.1)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${currentData.risk_assessment.risk_score}%`,
                    background: getRiskColor(currentData.risk_assessment.risk_level),
                    transition: 'width 0.5s ease',
                    boxShadow: `0 0 10px ${getRiskColor(currentData.risk_assessment.risk_level)}`
                  }} />
                </div>
                <span style={{
                  display: 'inline-block',
                  padding: '0.25rem 0.6rem',
                  borderRadius: '20px',
                  fontSize: '0.65rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  background: `${getRiskColor(currentData.risk_assessment.risk_level)}20`,
                  color: getRiskColor(currentData.risk_assessment.risk_level),
                  border: `1px solid ${getRiskColor(currentData.risk_assessment.risk_level)}`
                }}>
                  {currentData.risk_assessment.risk_level}
                </span>
              </div>
            ) : (
              <p style={{ color: colors.textSecondary, fontSize: '0.9rem' }}>--</p>
            )}
          </div>

          {/* Stress Level */}
          <div style={{ 
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '1rem',
            height: '110px',
            overflow: 'hidden'
          }}>
            <p style={{ fontSize: '0.75rem', color: colors.textSecondary, marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Stress Level
            </p>
            {currentData ? (
              <div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700',
                  color: '#7c3aed',
                  marginBottom: '0.4rem'
                }}>
                  {currentData.risk_assessment.stress_score.toFixed(1)}%
                </div>
                <div style={{
                  height: '5px',
                  background: isDark ? 'rgba(107, 92, 255, 0.2)' : 'rgba(107, 92, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${currentData.risk_assessment.stress_score}%`,
                    background: '#7c3aed',
                    transition: 'width 0.5s ease',
                    boxShadow: '0 0 8px rgba(124, 58, 237, 0.6)'
                  }} />
                </div>
              </div>
            ) : (
              <p style={{ color: colors.textSecondary }}>--</p>
            )}
          </div>

          {/* Fatigue Level */}
          <div style={{ 
            background: colors.cardBackground,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            padding: '1rem',
            height: '140px',
            overflow: 'hidden'
          }}>
            <p style={{ fontSize: '0.75rem', color: colors.textSecondary, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Fatigue Level
            </p>
            {currentData ? (
              <div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700',
                  color: '#6b5cff',
                  marginBottom: '0.75rem'
                }}>
                  {currentData.risk_assessment.fatigue_score.toFixed(1)}%
                </div>
                <div style={{
                  height: '6px',
                  background: isDark ? 'rgba(107, 92, 255, 0.2)' : 'rgba(107, 92, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${currentData.risk_assessment.fatigue_score}%`,
                    background: '#6b5cff',
                    transition: 'width 0.5s ease',
                    boxShadow: '0 0 8px rgba(107, 92, 255, 0.6)'
                  }} />
                </div>
              </div>
            ) : (
              <p style={{ color: '#a0aec0' }}>--</p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Real-Time Chart Spanning Full Width */}
      <div style={{ 
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', color: colors.textPrimary }}>
          Real-Time Trends
        </h3>
        
        {historyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(107, 92, 255, 0.2)' : 'rgba(107, 92, 255, 0.1)'} />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: colors.textSecondary }}
                stroke={isDark ? 'rgba(107, 92, 255, 0.2)' : 'rgba(107, 92, 255, 0.1)'}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: colors.textSecondary }}
                stroke={isDark ? 'rgba(107, 92, 255, 0.2)' : 'rgba(107, 92, 255, 0.1)'}
              />
              <Tooltip 
                contentStyle={{
                  background: isDark ? 'rgba(26, 31, 58, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.textPrimary
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '1rem' }} />
              <Line 
                type="monotone" 
                dataKey="fatigue" 
                stroke="#6b5cff" 
                strokeWidth={2.5}
                dot={false}
                name="Fatigue %"
                shadowBlur={10}
              />
              <Line 
                type="monotone" 
                dataKey="stress" 
                stroke="#7c3aed" 
                strokeWidth={2.5}
                dot={false}
                name="Stress %"
              />
              <Line 
                type="monotone" 
                dataKey="risk" 
                stroke="#ef4444" 
                strokeWidth={2.5}
                dot={false}
                name="Risk Score"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ 
            height: '300px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: colors.textSecondary
          }}>
            <p>No data yet. Start camera to see trends.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMonitoring;