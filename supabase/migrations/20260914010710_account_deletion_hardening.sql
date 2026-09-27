-- Keep the privileged implementation outside the exposed API schema.
grant usage on schema zeitkonto_private to authenticated;
alter function public.zeitkonto_delete_own_account() security invoker;
