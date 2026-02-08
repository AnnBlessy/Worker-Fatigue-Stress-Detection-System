import { useState, useEffect } from 'react';
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, AlertCircle, Clock, Activity } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const Analytics = () => {
  const { colors, isDark } = useTheme();
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
        color: colors.textPrimary
      }}>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!summary || summary.status === 'no_data') {
    return (
      <div style={{ padding: '2rem' }}>
        <div style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          textAlign: 'center',
          padding: '3rem'
        }}>
          <AlertCircle size={48} style={{ color: colors.textSecondary, marginBottom: '1rem' }} />
          <h3 style={{ color: colors.textPrimary }}>No Data Available</h3>
          <p style={{ color: colors.textSecondary }}>
            Start live monitoring to collect analytics
          </p>
        </div>
      </div>
    );
  }

  const stats = summary.statistics;

  /* ========== SESSION TIME LOGIC ========== */

  const totalSamples = history.length;
  const sessionDurationSeconds = totalSamples; // 1 sample per second

  const timeUnit = sessionDurationSeconds <= 60 ? 'seconds' : 'minutes';
  const bucketSize = timeUnit === 'seconds' ? 1 : 60;

  const sessionBuckets = history.reduce((acc, item, idx) => {
    const bucket = Math.floor(idx / bucketSize);

    if (!acc[bucket]) {
      acc[bucket] = {
        time: timeUnit === 'seconds' ? `${bucket}s` : `${bucket + 1} min`,
        fatigue: 0,
        stress: 0,
        count: 0
      };
    }

    acc[bucket].fatigue += item.fatigue;
    acc[bucket].stress += item.stress;
    acc[bucket].count += 1;

    return acc;
  }, []);

  const timeBreakdownData = sessionBuckets.map(b => ({
    time: b.time,
    fatigue: +(b.fatigue / b.count).toFixed(1),
    stress: +(b.stress / b.count).toFixed(1)
  }));

  /* ========== DISTRIBUTION DATA ========== */

  const distributionData = [
    { name: 'Fatigue', value: stats.avg_fatigue, color: '#6b5cff' },
    { name: 'Stress', value: stats.avg_stress, color: '#ed3ae1' },
    {
      name: 'Normal',
      value: Math.max(0, 100 - stats.avg_fatigue - stats.avg_stress),
      color: '#10b981'
    }
  ];

  const StatCard = ({ icon: Icon, label, value, suffix = '', color }) => (
    <div style={{
      background: colors.cardBackground,
      border: `1px solid ${colors.border}`,
      borderRadius: '12px',
      textAlign: 'center',
      padding: '1.5rem'
    }}>
      <Icon size={32} style={{ color, marginBottom: '1rem' }} />
      <p style={{ fontSize: '0.875rem', color: colors.textSecondary }}>
        {label}
      </p>
      <p style={{ fontSize: '2rem', fontWeight: '700', color }}>
        {value}{suffix}
      </p>
    </div>
  );

  return (
    <div style={{ padding: '2rem', maxWidth: '1600px', margin: '0 auto' }}>

      {/* HEADER */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '700', color: colors.textPrimary }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: colors.textSecondary }}>
          Comprehensive analysis of worker fatigue and stress patterns
        </p>
      </div>

      {/* METRICS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <StatCard icon={TrendingUp} label="Avg Fatigue Level" value={stats.avg_fatigue.toFixed(1)} suffix="%" color="#6b5cff" />
        <StatCard icon={AlertCircle} label="Avg Stress Level" value={stats.avg_stress.toFixed(1)} suffix="%" color="#ed3ae1" />
        <StatCard icon={Activity} label="Avg Operational Strain Score" value={stats.avg_risk.toFixed(1)} color="#ef4444" />
        <StatCard icon={Clock} label="Total Samples" value={stats.total_samples} color="#10b981" />
      </div>

      {/* ROW 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* TREND */}
        <div style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: colors.textPrimary }}>
            Fatigue & Stress Trends
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={history.slice(-50)}>
              <XAxis dataKey="index" label={{ value: 'Sample', position: 'insideBottom', offset: -5 }} />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="fatigue" stroke="#6b5cff" dot={false} />
              <Line type="monotone" dataKey="stress" stroke="#ed3ae1" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PIE */}
        <div style={{
          background: colors.cardBackground,
          border: `1px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h3 style={{ marginBottom: '1.5rem', color: colors.textPrimary }}>
            State Distribution
          </h3>

          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                dataKey="value"
                outerRadius={80}
                label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
              >
                {distributionData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SESSION BREAKDOWN */}
      <div style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '1.5rem'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: colors.textPrimary }}>
          Session Breakdown ({timeUnit})
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeBreakdownData}>
            <XAxis dataKey="time" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="fatigue" fill="#6b5cff" />
            <Bar dataKey="stress" fill="#ed3ae1" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* OPERATIONAL STRAIN SUMMARY */}
      <div style={{
        background: colors.cardBackground,
        border: `1px solid ${colors.border}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginTop: '1.5rem'
      }}>
        <h3 style={{ marginBottom: '1.5rem', color: colors.textPrimary }}>
          Operational Strain Summary
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', borderRadius: '8px', padding: '1.5rem' }}>
            <p style={{ color: '#059669' }}>Minimum Strain</p>
            <p style={{ fontSize: '2rem', color: '#10b981' }}>{stats.min_risk.toFixed(1)}</p>
          </div>

          <div style={{ background: 'rgba(107,92,255,0.15)', border: '1px solid #6b5cff', borderRadius: '8px', padding: '1.5rem' }}>
            <p style={{ color: '#4f46e5' }}>Average Strain</p>
            <p style={{ fontSize: '2rem', color: '#6b5cff' }}>{stats.avg_risk.toFixed(1)}</p>
          </div>

          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '8px', padding: '1.5rem' }}>
            <p style={{ color: '#dc2626' }}>Maximum Strain</p>
            <p style={{ fontSize: '2rem', color: '#ef4444' }}>{stats.max_risk.toFixed(1)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
