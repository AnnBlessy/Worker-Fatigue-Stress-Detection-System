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
      background: 'white',
      height: '100vh',
      boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100
    }}>
      {/* Logo */}
      <div style={{
        padding: '2rem 1.5rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          WorkerGuard
        </h2>
        <p style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          marginTop: '0.25rem'
        }}>
          Fatigue Detection System
        </p>
      </div>

      {/* Navigation */}
      <nav style={{
        flex: 1,
        padding: '1.5rem 0',
        overflowY: 'auto'
      }}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                padding: '0.875rem 1.5rem',
                border: 'none',
                background: isActive 
                  ? 'linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, transparent 100%)'
                  : 'transparent',
                borderLeft: isActive ? '3px solid #667eea' : '3px solid transparent',
                color: isActive ? '#667eea' : 'var(--text-secondary)',
                fontSize: '0.95rem',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'all 0.2s ease',
                textAlign: 'left'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        padding: '1.5rem',
        borderTop: '1px solid var(--border-color)',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)',
        textAlign: 'center'
      }}>
        <p>Version 1.0.0</p>
        <p style={{ marginTop: '0.25rem' }}>© 2026 WorkerGuard</p>
      </div>
    </div>
  );
};

export default Sidebar;