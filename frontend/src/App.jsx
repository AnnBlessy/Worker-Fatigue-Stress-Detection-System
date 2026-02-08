import { useState } from 'react';
import TopNav from './components/TopNav';
import LiveMonitoring from './components/LiveMonitoring';
import Analytics from './components/Analytics';
import Reports from './components/Reports';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './index.css';

function AppContent() {
  const [activeTab, setActiveTab] = useState('live');
  const { colors, isDark } = useTheme();

  const renderContent = () => {
    switch (activeTab) {
      case 'live':
        return <LiveMonitoring />;
      case 'analytics':
        return <Analytics />;
      case 'reports':
        return <Reports />;
      default:
        return <LiveMonitoring />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopNav activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={{ 
        flex: 1, 
        background: isDark 
          ? 'linear-gradient(135deg, #0a0e27 0%, #05060f 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        minHeight: '100vh'
      }}>
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;