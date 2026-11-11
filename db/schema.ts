import { integer, pgTable, serial, text, timestamp, varchar, boolean, jsonb, uuid, uniqueIndex, index } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  agentCredits: integer("agentCredits").default(3).notNull(),
  usageCredits: integer("usageCredits").default(100).notNull(),
  paddleCustomerId: text("paddle_customer_id"),
  paddleSubscriptionId: text("paddle_subscription_id"),
  subscriptionStatus: varchar("subscription_status", { length: 50 }).default("free"),
  subscriptionPlan: varchar("subscription_plan", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tools = pgTable("tools", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", {length: 100}).notNull().unique(),
  name: varchar("name", {length: 150}).notNull(),
  description: text("description"),
  category: varchar("category", {length: 100}).notNull(),
  type: varchar("type", {length: 50}).notNull(),
  provider: varchar("provider", {length: 100}).notNull(),
  icon: varchar("icon", {length: 100}),
  status: varchar("status", {length: 50}).default("active"),
  requiresAuth: boolean("requires_auth").default(false),
  authType: varchar("auth_type", {length: 50}),
  authProvider: varchar("auth_provider", {length: 100}),
  capabilities: jsonb("capabilities").$type<string[]>().default([]),
  useCases: jsonb("use_cases").$type<string[]>().default([]),
  permissions: jsonb("permissions").$type<string[]>().default([]),
  approvalRules: jsonb("approval_rules").$type<Record<string, boolean>>().default({}),
  config: jsonb("config").$type<Record<string, any>>(),
  riskLevel: varchar("risk_level", {length: 30}).default("low"),
  canRead: boolean("can_read").default(false),
  canWrite: boolean("can_write").default(false),
  canDelete: boolean("can_delete").default(false),
  canExecute: boolean("can_execute").default(true),
  enabled: boolean("enabled").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const AgentConfig = pgTable("agentConfig", {
  id: serial("id").primaryKey(),
  userEmail: text("email").references(() => users.email),
  agentId: varchar("agentId").notNull().unique(),
  name: varchar("name"),
  agentImg: varchar("agentImg"),
  description: text("description"),
  instructions: text("instructions"),
  objective: text("objective"),
  tools: jsonb("tools"),
  skills: jsonb("skills"),
  schedule: jsonb("schedule"),
  outputFormat: text("outputFormat"),
  status: varchar("status").default("active"),
  composioSessionId: varchar("composioSessionId"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const AgentRun = pgTable("agentRun",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    agentid: varchar("agentid").notNull().references(() => AgentConfig.agentId),
    userEmail: text("email").notNull(),
    scheduledFor: timestamp("scheduled_for", {withTimezone: true,}).notNull(),
    timezone: varchar("timezone", {length: 100,}).notNull(),
    status: varchar("status").default("scheduled").notNull(),
    output: jsonb("output"),
    error: text("error"),
    queuedAt: timestamp("queued_at", {withTimezone: true}),
    startedAt: timestamp("started_at", {withTimezone: true}),
    completedAt: timestamp("completed_at", {withTimezone: true}),
    createdAt: timestamp("created_at", {withTimezone: true}).defaultNow().notNull(),
  },
  table => [
    uniqueIndex("unique_agent_occurence").on(table.agentid, table.scheduledFor,),
    index("agent_run_schedule_lookup").on(table.status, table.scheduledFor,),
  ],
)

export type NewUser = typeof users.$inferInsert;