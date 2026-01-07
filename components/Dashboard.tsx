
import React, { useState, useEffect, useMemo } from 'react';
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
  Clock,
  Calendar
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Client, Service, Movement } from '../types';

export const Dashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [movements, setMovements] = useState<Movement[]>([]);

  useEffect(() => {
    const unsubClients = onSnapshot(collection(db, 'cliente'), (snap) => {
      setClients(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Client)));
    });
    
    const unsubServices = onSnapshot(collection(db, 'services'), (snap) => {
      setServices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service)));
    });

    const unsubMovements = onSnapshot(collection(db, 'financeiro'), (snap) => {
      setMovements(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movement)));
    });

    return () => {
      unsubClients();
      unsubServices();
      unsubMovements();
    };
  }, []);

  // 1. Estatísticas Calculadas
  const stats = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Total Clientes
    const totalClients = clients.length;

    // Serviços Ativos (Pendente ou Em Andamento)
    const activeServices = services.filter(s => s.status === 'Em Andamento' || s.status === 'Pendente').length;

    // Faturamento Mês (Soma das Entradas no mês atual que não estão canceladas/arquivadas)
    const monthlyRevenue = movements
      .filter(m => {
        if (m.tipo !== 'Entrada' || m.status === 'Cancelado' || m.status === 'Arquivado') return false;
        const vDate = new Date(m.vencimento + 'T12:00:00');
        return vDate.getMonth() === currentMonth && vDate.getFullYear() === currentYear;
      })
      .reduce((acc, curr) => acc + curr.valor, 0);

    // Valor Total das Movimentações Pendentes (Independente do mês)
    const pendingTotal = movements
      .filter(m => m.status === 'Pendente')
      .reduce((acc, curr) => acc + curr.valor, 0);

    return [
      { label: 'Total Clientes', value: totalClients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Serviços Ativos', value: activeServices, icon: Briefcase, color: 'text-orange-600', bg: 'bg-orange-50' },
      { label: 'Faturamento Mês', value: `R$ ${monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
      { label: 'Total Pendente', value: `R$ ${pendingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
    ];
  }, [clients, services, movements]);

  // 2. Dados do Gráfico (Últimos 6 meses)
  const chartData = useMemo(() => {
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const last6Months = [];
    
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth();
      const y = d.getFullYear();
      
      const revenue = movements
        .filter(mov => {
          if (mov.tipo !== 'Entrada' || mov.status === 'Cancelado' || mov.status === 'Arquivado') return false;
          const vDate = new Date(mov.vencimento + 'T12:00:00');
          return vDate.getMonth() === m && vDate.getFullYear() === y;
        })
        .reduce((acc, curr) => acc + curr.valor, 0);

      const costs = movements
        .filter(mov => {
          if (mov.tipo !== 'Saída' || mov.status === 'Cancelado' || mov.status === 'Arquivado') return false;
          const vDate = new Date(mov.vencimento + 'T12:00:00');
          return vDate.getMonth() === m && vDate.getFullYear() === y;
        })
        .reduce((acc, curr) => acc + curr.valor, 0);

      last6Months.push({
        name: monthNames[m],
        revenue,
        costs
      });
    }
    return last6Months;
  }, [movements]);

  // 3. Próximas Movimentações (5 próximas a partir de hoje)
  const upcomingMovements = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return movements
      .filter(m => m.vencimento >= todayStr && m.status !== 'Arquivado' && m.status !== 'Cancelado')
      .sort((a, b) => a.vencimento.localeCompare(b.vencimento))
      .slice(0, 5);
  }, [movements]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Painel Analítico</h1>
          <p className="text-slate-500 text-sm font-medium">Acompanhamento consolidado da JPS Steel.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                <stat.icon size={24} />
              </div>
            </div>
            <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{stat.label}</h3>
            <p className="text-xl font-black text-slate-900 mt-1 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Fluxo */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center">
                <TrendingUp size={16} className="mr-2 text-blue-600" /> Fluxo de Caixa (6 Meses)
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Comparativo de Entradas e Saídas</p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                  tickFormatter={(value) => `R$ ${value / 1000}k`}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    fontSize: '12px',
                    fontWeight: '900'
                  }}
                  formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR')}`, '']}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  name="Entradas"
                  stroke="#2563eb" 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="costs" 
                  name="Saídas"
                  stroke="#cbd5e1" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  fill="transparent" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Próximas Movimentações */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm flex flex-col">
          <div className="mb-8">
            <h3 className="font-black text-slate-800 text-sm uppercase tracking-widest flex items-center">
              <Clock size={16} className="mr-2 text-blue-600" /> Próximas Movimentações
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Agenda de faturas a vencer</p>
          </div>
          
          <div className="flex-1 space-y-4">
            {upcomingMovements.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 py-10">
                <Calendar size={48} className="mb-4 opacity-10" />
                <p className="text-xs font-black uppercase tracking-widest">Sem previsões</p>
              </div>
            ) : (
              upcomingMovements.map((mov) => (
                <div key={mov.id} className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-100 rounded-2xl transition-all group">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-xl ${mov.tipo === 'Entrada' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {mov.tipo === 'Entrada' ? <ArrowUpRight size={18} strokeWidth={3} /> : <ArrowDownRight size={18} strokeWidth={3} />}
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-800 line-clamp-1">{mov.descricao}</p>
                      <div className="flex items-center mt-0.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(mov.vencimento + 'T12:00:00').toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black ${mov.tipo === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {mov.valor.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-50">
            <p className="text-[9px] text-center font-black text-slate-300 uppercase tracking-widest">
              Dados atualizados em tempo real
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
