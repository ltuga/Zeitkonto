drop extension pg_net; create extension pg_net with schema extensions; revoke usage on schema net from anon, authenticated; revoke all on all functions in schema net from public, anon, authenticated;
