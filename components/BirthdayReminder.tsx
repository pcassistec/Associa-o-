
import React from 'react';
import { Cake, Calendar as CalendarIcon, ChevronRight } from 'lucide-react';
import { Member } from '../types';

interface BirthdayReminderProps {
  members: Member[];
}

const BirthdayReminder: React.FC<BirthdayReminderProps> = ({ members }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  const isToday = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00');
    return d.getMonth() === currentMonth && d.getDate() === currentDate;
  };

  const getUpcomingBirthdays = () => {
    return members
      .filter(m => m.active && m.birthDate)
      .map(m => {
        const bDay = new Date(m.birthDate + 'T12:00:00');
        let nextBDay = new Date(today.getFullYear(), bDay.getMonth(), bDay.getDate());
        
        // Se já passou este ano, considera o próximo
        if (nextBDay < new Date(today.getFullYear(), currentMonth, currentDate)) {
          nextBDay.setFullYear(today.getFullYear() + 1);
        }

        const diffTime = nextBDay.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return { member: m, daysUntil: diffDays, date: bDay };
      })
      .filter(item => item.daysUntil >= 0 && item.daysUntil <= 7)
      .sort((a, b) => a.daysUntil - b.daysUntil);
  };

  const upcoming = getUpcomingBirthdays();

  if (upcoming.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <Cake size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Aniversariantes</h3>
        </div>
        <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase tracking-wider">
          Próximos 7 dias
        </span>
      </div>

      <div className="space-y-4">
        {upcoming.map(({ member, daysUntil, date }) => {
          const birthdayToday = daysUntil === 0;
          return (
            <div 
              key={member.id} 
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                birthdayToday 
                ? 'bg-indigo-50 border border-indigo-100 animate-pulse' 
                : 'hover:bg-slate-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${
                birthdayToday ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {member.name.charAt(0)}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${birthdayToday ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {member.name}
                </p>
                <p className="text-xs text-slate-500">
                  {birthdayToday 
                    ? '🎉 É HOJE!' 
                    : `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}`}
                </p>
              </div>

              {!birthdayToday && (
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  em {daysUntil}d
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button className="w-full mt-6 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
        Ver calendário completo
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default BirthdayReminder;
