'use client';

import React, { useState, useEffect } from 'react';

export default function RoomInventory({ darkMode }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProp, setFilterProp] = useState('');

  const PROP_CODES = ['', 'CENTRAL_SYDNEY', 'POTTS_POINT', 'SURRY_HILLS', 'DARLING_HARBOUR', 'OLYMPIC', 'PYRMONT_BUDGET'];

  useEffect(() => {
    let ignore = false;
    async function load() {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterProp) params.set('propertyCode', filterProp);
      try {
        const r = await fetch(`/api/rooms?${params}`);
        const data = await r.json();
        if (!ignore && Array.isArray(data)) setRooms(data);
      } catch {
        // ignore
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [filterProp]);

  const bathBadge = (room) => {
    if (room.ownerOccupied) return { cls: 'bg-violet-500/10 text-violet-400', label: 'Owner' };
    if (room.isEnsuite) return { cls: 'bg-emerald-500/10 text-emerald-400', label: 'Ensuite' };
    if (room.isDetachedPrivate) return { cls: 'bg-blue-500/10 text-blue-400', label: 'Detached' };
    if (room.hasSharedBathroom) return { cls: 'bg-slate-500/10 text-slate-400', label: 'Shared' };
    return null;
  };

  return (
    <div className="space-y-6">
      <section className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl md:p-6 ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
        <h3 className="text-2xl font-black font-serif-display tracking-tight text-slate-900 dark:text-slate-100">Room Inventory</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All rooms across properties with bathroom arrangements.</p>

        <select value={filterProp} onChange={e => setFilterProp(e.target.value)} className={`mt-4 rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
          <option value="">All Properties</option>
          {PROP_CODES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </section>

      {loading ? <p className="text-center text-slate-400 py-8">Loading...</p> : (
        <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {rooms.map(r => {
            const badge = bathBadge(r);
            return (
              <div key={r.id} className={`rounded-xl border p-3 text-center ${r.ownerOccupied ? (darkMode ? 'border-violet-500/20 bg-violet-500/5' : 'border-violet-200 bg-violet-50') : r.cleaningRequired === false ? (darkMode ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-200 bg-amber-50') : (darkMode ? 'border-white/10 bg-slate-800/50' : 'border-slate-200 bg-white')}`}>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{r.roomNumber}</p>
                {r.bedCount && <p className="text-[10px] text-slate-400">{r.bedCount} {r.bedDescription || 'beds'}</p>}
                {r.floor && <p className="text-[10px] text-slate-400">{r.floor}</p>}
                {badge && <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold mt-1 inline-block ${badge.cls}`}>{badge.label}</span>}
                {r.verificationStatus === 'conflicting_data' && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold mt-1 ml-1 inline-block bg-rose-500/10 text-rose-400">!</span>}
                {r.fridge && <span className="material-symbols-outlined select-none text-[14px] text-blue-400 ml-1">kitchen</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
