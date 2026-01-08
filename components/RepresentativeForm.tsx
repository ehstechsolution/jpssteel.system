
import React, { useState, useEffect } from 'react';
import { X, UserPlus, Loader2, Edit3 } from 'lucide-react';
import { Representative } from '../types';

interface RepresentativeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Representative, 'id'>) => Promise<void>;
  initialData?: Representative | null;
}

export const RepresentativeForm: React.FC<RepresentativeFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    representanteName: '',
    telefone: '',
    email: '',
    setor: 'Comercial' as Representative['setor']
  });

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        representanteName: initialData.representanteName,
        telefone: initialData.telefone,
        email: initialData.email,
        setor: initialData.setor
      });
    } else if (isOpen) {
      setFormData({
        representanteName: '',
        telefone: '',
        email: '',
        setor: 'Comercial'
      });
    }
  }, [initialData, isOpen]);

  const maskTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/g, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.representanteName) {
      alert("O nome do representante é obrigatório");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-[70] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center space-x-2">
            {initialData ? (
              <Edit3 size={18} className="text-amber-600" />
            ) : (
              <UserPlus size={18} className="text-blue-600" />
            )}
            <span>{initialData ? 'Editar Representante' : 'Adicionar Representante'}</span>
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Nome Completo *</label>
            <input 
              required 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium outline-none"
              placeholder="Nome do representante"
              value={formData.representanteName}
              onChange={e => setFormData({...formData, representanteName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Telefone</label>
              <input 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium outline-none"
                placeholder="(00) 00000-0000"
                value={formData.telefone}
                onChange={e => setFormData({...formData, telefone: maskTelefone(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 uppercase">Setor</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium outline-none cursor-pointer"
                value={formData.setor}
                onChange={e => setFormData({...formData, setor: e.target.value as any})}
              >
                <option value="Comercial">Comercial</option>
                <option value="Operacional">Operacional</option>
                <option value="Logística">Logística</option>
                <option value="Fiscal">Fiscal</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">E-mail</label>
            <input 
              type="email"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium outline-none"
              placeholder="exemplo@email.com"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className={`px-8 py-2 text-white font-bold rounded-xl shadow-lg flex items-center space-x-2 transition-all active:scale-95 ${
                initialData ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>{initialData ? 'Atualizar' : 'Salvar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
