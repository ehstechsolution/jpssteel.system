
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Lock, Eye, EyeOff, ShieldCheck, Trash2, Key, Server, Globe, Wifi, Settings, Loader2, X, Edit2
} from 'lucide-react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Credential } from '../types';
import { ConfirmationDialog } from './ConfirmationDialog';

export const Passwords: React.FC = () => {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [editingCredential, setEditingCredential] = useState<Credential | null>(null);

  // Form State (categoria removida conforme solicitado)
  const [formData, setFormData] = useState({
    titulo: '',
    usuario: '',
    senha: ''
  });

  // Delete State
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'senhas'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setCredentials(snap.docs.map(d => ({ id: d.id, ...d.data() } as Credential)));
    });
    return () => unsub();
  }, []);

  const togglePasswordVisibility = (id: string) => {
    const newSet = new Set(visiblePasswords);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setVisiblePasswords(newSet);
  };

  const handleOpenModal = (cred: Credential | null = null) => {
    if (cred) {
      setEditingCredential(cred);
      setFormData({
        titulo: cred.titulo,
        usuario: cred.usuario,
        senha: cred.senha
      });
    } else {
      setEditingCredential(null);
      setFormData({ titulo: '', usuario: '', senha: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCredential(null);
    setFormData({ titulo: '', usuario: '', senha: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.senha) return;
    setLoading(true);
    try {
      if (editingCredential) {
        // Edição
        await updateDoc(doc(db, 'senhas', editingCredential.id), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        // Novo
        await addDoc(collection(db, 'senhas'), {
          ...formData,
          categoria: 'Geral', // Mantido no banco como padrão interno
          createdAt: serverTimestamp()
        });
      }
      handleCloseModal();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar credencial.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!idToDelete) return;
    try {
      await deleteDoc(doc(db, 'senhas', idToDelete));
      setIsConfirmOpen(false);
      setIdToDelete(null);
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = credentials.filter(c => 
    c.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.usuario.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center">
            <ShieldCheck size={24} className="mr-3 text-blue-600" /> Cofre de Credenciais
          </h1>
          <p className="text-slate-500 text-sm font-medium">Armazenamento seguro de acessos JPS Steel.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center space-x-2 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl active:scale-95 transition-all"
        >
          <Plus size={20} />
          <span>NOVA CREDENCIAL</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por título ou usuário..." 
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/5 transition-all font-bold text-sm text-black"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((cred) => (
          <div key={cred.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
               <div className={`p-3 rounded-2xl bg-slate-900 text-white`}>
                  <Key size={18} />
               </div>
               <div className="flex space-x-1">
                 <button 
                  onClick={() => handleOpenModal(cred)}
                  className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                  title="Editar"
                 >
                   <Edit2 size={16} />
                 </button>
                 <button 
                  onClick={() => { setIdToDelete(cred.id); setIsConfirmOpen(true); }}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                  title="Excluir"
                 >
                   <Trash2 size={16} />
                 </button>
               </div>
            </div>
            
            <h3 className="font-black text-slate-900 text-lg tracking-tight mb-4">{cred.titulo}</h3>
            
            <div className="space-y-4">
               <div>
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Usuário</label>
                 <div className="p-3 bg-slate-50 rounded-xl font-bold text-xs text-black border border-slate-100">
                    {cred.usuario || 'Nenhum usuário'}
                 </div>
               </div>
               <div>
                 <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Senha</label>
                 <div className="p-3 bg-slate-50 rounded-xl font-mono text-xs text-black border border-slate-100 flex justify-between items-center group/pass">
                    <span className="tracking-widest">
                      {visiblePasswords.has(cred.id) ? cred.senha : '••••••••'}
                    </span>
                    <button 
                      onClick={() => togglePasswordVisibility(cred.id)}
                      className="text-slate-400 hover:text-blue-600"
                    >
                      {visiblePasswords.has(cred.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                 </div>
               </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-black text-slate-800 flex items-center text-sm uppercase tracking-widest">
                 {editingCredential ? <Edit2 size={18} className="mr-2 text-blue-600" /> : <Key size={18} className="mr-2 text-blue-600" />}
                 {editingCredential ? 'Editar Acesso' : 'Cadastrar Acesso'}
               </h3>
               <button onClick={handleCloseModal} className="text-slate-400 hover:text-red-500">
                 <X size={20} />
               </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-4">
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase">Nome do Sistema/Equipamento *</label>
                 <input 
                  required
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-black"
                  placeholder="Ex: Painel Elétrico CNC"
                  value={formData.titulo}
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase">Usuário / Login</label>
                 <input 
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-black"
                  placeholder="Ex: admin_jps"
                  value={formData.usuario}
                  onChange={e => setFormData({...formData, usuario: e.target.value})}
                 />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-500 uppercase">Senha de Acesso *</label>
                 <input 
                  required
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-blue-500/5 transition-all text-black"
                  placeholder="Sua senha secreta"
                  value={formData.senha}
                  onChange={e => setFormData({...formData, senha: e.target.value})}
                 />
               </div>
               
               <button 
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center space-x-2"
               >
                 {loading ? <Loader2 className="animate-spin" size={20} /> : <span>{editingCredential ? 'ATUALIZAR ACESSO' : 'SALVAR CREDENCIAL'}</span>}
               </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        title="Excluir Acesso"
        message="Deseja realmente remover esta credencial do cofre? Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        onConfirm={handleDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
