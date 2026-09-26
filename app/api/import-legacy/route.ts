import {env} from 'cloudflare:workers';
import {requireIdentity} from '@/lib/auth-server';
export async function POST(req:Request){
 if(req.headers.get('sec-fetch-site')==='cross-site')return new Response(null,{status:403});
 try{const identity=await requireIdentity(req);if(!identity)return Response.json({error:'auth'},{status:401});
 const legacy=req.headers.get('oai-authenticated-user-id'),email=req.headers.get('oai-authenticated-user-email');
 // Require both identities and matching verified emails; never trust a user-supplied owner ID.
 if(!legacy||!email||email.toLowerCase()!==identity.email.toLowerCase())return Response.json({imported:false});
 if(!env.DB)throw Error('Database unavailable');
 const result=await env.DB.prepare('INSERT INTO time_accounts(owner,payload,version) SELECT ?,payload,version FROM time_accounts WHERE owner=? ON CONFLICT(owner) DO NOTHING').bind(identity.owner,legacy).run();
 return Response.json({imported:result.meta.changes>0},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'import_unavailable'},{status:503})}
}
