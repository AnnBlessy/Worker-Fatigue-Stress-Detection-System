import { useState } from 'react';
import Sidebar from './components/Sidebar';
import LiveMonitoring from './components/LiveMonitoring';
import Analytics from './components/Analytics';
import Reports from './components/Reports';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('live');

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
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={{ 
        flex: 1, 
        marginLeft: '260px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}>
        {renderContent()}
      </main>
    </div>
  );
}

export default App;