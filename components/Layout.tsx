
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
  const APP_LOGO = "https://i.ibb.co/PZDD4Dfh/logo.png";

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
          <div className="w-full flex justify-center bg-white/5 p-4 rounded-2xl border border-white/10 mb-4">
            <img src={APP_LOGO} alt="JPS Steel Logo" className="w-auto h-16 object-contain" />
          </div>
          <h1 className="text-xs font-bold tracking-[0.2em] text-blue-400 uppercase">JPS Steel</h1>
          <p className="text-[10px] text-slate-500 font-medium">Montagens Industriais</p>
        </div>
        
        <nav className="flex-1 mt-2 px-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activePage === item.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} className={activePage === item.id ? 'text-white' : 'group-hover:text-blue-400 transition-colors'} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-white/5">
          <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">© 2024 JPS Steel</p>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 bottom-0 left-0 w-72 bg-slate-900 text-white z-50 transform transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center border-b border-white/5">
          <img src={APP_LOGO} alt="JPS Steel Logo" className="h-10" />
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
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 lg:h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 shadow-sm">
          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-600">
              <Menu size={24} />
            </button>
            <img src={APP_LOGO} alt="JPS Steel" className="h-8 ml-2" />
          </div>
          
          <div className="hidden lg:block">
            <h2 className="text-lg font-bold text-slate-800 capitalize">
              {navItems.find(i => i.id === activePage)?.label}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                AD
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 lg:p-8 overflow-y-auto max-h-[calc(100vh-4rem)] lg:max-h-[calc(100vh-5rem)]">
          {children}
        </div>
      </main>
    </div>
  );
};
