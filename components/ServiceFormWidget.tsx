
import React, { useState, useEffect } from 'react';
import { X, Wrench, ArrowRight, Loader2, Calendar, MapPin, DollarSign, FileText, ClipboardList } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Service, Client } from '../types';

interface ServiceFormWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: Service | null;
}

export const ServiceFormWidget: React.FC<ServiceFormWidgetProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    orcRelacionado: '',
    clienteRelacionado: '',
    nomeCliente: '',
    fotoCliente: '',
    dataServico: new Date().toISOString().split('T')[0],
    localServico: '',
    valorServico: '',
    statusServico: 'Em execução' as Service['statusServico'],
    descricao: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    
    // Buscar orçamentos aptos (PDF Gerado)
    const qBudgets = query(collection(db, 'orcamento'), where('status', '==', 'PDF Gerado'));
    const unsubBudgets = onSnapshot(qBudgets, (snap) => {
      setBudgets(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    // Buscar clientes para garantir fotos atualizadas se necessário
    const unsubClients = onSnapshot(collection(db, 'cliente'), (snap) => {
      setClients(snap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
    });

    if (initialData) {
      setFormData({
        orcRelacionado: initialData.orcRelacionado,
        clienteRelacionado: initialData.clienteRelacionado,
        nomeCliente: initialData.nomeCliente,
        fotoCliente: initialData.fotoCliente,
        dataServico: initialData.dataServico,
        localServico: initialData.localServico,
        valorServico: initialData.valorServico.toString(),
        statusServico: initialData.statusServico,
        descricao: initialData.descricao
      });
    }

    return () => {
      unsubBudgets();
      unsubClients();
    };
  }, [isOpen, initialData]);

  const handleBudgetSelect = (orcId: string) => {
    const selectedOrc = budgets.find(b => b.id === orcId);
    if (selectedOrc) {
      const client = clients.find(c => c.id === selectedOrc.idContratante);
      setFormData(prev => ({
        ...prev,
        orcRelacionado: orcId,
        clienteRelacionado: selectedOrc.idContratante || '',
        nomeCliente: selectedOrc.clienteOrc || '',
        fotoCliente: client?.fotoUrl || "https://i.ibb.co/LdxXv1CF/empresa-Oliginal.png",
        valorServico: selectedOrc.valorGlobal?.toString() || '',
        descricao: selectedOrc.descricaoOrc || ''
      }));
    } else {
      setFormData(prev => ({ ...prev, orcRelacionado: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orcRelacionado || !formData.dataServico || !formData.localServico || !formData.valorServico) {
      alert("Todos os campos marcados com * são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        orcRelacionado: formData.orcRelacionado,
        clienteRelacionado: formData.clienteRelacionado,
        nomeCliente: formData.nomeCliente,
        fotoCliente: formData.fotoCliente,
        dataServico: formData.dataServico,
        localServico: formData.localServico,
        valorServico: Number(formData.valorServico),
        statusServico: formData.statusServico,
        descricao: formData.descricao,
        updatedAt: serverTimestamp()
      };
      
      if (initialData?.id) {
        await updateDoc(doc(db, 'servico', initialData.id), payload);
      } else {
        await addDoc(collection(db, 'servico'), { ...payload, createdAt: serverTimestamp() });
      }

      // REGRA DE OURO: Atualizar status no orçamento
      await updateDoc(doc(db, 'orcamento', formData.orcRelacionado), {
        status: formData.statusServico
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar serviço:", err);
      alert("Falha ao registrar serviço industrial.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/20">
              <Wrench size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-xl tracking-tight leading-none">
                {initialData ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço'}
              </h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1.5">Módulo Operacional JPS Steel</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all border border-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Body com Scroll */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-8">
          
          {/* Vínculo com Orçamento */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
              <FileText size={12} className="mr-1.5 text-blue-600" /> Vínculo de Orçamento *
            </label>
            <select 
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-black text-black outline-none cursor-pointer"
              value={formData.orcRelacionado}
              onChange={e => handleBudgetSelect(e.target.value)}
            >
              <option value="">Selecione um orçamento aprovado...</option>
              {budgets.map(b => (
                <option key={b.id} value={b.id}>
                  {b.clienteOrc} - R$ {b.valorGlobal?.toLocaleString('pt-BR')} ({new Date(b.dataProposta).toLocaleDateString('pt-BR')})
                </option>
              ))}
            </select>
            {formData.orcRelacionado && (
               <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-xl border border-blue-100 animate-in fade-in slide-in-from-top-2">
                  <img src={formData.fotoCliente} className="w-8 h-8 rounded-lg object-cover border border-white" alt="Cliente" />
                  <span className="text-[10px] font-black text-blue-700 uppercase">Cliente: {formData.nomeCliente}</span>
               </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                <Calendar size={12} className="mr-1.5 text-blue-600" /> Data do Serviço *
              </label>
              <input 
                type="date"
                required
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-black text-black outline-none"
                value={formData.dataServico}
                onChange={e => setFormData({...formData, dataServico: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
                <DollarSign size={12} className="mr-1.5 text-blue-600" /> Valor do Serviço (R$) *
              </label>
              <input 
                type="number"
                required
                step="0.01"
                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-black text-black outline-none"
                placeholder="0,00"
                value={formData.valorServico}
                onChange={e => setFormData({...formData, valorServico: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
              <MapPin size={12} className="mr-1.5 text-blue-600" /> Local da Prestação *
            </label>
            <input 
              required
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-bold text-black outline-none"
              placeholder="Endereço completo da obra/fábrica..."
              value={formData.localServico}
              onChange={e => setFormData({...formData, localServico: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center">
              <ClipboardList size={12} className="mr-1.5 text-blue-600" /> Status do Serviço *
            </label>
            <select 
              className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-black text-black outline-none cursor-pointer"
              value={formData.statusServico}
              onChange={e => setFormData({...formData, statusServico: e.target.value as any})}
            >
              <option value="Aguardando início">Aguardando início</option>
              <option value="Em execução">Em execução</option>
              <option value="Concluido">Concluido</option>
              <option value="Cancelado">Cancelado</option>
              <option value="Em análise">Em análise</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição Técnica</label>
            <textarea 
              required
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-medium text-black h-40 resize-none outline-none leading-relaxed"
              placeholder="Descreva as atividades que serão realizadas..."
              value={formData.descricao}
              onChange={e => setFormData({...formData, descricao: e.target.value})}
            ></textarea>
          </div>
        </form>

        {/* Footer */}
        <div className="px-8 py-6 bg-white border-t border-slate-100 shrink-0">
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4.5 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-2xl transition-all flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50 group"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : (
              <>
                <span className="uppercase tracking-[0.2em] text-xs">
                  {initialData ? 'ATUALIZAR ORDEM DE SERVIÇO' : 'GERAR ORDEM DE SERVIÇO'}
                </span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
