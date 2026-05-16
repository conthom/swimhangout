'use client';

import { useEffect, useState, useCallback } from 'react';

const NAME_KEY = 'party_group_chat_display_name';
const POLL_MS = 2500;

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

async function fetchMessages() {
  const res = await fetch('/api/chat/messages');
  const payload = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(payload.error || 'Could not load messages');
  }
  return payload.messages || [];
}

export function GroupChat() {
  const [displayName, setDisplayName] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState(null);

  const refreshMessages = useCallback(async () => {
    try {
      const rows = await fetchMessages();
      setMessages(rows);
      setLoadError(null);
    } catch (err) {
      setLoadError(err.message || 'Could not load messages');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(NAME_KEY);
    if (saved?.trim()) setDisplayName(saved.trim());
  }, []);

  useEffect(() => {
    if (!displayName) return;

    refreshMessages();
    const interval = setInterval(refreshMessages, POLL_MS);
    return () => clearInterval(interval);
  }, [displayName, refreshMessages]);

  const saveName = (e) => {
    e.preventDefault();
    const n = nameInput.trim();
    if (!n) return;
    localStorage.setItem(NAME_KEY, n);
    setDisplayName(n);
    setNameInput('');
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !displayName) return;
    setSending(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author_name: displayName, body: text }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'Could not send message');
      }
      setDraft('');
      if (payload.message) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === payload.message.id)) return prev;
          return [...prev, payload.message];
        });
      } else {
        await refreshMessages();
      }
    } catch (err) {
      setLoadError(err.message || 'Could not send message');
    } finally {
      setSending(false);
    }
  };

  if (!displayName) {
    return (
      <div className="w-full rounded-2xl overflow-hidden border border-gray-700 bg-[#1c1c1e] shadow-xl">
        <form
          onSubmit={saveName}
          className="p-6 sm:p-8 flex flex-col gap-4"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
        >
          <p className="text-xl sm:text-2xl text-white text-center font-medium">
            who tf r u?
          </p>
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-full px-4 py-3 bg-[#2c2c2e] text-white border border-gray-600 placeholder-gray-500 focus:outline-none accent-focus"
            maxLength={40}
            autoComplete="nickname"
          />
          <button
            type="submit"
            className="rounded-full py-3 accent-bg text-white font-semibold"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-2xl overflow-hidden border border-gray-700 bg-[#000000] shadow-xl flex flex-col max-h-[min(70vh,520px)]"
      style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif' }}
    >
      <header className="shrink-0 px-4 py-3 bg-[#1c1c1e] border-b border-gray-800 flex items-center justify-between gap-2">
        <span className="text-white font-semibold text-sm sm:text-base">Group Chat</span>
        <span className="text-gray-400 text-xs truncate max-w-[50%]">{displayName}</span>
      </header>
      {loadError && (
        <div className="px-3 py-2 bg-sky-950/50 text-sky-300 text-xs border-b border-sky-900/50">
          {loadError}
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2 bg-[#000000] min-h-[200px]">
        {messages.length === 0 && !loadError && (
          <p className="text-center text-gray-500 text-sm py-8">No messages yet. Say hi.</p>
        )}
        {messages.length === 0 && loadError && (
          <p className="text-center text-gray-500 text-sm py-8">
            Messages will appear here once chat is connected.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.author_name === displayName;
          return (
            <div
              key={m.id}
              className={`flex w-full ${mine ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] sm:max-w-[75%] rounded-[1.25rem] px-4 py-2 ${
                  mine
                    ? 'accent-bg text-white rounded-br-md'
                    : 'bg-[#3a3a3c] text-white rounded-bl-md'
                }`}
              >
                {!mine && (
                  <p className="text-xs text-gray-300 font-medium mb-1">{m.author_name}</p>
                )}
                <p className="text-[15px] leading-snug whitespace-pre-wrap break-words">{m.body}</p>
                <p
                  className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-gray-400'} text-right`}
                >
                  {formatTime(m.created_at)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <form
        onSubmit={sendMessage}
        className="shrink-0 p-3 bg-[#1c1c1e] border-t border-gray-800 flex gap-2"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Message"
          className="flex-1 rounded-full px-4 py-2.5 bg-[#2c2c2e] text-white border border-gray-700 placeholder-gray-500 text-sm focus:outline-none accent-focus"
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={sending || !draft.trim()}
          className="rounded-full px-5 py-2.5 accent-bg text-white text-sm font-semibold disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </div>
  );
}
