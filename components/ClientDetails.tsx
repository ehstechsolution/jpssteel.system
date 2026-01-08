
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Building2, MapPin, FileText, Briefcase, 
  UserPlus, Phone, Mail, Users, Trash2, Calendar, Eye, X, 
  MapPin as MapPinIcon, Phone as PhoneIcon, Globe as GlobeIcon, FileDown
} from 'lucide-react';
import { 
  collection, addDoc, onSnapshot, query, orderBy, 
  serverTimestamp, deleteDoc, doc, where 
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
  const [budgets, setBudgets] = useState<any[]>([]);
  const [isRepFormOpen, setIsRepFormOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<any | null>(null);
  
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [repToDelete, setRepToDelete] = useState<string | null>(null);
  const [isConfirmBudgetDeleteOpen, setIsConfirmBudgetDeleteOpen] = useState(false);
  const [budgetIdToDelete, setBudgetIdToDelete] = useState<string | null>(null);

  const APP_LOGO = "https://i.ibb.co/PZDD4Dfh/logo.png";

  useEffect(() => {
    const qReps = query(
      collection(db, 'cliente', client.id, 'representantes'),
      orderBy('createdAt', 'desc')
    );
    const unsubReps = onSnapshot(qReps, (snap) => {
      setRepresentatives(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Representative)));
    });

    const qBudgets = query(
      collection(db, 'orcamento'),
      where('idContratante', '==', client.id)
    );
    
    const unsubBudgets = onSnapshot(qBudgets, (snap) => {
      const budgetData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      budgetData.sort((a, b) => {
        const dateA = a.createdAt?.seconds || 0;
        const dateB = b.createdAt?.seconds || 0;
        return dateB - dateA;
      });
      setBudgets(budgetData);
    });

    return () => {
      unsubReps();
      unsubBudgets();
    };
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

  const handleConfirmDeleteRep = async () => {
    if (!repToDelete) return;
    try {
      await deleteDoc(doc(db, 'cliente', client.id, 'representantes', repToDelete));
    } finally {
      setIsConfirmOpen(false);
      setRepToDelete(null);
    }
  };

  const handleConfirmDeleteBudget = async () => {
    if (!budgetIdToDelete) return;
    try {
      await deleteDoc(doc(db, 'orcamento', budgetIdToDelete));
    } finally {
      setIsConfirmBudgetDeleteOpen(false);
      setBudgetIdToDelete(null);
    }
  };

  const BudgetPreviewModal = ({ budget, onClose }: { budget: any, onClose: () => void }) => (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex flex-col items-center justify-center p-0 md:p-4">
      <div className="w-full max-w-5xl h-full md:h-[95vh] flex flex-col relative animate-in fade-in zoom-in duration-300">
        
        {/* Toolbar com botão de download priorizado */}
        <div className="flex justify-between items-center p-4 bg-slate-900 md:bg-transparent md:mb-4 shrink-0">
          <div className="flex items-center space-x-2 text-white/50 md:bg-white/5 md:px-4 md:py-2 rounded-full md:border border-white/10">
            <FileText size={16} className="text-[#BDB76B]" />
            <span className="text-[10px] font-black uppercase tracking-widest">Visualizando Orçamento</span>
          </div>
          <div className="flex items-center space-x-2">
            {/* Botão de Download Direto pelo Link do Banco */}
            {budget.pdfUrl && (
              <a 
                href={budget.pdfUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-[#BDB76B] hover:brightness-110 text-white p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-xl flex items-center space-x-2 font-black transition-all active:scale-95 text-xs"
                title="Baixar PDF do Sistema"
              >
                <FileDown size={20} /> <span className="hidden sm:inline">BAIXAR PDF</span>
              </a>
            )}
            <button 
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 text-white p-2.5 md:p-3 rounded-xl md:rounded-2xl shadow-xl flex items-center space-x-2 font-black transition-all active:scale-95 text-xs"
            >
              <X size={20} /> <span className="hidden sm:inline">Fechar</span>
            </button>
          </div>
        </div>

        {/* Document Area */}
        <div className="flex-1 overflow-y-auto bg-slate-100 md:bg-slate-800/50 p-0 md:p-8 md:rounded-[2.5rem] md:border border-white/5 custom-scrollbar">
          <div className="bg-white w-full max-w-4xl min-h-full shadow-2xl md:rounded-[2.5rem] overflow-hidden text-slate-800 relative mx-auto border border-slate-100 flex flex-col">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#BDB76B] hidden md:block"></div>
            
            <div className="p-6 md:p-12 pb-8 flex flex-col md:flex-row justify-between items-center md:items-start border-b border-slate-50 gap-6">
              <div className="space-y-4 flex flex-col items-center md:items-start text-center md:text-left">
                <img src={APP_LOGO} alt="Logo" className="h-20 md:h-24 w-auto object-contain" />
                <div>
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tighter leading-none">JPS <span className="text-[#BDB76B]">STEEL</span></h1>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Montagens Industriais</p>
                </div>
              </div>
              
              <div className="text-center md:text-right space-y-1">
                <div className="bg-[#BDB76B] text-white px-4 py-1 inline-block rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  Proposta Comercial
                </div>
                <p className="text-[10px] md:text-[11px] font-black text-slate-800 uppercase">JPS STEEL MONTAGENS INDUSTRIAIS LTDA</p>
                <div className="flex flex-col items-center md:items-end pt-4 space-y-1 text-[10px] text-slate-400 font-semibold">
                  <span className="flex items-center"><MapPinIcon size={10} className="mr-1 text-[#BDB76B]" /> Centro - SP</span>
                  <span className="flex items-center"><PhoneIcon size={10} className="mr-1 text-[#BDB76B]" /> (14) 99737-1221</span>
                  <span className="flex items-center"><GlobeIcon size={10} className="mr-1 text-[#BDB76B]" /> www.jpssteel.com.br</span>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-12 pt-8 space-y-10 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-[10px] font-black text-[#BDB76B] uppercase tracking-widest">Cliente</p>
                  <p className="text-base md:text-lg font-black text-slate-900 uppercase leading-tight">{budget.clienteOrc}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:border-l border-slate-200 md:pl-8 text-center sm:text-left">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#BDB76B] uppercase tracking-widest">Responsável</p>
                    <p className="text-sm font-bold text-slate-700">{budget.responsavelOrc}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-[#BDB76B] uppercase tracking-widest">Departamento</p>
                    <p className="text-sm font-bold text-slate-700">{budget.departamentoOrc}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-8 px-0 md:px-4">
                <div className="space-y-4">
                  <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center justify-center md:justify-start">
                    <span className="hidden md:block w-8 h-[2px] bg-[#BDB76B] mr-3"></span> Referência
                  </h3>
                  <div className="p-4 bg-slate-50 rounded-2xl text-xs font-bold border-l-4 border-[#BDB76B]">
                    REF: {budget.referenciaOrc}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center justify-center md:justify-start">
                    <span className="hidden md:block w-8 h-[2px] bg-[#BDB76B] mr-3"></span> Detalhamento Técnico
                  </h3>
                  <div className="bg-white border border-slate-100 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-sm p-6 md:p-8">
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap mb-6">{budget.descricaoOrc}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Responsabilidade JPS</p>
                        <ul className="text-xs space-y-1 text-slate-500 font-semibold">
                          {(budget.contaJPS || []).map((it: any, i: number) => <li key={i} className="flex items-start"><span className="mr-2">•</span>{it}</li>)}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Responsabilidade Contratante</p>
                        <ul className="text-xs space-y-1 text-slate-500 font-semibold">
                          {(budget.contaContratante || []).map((it: any, i: number) => <li key={i} className="flex items-start"><span className="mr-2">•</span>{it}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-10 flex flex-col md:flex-row justify-between items-center md:items-end border-t-2 border-slate-100 gap-8">
                <div className="space-y-1 text-center md:text-left">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prazo de Entrega</p>
                  <p className="text-sm font-black text-blue-800 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 inline-block">
                    {budget.prazo ? new Date(budget.prazo + 'T00:00:00').toLocaleDateString('pt-BR') : 'A combinar'}
                  </p>
                </div>
                <div className="text-center md:text-right w-full md:w-auto">
                  <p className="text-[10px] font-black text-[#BDB76B] uppercase tracking-widest mb-2">Valor do Investimento</p>
                  <div className="bg-slate-900 text-white p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-xl">
                    <p className="text-2xl md:text-3xl font-black">R$ {budget.valorGlobal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-500 pb-20">
      <div className="flex items-center space-x-4 mb-2">
        <button onClick={onBack} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm group">
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-800">Perfil do Cliente</h1>
          <p className="text-xs md:text-sm text-slate-500 truncate">Gestão estratégica JPS Steel.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="h-24 md:h-32 bg-slate-900 relative">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_50%,rgba(37,99,235,0.8),transparent)]"></div>
          <div className="absolute -bottom-8 md:-bottom-12 left-6 md:left-8">
            <div className="w-20 md:w-28 h-20 md:h-28 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden">
              <img src={client.fotoUrl || "https://i.ibb.co/LdxXv1CF/empresa-Oliginal.png"} alt={client.displayName} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
        
        <div className="pt-12 md:pt-16 pb-6 md:pb-8 px-6 md:px-8">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-slate-800">{client.displayName}</h2>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center text-blue-600 bg-blue-50 px-3 py-1 rounded-lg text-[10px] font-bold font-mono border border-blue-100">
                  <FileText size={12} className="mr-1.5" />
                  {client.cnpj || 'SEM CNPJ'}
                </div>
                <div className="flex items-center text-slate-500 text-[11px] md:text-sm">
                  <MapPin size={14} className="mr-1.5 text-slate-400" />
                  {client.endereco || 'Local não informado'}
                </div>
              </div>
            </div>
            
            <button onClick={() => setIsRepFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center space-x-2 transition-all active:scale-95 text-sm">
              <UserPlus size={18} />
              <span>Novo Contato</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center space-x-2 text-slate-800">
                <FileText size={18} className="text-[#BDB76B]" />
                <h3 className="font-bold uppercase text-[10px] tracking-widest">Orçamentos Vinculados</h3>
              </div>
            </div>
            
            <div className="divide-y divide-slate-50">
              {budgets.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <p className="text-sm font-medium">Nenhum orçamento encontrado.</p>
                </div>
              ) : (
                budgets.map((budget) => (
                  <div key={budget.id} className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-slate-50 transition-all gap-4">
                    <div className="flex items-center space-x-4 cursor-pointer flex-1" onClick={() => setSelectedBudget(budget)}>
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-slate-100 border border-slate-200 p-2 overflow-hidden flex-shrink-0">
                        <img src={budget.iconeOrc || "https://i.ibb.co/FbCJhRsZ/icone-Orcamento-Trans-JPS.png"} alt="Icon" className="w-full h-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-black text-[#BDB76B] uppercase tracking-widest truncate">
                          Ref: {budget.referenciaOrc}
                        </p>
                        <p className="text-base md:text-lg font-black text-slate-800">
                          R$ {budget.valorGlobal?.toLocaleString('pt-BR')}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {new Date(budget.dataProposta).toLocaleDateString('pt-BR')}
                          </span>
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                            {budget.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                      {/* Botão de Download Priorizado na Lista */}
                      {budget.pdfUrl && (
                        <a 
                          href={budget.pdfUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="p-2.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm flex items-center justify-center"
                          title="Baixar PDF Original"
                        >
                          <FileDown size={18} />
                        </a>
                      )}
                      <button 
                        onClick={() => setSelectedBudget(budget)} 
                        className="p-2 bg-slate-100 text-slate-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="Visualizar"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setBudgetIdToDelete(budget.id); setIsConfirmBudgetDeleteOpen(true); }} 
                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Excluir"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
          {/* ... resto do componente ... */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-bold uppercase text-[10px] tracking-widest text-blue-600">Equipe Técnica Autorizada</h3>
            </div>
            <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {representatives.length === 0 ? (
                <p className="text-slate-500 text-sm italic col-span-full">Nenhum contato cadastrado.</p>
              ) : (
                representatives.map((rep) => (
                  <div key={rep.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm relative">
                    <button onClick={(e) => { e.stopPropagation(); setRepToDelete(rep.id); setIsConfirmOpen(true); }} className="absolute top-2 right-2 p-2 text-slate-200 hover:text-red-600 transition-all">
                      <Trash2 size={14} />
                    </button>
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black text-xs uppercase">{rep.representanteName.charAt(0)}</div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{rep.representanteName}</h4>
                        <span className="text-[9px] uppercase font-bold text-blue-500">{rep.setor}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center text-[10px] text-slate-500 font-medium">
                        <Phone size={10} className="mr-2 text-slate-400" /> {rep.telefone || '---'}
                      </div>
                      <div className="flex items-center text-[10px] text-slate-500 font-medium truncate">
                        <Mail size={10} className="mr-2 text-slate-400" /> {rep.email || '---'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-[2rem] p-6 md:p-8 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
             <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-6">Volume Comercial</h4>
             <div className="space-y-6">
                <div>
                  <p className="text-slate-500 text-[10px] font-black uppercase mb-1">Total em Orçamentos</p>
                  <p className="text-2xl md:text-3xl font-black">
                    R$ {budgets.reduce((acc, b) => acc + (b.valorGlobal || 0), 0).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[9px] text-slate-500 uppercase font-black mb-2">Relacionamento JPS</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-blue-400">25%</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {selectedBudget && <BudgetPreviewModal budget={selectedBudget} onClose={() => setSelectedBudget(null)} />}
      <RepresentativeForm isOpen={isRepFormOpen} onClose={() => setIsRepFormOpen(false)} onSubmit={handleAddRepresentative} />
      <ConfirmationDialog isOpen={isConfirmOpen} title="Remover Contato" message="Deseja remover este contato?" confirmLabel="Remover" onConfirm={handleConfirmDeleteRep} onCancel={() => setIsConfirmOpen(false)} />
      <ConfirmationDialog isOpen={isConfirmBudgetDeleteOpen} title="Excluir Orçamento" message="Ação irreversível." confirmLabel="Excluir" onConfirm={handleConfirmDeleteBudget} onCancel={() => setIsConfirmBudgetDeleteOpen(false)} />
    </div>
  );
};
