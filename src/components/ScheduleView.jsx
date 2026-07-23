'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import TaskAssignModal from './TaskAssignModal';

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'bathroom_deep_clean', label: 'Bathroom Deep Clean' },
  { value: 'vent_cleaning', label: 'Vent Cleaning' },
  { value: 'general_cleaning', label: 'General Cleaning' },
  { value: 'night_shift', label: 'Night Shift' },
  { value: 'overnight_maintenance', label: 'Overnight Maintenance' },
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

export default function ScheduleView({ darkMode, scheduleExportRef, assignTrigger }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterProperty, setFilterProperty] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [generating, setGenerating] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const toastTimer = React.useRef(null);
  const [viewMode, setViewMode] = useState('list');
  const [assignModal, setAssignModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [updateModal, setUpdateModal] = useState(null);
  const [updateText, setUpdateText] = useState('');
  const [dynamicCategories, setDynamicCategories] = useState(CATEGORIES);
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const [editingCatKey, setEditingCatKey] = useState(null);
  const [editCatLabel, setEditCatLabel] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState({});

  // Calendar state
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 3000);
  };

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

  useEffect(() => {
    if (assignTrigger > 0) setAssignModal(true);
  }, [assignTrigger]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length) setDynamicCategories(data); })
      .catch(() => {});
  }, []);

  const handleAssign = async (formData) => {
    try {
      const res = await fetch('/api/scheduled-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        showToast('Task assigned successfully');
        await fetchTasks();
        setAssignModal(false);
      } else {
        const d = await res.json().catch(() => ({}));
        const msg = d.error || `Server error (${res.status})`;
        showToast(msg);
        throw new Error(msg);
      }
    } catch (err) {
      if (!err.message?.startsWith('Server error')) {
        console.error('Assign task failed:', err);
        showToast('Network error - check console');
      }
      throw err;
    }
  };

  const handleEdit = async (formData) => {
    const res = await fetch(`/api/scheduled-tasks/${formData.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      showToast('Task updated successfully');
      await fetchTasks();
      setEditTask(null);
    } else {
      const d = await res.json().catch(() => ({}));
      showToast(d.error || 'Update failed');
      throw new Error(d.error || 'Update failed');
    }
  };

  const handleAddUpdate = async (taskId) => {
    if (!updateText.trim()) return;
    try {
      const res = await fetch(`/api/scheduled-tasks/${taskId}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: updateText.trim() }),
      });
      if (res.ok) {
        showToast('Update added');
        setUpdateText('');
        setUpdateModal(null);
        await fetchTasks();
      } else {
        const d = await res.json().catch(() => ({}));
        showToast(d.error || 'Failed to add update');
      }
    } catch { showToast('Network error'); }
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

  const handleDelete = async (taskId, taskTitle) => {
    if (!confirm(`Delete task "${taskTitle}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/scheduled-tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Task deleted');
        fetchTasks();
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed to delete');
      }
    } catch { showToast('Network error'); }
  };

  const handleAddCategory = async () => {
    const label = newCategoryLabel.trim();
    if (!label) return;
    const key = label.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    try {
      const res = await fetch('/api/categories', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, label }),
      });
      if (res.ok) {
        const cat = await res.json();
        setDynamicCategories(prev => [...prev, cat]);
        setNewCategoryLabel('');
        setShowCategoryEditor(false);
        showToast('Category added');
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed');
      }
    } catch { showToast('Network error'); }
  };

  const handleDeleteCategory = async (key) => {
    if (!confirm('Delete this category?')) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key }),
      });
      if (res.ok) {
        setDynamicCategories(prev => prev.filter(c => c.key !== key));
        if (filterCategory === key) setFilterCategory('');
        showToast('Category deleted');
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed');
      }
    } catch { showToast('Network error'); }
  };

  const handleUpdateCategory = async (key) => {
    if (!editCatLabel.trim()) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, label: editCatLabel.trim() }),
      });
      if (res.ok) {
        const cat = await res.json();
        setDynamicCategories(prev => prev.map(c => c.key === key ? { ...c, label: cat.label, icon: cat.icon } : c));
        setEditingCatKey(null);
        showToast('Category updated');
      } else {
        const d = await res.json();
        showToast(d.error || 'Failed');
      }
    } catch { showToast('Network error'); }
  };

  const handleStatus = async (id, newStatus) => {
    await fetch(`/api/scheduled-tasks/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTasks();
  };

  const copyToClipboard = (text, successMsg) => {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast(successMsg || "Copied to clipboard!"))
      .catch((err) => {
        console.error("Clipboard failure", err);
        showToast("Failed to copy to clipboard.");
      });
  };

  const copyScheduleData = () => {
    let text = `*AZZURRO HOTEL — SCHEDULED ACTIVITIES REPORT*\n_${new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "short", year: "numeric" })}_\n\n`;

    categoryGroups.forEach(group => {
      const activeTasks = group.tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
      const completedTasks = group.tasks.filter(t => t.status === 'completed');

      text += `*${group.label}* (${activeTasks.length} active, ${completedTasks.length} done)\n`;

      group.tasks.forEach((t) => {
        const statusEmoji = { completed: '✅', overdue: '⛔', incomplete: '❌', cancelled: '🚫', in_progress: '🔄', scheduled: '📋' };
        const emoji = statusEmoji[t.status] || '📋';
        const isCompleted = t.status === 'completed' || t.status === 'cancelled';

        const line = isCompleted
          ? `  ~${emoji} ${t.title}~`
          : `  ${emoji} *${t.title}*`;

        text += line + '\n';

        const details = [];
        details.push(`📍 ${t.propertyName || '-'}`);
        details.push(`📅 ${t.scheduledStart || 'N/A'}`);
        details.push(`🕐 ${t.shift || '-'}`);
        details.push(`👤 ${t.assigneeName || 'unassigned'}`);
        if (t.priority && t.priority !== 'medium') details.push(`⚡${t.priority}`);
        text += `  _${details.join(' │ ')}_\n`;

        if (t.description) text += `  _${t.description}_\n`;
        if (t.incompleteReason) text += `  ⚠️ _${t.incompleteReason}_\n`;
        if (t.completionNotes) text += `  📝 _${t.completionNotes}_\n`;
        text += '\n';
      });
    });

    copyToClipboard(text, "Schedule report copied to clipboard!");
  };

  const exportToWord = () => {
    const properties = PROPERTIES.filter((p) => p !== "");
    const tasksByProperty = {};
    properties.forEach((p) => {
      tasksByProperty[p] = tasks.filter((t) => t.propertyName === p);
    });

    const htmlHeader = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>Schedule Report</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #333333; margin: 1in; }
        h1 { color: #0a1b33; border-bottom: 2px solid #e3ded0; padding-bottom: 8px; font-size: 20pt; }
        h2 { color: #5c5446; font-size: 14pt; margin-top: 20pt; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th, td { border: 1px solid #e3ded0; padding: 10px; text-align: left; }
        th { background-color: #f0ece1; color: #5c5446; font-weight: bold; }
        .status { font-weight: bold; text-transform: uppercase; font-size: 9pt; }
      </style>
    </head>
    <body>
      <h1>AZZURRO HOTEL - SCHEDULED ACTIVITIES</h1>
      <p>Report Date: ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</p>`;

    let content = "";
    properties.forEach((prop) => {
      content += `<h2>📍 Property: ${prop}</h2>`;
      content += `<table>
        <tr>
          <th>Task</th>
          <th>Date</th>
          <th>Shift</th>
          <th>Assignee</th>
          <th>Category</th>
          <th>Status</th>
          <th>Priority</th>
        </tr>`;

      const propTasks = tasksByProperty[prop] || [];
      propTasks.forEach((t) => {
        content += `<tr>
          <td><b>${t.title || ''}</b>${t.description ? `<br/><small style="color:#777">${t.description}</small>` : ''}</td>
          <td>${t.scheduledStart || 'N/A'}</td>
          <td>${t.shift || '-'}</td>
          <td>${t.assigneeName || 'unassigned'}</td>
          <td>${(t.category || 'general').replace(/_/g, ' ')}</td>
          <td class="status">${(t.status || 'scheduled').replace(/_/g, ' ')}</td>
          <td>${t.priority || 'normal'}</td>
        </tr>`;
      });

      if (!propTasks || propTasks.length === 0) {
        content += `<tr><td colspan="7" style="text-align:center; color:#888">No scheduled activities for this location.</td></tr>`;
      }
      content += `</table>`;
    });

    const htmlFooter = "</body></html>";
    const sourceHTML = htmlHeader + content + htmlFooter;
    const source =
      "data:application/vnd.ms-word;charset=utf-8," +
      encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Schedule_Activities_${new Date().toISOString().slice(0, 10)}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    showToast("Word document generated.");
  };

  const exportToCsv = () => {
    const headers = ['Title', 'Property', 'Scheduled Date', 'Shift', 'Assignee', 'Category', 'Status', 'Priority', 'Description', 'Incomplete Reason', 'Completion Notes'];
    const rows = tasks.map(t => [
      `"${(t.title || '').replace(/"/g, '""')}"`,
      `"${(t.propertyName || '').replace(/"/g, '""')}"`,
      `"${t.scheduledStart || ''}"`,
      `"${t.shift || ''}"`,
      `"${(t.assigneeName || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/_/g, ' ')}"`,
      (t.status || 'scheduled').replace(/_/g, ' '),
      t.priority || 'normal',
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.incompleteReason || '').replace(/"/g, '""')}"`,
      `"${(t.completionNotes || '').replace(/"/g, '""')}"`,
    ].join(','));

    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Schedule_Activities_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("CSV file downloaded.");
  };

  useEffect(() => {
    if (scheduleExportRef) {
      scheduleExportRef.current = { copyData: copyScheduleData, exportWord: exportToWord, exportCsv: exportToCsv };
    }
  });

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

  const categoryGroups = useMemo(() => {
    const groups = {};
    const categories = [
      { key: 'bathroom_deep_clean', label: 'Bathroom Deep Clean', icon: 'shower' },
      { key: 'vent_cleaning', label: 'Vent Cleaning', icon: 'air' },
      { key: 'general_cleaning', label: 'General Cleaning', icon: 'cleaning_services' },
      { key: 'night_shift', label: 'Night Shift', icon: 'dark_mode' },
      { key: 'cockroach_spraying', label: 'Pest Control', icon: 'bug_report' },
      { key: 'ac_check', label: 'AC Check', icon: 'ac_unit' },
      { key: 'hardware_check', label: 'Hardware Check', icon: 'build' },
      { key: 'supplies', label: 'Supplies', icon: 'inventory_2' },
      { key: 'laundry_pod', label: 'Laundry Pod', icon: 'local_laundry_service' },
      { key: 'go_key_charge', label: 'Go-Key Charge', icon: 'key' },
      { key: 'bed_frame_check', label: 'Bed Frame Check', icon: 'bed' },
      { key: 'curtain_rod_check', label: 'Curtain Rod Check', icon: 'blinds' },
      { key: 'other', label: 'Other Tasks', icon: 'more_horiz' },
    ];
    categories.forEach(c => { groups[c.key] = { ...c, tasks: [] }; });
    groups['__uncategorized__'] = { key: '__uncategorized__', label: 'Uncategorized', icon: 'label', tasks: [] };

    tasks.forEach(t => {
      const key = t.category && groups[t.category] ? t.category : '__uncategorized__';
      groups[key].tasks.push(t);
    });

    return Object.values(groups).filter(g => g.tasks.length > 0);
  }, [tasks]);

  const toggleCategory = (key) => {
    setCollapsedCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

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
            <button onClick={copyScheduleData} title="Copy report" className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all active:scale-[0.97] border cursor-pointer ${darkMode ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
              <span className="material-symbols-outlined select-none text-[18px]">content_copy</span>
            </button>
            <button onClick={exportToWord} title="Download Word document" className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition-all active:scale-[0.97] border cursor-pointer ${darkMode ? 'border-white/10 text-blue-400 hover:bg-blue-500/10' : 'border-blue-200 text-blue-600 hover:bg-blue-50'}`}>
              <span className="material-symbols-outlined select-none text-[18px]">download</span> Word
            </button>
            <button onClick={exportToCsv} title="Download CSV" className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition-all active:scale-[0.97] border cursor-pointer ${darkMode ? 'border-white/10 text-emerald-400 hover:bg-emerald-500/10' : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'}`}>
              <span className="material-symbols-outlined select-none text-[18px]">download</span> CSV
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2 lg:gap-4 flex-wrap">
          <select value={filterProperty} onChange={e => setFilterProperty(e.target.value)} className={`rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            {PROPERTIES.map(p => <option key={p} value={p}>{p || 'All Properties'}</option>)}
          </select>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className={`rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className={`rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            <option value="">All Categories</option>
            {dynamicCategories.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <button onClick={() => setShowCategoryEditor(!showCategoryEditor)} title="Manage categories" className={`rounded-xl px-2.5 py-2 text-sm border transition-all ${darkMode ? 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5' : 'border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
            <span className="material-symbols-outlined select-none text-[18px]">{showCategoryEditor ? 'close' : 'edit'}</span>
          </button>
          <span className={`text-sm self-center ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{tasks.length} tasks</span>
        </div>

        {showCategoryEditor && (
          <div className={`mt-3 p-4 rounded-2xl border ${darkMode ? 'border-white/[0.06] bg-white/[0.03]' : 'border-slate-100 bg-slate-50/50'}`}>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Manage Categories</p>
            <div className="flex gap-2 mb-3">
              <input
                type="text" value={newCategoryLabel} onChange={e => setNewCategoryLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                placeholder="New category name..."
                className={`flex-1 rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-800'}`}
              />
              <button onClick={handleAddCategory} className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500">Add</button>
            </div>
            <div className="space-y-1">
              {dynamicCategories.map(c => (
                <div key={c.key} className={`flex items-center gap-2 text-[12px] px-2 py-1 rounded-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  {editingCatKey === c.key ? (
                    <>
                      <input
                        type="text" value={editCatLabel} onChange={e => setEditCatLabel(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleUpdateCategory(c.key); if (e.key === 'Escape') setEditingCatKey(null); }}
                        autoFocus
                        className={`flex-1 rounded-lg px-2 py-1 text-xs outline-none border ${darkMode ? 'bg-slate-800 border-slate-600 text-slate-200' : 'bg-white border-slate-300 text-slate-800'}`}
                      />
                      <button onClick={() => handleUpdateCategory(c.key)} className="text-emerald-400 hover:text-emerald-300 text-[11px] font-medium">save</button>
                      <button onClick={() => setEditingCatKey(null)} className="text-slate-400 hover:text-slate-300 text-[11px] font-medium">cancel</button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1">{c.label}</span>
                      <span className="text-[10px] opacity-40">{c.key}</span>
                      <button onClick={() => { setEditingCatKey(c.key); setEditCatLabel(c.label); }} className="text-indigo-400 hover:text-indigo-300 text-[11px] font-medium">edit</button>
                      <button onClick={() => handleDeleteCategory(c.key)} className="text-rose-400 hover:text-rose-300 text-[11px] font-medium">remove</button>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
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

          <div className="grid grid-cols-7 gap-0.5 lg:gap-1">
            {Array.from({ length: firstDayOfWeek }, (_, i) => <div key={`e${i}`} className="aspect-square" />)}
            {calDays.map(d => {
              const iso = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const dayTasks = tasksByDate[iso] || [];
              const isToday = iso === todayStr;
              return (
                <div
                  key={d}
                  onClick={() => setSelectedDay(selectedDay === iso ? null : iso)}
                  className={`aspect-square rounded-lg lg:rounded-xl p-0.5 lg:p-1 flex flex-col overflow-hidden transition-all cursor-pointer ${selectedDay === iso ? (darkMode ? 'ring-2 ring-indigo-400 bg-indigo-500/10' : 'ring-2 ring-indigo-500 bg-indigo-100') : isToday ? (darkMode ? 'ring-1 ring-indigo-500/30 bg-indigo-500/5' : 'ring-1 ring-indigo-300 bg-indigo-50') : (darkMode ? 'hover:bg-white/[0.04]' : 'hover:bg-slate-50')}`}>
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
        <section className="space-y-6">
          {loading ? <p className="text-center text-slate-400 py-8">Loading...</p> : tasks.length === 0 ? <p className="text-center text-slate-400 py-8">No tasks found. Assign a task or generate from the top bar.</p> : (
            categoryGroups.map(group => {
              const isCollapsed = collapsedCategories[group.key];
              const completed = group.tasks.filter(t => t.status === 'completed' || t.status === 'cancelled').length;
              const active = group.tasks.length - completed;
              return (
                <div key={group.key}>
                  <button
                    onClick={() => toggleCategory(group.key)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${darkMode ? 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                  >
                    <span className="material-symbols-outlined select-none text-[20px] text-slate-400">{group.icon}</span>
                    <span className={`flex-1 text-left text-[14px] font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{group.label}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${darkMode ? 'bg-white/10 text-slate-300' : 'bg-slate-200 text-slate-600'}`}>{active} active</span>
                    {completed > 0 && <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${darkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-700'}`}>{completed} done</span>}
                    <span className={`material-symbols-outlined select-none text-[18px] transition-transform ${darkMode ? 'text-slate-500' : 'text-slate-400'} ${isCollapsed ? '' : 'rotate-180'}`}>expand_more</span>
                  </button>

                  {!isCollapsed && (
                    <div className="space-y-2 mt-2">
                      {group.tasks.map(task => (
                        <article key={task.id} className={`rounded-2xl border p-4 shadow-sm ${task.status === 'overdue' ? (darkMode ? 'border-red-500/20 bg-red-500/[0.03]' : 'border-red-200 bg-red-50') : (darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70')}`}>
                          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
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
                                {task.recurrenceReference && <span className="text-violet-400">{formatRecurrence(task.recurrenceReference)}</span>}
                                {task.parentTaskId && <span className="text-amber-400">Follow-up</span>}
                              </div>
                              <div className="flex gap-3 text-[10px] text-slate-500 dark:text-slate-500 mt-1 flex-wrap">
                                {task.createdByName && <span>Created by: <span className="font-medium text-slate-400">{task.createdByName}</span></span>}
                                {task.updatedByName && task.updatedByName !== task.createdByName && <span>Updated by: <span className="font-medium text-slate-400">{task.updatedByName}</span></span>}
                              </div>
                              {task.incompleteReason && <p className="text-xs text-rose-400 mt-1">Reason: {task.incompleteReason}</p>}
                              {task.completionNotes && <p className="text-xs text-emerald-400 mt-1">Notes: {task.completionNotes}</p>}
                            </div>
                            <div className="flex gap-2 flex-shrink-0 flex-wrap items-center">
                              <button onClick={() => setEditTask(task)} className="rounded-xl bg-indigo-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition-all active:scale-[0.97] border border-indigo-500/20" title="Edit task">
                                <span className="material-symbols-outlined select-none text-[14px]">edit</span>
                              </button>
                              <button onClick={() => handleDelete(task.id, task.title)} className="rounded-xl bg-rose-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-all active:scale-[0.97] border border-rose-500/20" title="Delete task">
                                <span className="material-symbols-outlined select-none text-[14px]">delete</span>
                              </button>
                              <button onClick={() => { setUpdateModal(task.id); setUpdateText(''); }} className="rounded-xl bg-cyan-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/20 transition-all active:scale-[0.97] border border-cyan-500/20" title="Add update">
                                <span className="material-symbols-outlined select-none text-[14px]">chat</span>
                              </button>
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
                          {task.updates && Array.isArray(task.updates) && task.updates.length > 0 && (
                            <div className={`mt-3 border-t pt-2 ${darkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Updates</p>
                              {task.updates.map((u, i) => (
                                <div key={i} className={`text-[11px] mb-1.5 pl-2 border-l-2 ${darkMode ? 'border-cyan-500/30 text-slate-300' : 'border-cyan-500/40 text-slate-600'}`}>
                                  <p>{u.text}</p>
                                  <p className="text-[9px] text-slate-500 dark:text-slate-500 mt-0.5">— {u.by}, {new Date(u.at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </section>
      )}

      <TaskAssignModal open={assignModal} onClose={() => setAssignModal(false)} onSave={handleAssign} darkMode={darkMode} />
      <TaskAssignModal open={!!editTask} onClose={() => setEditTask(null)} onSave={handleEdit} darkMode={darkMode} task={editTask} />

      {updateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className={`w-full max-w-sm rounded-2xl shadow-2xl border overflow-hidden ${darkMode ? 'bg-[#1c1f26] border-white/[0.08]' : 'bg-white border-slate-200'}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${darkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
              <h3 className={`text-base font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Add Update</h3>
              <button onClick={() => { setUpdateModal(null); setUpdateText(''); }} className={`w-8 h-8 rounded-lg flex items-center justify-center ${darkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                <span className="material-symbols-outlined select-none text-lg">close</span>
              </button>
            </div>
            <div className="p-5 space-y-4">
              <textarea value={updateText} onChange={e => setUpdateText(e.target.value)} rows={3} placeholder="What's the update?" className={`w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-colors resize-none ${darkMode ? 'bg-white/[0.05] border border-white/[0.08] text-slate-200 focus:border-cyan-500/40' : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-cyan-300'}`} autoFocus />
              <div className="flex gap-3">
                <button onClick={() => { setUpdateModal(null); setUpdateText(''); }} className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold border transition-colors ${darkMode ? 'border-white/[0.08] text-slate-400 hover:bg-white/[0.04]' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                  Cancel
                </button>
                <button onClick={() => handleAddUpdate(updateModal)} className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-[0.97] ${darkMode ? 'bg-cyan-600 hover:bg-cyan-500' : 'bg-slate-900 hover:bg-slate-800'}`}>
                  Add Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatRecurrence(ref) {
  if (!ref) return null;
  if (ref === 'none') return 'Once';
  const parts = ref.split(':');
  const type = parts[0];
  const count = parseInt(parts[1]) || 1;
  const unit = parts[2] || 'days';
  if (type === 'daily') return count === 1 ? 'Daily' : `Every ${count} days`;
  if (type === 'weekly') return count === 1 ? 'Weekly' : `Every ${count} weeks`;
  if (type === 'biweekly') return 'Every 2 weeks';
  if (type === 'monthly') return count === 1 ? 'Monthly' : `Every ${count} months`;
  if (type === 'custom') return `Every ${count} ${unit}`;
  return 'Recurring';
}
