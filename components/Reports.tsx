
import React from 'react';
import { Member, Payment } from '../types';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, 
  Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Download, 
  FileSpreadsheet, 
  Printer, 
  TrendingUp, 
  Info, 
  Activity, 
  User as UserIcon, 
  Clock,
  CalendarDays,
  FileCheck
} from 'lucide-react';

interface ReportsProps {
  members: Member[];
  payments: Payment[];
}

const Reports: React.FC<ReportsProps> = ({ members, payments }) => {
  const currentYear = new Date().getFullYear();
  const monthsNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Coleta de dados anuais para o gráfico
  const yearlyData = Array.from({ length: 12 }).map((_, i) => {
    const monthPayments = payments.filter(p => p.month === i && p.year === currentYear && p.status === 'paid');
    return {
      name: monthsNames[i].substring(0, 3),
      total: monthPayments.reduce((acc, curr) => acc + curr.amount, 0),
      count: monthPayments.length
    };
  });

  const totalCollectedYear = yearlyData.reduce((acc, curr) => acc + curr.total, 0);
  const averageMonthly = totalCollectedYear / 12;

  const handlePrintAuditReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const activeMembers = members.filter(m => m.active).sort((a, b) => a.name.localeCompare(b.name));

    const html = `
      <html>
        <head>
          <title>Relatório de Auditoria de Pagamentos - ${currentYear}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #1e293b; font-size: 10px; }
            .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #1e1b4b; font-size: 18px; text-transform: uppercase; font-weight: 900; }
            .header p { margin: 2px 0; color: #64748b; font-size: 10px; }
            .meta-info { display: flex; justify-content: space-between; margin-bottom: 15px; font-weight: bold; font-size: 9px; color: #475569; }
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            th, td { border: 1px solid #e2e8f0; padding: 6px 2px; text-align: center; overflow: hidden; }
            th { background: #f8fafc; color: #475569; font-size: 8px; text-transform: uppercase; }
            th.member-col, td.member-col { text-align: left; padding-left: 8px; width: 180px; white-space: nowrap; text-overflow: ellipsis; }
            .day-badge { color: #059669; font-weight: 900; display: block; font-size: 10px; }
            .month-label { font-size: 7px; color: #94a3b8; text-transform: uppercase; margin-top: 2px; display: block; }
            .pending { color: #cbd5e1; font-size: 14px; }
            .footer { margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
            @media print {
              @page { size: landscape; margin: 1cm; }
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Associação dos Moradores da Praia do Meio</h1>
            <p>Relatório de Auditoria Anual: Consolidação de Recebimentos por Dia</p>
          </div>
          
          <div class="meta-info">
            <span>Exercício: ${currentYear}</span>
            <span>Total de Associados: ${activeMembers.length}</span>
            <span>Data de Emissão: ${new Date().toLocaleString('pt-BR')}</span>
          </div>

          <table>
            <thead>
              <tr>
                <th class="member-col">Nome do Associado</th>
                ${monthsNames.map(m => `<th>${m}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${activeMembers.map(m => `
                <tr>
                  <td class="member-col"><strong>${m.name}</strong></td>
                  ${Array.from({ length: 12 }).map((_, monthIdx) => {
                    const p = payments.find(pay => pay.memberId === m.id && pay.month === monthIdx && pay.year === currentYear && pay.status === 'paid');
                    if (!p) return '<td class="pending">-</td>';
                    
                    const day = new Date(p.paymentDate + 'T12:00:00').getDate();
                    return `
                      <td>
                        <span class="day-badge">${day.toString().padStart(2, '0')}</span>
                        <span class="month-label">PAGO</span>
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>Documento gerado para fins de auditoria interna e transparência financeira.</div>
            <div>Assinatura do Tesoureiro: __________________________________________</div>
          </div>

          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const recentActivities = [...members]
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0).getTime() || 0;
      const dateB = new Date(b.updatedAt || 0).getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, 8);

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
                <strong>R$ ${totalCollectedYear.toFixed(2)}</strong>
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

  const operatorStats = members.reduce((acc: Record<string, number>, member) => {
    if (member.createdByName) {
      acc[member.createdByName] = (acc[member.createdByName] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topOperators = Object.entries(operatorStats)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 5);

  const recentActivities = [...members]
    .sort((a, b) => {
      const dateA = new Date(a.updatedAt || 0).getTime() || 0;
      const dateB = new Date(b.updatedAt || 0).getTime() || 0;
      return dateB - dateA;
    })
    .slice(0, 8);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Relatórios Estratégicos</h1>
          <p className="text-slate-500">Análise financeira, demográfica e auditoria de pagamentos.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handlePrintAuditReport}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-95"
          >
            <CalendarDays size={18} />
            Relatório de Auditoria (Anual com Dias)
          </button>
          <button 
            onClick={handlePrintAll}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Printer size={16} />
            Relatório Gerencial
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Arrecadado ({currentYear})</p>
          <h2 className="text-3xl font-extrabold text-slate-800">R$ {totalCollectedYear.toFixed(2)}</h2>
          <div className="mt-4 flex items-center gap-2 text-emerald-600 text-sm font-bold">
            <TrendingUp size={16} />
            Crescimento anual em acompanhamento
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
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-8 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={20} /> Arrecadação Mensal Confirmada
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
                    <div className="bg-sky-500 h-full" style={{ width: `${((count as number) / members.length) * 100}%` }}></div>
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
                 Relatório baseado em <strong>registros iniciais</strong>. Use o Relatório de Auditoria no topo para detalhes de pagamentos.
               </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-xl border border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500 text-white rounded-xl">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-white text-lg">Log de Auditoria de Cadastros</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-800/50 text-slate-400">
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Associado</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Operador Responsável</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Última Edição</th>
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
                    <span className="text-sm text-slate-300 font-medium">{member.createdByName}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs text-slate-400 italic">
                      {member.updatedByName || 'Sem edições'}
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
