-- Explicit deny for all client roles; privileged server role only for verified billing.
create policy no_client_access on zeitkonto_private.admins for all to authenticated using(false) with check(false);
create policy no_client_access on zeitkonto_private.purchase_receipts for all to authenticated using(false) with check(false);
grant usage on schema zeitkonto_private to service_role;
grant select,insert,update,delete on zeitkonto_private.purchase_receipts to service_role;
-- Direct SQL/Data API edits get trusted timestamps; synchronizer preserves offline operation time.
create function zeitkonto_private.touch_owned_row() returns trigger language plpgsql security invoker set search_path='' as $$begin
 if current_user in ('authenticated','anon') then new.updated_at:=clock_timestamp();new.mutation_id:=gen_random_uuid()::text;end if;
 return new;end$$;
revoke all on function zeitkonto_private.touch_owned_row() from public,anon,authenticated;
create function zeitkonto_private.soft_delete_owned_row() returns trigger language plpgsql security invoker set search_path='' as $$begin
 if current_user not in ('authenticated','anon') then return old;end if;
 execute format('update public.%I set deleted_at=clock_timestamp(),updated_at=clock_timestamp(),mutation_id=gen_random_uuid()::text where user_id=$1 and id=$2',tg_table_name) using old.user_id,old.id;
 return null;end$$;
revoke all on function zeitkonto_private.soft_delete_owned_row() from public,anon,authenticated;
create trigger touch_work before update on public.work_entries for each row execute function zeitkonto_private.touch_owned_row();
create trigger touch_vacations before update on public.vacations for each row execute function zeitkonto_private.touch_owned_row();
create trigger touch_settings before update on public.settings for each row execute function zeitkonto_private.touch_owned_row();
create trigger touch_devices before update on public.app_devices for each row execute function zeitkonto_private.touch_owned_row();
create trigger delete_work before delete on public.work_entries for each row execute function zeitkonto_private.soft_delete_owned_row();
create trigger delete_vacations before delete on public.vacations for each row execute function zeitkonto_private.soft_delete_owned_row();
create trigger delete_settings before delete on public.settings for each row execute function zeitkonto_private.soft_delete_owned_row();
create trigger delete_devices before delete on public.app_devices for each row execute function zeitkonto_private.soft_delete_owned_row();
