import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, AlertCircle, Clock, Activity } from 'lucide-react';
import api from '../utils/api';

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [summaryData, historyData] = await Promise.all([
        api.getAnalyticsSummary(),
        api.getPredictionHistory(100)
      ]);
      
      if (summaryData.status === 'success') {
        setSummary(summaryData);
      }
      
      if (historyData.status === 'success') {
        setHistory(historyData.history);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '2rem', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '80vh',
        color: 'white'
      }}>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!summary || summary.status === 'no_data') {
    return (
      <div style={{ padding: '2rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <AlertCircle size={48} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
            No Data Available
          </h3>
          <p style={{ color: 'var(--text-secondary)' }}>
            Start live monitoring to collect data for analytics
          </p>
        </div>
      </div>
    );
  }

  const stats = summary.statistics;

  // Prepare hourly breakdown data (mock - in real app, aggregate by hour)
  const hourlyData = history.reduce((acc, item, idx) => {
    const hour = Math.floor(idx / 5);
    if (!acc[hour]) {
      acc[hour] = { hour: `H${hour}`, fatigue: 0, stress: 0, count: 0 };
    }
    acc[hour].fatigue += item.fatigue;
    acc[hour].stress += item.stress;
    acc[hour].count += 1;
    return acc;
  }, []).filter(Boolean).map(item => ({
    hour: item.hour,
    fatigue: (item.fatigue / item.count).toFixed(1),
    stress: (item.stress / item.count).toFixed(1)
  }));

  // Distribution data
  const distributionData = [
    { name: 'Fatigue', value: stats.avg_fatigue, color: '#667eea' },
    { name: 'Stress', value: stats.avg_stress, color: '#764ba2' },
    { name: 'Normal', value: Math.max(0, 100 - stats.avg_fatigue - stats.avg_stress), color: '#10b981' }
  ];

  const StatCard = ({ icon: Icon, label, value, suffix = '', color = '#667eea' }) => (
    <div className="card" style={{ textAlign: 'center' }}>
      <Icon size={32} style={{ color, margin: '0 auto 1rem' }} />
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        {label}
      </p>
      <p style={{ fontSize: '2rem', fontWeight: '700', color }}>
        {value}{suffix}
      </p>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'white', marginBottom: '0.5rem' }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.8)' }}>
          Comprehensive analysis of worker fatigue and stress patterns
        </p>
      </div>

      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <StatCard 
          icon={TrendingUp}
          label="Avg Fatigue Level"
          value={stats.avg_fatigue.toFixed(1)}
          suffix="%"
          color="#667eea"
        />
        <StatCard 
          icon={AlertCircle}
          label="Avg Stress Level"
          value={stats.avg_stress.toFixed(1)}
          suffix="%"
          color="#764ba2"
        />
        <StatCard 
          icon={Activity}
          label="Avg Risk Score"
          value={stats.avg_risk.toFixed(1)}
          color="#ef4444"
        />
        <StatCard 
          icon={Clock}
          label="Total Samples"
          value={stats.total_samples}
          color="#10b981"
        />
      </div>

      {/* Charts Row 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Trend Over Time */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Fatigue & Stress Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history.slice(-50)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="index" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
                label={{ value: 'Sample', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#64748b"
                label={{ value: 'Level (%)', angle: -90, position: 'insideLeft' }}
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
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            State Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {/* Hourly Breakdown */}
        <div className="card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>
            Hourly Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="hour" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis 
                domain={[0, 100]}
                tick={{ fontSize: 12 }}
                stroke="#64748b"
                label={{ value: 'Level (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{
                  background: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px'
                }}
              />
              <Legend />
              <Bar dataKey="fatigue" fill="#667eea" name="Fatigue %" />
              <Bar dataKey="stress" fill="#764ba2" name="Stress %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Summary */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1.5rem' }}>
          Risk Summary
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div style={{ 
            padding: '1.5rem', 
            borderRadius: '8px', 
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#059669', marginBottom: '0.5rem', fontWeight: '500' }}>
              Minimum Risk
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#10b981' }}>
              {stats.min_risk.toFixed(1)}
            </p>
          </div>
          
          <div style={{ 
            padding: '1.5rem', 
            borderRadius: '8px', 
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid #667eea'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#4f46e5', marginBottom: '0.5rem', fontWeight: '500' }}>
              Average Risk
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
              {stats.avg_risk.toFixed(1)}
            </p>
          </div>
          
          <div style={{ 
            padding: '1.5rem', 
            borderRadius: '8px', 
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid #ef4444'
          }}>
            <p style={{ fontSize: '0.875rem', color: '#dc2626', marginBottom: '0.5rem', fontWeight: '500' }}>
              Maximum Risk
            </p>
            <p style={{ fontSize: '2rem', fontWeight: '700', color: '#ef4444' }}>
              {stats.max_risk.toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;