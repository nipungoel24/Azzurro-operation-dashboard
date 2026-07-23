'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function ChatbotPanel({ darkMode, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const addMessage = (role, text, extra = null) => {
    setMessages(prev => [...prev, { role, text, id: Date.now(), ...extra }]);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setMessages(prev => [...prev, { role: 'user', text, id: Date.now() }]);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      if (data.requiresConfirmation) {
        setPendingConfirmation({ action: data.action, params: data.params });
        addMessage('bot', 'This action needs confirmation.', { confirmable: true });
      } else if (data.error) {
        addMessage('bot', data.message || 'An error occurred.');
      } else {
        addMessage('bot', data.message, { result: data.result, action: data.action });
      }
    } catch {
      addMessage('bot', 'Unable to reach assistant. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!pendingConfirmation) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmAction: pendingConfirmation.action, confirmParams: pendingConfirmation.params }),
      });
      const data = await res.json();
      addMessage('bot', data.message || 'Done.', { result: data.result });
    } catch {
      addMessage('bot', 'Failed to confirm.');
    }
    setPendingConfirmation(null);
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (pendingConfirmation) {
        const v = input.trim().toLowerCase();
        if (v === 'confirm') { setInput(''); handleConfirm(); }
        else if (v === 'cancel') { setInput(''); setPendingConfirmation(null); addMessage('bot', 'Cancelled.'); }
      } else {
        handleSend();
      }
    }
  };

  const chip = darkMode
    ? 'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-slate-200 border border-white/[0.06] transition-all duration-150 cursor-pointer'
    : 'w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-100 transition-all duration-150 cursor-pointer';

  return (
    <div className={`fixed bottom-20 right-6 w-[400px] h-[560px] rounded-2xl shadow-2xl border flex flex-col z-40 overflow-hidden ${darkMode ? 'bg-[#1c1f26] border-white/[0.08]' : 'bg-white border-slate-200'}`}>

      <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${darkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${darkMode ? 'bg-indigo-500/15' : 'bg-indigo-50'}`}>
            <span className="material-symbols-outlined select-none text-lg text-indigo-500">smart_toy</span>
          </div>
          <div>
            <p className={`text-[13px] font-semibold leading-tight ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Assistant</p>
            <p className={`text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>DeepSeek</p>
          </div>
        </div>
        <button onClick={onClose} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-white/10 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}>
          <span className="material-symbols-outlined select-none text-base">close</span>
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
              <span className="material-symbols-outlined select-none text-2xl text-indigo-400">psychology</span>
            </div>
            <p className={`text-sm font-semibold mb-1 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>How can I help?</p>
            <p className={`text-[11px] mb-5 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Ask about rooms, tasks, scheduling, or facilities</p>
            <div className="space-y-2 w-full">
              <button onClick={() => setInput('Show empty rooms at Potts Point')} className={chip}>Show empty rooms at Potts Point</button>
              <button onClick={() => setInput('Schedule bathroom deep clean tomorrow')} className={chip}>Schedule bathroom deep clean tomorrow</button>
              <button onClick={() => setInput('What tasks are overdue?')} className={chip}>What tasks are overdue?</button>
              <button onClick={() => setInput('Create vent cleaning for Monday')} className={chip}>Create vent cleaning for Monday</button>
            </div>
          </div>
        ) : (
          messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'bot' && (
                <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mr-2 mt-1.5 ${darkMode ? 'bg-indigo-500/15' : 'bg-indigo-100'}`}>
                  <span className="material-symbols-outlined select-none text-xs text-indigo-400">smart_toy</span>
                </div>
              )}
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                msg.role === 'user'
                  ? (darkMode ? 'bg-indigo-600 text-white rounded-br-lg' : 'bg-indigo-50 text-indigo-900 rounded-br-lg')
                  : (darkMode ? 'bg-white/[0.04] text-slate-200 border border-white/[0.06] rounded-bl-lg' : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-bl-lg')
              }`}>
                {msg.role === 'bot' ? <BotMessage msg={msg} darkMode={darkMode} /> : <p className="whitespace-pre-wrap">{msg.text}</p>}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center mr-2 mt-1.5 ${darkMode ? 'bg-indigo-500/15' : 'bg-indigo-100'}`}>
              <span className="material-symbols-outlined select-none text-xs text-indigo-400">smart_toy</span>
            </div>
            <div className={`rounded-2xl rounded-bl-lg px-4 py-2.5 ${darkMode ? 'bg-white/[0.04] border border-white/[0.06]' : 'bg-slate-50 border border-slate-100'}`}>
              <div className="flex gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
                <span className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
                <span className={`w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-slate-600' : 'bg-slate-300'}`} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={`p-4 border-t shrink-0 ${darkMode ? 'border-white/[0.06]' : 'border-slate-100'}`}>
        {pendingConfirmation && (
          <div className="flex items-center gap-2 mb-3">
            <span className={`flex-1 text-[11px] px-3 py-2 rounded-xl border font-medium ${darkMode ? 'bg-amber-500/[0.06] border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
              Type confirm to proceed or cancel to abort
            </span>
            <button
              onClick={() => { setPendingConfirmation(null); addMessage('bot', 'Cancelled.'); }}
              className={`shrink-0 px-3 py-2 rounded-xl text-[11px] font-semibold border transition-all duration-150 ${darkMode ? 'border-white/[0.08] text-slate-400 hover:bg-white/[0.05] hover:text-slate-200' : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="shrink-0 px-4 py-2 rounded-xl text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-500 transition-all duration-150 active:scale-[0.97]"
            >
              Confirm
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={pendingConfirmation ? 'Type confirm or cancel...' : 'Message...'}
            className={`flex-1 rounded-xl px-4 py-2.5 text-[13px] outline-none transition-all duration-150 ${
              darkMode
                ? 'bg-white/[0.04] text-slate-200 placeholder:text-slate-600 border border-white/[0.08] focus:border-indigo-500/40'
                : 'bg-slate-50 text-slate-800 placeholder:text-slate-400 border border-slate-200 focus:border-indigo-300'
            }`}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-150 active:scale-[0.95] ${
              loading || !input.trim()
                ? (darkMode ? 'bg-white/[0.04] text-slate-700 cursor-not-allowed border border-white/[0.04]' : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-100')
                : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-500/20'
            }`}
          >
            <span className="material-symbols-outlined select-none text-lg">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function BotMessage({ msg, darkMode }) {
  const r = msg.result;
  const line = darkMode ? 'border-white/[0.06]' : 'border-slate-100';
  const row = darkMode ? 'bg-white/[0.03]' : 'bg-white/80';

  return (
    <div>
      {msg.text && <p className="whitespace-pre-line leading-relaxed text-[13px]">{msg.text}</p>}

      {r?.tasks && r.tasks.length > 0 && (
        <div className={`mt-2.5 space-y-0.5 ${msg.text ? `border-t pt-2.5 ${line}` : ''}`}>
          {r.tasks.slice(0, 10).map((t, i) => (
            <div key={i} className={`flex items-center gap-2.5 text-[11px] px-2.5 py-1.5 rounded-lg ${row}`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${t.status === 'completed' ? 'bg-emerald-400' : t.status === 'overdue' ? 'bg-red-400' : t.status === 'incomplete' ? 'bg-rose-400' : t.status === 'in_progress' ? 'bg-amber-400' : 'bg-slate-400'}`} />
              <span className="flex-1 truncate font-medium">{t.title}</span>
              {t.assigneeName && <span className="text-[10px] opacity-40 shrink-0">{t.assigneeName}</span>}
            </div>
          ))}
          {r.tasks.length > 10 && <p className="text-[10px] opacity-40 px-2.5 pt-1">+{r.tasks.length - 10} more</p>}
        </div>
      )}

      {r?.bathrooms && r.bathrooms.length > 0 && (
        <div className={`mt-2.5 space-y-0.5 ${msg.text ? `border-t pt-2.5 ${line}` : ''}`}>
          {r.bathrooms.slice(0, 8).map((b, i) => (
            <div key={i} className={`flex items-center gap-2.5 text-[11px] px-2.5 py-1.5 rounded-lg ${row}`}>
              <span className="material-symbols-outlined select-none text-xs opacity-40 shrink-0">shower</span>
              <span className="flex-1">{b.name}</span>
              <span className="text-[10px] opacity-40 shrink-0">{b.propertyCode || ''}</span>
            </div>
          ))}
        </div>
      )}

      {r?.rooms && r.rooms.length > 0 && (
        <div className={`mt-2.5 space-y-0.5 ${msg.text ? `border-t pt-2.5 ${line}` : ''}`}>
          {r.rooms.slice(0, 8).map((rm, i) => (
            <div key={i} className={`flex items-center gap-2.5 text-[11px] px-2.5 py-1.5 rounded-lg ${row}`}>
              <span className="material-symbols-outlined select-none text-xs opacity-40 shrink-0">door_front</span>
              <span className="flex-1">Room {rm.roomNumber}</span>
              <span className="text-[10px] opacity-40 shrink-0">{rm.roomType || ''}</span>
            </div>
          ))}
        </div>
      )}

      {r?.task && !r?.tasks && (
        <div className={`mt-2.5 border-t pt-2.5 flex items-center gap-2.5 text-[11px] ${line}`}>
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${r.task.status === 'completed' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
          <span className="font-medium">{r.task.title}</span>
        </div>
      )}
    </div>
  );
}
