export const AUTH_STORAGE_KEY='zeitkonto-auth';
export function clearDeviceSession(storage:Pick<Storage,'removeItem'>){
 for(const key of [AUTH_STORAGE_KEY,AUTH_STORAGE_KEY+'-code-verifier',AUTH_STORAGE_KEY+'-user'])storage.removeItem(key);
}
// Always remove this device's persisted session, even if the network or SDK lock stalls.
// Remote revocation is best-effort; this does not claim to sign out other devices.
export async function logoutFromDevice(signOut:()=>Promise<unknown>,clear:()=>void,reload:()=>void,timeoutMs=4000){
 let timer:ReturnType<typeof setTimeout>|undefined;
 try{await Promise.race([Promise.resolve().then(signOut),new Promise<void>(resolve=>{timer=setTimeout(resolve,timeoutMs)})])}
 catch{/* A failed remote revocation must not trap the user in this device's session. */}
 finally{if(timer)clearTimeout(timer)}
 clear();reload();
}
