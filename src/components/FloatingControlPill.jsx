import React from 'react';
import { Icons } from './Icons';

export default function FloatingControlPill({
  activeView,
  setActiveView,
  darkMode,
  toggleDarkMode,
  openCreateTaskModal,
  copyTrackerData,
  onGenerateBathrooms,
  onGenerateVents,
  onGenerateDaily,
  onSyncEmptyRooms,
  onAddFacility,
  onAddHandoff,
  onSyncScheduled,
  generatingState,
}) {
  const btn = (active) => `flex items-center justify-center p-2 rounded-full transition-all cursor-pointer ${active ? (darkMode ? 'text-white bg-white/15' : 'text-slate-900 bg-slate-900/10') : (darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-900/5')}`;

  const iconBtn = (active) => `w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer border ${active ? (darkMode ? 'bg-white/15 text-white border-white/10' : 'bg-slate-900/10 text-slate-900 border-slate-900/10') : (darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-900/5 border-slate-200')}`;

  const renderActions = () => {
    const actions = [];

    // View toggle
    const boardViews = ['board', 'tracker-global', 'tracker-empty-rooms'];
    const isBoard = boardViews.includes(activeView);
    actions.push(
      <button key="toggle" onClick={() => setActiveView(isBoard ? 'schedule' : 'board')} className={btn(isBoard)} title={isBoard ? 'Switch to Schedule' : 'Switch to Board'}>
        {isBoard ? <NavIcon name="calendar_month" /> : <Icons.Board />}
      </button>
    );

    // Dark mode
    actions.push(
      <button key="theme" onClick={toggleDarkMode} className={`flex items-center justify-center p-2 rounded-full transition-all cursor-pointer ${darkMode ? 'text-amber-400 hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-900/5'}`} title="Toggle theme">
        {darkMode ? <Icons.Sun /> : <Icons.Moon />}
      </button>
    );

    actions.push(<div key="sep1" className={`h-5 w-px ${darkMode ? 'bg-white/10' : 'bg-slate-900/10'}`} />);

    // Context-specific primary action
    switch (activeView) {
      case 'schedule':
        actions.push(
          <button key="gen-bath" onClick={onGenerateBathrooms} disabled={!!generatingState} title="Generate bathroom deep clean tasks" className={iconBtn(!!generatingState)}>
            <NavIcon name="shower" />
          </button>
        );
        actions.push(
          <button key="gen-vent" onClick={onGenerateVents} disabled={!!generatingState} title="Generate vent cleaning tasks" className={iconBtn(!!generatingState)}>
            <NavIcon name="air" />
          </button>
        );
        actions.push(
          <button key="gen-daily" onClick={onGenerateDaily} disabled={!!generatingState} title="Generate daily tasks" className={iconBtn(!!generatingState)}>
            <NavIcon name="cleaning_services" />
          </button>
        );
        break;
      case 'empty-rooms-live':
        actions.push(
          <button key="sync" onClick={onSyncEmptyRooms} disabled={!!generatingState} title="Sync with Cloudbeds" className={iconBtn(!!generatingState)}>
            <NavIcon name="sync" />
          </button>
        );
        break;
      case 'facilities':
      case 'property-inventory':
      case 'room-inventory':
      case 'bathroom-inventory':
        actions.push(
          <button key="add-fac" onClick={onAddFacility} title="Add facility" className={iconBtn(false)}>
            <NavIcon name="add" />
          </button>
        );
        break;
      case 'handoffs':
        actions.push(
          <button key="add-handoff" onClick={onAddHandoff} title="New handoff" className={iconBtn(false)}>
            <NavIcon name="swap_horiz" />
          </button>
        );
        break;
      default:
        // Board / tracker views
        actions.push(
          <button key="new-task" onClick={openCreateTaskModal} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer border ${darkMode ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-white/20' : 'bg-slate-900 text-white hover:bg-slate-800 border-transparent'}`} title="New task">
            <Icons.Plus />
          </button>
        );
    }

    // Copy report (only on tracker views)
    if (activeView === 'tracker-global') {
      actions.push(
        <button key="copy" onClick={copyTrackerData} className={btn(false)} title="Copy report">
          <Icons.Copy />
        </button>
      );
    }

    return actions;
  };

  return (
    <div 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 shadow-lg rounded-full px-5 py-2.5 flex items-center gap-3 transition-all hover:shadow-xl"
      style={{
        background: darkMode ? 'rgba(15, 17, 21, 0.35)' : 'rgba(255, 255, 255, 0.35)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.10)',
        borderWidth: '1.5px',
      }}
    >
      {renderActions()}
    </div>
  );
}

function NavIcon({ name }) {
  return <span className="material-symbols-outlined select-none text-[20px] leading-none">{name}</span>;
}
