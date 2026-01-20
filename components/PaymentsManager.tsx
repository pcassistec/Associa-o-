
import React, { useState } from 'react';
import { Member, Payment, User } from '../types';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Search,
  X,
  Trash2,
  Save,
  AlertCircle,
  Lock,
  AlertTriangle,
  Printer,
  FileText
} from 'lucide-react';

interface PaymentsManagerProps {
  members: Member[];
  payments: Payment[];
  onSave: (payments: Payment[]) => void;
  currentUser: User;
}

const PaymentsManager: React.FC<PaymentsManagerProps> = ({ members, payments, onSave, currentUser }) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  
  const isViewer = currentUser.role === 'viewer';

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [activeCell, setActiveCell] = useState<{memberId: string, month: number} | null>(null);

  // Secure Delete States
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  
  // Form States
  const [formData, setFormData] = useState({
    amount: '30.00',
    paymentDate: new Date().toISOString().split('T')[0],
    status: 'paid' as 'paid' | 'pending'
  });

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleCellClick = (memberId: string, month: number) => {
    const existing = payments.find(p => p.memberId === memberId && p.month === month && p.year === currentYear);
    
    setActiveCell({ memberId, month });
    if (existing) {
      setSelectedPayment(existing);
      setFormData({
        amount: existing.amount.toFixed(2),
        paymentDate: existing.paymentDate,
        status: existing.status
      });
    } else {
      if (isViewer) return; 
      setSelectedPayment(null);
      setFormData({
        amount: '30.00',
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'paid'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenDeleteConfirm = () => {
    if (isViewer) return;
    setAdminPassword('');
    setDeleteError('');
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === currentUser.password) {
      if (selectedPayment) {
        onSave(payments.filter(p => p.id !== selectedPayment.id));
        setIsDeleteConfirmOpen(false);
        setIsModalOpen(false);
        setSelectedPayment(null);
      }
    } else {
      setDeleteError('Senha de administrador incorreta.');
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isViewer || !activeCell) return;

    const paymentData: Payment = {
      id: selectedPayment?.id || Math.random().toString(36).substr(2, 9),
      memberId: activeCell.memberId,
      month: activeCell.month,
      year: currentYear,
      amount: parseFloat(formData.amount),
      paymentDate: formData.paymentDate,
      status: formData.status
    };

    if (selectedPayment) {
      onSave(payments.map(p => p.id === selectedPayment.id ? paymentData : p));
    } else {
      onSave([...payments, paymentData]);
    }
    setIsModalOpen(false);
  };

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const filteredMembers = members.filter(m => m.active);
    const totalCollected = payments.filter(p => p.year === currentYear && p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);

    const html = `
      <html>
        <head>
          <title>Relatório de Pagamentos - ${currentYear}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #1e1b4b; font-size: 24px; }
            .header p { margin: 5px 0; color: #64748b; font-size: 14px; }
            .summary { display: grid; grid-template-cols: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .summary-card { background: #f8fafc; padding: 15px; border-radius: 10px; border: 1px solid #e2e8f0; }
            .summary-card span { display: block; font-size: 11px; font-weight: bold; color: #94a3b8; text-transform: uppercase; }
            .summary-card strong { font-size: 18px; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; font-size: 9px; }
            th, td { border: 1px solid #e2e8f0; padding: 6px 4px; text-align: center; }
            th { background: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 8px; }
            td:first-child, th:first-child { text-align: left; padding-left: 10px; min-width: 150px; }
            .status-paid { color: #059669; font-weight: bold; }
            .status-pending { color: #d97706; font-weight: bold; }
            .status-empty { color: #cbd5e1; }
            .payment-info { display: flex; flex-direction: column; align-items: center; gap: 2px; }
            .payment-date { font-size: 7px; color: #64748b; font-weight: normal; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              .no-print { display: none; }
              body { padding: 0; }
              @page { size: landscape; margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Associação dos Moradores da Praia do Meio</h1>
            <p>Relatório Anual Detalhado de Pagamentos - Exercício ${currentYear}</p>
            <p>Emitido em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          <div class="summary">
            <div class="summary-card">
              <span>Total de Associados Ativos</span>
              <strong>${filteredMembers.length}</strong>
            </div>
            <div class="summary-card">
              <span>Arrecadação Total (${currentYear})</span>
              <strong>R$ ${totalCollected.toFixed(2)}</strong>
            </div>
            <div class="summary-card">
              <span>Operador Responsável</span>
              <strong>${currentUser.name}</strong>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Associado</th>
                ${months.map(m => `<th>${m.substring(0, 3)}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${filteredMembers.map(m => `
                <tr>
                  <td><strong>${m.name}</strong></td>
                  ${months.map((_, i) => {
                    const p = payments.find(pay => pay.memberId === m.id && pay.month === i && pay.year === currentYear);
                    if (!p) return '<td class="status-empty">-</td>';
                    
                    // Formata a data para exibir apenas DD/MM
                    const dateObj = new Date(p.paymentDate + 'T12:00:00');
                    const formattedDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    
                    return `
                      <td class="${p.status === 'paid' ? 'status-paid' : 'status-pending'}">
                        <div class="payment-info">
                          <span>${p.status === 'paid' ? 'PAGO' : 'PEND'}</span>
                          <span class="payment-date">${formattedDate}</span>
                        </div>
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <p>Este documento é para controle interno da Associação dos Moradores da Praia do Meio.</p>
            <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; width: 250px; margin-left: auto; margin-right: auto; padding-top: 10px;">
              Responsável pela Emissão
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const filteredMembers = members.filter(m => 
    m.active && m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMemberName = (id: string) => members.find(m => m.id === id)?.name || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Calendário de Recebimento</h1>
          <p className="text-slate-500">
            {isViewer 
              ? 'Visualize o status dos pagamentos mensais dos associados.' 
              : 'Clique em uma célula para lançar ou editar um pagamento.'}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <Printer size={18} className="text-indigo-600" />
            Exportar PDF / Imprimir
          </button>

          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <button 
              onClick={() => setCurrentYear(prev => prev - 1)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div className="flex items-center gap-2 px-4 font-bold text-slate-800">
              <Calendar size={18} className="text-indigo-600" />
              {currentYear}
            </div>
            <button 
              onClick={() => setCurrentYear(prev => prev + 1)}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Filtrar por nome do associado..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
        />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10 w-64 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Associado</th>
              {months.map((m, i) => (
                <th key={i} className="px-3 py-5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter min-w-[80px]">
                  {m.substring(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <span className="text-sm font-bold text-slate-700 truncate">{member.name}</span>
                  </div>
                </td>
                {months.map((_, monthIndex) => {
                  const payment = payments.find(p => p.memberId === member.id && p.month === monthIndex && p.year === currentYear);
                  return (
                    <td key={monthIndex} className="px-3 py-4 text-center">
                      <button
                        onClick={() => handleCellClick(member.id, monthIndex)}
                        disabled={isViewer && !payment}
                        className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center transition-all relative group ${
                          payment 
                          ? payment.status === 'paid' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'
                          : isViewer ? 'bg-slate-50/50 text-slate-200 cursor-default' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {payment ? (
                          <>
                            <CheckCircle2 size={18} />
                            <span className="text-[8px] font-bold mt-0.5">R${payment.amount}</span>
                          </>
                        ) : (
                          <Clock size={18} />
                        )}
                        {!isViewer && (
                          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-600 text-white rounded-full p-0.5">
                            <Search size={8} />
                          </div>
                        )}
                        {isViewer && payment && (
                          <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-500 text-white rounded-full p-0.5">
                            <Search size={8} />
                          </div>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Detalhes/Edição de Pagamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-800">
                  {isViewer ? 'Detalhes do Recebimento' : selectedPayment ? 'Editar Recebimento' : 'Lançar Recebimento'}
                </h2>
                <p className="text-xs text-slate-500 font-medium">
                  {activeCell && `${months[activeCell.month]} de ${currentYear} - ${getMemberName(activeCell.memberId)}`}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Valor do Recebimento (R$)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <DollarSign size={18} />
                  </div>
                  <input
                    type="number" step="0.01" required
                    readOnly={isViewer}
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className={`w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all font-bold text-slate-800 ${isViewer ? 'cursor-default' : 'focus:ring-2 focus:ring-indigo-500'}`}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Data do Pagamento</label>
                <input
                  type="date" required
                  readOnly={isViewer}
                  value={formData.paymentDate}
                  onChange={e => setFormData({...formData, paymentDate: e.target.value})}
                  className={`w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none transition-all font-medium text-slate-800 ${isViewer ? 'cursor-default' : 'focus:ring-2 focus:ring-indigo-500'}`}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={isViewer}
                    onClick={() => setFormData({...formData, status: 'paid'})}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all font-bold ${
                      formData.status === 'paid' 
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700' 
                      : 'bg-white border-slate-100 text-slate-400'
                    } ${isViewer && formData.status !== 'paid' ? 'opacity-50 grayscale' : ''}`}
                  >
                    <CheckCircle2 size={18} />
                    Pago
                  </button>
                  <button
                    type="button"
                    disabled={isViewer}
                    onClick={() => setFormData({...formData, status: 'pending'})}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border-2 transition-all font-bold ${
                      formData.status === 'pending' 
                      ? 'bg-amber-50 border-amber-500 text-amber-700' 
                      : 'bg-white border-slate-100 text-slate-400'
                    } ${isViewer && formData.status !== 'pending' ? 'opacity-50 grayscale' : ''}`}
                  >
                    <AlertCircle size={18} />
                    Pendente
                  </button>
                </div>
              </div>

              {!isViewer && (
                <div className="flex gap-3 pt-4">
                  {selectedPayment && (
                    <button 
                      type="button"
                      onClick={handleOpenDeleteConfirm}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 font-bold rounded-2xl hover:bg-red-100 transition-all"
                    >
                      <Trash2 size={18} />
                      Excluir
                    </button>
                  )}
                  <button 
                    type="submit"
                    className={`flex-1 flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 ${!selectedPayment && 'w-full'}`}
                  >
                    <Save size={18} />
                    Salvar
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão com Senha */}
      {isDeleteConfirmOpen && !isViewer && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsDeleteConfirmOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Excluir Recebimento</h2>
              <p className="text-slate-500 mb-6">
                Para confirmar a exclusão deste pagamento de <strong>R${selectedPayment?.amount.toFixed(2)}</strong>, por favor informe sua senha de administrador.
              </p>
              
              <form onSubmit={handleConfirmDelete} className="space-y-4">
                <div className="text-left space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Sua Senha</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                      <Lock size={18} />
                    </div>
                    <input
                      type="password"
                      required
                      autoFocus
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="Senha de acesso"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all font-medium"
                    />
                  </div>
                </div>

                {deleteError && (
                  <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-1">
                    {deleteError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsDeleteConfirmOpen(false)}
                    className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-6 items-center p-6 bg-indigo-900 rounded-3xl text-white shadow-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-emerald-400"></div>
          <span className="text-sm font-medium">Recebido</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-amber-400"></div>
          <span className="text-sm font-medium">Pendente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-white/20"></div>
          <span className="text-sm font-medium">Aguardando</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentsManager;
