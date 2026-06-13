drop policy if exists "visitors can record share events" on public.share_events;
revoke all on public.share_events from anon, authenticated;

alter table public.share_events
  drop constraint if exists share_events_event_type_check;

update public.share_events
set event_type = case event_type
  when 'result_opened' then 'result_open'
  when 'share_clicked' then 'share_click'
  else event_type
end
where event_type in ('result_opened', 'share_clicked');

alter table public.share_events
  add constraint share_events_event_type_check
  check (event_type in ('result_open', 'share_click'));

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
