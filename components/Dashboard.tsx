
import React from 'react';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { Member, Payment } from '../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import BirthdayReminder from './BirthdayReminder';

interface DashboardProps {
  members: Member[];
  payments: Payment[];
}

const Dashboard: React.FC<DashboardProps> = ({ members, payments }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const activeMembers = members.filter(m => m.active).length;
  const monthPayments = payments.filter(p => p.month === currentMonth && p.year === currentYear);
  const totalReceivedThisMonth = monthPayments.reduce((acc, curr) => acc + curr.amount, 0);
  const pendingPayments = activeMembers - monthPayments.length;

  const chartData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const m = d.getMonth();
    const y = d.getFullYear();
    const monthPayments = payments.filter(p => p.month === m && p.year === y);
    return {
      name: d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase(),
      total: monthPayments.reduce((acc, curr) => acc + curr.amount, 0),
      count: monthPayments.length
    };
  });

  const stats = [
    { label: 'Total de Associados', value: members.length, icon: Users, color: 'bg-indigo-500', trend: '+2% este mês', up: true },
    { label: 'Ativos atualmente', value: activeMembers, icon: TrendingUp, color: 'bg-emerald-500', trend: '95% taxa de atividade', up: true },
    { label: 'Receita (Mês Atual)', value: `R$ ${totalReceivedThisMonth.toFixed(2)}`, icon: DollarSign, color: 'bg-sky-500', trend: '+12% vs mês ant.', up: true },
    { label: 'Pendentes de Pagto', value: pendingPayments, icon: Clock, color: 'bg-amber-500', trend: 'Vence em 5 dias', up: false },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Painel de Controle</h1>
          <p className="text-slate-500">Resumo geral das atividades da associação.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-xl text-white`}>
                <stat.icon size={24} />
              </div>
              <div className={`flex items-center gap-1 text-xs font-bold ${stat.up ? 'text-emerald-600' : 'text-amber-600'}`}>
                {stat.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Arrecadação Mensal</h3>
                <p className="text-sm text-slate-500">Histórico de recebimentos dos últimos 6 meses</p>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} tickFormatter={(value) => `R$ ${value}`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <BirthdayReminder members={members} />
          
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Novos Associados</h3>
            <div className="space-y-4">
              {members.slice(-4).reverse().map((member, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold shrink-0">
                    {member.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 truncate">{member.name}</p>
                    <p className="text-xs text-slate-500 truncate">{member.joinDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
