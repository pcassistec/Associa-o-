
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  LayoutDashboard, 
  CreditCard, 
  FileText, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Palmtree,
  MapPin,
  ShieldCheck,
  Wallet,
  ArrowLeftRight
} from 'lucide-react';
import { User, AppView, Member, Payment, Expense } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MembersList from './components/MembersList';
import AddressesView from './components/AddressesView';
import PaymentsManager from './components/PaymentsManager';
import Reports from './components/Reports';
import SettingsView from './components/SettingsView';
import UserManagement from './components/UserManagement';
import FinancePanel from './components/FinancePanel';
import CashFlowManager from './components/CashFlowManager';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [systemUsers, setSystemUsers] = useState<User[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('ampm_auth');
    if (savedUser) setCurrentUser(JSON.parse(savedUser));

    const savedSystemUsers = localStorage.getItem('ampm_users');
    if (savedSystemUsers) {
      setSystemUsers(JSON.parse(savedSystemUsers));
    } else {
      const initialAdmin: User = { id: 'admin', username: 'admin', password: '123456', name: 'Administrador Geral', role: 'admin' };
      setSystemUsers([initialAdmin]);
      localStorage.setItem('ampm_users', JSON.stringify([initialAdmin]));
    }

    const savedMembers = localStorage.getItem('ampm_members');
    if (savedMembers) setMembers(JSON.parse(savedMembers));

    const savedPayments = localStorage.getItem('ampm_payments');
    if (savedPayments) setPayments(JSON.parse(savedPayments));

    const savedExpenses = localStorage.getItem('ampm_expenses');
    if (savedExpenses) setExpenses(JSON.parse(savedExpenses));
  }, []);

  const saveMembers = (updatedMembers: Member[]) => {
    setMembers(updatedMembers);
    localStorage.setItem('ampm_members', JSON.stringify(updatedMembers));
  };

  const savePayments = (updatedPayments: Payment[]) => {
    setPayments(updatedPayments);
    localStorage.setItem('ampm_payments', JSON.stringify(updatedPayments));
  };

  const saveExpenses = (updatedExpenses: Expense[]) => {
    setExpenses(updatedExpenses);
    localStorage.setItem('ampm_expenses', JSON.stringify(updatedExpenses));
  };

  const saveSystemUsers = (updatedUsers: User[]) => {
    setSystemUsers(updatedUsers);
    localStorage.setItem('ampm_users', JSON.stringify(updatedUsers));
    const updatedMe = updatedUsers.find(u => u.id === currentUser?.id);
    if (updatedMe) {
      setCurrentUser(updatedMe);
      localStorage.setItem('ampm_auth', JSON.stringify(updatedMe));
    }
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('ampm_auth', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ampm_auth');
  };

  const updatePassword = (newPassword: string) => {
    if (!currentUser) return;
    const updatedUsers = systemUsers.map(u => u.id === currentUser.id ? { ...u, password: newPassword } : u);
    saveSystemUsers(updatedUsers);
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard members={members} payments={payments} />;
      case 'members':
        return <MembersList members={members} onSave={saveMembers} currentUser={currentUser} />;
      case 'addresses':
        return <AddressesView members={members} />;
      case 'payments':
        return <PaymentsManager members={members} payments={payments} onSave={savePayments} currentUser={currentUser} />;
      case 'finance':
        return <FinancePanel members={members} payments={payments} expenses={expenses} currentUser={currentUser} />;
      case 'cashflow':
        return <CashFlowManager payments={payments} members={members} expenses={expenses} onSaveExpenses={saveExpenses} currentUser={currentUser} />;
      case 'reports':
        return <Reports members={members} payments={payments} />;
      case 'users':
        return currentUser.role === 'admin' ? <UserManagement users={systemUsers} onSave={saveSystemUsers} /> : null;
      case 'settings':
        return <SettingsView user={currentUser} onUpdatePassword={updatePassword} />;
      default:
        return <Dashboard members={members} payments={payments} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'members', label: 'Associados', icon: Users },
    { id: 'addresses', label: 'Endereços', icon: MapPin },
    { id: 'payments', label: 'Lançamentos', icon: CreditCard },
    { id: 'cashflow', label: 'Livro Caixa', icon: ArrowLeftRight },
    { id: 'finance', label: 'Painel Financeiro', icon: Wallet },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    ...(currentUser.role === 'admin' ? [{ id: 'users', label: 'Usuários', icon: ShieldCheck }] : []),
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const getRoleLabel = (role: string) => {
    switch(role) {
      case 'admin': return 'Acesso Total';
      case 'editor': return 'Editor';
      case 'viewer': return 'Visualizador';
      default: return role;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-indigo-900 text-white transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Palmtree className="text-sky-300 w-8 h-8" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">AM Praia do Meio</h1>
              <span className="text-xs text-indigo-300">Gestão Comunitária</span>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <button key={item.id} onClick={() => { setActiveView(item.id as AppView); setIsSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeView === item.id ? 'bg-indigo-700 text-white shadow-lg' : 'text-indigo-200 hover:bg-indigo-800 hover:text-white'}`}>
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-indigo-800">
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{currentUser.name}</p>
                <p className="text-xs text-indigo-300 truncate">{getRoleLabel(currentUser.role)}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-indigo-200 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-colors">
              <LogOut size={20} />
              <span className="font-medium">Sair do Sistema</span>
            </button>
          </div>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
          <button className="lg:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <h2 className="text-lg font-semibold text-slate-800 hidden lg:block">
            {navItems.find(item => item.id === activeView)?.label}
          </h2>
          <div className="flex items-center gap-4">
             <span className="text-sm text-slate-500 font-medium hidden sm:inline">
               {new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">{renderContent()}</div>
        </main>
      </div>
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />}
    </div>
  );
};

export default App;
