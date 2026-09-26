import AuthShell from './auth-shell';
import {authConfig} from '@/lib/auth-server';
export const dynamic='force-dynamic';
export default function Page(){const config=authConfig();return <AuthShell url={config.url} publishableKey={config.key}/>}
