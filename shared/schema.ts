import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Hydrogen plant sites table
export const hydrogenSites = pgTable("hydrogen_sites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: varchar("name").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  suitabilityScore: integer("suitability_score").notNull(),
  isAiSuggested: boolean("is_ai_suggested").default(false),
  co2SavedAnnually: integer("co2_saved_annually"),
  industriesSupported: integer("industries_supported"),
  renewableUtilization: integer("renewable_utilization"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Renewable energy sources table
export const renewableSources = pgTable("renewable_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // 'wind', 'solar', 'hydro'
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  capacity: integer("capacity"), // MW
  createdAt: timestamp("created_at").defaultNow(),
});

// Demand centers table
export const demandCenters = pgTable("demand_centers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  type: varchar("type").notNull(), // 'steel', 'transport', 'chemical', 'power'
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  demandLevel: varchar("demand_level").notNull(), // 'low', 'medium', 'high'
  createdAt: timestamp("created_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertHydrogenSiteSchema = createInsertSchema(hydrogenSites).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRenewableSourceSchema = createInsertSchema(renewableSources).omit({
  id: true,
  createdAt: true,
});

export const insertDemandCenterSchema = createInsertSchema(demandCenters).omit({
  id: true,
  createdAt: true,
});

export type InsertHydrogenSite = z.infer<typeof insertHydrogenSiteSchema>;
export type HydrogenSite = typeof hydrogenSites.$inferSelect;
export type RenewableSource = typeof renewableSources.$inferSelect;
export type DemandCenter = typeof demandCenters.$inferSelect;
