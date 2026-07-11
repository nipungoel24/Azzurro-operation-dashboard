import React from 'react';
import { Icons } from './Icons';

export default function LiveStatusHUD({
  occupancyData,
  loading,
  error,
  darkMode,
  openMaintenanceTaskModal
}) {
  if (!occupancyData || !occupancyData.properties) return null;

  const getOccupancyColor = (occ) => {
    if (occ < 75) return darkMode ? 'text-green-400' : 'text-green-700';
    if (occ <= 90) return darkMode ? 'text-amber-400' : 'text-amber-700';
    return darkMode ? 'text-red-400' : 'text-red-700';
  };

  const getOccupancyBg = (occ) => {
    if (occ < 75) return darkMode ? 'bg-green-950/20 border-green-800/30' : 'bg-green-50 border-green-100';
    if (occ <= 90) return darkMode ? 'bg-amber-950/20 border-amber-800/30' : 'bg-amber-50 border-amber-100';
    return darkMode ? 'bg-red-950/20 border-red-800/30' : 'bg-red-50 border-red-100';
  };

  return (
    <div className="space-y-3.5">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className={`text-[11px] font-extrabold uppercase tracking-widest ${darkMode ? 'text-slate-300' : 'text-[#5c5446]'}`}>
            Live Status HUD
          </span>
          {loading && <span className="text-[10px] text-slate-400 italic animate-pulse">Syncing...</span>}
        </div>
        
        {/* Fleet statistics header info */}
        <div className="flex gap-4 text-xs font-semibold text-slate-400">
          <span>Fleet Avg: <span className={darkMode ? 'text-slate-200' : 'text-slate-800'}>{occupancyData.avgOccupancy}%</span></span>
          <span>Beds Left: <span className={darkMode ? 'text-slate-200' : 'text-slate-800'}>{occupancyData.totalBedsLeft}</span></span>
        </div>
      </div>

      {/* Grid of Property Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {occupancyData.properties.map((prop) => {
          const blockedRooms = Math.max(0, prop.bedsLeft - prop.bedsVacant);
          return (
            <div 
              key={prop.id}
              className={`backdrop-blur-md rounded-xl p-4 border shadow-xs flex flex-col justify-between transition-all ${getOccupancyBg(prop.occupancy)}`}
            >
              <div>
                <div className="flex justify-between items-start gap-1">
                  <h4 className={`font-bold text-[14px] truncate leading-tight ${darkMode ? 'text-slate-100' : 'text-slate-800'}`} title={prop.name}>
                    {prop.name}
                  </h4>
                  {prop.apiSuspect && (
                    <span 
                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-red-650 text-white animate-pulse shrink-0"
                      title="API Outage: occupancy metric may be suspect"
                    >
                      API ALERT
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-baseline mt-2.5">
                  <span className={`text-2xl font-extrabold font-serif-display ${getOccupancyColor(prop.occupancy)}`}>
                    {prop.occupancy.toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Occupancy</span>
                </div>

                {/* Progress bar visual indicator */}
                <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200/60'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      prop.occupancy < 75 ? 'bg-emerald-500' :
                      prop.occupancy <= 90 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(prop.occupancy, 100)}%` }}
                  />
                </div>
              </div>

              {/* Vacant vs Left details */}
              <div className="mt-4 pt-3 border-t border-slate-500/10 flex flex-col gap-2">
                <div className="flex justify-between items-center text-[11px] font-medium text-slate-400">
                  <span>Vacant: <strong className={darkMode ? 'text-slate-200' : 'text-slate-700'}>{prop.bedsVacant}</strong></span>
                  <span>Left: <strong className={darkMode ? 'text-slate-200' : 'text-slate-700'}>{prop.bedsLeft}</strong></span>
                </div>

                {/* Maintenance checks logic */}
                {blockedRooms > 0 && (
                  <div className="flex items-center justify-between p-1.5 mt-1 rounded bg-red-600/10 border border-red-500/15 animate-pulse">
                    <span className="text-[9px] font-extrabold text-red-600 uppercase tracking-wide">
                      Blocked: {blockedRooms}
                    </span>
                    <button
                      onClick={() => openMaintenanceTaskModal(prop.name)}
                      className="p-1 rounded bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-colors flex items-center justify-center"
                      title="File Blocked Room Maintenance Check"
                    >
                      <Icons.Wrench className="text-[14px]" />
                    </button>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
