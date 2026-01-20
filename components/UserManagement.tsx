
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  UserPlus, 
  Search, 
  Shield, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Lock,
  CheckCircle2,
  Eye,
  Settings
} from 'lucide-react';

interface UserManagementProps {
  users: User[];
  onSave: (users: User[]) => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, onSave }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'viewer' as UserRole
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        username: user.username,
        password: user.password,
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        username: '',
        password: '',
        role: 'viewer'
      });
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (id === 'admin') {
      alert('O administrador principal não pode ser removido.');
      return;
    }
    if (confirm('Deseja realmente remover este usuário do sistema?')) {
      onSave(users.filter(u => u.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingUser) {
      const updated = users.map(u => u.id === editingUser.id ? {
        ...u,
        ...formData
      } : u);
      onSave(updated);
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      };
      onSave([...users, newUser]);
    }
    setIsModalOpen(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch(role) {
      case 'admin':
        return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase rounded-full border border-indigo-200 flex items-center gap-1.5"><Shield size={10} /> Acesso Total</span>;
      case 'editor':
        return <span className="px-2.5 py-1 bg-sky-100 text-sky-700 text-[10px] font-bold uppercase rounded-full border border-sky-200 flex items-center gap-1.5"><Settings size={10} /> Editor</span>;
      case 'viewer':
        return <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase rounded-full border border-slate-200 flex items-center gap-1.5"><Eye size={10} /> Visualizador</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Usuários do Sistema</h1>
          <p className="text-slate-500">Gerencie quem pode acessar e o que pode fazer no sistema.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <UserPlus size={20} />
          Novo Usuário
        </button>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Buscar usuário por nome ou login..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map(user => (
          <div key={user.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden group hover:shadow-md transition-all">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-xl border border-slate-100">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{user.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">@{user.username}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                    <Edit size={16} />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                {getRoleBadge(user.role)}
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                  <Lock size={10} /> Ativo
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Nome Completo</label>
                <input
                  type="text" required
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                  placeholder="Nome do operador"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Login</label>
                  <input
                    type="text" required
                    value={formData.username}
                    onChange={e => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    placeholder="Ex: joao.silva"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Senha</label>
                  <input
                    type="password" required
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                    placeholder="••••••"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Nível de Permissão</label>
                <div className="grid grid-cols-1 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'admin'})}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      formData.role === 'admin' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${formData.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Shield size={18} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${formData.role === 'admin' ? 'text-indigo-900' : 'text-slate-700'}`}>Acesso Total</p>
                      <p className="text-[10px] text-slate-500">Pode gerenciar tudo e usuários.</p>
                    </div>
                    {formData.role === 'admin' && <CheckCircle2 className="ml-auto text-indigo-600" size={18} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'editor'})}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      formData.role === 'editor' ? 'border-sky-600 bg-sky-50' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${formData.role === 'editor' ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Settings size={18} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${formData.role === 'editor' ? 'text-sky-900' : 'text-slate-700'}`}>Editor</p>
                      <p className="text-[10px] text-slate-500">Pode editar cadastros e pagamentos.</p>
                    </div>
                    {formData.role === 'editor' && <CheckCircle2 className="ml-auto text-sky-600" size={18} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({...formData, role: 'viewer'})}
                    className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                      formData.role === 'viewer' ? 'border-slate-400 bg-slate-50' : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${formData.role === 'viewer' ? 'bg-slate-400 text-white' : 'bg-slate-100 text-slate-400'}`}>
                      <Eye size={18} />
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-bold ${formData.role === 'viewer' ? 'text-slate-900' : 'text-slate-700'}`}>Visualizador</p>
                      <p className="text-[10px] text-slate-500">Apenas consulta de dados e relatórios.</p>
                    </div>
                    {formData.role === 'viewer' && <CheckCircle2 className="ml-auto text-slate-400" size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  Salvar Usuário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
