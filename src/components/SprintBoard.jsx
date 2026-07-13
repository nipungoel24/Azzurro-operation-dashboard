import React, { useState } from 'react';
import { Icons } from './Icons';
import { getUrgencyLevel } from '../utils/urgency';

export default function SprintBoard({
  tasks,
  statuses,
  darkMode,
  filterProperty,
  openEditTaskModal,
  handleDeleteTask,
  handleCopyFollowUp,
  handleOpenReminderModal,
  setSelectedDetailsTask,
  handleStatusChange
}) {
  const [cardMenuTaskId, setCardMenuTaskId] = useState(null);

  // Drag and Drop Logic
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData("text/plain", taskId);
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId) {
      handleStatusChange(taskId, newStatus);
    }
  };

  // Filter tasks by location property
  const filteredPropertyTasks = tasks.filter(t => {
    if (filterProperty === 'All') return true;
    return t.property === filterProperty;
  });

  return (
    <div 
      className="flex h-full gap-6 overflow-x-auto pb-24 custom-scrollbar"
      onClick={() => setCardMenuTaskId(null)} // Close menu on outer clicks
    >
      {statuses.map(col => {
        const colTasks = filteredPropertyTasks.filter(t => t.status === col.id);
        return (
          <div 
            key={col.id} 
            className={`flex-shrink-0 w-80 flex flex-col ${col.colBg} rounded-2xl border ${col.colBorder} shadow-xs`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Header */}
            <div className={`p-4 border-b ${col.divider} flex justify-between items-center ${col.headerBg} rounded-t-2xl`}>
              <h3 className={`font-bold text-base tracking-tight font-serif-display ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{col.label}</h3>
              <span className={`text-[11px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${col.badgeBg} ${col.badgeText}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Cards container */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {colTasks.length === 0 && (
                <div className={`h-full flex items-center justify-center text-xs border-2 border-dashed rounded-xl py-12 ${darkMode ? 'border-slate-800/80 text-slate-600' : 'border-slate-200/50 text-slate-400'}`}>
                  Drop here
                </div>
              )}
              {colTasks.map(task => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedDetailsTask(task)}
                  className={`${col.cardBg} p-4 pl-5 rounded-xl shadow-xs border-y border-r border-l-4 cursor-pointer hover:shadow-md transition-all relative overflow-hidden`}
                  style={{ borderLeftColor: col.brandColor }}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`font-bold ${col.titleText} text-[14px] leading-snug mb-1`}>{task.title}</h4>
                    
                    {/* Glass Options Dropdown */}
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setCardMenuTaskId(cardMenuTaskId === task.id ? null : task.id);
                        }}
                        className={`transition-colors text-xs font-extrabold cursor-pointer px-1.5 py-0.5 rounded ${darkMode ? 'text-slate-600 hover:text-slate-400 hover:bg-slate-850/50' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100/50'}`}
                      >
                        •••
                      </button>
                      {cardMenuTaskId === task.id && (
                        <div className={`absolute right-0 top-6 w-32 backdrop-blur-lg rounded-lg shadow-lg border z-40 py-1 text-left animate-fade-in ${darkMode ? 'bg-[#15181e]/90 border-slate-800' : 'bg-white/90 border-white/60'}`}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditTaskModal(task);
                              setCardMenuTaskId(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50/50'}`}
                          >
                            <span className="material-symbols-outlined text-[16px] text-slate-500">edit</span>
                            Edit Task
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyFollowUp(task);
                              setCardMenuTaskId(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50/50'}`}
                          >
                            <Icons.MessageCircle />
                            Follow Up
                          </button>
                          <div className={`border-t my-1 ${darkMode ? 'border-slate-800' : 'border-slate-100/60'}`} />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                              setCardMenuTaskId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs text-red-650 hover:bg-red-50/55 transition-colors cursor-pointer flex items-center gap-1.5 font-semibold"
                          >
                            <Icons.Trash />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className={`${col.descText} text-[12px] line-clamp-3 leading-normal mt-1`}>{task.description}</p>
                  
                  {/* Smart Proximity / Urgency Indicator Bar */}
                  {(() => {
                    const urgency = getUrgencyLevel(task.dueDate, task.status);
                    return (
                      <div className="flex items-center gap-2 my-3" title={`Urgency: ${urgency.label}`}>
                        <div className="flex gap-1">
                          <span className={`h-1.5 w-6 rounded-full transition-all duration-300 ${urgency.colors[0]}`}></span>
                          <span className={`h-1.5 w-10 rounded-full transition-all duration-300 ${urgency.colors[1]}`}></span>
                          <span className={`h-1.5 w-4 rounded-full transition-all duration-300 ${urgency.colors[2]}`}></span>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          urgency.level === 3 ? 'text-[#c97f67] font-extrabold' :
                          urgency.level === 2 ? 'text-[#c49c5e] font-bold' :
                          urgency.level === 4 ? 'text-[#868e65] font-bold' : 'text-[#8ba69b] font-medium'
                        }`}>
                          {urgency.label}
                        </span>
                      </div>
                    );
                  })()}

                  <div className="flex flex-col gap-2 mt-auto">
                    <div className={`flex justify-between items-center border-t pt-2.5 mt-1 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-505 font-semibold mt-0.5">{task.dueDate}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReminderModal(task);
                          }}
                          className={`p-1 rounded-full hover:bg-slate-100/50 transition-colors cursor-pointer ${task.reminderActive ? 'text-amber-500' : 'text-slate-400'}`}
                          title="Set Reminder"
                        >
                          {task.reminderActive ? <Icons.BellSolid /> : <Icons.Bell />}
                        </button>
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Are you sure you want to delete this task?")) {
                              handleDeleteTask(task.id);
                            }
                          }}
                          className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50/50 dark:hover:bg-red-950/20 transition-all cursor-pointer"
                          title="Delete Task"
                        >
                          <Icons.Trash className="text-[16px]" />
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
