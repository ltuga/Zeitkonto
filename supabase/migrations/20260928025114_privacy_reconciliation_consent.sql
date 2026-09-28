-- Server-only reconciliation capability. Never return or store the maintenance secret in app code.
create function public.zeitkonto_missing_accounts(p_ids uuid[])
returns uuid[] language plpgsql security definer set search_path='' as $$
declare supplied text; expected text; result uuid[];
begin
 supplied := coalesce(nullif(current_setting('request.headers',true),'')::jsonb->>'x-zeitkonto-maintenance','');
 select decrypted_secret into expected from vault.decrypted_secrets where name='zeitkonto_reminder_cron_token';
 if expected is null or length(expected)<32 or length(supplied)>512 or
    extensions.digest(supplied,'sha256') is distinct from extensions.digest(expected,'sha256') then
  raise exception 'Not authorized' using errcode='42501';
 end if;
 if p_ids is null or cardinality(p_ids)>100 then raise exception 'Invalid batch';end if;
 select coalesce(array_agg(id),'{}'::uuid[]) into result from unnest(p_ids) as input(id)
 where id is not null and not exists(select 1 from auth.users u where u.id=input.id and u.deleted_at is null);
 return result;
end $$;
revoke all on function public.zeitkonto_missing_accounts(uuid[]) from public,anon,authenticated;
grant execute on function public.zeitkonto_missing_accounts(uuid[]) to anon;

-- Analytics is optional, off until an explicit versioned consent is synced.
create or replace function zeitkonto_private.heartbeat(p_device uuid,p_version text,p_platform text,p_event text)
returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();begin
 if u is null then raise exception 'Authentication required' using errcode='42501';end if;
 if not exists(select 1 from public.settings where user_id=u and id='analytics' and deleted_at is null and payload='{"enabled":true,"version":"2026-09-28"}'::jsonb) then return;end if;
 if length(p_version)>32 or p_platform not in ('android','ios','web') or p_event not in ('app_open','work_entry','vacation','settings','calendar','shifts','export','sync') then raise exception 'Invalid telemetry';end if;
 update public.profiles set last_seen_at=now(),app_version=p_version,updated_at=now() where id=u and (last_seen_at is null or last_seen_at<now()-interval '5 minutes');
 if (select count(*) from public.app_events where user_id=u and event_day=current_date)>=200 then return;end if;
 insert into public.app_devices(user_id,id,payload,platform,app_version,last_seen_at) values(u,'device:'||p_device,'{}',p_platform,p_version,now()) on conflict(user_id,id) do update set platform=excluded.platform,app_version=excluded.app_version,last_seen_at=now(),updated_at=now() where app_devices.last_seen_at<now()-interval '5 minutes';
 insert into public.app_events(user_id,event_name,app_version,platform,device_id) values(u,p_event,p_version,p_platform,p_device) on conflict(user_id,event_name,event_day,device_id) do nothing;
end $$;
-- Clearing telemetry must not delete push registrations or another user's records.
create function public.zeitkonto_clear_analytics() returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();begin
 if u is null then raise exception 'Authentication required' using errcode='42501';end if;
 delete from public.app_events where user_id=u;
 delete from public.app_devices where user_id=u and id like 'device:%';
 update public.profiles set last_seen_at=null,app_version=null where id=u;
end $$;
revoke all on function public.zeitkonto_clear_analytics() from public,anon,authenticated;
grant execute on function public.zeitkonto_clear_analytics() to authenticated;
