import {requireIdentity} from '@/lib/auth-server';
import {z} from 'zod';
const countries=['DE','PT','ES','GB','FR','AT','CH','NL','BE','TR'];
const holiday=z.object({date:z.string().regex(/^\d{4}-\d{2}-\d{2}$/),name:z.string(),localName:z.string(),global:z.boolean(),counties:z.array(z.string()).nullable(),types:z.array(z.string())});
export async function GET(req:Request){
 try{if(!await requireIdentity(req))return Response.json({error:'auth'},{status:401})}catch{return Response.json({error:'unavailable'},{status:503})}
 const url=new URL(req.url),country=url.searchParams.get('country')??'DE',year=Number(url.searchParams.get('year'));
 if(!countries.includes(country)||!Number.isInteger(year)||year<2020||year>2035)return Response.json({error:'invalid'},{status:400});
 try{const response=await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`,{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error(`Holiday provider: ${response.status}`);const rows=z.array(holiday).parse(await response.json());return Response.json({holidays:rows.filter(h=>h.types.includes('Public')),source:'https://github.com/nager/Nager.Date'},{headers:{'Cache-Control':'private, max-age=3600'}});}catch{console.error('Holiday provider unavailable');return Response.json({error:'unavailable'},{status:503});}
}
