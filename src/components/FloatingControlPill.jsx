import React from 'react';
import { Icons } from './Icons';

export default function FloatingControlPill({
  activeView,
  setActiveView,
  darkMode,
  toggleDarkMode,
  openCreateTaskModal,
  onGenerateBathrooms,
  onGenerateVents,
  onGenerateDaily,
  onSyncEmptyRooms,
  onAssign,
  generatingState,
}) {
  const btn = `flex items-center justify-center p-2 rounded-full transition-all cursor-pointer ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-900/5'}`;

  const themeBtn = `flex items-center justify-center p-2 rounded-full transition-all cursor-pointer ${darkMode ? 'text-amber-400 hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-900/5'}`;

  const actionBtn = (disabled) =>
    `w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer border ${disabled ? (darkMode ? 'text-slate-600 border-white/5 cursor-not-allowed opacity-50' : 'text-slate-300 border-slate-200 cursor-not-allowed opacity-50') : (darkMode ? 'text-slate-300 hover:text-white hover:bg-white/10 border-white/10' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 border-slate-200')}`;

  const views = {
    schedule: [
      { key: 'assign', icon: 'person_add', label: 'Assign task', onClick: onAssign, primary: true },
      { key: 'bath', icon: 'shower', label: 'Generate bathrooms', onClick: () => onGenerateBathrooms?.('bathroom_deep_clean'), disabled: !!generatingState },
      { key: 'vent', icon: 'air', label: 'Generate vents', onClick: () => onGenerateVents?.('vent_cleaning'), disabled: !!generatingState },
      { key: 'daily', icon: 'cleaning_services', label: 'Generate daily', onClick: () => onGenerateDaily?.('daily'), disabled: !!generatingState },
    ],
    'empty-rooms-live': [
      { key: 'sync', icon: 'sync', label: 'Sync Cloudbeds', onClick: onSyncEmptyRooms, disabled: !!generatingState },
    ],
    'board': [
      { key: 'task', icon: 'add', label: 'New task', onClick: openCreateTaskModal, primary: true },
    ],
  };

  return (
    <div
      className="fixed bottom-6 lg:bottom-8 left-1/2 -translate-x-1/2 z-30 shadow-lg rounded-full flex items-center gap-1.5 lg:gap-2 px-3 lg:px-4 py-2 lg:py-2.5 max-sm:scale-90"
      style={{
        background: darkMode ? 'rgba(15, 17, 21, 0.35)' : 'rgba(255, 255, 255, 0.35)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)',
        borderWidth: '1.5px',
        minWidth: '160px',
      }}
    >
      <button onClick={() => setActiveView(activeView === 'schedule' ? 'board' : 'schedule')} className={btn} title="Toggle view">
        {activeView === 'schedule' ? <Icons.Board /> : <NavIcon name="calendar_month" />}
      </button>

      <button onClick={toggleDarkMode} className={themeBtn} title="Toggle theme">
        {darkMode ? <Icons.Sun /> : <Icons.Moon />}
      </button>

      <div className={`h-5 w-px ${darkMode ? 'bg-white/10' : 'bg-slate-900/10'}`} />

      <div className="flex items-center gap-2">
        {actions.map(a => (
          <button
            key={a.key}
            onClick={a.onClick}
            disabled={a.disabled}
            title={a.label}
            className={a.primary
              ? `w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer border ${darkMode ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-white/20' : 'bg-slate-900 text-white hover:bg-slate-800 border-transparent'}`
              : actionBtn(a.disabled)}
          >
            {a.primary ? <Icons.Plus /> : <NavIcon name={a.icon} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavIcon({ name }) {
  return <span className="material-symbols-outlined select-none text-[20px] leading-none">{name}</span>;
}
