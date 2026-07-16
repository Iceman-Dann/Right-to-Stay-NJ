import { bigint, boolean, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const smsSessions = pgTable('sms_sessions', {
  senderHash: text('sender_hash').primaryKey(),
  conversationStep: text('conversation_step').notNull().default('start'),
  language: text('language').notNull().default('en'),
  noticeCategory: text('notice_category'),
  county: text('county'),
  optedOut: boolean('opted_out').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
})

export const impactEvents = pgTable('impact_events', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  eventType: text('event_type').notNull(),
  county: text('county'),
  noticeCategory: text('notice_category'),
  outcome: text('outcome'),
  sourceChannel: text('source_channel').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
})
