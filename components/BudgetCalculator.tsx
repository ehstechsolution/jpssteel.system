
import React, { useState } from 'react';
import { 
  Save, ArrowLeft, Eye, MapPin, Phone, Globe, Loader2, FileDown
} from 'lucide-react';
import { collection, addDoc, serverTimestamp, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { BudgetCalculatorWidget } from './BudgetCalculatorWidget';
import { BudgetIdentificationWidget } from './BudgetIdentificationWidget';
import { BudgetInfoServWidget } from './BudgetInfoServWidget';

export const BudgetCalculator: React.FC = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Estado Consolidado do Orçamento
  const [budgetInfo, setBudgetInfo] = useState({
    clientId: '',
    clientName: '',
    responsavel: '',
    departamento: '',
    servicosDesc: '',
    referencia: 'Prestação de serviços de montagem e manutenção industrial.',
    objetivo: 'Esta proposta tem o objetivo de atender a solicitação para manutenção industrial.',
    porContaJps: [] as string[],
    porContaContratante: [] as string[],
    prazoEntrega: ''
  });

  const [valorGlobal, setValorGlobal] = useState(0);

  const APP_LOGO = "https://i.ibb.co/PZDD4Dfh/logo.png";
  const ICONE_ORC = "https://i.ibb.co/FbCJhRsZ/icone-Orcamento-Trans-JPS.png";
  const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxdL_oevnH0HA5hgtZF9mWBbiAMGq_aRwB_4LpdnU6SE3iIQDjfkTkJN9OSLteh410Dww/exec";

  // Função core para salvar ou encontrar orçamento existente
  const findOrCreateOrcamento = async () => {
    // 1. Verificar se já existe um idêntico
    const q = query(
      collection(db, 'orcamento'),
      where('idContratante', '==', budgetInfo.clientId),
      where('valorGlobal', '==', valorGlobal),
      where('prazo', '==', budgetInfo.prazoEntrega),
      where('responsavelOrc', '==', budgetInfo.responsavel)
    );

    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const existingId = querySnapshot.docs[0].id;
      // Garantir que o ícone esteja lá mesmo em registros antigos
      await updateDoc(doc(db, 'orcamento', existingId), { iconeOrc: ICONE_ORC });
      return existingId;
    }

    // 2. Se não existir, criar novo
    const today = new Date().toISOString().split('T')[0];
    const orcamentoData = {
      createdAt: serverTimestamp(),
      dataProposta: today,
      clienteOrc: budgetInfo.clientName,
      responsavelOrc: budgetInfo.responsavel,
      departamentoOrc: budgetInfo.departamento,
      referenciaOrc: budgetInfo.referencia,
      descricaoOrc: budgetInfo.servicosDesc,
      contaJPS: budgetInfo.porContaJps,
      contaContratante: budgetInfo.porContaContratante,
      valorGlobal: valorGlobal,
      prazo: budgetInfo.prazoEntrega,
      idContratante: budgetInfo.clientId,
      status: "Orçamento gerado",
      iconeOrc: ICONE_ORC
    };

    const docRef = await addDoc(collection(db, 'orcamento'), orcamentoData);
    return docRef.id;
  };

  const handleSaveBudget = async () => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await findOrCreateOrcamento();
      alert('Orçamento salvo com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar orçamento.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGeneratePDF = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      // 1. Garantir que o documento existe no Firebase e pegar o ID
      const idOrc = await findOrCreateOrcamento();
      const today = new Date().toISOString().split('T')[0];

      // 2. Preparar Payload para o Google Apps Script
      const payload = {
        idOrc: idOrc,
        dataProposta: today,
        clienteOrc: budgetInfo.clientName,
        responsavelOrc: budgetInfo.responsavel,
        departamentoOrc: budgetInfo.departamento,
        referenciaOrc: budgetInfo.referencia,
        descricaoOrc: budgetInfo.servicosDesc,
        contaJPS: budgetInfo.porContaJps,
        contaContratante: budgetInfo.porContaContratante,
        valorGlobal: valorGlobal,
        prazo: budgetInfo.prazoEntrega
      };

      // 3. Enviar para o Webhook (Sem no-cors para poder ler a resposta)
      // Nota: Se houver erro de CORS, você precisará configurar o GAS para retornar headers adequados
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // GAS lida melhor com text/plain para evitar preflight
        body: JSON.stringify(payload)
      });

      // Tentamos ler a resposta. Se o GAS redirecionar ou não tiver CORS, 
      // o fetch pode falhar aqui, mas o PDF será gerado lá.
      if (response.ok || response.type === 'opaque') {
        try {
          // Se o script retornar o JSON com pdfUrl, capturamos aqui
          const result = await response.json();
          if (result && result.pdfUrl) {
            await updateDoc(doc(db, 'orcamento', idOrc), {
              pdfUrl: result.pdfUrl,
              status: "PDF Gerado",
              iconeOrc: ICONE_ORC
            });
          }
        } catch (e) {
          console.warn("Não foi possível ler o JSON de resposta (CORS ou redirecionamento), mas os dados foram enviados.");
        }
        alert('Dados enviados! O PDF será gerado e vinculado ao orçamento em breve.');
      }
      
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert('Erro ao processar a geração do PDF. Verifique sua conexão e o Webhook.');
    } finally {
      setIsGenerating(false);
    }
  };

  const canShowPreview = 
    budgetInfo.clientId !== '' && 
    budgetInfo.responsavel !== '' && 
    budgetInfo.prazoEntrega !== '' && 
    valorGlobal > 0;

  const BudgetPreview = () => (
    <div id="printable-budget" className="bg-white w-[210mm] min-h-[297mm] shadow-[0_0_50px_rgba(0,0,0,0.1)] rounded-[2.5rem] overflow-hidden text-slate-800 relative mx-auto my-4 border border-slate-100">
      <div className="absolute top-0 left-0 w-2 h-full bg-[#BDB76B]"></div>
      
      <div className="p-12 pb-8 flex justify-between items-start border-b border-slate-50">
        <div className="space-y-4">
          <img src={APP_LOGO} alt="Logo" className="h-24 w-auto object-contain" />
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">JPS <span className="text-[#BDB76B]">STEEL</span></h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.3em] mt-1">Montagens Industriais</p>
          </div>
        </div>
        
        <div className="text-right space-y-1">
          <div className="bg-[#BDB76B] text-white px-4 py-1 inline-block rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
            Proposta Comercial
          </div>
          <p className="text-[11px] font-black text-slate-800 uppercase">JPS STEEL MONTAGENS INDUSTRIAIS LTDA</p>
          <p className="text-[11px] text-slate-500 font-medium">CNPJ: 55.314.896/0001-75</p>
          <div className="flex flex-col items-end pt-4 space-y-1 text-[10px] text-slate-400 font-semibold">
            <span className="flex items-center"><MapPin size={10} className="mr-1 text-[#BDB76B]" /> R. Coronel Virgílio Rocha nº 21, Centro - SP</span>
            <span className="flex items-center"><Phone size={10} className="mr-1 text-[#BDB76B]" /> (14) 99737-1221</span>
            <span className="flex items-center"><Globe size={10} className="mr-1 text-[#BDB76B]" /> www.jpssteel.com.br</span>
          </div>
        </div>
      </div>

      <div className="p-12 pt-8 space-y-10">
        <div className="grid grid-cols-2 gap-8 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-[#BDB76B] uppercase tracking-widest">Cliente</p>
            <p className="text-lg font-black text-slate-900 uppercase leading-tight">{budgetInfo.clientName || 'Cliente não definido'}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 border-l border-slate-200 pl-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#BDB76B] uppercase tracking-widest">Responsável</p>
              <p className="text-sm font-bold text-slate-700">{budgetInfo.responsavel || '-'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-[#BDB76B] uppercase tracking-widest">Departamento</p>
              <p className="text-sm font-bold text-slate-700">{budgetInfo.departamento || '-'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8 px-4">
          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
              <span className="w-8 h-[2px] bg-[#BDB76B] mr-3"></span>
              Objetivo e Referência
            </h3>
            <div className="grid grid-cols-1 gap-4">
               <p className="text-sm leading-relaxed text-slate-600 font-medium italic">"{budgetInfo.objetivo}"</p>
               <div className="p-4 bg-slate-50 rounded-2xl text-xs font-bold border-l-4 border-[#BDB76B]">
                  REF: {budgetInfo.referencia}
               </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center">
              <span className="w-8 h-[2px] bg-[#BDB76B] mr-3"></span>
              Escopo dos Serviços
            </h3>
            <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="bg-slate-900 text-white py-3 px-6 text-[10px] font-black uppercase tracking-widest flex justify-between items-center">
                <span>Detalhamento Técnico</span>
                <span className="text-[#BDB76B]">PROPOSTA EXECUTIVA</span>
              </div>
              <div className="p-8 space-y-6">
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{budgetInfo.servicosDesc}</p>
                
                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Responsabilidade JPS</p>
                    <ul className="text-xs space-y-1.5 text-slate-500 font-semibold">
                      {budgetInfo.porContaJps.map((it, i) => <li key={i} className="flex items-center"><span className="w-1 h-1 bg-blue-300 rounded-full mr-2"></span> {it}</li>)}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Responsabilidade Contratante</p>
                    <ul className="text-xs space-y-1.5 text-slate-500 font-semibold">
                      {budgetInfo.porContaContratante.map((it, i) => <li key={i} className="flex items-center"><span className="w-1 h-1 bg-amber-300 rounded-full mr-2"></span> {it}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-10">
          <div className="flex justify-between items-end border-t-2 border-slate-100 pt-10 px-4">
             <div className="space-y-6">
               <div className="space-y-1">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prazo de Entrega</p>
                 <p className="text-sm font-black text-blue-800 bg-blue-50 px-4 py-2 rounded-xl inline-block border border-blue-100">
                   {budgetInfo.prazoEntrega ? new Date(budgetInfo.prazoEntrega + 'T00:00:00').toLocaleDateString('pt-BR') : 'A combinar'}
                 </p>
               </div>
               <div className="pt-6">
                 <div className="w-48 h-[1px] bg-slate-300 mb-2"></div>
                 <p className="text-[11px] font-black text-slate-800 leading-none uppercase">Patricia Santos</p>
                 <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Gestão de Operações | JPS Steel</p>
               </div>
             </div>

             <div className="text-right space-y-2">
               <p className="text-[10px] font-black text-[#BDB76B] uppercase tracking-widest">Valor Global do Investimento</p>
               <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-slate-800">
                  <p className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest">Total Líquido</p>
                  <p className="text-4xl font-black">R$ {valorGlobal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
               </div>
               <p className="text-[9px] text-slate-400 font-bold uppercase pt-2">Válido por 15 dias após a emissão</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-budget, #printable-budget * { visibility: visible; }
          #printable-budget { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 210mm; 
            height: 297mm;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
            border: none !important;
          }
          #printable-budget .rounded-[2.5rem] { border-radius: 0 !important; }
        }
      `}</style>

      <div className="flex justify-between items-center no-print">
        <h1 className="text-2xl font-black text-slate-800">Orçamentação Inteligente</h1>
        <div className="flex space-x-2">
          {showPreview && (
            <button 
              onClick={() => setShowPreview(false)} 
              className="flex items-center space-x-2 bg-white border px-6 py-3 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="hidden sm:inline">Voltar para Edição</span>
            </button>
          )}

          {!showPreview && canShowPreview && (
            <button 
              onClick={() => setShowPreview(true)} 
              className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-blue-900/20 hover:bg-blue-700 transition-all animate-in fade-in zoom-in duration-300"
            >
              <Eye size={18} />
              <span>Ver Prévia do Orçamento</span>
            </button>
          )}

          {showPreview && (
            <>
              <button 
                onClick={handleSaveBudget} 
                disabled={isSaving}
                className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} 
                <span className="hidden sm:inline">Salvar orçamento</span>
              </button>
              <button 
                onClick={handleGeneratePDF} 
                disabled={isGenerating}
                className="flex items-center space-x-2 bg-[#BDB76B] text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:brightness-110 transition-all disabled:opacity-50"
              >
                {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <FileDown size={18} />} 
                <span className="hidden sm:inline">Gerar PDF</span>
              </button>
            </>
          )}
        </div>
      </div>

      {!showPreview ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print pb-20">
          <div className="lg:col-span-5 space-y-6">
            <BudgetIdentificationWidget 
              onChange={(data) => setBudgetInfo(prev => ({ ...prev, ...data }))} 
            />
            
            <BudgetInfoServWidget 
              onChange={(data) => setBudgetInfo(prev => ({ ...prev, ...data }))}
            />

            <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-black text-[10px] text-slate-400 uppercase tracking-[0.2em]">Detalhes Adicionais</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Referência Geral</label>
                  <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-black text-xs" value={budgetInfo.referencia} onChange={e => setBudgetInfo({...budgetInfo, referencia: e.target.value})} />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <BudgetCalculatorWidget 
              onTotalUpdate={(total) => setValorGlobal(total)}
              onFinish={() => {}} 
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center bg-slate-200/50 p-4 sm:p-8 rounded-[3rem] min-h-screen no-print overflow-hidden">
          <div className="w-full overflow-x-auto flex justify-center pb-12 scrollbar-hide">
            <div className="origin-top transition-transform duration-500" style={{ transform: 'scale(var(--preview-scale, 1))' }}>
              <BudgetPreview />
            </div>
          </div>

          <script dangerouslySetInnerHTML={{ __html: `
            function adjustScale() {
              const container = document.querySelector('.origin-top');
              if (!container) return;
              const screenWidth = window.innerWidth;
              const docWidth = 840;
              let scale = 1;
              if (screenWidth < docWidth) {
                scale = (screenWidth - 40) / docWidth;
              }
              container.style.setProperty('--preview-scale', scale);
            }
            window.addEventListener('resize', adjustScale);
            adjustScale();
          `}} />
        </div>
      )}
    </div>
  );
};
