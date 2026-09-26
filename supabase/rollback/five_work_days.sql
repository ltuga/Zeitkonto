create or replace function zeitkonto_private.refresh_balances(u uuid,d date) returns void language plpgsql set search_path='' as $$
declare init numeric; extras numeric; used numeric; reserved numeric;
begin
 select coalesce((payload#>>'{}')::numeric*60,0) into init from public.settings where user_id=u and id='initial' and deleted_at is null;
 select coalesce(sum(overtime_minutes),0) into extras from public.work_entries where user_id=u and deleted_at is null and work_date<=d::text;
 select coalesce(sum(greatest(0,-(payload->>'delta')::numeric)) filter(where vacation_date<=d::text),0),coalesce(sum(greatest(0,-(payload->>'delta')::numeric)) filter(where vacation_date>d::text),0) into used,reserved from public.vacations where user_id=u and deleted_at is null and kind='rest';
 insert into public.time_balance(user_id,initial_minutes,worked_overtime_minutes,used_minutes,reserved_minutes,current_minutes,available_minutes,as_of_date)
 values(u,coalesce(init,0),extras,used,reserved,coalesce(init,0)+extras-used,coalesce(init,0)+extras-used-reserved,d)
 on conflict(user_id) do update set initial_minutes=excluded.initial_minutes,worked_overtime_minutes=excluded.worked_overtime_minutes,used_minutes=excluded.used_minutes,reserved_minutes=excluded.reserved_minutes,current_minutes=excluded.current_minutes,available_minutes=excluded.available_minutes,as_of_date=d,updated_at=now();
 delete from public.vacation_balance where user_id=u;
 insert into public.vacation_balance(user_id,year,entitlement_days,used_days,reserved_days,available_days,as_of_date)
 select u,y.yr,e.entitlement,coalesce(v.used,0),coalesce(v.reserved,0),e.entitlement-coalesce(v.used,0)-coalesce(v.reserved,0),d from
 (select substring(id from 13)::integer as yr from public.settings where user_id=u and id ~ '^entitlement:[0-9]{4}$' and deleted_at is null
 union select substring(vacation_date from 1 for 4)::integer from public.vacations where user_id=u and deleted_at is null and kind='holiday') y
 left join lateral(select (payload#>>'{}')::numeric entitlement from public.settings where user_id=u and id='entitlement:'||y.yr and deleted_at is null)e on true
 left join lateral(select sum(zeitkonto_private.holiday_days(payload)) filter(where vacation_date<=d::text) used,sum(zeitkonto_private.holiday_days(payload)) filter(where vacation_date>d::text) reserved from public.vacations where user_id=u and deleted_at is null and kind='holiday' and substring(vacation_date from 1 for 4)::integer=y.yr)v on true;
end $$;
revoke all on function zeitkonto_private.refresh_balances(uuid,date) from public,anon,authenticated;
