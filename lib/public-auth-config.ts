// Configuration guard, not JWT authentication: never serialize a privileged key.
export function isPublicSupabaseKey(key: string): boolean {
 if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) return true;
 const parts=key.split('.');
 if(parts.length!==3) return false;
 try {
  const payload=JSON.parse(atob(parts[1].replace(/-/g,'+').replace(/_/g,'/')));
  return payload.role==='anon' && payload.iss==='supabase';
 } catch { return false; }
}
