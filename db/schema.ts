import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const accounts = sqliteTable('time_accounts', { owner: text('owner').primaryKey(), payload: text('payload').notNull(), version: integer('version').notNull().default(0) });
export const pushDeliveries=sqliteTable('push_deliveries',{id:text('id').primaryKey(),created:integer('created').notNull()});
