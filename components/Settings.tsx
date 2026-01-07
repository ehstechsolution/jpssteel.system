
import React, { useState, useEffect } from 'react';
import { Layout, Bell, Shield, Database, Info, Coins, Save, Loader2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DefaultValues } from '../types';

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<DefaultValues>({
    gasolina: 0,
    pedagio: 0,
    alimentacao: 0,
    valorHoraPadrao: 0
  });

  useEffect(() => {
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', 'default_values');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setValues(docSnap.data() as DefaultValues);
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'default_values'), values);
      alert('Configurações salvas com sucesso!');
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-slate-500">Personalize os parâmetros operacionais da JPS Steel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside className="space-y-1">
          <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-bold">
            <Coins size={18} /> <span>Valores Padrão</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
            <Bell size={18} /> <span>Notificações</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
            <Shield size={18} /> <span>Segurança</span>
          </button>
        </aside>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <div className="space-y-4">
              <h3 className="font-black text-slate-800 flex items-center uppercase text-sm tracking-widest">
                <Coins className="mr-2 text-blue-600" size={18} /> Parâmetros de Orçamento
              </h3>
              <p className="text-xs text-slate-500">Estes valores serão carregados automaticamente ao iniciar um novo orçamento.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Combustível / Km (Padrão)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input 
                      type="number" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-black"
                      value={values.gasolina}
                      onChange={e => setValues({...values, gasolina: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Pedágio Diário (Padrão)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input 
                      type="number" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-black"
                      value={values.pedagio}
                      onChange={e => setValues({...values, pedagio: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Alimentação por Pessoa</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input 
                      type="number" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-black"
                      value={values.alimentacao}
                      onChange={e => setValues({...values, alimentacao: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 uppercase">Valor Hora Padrão (M.O.)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input 
                      type="number" 
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-black text-black"
                      value={values.valorHoraPadrao}
                      onChange={e => setValues({...values, valorHoraPadrao: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                <span>SALVAR PARÂMETROS</span>
              </button>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-2xl border border-dashed border-blue-200 flex flex-col items-center text-center">
            <Info size={32} className="text-blue-400 mb-3" />
            <p className="text-sm text-blue-700 font-medium leading-relaxed">
              Estes valores ajudam a manter a consistência nos seus orçamentos.<br/>
              Alterar aqui não afeta orçamentos já criados, apenas os novos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
