import {env} from 'cloudflare:workers';
import {requireIdentity} from '@/lib/auth-server';
import {stateSchema} from '@/lib/time';
import {hashId,sendPush} from '@/lib/push-server';
import {translate} from '@/lib/i18n';
import '@/lib/shift-i18n';
export async function POST(req:Request){if(req.headers.get('sec-fetch-site')==='cross-site')return new Response(null,{status:403});try{const identity=await requireIdentity(req);if(!identity)return new Response(null,{status:401});if(!env.DB)return new Response(null,{status:503});const body=await req.json() as {endpoint?:string};const row=await env.DB.prepare('SELECT payload FROM time_accounts WHERE owner=?').bind(identity.owner).first<{payload:string}>();const device=row?stateSchema.parse(JSON.parse(row.payload)).pushDevices.find(d=>d.endpoint===body.endpoint):null;if(!device)return new Response(null,{status:404});const id=await hashId(identity.owner+':test:'+Math.floor(Date.now()/60000));const claimed=await env.DB.prepare('INSERT OR IGNORE INTO push_deliveries (id,created) VALUES (?,?) RETURNING id').bind(id,Date.now()).first();if(!claimed)return new Response(null,{status:429});const res=await sendPush(device,translate(device.lang,'Teste: lembra-te de registar o turno.'),'zeitkonto-test');return Response.json({sent:res.ok},{status:res.ok?200:502});}catch{return Response.json({sent:false},{status:503})}}
