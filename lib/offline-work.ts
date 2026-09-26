import {stateSchema,type State} from './time';
import {authenticatedFetch} from './auth-client';
// Shared by the lightweight offline screen and the authenticated app.
// @ts-ignore plain JavaScript module is also executed directly by the service worker fallback
import {KEY,readOutbox,writeOutbox,remember,mergeOutbox,locked} from '../public/offline-core.js';
export {KEY,readOutbox,remember,locked};
export async function reconcileOffline(owner:string,state:State,version:number){if(!readOutbox())return {state,version};return locked(async()=>{
 const q=readOutbox();if(!q)return {state,version};if(q.owner!==owner){if(q.dirty)throw Error('Entra na conta que criou os registos sem internet para sincronizar.');return {state,version};}
 if(q.dirty){const merged=stateSchema.parse(mergeOutbox(state,q,owner));if(JSON.stringify(state)!==JSON.stringify(merged)){const r=await authenticatedFetch('/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({state:merged,version})}),j=await r.json() as {error?:string;version:number;state:State};if(!r.ok)throw Error(j.error||'Não foi possível sincronizar.');state=j.state;version=j.version;}writeOutbox({...q,dirty:false});}
 remember(owner,state);return {state,version};
 });}
