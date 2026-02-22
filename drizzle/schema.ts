import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, datetime } from "drizzle-orm/mysql-core";

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

/**
 * Teams table - stores teams for all sports categories
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sport: mysqlEnum("sport", ["soccer", "basketball", "cheerleading"]).notNull(),
  logoUrl: text("logoUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Players table - stores players linked to teams
 */
export const players = mysqlTable("players", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  teamId: int("teamId").notNull(),
  jerseyNumber: varchar("jerseyNumber", { length: 10 }),
  position: varchar("position", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = typeof players.$inferInsert;

/**
 * Matches table - stores scheduled matches
 */
export const matches = mysqlTable("matches", {
  id: int("id").autoincrement().primaryKey(),
  sport: mysqlEnum("sport", ["soccer", "basketball", "cheerleading"]).notNull(),
  homeTeamId: int("homeTeamId").notNull(),
  awayTeamId: int("awayTeamId").notNull(),
  matchDate: datetime("matchDate").notNull(),
  venue: varchar("venue", { length: 255 }),
  status: mysqlEnum("status", ["scheduled", "in_progress", "completed", "cancelled"]).default("scheduled").notNull(),
  homeScore: int("homeScore"),
  awayScore: int("awayScore"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Match = typeof matches.$inferSelect;
export type InsertMatch = typeof matches.$inferInsert;

/**
 * Player Stats table - stores individual player statistics (goals for soccer, points for basketball)
 */
export const playerStats = mysqlTable("playerStats", {
  id: int("id").autoincrement().primaryKey(),
  playerId: int("playerId").notNull(),
  matchId: int("matchId").notNull(),
  goals: int("goals").default(0), // For soccer
  points: int("points").default(0), // For basketball
  assists: int("assists").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PlayerStat = typeof playerStats.$inferSelect;
export type InsertPlayerStat = typeof playerStats.$inferInsert;

/**
 * Cheerleading Rankings table - manual ranking system for cheerleading
 */
export const cheerleadingRankings = mysqlTable("cheerleadingRankings", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  rank: int("rank").notNull(),
  score: int("score"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CheerleadingRanking = typeof cheerleadingRankings.$inferSelect;
export type InsertCheerleadingRanking = typeof cheerleadingRankings.$inferInsert;
