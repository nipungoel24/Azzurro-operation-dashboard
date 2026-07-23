'use client';

import React, { useState, useEffect } from 'react';

export default function BathroomInventory({ darkMode }) {
  const [bathrooms, setBathrooms] = useState([]);
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
        const r = await fetch(`/api/bathrooms?${params}`);
        const data = await r.json();
        if (!ignore && Array.isArray(data)) setBathrooms(data);
      } catch {
        // ignore
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, [filterProp]);

  const typeLabel = (type) => {
    const map = {
      ensuite: 'Ensuite',
      detached_private: 'Detached Private',
      shared_full_bathroom: 'Shared Full',
      shared_toilet: 'Shared Toilet',
      shared_shower: 'Shared Shower',
      combined_shower_toilet: 'Combined Shower+Toilet',
      multi_fixture_shared_bathroom: 'Multi-Fixture Shared',
      owner_occupied: 'Owner Occupied',
      unknown: 'Unknown',
    };
    return map[type] || type || 'Bathroom';
  };

  const typeColor = (type) => {
    if (!type) return darkMode ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-100 text-slate-600';
    if (type.startsWith('shared')) return darkMode ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-100 text-slate-600';
    if (type === 'ensuite') return darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600';
    if (type === 'detached_private') return darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600';
    if (type === 'owner_occupied') return darkMode ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-50 text-violet-600';
    if (type === 'combined_shower_toilet') return darkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600';
    return darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600';
  };

  return (
    <div className="space-y-6">
      <section className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl md:p-6 ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
        <h3 className="text-2xl font-black font-serif-display tracking-tight text-slate-900 dark:text-slate-100">Bathroom Inventory</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All bathrooms and shared facilities across properties.</p>

        <select value={filterProp} onChange={e => setFilterProp(e.target.value)} className={`mt-4 rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
          <option value="">All Properties</option>
          {PROP_CODES.filter(Boolean).map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </section>

      {loading ? <p className="text-center text-slate-400 py-8">Loading...</p> : (
        <section className="space-y-2">
          {bathrooms.map(b => (
            <article key={b.id} className={`rounded-xl border p-3 flex items-start justify-between ${b.ownerOccupied ? (darkMode ? 'border-violet-500/20 bg-violet-500/5' : 'border-violet-200 bg-violet-50') : (darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70')}`}>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">{b.name}</h4>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${typeColor(b.bathroomType)}`}>{typeLabel(b.bathroomType)}</span>
                  {b.verificationStatus === 'needs_review' && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-rose-500/10 text-rose-400">Needs Review</span>}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {b.propertyCode && <span>{b.propertyCode} · </span>}
                  {b.floor && <span>{b.floor} · </span>}
                  {b.locationDescription && <span>{b.locationDescription} · </span>}
                  {b.showerCount && <span>{b.showerCount} showers · </span>}
                  {b.toiletCount && <span>{b.toiletCount} toilets · </span>}
                </div>
                {(b.maintenanceNotes || b.notes) && (
                  <p className={`text-[10px] mt-1 ${darkMode ? 'text-amber-400/70' : 'text-amber-600'}`}>{b.maintenanceNotes || b.notes}</p>
                )}
              </div>
              {b.assignedRoomId && (
                <span className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold whitespace-nowrap">Room {b.assignedRoomId}</span>
              )}
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
