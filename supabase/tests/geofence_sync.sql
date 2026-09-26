begin;
insert into auth.users(id,created_at) values('00000000-0000-4000-8000-000000000031',now()),('00000000-0000-4000-8000-000000000032',now());
set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-000000000031';
do $$
declare v jsonb:='{"id":"geo-test","kind":"work","date":"2026-09-13","start":"22:00","end":"06:00","pause":30,"targetMinutes":480,"includedPause":30,"delta":0,"note":"","origin":"geofence_automatico","geoId":"00000000-0000-4000-8000-000000000039"}';
ops jsonb; n integer;
begin
ops:=jsonb_build_array(jsonb_build_object('entity','entry','id','geo-test','value',v,'updated_at',now(),'mutation_id','geo-test'));
perform public.zeitkonto_sync(ops,'2026-09-14');
perform public.zeitkonto_sync(ops,'2026-09-14');
select count(*) into n from public.work_entries where id='geo-test' and deleted_at is null and payload->>'origin'='geofence_automatico';
if n<>1 then raise exception 'Replay/origin failure';end if;
end $$;
set local request.jwt.claim.sub='00000000-0000-4000-8000-000000000032';
do $$ declare n integer; begin
select count(*) into n from public.work_entries where id='geo-test';
if n<>0 then raise exception 'Cross-account read';end if;
update public.work_entries set payload='{}' where id='geo-test';
get diagnostics n=row_count;if n<>0 then raise exception 'Cross-account update';end if;
end $$;
reset role;
select 'PASS: geofence payload, idempotent sync, cross-account isolation; rolled back' as result;
rollback;
