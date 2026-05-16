-- Run once in Supabase → SQL Editor (fixes admin delete not persisting).
-- Creates a security-definer function so deletes work without a service-role key.

create or replace function public.delete_party_chat_message(msg_id uuid, admin_key text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if admin_key is distinct from 'CINNAMON' then
    raise exception 'Invalid admin secret';
  end if;

  delete from public.party_chat where id = msg_id;
  return found;
end;
$$;

revoke all on function public.delete_party_chat_message(uuid, text) from public;
grant execute on function public.delete_party_chat_message(uuid, text) to anon, authenticated;
