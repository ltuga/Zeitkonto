import {authConfig} from '@/lib/auth-server';
import DeleteAccount from './portal';
export default function Page(){const {url,key}=authConfig();return <DeleteAccount url={url} publishableKey={key}/>;}
