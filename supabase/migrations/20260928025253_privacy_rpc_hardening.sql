-- Keep privilege elevation outside the exposed schema. The public functions only delegate.
alter function public.zeitkonto_missing_accounts(uuid[]) set schema zeitkonto_private;
alter function public.zeitkonto_clear_analytics() set schema zeitkonto_private;
grant usage on schema zeitkonto_private to anon;
create function public.zeitkonto_missing_accounts(p_ids uuid[]) returns uuid[] language sql security invoker set search_path='' as $$select zeitkonto_private.zeitkonto_missing_accounts(p_ids)$$;
revoke all on function public.zeitkonto_missing_accounts(uuid[]) from public,anon,authenticated;
grant execute on function public.zeitkonto_missing_accounts(uuid[]) to anon;
create function public.zeitkonto_clear_analytics() returns void language sql security invoker set search_path='' as $$select zeitkonto_private.zeitkonto_clear_analytics()$$;
revoke all on function public.zeitkonto_clear_analytics() from public,anon,authenticated;
grant execute on function public.zeitkonto_clear_analytics() to authenticated;
