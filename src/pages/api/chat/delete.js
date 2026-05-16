import { createSupabaseServerClient } from '../../../lib/supabase/server';
import { CHAT_ADMIN_SECRET } from '../../../lib/chatAdmin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, secret } = req.body || {};
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing id' });
  }
  if (secret !== CHAT_ADMIN_SECRET) {
    return res.status(401).json({ error: 'Invalid admin secret' });
  }

  try {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.from('party_chat').delete().eq('id', id);
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Delete failed' });
  }
}
