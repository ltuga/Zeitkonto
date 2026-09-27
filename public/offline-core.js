// Device-local work outbox only. Server state remains authoritative.
export const KEY='zeitkonto-work-outbox-v1';
export function readOutbox(storage=localStorage){const raw=storage.getItem(KEY);if(!raw)return null;const q=JSON.parse(raw);if(q.format!==1||typeof q.owner!=='string'||!Array.isArray(q.records))throw Error('Dados locais inválidos.');return q;}
export function writeOutbox(q,storage=localStorage){storage.setItem(KEY,JSON.stringify(q));}
export async function locked(fn){if(!navigator.locks)throw Error('Este navegador não suporta o modo sem internet.');return navigator.locks.request('zeitkonto-offline-work',fn);}
export function remember(owner,state,enable=false,storage=localStorage){const q=readOutbox(storage);if(q?.dirty)throw Error('Sincroniza os registos pendentes antes de continuar.');if(!enable&&(!q||q.owner!==owner))return;writeOutbox({format:1,owner,dirty:false,baseActive:state.active,active:state.active,records:[],includedPause:state.includedPause,targetMinutes:state.dailyMinutes??480,targets:{},dates:state.records.map(r=>r.date),updated:Date.now()},storage);}
const stable=value=>{const v=value&&typeof value==='object'&&'includedPause' in value&&'start' in value?{targetMinutes:480,...value}:value;return v&&typeof v==='object'?(Array.isArray(v)?v.map(stable):Object.fromEntries(Object.keys(v).sort().map(k=>[k,stable(v[k])]))):v;};
const same=(a,b)=>JSON.stringify(stable(a))===JSON.stringify(stable(b));
export function mergeOutbox(state,q,owner){if(q.owner!==owner)throw Error('Entra na conta que criou os registos sem internet para sincronizar.');if(!q.dirty)return state;
 if(!same(state.active,q.baseActive)&&!same(state.active,q.active))throw Error('O turno mudou noutro dispositivo. Os registos locais foram mantidos para revisão.');
 if(q.active&&state.records.some(r=>r.date===localDate(new Date(q.active.start))))throw Error('Já existe um registo nesta data. Os registos locais foram mantidos para revisão.');
 const records=[...state.records];for(const r of q.records){const existing=records.find(x=>x.id===r.id);if(existing){if(!same(existing,r))throw Error('Um registo local foi alterado noutro dispositivo.');continue;}if(records.some(x=>x.date===r.date))throw Error('Já existe um registo nesta data. Os registos locais foram mantidos para revisão.');records.push(r);}
 return {...state,records,active:q.active};
}
export const localDate=(d)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export function applyAction(q,action,now=Date.now(),id=crypto.randomUUID()){
 if(!q)throw Error('Ativa primeiro o modo sem internet nas definições.');const next=structuredClone(q),a=next.active;
 if(action==='start'){if(a)throw Error('Já existe um turno em curso.');if([...next.dates,...next.records.map(r=>r.date)].includes(localDate(new Date(now))))throw Error('Já existe um registo nesta data.');next.active={targetMinutes:next.targets?.[localDate(new Date(now))]??next.targetMinutes??480,includedPause:next.includedPause,start:now,paused:0,pauseStart:null};}
 else {if(!a)throw Error('Não há turno em curso.');if(now<a.start||a.pauseStart&&now<a.pauseStart)throw Error('Verifica a hora do dispositivo.');
 if(action==='pause'){if(a.pauseStart)throw Error('O turno já está em pausa.');a.pauseStart=now;}
 else if(action==='resume'){if(!a.pauseStart)throw Error('O turno não está em pausa.');a.paused+=now-a.pauseStart;a.pauseStart=null;}
 else if(action==='finish'){const mins=Math.round((now-a.start)/60000),pause=Math.round((a.paused+(a.pauseStart?now-a.pauseStart:0))/60000);if(mins<1||mins>=1440||pause>mins)throw Error('Verifica a duração do turno: entre 1 minuto e 24 horas.');next.records.push({id,date:localDate(new Date(a.start)),kind:'work',targetMinutes:a.targetMinutes??480,includedPause:a.includedPause,start:new Date(a.start).toTimeString().slice(0,5),end:new Date(now).toTimeString().slice(0,5),pause,delta:mins-Math.max(0,pause-a.includedPause)-(a.targetMinutes??480),note:''});next.active=null;}
 else throw Error('Ação inválida.');}
 next.dirty=true;next.updated=now;return next;
}

export function readOwnedOutbox(storage=localStorage){
 try{const q=readOutbox(storage),session=JSON.parse(storage.getItem('zeitkonto-auth')||'null'),identity=JSON.parse(storage.getItem('zeitkonto-offline-user')||'null');
 return q&&session?.user?.id===q.owner&&identity?.id===q.owner?q:null;
 }catch{return null;}
}
