'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TaskAssignModal from './TaskAssignModal';

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

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function ScheduleView({ darkMode }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProperty, setFilterProperty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [generating, setGenerating] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [assignModal, setAssignModal] = useState(false);

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 3000); };

  const fetchTasks = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterProperty) params.set('propertyName', filterProperty);
      if (filterStatus) params.set('status', filterStatus);
      if (filterCategory) params.set('category', filterCategory);
      params.set('limit', '500');
      const res = await fetch(`/api/scheduled-tasks?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (err) {
      console.error('Failed:', err);
    }
  }, [filterProperty, filterStatus, filterCategory]);

  useEffect(() => { (async () => { setLoading(true); await fetchTasks(); setLoading(false); })(); }, [fetchTasks]);

  const handleAssign = async (formData) => {
    try {
      const res = await fetch('/api/scheduled-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        showToast('Task assigned successfully');
        fetchTasks();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed');
      }
    } catch { showToast('Network error'); }
    setAssignModal(false);
  };

  const handleGenerate = async (mode) => {
    setGenerating(mode);
    try {
      const res = await fetch('/api/scheduled-tasks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, propertyCode: filterProperty ? PROP_CODES[filterProperty] || null : null, dateStr: new Date().toISOString().split('T')[0] }),
      });
      const data = await res.json();
      showToast(data.success ? `Generated ${data.totalTasks} task(s)` : (data.error || 'Failed'));
      fetchTasks();
    } catch (err) { showToast(err.message); }
    finally { setGenerating(null); }
  };

  const handleComplete = async (id) => {
    await fetch(`/api/scheduled-tasks/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'complete', completionNotes: '' }),
    });
    fetchTasks();
  };

  const handleIncomplete = async (id) => {
    const reason = prompt('Why is this task incomplete?');
    if (!reason) return;
    await fetch(`/api/scheduled-tasks/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'incomplete', reason }),
    });
    fetchTasks();
  };

  const handleFollowUp = async (taskId) => {
    const hours = prompt('Follow-up shift hours?', '5');
    if (!hours) return;
    await fetch('/api/scheduled-tasks/follow-up', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, shiftHours: parseInt(hours), assignedTo: 'Brema' }),
    });
    fetchTasks();
    showToast('Follow-up shift created');
  };

  const handleStatus = async (id, newStatus) => {
    await fetch(`/api/scheduled-tasks/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTasks();
  };

  const statusColor = (s) => {
    const m = { scheduled: darkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600', in_progress: darkMode ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-600', completed: darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600', incomplete: darkMode ? 'bg-rose-500/10 text-rose-400' : 'bg-rose-50 text-rose-600', cancelled: darkMode ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-100 text-slate-600', overdue: darkMode ? 'bg-red-500/20 text-red-400' : 'bg-red-50 text-red-600' };
    return m[s] || (darkMode ? 'bg-slate-500/10 text-slate-400' : 'bg-slate-100 text-slate-600');
  };

  // ── Calendar helpers ──
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const calDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const tasksByDate = {};
  for (const t of tasks) {
    const d = t.scheduledStart;
    if (!d) continue;
    if (!tasksByDate[d]) tasksByDate[d] = [];
    tasksByDate[d].push(t);
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {toastMsg && <div className="fixed bottom-6 right-6 z-50 bg-slate-900/80 backdrop-blur-md text-white px-5 py-3 rounded-lg shadow-xl border border-white/10 text-sm font-medium">{toastMsg}</div>}

      {/* Header */}
      <section className={`rounded-[28px] border p-5 md:p-6 shadow-sm backdrop-blur-xl ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="text-2xl font-black font-serif-display tracking-tight text-slate-900 dark:text-slate-100">Scheduled Activities</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Daily and weekly cleaning and maintenance schedule.</p>
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <div className={`flex rounded-xl p-0.5 border ${darkMode ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
              <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-[10px] text-[12px] font-semibold transition-all ${viewMode === 'list' ? (darkMode ? 'bg-white/10 text-white' : 'bg-white text-slate-900 shadow-sm') : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                List
              </button>
              <button onClick={() => setViewMode('calendar')} className={`px-4 py-2 rounded-[10px] text-[12px] font-semibold transition-all ${viewMode === 'calendar' ? (darkMode ? 'bg-white/10 text-white' : 'bg-white text-slate-900 shadow-sm') : (darkMode ? 'text-slate-400' : 'text-slate-500')}`}>
                Calendar
              </button>
            </div>
            <button onClick={() => setAssignModal(true)} className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all active:scale-[0.97] ${darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
              <span className="material-symbols-outlined select-none text-lg">add</span>
              Assign
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-4 flex-wrap">
          <select value={filterProperty} onChange={e => setFilterProperty(e.target.value)} className={`rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            {PROPERTIES.map(p => <option key={p} value={p}>{p || 'All Properties'}</option>)}
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

      {/*─ Calendar View ──*/}
      {viewMode === 'calendar' && (
        <section className={`rounded-[28px] border p-5 md:p-6 shadow-sm backdrop-blur-xl ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
          <div className="flex items-center justify-between mb-5">
            <button onClick={() => { const prev = new Date(calYear, calMonth - 1, 1); setCalMonth(prev.getMonth()); setCalYear(prev.getFullYear()); }} className={`p-2 rounded-xl hover:bg-white/5 transition-colors ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined select-none">chevron_left</span>
            </button>
            <h4 className={`text-lg font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{MONTHS[calMonth]} {calYear}</h4>
            <button onClick={() => { const next = new Date(calYear, calMonth + 1, 1); setCalMonth(next.getMonth()); setCalYear(next.getFullYear()); }} className={`p-2 rounded-xl hover:bg-white/5 transition-colors ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              <span className="material-symbols-outlined select-none">chevron_right</span>
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map(d => (
              <p key={d} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider py-1">{d}</p>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`e${i}`} className="aspect-square" />)}
            {calDays.map(d => {
              const iso = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const dayTasks = tasksByDate[iso] || [];
              const isToday = iso === todayStr;
              return (
                <div
                  key={d}
                  onClick={() => setSelectedDay(selectedDay === iso ? null : iso)}
                  className={`aspect-square rounded-xl p-1 flex flex-col overflow-hidden transition-all cursor-pointer ${selectedDay === iso ? (darkMode ? 'ring-2 ring-indigo-400 bg-indigo-500/10' : 'ring-2 ring-indigo-500 bg-indigo-100') : isToday ? (darkMode ? 'ring-1 ring-indigo-500/30 bg-indigo-500/5' : 'ring-1 ring-indigo-300 bg-indigo-50') : (darkMode ? 'hover:bg-white/[0.04] hover:ring-1 hover:ring-white/10' : 'hover:bg-slate-50 hover:ring-1 hover:ring-slate-200')}`}>
                  <span className={`text-[11px] font-semibold self-end mb-0.5 px-1 ${isToday ? (darkMode ? 'text-indigo-400' : 'text-indigo-600') : (darkMode ? 'text-slate-400' : 'text-slate-600')}`}>{d}</span>
                  <div className="flex-1 space-y-0.5 overflow-hidden">
                    {dayTasks.slice(0, 3).map(t => (
                      <div key={t.id} className={`text-[9px] px-1 py-0.5 rounded truncate ${t.status === 'completed' ? (darkMode ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700') : t.status === 'overdue' ? (darkMode ? 'bg-red-500/20 text-red-300' : 'bg-red-100 text-red-700') : t.status === 'incomplete' ? (darkMode ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-700') : (darkMode ? 'bg-white/[0.06] text-slate-300' : 'bg-slate-100 text-slate-700')}`} title={`${t.title} | ${t.assigneeName || 'unassigned'} | ${t.shift || '-'}`}>
                        {t.assigneeName ? t.assigneeName.split(' ').map(n => n[0]).join('').slice(0, 2) : '--'} {t.title.slice(0, 18)}
                      </div>
                    ))}
                    {dayTasks.length > 3 && <p className={`text-[9px] px-1 opacity-50 font-medium`}>+{dayTasks.length - 3} more</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected day detail panel */}
          {selectedDay && (() => {
            const dayTasks = tasksByDate[selectedDay] || [];
            const selDate = new Date(selectedDay + 'T00:00:00');
            const formatted = selDate.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
            return (
              <div className={`mt-5 pt-4 border-t ${darkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                <div className="flex items-center justify-between mb-3">
                  <p className={`text-xs font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    {formatted} -- {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                  </p>
                  <button onClick={() => setSelectedDay(null)} className={`p-1 rounded-lg hover:bg-white/5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                    <span className="material-symbols-outlined select-none text-base">close</span>
                  </button>
                </div>
                {dayTasks.length === 0 ? (
                  <div className={`text-center py-6 rounded-xl border border-dashed ${darkMode ? 'border-white/[0.06] text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                    <span className="material-symbols-outlined select-none text-2xl mb-1 block opacity-40">event_busy</span>
                    <p className="text-xs">No activities scheduled for this day</p>
                    <button onClick={() => { setAssignModal(true); }} className={`mt-2 text-[11px] font-semibold px-3 py-1.5 rounded-xl transition-colors ${darkMode ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}>
                      + Assign Task
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {dayTasks.map(t => (
                      <div key={t.id} className={`flex items-center gap-2.5 text-[12px] px-3 py-2 rounded-xl ${darkMode ? 'bg-white/[0.03]' : 'bg-slate-50'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.status === 'completed' ? 'bg-emerald-400' : t.status === 'overdue' ? 'bg-red-400' : t.status === 'incomplete' ? 'bg-rose-400' : t.status === 'in_progress' ? 'bg-amber-400' : 'bg-slate-400'}`} />
                        <span className={`flex-1 font-medium truncate ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{t.title}</span>
                        <span className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{t.assigneeName || 'unassigned'}</span>
                        <span className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>{t.shift}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${statusColor(t.status)}`}>{t.status.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </section>
      )}

      {/*─ List View ──*/}
      {viewMode === 'list' && (
        <section className="space-y-2">
          {loading ? <p className="text-center text-slate-400 py-8">Loading...</p> : tasks.length === 0 ? <p className="text-center text-slate-400 py-8">No tasks found. Assign a task or generate from the top bar.</p> : (
            tasks.map(task => (
              <article key={task.id} className={`rounded-2xl border p-4 shadow-sm ${task.status === 'overdue' ? (darkMode ? 'border-red-500/20 bg-red-500/[0.03]' : 'border-red-200 bg-red-50') : (darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70')}`}>
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate">{task.title}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${statusColor(task.status)}`}>{task.status.replace('_', ' ')}</span>
                      {task.priority === 'high' && <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">High</span>}
                      {task.generatedSource && task.generatedSource !== 'ui' && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400">auto</span>}
                    </div>
                    <div className="flex gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      {task.propertyName && <span>{task.propertyName}</span>}
                      {task.assigneeName && <span>Assignee: {task.assigneeName}</span>}
                      {task.scheduledStart && <span>{task.scheduledStart}</span>}
                      {task.shift && <span>Shift: {task.shift}</span>}
                      {task.category && <span className="uppercase opacity-60">{task.category.replace(/_/g, ' ')}</span>}
                      {task.parentTaskId && <span className="text-amber-400">Follow-up</span>}
                    </div>
                    {task.incompleteReason && <p className="text-xs text-rose-400 mt-1">Reason: {task.incompleteReason}</p>}
                    {task.completionNotes && <p className="text-xs text-emerald-400 mt-1">Notes: {task.completionNotes}</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0 flex-wrap">
                    {task.status === 'scheduled' && (
                      <>
                        <button onClick={() => handleComplete(task.id)} className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-[0.97] border border-emerald-500/20">Complete</button>
                        <button onClick={() => handleIncomplete(task.id)} className="rounded-xl bg-rose-500/10 px-3 py-1.5 text-[12px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all active:scale-[0.97] border border-rose-500/20">Incomplete</button>
                      </>
                    )}
                    {task.status === 'in_progress' && (
                      <button onClick={() => handleComplete(task.id)} className="rounded-xl bg-emerald-500/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all active:scale-[0.97] border border-emerald-500/20">Complete</button>
                    )}
                    {task.status === 'incomplete' && (
                      <button onClick={() => handleFollowUp(task.id)} className="rounded-xl bg-violet-500/10 px-3 py-1.5 text-[12px] font-semibold text-violet-600 dark:text-violet-400 hover:bg-violet-500/20 transition-all active:scale-[0.97] border border-violet-500/20">Follow-up</button>
                    )}
                    <select value={task.status} onChange={e => handleStatus(task.id, e.target.value)} className={`rounded-xl px-2 py-1.5 text-xs border ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'}`}>
                      {STATUSES.filter(s => s.value).map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                {task.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{task.description}</p>}
              </article>
            ))
          )}
        </section>
      )}

      <TaskAssignModal open={assignModal} onClose={() => setAssignModal(false)} onSave={handleAssign} darkMode={darkMode} />
    </div>
  );
}
