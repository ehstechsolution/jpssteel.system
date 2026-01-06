
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, MapPin, Building2, ChevronRight
} from 'lucide-react';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Client } from '../types';
import { ClientForm } from './ClientForm';
import { ClientDetails } from './ClientDetails';
import { ConfirmationDialog } from './ConfirmationDialog';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Estados para o diálogo de confirmação
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cliente'), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });
    return () => unsub();
  }, []);

  const handleFormSubmit = async (formData: any) => {
    try {
      if (editingClient) {
        await updateDoc(doc(db, 'cliente', editingClient.id), formData);
      } else {
        await addDoc(collection(db, 'cliente'), {
          ...formData,
          createdAt: serverTimestamp()
        });
      }
    } catch (err) {
      console.error("Erro ao salvar no Firestore:", err);
      throw err;
    }
  };

  const openDeleteConfirm = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setClientToDelete(id);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;
    try {
      await deleteDoc(doc(db, 'cliente', clientToDelete));
      if (selectedClient?.id === clientToDelete) setSelectedClient(null);
    } catch (err) {
      console.error("Erro ao excluir cliente:", err);
    } finally {
      setIsConfirmOpen(false);
      setClientToDelete(null);
    }
  };

  const handleEdit = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setEditingClient(client);
    setIsModalOpen(true);
  };

  const filteredClients = clients.filter(c => 
    (c.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.cnpj?.includes(searchTerm))
  );

  if (selectedClient) {
    return (
      <ClientDetails 
        client={selectedClient} 
        onBack={() => setSelectedClient(null)} 
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Clientes</h1>
          <p className="text-slate-500">Gerencie a base de clientes e seus representantes.</p>
        </div>
        <button 
          onClick={() => { setEditingClient(null); setIsModalOpen(true); }}
          className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={20} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nome ou CNPJ..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-bold">
              <tr>
                <th className="px-6 py-4">Empresa / CNPJ</th>
                <th className="px-6 py-4">Localização</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredClients.map((client) => (
                <tr 
                  key={client.id} 
                  onClick={() => setSelectedClient(client)}
                  className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex-shrink-0 shadow-sm">
                        <img src={client.fotoUrl || "https://i.ibb.co/LdxXv1CF/empresa-Oliginal.png"} alt={client.displayName} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{client.displayName}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{client.cnpj}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-xs text-slate-600 max-w-xs truncate">
                      <MapPin size={12} className="mr-2 text-slate-400 flex-shrink-0" />
                      {client.endereco || 'Endereço não informado'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center space-x-2">
                      <button 
                        onClick={(e) => handleEdit(e, client)}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        title="Editar"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={(e) => openDeleteConfirm(e, client.id)}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                      <div className="pl-2 border-l border-slate-100 ml-2">
                        <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center">
                      <Building2 size={40} className="mb-2 opacity-20" />
                      <p>Nenhum cliente encontrado.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ClientForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleFormSubmit}
        initialData={editingClient}
      />

      <ConfirmationDialog 
        isOpen={isConfirmOpen}
        title="Excluir Cliente"
        message="Deseja realmente excluir este cliente? Todos os dados vinculados serão perdidos permanentemente."
        confirmLabel="Excluir"
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
};
