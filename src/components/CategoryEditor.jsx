'use client';

import React, { useState, useEffect } from 'react';

const DEFAULT_ICONS = ['shower', 'air', 'cleaning_services', 'dark_mode', 'engineering',
  'pest_control', 'ac_unit', 'build', 'inventory_2', 'bed', 'curtains', 'more_horiz',
  'kitchen', 'restaurant', 'local_laundry_service', 'weekend', 'nightlight',
  'devices', 'battery_charging_full', 'sensors', 'warning'];

export default function CategoryEditor({ darkMode, open, onClose, onCategoriesChanged }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ key: '', label: '', icon: 'build' });
  const [adding, setAdding] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (open) fetchCategories(); }, [open]);

  const handleSave = async () => {
    if (!form.key.trim() || !form.label.trim()) return;
    const method = editing ? 'PUT' : 'POST';
    const body = { key: form.key.trim().toLowerCase().replace(/\s+/g, '_'), label: form.label.trim(), icon: form.icon };

    try {
      const res = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditing(null);
        setAdding(false);
        setForm({ key: '', label: '', icon: 'build' });
        fetchCategories();
        if (onCategoriesChanged) onCategoriesChanged();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save');
      }
    } catch { alert('Network error'); }
  };

  const handleDelete = async (key) => {
    if (!confirm(`Delete category "${key}"?`)) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        fetchCategories();
        if (onCategoriesChanged) onCategoriesChanged();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to delete');
      }
    } catch { alert('Network error'); }
  };

  const startEdit = (cat) => {
    setEditing(cat.key);
    setAdding(false);
    setForm({ key: cat.key, label: cat.label, icon: cat.icon || 'build' });
  };

  const startAdd = () => {
    setAdding(true);
    setEditing(null);
    setForm({ key: '', label: '', icon: 'build' });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className={`w-full max-w-lg mx-4 rounded-[28px] border p-6 shadow-2xl max-h-[80vh] overflow-y-auto ${darkMode ? 'border-white/10 bg-[#1a1d23]' : 'border-white/70 bg-white'}`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-black font-serif-display text-slate-900 dark:text-slate-100">Manage Categories</h3>
            <p className="text-xs text-slate-400 mt-0.5">{categories.length} categories configured</p>
          </div>
          <button onClick={onClose} className={`text-xl hover:opacity-70 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>✕</button>
        </div>

        <div className="space-y-2 mb-4">
          {categories.map(cat => (
            <div key={cat.key} className={`flex items-center gap-3 rounded-xl border p-3 ${darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50'}`}>
              <span className="material-symbols-outlined text-lg text-slate-400 select-none">{cat.icon || 'build'}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{cat.label}</p>
                <p className="text-[10px] text-slate-400">{cat.key}</p>
              </div>
              <button onClick={() => startEdit(cat)} className="rounded-lg bg-indigo-500/10 px-2.5 py-1 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/20">Edit</button>
              <button onClick={() => handleDelete(cat.key)} className="rounded-lg bg-rose-500/10 px-2.5 py-1 text-[10px] font-bold text-rose-400 hover:bg-rose-500/20">Del</button>
            </div>
          ))}
        </div>

        {(editing || adding) && (
          <div className={`rounded-2xl border p-4 mb-4 ${darkMode ? 'border-indigo-500/20 bg-indigo-500/5' : 'border-indigo-200 bg-indigo-50'}`}>
            <p className="text-xs font-bold text-slate-400 mb-3">{editing ? 'Edit Category' : 'Add Category'}</p>
            <div className="grid gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400">Key</span>
                <input value={form.key} onChange={e => setForm(f => ({ ...f, key: e.target.value }))} disabled={!!editing} placeholder="e.g. bathroom_deep_clean" className={`rounded-xl px-3 py-2 text-sm border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'} ${editing ? 'opacity-50' : ''}`} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400">Label</span>
                <input value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="e.g. Bathroom Deep Clean" className={`rounded-xl px-3 py-2 text-sm border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`} />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400">Icon</span>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_ICONS.map(ic => (
                    <button key={ic} type="button" onClick={() => setForm(f => ({ ...f, icon: ic }))} className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${form.icon === ic ? (darkMode ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-700') : (darkMode ? 'text-slate-500 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100')}`}>
                      <span className="material-symbols-outlined text-[16px]">{ic}</span>
                    </button>
                  ))}
                </div>
              </label>
              <div className="flex gap-2">
                <button onClick={handleSave} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500">{editing ? 'Update' : 'Add'}</button>
                <button onClick={() => { setEditing(null); setAdding(false); }} className={`rounded-xl px-4 py-2 text-xs font-bold border ${darkMode ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-600'}`}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <button onClick={startAdd} className="w-full rounded-xl bg-indigo-500/10 px-4 py-2.5 text-sm font-bold text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20">
          + Add Category
        </button>
      </div>
    </div>
  );
}
