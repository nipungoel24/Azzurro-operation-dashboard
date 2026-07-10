import React from 'react';
import { PROPERTIES, RESPONSIBLE_USERS } from '../constants';

export default function TaskModal({
  taskModalOpen,
  setTaskModalOpen,
  taskModalMode,
  activeView,
  taskTitleInput,
  setTaskTitleInput,
  taskDescInput,
  setTaskDescInput,
  taskPropertyInput,
  setTaskPropertyInput,
  taskStatusInput,
  setTaskStatusInput,
  taskResponsibleInput,
  setTaskResponsibleInput,
  taskDueDateInput,
  setTaskDueDateInput,
  taskRecurrenceInput,
  setTaskRecurrenceInput,
  customIntervalInput,
  setCustomIntervalInput,
  customUnitInput,
  setCustomUnitInput,
  handleSaveTask,
  darkMode,
  statuses
}) {
  if (!taskModalOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs ${darkMode ? 'bg-black/45' : 'bg-black/20'}`}>
      <div className={`backdrop-blur-xl w-full max-w-lg rounded-2xl shadow-2xl p-6 border animate-fade-in-up ${darkMode ? 'bg-[#15181e]/90 border-slate-800 text-slate-200' : 'bg-white/80 border-white/50 text-slate-707'}`}>
        <div className={`flex justify-between items-center border-b pb-4 mb-4 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <h3 className="font-extrabold text-xl font-serif-display">
            {taskModalMode === 'create' ? (activeView === 'board' ? 'Create Sprint Operations Task' : 'Add Location Tracker Item') : 'Edit Item Details'}
          </h3>
          <button 
            onClick={() => setTaskModalOpen(false)}
            className="text-slate-400 hover:text-slate-800 cursor-pointer flex items-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="space-y-4">
          {/* Task Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {activeView === 'board' ? 'Task Title' : 'Item to Track'}
            </label>
            <input 
              type="text" 
              value={taskTitleInput}
              onChange={(e) => setTaskTitleInput(e.target.value)}
              placeholder={activeView === 'board' ? "Enter a descriptive task title" : "e.g. Sanitary Bins Collection, Bathrooms Cleaning"}
              className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-800 focus:border-slate-400'}`}
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
            <textarea 
              value={taskDescInput}
              onChange={(e) => setTaskDescInput(e.target.value)}
              placeholder={activeView === 'board' ? "Details and specifications about the operations task..." : "Details about the location status, routine checks, or pricing details..."}
              rows="3"
              className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors resize-none ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-800 focus:border-slate-400'}`}
            />
          </div>

          <div className={`${activeView === 'board' ? 'flex flex-col' : 'grid grid-cols-2'} gap-4`}>
            {/* Location / Property */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
              <select 
                value={taskPropertyInput}
                onChange={(e) => setTaskPropertyInput(e.target.value)}
                className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors cursor-pointer ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-850 focus:border-slate-400'}`}
              >
                {PROPERTIES.filter(p => p !== 'All').map(p => (
                  <option key={p} value={p} className={darkMode ? 'bg-slate-900 text-white' : ''}>{p}</option>
                ))}
              </select>
            </div>

            {/* Responsible Person */}
            {activeView !== 'board' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assignee</label>
                <select 
                  value={taskResponsibleInput}
                  onChange={(e) => setTaskResponsibleInput(e.target.value)}
                  className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors cursor-pointer ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-855 focus:border-slate-400'}`}
                >
                  {RESPONSIBLE_USERS.map(user => (
                    <option key={user} value={user} className={darkMode ? 'bg-slate-900 text-white' : ''}>{user}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className={`grid ${activeView === 'board' ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
              <select 
                value={taskStatusInput}
                onChange={(e) => setTaskStatusInput(e.target.value)}
                className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors cursor-pointer ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-855 focus:border-slate-400'}`}
              >
                {statuses.map(s => (
                  <option key={s.id} value={s.id} className={darkMode ? 'bg-slate-900 text-white' : ''}>{s.label}</option>
                ))}
              </select>
            </div>

            {/* Due Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
              <input 
                type="date" 
                value={taskDueDateInput}
                onChange={(e) => setTaskDueDateInput(e.target.value)}
                className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-855 focus:border-slate-400'}`}
              />
            </div>

            {/* Recurrence (Tracker Only) */}
            {activeView !== 'board' && (
              <div className="flex flex-col gap-1.5 animate-fade-in col-span-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recurrence</label>
                <select 
                  value={taskRecurrenceInput}
                  onChange={(e) => setTaskRecurrenceInput(e.target.value)}
                  className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors cursor-pointer ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-855 focus:border-slate-400'}`}
                >
                  <option value="none" className={darkMode ? 'bg-slate-900' : ''}>Once-off</option>
                  <option value="daily" className={darkMode ? 'bg-slate-900' : ''}>Daily</option>
                  <option value="weekly" className={darkMode ? 'bg-slate-900' : ''}>Weekly</option>
                  <option value="custom" className={darkMode ? 'bg-slate-900' : ''}>Custom...</option>
                </select>
              </div>
            )}

            {/* Custom Recurrence Interval Sub-Inputs */}
            {activeView !== 'board' && taskRecurrenceInput === 'custom' && (
              <div className="col-span-full grid grid-cols-2 gap-4 mt-1 p-3.5 rounded-lg border animate-fade-in bg-slate-500/5 border-slate-500/10">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repeat Every</label>
                  <input 
                    type="number" 
                    min="1"
                    value={customIntervalInput}
                    onChange={(e) => setCustomIntervalInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className={`w-full border rounded-lg p-2 text-sm outline-none transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-white border-slate-200 text-slate-800 focus:border-slate-400'}`}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Unit</label>
                  <select 
                    value={customUnitInput}
                    onChange={(e) => setCustomUnitInput(e.target.value)}
                    className={`w-full border rounded-lg p-2 text-sm outline-none transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-white border-slate-200 text-slate-855 focus:border-slate-400'}`}
                  >
                    <option value="days" className={darkMode ? 'bg-slate-900' : ''}>Days</option>
                    <option value="weeks" className={darkMode ? 'bg-slate-900' : ''}>Weeks</option>
                    <option value="months" className={darkMode ? 'bg-slate-900' : ''}>Months</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6 border-t pt-4 border-slate-100/60">
          <button 
            onClick={() => setTaskModalOpen(false)}
            className={`px-4 py-2 border font-semibold text-sm rounded-lg transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700' : 'bg-slate-100 border-slate-200/40 text-slate-600 hover:bg-slate-200'}`}
          >
            Cancel
          </button>
          
          <button 
            onClick={handleSaveTask}
            className={`px-4 py-2 font-semibold text-sm rounded-lg shadow-md transition-colors cursor-pointer border border-transparent ${darkMode ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            {taskModalMode === 'create' ? (activeView === 'board' ? 'Create Sprint Task' : 'Add Tracker Item') : 'Save Details'}
          </button>
        </div>
      </div>
    </div>
  );
}
