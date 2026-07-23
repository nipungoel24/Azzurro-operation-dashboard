'use client';

import React, { useState, useEffect } from 'react';

export default function ShiftHandoffPanel({ darkMode }) {
  const [handoffs, setHandoffs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    propertyName: '',
    shiftFrom: 'afternoon',
    shiftTo: 'night',
    notes: '',
    taskIds: '',
  });

  const SHIFTS = ['morning', 'afternoon', 'night', 'overnight'];
  const PROPERTIES = ['Potts Point', 'Surry Hills', 'Darling Harbour', 'Central Sydney', 'The Pyrmont Budget Hotel', 'Olympic Hotel'];

  const fetchHandoffs = async () => {
    try {
      const res = await fetch('/api/handoffs');
      const data = await res.json();
      if (Array.isArray(data)) setHandoffs(data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function load() {
      await fetchHandoffs();
    }
    load();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.propertyName || !form.notes.trim()) return;
    try {
      await fetch('/api/handoffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, taskIds: form.taskIds.split(',').map(s => s.trim()).filter(Boolean) }),
      });
      setShowForm(false);
      setForm({ propertyName: '', shiftFrom: 'afternoon', shiftTo: 'night', notes: '', taskIds: '' });
      fetchHandoffs();
    } catch (err) {
      console.error('Failed:', err);
    }
  };

  const handleAcknowledge = async (id) => {
    try {
      await fetch(`/api/handoffs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'acknowledge' }),
      });
      fetchHandoffs();
    } catch (err) {
      console.error('Failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      <section className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl md:p-6 ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="text-2xl font-black font-serif-display tracking-tight text-slate-900 dark:text-slate-100">
              Shift Handoffs
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Clear handoff notes between shifts for accountability.
            </p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-500">
            + New Handoff
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleCreate} className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400">Property</span>
              <select value={form.propertyName} onChange={e => setForm(f => ({ ...f, propertyName: e.target.value }))} required className={`rounded-xl px-3 py-2 text-sm border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`}>
                <option value="">Select</option>
                {PROPERTIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-400">From Shift</span>
                <select value={form.shiftFrom} onChange={e => setForm(f => ({ ...f, shiftFrom: e.target.value }))} className={`rounded-xl px-3 py-2 text-sm border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`}>
                  {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-bold text-slate-400">To Shift</span>
                <select value={form.shiftTo} onChange={e => setForm(f => ({ ...f, shiftTo: e.target.value }))} className={`rounded-xl px-3 py-2 text-sm border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`}>
                  {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
            </div>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-xs font-bold text-slate-400">Notes</span>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} required rows={3} placeholder="What needs to be done, what was completed, what needs follow-up..." className={`rounded-xl px-3 py-2 text-sm border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`} />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-xs font-bold text-slate-400">Task IDs (comma-separated)</span>
              <input value={form.taskIds} onChange={e => setForm(f => ({ ...f, taskIds: e.target.value }))} placeholder="id1, id2, id3" className={`rounded-xl px-3 py-2 text-sm border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`} />
            </label>
            <div className="flex gap-3 md:col-span-2">
              <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-500">Create Handoff</button>
              <button type="button" onClick={() => setShowForm(false)} className={`rounded-xl px-5 py-2 text-sm font-bold border ${darkMode ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-600'}`}>Cancel</button>
            </div>
          </form>
        )}
      </section>

      {loading ? (
        <p className="text-center text-slate-400 py-8">Loading...</p>
      ) : (
        <section className="space-y-3">
          {handoffs.map(h => (
            <article key={h.id} className={`rounded-2xl border p-4 shadow-sm ${h.acknowledged ? (darkMode ? 'border-emerald-500/20 bg-[#1a1d23]/75' : 'border-emerald-200 bg-white/70') : (darkMode ? 'border-amber-500/20 bg-[#1a1d23]/75' : 'border-amber-200 bg-white/70')}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${h.acknowledged ? (darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600') : (darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600')}`}>
                      {h.acknowledged ? 'Acknowledged' : 'Unacknowledged'}
                    </span>
                    <span className="text-xs text-slate-400">
                      {h.shiftFrom} → {h.shiftTo}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 mt-1">{h.propertyName}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{h.notes}</p>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Prepared by {h.preparedByName || h.preparedBy} · {new Date(h.createdAt).toLocaleString()}
                    {h.acknowledgedAt && ` · Acknowledged ${new Date(h.acknowledgedAt).toLocaleString()}`}
                  </p>
                  {h.taskIds && h.taskIds.length > 0 && (
                    <p className="text-[10px] text-slate-400 mt-1">Tasks: {h.taskIds.join(', ')}</p>
                  )}
                </div>
                {!h.acknowledged && (
                  <button onClick={() => handleAcknowledge(h.id)} className="rounded-xl bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-500 hover:bg-emerald-500/20">
                    Acknowledge
                  </button>
                )}
              </div>
            </article>
          ))}
          {handoffs.length === 0 && <p className="text-center text-slate-400 py-8">No handoffs yet.</p>}
        </section>
      )}
    </div>
  );
}
