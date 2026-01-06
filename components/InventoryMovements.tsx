
import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, ArrowDownRight, Search, Plus, Filter, AlertTriangle, Calendar, Info
} from 'lucide-react';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Movement } from '../types';

export const InventoryMovements: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'Entrada' as 'Entrada' | 'Saída',
    category: '',
    description: '',
    value: 0,
    status: 'Confirmado' as 'Confirmado' | 'Pendente'
  });

  useEffect(() => {
    const q = query(collection(db, 'movements'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setMovements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement)));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'movements'), {
        ...formData,
        date: new Date().toISOString(),
        value: Number(formData.value)
      });
      setIsModalOpen(false);
      setFormData({ type: 'Entrada', category: '', description: '', value: 0, status: 'Confirmado' });
    } catch (err) {
      console.error(err);
    }
  };

  const totalIn = movements.filter(m => m.type === 'Entrada').reduce((acc, curr) => acc + curr.value, 0);
  const totalOut = movements.filter(m => m.type === 'Saída').reduce((acc, curr) => acc + curr.value, 0);
  const balance = totalIn - totalOut;

  const pendingAlerts = movements.filter(m => m.status === 'Pendente');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Movimentações</h1>
          <p className="text-slate-500">Controle financeiro e fluxo de materiais.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg"
        >
          <Plus size={20} />
          <span>Registrar Movimento</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm font-medium mb-1">Saldo em Caixa</p>
          <p className={`text-2xl font-black ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-4 flex items-center text-xs space-x-4">
            <span className="flex items-center text-green-600">
              <ArrowUpRight size={14} className="mr-1" /> R$ {totalIn.toLocaleString('pt-BR')}
            </span>
            <span className="flex items-center text-red-600">
              <ArrowDownRight size={14} className="mr-1" /> R$ {totalOut.toLocaleString('pt-BR')}
            </span>
          </div>
        </div>

        {pendingAlerts.length > 0 && (
          <div className="md:col-span-2 bg-amber-50 border border-amber-200 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-amber-800">Atenção: Movimentações Pendentes</h4>
              <p className="text-sm text-amber-700">Você possui {pendingAlerts.length} lançamentos aguardando confirmação ou pagamento.</p>
            </div>
            <button className="hidden sm:block px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-lg hover:bg-amber-700 transition-colors">
              Ver Todas
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Data / Categoria</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {movements.map((mov) => (
                <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${mov.type === 'Entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {mov.type === 'Entrada' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">{mov.category}</p>
                        <p className="text-sm text-slate-600 font-medium">{new Date(mov.date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    {mov.description}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${mov.status === 'Confirmado' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {mov.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-black ${mov.type === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    {mov.type === 'Entrada' ? '+' : '-'} R$ {mov.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              {movements.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                    Nenhuma movimentação registrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Registrar Movimentação</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex p-1 bg-slate-100 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'Entrada'})}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'Entrada' ? 'bg-white text-green-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Entrada
                </button>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, type: 'Saída'})}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${formData.type === 'Saída' ? 'bg-white text-red-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Saída
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Categoria</label>
                <input 
                  required 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Ex: Materiais, Salários, Adiantamento..."
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">Descrição Detalhada</label>
                <input 
                  required 
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all"
                  placeholder="Ex: Pagamento referente a chapas de aço 2mm"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Valor (R$)</label>
                  <input 
                    type="number" 
                    required 
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all font-bold"
                    value={formData.value}
                    onChange={e => setFormData({...formData, value: Number(e.target.value)})}
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Status</label>
                  <select 
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 transition-all"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value as 'Confirmado' | 'Pendente'})}
                  >
                    <option value="Confirmado">Confirmado</option>
                    <option value="Pendente">Pendente</option>
                  </select>
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
                  className="px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all"
                >
                  Salvar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
