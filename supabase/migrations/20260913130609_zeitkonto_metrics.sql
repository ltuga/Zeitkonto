alter table public.work_entries add column credited_minutes numeric generated always as ((payload->>'targetMinutes')::numeric+(payload->>'delta')::numeric) stored,
 add column worked_minutes numeric generated always as ((payload->>'targetMinutes')::numeric+(payload->>'delta')::numeric-least((payload->>'pause')::numeric,(payload->>'includedPause')::numeric)) stored;
alter table public.app_devices add column platform text check(platform in ('android','ios','web')),
 add column app_version text check(length(app_version)<=32),add column last_seen_at timestamptz;
create or replace function zeitkonto_private.heartbeat(p_device uuid,p_version text,p_platform text,p_event text) returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();begin
 if u is null then raise exception 'Authentication required' using errcode='42501';end if;
 if length(p_version)>32 or p_platform not in ('android','ios','web') or p_event not in ('app_open','work_entry','vacation','settings','calendar','shifts','export','sync') then raise exception 'Invalid telemetry';end if;
 update public.profiles set last_seen_at=now(),app_version=p_version,updated_at=now() where id=u and (last_seen_at is null or last_seen_at<now()-interval '5 minutes');
 if (select count(*) from public.app_events where user_id=u and event_day=current_date)>=200 then return;end if;
 insert into public.app_devices(user_id,id,payload,platform,app_version,last_seen_at) values(u,'device:'||p_device,'{}',p_platform,p_version,now()) on conflict(user_id,id) do update set platform=excluded.platform,app_version=excluded.app_version,last_seen_at=now(),updated_at=now() where app_devices.last_seen_at<now()-interval '5 minutes';
 insert into public.app_events(user_id,event_name,app_version,platform,device_id) values(u,p_event,p_version,p_platform,p_device) on conflict(user_id,event_name,event_day,device_id) do nothing;
end $$;
-- Entitlements are derived only from server-verified purchases; no client grants can write them.
alter table public.subscriptions add constraint verified_premium check(plan<>'premium' or status not in ('active','grace_period') or verified_at is not null);
create function zeitkonto_private.refresh_plan() returns trigger language plpgsql security definer set search_path='' as $$
declare u uuid:=coalesce(new.user_id,old.user_id);until_at timestamptz;entitled boolean;begin
 select count(*)>0,case when bool_or(billing_period='lifetime' and expires_at is null) then null else max(expires_at) end into entitled,until_at from public.subscriptions where user_id=u and plan='premium' and verified_at is not null and status in ('active','grace_period','cancelled') and ((billing_period='lifetime' and expires_at is null) or expires_at>now());
 update public.profiles set plan=case when entitled then 'premium' else 'basic' end,premium_until=case when entitled then until_at else null end,updated_at=now() where id=u;return coalesce(new,old);end $$;
revoke all on function zeitkonto_private.refresh_plan() from public,anon,authenticated;
create trigger refresh_plan after insert or update or delete on public.subscriptions for each row execute function zeitkonto_private.refresh_plan();
select cron.schedule('zeitkonto-plan-expiry','23 * * * *',$job$update public.profiles set plan='basic',premium_until=null,updated_at=now() where plan='premium' and premium_until<=now()$job$);
