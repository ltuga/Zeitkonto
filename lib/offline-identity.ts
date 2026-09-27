import {AUTH_STORAGE_KEY} from './logout';
// Local continuity only; the server still verifies every online request.
// Never use a cached profile alone to select another account's offline database.
export function readOfflineIdentity(storage:Pick<Storage,'getItem'>) {
 try {
  const cached=JSON.parse(storage.getItem('zeitkonto-offline-user')??'null');
  const session=JSON.parse(storage.getItem(AUTH_STORAGE_KEY)??'null');
  const user=session?.user;
  if(!cached || !user || cached.id!==user.id || user.is_anonymous ||
    typeof user.id!=='string' || !/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(user.id) ||
    typeof user.email!=='string' || !user.email_confirmed_at ||
    typeof session.access_token!=='string' || !session.access_token ||
    typeof session.refresh_token!=='string' || !session.refresh_token) return null;
  return {id:user.id,email:user.email,email_confirmed_at:user.email_confirmed_at};
 } catch { return null; }
}
