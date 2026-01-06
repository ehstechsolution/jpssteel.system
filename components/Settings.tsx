
import React from 'react';
import { Settings as SettingsIcon, Shield, Database, Bell, Layout, Info } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Configurações</h1>
        <p className="text-slate-500">Personalize o sistema JPS Steel de acordo com suas necessidades.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <aside className="space-y-1">
          <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg bg-blue-50 text-blue-600 font-bold">
            <Layout size={18} /> <span>Geral</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
            <Bell size={18} /> <span>Notificações</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
            <Shield size={18} /> <span>Segurança</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-50 transition-colors">
            <Database size={18} /> <span>Backup & Dados</span>
          </button>
        </aside>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="space-y-4 pb-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Perfil da Empresa</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-slate-700">Razão Social</label>
                  <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" defaultValue="JPS Steel - Montagens Industriais" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">CNPJ Principal</label>
                    <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" defaultValue="12.345.678/0001-90" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-semibold text-slate-700">Inscrição Estadual</label>
                    <input className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg" defaultValue="ISENTO" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">Preferências do Sistema</h3>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-semibold text-slate-700">Alertas de Estoque Baixo</p>
                  <p className="text-xs text-slate-400">Notificar quando materiais atingirem nível crítico.</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-semibold text-slate-700">Backup Diário Automático</p>
                  <p className="text-xs text-slate-400">Sincronizar dados com o Firebase Cloud toda meia-noite.</p>
                </div>
                <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:bg-blue-700 transition-all">
                Salvar Configurações
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center text-center">
            <Info size={32} className="text-slate-400 mb-3" />
            <p className="text-sm text-slate-500">
              Precisa de ajuda com a configuração do seu ERP Industrial?<br/>
              Entre em contato com o suporte técnico em <span className="text-blue-600 font-bold">suporte@jpssteel.com.br</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
