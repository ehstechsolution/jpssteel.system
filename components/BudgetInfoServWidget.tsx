
import React, { useState, useEffect } from 'react';
import { Briefcase, Plus, Trash2, Calendar, ClipboardList, ShieldCheck, HardHat } from 'lucide-react';

interface InfoServData {
  servicosDesc: string;
  porContaJps: string[];
  porContaContratante: string[];
  prazoEntrega: string;
}

interface BudgetInfoServWidgetProps {
  initialData?: {
    servicosDesc: string;
    porContaJps: string[];
    porContaContratante: string[];
    prazoEntrega: string;
  };
  onChange: (data: InfoServData) => void;
}

export const BudgetInfoServWidget: React.FC<BudgetInfoServWidgetProps> = ({ initialData, onChange }) => {
  const [servicosDesc, setServicosDesc] = useState('Valor de M.O. de 1 soldador, 1 caldeireiro para religação das tubulações de gás.');
  const [porContaJps, setPorContaJps] = useState(['EPIS', 'Transporte', 'Ferramentas', 'Materiais de consumo']);
  const [porContaContratante, setPorContaContratante] = useState(['Ponto de energia e água', 'Andaimes/Plataforma elevatória']);
  const [prazoEntrega, setPrazoEntrega] = useState('');

  const [newItemJps, setNewItemJps] = useState('');
  const [newItemContratante, setNewItemContratante] = useState('');

  // Sincronizar com initialData (clonagem)
  useEffect(() => {
    if (initialData) {
      setServicosDesc(initialData.servicosDesc);
      setPorContaJps(initialData.porContaJps);
      setPorContaContratante(initialData.porContaContratante);
      setPrazoEntrega(initialData.prazoEntrega);
    }
  }, [initialData?.servicosDesc]);

  // Notificar pai sobre mudanças
  useEffect(() => {
    onChange({
      servicosDesc,
      porContaJps,
      porContaContratante,
      prazoEntrega
    });
  }, [servicosDesc, porContaJps, porContaContratante, prazoEntrega]);

  const addItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, item: string, setInput: React.Dispatch<React.SetStateAction<string>>) => {
    if (item.trim()) {
      setList([...list, item.trim()]);
      setInput('');
    }
  };

  const removeItem = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-black text-slate-800 flex items-center text-sm uppercase tracking-widest">
          <Briefcase className="mr-2 text-blue-600" size={18} /> 
          Escopo Técnico do Serviço
        </h3>
      </div>

      <div className="space-y-6">
        {/* Descrição */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center">
            <ClipboardList size={12} className="mr-1" /> Descrição do Serviço
          </label>
          <textarea 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-black h-24 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
            placeholder="Descreva o serviço detalhadamente..."
            value={servicosDesc} 
            onChange={e => setServicosDesc(e.target.value)} 
          />
        </div>

        {/* Listas de Responsabilidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Por conta da JPS */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-blue-600 uppercase tracking-wider flex items-center">
              <ShieldCheck size={12} className="mr-1" /> Por conta da JPS Steel
            </label>
            <div className="flex space-x-2">
              <input 
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
                placeholder="Adicionar item..."
                value={newItemJps}
                onChange={e => setNewItemJps(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem(porContaJps, setPorContaJps, newItemJps, setNewItemJps)}
              />
              <button 
                onClick={() => addItem(porContaJps, setPorContaJps, newItemJps, setNewItemJps)}
                className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {porContaJps.map((item, idx) => (
                <div key={idx} className="flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-[11px] font-black group border border-blue-100">
                  {item}
                  <button onClick={() => removeItem(porContaJps, setPorContaJps, idx)} className="ml-2 text-blue-300 hover:text-red-500 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Por conta da Contratante */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-amber-600 uppercase tracking-wider flex items-center">
              <HardHat size={12} className="mr-1" /> Por conta da Contratante
            </label>
            <div className="flex space-x-2">
              <input 
                className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                placeholder="Adicionar item..."
                value={newItemContratante}
                onChange={e => setNewItemContratante(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addItem(porContaContratante, setPorContaContratante, newItemContratante, setNewItemContratante)}
              />
              <button 
                onClick={() => addItem(porContaContratante, setPorContaContratante, newItemContratante, setNewItemContratante)}
                className="p-2.5 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {porContaContratante.map((item, idx) => (
                <div key={idx} className="flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-[11px] font-black group border border-amber-100">
                  {item}
                  <button onClick={() => removeItem(porContaContratante, setPorContaContratante, idx)} className="ml-2 text-amber-300 hover:text-red-500 transition-colors">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Prazo de Entrega */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center">
            <Calendar size={12} className="mr-1" /> Prazo Previsto para Término
          </label>
          <input 
            type="date"
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-black text-black focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
            value={prazoEntrega}
            onChange={e => setPrazoEntrega(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
