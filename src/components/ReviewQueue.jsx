'use client';

import React, { useState, useEffect } from 'react';

export default function ReviewQueue({ darkMode }) {
  const [properties, setProperties] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/inventory').then(r => r.json()),
      fetch('/api/rooms?verificationStatus=conflicting_data').then(r => r.json()),
      fetch('/api/bathrooms?verificationStatus=needs_review').then(r => r.json()),
    ]).then(([props, conflictRooms, reviewBaths]) => {
      if (Array.isArray(props)) setProperties(props);
      const items = [];

      if (Array.isArray(conflictRooms)) {
        conflictRooms.forEach(r => {
          items.push({ type: 'room', propertyCode: r.propertyCode, roomNumber: r.roomNumber, issue: r.operationalNotes || r.verificationStatus, entityId: r.id });
        });
      }

      if (Array.isArray(reviewBaths)) {
        reviewBaths.forEach(b => {
          items.push({ type: 'bathroom', propertyCode: b.propertyCode, name: b.name, issue: b.maintenanceNotes || b.notes || b.verificationStatus, entityId: b.id });
        });
      }

      props.forEach(p => {
        if (p.notes && p.verificationStatus === 'conflicting_data') {
          items.push({ type: 'property', propertyCode: p.code, name: p.name, issue: p.notes, entityId: p.id });
        }
        if (p.computedRooms !== p.declaredRooms && p.declaredRooms) {
          items.push({ type: 'property', propertyCode: p.code, name: p.name, issue: `Room count mismatch: ${p.computedRooms} imported vs ${p.declaredRooms} declared`, entityId: p.id });
        }
        if (p.computedBeds !== p.declaredBeds && p.declaredBeds) {
          items.push({ type: 'property', propertyCode: p.code, name: p.name, issue: `Bed count mismatch: ${p.computedBeds} imported vs ${p.declaredBeds} declared`, entityId: p.id });
        }
        if (p.computedBathrooms !== p.declaredBathrooms && p.declaredBathrooms) {
          items.push({ type: 'property', propertyCode: p.code, name: p.name, issue: `Bathroom count mismatch: ${p.computedBathrooms} imported vs ${p.declaredBathrooms} declared`, entityId: p.id });
        }
      });

      setConflicts(items);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <section className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl md:p-6 ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined select-none text-2xl leading-none">warning</span>
          <div>
            <h3 className="text-2xl font-black font-serif-display tracking-tight text-slate-900 dark:text-slate-100">Review Queue</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {conflicts.length} items need attention. Declared counts vs imported records, conflicting data, and unverified assignments.
            </p>
          </div>
        </div>
      </section>

      {loading ? <p className="text-center text-slate-400 py-8">Loading...</p> : (
        <section className="space-y-3">
          {conflicts.map((item, i) => (
            <article key={i} className={`rounded-xl border p-4 ${item.type === 'property' ? (darkMode ? 'border-amber-500/20 bg-amber-500/5' : 'border-amber-200 bg-amber-50') : item.type === 'room' ? (darkMode ? 'border-rose-500/20 bg-rose-500/5' : 'border-rose-200 bg-rose-50') : (darkMode ? 'border-blue-500/20 bg-blue-500/5' : 'border-blue-200 bg-blue-50')}`}>
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined select-none text-lg leading-none mt-0.5">
                  {item.type === 'property' ? 'apartment' : item.type === 'room' ? 'door_front' : 'shower'}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{item.type}</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{item.propertyCode}</span>
                    {item.roomNumber && <span className="text-xs text-slate-400">Room {item.roomNumber}</span>}
                    {item.name && <span className="text-xs text-slate-400">{item.name}</span>}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">{item.issue}</p>
                </div>
              </div>
            </article>
          ))}
          {conflicts.length === 0 && (
            <div className={`rounded-[28px] border border-dashed p-10 text-center ${darkMode ? 'border-slate-800 bg-[#15181d]/65' : 'border-slate-200 bg-white/65'}`}>
              <p className="text-slate-400">No items requiring review — everything is consistent.</p>
            </div>
          )}
        </section>
      )}

      {!loading && (
        <section className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl md:p-6 ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3">Manual Follow-Up Checklist</h4>
          <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>• <strong>Central Sydney:</strong> Missing 12th room? Confirm 11 or 12 rooms total. Confirm 6 vs 7 bathrooms.</p>
            <p>• <strong>Potts Point:</strong> Confirm 5 vs 6 bathroom facilities.</p>
            <p>• <strong>Surry Hills:</strong> Confirm private bathroom count (11 declared vs 9 ensuite + 5 shared). Room 18: private or shared bathroom? Room 14: bed description mismatch (1 Double vs 4 beds).</p>
            <p>• <strong>Darling Harbour:</strong> Room 6 (14-bed connected room): count as 1 room or 2?</p>
            <p>• <strong>Olympic:</strong> Room 26 on 2nd floor assigned to Bathroom A1 on 1st floor. Bathroom F1 unassigned. Bathroom E1 — follow up Lisa on code.</p>
            <p>• <strong>Pyrmont Budget:</strong> 14 rooms × 2 beds = 28 total vs 18 declared. 11 ensuite rooms vs 12 private bathrooms declared.</p>
          </div>
        </section>
      )}
    </div>
  );
}
