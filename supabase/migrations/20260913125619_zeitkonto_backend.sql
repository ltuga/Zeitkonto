-- Zeitkonto: additive schema, no authentication records altered or deleted.
create schema if not exists zeitkonto_private;
revoke all on schema zeitkonto_private from public, anon;
grant usage on schema zeitkonto_private to authenticated;
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text check(length(display_name)<=100),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 last_seen_at timestamptz, app_version text, plan text not null default 'basic' check(plan in ('basic','premium')),
 premium_until timestamptz
);
create table public.work_entries (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 2000), payload jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 deleted_at timestamptz, mutation_id text not null default '', primary key(user_id,id)
);
create table public.vacations (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 2000), payload jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 deleted_at timestamptz, mutation_id text not null default '', primary key(user_id,id)
);
create table public.settings (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 2000), payload jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 deleted_at timestamptz, mutation_id text not null default '', primary key(user_id,id)
);
create table public.app_devices (
 user_id uuid not null references auth.users(id) on delete cascade,
 id text not null check(length(id) between 1 and 2000), payload jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 deleted_at timestamptz, mutation_id text not null default '', primary key(user_id,id)
);
alter table public.work_entries add column work_date text generated always as (payload->>'date') stored,
 add column clock_in text generated always as (payload->>'start') stored,
 add column clock_out text generated always as (payload->>'end') stored,
 add column pause_minutes numeric generated always as ((payload->>'pause')::numeric) stored,
 add column overtime_minutes numeric generated always as ((payload->>'delta')::numeric) stored,
 add column target_minutes integer generated always as ((payload->>'targetMinutes')::integer) stored;
alter table public.vacations add column vacation_date text generated always as (payload->>'date') stored,
 add column kind text generated always as (payload->>'kind') stored,
 add column duration_mode text generated always as (coalesce(payload->>'holidayMode','full')) stored,
 add column duration_minutes numeric generated always as (case when payload->>'kind'='holiday' then case when payload->>'holidayMode' in ('half','company_half') then (payload->>'targetMinutes')::numeric/2 when payload->>'holidayMode'='hours' then (payload->>'holidayMinutes')::numeric else (payload->>'targetMinutes')::numeric end else 0 end) stored;
