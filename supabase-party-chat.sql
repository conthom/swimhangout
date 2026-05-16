-- Run in Supabase SQL Editor (Dashboard → SQL → New query) on a fresh project.
-- Optional: Database → Replication → add `party_chat` to supabase_realtime for live chat.

-- RSVP submissions
create table if not exists public.party_invites (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  guests integer not null default 1 check (guests >= 1 and guests <= 20),
  message text,
  attending_hangout boolean not null default false,
  attending_swim boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.party_invites enable row level security;

drop policy if exists "party_invites_select_all" on public.party_invites;
create policy "party_invites_select_all"
  on public.party_invites for select
  to anon, authenticated
  using (true);

drop policy if exists "party_invites_insert_all" on public.party_invites;
create policy "party_invites_insert_all"
  on public.party_invites for insert
  to anon, authenticated
  with check (true);

-- Group chat
create table if not exists public.party_chat (
  id uuid primary key default gen_random_uuid(),
  author_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.party_chat enable row level security;

drop policy if exists "party_chat_select_all" on public.party_chat;
create policy "party_chat_select_all"
  on public.party_chat for select
  to anon, authenticated
  using (true);

drop policy if exists "party_chat_insert_all" on public.party_chat;
create policy "party_chat_insert_all"
  on public.party_chat for insert
  to anon, authenticated
  with check (true);

-- Admin deletes use delete_party_chat_message() (see supabase-party-chat-delete.sql).

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

-- If you already created party_chat but not party_invites, you can run only the party_invites block above.
