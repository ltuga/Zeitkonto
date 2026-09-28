begin;
-- Synthetic users only. Always run inside BEGIN/ROLLBACK, as in the audit workflow.
create temporary table privacy_checks(name text,passed boolean);
grant insert,select on privacy_checks to authenticated,anon;
do $test$
declare a uuid:=gen_random_uuid();b uuid:=gen_random_uuid();gone uuid:=gen_random_uuid();n integer; denied boolean;
begin
 insert into auth.users(id,email,created_at,updated_at) values(a,'privacy-'||a||'@example.invalid',now(),now()),(b,'privacy-'||b||'@example.invalid',now(),now());
 perform set_config('request.headers','{}',true);
 set local role anon;
 denied:=false;begin perform public.zeitkonto_missing_accounts(array[a,gone]);exception when insufficient_privilege then denied:=true;end;
 if not denied then raise exception 'Anonymous reconciliation allowed';end if;
 insert into privacy_checks values('no maintenance secret rejected',true);
 reset role;
 -- Use the existing server capability internally; never SELECT its value into output.
 perform set_config('request.headers',jsonb_build_object('x-zeitkonto-maintenance',(select decrypted_secret from vault.decrypted_secrets where name='zeitkonto_reminder_cron_token'))::text,true);
 set local role anon;
 if public.zeitkonto_missing_accounts(array[a,b,gone]) is distinct from array[gone] then raise exception 'Reconciliation incorrect';end if;
 insert into privacy_checks values('maintenance returns only deleted IDs',true);
 reset role;
 perform set_config('request.headers','{}',true);
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
 set local role authenticated;
 perform public.zeitkonto_heartbeat(gen_random_uuid(),'0.2.1','android','app_open');
 select count(*) into n from public.app_events where user_id=a;
 if n<>0 then raise exception 'Analytics collected without consent';end if;
 insert into privacy_checks values('analytics default off',true);
 reset role;
 insert into public.settings(user_id,id,payload) values(a,'analytics','{"enabled":true,"version":"2026-09-28"}');
 set local role authenticated;
 perform public.zeitkonto_heartbeat(gen_random_uuid(),'0.2.1','android','app_open');
 select count(*) into n from public.app_events where user_id=a;
 if n<>1 then raise exception 'Opted-in analytics missing';end if;
 insert into privacy_checks values('explicit consent enables analytics',true);
 reset role;
 insert into public.app_events(user_id,event_name,app_version,platform,device_id) values(b,'app_open','0.2.1','android',gen_random_uuid());
 insert into public.app_devices(user_id,id,payload) values(a,'push-fixture','{}');
 set local role authenticated;
 perform public.zeitkonto_clear_analytics();
 select count(*) into n from public.app_events where user_id=a;
 if n<>0 then raise exception 'Own analytics remain';end if;
 select count(*) into n from public.app_devices where user_id=a and id='push-fixture';
 if n<>1 then raise exception 'Push registration removed';end if;
 reset role;
 select count(*) into n from public.app_events where user_id=b;
 if n<>1 then raise exception 'Other user analytics removed';end if;
 insert into privacy_checks values('analytics deletion isolated and preserves push',true);
end $test$;
select * from privacy_checks;

rollback;
