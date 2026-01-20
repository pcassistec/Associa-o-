
import React, { useState } from 'react';
import { User } from '../types';
import { Shield, Key, CheckCircle2, AlertCircle, Save } from 'lucide-react';

interface SettingsViewProps {
  user: User;
  onUpdatePassword: (password: string) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdatePassword }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (currentPass !== user.password) {
      setMessage({ type: 'error', text: 'Senha atual incorreta.' });
      return;
    }

    if (newPass !== confirmPass) {
      setMessage({ type: 'error', text: 'As novas senhas não coincidem.' });
      return;
    }

    if (newPass.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    onUpdatePassword(newPass);
    setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Minha Conta</h1>
        <p className="text-slate-500">Gerencie seu perfil e segurança de acesso.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center text- indigo-700 text-4xl font-black">
              {user.name.charAt(0)}
            </div>
            <h3 className="font-bold text-slate-800 text-lg">{user.name}</h3>
            <p className="text-slate-500 text-sm mb-6">@{user.username}</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-bold rounded-full uppercase tracking-wider">
              <Shield size={12} />
              Administrador
            </div>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-3xl text-white shadow-xl">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Key size={18} className="text-sky-300" />
              Segurança
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recomendamos trocar sua senha periodicamente. Evite senhas óbvias como datas de nascimento ou nomes de parentes.
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Alterar Senha</h3>
              <p className="text-sm text-slate-500">Defina uma nova senha de acesso para o sistema.</p>
            </div>
            
            <form onSubmit={handleUpdatePassword} className="p-8 space-y-6">
              {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
                  message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  <span className="text-sm font-bold">{message.text}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Senha Atual</label>
                <input
                  type="password" required
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Nova Senha</label>
                  <input
                    type="password" required
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Confirmar Nova Senha</label>
                  <input
                    type="password" required
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <Save size={20} />
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
