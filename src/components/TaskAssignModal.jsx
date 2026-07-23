'use client';

import React, { useState } from 'react';

const CATEGORIES = [
  { value: 'bathroom_deep_clean', label: 'Bathroom Deep Clean' },
  { value: 'vent_cleaning', label: 'Vent Cleaning' },
  { value: 'general_cleaning', label: 'General Cleaning' },
  { value: 'night_shift', label: 'Night Shift' },
  { value: 'cockroach_spraying', label: 'Cockroach Spraying' },
  { value: 'ac_check', label: 'AC Check' },
  { value: 'hardware_check', label: 'Hardware Check' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'laundry_pod', label: 'Laundry Pod' },
  { value: 'go_key_charge', label: 'Go-Key Charge' },
  { value: 'bed_frame_check', label: 'Bed Frame Check' },
  { value: 'curtain_rod_check', label: 'Curtain Rod Check' },
  { value: 'other', label: 'Other' },
];

const PROPERTIES = ['Potts Point', 'Surry Hills', 'Darling Harbour', 'Central Sydney', 'The Pyrmont Budget Hotel', 'Olympic Hotel'];
const SHIFTS = ['morning', 'afternoon', 'night', 'overnight'];
const RECUR_TYPES = [
  { value: 'none', label: 'One-time' },
  { value: 'daily', label: 'Every day' },
  { value: 'weekly', label: 'Every week' },
  { value: 'biweekly', label: 'Every 2 weeks' },
  { value: 'monthly', label: 'Every month' },
  { value: 'custom', label: 'Custom...' },
];

export default function TaskAssignModal({ open, onClose, onSave, darkMode }) {
  const emptyForm = () => ({
    title: '', category: 'general_cleaning', propertyName: '', scheduledStart: new Date().toISOString().split('T')[0],
    shift: 'morning', assigneeName: '', assignedRole: 'cleaner', priority: 'medium', description: '',
    recurrenceType: 'none', customInterval: 3, customUnit: 'days',
  });

  const [form, setForm] = useState(emptyForm());
  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.propertyName) return;

    let recurrenceReference = null;
    if (form.recurrenceType === 'daily') recurrenceReference = 'daily:1:days';
    else if (form.recurrenceType === 'weekly') recurrenceReference = 'weekly:1:weeks';
    else if (form.recurrenceType === 'biweekly') recurrenceReference = 'weekly:2:weeks';
    else if (form.recurrenceType === 'monthly') recurrenceReference = 'monthly:1:months';
    else if (form.recurrenceType === 'custom') recurrenceReference = `custom:${form.customInterval}:${form.customUnit}`;

    onSave({ ...form, recurrenceReference });
    setForm(emptyForm());
  };

  if (!open) return null;

  const input = `w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-colors ${darkMode ? 'bg-white/[0.05] border border-white/[0.08] text-slate-200 focus:border-indigo-500/40' : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-300'}`;
  const selectCls = `w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-colors cursor-pointer ${darkMode ? 'bg-white/[0.05] border border-white/[0.08] text-slate-200 focus:border-indigo-500/40' : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-300'}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-fade-in-up ${darkMode ? 'bg-[#1c1f26] border-white/[0.08]' : 'bg-white border-slate-200'}`}>
        <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
          <h3 className={`text-base font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Assign Task</h3>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            <span className="material-symbols-outlined select-none text-lg">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Task Title</label>
            <input type="text" value={form.title} onChange={e => set('title', e.target.value)} placeholder="What needs to be done?" className={input} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className={selectCls}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</label>
              <select value={form.priority} onChange={e => set('priority', e.target.value)} className={selectCls}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Property</label>
              <select value={form.propertyName} onChange={e => set('propertyName', e.target.value)} className={selectCls} required>
                <option value="">Select...</option>
                {PROPERTIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</label>
              <input type="date" value={form.scheduledStart} onChange={e => set('scheduledStart', e.target.value)} className={input} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Shift</label>
              <select value={form.shift} onChange={e => set('shift', e.target.value)} className={selectCls}>
                {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assignee</label>
              <input type="text" value={form.assigneeName} onChange={e => set('assigneeName', e.target.value)} placeholder="Staff name" className={input} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Role</label>
              <select value={form.assignedRole} onChange={e => set('assignedRole', e.target.value)} className={selectCls}>
                <option value="cleaner">Cleaner</option>
                <option value="bed_maker">Bed Maker</option>
                <option value="night_shift">Night Shift</option>
                <option value="manager">Manager</option>
                <option value="Brema">Brema</option>
                <option value="administrator">Admin</option>
              </select>
            </div>
          </div>

          {/* Recurrence */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recurrence</label>
            <select value={form.recurrenceType} onChange={e => set('recurrenceType', e.target.value)} className={selectCls}>
              {RECUR_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {form.recurrenceType === 'custom' && (
            <div className={`grid grid-cols-2 gap-3 p-3 rounded-xl border ${darkMode ? 'bg-white/[0.02] border-white/[0.06]' : 'bg-slate-50 border-slate-100'}`}>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Repeat every</label>
                <input
                  type="number" min="1" value={form.customInterval}
                  onChange={e => set('customInterval', Math.max(1, parseInt(e.target.value) || 1))}
                  className={input}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Unit</label>
                <select value={form.customUnit} onChange={e => set('customUnit', e.target.value)} className={selectCls}>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                  <option value="months">Months</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Any special instructions..." className={`${input} resize-none`} />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors ${darkMode ? 'border-white/[0.08] text-slate-400 hover:bg-white/[0.04]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
              Cancel
            </button>
            <button type="submit" className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.97] ${darkMode ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-900 hover:bg-slate-800'}`}>
              Assign Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
