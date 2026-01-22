
import React, { useState, useMemo } from 'react';
import { Member, Payment, Expense, User, PaymentMethod } from '../types';
import { 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  Search, 
  X, 
  Calendar, 
  DollarSign, 
  Tag, 
  Trash2,
  FileText,
  Filter,
  AlertTriangle,
  Lock,
  Printer,
  FileDown,
  User as UserIcon,
  CreditCard
} from 'lucide-react';

interface CashFlowManagerProps {
  payments: Payment[];
  members: Member[];
  expenses: Expense[];
  onSaveExpenses: (expenses: Expense[]) => void;
  currentUser: User;
}

const CashFlowManager: React.FC<CashFlowManagerProps> = ({ payments, members, expenses, onSaveExpenses, currentUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Delete protection states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const [formData, setFormData] = useState({
    category: 'Outros' as Expense['category'],
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'Pix' as PaymentMethod
  });

  const isViewer = currentUser.role === 'viewer';

  // Unifica Entradas e Saídas em uma única lista cronológica
  const allTransactions = useMemo(() => {
    const incomes = payments
      .filter(p => p.status === 'paid')
      .map(p => {
        const member = members.find(m => m.id === p.memberId);
        return {
          id: p.id,
          type: 'income' as const,
          description: `Mensalidade: ${member?.name || 'Associado'}`,
          category: 'Mensalidade',
          amount: p.amount,
          date: p.paymentDate,
          paymentMethod: p.paymentMethod || 'Não Inf.',
          user: p.createdByName || 'Sistema'
        };
      });

    const exits = expenses.map(e => ({
      id: e.id,
      type: 'expense' as const,
      description: e.description,
      category: e.category,
      amount: e.amount,
      date: e.date,
      paymentMethod: e.paymentMethod || 'Não Inf.',
      user: e.createdByName
    }));

    return [...incomes, ...exits]
      .sort((a, b) => b.date.localeCompare(a.date))
      .filter(t => {
        const matchesSearch = 
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
          t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
      });
  }, [payments, expenses, members, searchTerm, filterType]);

  const totals = useMemo(() => {
    const income = allTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = allTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return {
      income,
      expense,
      balance: income - expense
    };
  }, [allTransactions]);

  const handlePrintCashFlow = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Relatório Livro Caixa - AM Praia do Meio</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 30px; color: #1e293b; background: white; }
            .header { border-bottom: 2px solid #1e293b; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
            .header h1 { margin: 0; font-size: 20px; text-transform: uppercase; font-weight: 900; }
            .header p { margin: 2px 0; font-size: 11px; color: #64748b; }
            .summary { display: grid; grid-template-cols: repeat(3, 1fr); gap: 15px; margin-bottom: 30px; }
            .summary-card { padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; }
            .summary-card span { display: block; font-size: 9px; font-weight: bold; color: #94a3b8; text-transform: uppercase; }
            .summary-card strong { font-size: 16px; display: block; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 9px; }
            th { background: #f8fafc; text-align: left; padding: 10px; border-bottom: 2px solid #e2e8f0; color: #475569; text-transform: uppercase; font-size: 8px; font-weight: bold; }
            td { padding: 8px 10px; border-bottom: 1px solid #f1f5f9; }
            .badge { font-weight: bold; font-size: 8px; padding: 2px 6px; border-radius: 4px; text-transform: uppercase; }
            .badge-income { background: #ecfdf5; color: #059669; }
            .badge-expense { background: #fef2f2; color: #dc2626; }
            .method-tag { color: #64748b; font-style: italic; }
            .signatures { display: grid; grid-template-cols: 1fr 1fr; gap: 60px; margin-top: 60px; }
            .sig-box { border-top: 1px solid #94a3b8; text-align: center; padding-top: 8px; }
            .sig-box p { margin: 0; font-size: 11px; font-weight: bold; }
            .sig-box span { font-size: 9px; color: #64748b; }
            @media print { body { padding: 0; } @page { margin: 1cm; size: portrait; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <p>Associação dos Moradores da Praia do Meio</p>
              <h1>Movimentação do Livro Caixa</h1>
              <p>Emissão: ${new Date().toLocaleString('pt-BR')} | Operador: ${currentUser.name}</p>
            </div>
            <div style="text-align: right">
              <p>Filtro: ${filterType === 'all' ? 'Tudo' : filterType === 'income' ? 'Entradas' : 'Saídas'}</p>
            </div>
          </div>

          <div class="summary">
            <div class="summary-card"><span>Entradas</span><strong style="color: #10b981">R$ ${totals.income.toFixed(2)}</strong></div>
            <div class="summary-card"><span>Saídas</span><strong style="color: #ef4444">R$ ${totals.expense.toFixed(2)}</strong></div>
            <div class="summary-card" style="background: #f8fafc"><span>Saldo</span><strong>R$ ${totals.balance.toFixed(2)}</strong></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Descrição / Categoria</th>
                <th>Pagamento</th>
                <th>Operador</th>
                <th style="text-align: right">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${allTransactions.map(t => `
                <tr>
                  <td>${new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td><span class="badge ${t.type === 'income' ? 'badge-income' : 'badge-expense'}">${t.type === 'income' ? 'Entrada' : 'Saída'}</span></td>
                  <td><strong>${t.description}</strong><br><small style="color:#94a3b8">${t.category}</small></td>
                  <td class="method-tag">${t.paymentMethod}</td>
                  <td>${t.user}</td>
                  <td style="text-align: right; font-weight: bold; color: ${t.type === 'income' ? '#059669' : '#dc2626'}">
                    ${t.type === 'income' ? '+' : '-'} ${t.amount.toFixed(2)}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="signatures">
            <div class="sig-box"><p>${currentUser.name}</p><span>Emitido por</span></div>
            <div class="sig-box"><p>&nbsp;</p><span>Visto da Diretoria</span></div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer) return;

    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      paymentMethod: formData.paymentMethod,
      createdByName: currentUser.name,
      createdAt: new Date().toLocaleString('pt-BR')
    };

    onSaveExpenses([...expenses, newExpense]);
    setIsModalOpen(false);
    setFormData({ 
      category: 'Outros', 
      description: '', 
      amount: '', 
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'Pix'
    });
  };

  const handleOpenDeleteConfirm = (id: string) => {
    if (isViewer) return;
    setExpenseToDelete(id);
    setAdminPassword('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === currentUser.password) {
      if (expenseToDelete) {
        onSaveExpenses(expenses.filter(e => e.id !== expenseToDelete));
        setIsDeleteModalOpen(false);
        setExpenseToDelete(null);
      }
    } else {
      setDeleteError('Senha incorreta.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Livro Caixa</h1>
          <p className="text-slate-500">Gestão de entradas e saídas com rastreabilidade total.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handlePrintCashFlow}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <Printer size={18} className="text-indigo-600" />
            Imprimir Relatório
          </button>
          {!isViewer && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
            >
              <Plus size={20} />
              Registrar Saída (Gasto)
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Entradas</p>
          <h3 className="text-xl font-black text-emerald-600">R$ {totals.income.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Saídas</p>
          <h3 className="text-xl font-black text-red-600">R$ {totals.expense.toFixed(2)}</h3>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Saldo Atual</p>
          <h3 className={`text-xl font-black ${totals.balance >= 0 ? 'text-indigo-600' : 'text-red-600'}`}>
            R$ {totals.balance.toFixed(2)}
          </h3>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Search size={18} /></div>
          <input
            type="text"
            placeholder="Buscar por descrição, operador ou forma de pagamento..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {(['all', 'income', 'expense'] as const).map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                filterType === type ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {type === 'all' ? 'Tudo' : type === 'income' ? 'Entradas' : 'Saídas'}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-400 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest">Data</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest">Tipo</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest">Descrição / Categoria</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest">Forma</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest">Operador</th>
                <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-right">Valor</th>
                {!isViewer && <th className="px-6 py-5 text-[10px] font-bold uppercase tracking-widest text-right">Ação</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {allTransactions.map((t, i) => (
                <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-slate-500">{new Date(t.date + 'T12:00:00').toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase w-fit ${
                      t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {t.type === 'income' ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
                      {t.type === 'income' ? 'Entrada' : 'Saída'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-700">{t.description}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{t.category}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-slate-500 italic">{t.paymentMethod}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                      <UserIcon size={12} className="text-slate-300" /> {t.user}
                    </div>
                  </td>
                  <td className={`px-6 py-4 text-right font-black ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                  </td>
                  {!isViewer && (
                    <td className="px-6 py-4 text-right">
                      {t.type === 'expense' && (
                        <button onClick={() => handleOpenDeleteConfirm(t.id)} className="p-2 text-slate-300 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Despesa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><ArrowDownCircle className="text-red-600" /> Nova Despesa</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 p-2"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddExpense} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Categoria</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Tag size={18} /></div>
                  <select
                    required value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as Expense['category']})}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 appearance-none font-medium"
                  >
                    <option value="Manutenção">Manutenção</option>
                    <option value="Utilidades">Utilidades</option>
                    <option value="Administrativo">Administrativo</option>
                    <option value="Eventos">Eventos</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Descrição do Gasto</label>
                <input
                  type="text" required value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-medium"
                  placeholder="Ex: Compra de materiais de limpeza"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Valor (R$)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><DollarSign size={18} /></div>
                    <input
                      type="number" step="0.01" required value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-medium"
                      placeholder="0,00"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Data</label>
                  <input
                    type="date" required value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 font-medium"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Forma de Pagamento</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><CreditCard size={18} /></div>
                  <select
                    required value={formData.paymentMethod}
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 appearance-none font-medium"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Transferência">Transferência</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-100 transition-all active:scale-95">Confirmar Saída</button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Deletar */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Autorizar Exclusão</h2>
            <form onSubmit={handleConfirmDelete} className="space-y-4 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1 text-center block">Sua Senha de Acesso</label>
              <input type="password" required autoFocus value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium" />
              {deleteError && <p className="text-red-600 text-xs font-bold">{deleteError}</p>}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-100">Confirmar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashFlowManager;
