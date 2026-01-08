
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Calendar, CheckCircle2, Clock, AlertTriangle, Filter, MoreVertical, X, Wrench, Edit2, MapPin, Trash2, ClipboardList
} from 'lucide-react';
import { collection, onSnapshot, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Service } from '../types';
import { ServiceFormWidget } from './ServiceFormWidget';
import { ConfirmationDialog } from './ConfirmationDialog';

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Confirmação de Exclusão
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'servico'), orderBy('createdAt', 'desc'));
    const unsubServices = onSnapshot(q, (snap) => {
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });
    return () => unsubServices();
  }, []);

  const handleDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteDoc(doc(db, 'servico', serviceToDelete));
      setIsConfirmOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir serviço.");
    }
  };

  const getStatusStyle = (status: Service['statusServico']) => {
    switch (status) {
      case 'Concluido': return 'text-green-600 bg-green-50 border-green-100';
      case 'Em execução': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'Cancelado': return 'text-red-600 bg-red-50 border-red-100';
      case 'Em análise': return 'text-purple-600 bg-purple-50 border-purple-100';
      default: return 'text-amber-600 bg-amber-50 border-amber-100';
    }
  };

  const filteredServices = services.filter(s => 
    s.nomeCliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.localServico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Gestão de Serviços</h1>
          <p className="text-slate-500 text-sm font-medium">Cronograma operacional e controle de obras JPS Steel.</p>
        </div>
        <button 
          onClick={() => { setEditingService(null); setIsModalOpen(true); }}
          className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl transition-all active:scale-95"
        >
          <Plus size={20} strokeWidth={3} />
          <span>NOVA ORDEM DE SERVIÇO</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente, descrição ou local..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="hidden md:flex items-center space-x-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
           <span className="px-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtros:</span>
           {['Todos', 'Execução', 'Concluido'].map(f => (
             <button key={f} className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${f === 'Todos' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
               {f}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-xl transition-all overflow-hidden group flex flex-col h-full">
            <div className="p-8 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(service.statusServico)}`}>
                  {service.statusServico}
                </span>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => { setEditingService(service); setIsModalOpen(true); }}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => { setServiceToDelete(service.id); setIsConfirmOpen(true); }}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-50 shadow-sm flex-shrink-0">
                  <img src={service.fotoCliente} alt={service.nomeCliente} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 truncate">Contratante</p>
                  <h3 className="font-black text-slate-900 text-lg leading-tight truncate group-hover:text-blue-600 transition-colors">
                    {service.nomeCliente}
                  </h3>
                </div>
              </div>

              <div className="space-y-4 mb-6 flex-1">
                <div className="flex items-start">
                  <MapPin size={14} className="text-slate-400 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-xs text-slate-500 font-bold leading-relaxed line-clamp-2">{service.localServico}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center">
                    {/* Fix: Added ClipboardList to imports above */}
                    <ClipboardList size={10} className="mr-1" /> Descrição Técnica
                  </p>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-3 italic">
                    {service.descricao}
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Data Agendada</p>
                  <p className="text-xs font-black text-slate-800 flex items-center">
                    <Calendar size={12} className="mr-1.5 text-blue-600" />
                    {new Date(service.dataServico + 'T12:00:00').toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Valor do Serviço</p>
                  <p className="text-lg font-black text-slate-900 tracking-tighter">
                    R$ {service.valorServico.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredServices.length === 0 && (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-400 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
              <Wrench size={40} className="opacity-20" />
            </div>
            <p className="font-black uppercase tracking-[0.2em] text-sm text-slate-300">Nenhum serviço em cronograma</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="mt-6 text-blue-600 font-black text-xs uppercase tracking-widest hover:underline"
            >
              Iniciar primeiro serviço agora
            </button>
          </div>
        )}
      </div>

      <ServiceFormWidget 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={() => {}}
        initialData={editingService}
      />

      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        title="Excluir Ordem de Serviço"
        message="Deseja realmente remover este serviço do sistema? Esta ação é irreversível."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
