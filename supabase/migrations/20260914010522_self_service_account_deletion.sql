-- Authenticated users may permanently delete only their own account.
create function zeitkonto_private.delete_own_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  requesting_user uuid := auth.uid();
begin
  if requesting_user is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  delete from auth.users where id = requesting_user;
  if not found then
    raise exception 'Account not found' using errcode = 'P0002';
  end if;
end
$$;

revoke all on function zeitkonto_private.delete_own_account() from public, anon;
grant execute on function zeitkonto_private.delete_own_account() to authenticated;

create function public.zeitkonto_delete_own_account()
returns void
language sql
security definer
set search_path = ''
as $$ select zeitkonto_private.delete_own_account() $$;

revoke all on function public.zeitkonto_delete_own_account() from public, anon;
grant execute on function public.zeitkonto_delete_own_account() to authenticated;
