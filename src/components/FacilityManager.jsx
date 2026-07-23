'use client';

import React, { useState, useEffect } from 'react';

const FACILITY_OPTIONS = [
  { value: 'bathroom', label: 'Bathroom' },
  { value: 'kitchen', label: 'Kitchen' },
  { value: 'kitchen_cabinet', label: 'Kitchen Cabinet' },
  { value: 'fridge', label: 'Fridge' },
  { value: 'laundry_area', label: 'Laundry Area' },
  { value: 'laundry_lint_filter', label: 'Laundry Lint Filter' },
  { value: 'reception', label: 'Reception' },
  { value: 'common_area', label: 'Common Area' },
  { value: 'vent', label: 'Vent' },
  { value: 'air_conditioner', label: 'Air Conditioner' },
  { value: 'bed_frame', label: 'Bed Frame' },
  { value: 'curtain_rod', label: 'Curtain Rod' },
  { value: 'go_key_device', label: 'Go-Key Device' },
  { value: 'laundry_pod_station', label: 'Laundry Pod Station' },
  { value: 'room', label: 'Room' },
  { value: 'other', label: 'Other' },
];

export default function FacilityManager({ darkMode }) {
  const [facilities, setFacilities] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProperty, setFilterProperty] = useState('');
  const [filterType, setFilterType] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    propertyId: '',
    type: 'bathroom',
    name: '',
    floorOrArea: '',
    notes: '',
  });

  const fetchFacilities = async () => {
    try {
      const params = new URLSearchParams();
      if (filterProperty) params.set('propertyId', filterProperty);
      if (filterType) params.set('type', filterType);
      const res = await fetch(`/api/facilities?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setFacilities(data);
    } catch (err) {
      console.error('Failed to fetch facilities:', err);
    }
  };

  const fetchProperties = async () => {
    try {
      const res = await fetch('/api/properties');
      const data = await res.json();
      if (Array.isArray(data)) setProperties(data);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    }
  };

  useEffect(() => {
    let ignore = false;
    async function load() {
      await Promise.all([fetchFacilities(), fetchProperties()]);
      if (!ignore) setLoading(false);
    }
    load();
    return () => { ignore = true; };
  }, []);

  useEffect(() => {
    async function load() {
      await fetchFacilities();
    }
    load();
  }, [filterProperty, filterType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const url = editId ? `/api/facilities/${editId}` : '/api/facilities';
    const method = editId ? 'PUT' : 'POST';

    try {
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setShowAddForm(false);
      setEditId(null);
      setForm({ propertyId: '', type: 'bathroom', name: '', floorOrArea: '', notes: '' });
      fetchFacilities();
    } catch (err) {
      console.error('Failed to save facility:', err);
    }
  };

  const handleEdit = (fac) => {
    setEditId(fac.id);
    setForm({
      propertyId: fac.propertyId,
      type: fac.type,
      name: fac.name,
      floorOrArea: fac.floorOrArea || '',
      notes: fac.notes || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this facility?')) return;
    try {
      await fetch(`/api/facilities/${id}`, { method: 'DELETE' });
      fetchFacilities();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const getPropertyName = (id) => {
    return properties.find(p => p.id === id)?.name || id;
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading facilities...</div>;

  return (
    <div className="space-y-6">
      <section className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl md:p-6 ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h3 className="text-2xl font-black font-serif-display tracking-tight text-slate-900 dark:text-slate-100">
              Facility Inventory
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage properties, bathrooms, kitchens, and other facilities.
            </p>
          </div>
          <button onClick={() => { setShowAddForm(!showAddForm); setEditId(null); setForm({ propertyId: '', type: 'bathroom', name: '', floorOrArea: '', notes: '' }); }} className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-500">
            + Add Facility
          </button>
        </div>

        <div className="mt-4 flex gap-4 flex-wrap">
          <select value={filterProperty} onChange={e => setFilterProperty(e.target.value)} className={`rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            <option value="">All Properties</option>
            {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={filterType} onChange={e => setFilterType(e.target.value)} className={`rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            <option value="">All Types</option>
            {FACILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </section>

      {showAddForm && (
        <section className={`rounded-[28px] border p-5 md:p-6 shadow-sm ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
          <h4 className="text-lg font-bold mb-4 text-slate-900 dark:text-slate-100">{editId ? 'Edit Facility' : 'Add Facility'}</h4>
          <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400">Property</span>
              <select value={form.propertyId} onChange={e => setForm(f => ({ ...f, propertyId: e.target.value }))} required className={`rounded-xl px-3 py-2 text-sm border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`}>
                <option value="">Select property</option>
                {properties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400">Type</span>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={`rounded-xl px-3 py-2 text-sm border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`}>
                {FACILITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400">Name/Identifier *</span>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. Bathroom 3" className={`rounded-xl px-3 py-2 text-sm border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`} />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold text-slate-400">Floor/Area</span>
              <input value={form.floorOrArea} onChange={e => setForm(f => ({ ...f, floorOrArea: e.target.value }))} placeholder="e.g. Level 1" className={`rounded-xl px-3 py-2 text-sm border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`} />
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-xs font-bold text-slate-400">Notes</span>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} className={`rounded-xl px-3 py-2 text-sm border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200'}`} />
            </label>
            <div className="flex gap-3 md:col-span-2">
              <button type="submit" className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-bold text-white hover:bg-indigo-500">{editId ? 'Update' : 'Create'}</button>
              <button type="button" onClick={() => { setShowAddForm(false); setEditId(null); }} className={`rounded-xl px-5 py-2 text-sm font-bold border ${darkMode ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-600'}`}>Cancel</button>
            </div>
          </form>
        </section>
      )}

      <section className="space-y-3">
        {facilities.map(fac => (
          <article key={fac.id} className={`rounded-2xl border p-4 shadow-sm transition-colors ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{fac.name}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${fac.verificationStatus === 'needs_verification' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {fac.verificationStatus === 'needs_verification' ? 'Needs Verification' : 'Verified'}
                  </span>
                  {!fac.active && <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-500">Inactive</span>}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {getPropertyName(fac.propertyId)} · {FACILITY_OPTIONS.find(o => o.value === fac.type)?.label || fac.type}
                  {fac.floorOrArea ? ` · ${fac.floorOrArea}` : ''}
                </p>
                {fac.notes && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{fac.notes}</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(fac)} className="text-xs text-indigo-400 hover:text-indigo-300">Edit</button>
                <button onClick={() => handleDelete(fac.id)} className="text-xs text-rose-400 hover:text-rose-300">Delete</button>
              </div>
            </div>
          </article>
        ))}
        {facilities.length === 0 && <p className="text-center text-slate-400 py-8">No facilities found. Add one to get started.</p>}
      </section>
    </div>
  );
}
