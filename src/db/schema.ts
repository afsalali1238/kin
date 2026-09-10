import { pgTable, text, jsonb, timestamp } from 'drizzle-orm/pg-core';
export const recoveryStates = pgTable('recovery_states', {
 id: text('id').primaryKey(),
 state: jsonb('state').notNull(),
 updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
