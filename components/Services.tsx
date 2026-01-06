
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Calendar, CheckCircle2, Clock, AlertTriangle, Filter, MoreVertical, X, Wrench, Edit2
} from 'lucide-react';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Service, Client } from '../types';

export const Services: React.FC = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState({
    clientId: '',
    description: '',
    status: 'Pendente' as Service['status'],
    startDate: '',
    endDate: '',
    totalValue: 0,
    paymentStatus: 'Aberto' as Service['paymentStatus']
  });

  useEffect(() => {
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });
    const unsubClients = onSnapshot(collection(db, 'cliente'), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });
    return () => { unsubServices(); unsubClients(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find(c => c.id === formData.clientId);
    const data = {
      ...formData,
      clientName: client?.displayName || 'Cliente Desconhecido',
      totalValue: Number(formData.totalValue),
      updatedAt: serverTimestamp()
    };

    try {
      if (editingService) {
        await updateDoc(doc(db, 'services', editingService.id), data);
      } else {
        await addDoc(collection(db, 'services'), data);
      }
      setIsModalOpen(false);
      setEditingService(null);
      setFormData({ clientId: '', description: '', status: 'Pendente', startDate: '', endDate: '', totalValue: 0, paymentStatus: 'Aberto' });
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusColor = (status: Service['status']) => {
    switch (status) {
      case 'Concluído': return 'text-green-600 bg-green-50 border-green-200';
      case 'Em Andamento': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Cancelado': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-amber-600 bg-amber-50 border-amber-200';
    }
  };

  const getStatusIcon = (status: Service['status']) => {
    switch (status) {
      case 'Concluído': return <CheckCircle2 size={14} className="mr-1" />;
      case 'Em Andamento': return <Clock size={14} className="mr-1" />;
      case 'Cancelado': return <X size={14} className="mr-1" />;
      default: return <AlertTriangle size={14} className="mr-1" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Serviços</h1>
          <p className="text-slate-500">Cronograma e gestão de projetos industriais.</p>
        </div>
        <button 
          onClick={() => { setEditingService(null); setIsModalOpen(true); }}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-blue-900/20"
        >
          <Plus size={20} />
          <span>Novo Serviço</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <span className={`flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(service.status)}`}>
                  {getStatusIcon(service.status)}
                  {service.status}
                </span>
                <button 
                  onClick={() => {
                    setEditingService(service);
                    setFormData({
                      clientId: service.clientId,
                      description: service.description,
                      status: service.status,
                      startDate: service.startDate,
                      endDate: service.endDate,
                      totalValue: service.totalValue,
                      paymentStatus: service.paymentStatus
                    });
                    setIsModalOpen(true);
                  }}
                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 size={16} />
                </button>
              </div>
              
              <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-blue-600 transition-colors">
                {service.description}
              </h3>
              <p className="text-sm text-slate-500 font-medium mb-4">{service.clientName}</p>
              
              <div className="space-y-3 py-4 border-y border-slate-100 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center">
                    <Calendar size={14} className="mr-2" /> Início
                  </span>
                  <span className="text-slate-700 font-semibold">{new Date(service.startDate).toLocaleDateString('pt-BR')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 flex items-center">
                    <Clock size={14} className="mr-2" /> Previsão
                  </span>
                  <span className="text-slate-700 font-semibold">{new Date(service.endDate).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Valor do Contrato</p>
                  <p className="text-xl font-black text-slate-800">R$ {service.totalValue.toLocaleString('pt-BR')}</p>
                </div>
                <div className={`px-3 py-1 rounded-lg text-xs font-bold ${service.paymentStatus === 'Pago' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
                  {service.paymentStatus}
                </div>
              </div>
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
            <Wrench size={48} className="mb-4 opacity-20" />
            <p>Nenhum serviço registrado ainda.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingService ? 'Editar Serviço' : 'Cadastrar Novo Serviço'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Selecione o Cliente</label>
                <select 
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 font-medium"
                  value={formData.clientId}
                  onChange={e => setFormData({...formData, clientId: e.target.value})}
                >
                  <option value="">Escolha um cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.displayName}</option>)}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Descrição do Serviço</label>
                <input 
                  required 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 font-medium"
                  placeholder="Ex: Montagem de estrutura metálica Galpão A"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Data de Início</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 font-medium"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Previsão Término</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 font-medium"
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 font-medium"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as Service['status']})}
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Concluído">Concluído</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Valor Total (R$)</label>
                  <input 
                    type="number" 
                    required 
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-bold text-slate-900"
                    placeholder="0,00"
                    value={formData.totalValue}
                    onChange={e => setFormData({...formData, totalValue: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
