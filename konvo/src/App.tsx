import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/pages/Dashboard';
import { Conversations } from './components/pages/Conversations';
import { Contacts } from './components/pages/Contacts';
import { Campaigns } from './components/pages/Campaigns';
import { Flows } from './components/pages/Flows';
import { Analytics } from './components/pages/Analytics';
import { Settings } from './components/pages/Settings';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'conversations':
        return <Conversations />;
      case 'contacts':
        return <Contacts />;
      case 'campaigns':
        return <Campaigns />;
      case 'flows':
        return <Flows />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 overflow-auto">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;
