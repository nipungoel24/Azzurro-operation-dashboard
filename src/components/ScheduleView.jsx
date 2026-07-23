'use client';

import React, { useState, useEffect, useCallback } from 'react';

export default function ScheduleView({ darkMode }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProperty, setFilterProperty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [generating, setGenerating] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const CATEGORIES = [
    { value: '', label: 'All Categories' },
    { value: 'bathroom_deep_clean', label: 'Bathroom Deep Clean' },
    { value: 'vent_cleaning', label: 'Vent Cleaning' },
    { value: 'general_cleaning', label: 'General Cleaning' },
    { value: 'night_shift', label: 'Night Shift' },
    { value: 'cockroach_spraying', label: 'Cockroach Spraying' },
    { value: 'ac_check', label: 'AC Check' },
    { value: 'hardware_check', label: 'Hardware Check' },
    { value: 'supplies', label: 'Supplies' },
    { value: 'bed_frame_check', label: 'Bed Frame Check' },
    { value: 'curtain_rod_check', label: 'Curtain Rod Check' },
    { value: 'other', label: 'Other' },
  ];

  const STATUSES = [
    { value: '', label: 'All Statuses' },
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'incomplete', label: 'Incomplete' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'overdue', label: 'Overdue' },
  ];

  const PROPERTIES = ['', 'Potts Point', 'Surry Hills', 'Darling Harbour', 'Central Sydney', 'The Pyrmont Budget Hotel', 'Olympic Hotel'];
  const PROP_CODES = { 'Potts Point': 'POTTS_POINT', 'Surry Hills': 'SURRY_HILLS', 'Darling Harbour': 'DARLING_HARBOUR', 'Central Sydney': 'CENTRAL_SYDNEY', 'The Pyrmont Budget Hotel': 'PYRMONT_BUDGET', 'Olympic Hotel': 'OLYMPIC' };

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterProperty) params.set('propertyName', filterProperty);
      if (filterStatus) params.set('status', filterStatus);
      if (filterCategory) params.set('category', filterCategory);
      params.set('limit', '200');
      const res = await fetch(`/api/scheduled-tasks?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    }
  }, [filterProperty, filterStatus, filterCategory]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      await fetchTasks();
      setLoading(false);
    }
    load();
  }, [fetchTasks]);

  const handleGenerate = async (mode) => {
    setGenerating(mode);
    try {
      const res = await fetch('/api/scheduled-tasks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          propertyCode: filterProperty ? PROP_CODES[filterProperty] || null : null,
          dateStr: new Date().toISOString().split('T')[0],
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Generated ${data.totalTasks} task(s)`);
        fetchTasks();
      } else {
        showToast(`Error: ${data.error || 'Failed'}`);
      }
    } catch (err) {
      showToast(`Failed: ${err.message}`);
    } finally {
      setGenerating(null);
    }
  };

  const handleCreateFollowUp = async (taskId) => {
    const hours = prompt('Follow-up shift hours?', '5');
    if (!hours) return;
    try {
      const res = await fetch('/api/scheduled-tasks/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId, shiftHours: parseInt(hours), assignedTo: 'Brema' }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Brema follow-up created: ${data.followUp.title}`);
        fetchTasks();
      } else {
        showToast(`Error: ${data.error || 'Failed'}`);
      }
    } catch (err) {
      showToast(`Failed: ${err.message}`);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await fetch(`/api/scheduled-tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed to update:', err);
    }
  };

  const handleComplete = async (id) => {
    try {
      await fetch(`/api/scheduled-tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete', completionNotes: '' }),
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed:', err);
    }
  };

  const handleIncomplete = async (id) => {
    const reason = prompt('Why is this task incomplete?');
    if (!reason) return;
    try {
      await fetch(`/api/scheduled-tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'incomplete', reason }),
      });
      fetchTasks();
    } catch (err) {
      console.error('Failed:', err);
    }
  };

  const statusColor = (status) => {
    const map = {
      scheduled: darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600',
      in_progress: darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600',
      completed: darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600',
      incomplete: darkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600',
      cancelled: darkMode ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-100 text-slate-600',
      overdue: darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600',
    };
    return map[status] || (darkMode ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-100 text-slate-600');
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/80 backdrop-blur-md text-white px-5 py-3 rounded-lg shadow-xl border border-white/10 text-sm font-medium animate-fade-in-up">
          {toastMsg}
        </div>
      )}

      <section className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl md:p-6 ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="text-2xl font-black font-serif-display tracking-tight text-slate-900 dark:text-slate-100">Scheduled Activities</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Daily and weekly cleaning and maintenance schedule.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => handleGenerate('bathroom_deep_clean')} disabled={!!generating} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${darkMode ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'}`}>
              <span className="material-symbols-outlined select-none text-base leading-none">shower</span>
              {generating === 'bathroom_deep_clean' ? 'Generating...' : 'Generate Bathrooms'}
            </button>
            <button onClick={() => handleGenerate('vent_cleaning')} disabled={!!generating} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${darkMode ? 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20' : 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200'}`}>
              <span className="material-symbols-outlined select-none text-base leading-none">air</span>
              {generating === 'vent_cleaning' ? 'Generating...' : 'Generate Vents'}
            </button>
            <button onClick={() => handleGenerate('daily')} disabled={!!generating} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed ${darkMode ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20' : 'bg-amber-50 text-amber-600 hover:bg-amber-100 border border-amber-200'}`}>
              <span className="material-symbols-outlined select-none text-base leading-none">cleaning_services</span>
              {generating === 'daily' ? 'Generating...' : 'Generate Daily'}
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-4 flex-wrap">
          <select value={filterProperty} onChange={e => setFilterProperty(e.target.value)} className={`rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            <option value="">All Properties</option>
            {PROPERTIES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={`rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
          <span className={`text-sm self-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tasks.length} tasks</span>
        </div>
      </section>

      {loading ? (
        <p className="text-center text-slate-400 py-8">Loading...</p>
      ) : (
        <section className="space-y-3">
          {tasks.map(task => (
            <article key={task.id} className={`rounded-2xl border p-4 shadow-sm ${task.status === 'overdue' ? (darkMode ? 'border-red-500/30 bg-red-500/5' : 'border-red-200 bg-red-50') : (darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70')}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{task.title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor(task.status)}`}>{task.status.replace('_', ' ')}</span>
                    {task.priority === 'high' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">High</span>}
                    {task.generatedSource && task.generatedSource !== 'ui' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">auto:{task.generatedSource}</span>}
                  </div>
                  <div className="flex gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                    {task.propertyName && <span>{task.propertyName}</span>}
                    {task.assigneeName && <span>Assignee: {task.assigneeName}</span>}
                    {task.scheduledStart && <span>{task.scheduledStart}</span>}
                    {task.shift && <span>Shift: {task.shift}</span>}
                    {task.category && <span className="uppercase">{task.category.replace(/_/g, ' ')}</span>}
                    {task.parentTaskId && <span className="text-amber-400">Follow-up from #{task.parentTaskId.slice(0, 8)}</span>}
                  </div>
                  {task.incompleteReason && (
                    <p className="text-xs text-rose-400 mt-1">Incomplete reason: {task.incompleteReason}</p>
                  )}
                  {task.completionNotes && (
                    <p className="text-xs text-emerald-400 mt-1">Notes: {task.completionNotes}</p>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0 flex-wrap">
                  {task.status === 'scheduled' && (
                    <>
                      <button onClick={() => handleComplete(task.id)} className="rounded-xl bg-emerald-500/10 px-3.5 py-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all duration-150 active:scale-[0.97] border border-emerald-500/20">Complete</button>
                      <button onClick={() => handleIncomplete(task.id)} className="rounded-xl bg-rose-500/10 px-3.5 py-1.5 text-[12px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all duration-150 active:scale-[0.97] border border-rose-500/20">Incomplete</button>
                    </>
                  )}
                  {task.status === 'in_progress' && (
                    <button onClick={() => handleComplete(task.id)} className="rounded-xl bg-emerald-500/10 px-3.5 py-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all duration-150 active:scale-[0.97] border border-emerald-500/20">Complete</button>
                  )}
                  {task.status === 'incomplete' && (
                    <button onClick={() => handleCreateFollowUp(task.id)} className="rounded-xl bg-violet-500/10 px-3.5 py-1.5 text-[12px] font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 transition-all duration-150 active:scale-[0.97] border border-violet-500/20">Brema Follow-up</button>
                  )}
                  <select value={task.status} onChange={e => handleStatusChange(task.id, e.target.value)} className={`rounded-xl px-2 py-1.5 text-xs border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                    {STATUSES.filter(s => s.value).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
              </div>
              {task.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{task.description}</p>}
            </article>
          ))}
          {tasks.length === 0 && <p className="text-center text-slate-400 py-8">No scheduled tasks found. Use &quot;Gen Bathrooms&quot;, &quot;Gen Vents&quot;, or create tasks manually.</p>}
        </section>
      )}
    </div>
  );
}
