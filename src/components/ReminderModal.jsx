import React from 'react';

export default function ReminderModal({
  reminderModalTask,
  setReminderModalTask,
  reminderTimeInput,
  setReminderTimeInput,
  snoozeDurationInput,
  setSnoozeDurationInput,
  handleSaveReminderFromModal,
  handleRemoveReminderFromModal,
  darkMode
}) {
  if (!reminderModalTask) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs ${darkMode ? 'bg-black/45' : 'bg-black/20'}`}>
      <div className={`backdrop-blur-xl w-full max-w-md rounded-2xl shadow-2xl p-6 border animate-fade-in-up ${darkMode ? 'bg-[#15181e]/90 border-slate-800 text-slate-200' : 'bg-white/85 border-white/50 text-slate-700'}`}>
        <div className={`flex justify-between items-center border-b pb-4 mb-4 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <h3 className="font-bold text-xl font-serif-display">Set Task Reminder</h3>
          <button 
            onClick={() => setReminderModalTask(null)}
            className="text-slate-400 hover:text-slate-800 cursor-pointer flex items-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        <p className="text-[13px] text-slate-500 mb-4">
          Set a date and time to be reminded about:
          <span className={`block font-bold mt-1 text-[14px] ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>"{reminderModalTask.title}"</span>
        </p>

        <div className="space-y-4">
          {/* Reminder Date/Time */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reminder Date & Time</label>
            <input 
              type="datetime-local" 
              value={reminderTimeInput}
              onChange={(e) => setReminderTimeInput(e.target.value)}
              className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-800'}`}
            />
          </div>

          {/* Snooze duration */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Default Snooze Duration</label>
            <select 
              value={snoozeDurationInput}
              onChange={(e) => setSnoozeDurationInput(Number(e.target.value))}
              className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-800'}`}
            >
              <option value={5} className={darkMode ? 'bg-slate-900' : ''}>5 minutes</option>
              <option value={10} className={darkMode ? 'bg-slate-900' : ''}>10 minutes</option>
              <option value={15} className={darkMode ? 'bg-slate-900' : ''}>15 minutes</option>
              <option value={30} className={darkMode ? 'bg-slate-900' : ''}>30 minutes</option>
              <option value={60} className={darkMode ? 'bg-slate-900' : ''}>1 hour</option>
              <option value={1440} className={darkMode ? 'bg-slate-900' : ''}>1 day</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 border-t pt-4 border-slate-100/60">
          {reminderModalTask.reminderActive && (
            <button
              onClick={handleRemoveReminderFromModal}
              className={`px-4 py-2 border font-semibold text-sm rounded-lg transition-colors cursor-pointer mr-auto ${darkMode ? 'bg-red-950/20 border-red-900/50 text-red-400 hover:bg-red-900/40' : 'bg-red-55 border-red-100/40 text-red-600 hover:bg-red-100/60'}`}
            >
              Remove Reminder
            </button>
          )}
          
          <button 
            onClick={() => setReminderModalTask(null)}
            className={`px-4 py-2 border font-semibold text-sm rounded-lg transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700' : 'bg-slate-100 border-slate-200/40 text-slate-600 hover:bg-slate-200'}`}
          >
            Cancel
          </button>
          
          <button 
            onClick={handleSaveReminderFromModal}
            className={`px-4 py-2 font-semibold text-sm rounded-lg shadow-md transition-colors cursor-pointer border border-transparent ${darkMode ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
