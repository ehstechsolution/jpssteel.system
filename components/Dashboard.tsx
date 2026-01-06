
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Client, Service, Movement } from '../types';

const data = [
  { name: 'Jan', revenue: 4000, costs: 2400 },
  { name: 'Fev', revenue: 3000, costs: 1398 },
  { name: 'Mar', revenue: 2000, costs: 9800 },
  { name: 'Abr', revenue: 2780, costs: 3908 },
  { name: 'Mai', revenue: 1890, costs: 4800 },
  { name: 'Jun', revenue: 2390, costs: 3800 },
];

export const Dashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  useEffect(() => {
    const unsubClients = onSnapshot(collection(db, 'clients'), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });
    const unsubMovements = onSnapshot(query(collection(db, 'movements'), orderBy('date', 'desc'), limit(5)), (snap) => {
      setMovements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement)));
    });

    return () => {
      unsubClients();
      unsubServices();
      unsubMovements();
    };
  }, []);

  const stats = [
    { label: 'Total Clientes', value: clients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%' },
    { label: 'Serviços Ativos', value: services.filter(s => s.status !== 'Concluído').length, icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50', trend: '+3' },
    { label: 'Faturamento Mês', value: 'R$ 45.2k', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50', trend: '+8.2%' },
    { label: 'Mov. Pendentes', value: movements.filter(m => m.status === 'Pendente').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', trend: '-2' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Bem-vindo, Admin</h1>
          <p className="text-slate-500">Aqui está o que está acontecendo na JPS Steel hoje.</p>
        </div>
        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
          <button className="px-4 py-2 text-sm font-medium text-slate-600 bg-slate-50 rounded-md">Hoje</button>
          <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600">Este Mês</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-slate-800">Fluxo de Faturamento</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-xs text-slate-500">
                <span className="w-3 h-3 bg-blue-600 rounded-full mr-2"></span> Receita
              </div>
              <div className="flex items-center text-xs text-slate-500">
                <span className="w-3 h-3 bg-slate-300 rounded-full mr-2"></span> Custos
              </div>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="costs" stroke="#cbd5e1" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-800 mb-6">Últimas Movimentações</h3>
          <div className="flex-1 space-y-4">
            {movements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <Clock size={40} className="mb-2 opacity-20" />
                <p>Sem movimentações recentes</p>
              </div>
            ) : (
              movements.map((mov) => (
                <div key={mov.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${mov.type === 'Entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {mov.type === 'Entrada' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{mov.description}</p>
                      <p className="text-xs text-slate-500">{mov.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${mov.type === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {mov.type === 'Entrada' ? '+' : '-'} R$ {mov.value.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">{mov.status}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          <button className="mt-6 w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-sm font-semibold transition-colors">
            Ver Todo Histórico
          </button>
        </div>
      </div>
    </div>
  );
};
