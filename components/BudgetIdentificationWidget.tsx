
import React, { useState, useEffect } from 'react';
import { User, Loader2 } from 'lucide-react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Client, Representative } from '../types';

interface IdentificationData {
  clientId: string;
  clientName: string;
  responsavel: string;
  departamento: string;
}

interface BudgetIdentificationWidgetProps {
  onChange: (data: IdentificationData) => void;
}

export const BudgetIdentificationWidget: React.FC<BudgetIdentificationWidgetProps> = ({ onChange }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [loadingReps, setLoadingReps] = useState(false);

  // Estado interno do widget
  const [selectedClientId, setSelectedClientId] = useState('');
  const [responsavel, setResponsavel] = useState('');
  const [departamento, setDepartamento] = useState('');

  // Carregar lista de clientes ao montar
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cliente'), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });
    return () => unsub();
  }, []);

  // Carregar representantes quando o cliente mudar
  useEffect(() => {
    if (!selectedClientId) {
      setRepresentatives([]);
      setResponsavel('');
      setDepartamento('');
      return;
    }

    setLoadingReps(true);
    const q = query(
      collection(db, 'cliente', selectedClientId, 'representantes'),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snap) => {
      const reps = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Representative));
      setRepresentatives(reps);
      setLoadingReps(false);
      
      // Se houver representantes, seleciona o primeiro por padrão
      if (reps.length > 0 && !responsavel) {
        handleRepChange(reps[0].representanteName, reps);
      }
    });

    return () => unsub();
  }, [selectedClientId]);

  // Notificar o pai sempre que algo mudar
  useEffect(() => {
    const clientName = clients.find(c => c.id === selectedClientId)?.displayName || '';
    onChange({
      clientId: selectedClientId,
      clientName,
      responsavel,
      departamento
    });
  }, [selectedClientId, responsavel, departamento, clients]);

  const handleRepChange = (name: string, repsList = representatives) => {
    setResponsavel(name);
    const rep = repsList.find(r => r.representanteName === name);
    if (rep) {
      setDepartamento(rep.setor);
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-black text-slate-800 flex items-center text-sm uppercase tracking-widest">
          <User className="mr-2 text-blue-600" size={18} /> 
          Identificação do Orçamento
        </h3>
      </div>

      <div className="space-y-4">
        {/* Seleção de Cliente */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Cliente (Empresa)</label>
          <select 
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-black focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            value={selectedClientId} 
            onChange={e => setSelectedClientId(e.target.value)}
          >
            <option value="">Selecione um cliente...</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.displayName}</option>
            ))}
          </select>
        </div>

        {/* Seleção de Responsável (Dinâmico) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center">
              Responsável 
              {loadingReps && <Loader2 size={10} className="ml-2 animate-spin text-blue-600" />}
            </label>
            <select 
              disabled={!selectedClientId || representatives.length === 0}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-black focus:ring-2 focus:ring-blue-500/20 outline-none transition-all disabled:opacity-50"
              value={responsavel} 
              onChange={e => handleRepChange(e.target.value)}
            >
              <option value="">{selectedClientId ? 'Escolha o responsável...' : 'Selecione o cliente primeiro'}</option>
              {representatives.map(r => (
                <option key={r.id} value={r.representanteName}>{r.representanteName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Departamento</label>
            <input 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-black focus:ring-2 focus:ring-blue-500/20 outline-none transition-all" 
              placeholder="Digite o setor"
              value={departamento}
              onChange={e => setDepartamento(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
