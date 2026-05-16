'use client';

import { useCallback, useEffect, useState } from 'react';
import { CHAT_ADMIN_SECRET } from '../lib/chatAdmin';
import { getSupabase } from '../lib/supabase';

export default function AdminPage() {
  const [invites, setInvites] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatActionId, setChatActionId] = useState(null);
  const [chatError, setChatError] = useState(null);

  const fetchInvites = useCallback(async () => {
    const { data, error } = await getSupabase()
      .from('party_invites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    setInvites(data || []);
  }, []);

  const fetchChat = useCallback(async () => {
    setChatError(null);
    const res = await fetch('/api/chat/messages');
    const payload = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(payload.error || 'Could not load chat');
    }
    const rows = payload.messages || [];
    setChatMessages([...rows].reverse());
  }, []);

  useEffect(() => {
    async function load() {
      try {
        await fetchInvites();
      } catch (error) {
        console.error('Error loading invites:', error);
      }
      try {
        await fetchChat();
      } catch (error) {
        console.error('Error loading chat:', error);
        setChatError(
          'Could not load chat messages. Run supabase-party-chat.sql in Supabase if you have not yet.'
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [fetchInvites, fetchChat]);

  async function deleteChatMessage(id) {
    setChatError(null);
    setChatActionId(id);
    try {
      const res = await fetch('/api/chat/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, secret: CHAT_ADMIN_SECRET }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(payload.error || 'Delete failed');
      }
      setChatMessages((prev) => prev.filter((m) => m.id !== id));
    } catch (e) {
      setChatError(e.message || 'Could not delete message');
    } finally {
      setChatActionId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-white text-2xl mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  function rsvpTags(invite) {
    const h = invite.attending_hangout ? 'Hangout' : null;
    const s = invite.attending_swim ? 'Swim' : null;
    const parts = [h, s].filter(Boolean);
    return parts.length ? parts.join(' + ') : '—';
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <h1 className="text-white text-2xl">Admin</h1>

        <section>
          <h2 className="text-white text-xl mb-4">Party RSVP Submissions</h2>
          <div className="bg-gray-900/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-white text-sm">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">RSVP</th>
                    <th className="px-6 py-3 text-left">Guests</th>
                    <th className="px-6 py-3 text-left">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {invites.map((invite) => (
                    <tr key={invite.id} className="hover:bg-gray-800/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(invite.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">{invite.name}</td>
                      <td className="px-6 py-4">{invite.email || '—'}</td>
                      <td className="px-6 py-4">{rsvpTags(invite)}</td>
                      <td className="px-6 py-4">{invite.guests}</td>
                      <td className="px-6 py-4 max-w-xs break-words">{invite.message || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-700 text-white text-sm">
              Total RSVPs: {invites.length} | Total guests:{' '}
              {invites.reduce((sum, invite) => sum + Number(invite.guests || 0), 0)}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-white text-xl mb-4">Group chat</h2>
          {chatError && (
            <div className="mb-4 text-sm text-sky-300 bg-sky-950/50 border border-sky-900 rounded-lg px-4 py-2">
              {chatError}
            </div>
          )}
          <div className="bg-gray-900/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
              <table className="w-full text-white text-sm">
                <thead className="bg-gray-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">From</th>
                    <th className="px-4 py-3 text-left">Message</th>
                    <th className="px-4 py-3 text-left w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {chatMessages.map((row) => (
                    <tr key={row.id}>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-300">
                        {new Date(row.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">{row.author_name}</td>
                      <td className="px-4 py-3 max-w-md break-words whitespace-pre-wrap">
                        {row.body}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          disabled={chatActionId === row.id}
                          onClick={() => deleteChatMessage(row.id)}
                          className="text-sky-400 hover:text-sky-300 text-xs disabled:opacity-40"
                        >
                          {chatActionId === row.id ? 'Deleting…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-700 text-white text-sm">
              Messages: {chatMessages.length}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
