'use client';

import React, { useState, useEffect } from 'react';

export default function ActivityHistory({ darkMode }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterEntityType, setFilterEntityType] = useState('');
  const [filterSource, setFilterSource] = useState('');

  const SOURCES = ['', 'ui', 'chatbot', 'cloudbeds_sync', 'scheduler', 'cron', 'system', 'revert'];
  const ENTITY_TYPES = ['', 'task', 'facility', 'scheduled_task', 'property', 'shift_handoff', 'chatbot', 'cloudbeds_sync'];

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filterEntityType) params.set('entityType', filterEntityType);
      if (filterSource) params.set('source', filterSource);
      params.set('limit', '100');

      const res = await fetch(`/api/audit-logs?${params}`);
      const data = await res.json();
      if (Array.isArray(data)) setLogs(data);
    } catch (err) {
      console.error('Failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function load() {
      await fetchLogs();
    }
    load();
  }, []);
  useEffect(() => {
    async function load() {
      await fetchLogs();
    }
    load();
  }, [filterEntityType, filterSource]);

  const handleRevert = async (log) => {
    if (!confirm(`Revert this change: "${log.summary || log.action}"?`)) return;
    try {
      const res = await fetch('/api/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auditLogId: log.id }),
      });
      const data = await res.json();
      alert(data.success ? 'Change reverted successfully.' : `Revert failed: ${data.error}`);
      fetchLogs();
    } catch (err) {
      alert('Failed to revert: ' + err.message);
    }
  };

  const handleBatchRevert = async (batchId) => {
    if (!confirm(`Revert all changes in batch ${batchId}?`)) return;
    try {
      const res = await fetch('/api/revert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId }),
      });
      const data = await res.json();
      alert(data.success ? `Reverted ${data.results?.filter(r => r.status === 'reverted').length || 0} changes.` : 'Failed');
      fetchLogs();
    } catch (err) {
      alert('Failed: ' + err.message);
    }
  };

  const isRevertible = (log) => {
    if (log.revertedAuditId) return false;
    if (log.action === 'DELETE' || log.action === 'REVERT' || log.action === 'BATCH_REVERT') return false;
    return ['facility', 'scheduled_task'].includes(log.entityType);
  };

  return (
    <div className="space-y-6">
      <section className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl md:p-6 ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
        <div>
          <h3 className="text-2xl font-black font-serif-display tracking-tight text-slate-900 dark:text-slate-100">
            Activity History
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Complete audit trail of all changes. Eligible changes can be reverted.
          </p>
        </div>
        <div className="mt-4 flex gap-4 flex-wrap">
          <select value={filterEntityType} onChange={e => setFilterEntityType(e.target.value)} className={`rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            {ENTITY_TYPES.map(t => <option key={t} value={t}>{t || 'All Types'}</option>)}
          </select>
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className={`rounded-xl px-3 py-2 text-sm outline-none border ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}>
            {SOURCES.map(s => <option key={s} value={s}>{s || 'All Sources'}</option>)}
          </select>
        </div>
      </section>

      {loading ? (
        <p className="text-center text-slate-400 py-8">Loading history...</p>
      ) : (
        <section className="space-y-2">
          {logs.map(log => (
            <article key={log.id} className={`rounded-xl border p-3 text-sm ${log.revertedAuditId ? (darkMode ? 'border-rose-500/20 bg-rose-500/5' : 'border-rose-200 bg-rose-50') : (darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70')}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>{log.entityType}</span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{log.summary || log.action}</span>
                    {log.revertedAuditId && <span className="text-[10px] text-rose-400">Reverted</span>}
                  </div>
                  <div className="flex gap-3 text-[10px] text-slate-400 mt-1">
                    <span>{log.changedByEmail || log.changed_by_email || 'system'}</span>
                    <span>Source: {log.source || log.action_type || 'unknown'}</span>
                    <span>{new Date(log.createdAt || log.timestamp).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {isRevertible(log) && (
                    <button onClick={() => handleRevert(log)} className="rounded-lg bg-indigo-500/10 px-2 py-1 text-[10px] font-bold text-indigo-400 hover:bg-indigo-500/20">Revert</button>
                  )}
                  {log.batchId && (
                    <button onClick={() => handleBatchRevert(log.batchId)} className="rounded-lg bg-amber-500/10 px-2 py-1 text-[10px] font-bold text-amber-400 hover:bg-amber-500/20">Batch</button>
                  )}
                </div>
              </div>
            </article>
          ))}
          {logs.length === 0 && <p className="text-center text-slate-400 py-8">No audit entries found.</p>}
        </section>
      )}
    </div>
  );
}
