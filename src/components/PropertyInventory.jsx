'use client';

import React, { useState, useEffect } from 'react';

export default function PropertyInventory({ darkMode }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/inventory')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProperties(data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusColor = (status) => {
    const map = {
      verified: darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
      imported_unverified: darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600',
      needs_review: darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600',
      conflicting_data: darkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600',
      needs_verification: darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600',
    };
    return map[status] || (darkMode ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-100 text-slate-600');
  };

  if (loading) return <p className="text-center text-slate-400 py-8">Loading inventory...</p>;

  return (
    <div className="space-y-6">
      <section className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl md:p-6 ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
        <h3 className="text-2xl font-black font-serif-display tracking-tight text-slate-900 dark:text-slate-100">Property Inventory</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Overview of all properties with room, bed, and bathroom counts.</p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {properties.map(p => (
          <article key={p.id} className={`rounded-2xl border p-5 shadow-sm ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">{p.name}</h4>
                {p.address && <p className="text-[10px] text-slate-400 mt-0.5">{p.address}</p>}
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor(p.verificationStatus)}`}>
                {p.verificationStatus.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className={`rounded-xl p-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <p className="text-lg font-black font-serif-display text-slate-900 dark:text-slate-100">{p.computedRooms}</p>
                <p className="text-[9px] font-bold uppercase text-slate-400">Rooms{p.declaredRooms && p.computedRooms !== p.declaredRooms ? ` (${p.declaredRooms})` : ''}</p>
              </div>
              <div className={`rounded-xl p-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <p className="text-lg font-black font-serif-display text-slate-900 dark:text-slate-100">{p.computedBeds || '-'}</p>
                <p className="text-[9px] font-bold uppercase text-slate-400">Beds{p.declaredBeds && p.computedBeds !== p.declaredBeds ? ` (${p.declaredBeds})` : ''}</p>
              </div>
              <div className={`rounded-xl p-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <p className="text-lg font-black font-serif-display text-slate-900 dark:text-slate-100">{p.computedBathrooms || '-'}</p>
                <p className="text-[9px] font-bold uppercase text-slate-400">Bathrooms{p.declaredBathrooms && p.computedBathrooms !== p.declaredBathrooms ? ` (${p.declaredBathrooms})` : ''}</p>
              </div>
            </div>

            {p.cloudbedsPropertyId && (
              <p className="text-[10px] text-slate-400 mt-3">Cloudbeds ID: {p.cloudbedsPropertyId} · Capacity: {p.capacity}</p>
            )}
            {p.notes && (
              <p className={`text-[10px] mt-2 ${darkMode ? 'text-amber-400/70' : 'text-amber-600'}`}>{p.notes}</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
