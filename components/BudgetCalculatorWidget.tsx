
import React, { useState, useEffect } from 'react';
import { 
  Calculator, RefreshCw, Hammer, Truck, DollarSign, Percent
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DefaultValues } from '../types';

interface BudgetCalculatorWidgetProps {
  initialTotal?: number;
  onTotalUpdate: (total: number) => void;
  onFinish: () => void;
}

export const BudgetCalculatorWidget: React.FC<BudgetCalculatorWidgetProps> = ({ initialTotal, onTotalUpdate, onFinish }) => {
  // Variáveis da Calculadora
  const [horasHhmm, setHorasHhmm] = useState('08:00');
  const [qtdFuncionarios, setQtdFuncionarios] = useState(1);
  const [valorHora, setValorHora] = useState(0);
  const [qtdDias, setQtdDias] = useState(1);
  
  const [valorGasolina, setValorGasolina] = useState(0);
  const [valorPedagio, setValorPedagio] = useState(0);
  const [valorAlimentacao, setValorAlimentacao] = useState(0);

  const [ajusteTipo, setAjusteTipo] = useState<'Acréscimo' | 'Desconto' | 'Nenhum'>('Nenhum');
  const [ajusteModo, setAjusteModo] = useState<'Integral' | 'Porcentagem'>('Integral');
  const [ajusteValor, setAjusteValor] = useState(0);

  const [valorGlobal, setValorGlobal] = useState(0);

  // Auxiliar: Tempo HH:MM para Decimal
  const timeToDecimal = (time: string) => {
    if (!time.includes(':')) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours + (minutes / 60);
  };

  // Carregar Valores Padrão da Empresa
  useEffect(() => {
    const fetchDefaults = async () => {
      const docSnap = await getDoc(doc(db, 'settings', 'default_values'));
      if (docSnap.exists()) {
        const data = docSnap.data() as DefaultValues;
        setValorGasolina(data.gasolina);
        setValorPedagio(data.pedagio);
        setValorAlimentacao(data.alimentacao);
        setValorHora(data.valorHoraPadrao);
      }
    };
    fetchDefaults();
  }, []);

  // Lógica de Cálculo Principal
  useEffect(() => {
    // Se for um valor inicial (clonado), não sobrescrevemos até o usuário mexer nos inputs
    // mas o useEffect vai rodar e recalcular baseado nos estados iniciais acima.
    // Para clonar o VALOR FINAL sem ter as horas salvas, deixamos o ajuste compensar ou
    // simplesmente notificamos o valor.
    
    const hDecimal = timeToDecimal(horasHhmm);
    
    // 1. Valor do Dia
    const valorDia = hDecimal * valorHora * qtdFuncionarios;
    
    // 2. Mão de Obra Total
    const maoDeObraTotal = valorDia * qtdDias;
    
    // 3. Logística
    const gastoTransporte = (valorGasolina * qtdDias) + (valorPedagio * qtdDias);
    const gastoAlimentacao = valorAlimentacao * qtdFuncionarios * qtdDias;
    
    // 4. Valor do Serviço Base
    const valorServico = maoDeObraTotal + gastoTransporte + gastoAlimentacao;
    
    // 5. Ajustes
    let alteracao = 0;
    if (ajusteModo === 'Integral') {
      alteracao = ajusteValor;
    } else {
      alteracao = (ajusteValor * valorServico) / 100;
    }

    let final = valorServico;
    if (ajusteTipo === 'Acréscimo') final += alteracao;
    if (ajusteTipo === 'Desconto') final -= alteracao;

    // Se temos um total inicial de clonagem e os inputs ainda estão nos valores "padrão",
    // podemos forçar o valorGlobal inicial.
    const isDefaultState = horasHhmm === '08:00' && qtdFuncionarios === 1 && qtdDias === 1 && ajusteTipo === 'Nenhum';
    
    if (initialTotal && isDefaultState && valorGlobal === 0) {
      setValorGlobal(initialTotal);
      onTotalUpdate(initialTotal);
    } else {
      setValorGlobal(final);
      onTotalUpdate(final);
    }
  }, [horasHhmm, qtdFuncionarios, valorHora, qtdDias, valorGasolina, valorPedagio, valorAlimentacao, ajusteTipo, ajusteModo, ajusteValor, initialTotal]);

  return (
    <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden border border-white/5 h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      
      <div className="flex justify-between items-center mb-8 relative z-10">
        <h3 className="font-black text-xl flex items-center">
          <Calculator size={22} className="mr-3 text-blue-400" /> Calculadora Industrial
        </h3>
        <button 
          onClick={() => {
            setHorasHhmm('08:00');
            setQtdFuncionarios(1);
            setQtdDias(1);
            setAjusteTipo('Nenhum');
            setAjusteValor(0);
          }}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-slate-400 transition-colors"
          title="Resetar Calculadora"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        {/* Bloco Mão de Obra */}
        <div className="space-y-6">
          <h4 className="font-black text-blue-400 text-xs uppercase tracking-[0.2em] flex items-center">
            <Hammer size={16} className="mr-2" /> 1. Mão de Obra
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Horas p/ Dia</label>
              <input type="time" className="w-full p-3 bg-white rounded-xl text-black font-black" value={horasHhmm} onChange={e => setHorasHhmm(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Funcionários</label>
              <input type="number" className="w-full p-3 bg-white rounded-xl text-black font-black" value={qtdFuncionarios} onChange={e => setQtdFuncionarios(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Valor Hora (R$)</label>
              <input type="number" step="0.01" className="w-full p-3 bg-white rounded-xl text-black font-black" value={valorHora} onChange={e => setValorHora(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Qtd de Dias</label>
              <input type="number" className="w-full p-3 bg-white rounded-xl text-black font-black" value={qtdDias} onChange={e => setQtdDias(Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Bloco Logística */}
        <div className="space-y-6">
          <h4 className="font-black text-amber-400 text-xs uppercase tracking-[0.2em] flex items-center">
            <Truck size={16} className="mr-2" /> 2. Logística
          </h4>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Combustível (R$)</label>
              <input type="number" className="w-full p-3 bg-white rounded-xl text-black font-black" value={valorGasolina} onChange={e => setValorGasolina(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Pedágio (R$)</label>
              <input type="number" className="w-full p-3 bg-white rounded-xl text-black font-black" value={valorPedagio} onChange={e => setValorPedagio(Number(e.target.value))} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Alimentação (R$)</label>
              <input type="number" className="w-full p-3 bg-white rounded-xl text-black font-black" value={valorAlimentacao} onChange={e => setValorAlimentacao(Number(e.target.value))} />
            </div>
          </div>
        </div>
      </div>

      {/* Ajustes Finais */}
      <div className="mt-10 pt-8 border-t border-white/10 relative z-10">
        <h4 className="font-black text-slate-400 text-xs uppercase tracking-[0.2em] mb-6">3. Ajustes Finais</h4>
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            {['Acréscimo', 'Desconto', 'Nenhum'].map(t => (
              <button 
                key={t}
                type="button"
                onClick={() => setAjusteTipo(t as any)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${ajusteTipo === t ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
            <button type="button" onClick={() => setAjusteModo('Integral')} className={`px-4 py-2 rounded-xl text-xs font-black flex items-center ${ajusteModo === 'Integral' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}><DollarSign size={14} className="mr-1"/> R$</button>
            <button type="button" onClick={() => setAjusteModo('Porcentagem')} className={`px-4 py-2 rounded-xl text-xs font-black flex items-center ${ajusteModo === 'Porcentagem' ? 'bg-amber-600 text-white' : 'text-slate-500'}`}><Percent size={14} className="mr-1"/> %</button>
          </div>

          <div className="flex-1 min-w-[150px]">
            <input type="number" className="w-full p-3 bg-white rounded-xl text-black font-black text-lg" placeholder="Valor do ajuste" value={ajusteValor} onChange={e => setAjusteValor(Number(e.target.value))} />
          </div>
        </div>

        <div className="mt-10">
          <p className="text-blue-400 font-black text-[10px] uppercase tracking-widest mb-1">Valor Global Final</p>
          <p className="text-5xl font-black text-white">R$ {valorGlobal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>
    </div>
  );
};
