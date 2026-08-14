import { boolean, index, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const newsletterEditions = mysqlTable(
  "newsletter_editions",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 140 }).notNull().unique(),
    title: varchar("title", { length: 240 }).notNull(),
    standfirst: text("standfirst").notNull(),
    editorNote: text("editor_note"),
    issueType: mysqlEnum("issue_type", ["regular", "current"]).default("regular").notNull(),
    status: mysqlEnum("status", ["draft", "published", "rejected", "corrected"]).default("draft").notNull(),
    currentRelevance: text("current_relevance"),
    currentSourceUrls: text("current_source_urls"),
    qualityGatePassed: boolean("quality_gate_passed").default(false).notNull(),
    qualityGateNotes: text("quality_gate_notes"),
    publishedAt: timestamp("published_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    statusPublishedIdx: index("newsletter_editions_status_published_idx").on(table.status, table.publishedAt),
  }),
);

export const newsletterInsights = mysqlTable(
  "newsletter_insights",
  {
    id: int("id").autoincrement().primaryKey(),
    editionId: int("edition_id").notNull(),
    position: int("position").notNull(),
    title: varchar("title", { length: 240 }).notNull(),
    domains: varchar("domains", { length: 320 }).notNull(),
    tier: mysqlEnum("tier", ["E", "C", "F", "S"]).notNull(),
    mainClaim: text("main_claim").notNull(),
    soWhat: text("so_what").notNull(),
    evidenceNote: text("evidence_note").notNull(),
    auditNote: text("audit_note").notNull(),
    denominatorNote: text("denominator_note").notNull(),
    intentNote: text("intent_note").notNull(),
    falsifier: text("falsifier").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    editionPositionIdx: index("newsletter_insights_edition_position_idx").on(table.editionId, table.position),
  }),
);

export const newsletterSources = mysqlTable(
  "newsletter_sources",
  {
    id: int("id").autoincrement().primaryKey(),
    insightId: int("insight_id").notNull(),
    label: varchar("label", { length: 360 }).notNull(),
    url: varchar("url", { length: 1024 }).notNull(),
    sourceType: varchar("source_type", { length: 100 }).notNull(),
    retrievedAt: timestamp("retrieved_at").defaultNow().notNull(),
  },
  table => ({
    insightIdx: index("newsletter_sources_insight_idx").on(table.insightId),
  }),
);

export const newsletterSchedules = mysqlTable(
  "newsletter_schedules",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull().unique(),
    cronExpression: varchar("cron_expression", { length: 64 }).notNull(),
    scheduleCronTaskUid: varchar("schedule_cron_task_uid", { length: 65 }),
    lastCurrentSignalAt: timestamp("last_current_signal_at"),
    enabled: boolean("enabled").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    taskUidIdx: index("newsletter_schedules_task_uid_idx").on(table.scheduleCronTaskUid),
  }),
);

export const newsletterPublicationRuns = mysqlTable(
  "newsletter_publication_runs",
  {
    id: int("id").autoincrement().primaryKey(),
    scheduleId: int("schedule_id"),
    editionId: int("edition_id"),
    status: mysqlEnum("status", ["started", "published", "rejected", "failed"]).notNull(),
    detail: text("detail"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  table => ({
    scheduleCreatedIdx: index("newsletter_publication_runs_schedule_created_idx").on(table.scheduleId, table.createdAt),
  }),
);

export type NewsletterEdition = typeof newsletterEditions.$inferSelect;
export type NewsletterInsight = typeof newsletterInsights.$inferSelect;
export type NewsletterSource = typeof newsletterSources.$inferSelect;
