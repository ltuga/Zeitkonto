import {requireIdentity} from '@/lib/auth-server';
import {rpc} from '@/lib/supabase-state-server';
import {z} from 'zod';
export async function POST(req:Request){try{if(!await requireIdentity(req))return new Response(null,{status:401});const b=z.object({device:z.string().uuid(),version:z.string().max(32),platform:z.enum(['android','ios','web']),event:z.enum(['app_open','work_entry','vacation','settings','calendar','shifts','export','sync'])}).parse(await req.json());await rpc(req,'zeitkonto_heartbeat',{p_device:b.device,p_version:b.version,p_platform:b.platform,p_event:b.event});return new Response(null,{status:204});}catch{return new Response(null,{status:400})}}
