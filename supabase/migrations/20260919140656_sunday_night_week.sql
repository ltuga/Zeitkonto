-- Raw daily delta is retained; the weekly bonus is derived at every sync.
create or replace function zeitkonto_private.refresh_balances(u uuid,d date) returns void language plpgsql set search_path='' as $$
declare init numeric; extras numeric; used numeric; reserved numeric;
begin
 select coalesce((payload#>>'{}')::numeric*60,0) into init from public.settings where user_id=u and id='initial' and deleted_at is null;
 with work_weeks as (
 select date_trunc('week',work_date::date + case when extract(isodow from work_date::date)=7 and (payload->>'end') < (payload->>'start') then 1 else 0 end) as week,
 sum(greatest(0,coalesce((payload->>'targetMinutes')::numeric,480)+overtime_minutes)) as worked
 from public.work_entries where user_id=u and deleted_at is null and work_date<=d::text group by 1
 ), justified_weeks as (
 select date_trunc('week',vacation_date::date) as week,
 least(2400,sum(case
 when kind in ('sick_note','sick_no_note') then 480
 when kind='holiday' then case when payload->>'holidayMode'='half' then 240 when payload->>'holidayMode'='hours' then least(480,coalesce((payload->>'holidayMinutes')::numeric,0)) else 480 end
 when kind='rest' then least(480,greatest(0,-(payload->>'delta')::numeric)) else 0 end)) as justified
 from public.vacations where user_id=u and deleted_at is null and vacation_date<=d::text group by 1
 )
 select coalesce(sum(greatest(0,w.worked+coalesce(j.justified,0)-2400)),0) into extras
 from work_weeks w left join justified_weeks j using(week);
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
