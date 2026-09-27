import {accountBlocked} from './account-deletion';
import {env} from 'cloudflare:workers';
import {verifyIdentity,type AuthConfig} from './auth-identity';
import {isPublicSupabaseKey} from './public-auth-config';
export function authConfig():AuthConfig {const values=env as unknown as Record<string,string|undefined>,url=values.SUPABASE_URL,key=values.SUPABASE_PUBLISHABLE_KEY;if(!url||!key||!/^https:\/\/[a-z0-9]+\.supabase\.co$/.test(url)||!isPublicSupabaseKey(key))throw Error('Auth is not configured');return {url,key};}
export async function requireIdentity(request:Request){try{const user=await verifyIdentity(request,authConfig());if(user&&env.DB&&await accountBlocked(env.DB,user.owner))return null;return user}catch{throw Error('AUTH_UNAVAILABLE')}}
