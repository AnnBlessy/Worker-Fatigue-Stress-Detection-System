import { useState, useRef, useEffect } from 'react';
import { Camera, CameraOff, AlertTriangle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../utils/api';

const LiveMonitoring = () => {
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
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
          Live Monitoring
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>
          Real-time worker fatigue and stress detection
        </p>
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Camera Feed */}
        <div className="card" style={{ position: 'relative', height: '420px' }}>
          <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600' }}>Camera Feed</h3>
            <button
              onClick={isStreaming ? stopCamera : startCamera}
              className={isStreaming ? 'btn-secondary' : 'btn-primary'}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}
            >
              {isStreaming ? <CameraOff size={18} /> : <Camera size={18} />}
              {isStreaming ? 'Stop' : 'Start Camera'}
            </button>
          </div>

          <div style={{ 
            position: 'relative', 
            width: '100%', 
            height: 'calc(100% - 60px)',
            background: '#000',
            borderRadius: '8px',
            overflow: 'hidden'
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
                color: 'white'
              }}>
                <Camera size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
                <p style={{ opacity: 0.6 }}>Click "Start Camera" to begin</p>
              </div>
            )}
          </div>

          {error && (
            <div style={{
              position: 'absolute',
              bottom: '1rem',
              left: '1rem',
              right: '1rem',
              background: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              padding: '0.75rem',
              borderRadius: '6px',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Live Metrics */}
        <div className="card" style={{ height: '420px' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Current Status
          </h3>

          {currentData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Risk Score */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Overall Risk Score</span>
                  <span style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '700',
                    color: getRiskColor(currentData.risk_assessment.risk_level)
                  }}>
                    {currentData.risk_assessment.risk_score}
                  </span>
                </div>
                <div style={{
                  height: '8px',
                  background: '#e2e8f0',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${currentData.risk_assessment.risk_score}%`,
                    background: getRiskColor(currentData.risk_assessment.risk_level),
                    transition: 'width 0.5s ease'
                  }} />
                </div>
                <div style={{ 
                  marginTop: '0.5rem',
                  display: 'inline-block',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  background: `${getRiskColor(currentData.risk_assessment.risk_level)}20`,
                  color: getRiskColor(currentData.risk_assessment.risk_level)
                }}>
                  {currentData.risk_assessment.risk_level}
                </div>
              </div>

              {/* Fatigue */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Fatigue Level</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#667eea' }}>
                    {currentData.risk_assessment.fatigue_score.toFixed(1)}%
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: '#e2e8f0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${currentData.risk_assessment.fatigue_score}%`,
                    background: '#667eea',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Stress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>Stress Level</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: '600', color: '#764ba2' }}>
                    {currentData.risk_assessment.stress_score.toFixed(1)}%
                  </span>
                </div>
                <div style={{
                  height: '6px',
                  background: '#e2e8f0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${currentData.risk_assessment.stress_score}%`,
                    background: '#764ba2',
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>

              {/* Trend & Session Info */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem',
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid var(--border-color)'
              }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Trend
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '600' }}>
                    {getTrendIcon(currentData.trend)}
                    <span style={{ textTransform: 'capitalize' }}>{currentData.trend || 'Stable'}</span>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                    Session Duration
                  </p>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {currentData.session_info.duration_minutes.toFixed(0)} min
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '300px',
              color: 'var(--text-secondary)'
            }}>
              <p>Start camera to see live metrics</p>
            </div>
          )}
        </div>
      </div>

      {/* Trend Chart */}
      <div className="card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          Real-Time Trends
        </h3>
        
        {historyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={historyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <Tooltip 
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="fatigue" 
                stroke="#667eea" 
                strokeWidth={2}
                dot={false}
                name="Fatigue %"
              />
              <Line 
                type="monotone" 
                dataKey="stress" 
                stroke="#764ba2" 
                strokeWidth={2}
                dot={false}
                name="Stress %"
              />
              <Line 
                type="monotone" 
                dataKey="risk" 
                stroke="#ef4444" 
                strokeWidth={2}
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
            color: 'var(--text-secondary)'
          }}>
            <p>No data yet. Start camera to see trends.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMonitoring;