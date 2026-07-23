'use client';

import React, { useState, useEffect } from 'react';

export default function EmptyRoomsLive({ darkMode }) {
  const [roomsData, setRoomsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [filterProperty, setFilterProperty] = useState('All');
  const [lastSync, setLastSync] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const fetchEmptyRooms = async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = force ? '/api/empty-rooms?refresh=true' : '/api/empty-rooms';
      const res = await fetch(url);
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      const data = await res.json();
      setRoomsData(data);
      setLastFetchTime(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      const res = await fetch('/api/empty-rooms/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setLastSync(new Date());
        fetchEmptyRooms(true);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleGenerateTasks = async (propertyName, taskCategory = 'overnight_maintenance') => {
    const label = taskCategory === 'cockroach_spraying' ? 'overnight pest control' : 'overnight room check';
    if (!confirm(`Create ${label} tasks for all empty rooms at ${propertyName}?`)) return;
    setSyncing(true);
    try {
      const res = await fetch('/api/empty-rooms/generate-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyName, taskCategory, shift: 'overnight' }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Created ${data.count} task(s) for ${propertyName}.`);
        fetchEmptyRooms(true);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    async function load() {
      await fetchEmptyRooms();
    }
    load();
  }, []);

  const filteredData = !roomsData ? [] : filterProperty === 'All'
    ? roomsData
    : roomsData.filter(p => p.propertyName === filterProperty);

  const properties = !roomsData ? [] : roomsData.map(p => p.propertyName);

  return (
    <div className="space-y-6">
      <section className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl md:p-6 ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="text-2xl font-black font-serif-display tracking-tight text-slate-900 dark:text-slate-100">
              Empty Rooms — Live
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Real-time empty room data from Cloudbeds. Source of truth for occupancy.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastFetchTime && <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Loaded: {lastFetchTime.toLocaleTimeString()}</span>}
            {lastSync && <span className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Synced: {lastSync.toLocaleTimeString()}</span>}
            <button onClick={handleSync} disabled={syncing} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50">
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
        </div>

        <div className="mt-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">Property Filter</span>
          <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
            <button onClick={() => setFilterProperty('All')} className={`whitespace-nowrap rounded-xl px-4 py-2 text-[13px] font-semibold transition-all ${filterProperty === 'All' ? (darkMode ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-white') : (darkMode ? 'bg-slate-800/70 text-slate-300' : 'bg-slate-100/85 text-slate-600')}`}>
              All
            </button>
            {properties.map(prop => (
              <button key={prop} onClick={() => setFilterProperty(prop)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-[13px] font-semibold transition-all ${filterProperty === prop ? (darkMode ? 'bg-slate-100 text-slate-900' : 'bg-slate-900 text-white') : (darkMode ? 'bg-slate-800/70 text-slate-300' : 'bg-slate-100/85 text-slate-600')}`}>
                {prop}
              </button>
            ))}
          </div>
        </div>
      </section>

      {error && (
        <div className={`rounded-2xl border p-4 ${darkMode ? 'border-rose-500/30 bg-rose-500/10 text-rose-400' : 'border-rose-200 bg-rose-50 text-rose-600'}`}>
          <p className="text-sm font-semibold">Sync Error</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {loading && !roomsData ? (
        <p className="text-center text-slate-400 py-8">Loading empty rooms...</p>
      ) : (
        <div className="space-y-8">
          {filteredData.map(prop => (
            <section key={prop.propertyId} className={`rounded-[28px] border p-5 md:p-6 shadow-sm ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{prop.propertyName}</h4>
                  <div className="flex gap-4 text-xs text-slate-400 mt-1">
                    <span>Capacity: {prop.capacity}</span>
                    <span>Occupied: {prop.occupiedBeds}</span>
                    <span>Available: {prop.bedsLeft}</span>
                    <span>Occupancy: {prop.occupancy?.toFixed(1)}%</span>
                  </div>
                </div>
                {(prop.apiSuspect || prop.roomsSuspect || prop.authFailed) && (
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${prop.authFailed ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-500'}`}>
                      {prop.authFailed ? 'Auth Failed' : 'Data Suspect'}
                    </span>
                    {prop.fetchError && (
                      <span className={`text-[9px] px-2 py-0.5 rounded-full ${darkMode ? 'bg-red-500/5 text-red-400/70' : 'bg-red-50 text-red-500'}`} title={prop.fetchError}>
                        {prop.fetchError.length > 60 ? prop.fetchError.slice(0, 60) + '...' : prop.fetchError}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {prop.emptyRooms && prop.emptyRooms.length > 0 ? (
                <div>
                  <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 mb-3">
                    {prop.emptyRooms.map((room, i) => (
                      <div key={i} className={`rounded-xl border p-3 text-center ${darkMode ? 'border-white/10 bg-emerald-500/5' : 'border-emerald-200 bg-emerald-50'}`}>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{room.roomName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{room.roomTypeName}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleGenerateTasks(prop.propertyName, 'cockroach_spraying')} className="rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-500 hover:bg-amber-500/20" disabled={syncing}>
                      Overnight Pest Control
                    </button>
                    <button onClick={() => handleGenerateTasks(prop.propertyName, 'overnight_maintenance')} className="rounded-xl bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20" disabled={syncing}>
                      Overnight Room Check
                    </button>
                  </div>
                </div>
              ) : prop.roomSummary ? (
                <div>
                  <div className={`rounded-xl border p-4 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{prop.roomSummary}</p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleGenerateTasks(prop.propertyName, 'cockroach_spraying')} className="rounded-xl bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-500 hover:bg-amber-500/20" disabled={syncing}>
                      Overnight Pest Control
                    </button>
                    <button onClick={() => handleGenerateTasks(prop.propertyName, 'overnight_maintenance')} className="rounded-xl bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-400 hover:bg-indigo-500/20" disabled={syncing}>
                      Overnight Room Check
                    </button>
                  </div>
                </div>
              ) : (
                <p className={`text-sm text-center py-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  {prop.authFailed ? 'Cloudbeds authentication failed for this property. Set API keys in environment variables.' :
                   prop.fetchError ? `${prop.fetchError}` :
                   prop.apiSuspect ? 'Unable to determine empty rooms — API data suspect. Try Sync Now.' :
                   'No empty rooms reported.'}
                </p>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
