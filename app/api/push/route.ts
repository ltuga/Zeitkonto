import {env} from 'cloudflare:workers';
import {requireIdentity} from '@/lib/auth-server';
export async function GET(req:Request){if(!await requireIdentity(req))return new Response(null,{status:401});return Response.json({publicKey:env.VAPID_PUBLIC_KEY??null},{headers:{'Cache-Control':'no-store'}});}
