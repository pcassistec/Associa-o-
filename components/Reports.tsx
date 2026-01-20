
import React from 'react';
import { Member, Payment } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { Download, FileSpreadsheet, Printer, TrendingUp, Info, Activity, User as UserIcon, Clock } from 'lucide-react';

interface ReportsProps {
  members: Member[];
  payments: Payment[];
}

const Reports: React.FC<ReportsProps> = ({ members, payments }) => {
  const currentYear = new Date().getFullYear();

  // Coleta de dados anuais
  const yearlyData = Array.from({ length: 12 }).map((_, i) => {
    const monthPayments = payments.filter(p => p.month === i && p.year === currentYear);
    return {
      name: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][i],
      total: monthPayments.reduce((acc, curr) => acc + curr.amount, 0),
      count: monthPayments.length
    };
  });

  const totalCollectedYear = yearlyData.reduce((acc, curr) => acc + curr.total, 0);
  const averageMonthly = totalCollectedYear / 12;

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6'];

  const statusData = [
    { name: 'Ativos', value: members.filter(m => m.active).length },
    { name: 'Inativos', value: members.filter(m => !m.active).length },
  ];

  // Cálculo de produtividade por usuário (Top Operadores)
  const operatorStats = members.reduce((acc: Record<string, number>, member) => {
    if (member.createdByName) {
      acc[member.createdByName] = (acc[member.createdByName] || 0) + 1;
    }
    return acc;
  }, {});

  const topOperators = Object.entries(operatorStats)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  // Histórico de alterações recentes
  const recentActivities = [...members]
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0).getTime();
      const dateB = new Date(b.updatedAt || 0).getTime();
      return dateB - dateA;
    })
    .slice(0, 8);

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Relatório Gerencial - ${currentYear}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #1e1b4b; font-size: 24px; }
            .section { margin-bottom: 40px; }
            .section h2 { font-size: 16px; color: #4338ca; border-left: 4px solid #4338ca; padding-left: 10px; margin-bottom: 20px; }
            .grid { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .card { background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; }
            .card span { display: block; font-size: 10px; font-weight: bold; color: #94a3b8; text-transform: uppercase; }
            .card strong { font-size: 18px; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
            th { background: #f1f5f9; color: #475569; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; }
            @page { margin: 2cm; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Relatório Gerencial de Atividades</h1>
            <p>Associação dos Moradores da Praia do Meio - Natal/RN</p>
            <p>Ano de Referência: ${currentYear} | Emitido em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>

          <div class="section">
            <h2>Resumo Financeiro e Operacional</h2>
            <div class="grid">
              <div class="card">
                <span>Arrecadação Anual</span>
                strong>R$ ${totalCollectedYear.toFixed(2)}</strong>
              </div>
              <div class="card">
                <span>Média Mensal</span>
                <strong>R$ ${averageMonthly.toFixed(2)}</strong>
              </div>
              <div class="card">
                <span>Total Associados Ativos</span>
                <strong>${members.filter(m => m.active).length}</strong>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Arrecadação por Mês</h2>
            <table>
              <thead>
                <tr>
                  <th>Mês</th>
                  <th>Valor Arrecadado</th>
                  <th>Nº de Recebimentos</th>
                </tr>
              </thead>
              <tbody>
                ${yearlyData.map(d => `
                  <tr>
                    <td>${d.name}</td>
                    <td>R$ ${d.total.toFixed(2)}</td>
                    <td>${d.count}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Log de Auditoria - Últimas Atividades</h2>
            <table>
              <thead>
                <tr>
                  <th>Associado</th>
                  <th>Operador Responsável</th>
                  <th>Data/Hora da Ação</th>
                </tr>
              </thead>
              <tbody>
                ${recentActivities.map(a => `
                  <tr>
                    <td>${a.name}</td>
                    <td>${a.updatedByName || a.createdByName}</td>
                    <td>${a.updatedAt}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Relatório emitido pelo Sistema de Gestão AM Praia do Meio.</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios Estratégicos</h1>
          <p className="text-slate-500">Análise financeira, demográfica e auditoria de usuários.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handlePrintAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Printer size={16} />
            Imprimir Relatório Completo
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
            <FileSpreadsheet size={16} />
            Exportar Excel
          </button>
        </div>
      </div>

      {/* Cards de Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Arrecadado ({currentYear})</p>
          <h2 className="text-3xl font-extrabold text-slate-800">R$ {totalCollectedYear.toFixed(2)}</h2>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-bold">
            <TrendingUp size={16} />
            +15% em relação a {currentYear - 1}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Média de Recebimento</p>
          <h2 className="text-3xl font-extrabold text-slate-800">R$ {averageMonthly.toFixed(2)}</h2>
          <p className="mt-4 text-xs text-slate-400 font-medium italic">Baseado no ano vigente</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total de Moradores</p>
          <h2 className="text-3xl font-extrabold text-slate-800">{members.length}</h2>
          <div className="mt-4 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full" style={{ width: `${(members.filter(m => m.active).length / members.length) * 100}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Gráfico Financeiro */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={20} /> Arrecadação por Mês
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={yearlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Auditoria: Top Operadores */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <UserIcon className="text-sky-600" size={20} /> Cadastros por Usuário
          </h3>
          <div className="space-y-6">
            {topOperators.length > 0 ? topOperators.map(([name, count], i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-slate-400 text-xs">
                    {name.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-slate-700">{name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-2 w-24 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full" style={{ width: `${(count / members.length) * 100}%` }}></div>
                  </div>
                  <span className="text-xs font-black text-slate-400">{count}</span>
                </div>
              </div>
            )) : (
              <p className="text-center text-slate-400 text-sm py-10 italic">Nenhum dado de auditoria disponível.</p>
            )}
          </div>
          
          <div className="mt-10 p-4 bg-sky-50 rounded-2xl border border-sky-100">
            <div className="flex items-start gap-3">
               <Info className="text-sky-500 shrink-0" size={18} />
               <p className="text-xs text-sky-800 leading-relaxed font-medium">
                 Este relatório contabiliza quem realizou o <strong>cadastro inicial</strong> dos moradores no sistema.
               </p>
            </div>
          </div>
        </div>
      </div>

      {/* Log de Atividades Recentes */}
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 text-white rounded-xl">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-white text-lg">Log de Atividades Recentes</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest bg-slate-800 px-3 py-1 rounded-full">Auditoria em Tempo Real</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Associado</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Ação / Operador</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Endereço Registrado</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-right">Data/Hora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentActivities.map((member, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-slate-200">{member.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-tighter">Alterado por:</span>
                      <span className="text-sm text-slate-300 font-medium">{member.updatedByName || member.createdByName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-400 italic block max-w-[200px] truncate">
                      {member.address.street}, {member.address.number}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 text-slate-400">
                      <Clock size={12} />
                      <span className="text-xs font-mono">{member.updatedAt}</span>
                    </div>
                  </td>
                </tr>
              ))}
              {recentActivities.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                    Nenhuma atividade de auditoria registrada até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-slate-800/30 text-center">
          <button className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest">Ver Histórico Completo</button>
        </div>
      </div>
    </div>
  );
};

export default Reports;
