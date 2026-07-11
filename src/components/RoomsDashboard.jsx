import React from 'react';
import { Icons } from './Icons';

export default function RoomsDashboard({ occupancyData, loading, error, darkMode }) {
  if (loading && !occupancyData) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-24 space-y-4">
        <span className="animate-spin text-slate-400 text-3xl font-bold">↻</span>
        <p className="text-sm text-slate-400 italic">Syncing live property occupancy feeds...</p>
      </div>
    );
  }

  if (!occupancyData) return null;

  const s = occupancyData.summary || {};
  const deltas = occupancyData.deltas || {};

  return (
    <div className="flex flex-col h-full space-y-8 pb-24">
      {/* 1. Dynamic Fleet KPI Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className={`backdrop-blur-md p-5 rounded-2xl border shadow-xs ${darkMode ? 'bg-[#15181e]/60 border-slate-800' : 'bg-white/60 border-slate-200/60'}`}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Fleet Occupancy</span>
          <h3 className="text-3xl font-black font-serif-display text-emerald-500 mt-2">{occupancyData.avgOccupancy}%</h3>
          {deltas.avgOccupancy !== undefined && (
            <p className="text-[11px] text-slate-400 mt-2">
              {deltas.avgOccupancy >= 0 ? '📈' : '📉'} {deltas.avgOccupancy >= 0 ? '+' : ''}{deltas.avgOccupancy}% vs last hour
            </p>
          )}
        </div>

        <div className={`backdrop-blur-md p-5 rounded-2xl border shadow-xs ${darkMode ? 'bg-[#15181e]/60 border-slate-800' : 'bg-white/60 border-slate-200/60'}`}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Today's Bookings</span>
          <h3 className="text-3xl font-black font-serif-display text-blue-500 mt-2">{s.totalReservations || 0}</h3>
          <p className="text-[11px] text-slate-400 mt-2">
            {s.totalBeds || 0} beds | {s.totalRooms || 0} private rooms
          </p>
        </div>

        <div className={`backdrop-blur-md p-5 rounded-2xl border shadow-xs ${darkMode ? 'bg-[#15181e]/60 border-slate-800' : 'bg-white/60 border-slate-200/60'}`}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Website Revenue</span>
          <h3 className="text-3xl font-black font-serif-display text-purple-500 mt-2">${(s.websiteRevenue || 0).toFixed(2)}</h3>
          {s.organic && (
            <p className="text-[11px] text-slate-400 mt-2">
              {s.organic.count || 0} organic | {s.extensions?.count || 0} extensions
            </p>
          )}
        </div>

        <div className={`backdrop-blur-md p-5 rounded-2xl border shadow-xs ${darkMode ? 'bg-[#15181e]/60 border-slate-800' : 'bg-white/60 border-slate-200/60'}`}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Beds Left</span>
          <h3 className="text-3xl font-black font-serif-display text-orange-500 mt-2">{occupancyData.totalBedsLeft}</h3>
          <p className="text-[11px] text-slate-400 mt-2">Active bed inventory vacancy</p>
        </div>
      </div>

      {/* 2. Detailed Property Breakdown List */}
      <div className="space-y-4">
        <h3 className={`text-[12px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Property Inventory Details</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {occupancyData.properties.map((prop) => (
            <div 
              key={prop.id}
              className={`backdrop-blur-md p-6 rounded-2xl border shadow-xs flex flex-col justify-between gap-6 ${darkMode ? 'bg-[#15181e]/40 border-slate-800' : 'bg-white/40 border-slate-200/50'}`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-lg font-bold font-serif-display leading-tight">{prop.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">Capacity: {prop.capacity} beds · ID: {prop.id}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                  prop.occupancy < 75 ? (darkMode ? 'bg-green-950/30 text-green-400' : 'bg-green-50 text-green-700') :
                  prop.occupancy <= 90 ? (darkMode ? 'bg-amber-950/30 text-amber-400' : 'bg-amber-50 text-amber-700') :
                  (darkMode ? 'bg-red-950/30 text-red-400' : 'bg-red-50 text-red-700')
                }`}>
                  {prop.occupancy.toFixed(1)}% Occupied
                </span>
              </div>

              {/* Progress gauge bar */}
              <div className={`w-full h-2 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-slate-200/50'}`}>
                <div 
                  className={`h-full rounded-full ${
                    prop.occupancy < 75 ? 'bg-emerald-500' :
                    prop.occupancy <= 90 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(prop.occupancy, 100)}%` }}
                />
              </div>

              {/* Specs & Room Availability breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border flex flex-col justify-center ${darkMode ? 'bg-slate-800/25 border-slate-800/80' : 'bg-slate-50/50 border-slate-200/40'}`}>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Sellable Beds Left</span>
                  <span className="text-2xl font-black font-serif-display text-slate-800 dark:text-slate-100 mt-1">
                    {prop.bedsLeft}
                  </span>
                </div>
                <div className={`p-4 rounded-xl border flex flex-col justify-center ${darkMode ? 'bg-slate-800/25 border-slate-800/80' : 'bg-slate-50/50 border-slate-200/40'}`}>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Vacant Beds</span>
                  <span className="text-2xl font-black font-serif-display text-emerald-500 mt-1">
                    {prop.bedsVacant}
                  </span>
                </div>
              </div>

              {/* Room availability detailed types */}
              {prop.availableRoomTypes && Object.keys(prop.availableRoomTypes).length > 0 && (
                <div className={`p-4 rounded-xl border text-xs ${darkMode ? 'bg-slate-800/10 border-slate-800/60' : 'bg-slate-50/20 border-slate-100'}`}>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-2">Available Categories</span>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
                    {Object.entries(prop.availableRoomTypes).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center text-slate-400">
                        <span className="truncate pr-2">{type}</span>
                        <strong className={darkMode ? 'text-slate-200' : 'text-slate-700'}>{count} left</strong>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Booking Channels source counts breakdown */}
      {s.sources && s.sources.length > 0 && (
        <div className="space-y-4">
          <h3 className={`text-[12px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Booking Sources Breakdown</h3>
          <div className={`backdrop-blur-md rounded-xl overflow-hidden border shadow-xs ${darkMode ? 'bg-[#15181e]/60 border-slate-800' : 'bg-white/60 border-slate-200/60'}`}>
            <table className="w-full text-sm text-left">
              <thead className={`text-[11px] uppercase font-bold tracking-wider ${darkMode ? 'text-slate-400 bg-slate-900/40 border-b border-slate-800' : 'text-slate-650 bg-slate-100 border-b border-slate-200'}`}>
                <tr>
                  <th className="px-6 py-4">Source Channel</th>
                  <th className="px-6 py-4">Reservation Count</th>
                  <th className="px-6 py-4">Beds Booked</th>
                  <th className="px-6 py-4">Private Rooms Booked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-500/10">
                {s.sources.map((src) => (
                  <tr key={src.name} className={`hover:bg-slate-500/5 transition-colors ${darkMode ? 'text-slate-300' : 'text-slate-750'}`}>
                    <td className="px-6 py-4 font-bold">{src.name}</td>
                    <td className="px-6 py-4">{src.count}</td>
                    <td className="px-6 py-4">{src.beds}</td>
                    <td className="px-6 py-4">{src.rooms}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
