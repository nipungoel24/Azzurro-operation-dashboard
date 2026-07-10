import React from 'react';

export default function ReminderOverlay({
  tasks,
  handleSnoozeReminder,
  handleDismissReminder,
  darkMode
}) {
  const triggeredTasks = tasks.filter(t => t.reminderTriggered);
  if (triggeredTasks.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-40 flex flex-col gap-3 max-w-sm w-full animate-fade-in-up">
      {triggeredTasks.map(task => (
        <div key={task.id} className={`backdrop-blur-lg border p-4 rounded-r-lg shadow-xl flex flex-col gap-2 ${darkMode ? 'bg-[#15181e]/80 border-slate-800' : 'bg-white/70 border-white/40'}`}>
          <div className="flex justify-between items-start">
            <h4 className={`font-bold text-sm leading-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Reminder: {task.title}</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${darkMode ? 'bg-slate-800 text-slate-350' : 'bg-slate-200/55 text-slate-600'}`}>{task.property}</span>
          </div>
          <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>It's time to check status or follow up with {task.responsible}.</p>
          <div className="flex gap-2 justify-end mt-2">
            <button 
              onClick={() => handleSnoozeReminder(task.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer border ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700 border-slate-200/50'}`}
            >
              Snooze ({task.snoozeDuration || 10}m)
            </button>
            <button 
              onClick={() => handleDismissReminder(task.id)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer border border-transparent"
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
