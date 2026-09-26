import {buildPushPayload} from '@block65/webcrypto-web-push';
import {env} from 'cloudflare:workers';
import type {PushDevice} from './push-schema';
import {allowedPushEndpoint} from './push-schema';
export async function hashId(value:string){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');}
export async function sendPush(device:PushDevice,body:string,tag:string){if(!allowedPushEndpoint(device.endpoint))throw Error('Invalid push provider');if(!env.VAPID_PRIVATE_KEY||!env.VAPID_PUBLIC_KEY)throw Error('Push not configured');const payload=await buildPushPayload({data:JSON.stringify({title:'Zeitkonto',body,tag,url:'/'}),options:{ttl:120}},{...device,expirationTime:device.expirationTime??null},{subject:'https://meu-tempo-luis.ltugamatos.chatgpt.site',publicKey:env.VAPID_PUBLIC_KEY,privateKey:env.VAPID_PRIVATE_KEY});return fetch(device.endpoint,{...payload,redirect:'error',signal:AbortSignal.timeout(8000)});}
