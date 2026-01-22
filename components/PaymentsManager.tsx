
import React, { useState } from 'react';
import { Member, Payment, User, PaymentMethod } from '../types';
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
  FileText,
  FileCheck,
  CreditCard,
  Wallet
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
    status: 'paid' as 'paid' | 'pending',
    paymentMethod: 'Pix' as PaymentMethod
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
        status: existing.status,
        paymentMethod: existing.paymentMethod || 'Pix'
      });
    } else {
      if (isViewer) return; 
      setSelectedPayment(null);
      setFormData({
        amount: '30.00',
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'paid',
        paymentMethod: 'Pix'
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
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      createdByName: currentUser.name
    };

    if (selectedPayment) {
      onSave(payments.map(p => p.id === selectedPayment.id ? paymentData : p));
    } else {
      onSave([...payments, paymentData]);
    }
    setIsModalOpen(false);
  };

  const generateReceipt = () => {
    if (!selectedPayment) return;
    const member = members.find(m => m.id === selectedPayment.memberId);
    if (!member) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Recibo de Pagamento - ${member.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 20px; color: #1e293b; background: #f1f5f9; }
            .receipt { background: white; max-width: 600px; margin: 40px auto; padding: 40px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 8px; position: relative; }
            .receipt:after { content: "RECIBO"; position: absolute; top: 20px; right: 20px; font-size: 40px; font-weight: 900; color: #f1f5f9; z-index: 0; }
            .content { position: relative; z-index: 1; }
            .header { border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .header h1 { margin: 0; font-size: 18px; color: #1e1b4b; }
            .amount-box { background: #f8fafc; padding: 10px 20px; border: 2px solid #e2e8f0; font-size: 24px; font-weight: bold; border-radius: 4px; }
            .body-text { line-height: 1.8; font-size: 14px; text-align: justify; margin-bottom: 40px; }
            .payment-method-badge { background: #f1f5f9; padding: 4px 10px; border-radius: 6px; font-weight: bold; color: #475569; font-size: 12px; }
            .signatures { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-top: 60px; }
            .sig-line { border-top: 1px solid #94a3b8; text-align: center; padding-top: 10px; font-size: 11px; color: #64748b; }
            @media print {
              body { background: white; padding: 0; }
              .receipt { box-shadow: none; border: 1px solid #ccc; margin: 0; }
            }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="content">
              <div class="header">
                <div>
                  <h1>Associação dos Moradores da Praia do Meio</h1>
                  <p style="font-size: 10px; color: #64748b; margin: 2px 0;">CNPJ: 00.000.000/0001-00 | Natal - RN</p>
                </div>
                <div class="amount-box">R$ ${selectedPayment.amount.toFixed(2)}</div>
              </div>
              <div class="body-text">
                Recebemos de <strong>${member.name}</strong>, inscrito(a) no CPF <strong>${member.cpf}</strong>, 
                a importância de <strong>R$ ${selectedPayment.amount.toFixed(2)}</strong> referente à mensalidade 
                da associação do mês de <strong>${months[selectedPayment.month]} de ${selectedPayment.year}</strong>,
                pago via <span class="payment-method-badge">${selectedPayment.paymentMethod || 'Não informado'}</span>.
                <br><br>
                Pelo que firmamos o presente para dar plena quitação.
              </div>
              <p style="text-align: right; font-size: 12px; margin-bottom: 40px;">
                Natal - RN, ${new Date(selectedPayment.paymentDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <div class="signatures">
                <div class="sig-line">
                  <strong>${member.name}</strong><br>Associado(a)
                </div>
                <div class="sig-line">
                  <strong>${selectedPayment.createdByName || currentUser.name}</strong><br>Tesouraria / Responsável
                </div>
              </div>
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
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
            table { width: 100%; border-collapse: collapse; font-size: 8px; }
            th, td { border: 1px solid #e2e8f0; padding: 4px 2px; text-align: center; }
            th { background: #f1f5f9; color: #475569; text-transform: uppercase; font-size: 7px; }
            td:first-child, th:first-child { text-align: left; padding-left: 8px; min-width: 140px; }
            .status-paid { color: #059669; font-weight: bold; }
            .payment-method-text { font-size: 6px; color: #94a3b8; font-weight: normal; margin-top: 1px; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              @page { size: landscape; margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Associação dos Moradores da Praia do Meio</h1>
            <p>Relatório Anual de Pagamentos e Formas de Recebimento - Exercício ${currentYear}</p>
            <p>Emitido em: ${new Date().toLocaleString('pt-BR')}</p>
          </div>
          <div class="summary">
            <div class="summary-card">
              <span>Associados Ativos</span>
              <strong>${filteredMembers.length}</strong>
            </div>
            <div class="summary-card">
              <span>Total Arrecadado</span>
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
                    if (!p) return '<td style="color: #cbd5e1">-</td>';
                    return `
                      <td class="${p.status === 'paid' ? 'status-paid' : ''}">
                        ${p.status === 'paid' ? 'PAGO' : 'PEND'}
                        <div class="payment-method-text">${p.paymentMethod || ''}</div>
                      </td>
                    `;
                  }).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const filteredMembers = members.filter(m => 
    m.active && m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Calendário de Recebimento</h1>
          <p className="text-slate-500">Controle mensal de mensalidades com registro da forma de pagamento.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handlePrintReport}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-all active:scale-95"
          >
            <Printer size={18} className="text-indigo-600" />
            Relatório de Caixa
          </button>

          <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
            <button onClick={() => setCurrentYear(prev => prev - 1)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all"><ChevronLeft size={20} /></button>
            <div className="flex items-center gap-2 px-4 font-bold text-slate-800"><Calendar size={18} className="text-indigo-600" />{currentYear}</div>
            <button onClick={() => setCurrentYear(prev => prev + 1)} className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><Search size={18} /></div>
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
                <th key={i} className="px-3 py-5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-tighter min-w-[80px]">{m.substring(0, 3)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">{member.name.charAt(0)}</div>
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
                        className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all relative group ${
                          payment 
                          ? payment.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          : isViewer ? 'bg-slate-50/50 text-slate-200 cursor-default' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {payment ? (
                          <>
                            <CheckCircle2 size={16} />
                            <span className="text-[7px] font-black mt-0.5">{payment.paymentMethod?.split(' ')[0] || '---'}</span>
                            <span className="text-[8px] font-bold">R${payment.amount}</span>
                          </>
                        ) : (
                          <Clock size={18} />
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

      {/* Modal de Pagamento */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="font-bold text-slate-800">Detalhes do Recebimento</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {activeCell && `${months[activeCell.month]} de ${currentYear}`}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2"><X size={20} /></button>
            </div>

            <form onSubmit={handleSavePayment} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Valor (R$)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><DollarSign size={16} /></div>
                    <input
                      type="number" step="0.01" required
                      readOnly={isViewer}
                      value={formData.amount}
                      onChange={e => setFormData({...formData, amount: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Data Pagto</label>
                  <input
                    type="date" required
                    readOnly={isViewer}
                    value={formData.paymentDate}
                    onChange={e => setFormData({...formData, paymentDate: e.target.value})}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Forma de Pagamento</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400"><CreditCard size={16} /></div>
                  <select
                    disabled={isViewer}
                    value={formData.paymentMethod}
                    onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold appearance-none"
                  >
                    <option value="Pix">Pix</option>
                    <option value="Dinheiro">Dinheiro</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Transferência">Transferência Bancária</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Status</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button" disabled={isViewer}
                    onClick={() => setFormData({...formData, status: 'paid'})}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all font-bold text-sm ${
                      formData.status === 'paid' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-100 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 size={16} /> Pago
                  </button>
                  <button
                    type="button" disabled={isViewer}
                    onClick={() => setFormData({...formData, status: 'pending'})}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all font-bold text-sm ${
                      formData.status === 'pending' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-100 text-slate-400'
                    }`}
                  >
                    <Clock size={16} /> Pendente
                  </button>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                {selectedPayment && selectedPayment.status === 'paid' && (
                  <button 
                    type="button" onClick={generateReceipt}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl border border-indigo-200 border-dashed hover:bg-indigo-100 transition-all"
                  >
                    <FileCheck size={18} /> Imprimir Recibo
                  </button>
                )}
                {!isViewer && (
                  <div className="flex gap-3">
                    {selectedPayment && (
                      <button type="button" onClick={handleOpenDeleteConfirm} className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100">Excluir</button>
                    )}
                    <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100">Salvar Dados</button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Deletar */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsDeleteConfirmOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6"><AlertTriangle size={32} /></div>
            <h2 className="text-xl font-bold text-slate-800 mb-6">Confirmar Exclusão</h2>
            <form onSubmit={handleConfirmDelete} className="space-y-4 text-left">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Senha de Administrador</label>
              <input type="password" required autoFocus value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-red-500 transition-all" />
              {deleteError && <p className="text-red-600 text-xs font-bold">{deleteError}</p>}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsDeleteConfirmOpen(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200">Excluir</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsManager;