create table public.time_balance (
 user_id uuid primary key references auth.users(id) on delete cascade,
 initial_minutes numeric not null default 0, worked_overtime_minutes numeric not null default 0,
 used_minutes numeric not null default 0, reserved_minutes numeric not null default 0,
 current_minutes numeric not null default 0, available_minutes numeric not null default 0,
 as_of_date date not null default current_date, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.vacation_balance (
 user_id uuid not null references auth.users(id) on delete cascade, year integer not null check(year between 2020 and 2100),
 entitlement_days numeric check(entitlement_days between 0 and 366), used_days numeric not null default 0,
 reserved_days numeric not null default 0, available_days numeric,
 as_of_date date not null default current_date, created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 primary key(user_id,year)
);
create table public.subscriptions (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 plan text not null default 'basic' check(plan in ('basic','premium')),
 billing_period text check(billing_period in ('monthly','annual','lifetime')),
 status text not null default 'inactive' check(status in ('inactive','pending','active','grace_period','on_hold','cancelled','expired','revoked')),
 provider text check(provider in ('google_play','apple','manual')), product_id text, expires_at timestamptz,
 verified_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index subscriptions_user_id on public.subscriptions(user_id);
create table public.app_events (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 event_name text not null check(event_name in ('app_open','work_entry','vacation','settings','calendar','shifts','export','sync')),
 app_version text not null check(length(app_version)<=32), platform text not null check(platform in ('android','ios','web')),
 device_id uuid not null, event_day date not null default current_date,
 created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(user_id,event_name,event_day,device_id)
);
create index app_events_created on public.app_events(created_at);
create table zeitkonto_private.admins(user_id uuid primary key references auth.users(id) on delete cascade);
alter table zeitkonto_private.admins enable row level security;
create table zeitkonto_private.purchase_receipts (
 token_hash text primary key, user_id uuid not null references auth.users(id) on delete cascade,
 subscription_id uuid references public.subscriptions(id) on delete cascade,
 purchase_token text not null, package_name text not null, product_id text not null,
 validated_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index purchase_receipts_user on zeitkonto_private.purchase_receipts(user_id);
create index purchase_receipts_subscription on zeitkonto_private.purchase_receipts(subscription_id);
alter table zeitkonto_private.purchase_receipts enable row level security;
revoke all on all tables in schema zeitkonto_private from public,anon,authenticated;
alter table public.profiles enable row level security;
revoke all on public.profiles from public,anon,authenticated;
grant select on public.profiles to authenticated;
create policy own_select on public.profiles for select to authenticated using ((select auth.uid())=id);
alter table public.work_entries enable row level security;
revoke all on public.work_entries from public,anon,authenticated;
grant select on public.work_entries to authenticated;
create policy own_select on public.work_entries for select to authenticated using ((select auth.uid())=user_id);
grant insert,update,delete on public.work_entries to authenticated;
create policy own_insert on public.work_entries for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_update on public.work_entries for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_delete on public.work_entries for delete to authenticated using ((select auth.uid())=user_id);
alter table public.vacations enable row level security;
revoke all on public.vacations from public,anon,authenticated;
grant select on public.vacations to authenticated;
create policy own_select on public.vacations for select to authenticated using ((select auth.uid())=user_id);
grant insert,update,delete on public.vacations to authenticated;
create policy own_insert on public.vacations for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_update on public.vacations for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_delete on public.vacations for delete to authenticated using ((select auth.uid())=user_id);
alter table public.settings enable row level security;
revoke all on public.settings from public,anon,authenticated;
grant select on public.settings to authenticated;
create policy own_select on public.settings for select to authenticated using ((select auth.uid())=user_id);
grant insert,update,delete on public.settings to authenticated;
create policy own_insert on public.settings for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_update on public.settings for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_delete on public.settings for delete to authenticated using ((select auth.uid())=user_id);
alter table public.app_devices enable row level security;
revoke all on public.app_devices from public,anon,authenticated;
grant select on public.app_devices to authenticated;
create policy own_select on public.app_devices for select to authenticated using ((select auth.uid())=user_id);
grant insert,update,delete on public.app_devices to authenticated;
create policy own_insert on public.app_devices for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_update on public.app_devices for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_delete on public.app_devices for delete to authenticated using ((select auth.uid())=user_id);
alter table public.time_balance enable row level security;
revoke all on public.time_balance from public,anon,authenticated;
grant select on public.time_balance to authenticated;
create policy own_select on public.time_balance for select to authenticated using ((select auth.uid())=user_id);
alter table public.vacation_balance enable row level security;
revoke all on public.vacation_balance from public,anon,authenticated;
grant select on public.vacation_balance to authenticated;
create policy own_select on public.vacation_balance for select to authenticated using ((select auth.uid())=user_id);
alter table public.subscriptions enable row level security;
revoke all on public.subscriptions from public,anon,authenticated;
grant select on public.subscriptions to authenticated;
create policy own_select on public.subscriptions for select to authenticated using ((select auth.uid())=user_id);
alter table public.app_events enable row level security;
revoke all on public.app_events from public,anon,authenticated;
grant select on public.app_events to authenticated;
create policy own_select on public.app_events for select to authenticated using ((select auth.uid())=user_id);
grant update(display_name) on public.profiles to authenticated;
create policy own_update on public.profiles for update to authenticated using ((select auth.uid())=id) with check ((select auth.uid())=id);
create function zeitkonto_private.new_profile() returns trigger language plpgsql security definer set search_path='' as $$
begin insert into public.profiles(id,created_at) values(new.id,new.created_at) on conflict do nothing;return new;end $$;
revoke all on function zeitkonto_private.new_profile() from public,anon,authenticated;
create trigger zeitkonto_new_profile after insert on auth.users for each row execute function zeitkonto_private.new_profile();
insert into public.profiles(id,created_at) select id,created_at from auth.users on conflict do nothing;
create function zeitkonto_private.holiday_days(p jsonb) returns numeric language sql immutable set search_path='' as $$
 select case when p->>'kind'<>'holiday' then 0 when p->>'holidayMode' in ('half','company_half') then 0.5 when p->>'holidayMode'='hours' then (p->>'holidayMinutes')::numeric/nullif((p->>'targetMinutes')::numeric,0) else 1 end
$$;
revoke all on function zeitkonto_private.holiday_days(jsonb) from public,anon;
grant execute on function zeitkonto_private.holiday_days(jsonb) to authenticated;
-- Owner-derived balances refreshed at sync/read time using the user's local calendar date.
create function zeitkonto_private.refresh_balances(u uuid,d date) returns void language plpgsql set search_path='' as $$
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
-- Single owner lock, per-entity updated_at LWW, deterministic mutation tie-break and tombstones.
create function zeitkonto_private.sync(p_changes jsonb,p_today date) returns jsonb language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid(); op jsonb; entity text; target text; identifier text; val jsonb; stamp timestamptz; mid text; gone timestamptz; existing timestamptz; result jsonb;
begin
 if u is null then raise exception 'Authentication required' using errcode='42501';end if;
 if jsonb_typeof(p_changes)<>'array' or jsonb_array_length(p_changes)>12000 then raise exception 'Invalid batch';end if;
 perform pg_advisory_xact_lock(hashtextextended(u::text,0));
 for op in select value from jsonb_array_elements(p_changes) loop
 entity:=op->>'entity';identifier:=op->>'id';val:=op->'value';mid:=op->>'mutation_id';stamp:=(op->>'updated_at')::timestamptz;
 if entity not in ('entry','setting','device') or identifier is null or length(identifier)>2000 or mid is null or stamp is null or stamp>now()+interval '5 minutes' then raise exception 'Invalid mutation';end if;
 gone:=case when val is null or val='null'::jsonb then stamp else null end;
 if entity='entry' then
  if gone is null and (val->>'id' is distinct from identifier or coalesce(val->>'kind','') not in ('work','holiday','rest','sick_note','sick_no_note') or (val->>'targetMinutes')::numeric not between 15 and 1440 or coalesce(val->>'date','')!~'^[0-9]{4}-[0-9]{2}-[0-9]{2}$') then raise exception 'Invalid entry';end if;
  if gone is null and val->>'holidayMode'='hours' and (coalesce((val->>'holidayMinutes')::numeric,0)<=0 or (val->>'holidayMinutes')::numeric>(val->>'targetMinutes')::numeric) then raise exception 'Invalid holiday hours';end if;
  select max(updated_at) into existing from (select updated_at from public.work_entries where user_id=u and id=identifier union all select updated_at from public.vacations where user_id=u and id=identifier) q;
  if existing>stamp then continue;end if;
  foreach target in array array['work_entries','vacations'] loop
   execute format('insert into public.%I(user_id,id,payload,updated_at,deleted_at,mutation_id) values($1,$2,$3,$4,$5,$6) on conflict(user_id,id) do update set payload=excluded.payload,updated_at=excluded.updated_at,deleted_at=excluded.deleted_at,mutation_id=excluded.mutation_id where (excluded.updated_at,excluded.mutation_id)>(%I.updated_at,%I.mutation_id)',target,target,target)
   using u,identifier,case when gone is null and ((val->>'kind'='work')=(target='work_entries')) then val else '{}'::jsonb end,stamp,case when gone is not null or ((val->>'kind'='work')<>(target='work_entries')) then stamp else null end,mid;
  end loop;
 else
  target:=case when entity='setting' then 'settings' else 'app_devices' end;
  if entity='setting' and not(identifier in ('initial','dailyMinutes','restCost','includedPause','plannedPause','companyName','country','region','active','reminders','changes','migration_complete','language','theme','analytics') or identifier ~ '^(shift:|entitlement:)') then raise exception 'Invalid setting';end if;
  execute format('insert into public.%I(user_id,id,payload,updated_at,deleted_at,mutation_id) values($1,$2,$3,$4,$5,$6) on conflict(user_id,id) do update set payload=excluded.payload,updated_at=excluded.updated_at,deleted_at=excluded.deleted_at,mutation_id=excluded.mutation_id where (excluded.updated_at,excluded.mutation_id)>(%I.updated_at,%I.mutation_id)',target,target,target) using u,identifier,coalesce(nullif(val,'null'::jsonb),'{}'::jsonb),stamp,gone,mid;
 end if;
 end loop;
 perform zeitkonto_private.refresh_balances(u,p_today);
 select jsonb_build_object('rows',coalesce(jsonb_agg(to_jsonb(q)),'[]'::jsonb),'server_time',now()) into result from (
 select 'entry' entity,id,payload value,updated_at,deleted_at,mutation_id from public.work_entries where user_id=u
 union all select 'entry',id,payload,updated_at,deleted_at,mutation_id from public.vacations where user_id=u
 union all select 'setting',id,payload,updated_at,deleted_at,mutation_id from public.settings where user_id=u
 union all select 'device',id,payload,updated_at,deleted_at,mutation_id from public.app_devices where user_id=u
 )q;
 return result;
end $$;
revoke all on function zeitkonto_private.sync(jsonb,date) from public,anon;
grant execute on function zeitkonto_private.sync(jsonb,date) to authenticated;
create function public.zeitkonto_sync(p_changes jsonb default '[]',p_today date default current_date) returns jsonb language sql security invoker set search_path='' as $$select zeitkonto_private.sync(p_changes,p_today)$$;
revoke all on function public.zeitkonto_sync(jsonb,date) from public,anon;
grant execute on function public.zeitkonto_sync(jsonb,date) to authenticated;
create function zeitkonto_private.heartbeat(p_device uuid,p_version text,p_platform text,p_event text) returns void language plpgsql security definer set search_path='' as $$
declare u uuid:=auth.uid();begin
 if u is null then raise exception 'Authentication required' using errcode='42501';end if;
 if length(p_version)>32 or p_platform not in ('android','ios','web') or p_event not in ('app_open','work_entry','vacation','settings','calendar','shifts','export','sync') then raise exception 'Invalid telemetry';end if;
 update public.profiles set last_seen_at=now(),app_version=p_version,updated_at=now() where id=u and (last_seen_at is null or last_seen_at<now()-interval '5 minutes');
 insert into public.app_events(user_id,event_name,app_version,platform,device_id) values(u,p_event,p_version,p_platform,p_device) on conflict(user_id,event_name,event_day,device_id) do nothing;
end $$;
revoke all on function zeitkonto_private.heartbeat(uuid,text,text,text) from public,anon;
grant execute on function zeitkonto_private.heartbeat(uuid,text,text,text) to authenticated;
create function public.zeitkonto_heartbeat(p_device uuid,p_version text,p_platform text,p_event text default 'app_open') returns void language sql security invoker set search_path='' as $$select zeitkonto_private.heartbeat(p_device,p_version,p_platform,p_event)$$;
revoke all on function public.zeitkonto_heartbeat(uuid,text,text,text) from public,anon;
grant execute on function public.zeitkonto_heartbeat(uuid,text,text,text) to authenticated;
create function zeitkonto_private.admin_stats() returns jsonb language plpgsql security definer set search_path='' as $$begin
 if auth.uid() is null or not exists(select 1 from zeitkonto_private.admins where user_id=auth.uid()) then raise exception 'Admin required' using errcode='42501';end if;
 return jsonb_build_object('users',(select count(*) from public.profiles),'active_7d',(select count(*) from public.profiles where last_seen_at>=now()-interval '7 days'),'active_30d',(select count(*) from public.profiles where last_seen_at>=now()-interval '30 days'),'new_7d',(select count(*) from public.profiles where created_at>=now()-interval '7 days'),'new_30d',(select count(*) from public.profiles where created_at>=now()-interval '30 days'),'plans',(select jsonb_object_agg(plan,n) from (select case when plan='premium' and (premium_until is null or premium_until>now()) then 'premium' else 'basic' end plan,count(*) n from public.profiles group by 1)s),'features_30d',(select jsonb_object_agg(event_name,n) from (select event_name,count(*) n from public.app_events where created_at>=now()-interval '30 days' group by event_name)s),'platforms_30d',(select jsonb_object_agg(platform,n) from (select platform,count(distinct user_id) n from public.app_events where created_at>=now()-interval '30 days' group by platform)s),'versions_30d',(select jsonb_object_agg(app_version,n) from (select app_version,count(distinct user_id) n from public.app_events where created_at>=now()-interval '30 days' group by app_version)s));
 end $$;
revoke all on function zeitkonto_private.admin_stats() from public,anon;
grant execute on function zeitkonto_private.admin_stats() to authenticated;
create function public.zeitkonto_admin_stats() returns jsonb language sql security invoker set search_path='' as $$select zeitkonto_private.admin_stats()$$;
revoke all on function public.zeitkonto_admin_stats() from public,anon;
grant execute on function public.zeitkonto_admin_stats() to authenticated;
-- Retain coarse activity events only for 90 days. No payload, IP, email or work details.
select cron.schedule('zeitkonto-analytics-retention','17 3 * * *',$job$delete from public.app_events where created_at<now()-interval '90 days'$job$);
