import React, { useState } from 'react';
import { Icons } from './Icons';
import { getRecurrenceLabel } from '../utils/recurrence';

export default function TrackerSheet({
  tasks,
  statuses,
  darkMode,
  filterProperty,
  openEditTaskModal,
  handleDeleteTask,
  handleCompleteTask,
  handleCopyFollowUp,
  handleOpenReminderModal,
  handleStatusChange,
  handleUpdateRecurrence,
  showToast,
  copyTrackerData,
  exportToWord
}) {
  const [filterDateRange, setFilterDateRange] = useState('all');

  // Filter tasks based on location property and date range
  const filteredTrackerTasks = tasks.filter(t => {
    if (filterProperty !== 'All' && t.property !== filterProperty) return false;
    if (filterDateRange === 'today') {
      const todayStr = new Date().toISOString().split('T')[0];
      return t.dueDate === todayStr;
    }
    return true;
  });

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Glass Filters & Actions Bar */}
      <div className={`backdrop-blur-md p-4 rounded-xl border shadow-xs flex flex-col gap-4 ${darkMode ? 'bg-[#15181e]/60 border-slate-800' : 'bg-white/60 border-slate-200/60'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className={`text-[15px] font-medium ${darkMode ? 'text-slate-300' : 'text-slate-650'}`}>Timeframe:</span>
            <select 
              className={`border text-[15px] rounded-md focus:ring-0 block px-3 py-1.5 cursor-pointer outline-none ${darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-white/60 border-slate-200 text-slate-700'}`}
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Due Today</option>
            </select>
          </div>
          
          <div className="flex gap-3">
            <button onClick={copyTrackerData} className={`flex items-center px-4 py-2 text-sm font-medium border rounded-md transition-colors cursor-pointer ${darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white/60 border-slate-200 text-slate-650 hover:bg-slate-100/80'}`}>
              <Icons.Copy /> Copy Text
            </button>
            <button onClick={exportToWord} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm cursor-pointer border border-transparent">
              <Icons.Export /> Export Word
            </button>
          </div>
        </div>
      </div>

      {/* Glass List View (Table) */}
      <div className={`backdrop-blur-md rounded-xl overflow-hidden shadow-xs flex-1 flex border relative ${darkMode ? 'bg-[#15181e]/60 border-slate-800' : 'bg-white/60 border-slate-200/60'}`}>
        <div className="flex-1 overflow-x-auto relative">
          <table className="w-full text-sm text-left">
            <thead className={`text-[12px] uppercase font-bold tracking-wider ${darkMode ? 'text-slate-400 bg-slate-900/40 border-b border-slate-800' : 'text-slate-650 bg-slate-100 border-b border-slate-200'}`}>
              <tr>
                <th className="px-6 py-4 font-medium tracking-wide">Task</th>
                <th className="px-6 py-4 font-medium tracking-wide">Property</th>
                <th className="px-6 py-4 font-medium tracking-wide">Status & Recurrence</th>
                <th className="px-6 py-4 font-medium tracking-wide">Due</th>
                <th className="px-6 py-4 font-medium tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrackerTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No tasks found for selected filters.
                  </td>
                </tr>
              ) : (
                filteredTrackerTasks.map((task) => {
                  const statusConfig = statuses.find(s => s.id === task.status) || statuses[0];
                  return (
                    <tr 
                      key={task.id} 
                      className={`border-y border-r border-l-4 transition-colors group ${statusConfig.colBorder} ${statusConfig.trackerRowBg} hover:opacity-95 ${task.reminderActive ? (darkMode ? 'bg-amber-955/25 border-amber-900/40' : 'bg-amber-50/25 border-amber-202/40') : ''}`}
                      style={{ borderLeftColor: statusConfig.brandColor }}
                    >
                      <td className="px-6 py-4 w-1/3">
                        <div className={`font-semibold text-[15px] pr-4 ${statusConfig.titleText}`}>{task.title}</div>
                      </td>
                      <td className={`px-6 py-4 w-1/6 text-[13px] font-bold leading-snug ${darkMode ? 'text-slate-350' : 'text-slate-700'}`}>
                        {task.property}
                      </td>
                      <td className="px-6 py-4 w-1/6">
                        <div className="flex flex-col gap-2 items-start">
                          <div className="relative">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className={`px-3 py-1 rounded-md text-[13px] font-semibold cursor-pointer border focus:ring-0 focus:outline-none appearance-none pr-8 w-[120px] ${statusConfig.badgeBg} ${statusConfig.badgeText} border-transparent shadow-xs`}
                            >
                              {statuses.map(s => (
                                <option key={s.id} value={s.id} className={`text-[13px] ${darkMode ? 'text-slate-200 bg-slate-900' : 'text-slate-700 bg-white'}`}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <svg className={`w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${statusConfig.badgeText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                          
                          <div className="flex items-center text-slate-400 hover:text-slate-650 transition-colors relative">
                            <Icons.Repeat />
                            <select 
                              value={task.recurrence && task.recurrence.startsWith('custom:') ? 'custom' : (task.recurrence || 'none')}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'custom') {
                                  openEditTaskModal(task);
                                  showToast("Configure custom recurrence intervals in the details form.");
                                } else {
                                  handleUpdateRecurrence(task.id, val);
                                }
                              }}
                              className="text-[12px] bg-transparent border-none cursor-pointer focus:ring-0 p-0 pl-1.5 pr-4 outline-none appearance-none w-[90px]"
                            >
                              <option value="none">Once-off</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              {task.recurrence && task.recurrence.startsWith('custom:') && (
                                <option value="custom">{getRecurrenceLabel(task.recurrence)}</option>
                              )}
                            </select>
                            <svg className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 w-1/6 text-[13px] font-bold ${darkMode ? 'text-slate-350' : 'text-slate-700'}`}>
                        {task.dueDate}
                      </td>
                      <td className="px-6 py-4 w-1/6 text-right">
                        <div className={`flex justify-end items-center gap-1 transition-opacity ${task.reminderActive ? 'opacity-100' : 'opacity-55 group-hover:opacity-100'}`}>
                           
                           {/* Edit Button */}
                           <button 
                            onClick={() => openEditTaskModal(task)}
                            className={`flex items-center p-2 rounded transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100/50 hover:text-slate-700'}`}
                            title="Edit Task"
                           >
                             <span className="material-symbols-outlined text-[16px]">edit</span>
                           </button>

                           {/* Reminder Bell Button */}
                           <button 
                            onClick={() => handleOpenReminderModal(task)}
                            className={`flex items-center p-2 rounded transition-colors cursor-pointer ${task.reminderActive ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100/50 hover:text-slate-700')}`}
                            title={task.reminderActive ? "Edit Reminder" : "Set Reminder"}
                           >
                            {task.reminderActive ? <Icons.BellSolid /> : <Icons.Bell />}
                           </button>

                           {/* Complete Button */}
                           <button 
                            onClick={() => handleCompleteTask(task)}
                            className={`flex items-center p-2 rounded transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-green-955/40 hover:text-green-400' : 'text-slate-400 hover:bg-green-50 hover:text-green-700'}`}
                            title="Mark Complete / Trigger Recurrence"
                           >
                            <Icons.Check />
                           </button>
                           
                           {/* Follow Up WhatsApp Message Button */}
                           <button 
                            onClick={() => handleCopyFollowUp(task)}
                            className={`flex items-center p-2 rounded transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-green-955/40 hover:text-green-400' : 'text-slate-400 hover:bg-green-50 hover:text-green-700'}`}
                            title="Copy WhatsApp message"
                           >
                            <Icons.MessageCircle /> 
                           </button>

                           {/* Delete Button */}
                           <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className={`flex items-center p-2 rounded transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-red-950/40 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-700'}`}
                            title="Delete Task"
                           >
                            <Icons.Trash /> 
                           </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Scrollbar overlay */}
        <div className="absolute right-2 top-8 bottom-4 w-2.5 bg-slate-100/20 rounded-full pointer-events-none opacity-50 flex flex-col items-center pt-1">
           <svg className="w-2 h-2 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg>
           <div className="w-2.5 bg-slate-400 rounded-full h-1/3 mt-1 shadow-sm"></div>
         </div>

      </div>
    </div>
  );
}
