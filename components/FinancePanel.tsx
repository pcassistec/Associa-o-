
import React, { useState, useMemo } from 'react';
import { Member, Payment, Expense, User } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, 
  Printer, AlertCircle, CheckCircle2, Search,
  ArrowRight, Calendar, Download,
  FileText, History, PieChart as PieIcon, ListFilter,
  ArrowUpCircle, ArrowDownCircle, Wallet
} from 'lucide-react';

interface FinancePanelProps {
  members: Member[];
  payments: Payment[];
  expenses: Expense[];
  currentUser: User;
}

const FinancePanel: React.FC<FinancePanelProps> = ({ members, payments, expenses, currentUser }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  const monthsNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Cálculo de estatísticas financeiras consolidadas
  const stats = useMemo(() => {
    const yearPayments = payments.filter(p => p.year === selectedYear && p.status === 'paid');
    const yearExpenses = expenses.filter(e => new Date(e.date).getFullYear() === selectedYear);

    const paidTotal = yearPayments.reduce((acc, p) => acc + p.amount, 0);
    const expenseTotal = yearExpenses.reduce((acc, e) => acc + e.amount, 0);
    const balance = paidTotal - expenseTotal;
    
    const pendingTotal = payments
      .filter(p => p.year === selectedYear && p.status === 'pending')
      .reduce((acc, p) => acc + p.amount, 0);

    return {
      paidTotal,
      expenseTotal,
      balance,
      pendingTotal
    };
  }, [payments, expenses, selectedYear]);

  // Dados para gráfico comparativo (Entrada vs Saída)
  const chartData = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const monthPayments = payments.filter(p => p.month === i && p.year === selectedYear && p.status === 'paid');
      const monthExpenses = expenses.filter(e => {
        const d = new Date(e.date + 'T12:00:00');
        return d.getMonth() === i && d.getFullYear() === selectedYear;
      });

      return {
        name: monthsNames[i].substring(0, 3),
        entradas: monthPayments.reduce((acc, p) => acc + p.amount, 0),
        saidas: monthExpenses.reduce((acc, e) => acc + e.amount, 0)
      };
    });
  }, [payments, expenses, selectedYear]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Análise Financeira Consolidada</h1>
          <p className="text-slate-500">Fluxo de caixa anual e balanço de receitas vs despesas.</p>
        </div>
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
           <button onClick={() => setSelectedYear(prev => prev - 1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
             <ChevronLeft size={16} />
           </button>
            <div className="px-4 py-2 font-bold text-slate-700 flex items-center gap-2">
              <Calendar size={14} className="text-indigo-600" />
              {selectedYear}
            </div>
            <button onClick={() => setSelectedYear(prev => prev + 1)} className="p-2 hover:bg-slate-50 rounded-lg text-slate-400">
              <ChevronRight size={16} />
            </button>
        </div>
      </div>

      {/* Grid de KPIs Financeiros */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <ArrowUpCircle size={24} />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Entradas</p>
          <h3 className="text-2xl font-black text-slate-800">R$ {stats.paidTotal.toFixed(2)}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <ArrowDownCircle size={24} />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Total Saídas</p>
          <h3 className="text-2xl font-black text-slate-800">R$ {stats.expenseTotal.toFixed(2)}</h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm ring-2 ring-indigo-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Wallet size={24} />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo em Caixa</p>
          <h3 className={`text-2xl font-black ${stats.balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            R$ {stats.balance.toFixed(2)}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <AlertCircle size={24} />
            </div>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Previsão Pendente</p>
          <h3 className="text-2xl font-black text-slate-800">R$ {stats.pendingTotal.toFixed(2)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-lg font-bold text-slate-800">Fluxo de Caixa Mensal</h3>
             <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Entradas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Saídas</span>
                </div>
             </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}} 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} 
                />
                <Bar dataKey="entradas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar dataKey="saidas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <ListFilter size={20} className="text-indigo-600" /> Gastos por Categoria
          </h3>
          <div className="space-y-6">
            {['Manutenção', 'Utilidades', 'Administrativo', 'Eventos', 'Outros'].map(cat => {
              const totalCat = expenses
                .filter(e => e.category === cat && new Date(e.date).getFullYear() === selectedYear)
                .reduce((acc, e) => acc + e.amount, 0);
              const percent = stats.expenseTotal > 0 ? (totalCat / stats.expenseTotal) * 100 : 0;
              
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs font-bold text-slate-600 mb-1.5 uppercase">
                    <span>{cat}</span>
                    <span>R$ {totalCat.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full bg-slate-400 transition-all duration-700`} style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <p className="text-xs text-indigo-700 leading-relaxed font-medium">
              Este gráfico exibe a distribuição proporcional dos gastos registrados no ano de <strong>{selectedYear}</strong>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Ícones simples
const ChevronLeft = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
const ChevronRight = ({size}: {size: number}) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>

export default FinancePanel;
