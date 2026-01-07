
import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight, Users, ArrowRight, Loader2, Tag, Calendar, DollarSign } from 'lucide-react';
import { collection, addDoc, updateDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Client, Movement } from '../types';

interface MovementFormWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (tipo: 'Entrada' | 'Saída') => void;
  initialData?: Movement | null;
}

export const MovementFormWidget: React.FC<MovementFormWidgetProps> = ({ isOpen, onClose, onSuccess, initialData }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    tipo: 'Entrada' as 'Entrada' | 'Saída',
    categoria: '',
    descricao: '',
    valor: '',
    status: 'Pendente' as Movement['status'],
    vencimento: new Date().toISOString().split('T')[0],
    observacao: '',
    idRelacionado: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    
    const unsub = onSnapshot(collection(db, 'cliente'), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });

    if (initialData) {
      setFormData({
        tipo: initialData.tipo,
        categoria: initialData.categoria || '',
        descricao: initialData.descricao || '',
        valor: initialData.valor.toString(),
        status: initialData.status,
        vencimento: initialData.vencimento,
        observacao: initialData.observacao || '',
        idRelacionado: initialData.idRelacionado || ''
      });
    } else {
      setFormData({
        tipo: 'Entrada', categoria: '', descricao: '', valor: '',
        status: 'Pendente', vencimento: new Date().toISOString().split('T')[0],
        observacao: '', idRelacionado: ''
      });
    }

    return () => unsub();
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.valor || !formData.vencimento) {
      alert("Valor e Vencimento são campos obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        tipo: formData.tipo,
        categoria: formData.categoria,
        descricao: formData.descricao,
        valor: Number(formData.valor),
        status: formData.status,
        vencimento: formData.vencimento,
        observacao: formData.observacao,
        idRelacionado: formData.idRelacionado,
        updatedAt: serverTimestamp()
      };
      
      if (initialData?.id) {
        await updateDoc(doc(db, 'financeiro', initialData.id), payload);
        onClose();
      } else {
        await addDoc(collection(db, 'financeiro'), { ...payload, createdAt: serverTimestamp() });
        onSuccess(formData.tipo);
      }
      
      setFormData({
        tipo: 'Entrada', categoria: '', descricao: '', valor: '',
        status: 'Pendente', vencimento: new Date().toISOString().split('T')[0],
        observacao: '', idRelacionado: ''
      });
    } catch (err) {
      console.error("Erro ao salvar financeiro:", err);
      alert("Falha ao registrar movimentação.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="px-8 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-slate-900 rounded-xl">
              <DollarSign size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-lg tracking-tight leading-none">
                {initialData ? 'Editar Lançamento' : 'Novo Registro Financeiro'}
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Gestão JPS Steel</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white p-2 rounded-xl text-slate-400 hover:text-red-600 shadow-sm transition-colors border border-slate-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-5 flex p-1 bg-slate-100 rounded-2xl border border-slate-200/50">
              <button 
                type="button"
                onClick={() => setFormData({...formData, tipo: 'Entrada'})}
                className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all flex items-center justify-center ${formData.tipo === 'Entrada' ? 'bg-white text-green-600 shadow-lg' : 'text-slate-500 opacity-60'}`}
              >
                <ArrowUpRight size={14} className="mr-1.5" /> ENTRADA
              </button>
              <button 
                type="button"
                onClick={() => setFormData({...formData, tipo: 'Saída'})}
                className={`flex-1 py-3 text-[10px] font-black rounded-xl transition-all flex items-center justify-center ${formData.tipo === 'Saída' ? 'bg-white text-red-600 shadow-lg' : 'text-slate-500 opacity-60'}`}
              >
                <ArrowDownRight size={14} className="mr-1.5" /> SAÍDA
              </button>
            </div>

            <div className="md:col-span-4 relative">
              <label className="absolute -top-2 left-4 px-1 bg-white text-[9px] font-black text-slate-400 uppercase tracking-widest z-10">Valor do Lançamento *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">R$</span>
                <input 
                  type="number" 
                  required 
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 transition-all font-black text-black text-lg outline-none"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={e => setFormData({...formData, valor: e.target.value})}
                />
              </div>
            </div>

            <div className="md:col-span-3 relative">
              <label className="absolute -top-2 left-4 px-1 bg-white text-[9px] font-black text-slate-400 uppercase tracking-widest z-10">Vencimento *</label>
              <input 
                type="date" 
                required
                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 transition-all text-sm font-black text-black outline-none"
                value={formData.vencimento}
                onChange={e => setFormData({...formData, vencimento: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                <Tag size={10} className="mr-1" /> Categoria
              </label>
              <input 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-bold text-black outline-none"
                placeholder="Ex: Insumos, Obra..."
                value={formData.categoria}
                onChange={e => setFormData({...formData, categoria: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                <Calendar size={10} className="mr-1" /> Status Atual
              </label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-black text-black outline-none cursor-pointer"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as any})}
              >
                <option value="Pendente">Pendente</option>
                <option value="Consolidado">Consolidado</option>
                <option value="Arquivado">Arquivado</option>
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                <Users size={10} className="mr-1" /> Cliente (Opcional)
              </label>
              <select 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-bold text-black outline-none cursor-pointer"
                value={formData.idRelacionado}
                onChange={e => setFormData({...formData, idRelacionado: e.target.value})}
              >
                <option value="">Nenhum vínculo</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.displayName}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Descrição detalhada</label>
              <input 
                required 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-bold text-black outline-none"
                placeholder="Ex: Pagamento referente à manutenção..."
                value={formData.descricao}
                onChange={e => setFormData({...formData, descricao: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Informações adicionais</label>
              <textarea 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/5 transition-all text-xs font-medium text-black h-[42px] resize-none outline-none leading-tight"
                placeholder="Dados bancários, links, etc..."
                value={formData.observacao}
                onChange={e => setFormData({...formData, observacao: e.target.value})}
              ></textarea>
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  <span className="uppercase tracking-widest text-xs">{initialData ? 'SALVAR ALTERAÇÕES' : 'FINALIZAR LANÇAMENTO NO CAIXA'}</span>
                  <ArrowRight size={18} strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
