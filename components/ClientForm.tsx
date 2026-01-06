
import React, { useState, useEffect } from 'react';
import { X, Camera, Loader2 } from 'lucide-react';
import { Client } from '../types';

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: Client | null;
}

export const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const DEFAULT_PHOTO = "https://i.ibb.co/LdxXv1CF/empresa-Oliginal.png";
  const CLOUD_NAME = "dcp9d15n4";
  const UPLOAD_PRESET = "jps2026";

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    cnpj: '',
    endereco: '',
    fotoUrl: DEFAULT_PHOTO
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        displayName: initialData.displayName || '',
        cnpj: initialData.cnpj || '',
        endereco: initialData.endereco || '',
        fotoUrl: initialData.fotoUrl || DEFAULT_PHOTO
      });
    } else {
      setFormData({
        displayName: '',
        cnpj: '',
        endereco: '',
        fotoUrl: DEFAULT_PHOTO
      });
    }
  }, [initialData, isOpen]);

  const maskCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', UPLOAD_PRESET);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: data
      });
      const resData = await response.json();
      if (resData.secure_url) {
        setFormData(prev => ({ ...prev, fotoUrl: resData.secure_url }));
      }
    } catch (error) {
      console.error("Erro no upload Cloudinary:", error);
      alert("Falha ao subir imagem.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName) {
      alert("O nome é obrigatório");
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">
            {initialData ? 'Editar Cliente' : 'Novo Cliente'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-50 relative">
                <img 
                  src={formData.fotoUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="text-white animate-spin" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl text-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <Camera size={18} />
                <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
              </label>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 uppercase font-bold tracking-widest">Logo da Empresa</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Nome Fantasia / Razão Social *</label>
              <input 
                required 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900 font-medium"
                placeholder="Ex: JPS Steel Ltda"
                value={formData.displayName}
                onChange={e => setFormData({...formData, displayName: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">CNPJ</label>
              <input 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono text-slate-900 font-medium"
                placeholder="00.000.000/0001-00"
                value={formData.cnpj}
                onChange={e => setFormData({...formData, cnpj: maskCNPJ(e.target.value)})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700">Endereço</label>
              <textarea 
                rows={2}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none text-slate-900 font-medium"
                placeholder="Rua, Número, Bairro, Cidade - UF"
                value={formData.endereco}
                onChange={e => setFormData({...formData, endereco: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading || uploading}
              className="px-6 py-2.5 text-slate-600 font-semibold hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading || uploading}
              className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all flex items-center space-x-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              <span>{initialData ? 'Salvar Alterações' : 'Cadastrar Cliente'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
