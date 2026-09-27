import {env} from 'cloudflare:workers';
import {z} from 'zod';
import {authConfig} from '@/lib/auth-server';
import {verifyIdentity} from '@/lib/auth-identity';
import {beginAccountDeletion} from '@/lib/account-deletion';

export async function POST(req:Request) {
 const fail=(status:number)=>Response.json({error:'Não foi possível eliminar a conta. Verifica a palavra-passe e tenta novamente.'},{status,headers:{'Cache-Control':'no-store'}});
 if(req.headers.get('sec-fetch-site')==='cross-site')return fail(403);
 try {
  if(!env.DB)return fail(503);
  const config=authConfig(),user=await verifyIdentity(req,config);
  if(!user)return fail(401);
  const raw=await req.text();if(raw.length>2048)return fail(400);
  const body=z.object({confirmation:z.literal('DELETE'),password:z.string().min(1).max(128)}).strict().parse(JSON.parse(raw));
  // Derive the email/owner from verified Auth, never from the form.
  const response=await fetch(config.url+'/auth/v1/token?grant_type=password',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json'},body:JSON.stringify({email:user.email,password:body.password}),signal:AbortSignal.timeout(12000)});
  if(!response.ok)return fail(403);
  const credentials=z.object({access_token:z.string().min(1),user:z.object({id:z.literal(user.id)})}).parse(await response.json());
  // D1 failure must prevent deleting Auth; the public portal permits retries.
  await beginAccountDeletion(env.DB,user.owner);
  const deleted=await fetch(config.url+'/rest/v1/rpc/zeitkonto_delete_own_account',{method:'POST',headers:{apikey:config.key,Authorization:'Bearer '+credentials.access_token,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(20000)});
  if(!deleted.ok)return fail(503);
  return Response.json({deleted:true},{headers:{'Cache-Control':'no-store'}});
 } catch {return fail(503);}
}
