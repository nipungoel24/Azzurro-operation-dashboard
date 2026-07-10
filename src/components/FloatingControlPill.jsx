import React from 'react';
import { Icons } from './Icons';

export default function FloatingControlPill({
  activeView,
  setActiveView,
  darkMode,
  toggleDarkMode,
  openCreateTaskModal,
  copyTrackerData
}) {
  return (
    <div 
      className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 shadow-lg rounded-full px-6 py-2.5 flex items-center gap-4 transition-all hover:shadow-xl hover:scale-[1.01]"
      style={{
        background: darkMode ? 'rgba(15, 17, 21, 0.35)' : 'rgba(255, 255, 255, 0.35)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
        borderWidth: '1.5px',
      }}
    >
      {/* View Toggle Icon */}
      <button 
        onClick={() => setActiveView(activeView === 'board' ? 'tracker' : 'board')}
        className={`flex items-center justify-center p-2 rounded-full transition-all cursor-pointer ${activeView === 'board' ? (darkMode ? 'text-white bg-white/15' : 'text-slate-900 bg-slate-900/10') : (darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-900/5')}`}
        title={activeView === 'board' ? "Switch to Tracker View" : "Switch to Board View"}
      >
        {activeView === 'board' ? <Icons.Tracker /> : <Icons.Board />}
      </button>

      {/* Quick theme toggler in pill dock */}
      <button 
        onClick={toggleDarkMode}
        className={`flex items-center justify-center p-2 rounded-full transition-all cursor-pointer ${darkMode ? 'text-amber-400 hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-900/5'}`}
        title="Toggle Dark Mode"
      >
        {darkMode ? <Icons.Sun /> : <Icons.Moon />}
      </button>

      <div className={`h-4 w-px ${darkMode ? 'bg-white/10' : 'bg-slate-900/10'}`} />

      {/* Big Add Button in Center (Opens Modal) */}
      <button 
        onClick={openCreateTaskModal}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer border ${darkMode ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-white/20' : 'bg-slate-900 text-white hover:bg-slate-800 border-transparent'}`}
        title="Add New Task"
      >
        <Icons.Plus />
      </button>

      {/* Copy Report */}
      <button 
        onClick={copyTrackerData}
        className={`flex items-center justify-center p-2 transition-colors rounded-full cursor-pointer ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-900/5'}`}
        title="Copy Report Data"
      >
        <Icons.Copy />
      </button>
    </div>
  );
}
