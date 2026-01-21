
import React, { useState, useEffect } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle2, History } from 'lucide-react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Movement, Client } from '../types';
import { MovementFormWidget } from './MovementFormWidget';
import { MovementListWidget } from './MovementListWidget';

interface InventoryMovementsProps {
  onNavigateToAll?: () => void;
}

export const InventoryMovements: React.FC<InventoryMovementsProps> = ({ onNavigateToAll }) => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [lastType, setLastType] = useState<'Entrada' | 'Saída'>('Entrada');

  useEffect(() => {
    const unsubMovements = onSnapshot(collection(db, 'financeiro'), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement));
      setMovements(data);
    });

    const unsubClients = onSnapshot(collection(db, 'cliente'), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });

    return () => { unsubMovements(); unsubClients(); };
  }, []);

  const handleOpenNew = () => {
    setEditingMovement(null);
    setIsFormOpen(true);
  };

  const handleEdit = (mov: Movement) => {
    setEditingMovement(mov);
    setIsFormOpen(true);
  };

  const handleSuccess = (tipo: 'Entrada' | 'Saída') => {
    setLastType(tipo);
    setIsSuccessModalOpen(true);
  };

  const totalIn = movements.filter(m => m.tipo === 'Entrada' && m.status !== 'Cancelado' && m.status !== 'Arquivado').reduce((acc, curr) => acc + curr.valor, 0);
  const totalOut = movements.filter(m => m.tipo === 'Saída' && m.status !== 'Cancelado' && m.status !== 'Arquivado').reduce((acc, curr) => acc + curr.valor, 0);
  const balance = totalIn - totalOut;

  const SuccessModal = () => (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-10 flex flex-col items-center text-center">
          <div className="w-48 h-48 mb-8 rounded-[2rem] overflow-hidden shadow-2xl ring-8 ring-slate-100/50">
            <img 
              src={lastType === 'Entrada' ? "https://i.ibb.co/BHDrNhKG/avatar-Rico.png" : "https://i.ibb.co/DD45WXrG/avatar-Pobre.png"} 
              alt="Avatar Resultado" 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">Movimentação Salva!</h3>
          <p className="text-slate-500 text-sm font-medium leading-relaxed mb-10">
            O lançamento de <span className={`font-bold ${lastType === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>{lastType.toLowerCase()}</span> foi registrado com sucesso.
          </p>
          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all"
          >
            VOLTAR AO FINANCEIRO
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Fluxo Financeiro Profissional</h1>
          <p className="text-slate-500 text-sm">Acompanhamento consolidado de caixa JPS Steel.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={onNavigateToAll}
            className="flex items-center justify-center space-x-2 bg-white border-2 border-slate-200 text-slate-600 px-6 py-3.5 rounded-2xl font-black shadow-sm transition-all hover:bg-slate-50 active:scale-95"
          >
            <History size={18} />
            <span>HISTÓRICO COMPLETO</span>
          </button>
          <button 
            onClick={handleOpenNew}
            className="flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            <span>NOVA MOVIMENTAÇÃO</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12"></div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Saldo Líquido</p>
          <p className={`text-3xl font-black ${balance >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
            R$ {balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-6 flex space-x-6 border-t border-slate-50 pt-4">
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Entradas</span>
              <span className="text-xs font-black text-green-600 flex items-center"><ArrowUpRight size={12} className="mr-1" /> R$ {totalIn.toLocaleString('pt-BR')}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Saídas</span>
              <span className="text-xs font-black text-red-600 flex items-center"><ArrowDownRight size={12} className="mr-1" /> R$ {totalOut.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl flex items-center space-x-6">
          <div className={`p-4 rounded-2xl ${movements.filter(m => m.status === 'Pendente').length > 0 ? 'bg-amber-500' : 'bg-green-500'} text-white shadow-lg`}>
            {movements.filter(m => m.status === 'Pendente').length > 0 ? <AlertTriangle size={32} /> : <CheckCircle2 size={32} />}
          </div>
          <div className="flex-1">
            <h4 className="font-black text-lg leading-tight uppercase tracking-tighter">Movimentações pendentes</h4>
            <p className="text-slate-400 text-xs font-medium mt-1">
              {movements.filter(m => m.status === 'Pendente').length > 0 
                ? `Existem ${movements.filter(m => m.status === 'Pendente').length} faturas pendentes de liquidação.` 
                : 'Todas as movimentações estão devidamente consolidadas.'}
            </p>
          </div>
        </div>
      </div>

      <MovementListWidget 
        movements={movements} 
        clients={clients} 
        onEdit={handleEdit} 
      />

      <MovementFormWidget 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSuccess={handleSuccess}
        initialData={editingMovement}
      />

      {isSuccessModalOpen && <SuccessModal />}
    </div>
  );
};
