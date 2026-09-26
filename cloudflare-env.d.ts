declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    VAPID_PUBLIC_KEY?:string;
    VAPID_PRIVATE_KEY?:string;
    REMINDER_CRON_TOKEN?:string;
    BUCKET?: R2Bucket;
  }
}
