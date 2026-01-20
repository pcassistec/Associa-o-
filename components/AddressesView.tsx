
import React, { useState } from 'react';
import { MapPin, Search, Navigation, Home, Users, ExternalLink } from 'lucide-react';
import { Member } from '../types';

interface AddressesViewProps {
  members: Member[];
}

const AddressesView: React.FC<AddressesViewProps> = ({ members }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter(m => 
    m.address.street.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.address.neighborhood.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group members by street
  const groupedByStreet = filteredMembers.reduce((acc, member) => {
    const street = member.address.street;
    if (!acc[street]) acc[street] = [];
    acc[street].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  const streets = Object.keys(groupedByStreet).sort();

  const openInGoogleMaps = (address: any) => {
    const query = encodeURIComponent(`${address.street}, ${address.number}, ${address.neighborhood}, Natal, RN, ${address.zipCode}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Mapa de Endereços</h1>
          <p className="text-slate-500">Localização e agrupamento de moradores por logradouro.</p>
        </div>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Buscar por rua, bairro ou nome do morador..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-all"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: Street List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Logradouros</h3>
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm divide-y divide-slate-50">
            {streets.length > 0 ? streets.map(street => (
              <div key={street} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <Navigation size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{street}</p>
                      <p className="text-xs text-slate-400">{groupedByStreet[street].length} moradores</p>
                    </div>
                  </div>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-slate-400">
                <p className="text-sm">Nenhuma rua encontrada.</p>
              </div>
            )}
          </div>
        </div>

        {/* Main: Address Cards */}
        <div className="lg:col-span-3 space-y-6">
          {streets.map(street => (
            <div key={street} className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <MapPin size={18} className="text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-800">{street}</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedByStreet[street].map(member => (
                  <div key={member.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                          {member.address.number}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">{member.name}</p>
                          <p className="text-xs text-slate-500">{member.address.neighborhood}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => openInGoogleMaps(member.address)}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="Ver no Google Maps"
                      >
                        <ExternalLink size={18} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                        <Home size={14} />
                        <span>CEP: {member.address.zipCode}</span>
                      </div>
                      <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                        Morador Ativo
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Banner */}
      <div className="p-8 bg-gradient-to-r from-indigo-600 to-sky-600 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl">
            <MapPin size={32} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Resumo Geográfico</h3>
            <p className="text-indigo-100 opacity-80">Você tem moradores distribuídos em {streets.length} logradouros diferentes.</p>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <p className="text-3xl font-black">{members.length}</p>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Total Imóveis</p>
          </div>
          <div className="w-px h-10 bg-white/20"></div>
          <div className="text-center">
            <p className="text-3xl font-black">{streets.length}</p>
            <p className="text-xs font-bold uppercase tracking-widest opacity-70">Ruas Atendidas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressesView;
