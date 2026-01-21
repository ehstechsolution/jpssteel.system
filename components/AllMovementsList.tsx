import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Search, Eye, FileText, ArrowUpRight, ArrowDownRight, 
  Archive, Info, X, Calendar, Tag, Users, Repeat
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Movement, Client } from '../types';

interface AllMovementsListProps {
  onBack: () => void;
}

export const AllMovementsList: React.FC<AllMovementsListProps> = ({ onBack }) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);

  useEffect(() => {
    // Busca todas as movimentações sem filtros de status
    const q = query(collection(db, 'financeiro'), orderBy('vencimento', 'desc'));
    const unsubMovements = onSnapshot(q, (snap) => {
      setMovements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement)));
    }, (error) => {
      console.error("Erro ao carregar movimentações:", error);
    });

    const unsubClients = onSnapshot(collection(db, 'cliente'), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });

    return () => { unsubMovements(); unsubClients(); };
  }, []);

  const filteredMovements = movements.filter(m => 
    (m.descricao || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.categoria || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatMovementDate = (dateStr: string) => {
    if (!dateStr) return '---';
    try {
      return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');
    } catch (e) {
      return '---';
    }
  };

  const DetailsModal = ({ movement, onClose }: { movement: Movement, onClose: () => void }) => {
    const client = clients.find(c => c.id === movement.idRelacionado);
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
          <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Archive size={24} className="text-slate-400" />
              <h3 className="font-black text-xl uppercase tracking-tighter">Histórico de Lançamento</h3>
            </div>
            <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-8 space-y-6 text-black">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor</p>
                <p className={`text-2xl font-black ${movement.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                  R$ {(movement.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status Final</p>
                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-block mt-1 ${
                    movement.status === 'Consolidado' ? 'bg-green-100 text-green-700' : 
                    movement.status === 'Arquivado' ? 'bg-slate-100 text-slate-500' : 
                    movement.status === 'Cancelado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                }`}>
                    {movement.status || 'Pendente'}
                </span>
              </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><Tag size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categoria</p>
                    <p className="text-sm font-bold text-slate-800">{movement.categoria || 'Não informada'}</p>
                  </div>
               </div>
               <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><FileText size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</p>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                      {movement.descricao || 'Sem descrição'}
                      {movement.parcelaAtual && (
                        <span className="ml-2 inline-flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-black">
                          <Repeat size={10} className="mr-1" /> Parcela {movement.parcelaAtual}/{movement.totalParcelas}
                        </span>
                      )}
                    </p>
                  </div>
               </div>
               <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><Calendar size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vencimento original</p>
                    <p className="text-sm font-bold text-slate-800">{formatMovementDate(movement.vencimento)}</p>
                  </div>
               </div>
            </div>

            <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
              Fechar Histórico
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-2">
        <button onClick={onBack} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800">Histórico Completo</h1>
          <p className="text-xs md:text-sm text-slate-500">Exibindo inclusive movimentações arquivadas.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar em todo o histórico..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-[0.15em] font-black">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Descrição</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Ver</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredMovements.map((mov) => (
                <tr key={mov.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-slate-800">
                      {formatMovementDate(mov.vencimento)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-800">{mov.descricao || 'Sem descrição'}</p>
                    <span className="text-[9px] font-black text-blue-600 uppercase">{mov.categoria || 'Geral'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      mov.status === 'Consolidado' ? 'bg-green-100 text-green-700' : 
                      mov.status === 'Arquivado' ? 'bg-slate-100 text-slate-500' : 
                      mov.status === 'Cancelado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {mov.status || 'Pendente'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-black text-sm ${mov.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {(mov.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                        onClick={() => setSelectedMovement(mov)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    >
                        <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredMovements.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center opacity-20">
                        <Archive size={64} className="mb-4 text-black" />
                        <p className="font-black uppercase tracking-widest text-sm text-slate-900">Histórico vazio</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMovement && (
        <DetailsModal movement={selectedMovement} onClose={() => setSelectedMovement(null)} />
      )}
    </div>
  );
};