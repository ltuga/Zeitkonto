begin;
-- Synthetic identities exist only inside this rolled-back test transaction.
insert into auth.users(id,created_at) values('00000000-0000-4000-8000-000000000001',now()),('00000000-0000-4000-8000-000000000002',now());
insert into public.subscriptions(user_id) values('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
set local role authenticated;
set local request.jwt.claim.sub='00000000-0000-4000-8000-000000000001';
do $$ declare t text; n integer; snap jsonb; v jsonb:=jsonb_build_object('id','entry-a','date','2026-12-24','kind','holiday','holidayMode','company_half','targetMinutes',480,'delta',0,'start','','end','','pause',0,'includedPause',30,'note',''); begin
 foreach t in array array['work_entries','vacations','settings','app_devices'] loop
 execute format('insert into public.%I(user_id,id,payload) values(auth.uid(),''own-test'',''{}'')',t);
 begin execute format('insert into public.%I(user_id,id) values(''00000000-0000-4000-8000-000000000002'',''foreign-test'')',t);raise exception 'Cross-user insert succeeded';exception when insufficient_privilege then null;end;
 begin execute format('update public.%I set user_id=''00000000-0000-4000-8000-000000000002'' where id=''own-test''',t);raise exception 'Owner reassignment succeeded';exception when insufficient_privilege then null;end;
 execute format('delete from public.%I where id=''own-test''',t);
 execute format('select count(*) from public.%I where id=''own-test'' and deleted_at is not null',t) into n;
 if n<>1 then raise exception 'Tombstone missing for %',t;end if;
 end loop;
 begin update public.profiles set plan='premium' where id=auth.uid();raise exception 'Self-upgrade succeeded';exception when insufficient_privilege then null;end;
 begin insert into public.subscriptions(user_id,plan,status) values(auth.uid(),'premium','active');raise exception 'Purchase spoof succeeded';exception when insufficient_privilege then null;end;
 begin perform public.zeitkonto_admin_stats();raise exception 'Admin stats exposed';exception when insufficient_privilege then null;end;
 perform public.zeitkonto_sync(jsonb_build_array(jsonb_build_object('entity','entry','id','entry-a','value',v,'updated_at','2026-09-13T10:00:00Z','mutation_id','test1'),jsonb_build_object('entity','setting','id','entitlement:2026','value',30,'updated_at','2026-09-13T10:00:00Z','mutation_id','test1')),'2026-12-23');
 perform public.zeitkonto_sync(jsonb_build_array(jsonb_build_object('entity','entry','id','entry-a','value',v,'updated_at','2026-09-13T10:00:00Z','mutation_id','test1')),'2026-12-24');
 select count(*) into n from public.vacations where id='entry-a' and deleted_at is null;if n<>1 then raise exception 'Duplicate sync';end if;
 if (select used_days from public.vacation_balance where user_id=auth.uid() and year=2026)<>.5 then raise exception 'Partial balance wrong';end if;
 perform public.zeitkonto_sync(jsonb_build_array(jsonb_build_object('entity','entry','id','entry-a','value',null,'updated_at','2026-09-13T10:01:00Z','mutation_id','test2')),'2026-12-24');
 perform public.zeitkonto_sync(jsonb_build_array(jsonb_build_object('entity','entry','id','entry-a','value',v,'updated_at','2026-09-13T10:00:00Z','mutation_id','test1')),'2026-12-24');
 if exists(select 1 from public.vacations where id='entry-a' and deleted_at is null) then raise exception 'Stale edit resurrected deletion';end if;
 perform public.zeitkonto_heartbeat('00000000-0000-4000-8000-000000000010','test','web','app_open');
end $$;
set local request.jwt.claim.sub='00000000-0000-4000-8000-000000000002';
do $$ declare t text;n integer;begin
 foreach t in array array['profiles','work_entries','vacations','settings','app_devices','time_balance','vacation_balance','subscriptions','app_events'] loop
 execute format('select count(*) from public.%I where %I=''00000000-0000-4000-8000-000000000001''',t,case when t='profiles' then 'id' else 'user_id' end) into n;
 if n<>0 then raise exception 'Cross-user read on %',t;end if;
 end loop;
 update public.work_entries set payload='{}' where user_id='00000000-0000-4000-8000-000000000001';get diagnostics n=row_count;if n<>0 then raise exception 'Cross-user update';end if;
 delete from public.vacations where user_id='00000000-0000-4000-8000-000000000001';get diagnostics n=row_count;if n<>0 then raise exception 'Cross-user delete';end if;
end $$;
set local role anon;
set local request.jwt.claim.sub='';
do $$begin
 begin perform public.zeitkonto_sync();raise exception 'Anonymous sync';exception when insufficient_privilege then null;end;
 begin perform * from public.profiles;raise exception 'Anonymous table access';exception when insufficient_privilege then null;end;
end$$;
reset role;
select 'PASS: own CRUD, cross-user RLS, Premium protection, offline replay, deletion tombstones, holiday balance, admin isolation, anonymous denial' as result;
rollback;
