import { Activity, BarChart3, FileText, Settings } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'live', label: 'Live Monitoring', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
  <div style={{
    width: '260px',
    height: '100vh',
    position: 'fixed',
    left: 0,
    top: 0,
    background: 'linear-gradient(180deg, #0f1629 0%, #0a0e27 100%)',
    borderRight: '1px solid rgba(0, 217, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column'
  }}>
    {/* Logo */}
    <div style={{
      padding: '2rem 1.5rem',
      borderBottom: '1px solid rgba(0, 217, 255, 0.1)',
      background: 'linear-gradient(180deg, rgba(107, 92, 255, 0.1) 0%, transparent 100%)'
    }}>
      <h2 style={{ color: '#00d9ff', fontSize: '1.25rem', fontWeight: '700', letterSpacing: '1px' }}>
        WorkerGuard
      </h2>
      <p style={{ fontSize: '0.75rem', color: '#a0aec0', marginTop: '0.5rem', letterSpacing: '0.3px' }}>
        Fatigue Detection System
      </p>
    </div>

    {/* Navigation */}
    <nav style={{ flex: 1, padding: '1rem 0' }}>
      {menuItems.map(item => {
        const isActive = activeTab === item.id;
        const Icon = item.icon;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              width: '100%',
              padding: '0.85rem 1.5rem',
              background: isActive ? 'rgba(107, 92, 255, 0.2)' : 'transparent',
              borderLeft: isActive ? '3px solid #00d9ff' : '3px solid transparent',
              color: isActive ? '#00d9ff' : '#a0aec0',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              fontSize: '0.95rem',
              fontWeight: isActive ? '600' : '500'
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.target.style.background = 'rgba(107, 92, 255, 0.1)';
                e.target.style.color = '#00d9ff';
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.target.style.background = 'transparent';
                e.target.style.color = '#a0aec0';
              }
            }}
          >
            <Icon size={18} />
            {item.label}
          </button>
        );
      })}
    </nav>

    {/* Footer */}
    <div style={{
      padding: '1.5rem',
      fontSize: '0.75rem',
      color: '#718096',
      textAlign: 'center',
      borderTop: '1px solid rgba(0, 217, 255, 0.1)',
      letterSpacing: '0.3px'
    }}>
      © 2026 WorkerGuard
    </div>
  </div>
);

};

export default Sidebar;