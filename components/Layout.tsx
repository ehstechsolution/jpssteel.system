
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Wrench, 
  FileText, 
  ArrowLeftRight, 
  Settings as SettingsIcon,
  Menu,
  X,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Info,
  ChevronRight,
  Tag,
  DollarSign,
  FileSearch
} from 'lucide-react';
import { collection, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Page, Movement, NotificationSettings, Client } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activePage: Page;
  onNavigate: (page: Page) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [pendingMovements, setPendingMovements] = useState<Movement[]>([]);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedNotifDetail, setSelectedNotifDetail] = useState<Movement | null>(null);
  
  const notifRef = useRef<HTMLDivElement>(null);
  const APP_LOGO = "https://i.ibb.co/PZDD4Dfh/logo.png";
  const USER_AVATAR = "https://i.ibb.co/LdxXv1CF/empresa-Oliginal.png";

  useEffect(() => {
    // 1. Carregar Configurações de Notificação
    const unsubSettings = onSnapshot(doc(db, 'settings', 'notifications'), (snap) => {
      if (snap.exists()) {
        setNotifSettings(snap.data() as NotificationSettings);
      }
    });

    // 2. Carregar Clientes para os Detalhes
    const unsubClients = onSnapshot(collection(db, 'cliente'), (snap) => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
    });

    // 3. Fechar dropdown ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      unsubSettings();
      unsubClients();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!notifSettings?.alertMovimentacao) {
      setPendingMovements([]);
      return;
    }

    const unsubFinanceiro = onSnapshot(collection(db, 'financeiro'), (snap) => {
      const allMovements = snap.docs.map(d => ({ id: d.id, ...d.data() } as Movement));
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const limitDate = new Date();
      limitDate.setDate(today.getDate() + notifSettings.diasMovimentacao);
      limitDate.setHours(23, 59, 59, 999);

      const filtered = allMovements.filter(m => {
        if (m.status !== 'Pendente') return false;
        const dueDate = new Date(m.vencimento + 'T12:00:00');
        return dueDate >= today && dueDate <= limitDate;
      }).sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());

      setPendingMovements(filtered);
    });

    return () => unsubFinanceiro();
  }, [notifSettings]);

  const navItems = [
    { id: Page.Dashboard, label: 'Dashboard', icon: LayoutDashboard },
    { id: Page.Clients, label: 'Clientes', icon: Users },
    { id: Page.Services, label: 'Serviços', icon: Wrench },
    { id: Page.Budget, label: 'Orçamentos', icon: FileText },
    { id: Page.Movements, label: 'Movimentações', icon: ArrowLeftRight },
    { id: Page.Settings, label: 'Configurações', icon: SettingsIcon },
  ];

  // Modal de Detalhes Interno para Notificações
  const DetailsModal = ({ movement, onClose }: { movement: Movement, onClose: () => void }) => {
    const client = clients.find(c => c.id === movement.idRelacionado);
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
          <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Info size={24} className="text-blue-400" />
              <h3 className="font-black text-xl uppercase tracking-tighter">Detalhes da Pendência</h3>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor</p>
                <p className={`text-2xl font-black ${movement.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {movement.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vencimento</p>
                <p className="text-lg font-black text-slate-900">
                  {new Date(movement.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
            <div className="space-y-4">
               <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><Tag size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</p>
                    <p className="text-sm font-bold text-slate-800">{movement.categoria || 'Geral'}</p>
                  </div>
               </div>
               <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><FileSearch size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</p>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">{movement.descricao}</p>
                  </div>
               </div>
               <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><Users size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cliente Relacionado</p>
                    <p className="text-sm font-bold text-slate-800">{client ? client.displayName : 'Sem vínculo'}</p>
                  </div>
               </div>
            </div>
            <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase text-xs tracking-widest">
              Entendido
            </button>
          </div>
        </div>
      </div>
    );
  };

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
        {/* TopBar Premium */}
        <header className="h-20 lg:h-24 bg-white/70 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-30 shadow-sm transition-all">
          <div className="flex items-center lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2.5 bg-slate-100 rounded-xl text-slate-600 mr-4">
              <Menu size={22} />
            </button>
            <img src={APP_LOGO} alt="JPS Steel" className="h-10" />
          </div>
          
          <div className="hidden lg:block">
            <div className="flex items-center space-x-2">
               <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
               <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                {navItems.find(i => i.id === activePage)?.label}
              </h2>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest ml-4 mt-0.5">Painel de Controle v2.0</p>
          </div>

          <div className="flex items-center space-x-6">
            {/* Notificações Widget */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-3 rounded-2xl transition-all duration-300 ${isNotifOpen ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
              >
                <Bell size={22} strokeWidth={isNotifOpen ? 2.5 : 2} />
                {pendingMovements.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full border-2 border-white flex items-center justify-center animate-bounce">
                    {pendingMovements.length}
                  </span>
                )}
              </button>

              {/* Notificações Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 ring-4 ring-slate-900/5">
                  <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tighter">Alertas Financeiros</h4>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest">Próximos {notifSettings?.diasMovimentacao} dias</p>
                    </div>
                    <span className="px-2.5 py-1 bg-white/10 rounded-lg text-[10px] font-black">
                      {pendingMovements.length} Pendentes
                    </span>
                  </div>
                  
                  <div className="max-h-[400px] overflow-y-auto scrollbar-hide bg-slate-50/30">
                    {pendingMovements.length === 0 ? (
                      <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                          <Bell size={32} />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Tudo em dia!</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {pendingMovements.map((mov) => (
                          <button 
                            key={mov.id}
                            onClick={() => {
                              setSelectedNotifDetail(mov);
                              setIsNotifOpen(false);
                            }}
                            className="w-full p-5 text-left hover:bg-white transition-all group flex items-start space-x-4"
                          >
                            <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${mov.tipo === 'Entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                              {mov.tipo === 'Entrada' ? <ArrowUpRight size={16} strokeWidth={3} /> : <ArrowDownRight size={16} strokeWidth={3} />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest truncate">{mov.categoria}</p>
                                <span className="text-[10px] font-black text-slate-400">
                                  {new Date(mov.vencimento + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{mov.descricao}</p>
                              <p className="text-sm font-black text-slate-900 mt-1">
                                R$ {mov.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <ChevronRight size={14} className="mt-4 text-slate-300 group-hover:text-blue-600 transition-colors" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4 bg-white border-t border-slate-50">
                    <button 
                      onClick={() => onNavigate(Page.Movements)}
                      className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all"
                    >
                      Ir para Financeiro Completo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Perfil Admin Premium */}
            <div className="flex items-center space-x-4 pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tighter leading-none">Diretoria</p>
                <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">Admin JPS</p>
              </div>
              <div className="relative group">
                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm p-0.5 transition-all group-hover:border-blue-600 cursor-pointer overflow-hidden ring-4 ring-slate-100/50">
                  <img src={USER_AVATAR} alt="Admin" className="w-full h-full object-cover rounded-[0.8rem]" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 overflow-y-auto max-h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-6rem)] scrollbar-hide">
          {children}
        </div>
      </main>

      {/* Modal de Detalhes vindo da Notificação */}
      {selectedNotifDetail && (
        <DetailsModal 
          movement={selectedNotifDetail} 
          onClose={() => setSelectedNotifDetail(null)} 
        />
      )}
    </div>
  );
};
