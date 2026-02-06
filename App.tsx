
import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Clients } from './components/Clients';
import { Services } from './components/Services';
import { BudgetCalculator } from './components/BudgetCalculator';
import { InventoryMovements } from './components/InventoryMovements';
import { AllMovementsList } from './components/AllMovementsList';
import { Passwords } from './components/Passwords';
import { Settings } from './components/Settings';
import { Page } from './types';
import { Lock, ShieldAlert, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.Dashboard);
  const [redirectClientId, setRedirectClientId] = useState<string | null>(null);
  const [budgetToClone, setBudgetToClone] = useState<any>(null);
  
  // PIN Protection State
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const REQUIRED_PIN = "101222";

  const handleBudgetFinish = (clientId: string) => {
    setBudgetToClone(null);
    setRedirectClientId(clientId);
    setCurrentPage(Page.Clients);
  };

  const navigateTo = (page: Page) => {
    if (page === Page.Passwords) {
      setIsPinModalOpen(true);
      setPinInput('');
    } else {
      if (page !== Page.Budget) setBudgetToClone(null);
      setCurrentPage(page);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    
    // Pequeno delay para UX
    setTimeout(() => {
      if (pinInput === REQUIRED_PIN) {
        setCurrentPage(Page.Passwords);
        setIsPinModalOpen(false);
      } else {
        alert("Falta de autorização! PIN incorreto.");
        setIsPinModalOpen(false);
        setCurrentPage(Page.Dashboard);
      }
      setIsAuthenticating(false);
    }, 600);
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
            onCloneBudget={(data) => {
              setBudgetToClone(data);
              setCurrentPage(Page.Budget);
            }}
          />
        );
      case Page.Services:
        return <Services />;
      case Page.Budget:
        return <BudgetCalculator initialData={budgetToClone} onFinish={handleBudgetFinish} />;
      case Page.Movements:
        return <InventoryMovements onNavigateToAll={() => setCurrentPage(Page.AllMovements)} />;
      case Page.AllMovements:
        return <AllMovementsList onBack={() => setCurrentPage(Page.Movements)} />;
      case Page.Passwords:
        return <Passwords />;
      case Page.Settings:
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      <Layout activePage={currentPage} onNavigate={navigateTo}>
        {renderPage()}
      </Layout>

      {/* PIN Access Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[150] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl shadow-blue-500/20">
                <Lock size={32} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Área Restrita</h3>
              <p className="text-slate-800 text-xs font-bold mb-8">Digite o PIN de acesso para visualizar as credenciais confidenciais.</p>
              
              <form onSubmit={handlePinSubmit} className="w-full space-y-4">
                <input 
                  type="password"
                  autoFocus
                  maxLength={6}
                  placeholder="••••••"
                  className="w-full py-4 bg-slate-100 border-2 border-slate-100 focus:border-blue-600 focus:bg-white rounded-2xl text-center text-2xl font-black tracking-[0.5em] transition-all outline-none text-black"
                  value={pinInput}
                  onChange={e => setPinInput(e.target.value)}
                />
                
                <button 
                  type="submit"
                  disabled={isAuthenticating || pinInput.length < 4}
                  className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  {isAuthenticating ? <Loader2 className="animate-spin" size={20} /> : <span>VALIDAR ACESSO</span>}
                </button>
                
                <button 
                  type="button"
                  onClick={() => setIsPinModalOpen(false)}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                >
                  Cancelar Navegação
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default App;
