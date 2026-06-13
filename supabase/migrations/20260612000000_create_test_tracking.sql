create table if not exists public.test_sessions (
  id uuid primary key,
  owner_id uuid not null default auth.uid(),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed')),
  total_rounds smallint not null default 10 check (total_rounds > 0),
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.test_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.test_sessions(id) on delete cascade,
  event_id text not null,
  round_index smallint not null check (round_index > 0),
  answer_type text not null
    check (answer_type in ('firstReaction', 'label', 'response', 'attribution')),
  selected_option_id text not null,
  state_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (session_id, event_id, round_index, answer_type)
);

create table if not exists public.test_results (
  result_id uuid primary key,
  session_id uuid not null unique references public.test_sessions(id) on delete cascade,
  report_data jsonb not null,
  final_state jsonb not null,
  completed_rounds smallint not null check (completed_rounds > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.share_events (
  id uuid primary key default gen_random_uuid(),
  client_event_id uuid not null unique,
  result_id uuid not null references public.test_results(result_id) on delete cascade,
  event_type text not null
    check (event_type in ('result_open', 'share_click')),
  occurred_at timestamptz not null default now()
);

create index if not exists test_answers_session_round_idx
  on public.test_answers (session_id, round_index);
create index if not exists share_events_result_type_idx
  on public.share_events (result_id, event_type);

alter table public.test_sessions enable row level security;
alter table public.test_answers enable row level security;
alter table public.test_results enable row level security;
alter table public.share_events enable row level security;

create policy "owners can create test sessions"
  on public.test_sessions for insert to authenticated
  with check (owner_id = (select auth.uid()));

create policy "owners can read test sessions"
  on public.test_sessions for select to authenticated
  using (owner_id = (select auth.uid()));

create policy "owners can update test sessions"
  on public.test_sessions for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "owners can write test answers"
  on public.test_answers for insert to authenticated
  with check (
    exists (
      select 1
      from public.test_sessions
      where test_sessions.id = test_answers.session_id
        and test_sessions.owner_id = (select auth.uid())
    )
  );

create policy "owners can update test answers"
  on public.test_answers for update to authenticated
  using (
    exists (
      select 1
      from public.test_sessions
      where test_sessions.id = test_answers.session_id
        and test_sessions.owner_id = (select auth.uid())
    )
  );

create policy "owners can read test answers"
  on public.test_answers for select to authenticated
  using (
    exists (
      select 1
      from public.test_sessions
      where test_sessions.id = test_answers.session_id
        and test_sessions.owner_id = (select auth.uid())
    )
  );

create policy "owners can write test results"
  on public.test_results for insert to authenticated
  with check (
    exists (
      select 1
      from public.test_sessions
      where test_sessions.id = test_results.session_id
        and test_sessions.owner_id = (select auth.uid())
    )
  );

create policy "owners can update test results"
  on public.test_results for update to authenticated
  using (
    exists (
      select 1
      from public.test_sessions
      where test_sessions.id = test_results.session_id
        and test_sessions.owner_id = (select auth.uid())
    )
  );

create policy "owners can read test results"
  on public.test_results for select to authenticated
  using (
    exists (
      select 1
      from public.test_sessions
      where test_sessions.id = test_results.session_id
        and test_sessions.owner_id = (select auth.uid())
    )
  );

grant select, insert, update on public.test_sessions to authenticated;
grant select, insert, update on public.test_answers to authenticated;
grant select, insert, update on public.test_results to authenticated;
revoke all on public.share_events from anon, authenticated;

create or replace function public.get_public_test_result(
  requested_result_id uuid
)
returns table (
  result_id uuid,
  report_data jsonb,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    test_results.result_id,
    test_results.report_data,
    test_results.created_at
  from public.test_results
  where test_results.result_id = requested_result_id
  limit 1;
$$;

revoke all on function public.get_public_test_result(uuid) from public;
grant execute on function public.get_public_test_result(uuid) to anon, authenticated;

create or replace function public.track_share_event(
  p_client_event_id uuid,
  p_result_id uuid,
  p_event_type text
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if p_event_type not in ('result_open', 'share_click') then
    raise exception 'Unsupported share event type'
      using errcode = '22023';
  end if;

  insert into public.share_events (
    client_event_id,
    result_id,
    event_type
  )
  values (
    p_client_event_id,
    p_result_id,
    p_event_type
  )
  on conflict (client_event_id) do nothing;
end;
$$;

revoke all on function public.track_share_event(uuid, uuid, text) from public;
grant execute on function public.track_share_event(uuid, uuid, text) to anon, authenticated;
