import {requireIdentity} from '@/lib/auth-server';
import {rpc} from '@/lib/supabase-state-server';
export async function GET(req:Request){try{if(!await requireIdentity(req))return new Response(null,{status:401});return Response.json(await rpc(req,'zeitkonto_admin_stats',{}),{headers:{'Cache-Control':'no-store'}});}catch{return new Response(null,{status:403})}}
