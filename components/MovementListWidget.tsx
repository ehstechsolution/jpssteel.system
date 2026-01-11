
import React, { useState } from 'react';
import { 
  ArrowUpRight, ArrowDownRight, Search, Eye, Edit2, Trash2, FileText, X, Tag, Calendar, Users, Info, Repeat
} from 'lucide-react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Movement, Client } from '../types';
import { ConfirmationDialog } from './ConfirmationDialog';

interface MovementListWidgetProps {
  movements: Movement[];
  clients: Client[];
  onEdit: (movement: Movement) => void;
}

export const MovementListWidget: React.FC<MovementListWidgetProps> = ({ movements, clients, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [movementToDelete, setMovementToDelete] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  // Regras de Filtragem e Ordenação
  const filteredAndSortedMovements = movements
    .filter(m => {
      // 1. Ocultar Arquivados
      if (m.status === 'Arquivado') return false;
      
      // 2. Ocultar Cancelados vencidos (data anterior a hoje)
      if (m.status === 'Cancelado' && m.vencimento < todayStr) return false;
      
      // 3. Busca por Termo
      const matchesSearch = 
        m.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesSearch;
    })
    .sort((a, b) => {
      // Ordenação: Do mais próximo para o mais distante (Ascendente)
      return new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime();
    });

  const handleDelete = async () => {
    if (!movementToDelete) return;
    try {
      await deleteDoc(doc(db, 'financeiro', movementToDelete));
      setIsConfirmOpen(false);
      setMovementToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir registro.");
    }
  };

  const DetailsModal = ({ movement, onClose }: { movement: Movement, onClose: () => void }) => {
    const client = clients.find(c => c.id === movement.idRelacionado);
    return (
      <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
          <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Info size={24} className="text-blue-400" />
              <h3 className="font-black text-xl uppercase tracking-tighter">Detalhes do Lançamento</h3>
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
                    <p className="text-sm font-bold text-slate-800">{movement.categoria || 'Não informada'}</p>
                  </div>
               </div>
               <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><FileText size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Descrição</p>
                    <p className="text-sm font-bold text-slate-800 leading-relaxed">
                      {movement.descricao}
                      {movement.parcelaAtual && (
                        <span className="ml-2 inline-flex items-center text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-[10px] font-black">
                          <Repeat size={10} className="mr-1" /> Parcela {movement.parcelaAtual}/{movement.totalParcelas}
                        </span>
                      )}
                    </p>
                  </div>
               </div>
               <div className="flex items-start space-x-3">
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-400"><Users size={16} /></div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credor / Beneficiário</p>
                    <p className="text-sm font-bold text-slate-800">{client ? client.displayName : 'Sem vínculo direto'}</p>
                  </div>
               </div>
               {movement.observacao && (
                 <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Informações Adicionais</p>
                    <p className="text-xs text-amber-800 font-medium italic">{movement.observacao}</p>
                 </div>
               )}
            </div>

            <button onClick={onClose} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
              Fechar Detalhes
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
         <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Extrato de Movimentações</h3>
         <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filtrar por descrição..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
         </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-400 text-[10px] uppercase tracking-[0.15em] font-black">
            <tr>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4">Categoria / Cliente</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredAndSortedMovements.map((mov) => {
              const relatedClient = clients.find(c => c.id === mov.idRelacionado);
              return (
                <tr key={mov.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${mov.tipo === 'Entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                        {mov.tipo === 'Entrada' ? <ArrowUpRight size={14} strokeWidth={3} /> : <ArrowDownRight size={14} strokeWidth={3} />}
                      </div>
                      <span className="text-xs font-black text-slate-800">
                        {new Date(mov.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider">{mov.categoria}</p>
                    <p className="text-xs font-bold text-slate-500 truncate max-w-[140px]">
                      {relatedClient ? relatedClient.displayName : 'Sem vínculo'}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <p className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">{mov.descricao}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                      mov.status === 'Consolidado' ? 'bg-green-100 text-green-700' : 
                      mov.status === 'Cancelado' ? 'bg-red-100 text-red-700' : 
                      mov.status === 'Arquivado' ? 'bg-slate-100 text-slate-500' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {mov.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-black text-sm ${mov.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                    {mov.tipo === 'Entrada' ? '+' : '-'} R$ {mov.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => setSelectedMovement(mov)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Ver Detalhes"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => onEdit(mov)}
                        className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => { setMovementToDelete(mov.id); setIsConfirmOpen(true); }}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filteredAndSortedMovements.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-20 text-center">
                  <div className="flex flex-col items-center opacity-20">
                    <FileText size={64} className="mb-4" />
                    <p className="font-black uppercase tracking-widest text-sm text-slate-900">Nenhum registro encontrado</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedMovement && <DetailsModal movement={selectedMovement} onClose={() => setSelectedMovement(null)} />}

      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        title="Excluir Lançamento"
        message="Deseja realmente remover esta movimentação do sistema? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
