
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Building2, MapPin, FileText, Briefcase, 
  UserPlus, Phone, Mail, Users, Trash2, Calendar
} from 'lucide-react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  serverTimestamp, deleteDoc, doc 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Client, Representative } from '../types';
import { RepresentativeForm } from './RepresentativeForm';
import { ConfirmationDialog } from './ConfirmationDialog';

interface ClientDetailsProps {
  client: Client;
  onBack: () => void;
}

export const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onBack }) => {
  const [representatives, setRepresentatives] = useState<Representative[]>([]);
  const [isRepFormOpen, setIsRepFormOpen] = useState(false);
  
  // Estados para o diálogo de confirmação
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [repToDelete, setRepToDelete] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, 'cliente', client.id, 'representantes'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setRepresentatives(snap.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Representative)));
    }, (error) => {
      console.error("Erro ao escutar representantes:", error);
    });
    return () => unsub();
  }, [client.id]);

  const handleAddRepresentative = async (data: Omit<Representative, 'id'>) => {
    try {
      await addDoc(collection(db, 'cliente', client.id, 'representantes'), {
        ...data,
        createdAt: serverTimestamp()
      });
    } catch (err) {
      console.error("Erro ao adicionar representante:", err);
    }
  };

  const openDeleteConfirm = (e: React.MouseEvent, repId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setRepToDelete(repId);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!repToDelete) return;
    try {
      const repDocRef = doc(db, 'cliente', client.id, 'representantes', repToDelete);
      await deleteDoc(repDocRef);
    } catch (err) {
      console.error("Erro ao deletar representante:", err);
    } finally {
      setIsConfirmOpen(false);
      setRepToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-2">
        <button 
          onClick={onBack}
          className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-800">Perfil do Cliente</h1>
          <p className="text-sm text-slate-500">Gestão detalhada e histórico de contatos.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-32 bg-slate-900 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_50%,rgba(37,99,235,0.8),transparent)]"></div>
          <div className="absolute -bottom-12 left-8">
            <div className="w-28 h-28 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden">
              <img 
                src={client.fotoUrl || "https://i.ibb.co/LdxXv1CF/empresa-Oliginal.png"} 
                alt={client.displayName} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
        
        <div className="pt-16 pb-8 px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-slate-800">{client.displayName}</h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-xs font-bold font-mono border border-blue-100">
                  <FileText size={14} className="mr-1.5" />
                  {client.cnpj || 'CNPJ NÃO CADASTRADO'}
                </div>
                <div className="flex items-center text-slate-500 text-sm">
                  <MapPin size={16} className="mr-1.5 text-slate-400" />
                  {client.endereco || 'Endereço não informado'}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setIsRepFormOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center space-x-2 transition-all active:scale-95"
            >
              <UserPlus size={18} />
              <span>Novo Representante</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-slate-800">
                <Users size={18} className="text-blue-600" />
                <h3 className="font-bold uppercase text-[10px] tracking-widest">Equipe de Contato</h3>
              </div>
              <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                {representatives.length} Membros
              </span>
            </div>
            
            <div className="p-6">
              {representatives.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <UserPlus size={40} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-slate-500 text-sm">Ainda não há representantes cadastrados.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {representatives.map((rep) => (
                    <div 
                      key={rep.id} 
                      className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:border-blue-200 transition-all group relative overflow-hidden"
                    >
                      <button 
                        type="button"
                        onClick={(e) => openDeleteConfirm(e, rep.id)}
                        className="absolute top-2 right-2 p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all z-10 sm:opacity-0 sm:group-hover:opacity-100"
                        title="Remover Representante"
                      >
                        <Trash2 size={18} />
                      </button>

                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-inner">
                          {rep.representanteName.charAt(0)}
                        </div>
                        <div className="pr-8">
                          <h4 className="font-bold text-slate-800 leading-tight truncate">{rep.representanteName}</h4>
                          <span className="text-[10px] uppercase font-black tracking-wider text-blue-600">
                            {rep.setor}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {rep.telefone && (
                          <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg">
                            <Phone size={14} className="mr-2 text-slate-400" />
                            <span className="font-medium">{rep.telefone}</span>
                          </div>
                        )}
                        {rep.email && (
                          <div className="flex items-center text-sm text-slate-600 bg-slate-50 p-2 rounded-lg truncate">
                            <Mail size={14} className="mr-2 text-slate-400" />
                            <span className="font-medium truncate">{rep.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden opacity-60">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center space-x-2 text-slate-800">
                <Briefcase size={18} className="text-slate-400" />
                <h3 className="font-bold uppercase text-[10px] tracking-widest">Histórico de Serviços</h3>
              </div>
            </div>
            <div className="p-12 text-center text-slate-400">
              <p className="text-sm">Em breve: Listagem detalhada de todos os serviços realizados.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6 flex items-center">
               <Calendar size={12} className="mr-2" /> Resumo do Cliente
             </h4>
             <div className="space-y-6">
                <div>
                  <p className="text-slate-500 text-xs font-bold uppercase mb-1">Status de Faturamento</p>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black">R$ 0,00</span>
                    <span className="text-xs text-slate-500">total</span>
                  </div>
                </div>
             </div>
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
             <h4 className="font-bold text-slate-800 text-sm mb-4">Notas Internas</h4>
             <textarea 
               placeholder="Notas privadas sobre este cliente..."
               className="w-full h-32 bg-slate-50 border-none rounded-xl text-sm p-4 focus:ring-2 focus:ring-blue-500/20 text-slate-900 font-medium resize-none"
             ></textarea>
          </div>
        </div>
      </div>

      <RepresentativeForm 
        isOpen={isRepFormOpen}
        onClose={() => setIsRepFormOpen(false)}
        onSubmit={handleAddRepresentative}
      />

      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        title="Remover Representante"
        message="Tem certeza que deseja remover este representante da equipe do cliente?"
        confirmLabel="Remover"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
