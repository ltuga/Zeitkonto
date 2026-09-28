import {z} from 'zod';
import {env} from 'cloudflare:workers';
import {authConfig} from './auth-server';
import {reconcileMirrors} from './account-reconciliation';
export async function reconcileDeletedAccounts(){
 if(!env.DB||!env.REMINDER_CRON_TOKEN)throw Error('Maintenance unavailable');
 const config=authConfig(),maintenanceToken=env.REMINDER_CRON_TOKEN;
 return reconcileMirrors(env.DB,async ids=>{
  const result=await fetch(config.url+'/rest/v1/rpc/zeitkonto_missing_accounts',{method:'POST',headers:{apikey:config.key,'Content-Type':'application/json','x-zeitkonto-maintenance':maintenanceToken},body:JSON.stringify({p_ids:ids}),signal:AbortSignal.timeout(12000)});
  if(!result.ok)throw Error('Maintenance unavailable');
  return z.array(z.string().uuid()).max(100).parse(await result.json());
 });
}
