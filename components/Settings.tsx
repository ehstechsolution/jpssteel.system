
import React, { useState, useEffect } from 'react';
import { Layout, Bell, Shield, Database, Info, Coins, Save, Loader2, CalendarClock, MessageSquare } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { DefaultValues, NotificationSettings } from '../types';

export const Settings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'values' | 'notifications' | 'security'>('values');
  
  // Valores Padrão
  const [values, setValues] = useState<DefaultValues>({
    gasolina: 0,
    pedagio: 0,
    alimentacao: 0,
    valorHoraPadrao: 0
  });

  // Notificações
  const [notifValues, setNotifValues] = useState<NotificationSettings>({
    diasMovimentacao: 3,
    alertMovimentacao: true
  });

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // Carregar Valores Padrão
        const valuesRef = doc(db, 'settings', 'default_values');
        const valuesSnap = await getDoc(valuesRef);
        if (valuesSnap.exists()) {
          setValues(valuesSnap.data() as DefaultValues);
        }

        // Carregar Notificações
        const notifRef = doc(db, 'settings', 'notifications');
        const notifSnap = await getDoc(notifRef);
        if (notifSnap.exists()) {
          setNotifValues(notifSnap.data() as NotificationSettings);
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'values') {
        await setDoc(doc(db, 'settings', 'default_values'), values);
      } else if (activeTab === 'notifications') {
        await setDoc(doc(db, 'settings', 'notifications'), notifValues);
      }
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
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Configurações</h1>
        <p className="text-slate-500 text-sm">Personalize os parâmetros operacionais da JPS Steel.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <aside className="space-y-2">
          <button 
            onClick={() => setActiveTab('values')}
            className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-200 border-2 ${
              activeTab === 'values' 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20 font-black' 
                : 'bg-white text-slate-500 border-transparent hover:border-slate-200 font-bold'
            }`}
          >
            <Coins size={18} /> <span>Valores Padrão</span>
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-200 border-2 ${
              activeTab === 'notifications' 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20 font-black' 
                : 'bg-white text-slate-500 border-transparent hover:border-slate-200 font-bold'
            }`}
          >
            <Bell size={18} /> <span>Notificações</span>
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center space-x-3 px-5 py-3.5 rounded-2xl transition-all duration-200 border-2 ${
              activeTab === 'security' 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-900/20 font-black' 
                : 'bg-white text-slate-500 border-transparent hover:border-slate-200 font-bold'
            }`}
          >
            <Shield size={18} /> <span>Segurança</span>
          </button>
        </aside>

        <div className="md:col-span-2 space-y-6">
          {activeTab === 'values' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <h3 className="font-black text-slate-800 flex items-center uppercase text-xs tracking-[0.2em]">
                  <Coins className="mr-2 text-blue-600" size={18} /> Parâmetros de Orçamento
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valores automáticos para novos cálculos</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Combustível / Km (Padrão)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">R$</span>
                      <input 
                        type="number" 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-black outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                        value={values.gasolina}
                        onChange={e => setValues({...values, gasolina: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Pedágio Diário (Padrão)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">R$</span>
                      <input 
                        type="number" 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-black outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                        value={values.pedagio}
                        onChange={e => setValues({...values, pedagio: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Alimentação por Pessoa</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">R$</span>
                      <input 
                        type="number" 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-black outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
                        value={values.alimentacao}
                        onChange={e => setValues({...values, alimentacao: Number(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Valor Hora Padrão (M.O.)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">R$</span>
                      <input 
                        type="number" 
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-black outline-none focus:ring-4 focus:ring-blue-500/5 transition-all"
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
                  className="flex items-center space-x-2 px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  <span className="uppercase text-xs tracking-widest">Salvar Parâmetros</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-6">
                <h3 className="font-black text-slate-800 flex items-center uppercase text-xs tracking-[0.2em]">
                  <Bell className="mr-2 text-blue-600" size={18} /> Sistema de Alertas
                </h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Gerencie como e quando a JPS Steel deve alertar sobre vencimentos</p>
                
                <div className="space-y-8 pt-4">
                  {/* Dias de Antecedência */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem] gap-4">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-blue-600">
                        <CalendarClock size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Dias de antecedência</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Período de alerta antes do vencimento</p>
                      </div>
                    </div>
                    <div className="w-full sm:w-32">
                      <input 
                        type="number" 
                        min="1"
                        step="1"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-black text-black text-center text-lg outline-none focus:ring-4 focus:ring-blue-500/5 transition-all shadow-sm"
                        value={notifValues.diasMovimentacao}
                        onChange={e => setNotifValues({...notifValues, diasMovimentacao: parseInt(e.target.value) || 1})}
                      />
                    </div>
                  </div>

                  {/* Toggle Alerta */}
                  <div className="flex items-center justify-between p-6 bg-slate-50 border border-slate-100 rounded-[2rem]">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 text-amber-600">
                        <MessageSquare size={24} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Movimentações Pendentes</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Habilitar avisos visuais no dashboard</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => setNotifValues({...notifValues, alertMovimentacao: !notifValues.alertMovimentacao})}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 ${
                        notifValues.alertMovimentacao ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ease-in-out ${
                          notifValues.alertMovimentacao ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center space-x-2 px-10 py-4 bg-slate-900 hover:bg-slate-800 text-white font-black rounded-2xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                  <span className="uppercase text-xs tracking-widest">Salvar Alertas</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col items-center text-center animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center text-slate-400 mb-6">
                <Shield size={40} />
              </div>
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight mb-2">Segurança de Dados</h3>
              <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
                Funcionalidades de gerenciamento de permissões e log de acessos estarão disponíveis em breve para administradores.
              </p>
            </div>
          )}

          <div className="bg-blue-50 p-6 rounded-[2rem] border border-dashed border-blue-200 flex flex-col items-center text-center">
            <Info size={32} className="text-blue-400 mb-3" />
            <p className="text-[10px] text-blue-700 font-black uppercase tracking-[0.1em] leading-relaxed">
              As alterações realizadas aqui impactam diretamente a lógica operacional da plataforma.<br/>
              Mantenha os dados atualizados para garantir a precisão financeira.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
