
import React, { useState } from 'react';
import { Sparkles, Loader2, Send, BrainCircuit, X, TrendingUp, TrendingDown, Wallet, AlertCircle, Calendar, Wrench, Users } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";
import { collection, query, where, getDocs, updateDoc, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Client, Movement, Service } from '../types';

interface AICommandCenterProps {
  clients: Client[];
  movements: Movement[];
  services: Service[];
}

export const AICommandCenter: React.FC<AICommandCenterProps> = ({ clients, movements, services }) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseContent, setResponseContent] = useState<{ title: string; text: string; type: 'info' | 'finance' | 'agenda' } | null>(null);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const todayStr = new Date().toLocaleDateString('pt-BR');

    // Definição expandida de funções para a IA
    const tools = [{
      functionDeclarations: [
        {
          name: 'processPayment',
          description: 'Registra ou consolida um pagamento realizado.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              clientName: { type: Type.STRING, description: 'Nome do cliente ou fornecedor.' },
              amount: { type: Type.NUMBER, description: 'Valor da transação.' }
            },
            required: ['clientName', 'amount']
          }
        },
        {
          name: 'getFinancialHealth',
          description: 'Analisa a saúde financeira, lucros e gastos do mês.'
        },
        {
          name: 'getAgenda',
          description: 'Consulta serviços agendados e compromissos financeiros para um período (hoje, semana, mês).',
          parameters: {
            type: Type.OBJECT,
            properties: {
              period: { type: Type.STRING, enum: ['hoje', 'semana', 'mes'], description: 'O período de tempo da consulta.' }
            },
            required: ['period']
          }
        },
        {
          name: 'searchClientInfo',
          description: 'Busca informações detalhadas sobre um cliente específico.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Nome do cliente a buscar.' }
            },
            required: ['name']
          }
        }
      ]
    }];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: input,
        config: { 
          tools,
          systemInstruction: `Você é o Assistente Executivo da JPS Steel - Montagens Industriais. 
          Hoje é dia ${todayStr}.
          Sua missão é facilitar a gestão estratégica e operacional. 
          - Você tem acesso aos dados financeiros (entradas/saídas) e operacionais (serviços).
          - Quando o usuário perguntar "O que tem pra essa semana?" ou "quais os vencimentos?", você DEVE usar a ferramenta getAgenda.
          - No banco de dados, a data de vencimento das contas está no campo 'vencimento' (formato YYYY-MM-DD).
          - Seja ultra-específico: cite nomes de clientes, valores em R$ e as datas exatas.
          - Se houver contas pendentes, destaque o valor e a data de vencimento.
          - Mantenha as respostas profissionais, curtas e úteis.`
        },
      });

      const call = response.functionCalls?.[0];

      if (!call) {
        // Resposta Conversacional Geral
        setResponseContent({
          title: "Assistente JPS",
          text: response.text || "Estou à disposição para ajudar com a gestão da JPS Steel.",
          type: 'info'
        });
        setShowResponseModal(true);
      } else {
        // Processamento de Function Calling
        switch (call.name) {
          case 'processPayment':
            const { clientName, amount } = call.args as any;
            await handlePaymentLogic(clientName, amount);
            alert(`Sucesso: Pagamento de R$ ${amount} para ${clientName} processado.`);
            break;
            
          case 'getFinancialHealth':
            await handleFinancialSummary();
            break;
            
          case 'getAgenda':
            await handleAgendaLogic((call.args as any).period);
            break;

          case 'searchClientInfo':
            await handleClientInfoLogic((call.args as any).name);
            break;
        }
      }
      setInput('');
    } catch (error) {
      console.error("Erro na IA:", error);
      alert("Erro ao processar comando IA.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAgendaLogic = async (period: string) => {
    const today = new Date();
    const end = new Date();
    if (period === 'semana') end.setDate(today.getDate() + 7);
    else if (period === 'mes') end.setMonth(today.getMonth() + 1);
    else end.setHours(23, 59, 59);

    const filteredServices = services.filter(s => {
      const d = new Date(s.dataServico + 'T12:00:00');
      return d >= today && d <= end;
    });

    const filteredMovements = movements.filter(m => {
      const d = new Date(m.vencimento + 'T12:00:00');
      return d >= today && d <= end && m.status === 'Pendente';
    });

    const summary = `Agenda detalhada para ${period}:
    - Serviços Agendados: ${filteredServices.length > 0 ? filteredServices.map(s => `Cliente: ${s.nomeCliente} (Data do Serviço: ${s.dataServico})`).join('; ') : 'Nenhum serviço agendado.'}
    - Movimentações Financeiras Pendentes: ${filteredMovements.length > 0 ? filteredMovements.map(m => `Descrição: ${m.descricao} (VALOR: R$ ${m.valor}, VENCIMENTO: ${m.vencimento})`).join('; ') : 'Nenhum vencimento pendente no período.'}`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const finalResp = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Contexto dos dados do sistema: ${summary}. Pergunta do usuário: "${input}". 
      Por favor, liste os itens com suas respectivas datas e valores de forma bem organizada.`
    });

    setResponseContent({
      title: `Agenda: ${period.toUpperCase()}`,
      text: finalResp.text || '',
      type: 'agenda'
    });
    setShowResponseModal(true);
  };

  const handleClientInfoLogic = async (name: string) => {
    const client = clients.find(c => c.displayName.toLowerCase().includes(name.toLowerCase()));
    if (!client) {
      setResponseContent({ title: "Busca de Cliente", text: `Não encontrei nenhum cliente com o nome "${name}" em nossa base.`, type: 'info' });
    } else {
      const clientServices = services.filter(s => s.clienteRelacionado === client.id);
      const text = `Cliente: ${client.displayName}\nCNPJ: ${client.cnpj}\nEndereço: ${client.endereco}\nServiços realizados: ${clientServices.length}\nStatus: Ativo no sistema JPS.`;
      setResponseContent({ title: "Ficha do Cliente", text, type: 'info' });
    }
    setShowResponseModal(true);
  };

  const handleFinancialSummary = async () => {
    const totalIn = movements.filter(m => m.tipo === 'Entrada' && m.status !== 'Cancelado').reduce((acc, curr) => acc + curr.valor, 0);
    const totalOut = movements.filter(m => m.tipo === 'Saída' && m.status !== 'Cancelado').reduce((acc, curr) => acc + curr.valor, 0);
    
    const prompt = `Dados Financeiros JPS Steel:
    Entradas Totais: R$ ${totalIn}
    Saídas Totais: R$ ${totalOut}
    Saldo Líquido: R$ ${totalIn - totalOut}
    
    Dê um panorama geral e cite 2 pontos de atenção baseados nestes números.`;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: prompt });

    setResponseContent({
      title: "Análise Financeira",
      text: response.text || '',
      type: 'finance'
    });
    setShowResponseModal(true);
  };

  const handlePaymentLogic = async (clientName: string, amount: number) => {
    const client = clients.find(c => c.displayName.toLowerCase().includes(clientName.toLowerCase()));
    const q = query(collection(db, 'financeiro'), where('valor', '==', amount), where('status', '==', 'Pendente'));
    const snap = await getDocs(q);
    
    if (!snap.empty) {
      await updateDoc(doc(db, 'financeiro', snap.docs[0].id), { status: 'Consolidado', updatedAt: serverTimestamp() });
    } else {
      await addDoc(collection(db, 'financeiro'), {
        tipo: 'Saída', categoria: 'Geral', descricao: `Pagamento: ${clientName}`, valor: amount,
        status: 'Consolidado', vencimento: new Date().toISOString().split('T')[0],
        idRelacionado: client?.id || '', createdAt: serverTimestamp()
      });
    }
  };

  return (
    <div className="relative z-50 mb-8">
      <form onSubmit={handleCommand} className="group relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative flex items-center bg-white border-2 border-slate-100 p-2 rounded-3xl shadow-xl focus-within:border-blue-500 transition-all ring-4 ring-slate-100/50">
          <div className={`p-3 rounded-2xl ${isProcessing ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-900 text-white'}`}>
            {isProcessing ? <BrainCircuit size={22} className="animate-spin" /> : <Sparkles size={22} />}
          </div>
          <input 
            type="text" 
            placeholder="Ex: 'Quais os vencimentos desta semana?' ou 'Paguei 500 para Givaudan'"
            className="flex-1 px-4 py-2 bg-transparent outline-none font-bold text-black placeholder:text-slate-400 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit"
            disabled={isProcessing || !input.trim()}
            className="p-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-30 transition-all shadow-lg shadow-blue-600/20"
          >
            {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </form>

      {/* Modal de Resposta da IA com Ajuste de Scroll e Altura */}
      {showResponseModal && responseContent && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl z-[200] flex items-center justify-center p-4 overflow-hidden">
          <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border border-white/20 flex flex-col">
            {/* Header Fixo */}
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center shrink-0">
               <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-2xl ${
                    responseContent.type === 'finance' ? 'bg-green-600' : 
                    responseContent.type === 'agenda' ? 'bg-blue-600' : 'bg-slate-700'
                  }`}>
                    {responseContent.type === 'finance' ? <TrendingUp size={24} /> : 
                     responseContent.type === 'agenda' ? <Calendar size={24} /> : <BrainCircuit size={24} />}
                  </div>
                  <div>
                    <h3 className="font-black text-lg uppercase tracking-tight">{responseContent.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Resposta da Inteligência Artificial</p>
                  </div>
               </div>
               <button onClick={() => setShowResponseModal(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                 <X size={20} />
               </button>
            </div>

            {/* Body com Scroll Interno */}
            <div className="p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
               <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 min-h-[120px]">
                  <p className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                    {responseContent.text}
                  </p>
               </div>
            </div>

            {/* Footer Fixo */}
            <div className="p-8 pt-2 bg-white shrink-0">
               <button 
                onClick={() => setShowResponseModal(false)}
                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
               >
                 Fechar Assistente
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
