import {
  users,
  hydrogenSites,
  renewableSources,
  demandCenters,
  type User,
  type UpsertUser,
  type InsertHydrogenSite,
  type HydrogenSite,
  type RenewableSource,
  type DemandCenter,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Hydrogen site operations
  createHydrogenSite(site: InsertHydrogenSite): Promise<HydrogenSite>;
  getHydrogenSites(userId: string): Promise<HydrogenSite[]>;
  getAiSuggestedSites(): Promise<HydrogenSite[]>;
  deleteHydrogenSite(id: string, userId: string): Promise<void>;
  
  // Infrastructure data operations
  getRenewableSources(): Promise<RenewableSource[]>;
  getDemandCenters(): Promise<DemandCenter[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Hydrogen site operations

  async createHydrogenSite(site: InsertHydrogenSite): Promise<HydrogenSite> {
    const [newSite] = await db
      .insert(hydrogenSites)
      .values(site)
      .returning();
    return newSite;
  }

  async getHydrogenSites(userId: string): Promise<HydrogenSite[]> {
    return await db
      .select()
      .from(hydrogenSites)
      .where(eq(hydrogenSites.userId, userId))
      .orderBy(desc(hydrogenSites.createdAt));
  }

  async getAiSuggestedSites(): Promise<HydrogenSite[]> {
    return await db
      .select()
      .from(hydrogenSites)
      .where(eq(hydrogenSites.isAiSuggested, true))
      .orderBy(desc(hydrogenSites.suitabilityScore));
  }

  async deleteHydrogenSite(id: string, userId: string): Promise<void> {
    await db
      .delete(hydrogenSites)
      .where(and(eq(hydrogenSites.id, id), eq(hydrogenSites.userId, userId)));
  }

  // Infrastructure data operations

  async getRenewableSources(): Promise<RenewableSource[]> {
    return await db.select().from(renewableSources);
  }

  async getDemandCenters(): Promise<DemandCenter[]> {
    return await db.select().from(demandCenters);
  }
}

export const storage = new DatabaseStorage();
