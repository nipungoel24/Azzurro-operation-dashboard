import React from 'react';

export default function TaskDetailsModal({
  selectedDetailsTask,
  setSelectedDetailsTask,
  newUpdateText,
  setNewUpdateText,
  handleAddUpdate,
  handleDeleteTask,
  openEditTaskModal,
  darkMode,
  statuses
}) {
  if (!selectedDetailsTask) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs ${darkMode ? 'bg-black/45' : 'bg-black/20'}`}>
      <div className={`backdrop-blur-xl w-full max-w-lg rounded-2xl shadow-2xl p-6 border flex flex-col max-h-[85vh] animate-fade-in-up ${darkMode ? 'bg-[#1b1917]/95 border-slate-800 text-slate-200' : 'bg-[#fffdfb]/95 border-slate-200/60 text-slate-707'}`}>
        {/* Header */}
        <div className={`flex justify-between items-center border-b pb-4 mb-4 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <h3 className="font-extrabold text-lg font-serif-display text-slate-400 uppercase tracking-wider">
            Task Details
          </h3>
          <button 
            onClick={() => setSelectedDetailsTask(null)}
            className="text-slate-400 hover:text-slate-800 cursor-pointer flex items-center"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Task Info Area (Scrollable if description is very long) */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">
          <div>
            <h2 className="font-extrabold text-xl font-serif-display leading-tight">
              {selectedDetailsTask.title}
            </h2>
            <p className="text-xs text-slate-405 mt-1 font-bold">
              Status: <span className="capitalize">{selectedDetailsTask.status}</span> · Location: {selectedDetailsTask.property} · Assignee: {selectedDetailsTask.responsible}
            </p>
          </div>

          {/* Description box */}
          {selectedDetailsTask.description && (
            <div className={`p-4 rounded-xl border text-sm whitespace-pre-line leading-relaxed ${darkMode ? 'bg-[#292622]/90 border-slate-805 text-slate-300' : 'bg-[#faf8f4]/90 border-[#eee3cc]/60 text-[#5c5446]'}`}>
              {selectedDetailsTask.description}
            </div>
          )}

          {/* Updates Thread */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Updates
            </h4>
            
            <div className="space-y-3">
              {!selectedDetailsTask.updates || selectedDetailsTask.updates.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No progress updates logged yet.</p>
              ) : (
                selectedDetailsTask.updates.map((up) => {
                  const statusConfig = statuses.find(s => s.id === selectedDetailsTask.status) || statuses[0];
                  return (
                    <div 
                      key={up.id}
                      className={`p-3.5 rounded-lg border-y border-r border-l-4 leading-normal ${darkMode ? 'bg-[#292622]/40 border-slate-850' : 'bg-[#faf8f4]/50 border-slate-200/50'}`}
                      style={{ borderLeftColor: statusConfig.brandColor }}
                    >
                      <p className="text-[10px] font-bold text-slate-400 mb-1">
                        {up.timestamp} · {up.author}
                      </p>
                      <p className={`text-xs whitespace-pre-line leading-relaxed ${darkMode ? 'text-slate-200' : 'text-[#443e35]'}`}>
                        {up.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Add update input block */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-500/10">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Add update
            </label>
            <textarea 
              value={newUpdateText}
              onChange={(e) => setNewUpdateText(e.target.value)}
              placeholder="Write the latest progress update..."
              rows="3"
              className={`w-full border rounded-lg p-2.5 text-xs outline-none transition-colors resize-none ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-white border-slate-200 text-[#5c5446] focus:border-slate-450'}`}
            />
          </div>
        </div>

        {/* Buttons Row */}
        <div className="flex justify-between items-center mt-6 border-t pt-4 border-slate-500/10 flex-shrink-0">
          <button 
            onClick={() => {
              handleDeleteTask(selectedDetailsTask.id);
              setSelectedDetailsTask(null);
            }}
            className="px-4 py-2 bg-red-650 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            Delete
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={() => {
                openEditTaskModal(selectedDetailsTask);
                setSelectedDetailsTask(null);
              }}
              className={`px-4 py-2 border font-semibold text-xs rounded-lg transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-100'}`}
            >
              Edit
            </button>
            
            <button 
              onClick={handleAddUpdate}
              className={`px-4 py-2 font-semibold text-xs rounded-lg shadow-md transition-colors cursor-pointer border border-transparent ${darkMode ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
            >
              Add Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
