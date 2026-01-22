
import React, { useState } from 'react';
import { Search, UserPlus, Filter, MoreHorizontal, Edit, Trash2, MapPin, Phone, Mail, Calendar, Home, AlertTriangle, Lock, X, History, User as UserIcon, CheckCircle, XCircle } from 'lucide-react';
import { Member, Address, User } from '../types';

interface MembersListProps {
  members: Member[];
  onSave: (members: Member[]) => void;
  currentUser: User;
}

const MembersList: React.FC<MembersListProps> = ({ members, onSave, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');

  const isViewer = currentUser.role === 'viewer';

  const [formData, setFormData] = useState({
    name: '',
    cpf: '',
    email: '',
    phone: '',
    birthDate: '',
    active: true,
    street: '',
    number: '',
    complement: '',
    neighborhood: 'Praia do Meio',
    zipCode: '59010-000'
  });

  const filteredMembers = members.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.cpf.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && m.active) || 
                          (statusFilter === 'inactive' && !m.active);
    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (member?: Member) => {
    if (isViewer) return;
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        cpf: member.cpf,
        email: member.email,
        phone: member.phone,
        birthDate: member.birthDate || '',
        active: member.active,
        street: member.address.street,
        number: member.address.number,
        complement: member.address.complement || '',
        neighborhood: member.address.neighborhood,
        zipCode: member.address.zipCode
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '', cpf: '', email: '', phone: '', birthDate: '', active: true,
        street: '', number: '', complement: '', 
        neighborhood: 'Praia do Meio', zipCode: '59010-000'
      });
    }
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (member: Member) => {
    if (isViewer) return;
    setMemberToDelete(member);
    setAdminPassword('');
    setDeleteError('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === currentUser.password) {
      if (memberToDelete) {
        onSave(members.filter(m => m.id !== memberToDelete.id));
        setIsDeleteModalOpen(false);
        setMemberToDelete(null);
      }
    } else {
      setDeleteError('Senha de administrador incorreta.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const address: Address = {
      street: formData.street,
      number: formData.number,
      complement: formData.complement,
      neighborhood: formData.neighborhood,
      zipCode: formData.zipCode
    };

    const now = new Date().toLocaleString('pt-BR');

    if (editingMember) {
      const updated = members.map(m => m.id === editingMember.id ? {
        ...m,
        name: formData.name,
        cpf: formData.cpf,
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate,
        active: formData.active,
        address,
        updatedById: currentUser.id,
        updatedByName: currentUser.name,
        updatedAt: now
      } : m);
      onSave(updated);
    } else {
      const newMember: Member = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        cpf: formData.cpf,
        email: formData.email,
        phone: formData.phone,
        birthDate: formData.birthDate,
        joinDate: new Date().toLocaleDateString('pt-BR'),
        active: formData.active,
        address,
        createdById: currentUser.id,
        createdByName: currentUser.name,
        updatedById: currentUser.id,
        updatedByName: currentUser.name,
        updatedAt: now
      };
      onSave([...members, newMember]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gestão de Associados</h1>
          <p className="text-slate-500">Cadastre e gerencie os moradores da associação.</p>
        </div>
        {!isViewer && (
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
          >
            <UserPlus size={20} />
            Novo Associado
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-white px-4 py-2 border border-slate-200 rounded-2xl shadow-sm">
          <Filter size={18} className="text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="bg-transparent border-none outline-none text-sm font-bold text-slate-600 cursor-pointer pr-2"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Apenas Ativos</option>
            <option value="inactive">Apenas Inativos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member.id} className={`bg-white rounded-2xl border ${member.active ? 'border-slate-100' : 'border-red-100 bg-red-50/10'} shadow-sm hover:shadow-md transition-all group flex flex-col`}>
            <div className="p-6 flex-1">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${member.active ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'} flex items-center justify-center font-bold text-xl`}>
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 leading-tight mb-1">{member.name}</h3>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">CPF: {member.cpf}</p>
                  </div>
                </div>
                {!isViewer && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(member)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleOpenDeleteModal(member)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span>Nasc: {member.birthDate ? new Date(member.birthDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'Não inf.'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-start gap-3 text-sm text-slate-600">
                  <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                  <span className="leading-tight">
                    {member.address.street}, {member.address.number}<br/>
                    {member.address.neighborhood} - {member.address.zipCode}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={`px-6 py-4 ${member.active ? 'bg-slate-50/50 border-slate-100' : 'bg-red-50/30 border-red-100'} border-t rounded-b-2xl`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Membro desde {member.joinDate}</span>
                <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${member.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                  {member.active ? 'Ativo' : 'Inativo'}
                </div>
              </div>
              
              {member.createdByName && (
                <div className={`space-y-1 pt-2 border-t ${member.active ? 'border-slate-100' : 'border-red-100'}`}>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <UserIcon size={10} className="text-slate-300" />
                    <span>Cadastrado por: <strong className="text-slate-500">{member.createdByName}</strong></span>
                  </div>
                  {member.updatedByName && member.updatedByName !== member.createdByName && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <History size={10} className="text-slate-300" />
                      <span>Editado por: <strong className="text-slate-500">{member.updatedByName}</strong></span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsDeleteModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2">Confirmar Exclusão</h2>
              <p className="text-slate-500 mb-6">
                Você está prestes a remover <strong>{memberToDelete?.name}</strong>. Esta ação é irreversível e apagará todos os dados vinculados.
              </p>
              
              <form onSubmit={handleConfirmDelete} className="space-y-4">
                <div className="text-left space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Confirme sua Senha</label>
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
                      placeholder="Sua senha de acesso"
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
                    onClick={() => setIsDeleteModalOpen(false)}
                    className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-2xl transition-all"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-3 bg-red-600 text-white font-bold rounded-2xl hover:bg-red-700 shadow-lg shadow-red-200 transition-all active:scale-95"
                  >
                    Excluir Agora
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800">
                  {editingMember ? 'Editar Associado' : 'Novo Associado'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                   <X size={24} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-indigo-50 pb-2">
                    <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest">Dados Pessoais</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
                      <button 
                        type="button"
                        onClick={() => setFormData({...formData, active: !formData.active})}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                          formData.active ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'
                        }`}
                      >
                        {formData.active ? <CheckCircle size={12} /> : <XCircle size={12} />}
                        {formData.active ? 'ATIVO' : 'INATIVO'}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Nome Completo</label>
                      <input
                        type="text" required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Data de Nascimento</label>
                      <input
                        type="date" required
                        value={formData.birthDate}
                        onChange={e => setFormData({...formData, birthDate: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">CPF</label>
                      <input
                        type="text" required
                        value={formData.cpf}
                        onChange={e => setFormData({...formData, cpf: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">E-mail</label>
                      <input
                        type="email" required
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Telefone</label>
                      <input
                        type="text" required
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-2 flex items-center gap-2">
                    <Home size={16} /> Endereço do Associado
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-4 space-y-2">
                      <label className="text-sm font-bold text-slate-700">Logradouro / Rua</label>
                      <input
                        type="text" required
                        value={formData.street}
                        onChange={e => setFormData({...formData, street: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Ex: Rua das Conchas"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-sm font-bold text-slate-700">Número</label>
                      <input
                        type="text" required
                        value={formData.number}
                        onChange={e => setFormData({...formData, number: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Ex: 123-A"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-sm font-bold text-slate-700">Complemento</label>
                      <input
                        type="text"
                        value={formData.complement}
                        onChange={e => setFormData({...formData, complement: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="Ex: Bloco B, Apto 202"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-sm font-bold text-slate-700">Bairro</label>
                      <input
                        type="text" required
                        value={formData.neighborhood}
                        onChange={e => setFormData({...formData, neighborhood: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-sm font-bold text-slate-700">CEP</label>
                      <input
                        type="text" required
                        value={formData.zipCode}
                        onChange={e => setFormData({...formData, zipCode: e.target.value})}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="59010-000"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 justify-end pt-6 sticky bottom-0 bg-white border-t border-slate-100 mt-4 pb-2">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-all">Cancelar</button>
                  <button type="submit" className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">Salvar Dados</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MembersList;
