-- Isolation regression: synthetic identities only; all changes are rolled back.
-- Run as postgres against the project. Does not send email or touch real accounts.
begin;
create temporary table zeitkonto_security_results (check_name text, passed boolean);
grant insert, select on zeitkonto_security_results to authenticated;
do $test$
declare a uuid:=gen_random_uuid(); b uuid:=gen_random_uuid(); u uuid; other uuid; t text; col text; n integer; blocked boolean;
begin
 insert into auth.users(id,email,created_at,updated_at) values
 (a,'security-'||a||'@example.invalid',now(),now()),(b,'security-'||b||'@example.invalid',now(),now());
 foreach u in array array[a,b] loop
  foreach t in array array['work_entries','vacations','settings','app_devices'] loop
   execute format('insert into public.%I(user_id,id,payload) values($1,$2,$3)',t) using u,'security-fixture','{}'::jsonb;
  end loop;
  insert into public.time_balance(user_id) values(u);
  insert into public.vacation_balance(user_id,year) values(u,2026);
  insert into public.subscriptions(user_id) values(u);
  insert into public.app_events(user_id,event_name,app_version,platform,device_id) values(u,'app_open','security-test','web',gen_random_uuid());
 end loop;
 foreach u in array array[a,b] loop
  other:=case when u=a then b else a end;
  perform set_config('request.jwt.claims',jsonb_build_object('sub',u,'role','authenticated')::text,true);
  set local role authenticated;
  foreach t in array array['profiles','work_entries','vacations','settings','app_devices','time_balance','vacation_balance','subscriptions','app_events'] loop
   col:=case when t='profiles' then 'id' else 'user_id' end;
   execute format('select count(*) from public.%I where %I in ($1,$2)',t,col) into n using a,b;
   if n<>1 then raise exception 'Isolation SELECT failed on %',t;end if;
   insert into zeitkonto_security_results values('SELECT own only: '||t,true);
  end loop;
  foreach t in array array['work_entries','vacations','settings','app_devices'] loop
   execute format('insert into public.%I(user_id,id,payload) values($1,$2,$3)',t) using u,'own-write','{}'::jsonb;
   execute format('update public.%I set payload=$1 where user_id=$2 and id=$3',t) using '{"safe":true}'::jsonb,u,'own-write';
   get diagnostics n=row_count;if n<>1 then raise exception 'Own update failed';end if;
   execute format('delete from public.%I where user_id=$1 and id=$2',t) using u,'own-write';
   execute format('select count(*) from public.%I where user_id=$1 and id=$2 and deleted_at is not null',t) into n using u,'own-write';
   if n<>1 then raise exception 'Own tombstone failed';end if;
   insert into zeitkonto_security_results values('Own CRUD/tombstone: '||t,true);
   execute format('update public.%I set payload=$1 where user_id=$2 and id=$3',t) using '{"attack":true}'::jsonb,other,'security-fixture';
   get diagnostics n=row_count;if n<>0 then raise exception 'Cross update allowed';end if;
   execute format('delete from public.%I where user_id=$1 and id=$2',t) using other,'security-fixture';
   get diagnostics n=row_count;if n<>0 then raise exception 'Cross delete allowed';end if;
   blocked:=false;
   begin execute format('insert into public.%I(user_id,id) values($1,$2)',t) using other,'cross-write';
   exception when insufficient_privilege then blocked:=true;end;
   if not blocked then raise exception 'Cross insert allowed';end if;
   blocked:=false;
   begin execute format('update public.%I set user_id=$1 where user_id=$2 and id=$3',t) using other,u,'own-write';
   exception when insufficient_privilege then blocked:=true;end;
   if not blocked then raise exception 'Owner reassignment allowed';end if;
   insert into zeitkonto_security_results values('Cross insert/update/delete/reassign blocked: '||t,true);
  end loop;
  blocked:=false;begin update public.profiles set plan='premium',premium_until=now()+interval '1 year' where id=u;exception when insufficient_privilege then blocked:=true;end;
  if not blocked then raise exception 'Self Premium allowed';end if;
  insert into zeitkonto_security_results values('Self Premium blocked',true);
  blocked:=false;begin insert into public.subscriptions(user_id,plan,status,verified_at) values(u,'premium','active',now());exception when insufficient_privilege then blocked:=true;end;
  if not blocked then raise exception 'Subscription forge allowed';end if;
  insert into zeitkonto_security_results values('Subscription forge blocked',true);
  blocked:=false;begin insert into zeitkonto_private.admins(user_id) values(u);exception when insufficient_privilege then blocked:=true;end;
  if not blocked then raise exception 'Admin escalation allowed';end if;
  blocked:=false;begin perform public.zeitkonto_admin_stats();exception when insufficient_privilege then blocked:=true;end;
  if not blocked then raise exception 'Admin statistics allowed';end if;
  insert into zeitkonto_security_results values('Admin escalation/statistics blocked',true);
  reset role;
 end loop;
 perform set_config('request.jwt.claims',jsonb_build_object('sub',a,'role','authenticated')::text,true);
 set local role authenticated;
 perform public.zeitkonto_delete_own_account();
 reset role;
 if exists(select 1 from auth.users where id=a) or not exists(select 1 from auth.users where id=b) then raise exception 'Account deletion isolation failed';end if;
 foreach t in array array['profiles','work_entries','vacations','settings','app_devices','time_balance','vacation_balance','subscriptions','app_events'] loop
  col:=case when t='profiles' then 'id' else 'user_id' end;
  execute format('select count(*) from public.%I where %I=$1',t,col) into n using a;
  if n<>0 then raise exception 'Delete cascade failed: %',t;end if;
 end loop;
 insert into zeitkonto_security_results values('Own account deletion/cascade only',true);
 perform set_config('request.jwt.claims','{}',true);
 set local role anon;
 blocked:=false;begin perform public.zeitkonto_delete_own_account();exception when insufficient_privilege then blocked:=true;end;
 if not blocked then raise exception 'Anon deletion allowed';end if;
 reset role;
 insert into zeitkonto_security_results values('Anon deletion blocked',true);
end $test$;
select check_name,count(*) as repetitions,bool_and(passed) as passed from zeitkonto_security_results group by check_name order by check_name;
rollback;
