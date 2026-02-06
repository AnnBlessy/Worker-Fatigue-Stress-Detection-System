import { Activity, BarChart3, FileText, Settings, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

const TopNav = ({ activeTab, setActiveTab }) => {
  const { theme, toggleTheme, colors, isDark } = useTheme();
  const [showSettings, setShowSettings] = useState(false);

  const menuItems = [
    { id: 'live', label: 'Live Monitoring', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: FileText },
  ];

  return (
    <nav style={{
      background: isDark ? 'rgba(10, 14, 39, 0.8)' : '#ffffff',
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${colors.border}`,
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: isDark ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* Logo */}
      <div>
        <h1 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          color: colors.accent, 
          letterSpacing: '1px',
          margin: 0
        }}>
          WorkerGuard
        </h1>
      </div>

      {/* Navigation Links */}
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        {menuItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: isActive ? colors.accent : colors.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.95rem',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.25s ease',
                paddingBottom: '0.5rem',
                borderBottom: isActive ? `2px solid ${colors.accent}` : '2px solid transparent',
                padding: '0.5rem 1rem'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.color = colors.accent;
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.color = colors.textSecondary;
                }
              }}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}

        {/* Settings Icon */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowSettings(!showSettings)}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textSecondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              fontSize: '1rem',
              transition: 'all 0.25s ease',
              padding: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = colors.accent;
            }}
            onMouseLeave={(e) => {
              e.target.style.color = colors.textSecondary;
            }}
          >
            <Settings size={20} />
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              background: colors.cardBackground,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              overflow: 'hidden',
              minWidth: '180px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              zIndex: 1000
            }}>
              <button
                onClick={() => {
                  toggleTheme();
                  setShowSettings(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'transparent',
                  border: 'none',
                  color: colors.textPrimary,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  fontSize: '0.9rem',
                  transition: 'all 0.25s ease',
                  textAlign: 'left',
                  borderBottom: `1px solid ${colors.border}`
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = isDark ? 'rgba(0, 217, 255, 0.1)' : '#f0f4ff';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                }}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>

              <div style={{
                padding: '0.5rem 1rem',
                fontSize: '0.75rem',
                color: colors.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                borderTop: `1px solid ${colors.border}`
              }}>
                Current: {theme === 'dark' ? 'Dark' : 'Light'}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
