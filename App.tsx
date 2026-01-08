
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Services } from './components/Services';
import { BudgetCalculator } from './components/BudgetCalculator';
import { InventoryMovements } from './components/InventoryMovements';
import { Settings } from './components/Settings';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [redirectClientId, setRedirectClientId] = useState<string | null>(null);

  const handleBudgetFinish = (clientId: string) => {
    setRedirectClientId(clientId);
    setCurrentPage(Page.Clients);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard />;
      case Page.Clients:
        return (
          <Clients 
            initialClientId={redirectClientId} 
            onClearRedirect={() => setRedirectClientId(null)} 
          />
        );
      case Page.Services:
        return <Services />;
      case Page.Budget:
        return <BudgetCalculator onFinish={handleBudgetFinish} />;
      case Page.Movements:
        return <InventoryMovements />;
      case Page.Settings:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activePage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default App;
