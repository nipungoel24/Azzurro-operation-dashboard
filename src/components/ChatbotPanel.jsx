'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const CATEGORY_LABELS = {
  bathroom_deep_clean: 'Bathroom Deep Clean',
  vent_cleaning: 'Vent Cleaning',
  general_cleaning: 'General Cleaning',
  night_shift: 'Night Shift',
  cockroach_spraying: 'Cockroach Spraying',
  ac_check: 'AC Check',
  hardware_check: 'Hardware Check',
  supplies: 'Supplies',
  laundry_pod: 'Laundry Pod',
  go_key_charge: 'Go-Key Charge',
  bed_frame_check: 'Bed Frame Check',
  curtain_rod_check: 'Curtain Rod Check',
  other: 'Other',
};

export default function ChatbotPanel({ darkMode, onClose }) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();

      if (data.requiresConfirmation) {
        setPendingConfirmation({ action: data.action, params: data.params, message: data.message });
        addMessage('bot', `This action requires confirmation. Type "confirm" to proceed or "cancel" to abort.`, { confirmable: true });
      } else if (data.error) {
        addMessage('bot', data.message || data.error);
      } else {
        addMessage('bot', data.message || formatResult(data.result), { result: data.result, action: data.action });
      }
    } catch (err) {
      addMessage('bot', 'Failed to reach the assistant. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!pendingConfirmation) return;
    setLoading(true);
    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmAction: pendingConfirmation.action,
          confirmParams: pendingConfirmation.params,
        }),
      });
      const data = await res.json();
      addMessage('bot', data.message || `Executed ${pendingConfirmation.action}`);
    } catch (err) {
      addMessage('bot', 'Failed to execute the action.');
    }
    setPendingConfirmation(null);
    setLoading(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (pendingConfirmation) {
        const text = input.trim().toLowerCase();
        if (text === 'confirm') { setInput(''); handleConfirm(); }
        else if (text === 'cancel') { setInput(''); setPendingConfirmation(null); addMessage('bot', 'Action cancelled.'); }
      } else {
        handleSend();
      }
    }
  };

  return (
    <div className={`fixed bottom-20 right-6 w-[400px] h-[560px] rounded-2xl shadow-2xl border flex flex-col z-40 overflow-hidden ${darkMode ? 'bg-[#1c1f26] border-white/10' : 'bg-white border-slate-200'}`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-5 py-4 border-b shrink-0 ${darkMode ? 'border-white/10 bg-[#1c1f26]' : 'border-slate-200 bg-white'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${darkMode ? 'bg-indigo-500/15' : 'bg-indigo-100'}`}>
            <span className="material-symbols-outlined select-none text-xl text-indigo-500">smart_toy</span>
          </div>
          <div>
            <p className={`text-sm font-bold leading-tight ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>Operations Assistant</p>
            <p className={`text-[10px] font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Powered by DeepSeek</p>
          </div>
        </div>
        <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
          <span className="material-symbols-outlined select-none text-lg leading-none">close</span>
        </button>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${darkMode ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>
              <span className="material-symbols-outlined select-none text-3xl text-indigo-400">psychology</span>
            </div>
            <p className={`text-sm font-semibold mb-2 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>How can I help?</p>
            <p className={`text-xs mb-4 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Ask about rooms, tasks, scheduling, or facilities.</p>
            <div className="space-y-2 w-full">
              <ExampleChip text="Show empty rooms at Potts Point" onClick={setInput} darkMode={darkMode} />
              <ExampleChip text="Schedule bathroom deep clean tomorrow" onClick={setInput} darkMode={darkMode} />
              <ExampleChip text="What tasks are overdue?" onClick={setInput} darkMode={darkMode} />
              <ExampleChip text="Create vent cleaning for Monday" onClick={setInput} darkMode={darkMode} />
            </div>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mr-2 mt-1 ${darkMode ? 'bg-indigo-500/15' : 'bg-indigo-100'}`}>
                <span className="material-symbols-outlined select-none text-sm text-indigo-400">smart_toy</span>
              </div>
            )}
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
              msg.role === 'user'
                ? (darkMode ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-indigo-100 text-indigo-900 rounded-br-md')
                : (darkMode ? 'bg-white/5 text-slate-200 border border-white/10 rounded-bl-md' : 'bg-slate-50 text-slate-700 border border-slate-200 rounded-bl-md')
            }`}>
              {msg.role === 'bot' && msg.action ? (
                <div>
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                  {msg.result?.tasks && msg.result.tasks.length <= 8 && (
                    <div className={`mt-2 space-y-1 border-t pt-2 ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                      {msg.result.tasks.map((t, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs px-2 py-1 rounded-lg ${darkMode ? 'bg-white/5' : 'bg-white'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                            t.status === 'completed' ? 'bg-emerald-400' : t.status === 'overdue' ? 'bg-red-400' : t.status === 'incomplete' ? 'bg-rose-400' : 'bg-slate-400'
                          }`} />
                          <span className="flex-1 truncate">{t.title}</span>
                          <span className="text-[10px] opacity-60 flex-shrink-0">{t.status?.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center mr-2 mt-1 ${darkMode ? 'bg-indigo-500/15' : 'bg-indigo-100'}`}>
              <span className="material-symbols-outlined select-none text-sm text-indigo-400">smart_toy</span>
            </div>
            <div className={`rounded-2xl rounded-bl-md px-4 py-2.5 flex items-center gap-1.5 ${darkMode ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>
              <span className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-slate-500' : 'bg-slate-400'}`} style={{ animationDelay: '0ms' }} />
              <span className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-slate-500' : 'bg-slate-400'}`} style={{ animationDelay: '150ms' }} />
              <span className={`w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-slate-500' : 'bg-slate-400'}`} style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className={`p-4 border-t shrink-0 ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
        {pendingConfirmation && (
          <div className="flex items-center gap-2 mb-3">
            <div className={`flex-1 text-xs px-3 py-2 rounded-xl border ${darkMode ? 'bg-amber-500/5 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
              Type &quot;confirm&quot; or &quot;cancel&quot;
            </div>
            <button onClick={() => { setPendingConfirmation(null); addMessage('bot', 'Action cancelled.'); }} className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${darkMode ? 'border-slate-700 text-slate-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              Cancel
            </button>
            <button onClick={handleConfirm} className="px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
              Confirm
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={pendingConfirmation ? 'Type "confirm" or "cancel"...' : 'Ask about cleaning, rooms, tasks...'}
            className={`flex-1 rounded-xl px-4 py-2.5 text-sm outline-none transition-colors ${
              darkMode
                ? 'bg-white/5 text-slate-100 border-white/10 focus:border-indigo-500/50 focus:bg-white/10 border'
                : 'bg-slate-50 text-slate-900 border-slate-200 focus:border-indigo-300 focus:bg-white border'
            }`}
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
              loading || !input.trim()
                ? (darkMode ? 'bg-white/5 text-slate-600 cursor-not-allowed' : 'bg-slate-100 text-slate-400 cursor-not-allowed')
                : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            <span className="material-symbols-outlined select-none text-lg leading-none">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ExampleChip({ text, onClick, darkMode }) {
  return (
    <button
      onClick={() => onClick(text)}
      className={`block w-full text-left px-3 py-2 rounded-xl text-xs transition-colors ${
        darkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 border border-white/5' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-800 border border-slate-100'
      }`}
    >
      &quot;{text}&quot;
    </button>
  );
}

function formatResult(result) {
  if (!result) return 'Done.';
  if (typeof result === 'string') return result;
  if (result.message) return result.message;
  if (result.count !== undefined) return `${result.count} item(s) found.`;
  return 'Action completed.';
}
