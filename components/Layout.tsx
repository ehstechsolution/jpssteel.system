
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  FileText, 
  ArrowLeftRight, 
  Settings as SettingsIcon,
  Menu,
  X,
  Bell
} from 'lucide-react';
import { Page } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: Page.Dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { id: Page.Clients, label: 'Clientes', icon: Users },
    { id: Page.Services, label: 'Serviços', icon: Wrench },
    { id: Page.Budget, label: 'Orçamentos', icon: FileText },
    { id: Page.Movements, label: 'Movimentações', icon: ArrowLeftRight },
    { id: Page.Settings, label: 'Configurações', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-slate-900 text-white sticky top-0 h-screen shadow-2xl z-40">
        <div className="p-8 flex flex-col items-center">
          <img src="https://i.ibb.co/PZDD4Dfh/logo.png" alt="JPS Steel Logo" className="w-40 mb-2 drop-shadow-lg" />
          <h1 className="text-sm font-bold tracking-widest text-blue-400 uppercase mt-2">Steel Management</h1>
        </div>
        
        <nav className="flex-1 mt-6 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activePage === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activePage === item.id ? 'text-white' : 'group-hover:text-blue-400 transition-colors'} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">© 2024 JPS Steel<br/>Versão 2.4.0</p>
        </div>
      </aside>

      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 bottom-0 left-0 w-72 bg-slate-900 text-white z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex justify-between items-center">
          <img src="https://i.ibb.co/PZDD4Dfh/logo.png" alt="JPS Steel Logo" className="w-32" />
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <nav className="mt-4 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl ${
                activePage === item.id ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600">
              <Menu size={24} />
            </button>
            <span className="ml-4 font-bold text-slate-800">JPS Steel</span>
          </div>
          
          <div className="hidden lg:block">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {navItems.find(i => i.id === activePage)?.label}
            </h2>
            <p className="text-xs text-slate-500">Gestão de Montagens Industriais</p>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">Administrador</p>
                <p className="text-xs text-green-600 font-medium">Online</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border-2 border-blue-200">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-4 lg:p-8 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {children}
        </div>
      </main>
    </div>
  );
};
