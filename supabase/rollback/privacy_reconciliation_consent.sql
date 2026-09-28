-- Roll back only together with the matching app version. Restores the old telemetry policy.
begin;
drop function public.zeitkonto_missing_accounts(uuid[]);
drop function public.zeitkonto_clear_analytics();
drop function if exists zeitkonto_private.zeitkonto_missing_accounts(uuid[]);
drop function if exists zeitkonto_private.zeitkonto_clear_analytics();
revoke usage on schema zeitkonto_private from anon;
create or replace function zeitkonto_private.heartbeat(p_device uuid,p_version text,p_platform text,p_event text) returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();begin
 if u is null then raise exception 'Authentication required' using errcode='42501';end if;
 if length(p_version)>32 or p_platform not in ('android','ios','web') or p_event not in ('app_open','work_entry','vacation','settings','calendar','shifts','export','sync') then raise exception 'Invalid telemetry';end if;
 update public.profiles set last_seen_at=now(),app_version=p_version,updated_at=now() where id=u and (last_seen_at is null or last_seen_at<now()-interval '5 minutes');
 if (select count(*) from public.app_events where user_id=u and event_day=current_date)>=200 then return;end if;
 insert into public.app_devices(user_id,id,payload,platform,app_version,last_seen_at) values(u,'device:'||p_device,'{}',p_platform,p_version,now()) on conflict(user_id,id) do update set platform=excluded.platform,app_version=excluded.app_version,last_seen_at=now(),updated_at=now() where app_devices.last_seen_at<now()-interval '5 minutes';
 insert into public.app_events(user_id,event_name,app_version,platform,device_id) values(u,p_event,p_version,p_platform,p_device) on conflict(user_id,event_name,event_day,device_id) do nothing;
end $$;
commit;
