import { eq, and, desc, sql, gte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  teams, 
  players, 
  matches, 
  playerStats, 
  cheerleadingRankings,
  InsertTeam,
  InsertPlayer,
  InsertMatch,
  InsertPlayerStat,
  InsertCheerleadingRanking
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ TEAMS ============
export async function createTeam(team: InsertTeam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(teams).values(team);
  return result;
}

export async function getTeamsBySport(sport: "soccer" | "basketball" | "cheerleading") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(teams).where(eq(teams.sport, sport));
}

export async function getAllTeams() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(teams);
}

export async function updateTeam(id: number, team: Partial<InsertTeam>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(teams).set(team).where(eq(teams.id, id));
}

export async function deleteTeam(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(teams).where(eq(teams.id, id));
}

// ============ PLAYERS ============
export async function createPlayer(player: InsertPlayer) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(players).values(player);
}

export async function getPlayersByTeam(teamId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(players).where(eq(players.teamId, teamId));
}

export async function getAllPlayers() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(players);
}

export async function updatePlayer(id: number, player: Partial<InsertPlayer>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(players).set(player).where(eq(players.id, id));
}

export async function deletePlayer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(players).where(eq(players.id, id));
}

// ============ MATCHES ============
export async function createMatch(match: InsertMatch) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(matches).values(match);
}

export async function getMatchesBySport(sport: "soccer" | "basketball" | "cheerleading") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(matches).where(eq(matches.sport, sport));
}

export async function getUpcomingMatches(sport: "soccer" | "basketball" | "cheerleading") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const now = new Date();
  return await db.select().from(matches)
    .where(and(
      eq(matches.sport, sport),
      gte(matches.matchDate, now)
    ))
    .orderBy(matches.matchDate);
}

export async function getAllMatches() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(matches);
}

export async function updateMatch(id: number, match: Partial<InsertMatch>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(matches).set(match).where(eq(matches.id, id));
}

export async function deleteMatch(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(matches).where(eq(matches.id, id));
}

// ============ PLAYER STATS ============
export async function createPlayerStat(stat: InsertPlayerStat) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(playerStats).values(stat);
}

export async function getPlayerStatsByMatch(matchId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.select().from(playerStats).where(eq(playerStats.matchId, matchId));
}

export async function getTopScorers(sport: "soccer" | "basketball", limit: number = 10) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const statField = sport === "soccer" ? playerStats.goals : playerStats.points;
  
  const result = await db
    .select({
      playerId: playerStats.playerId,
      playerName: players.name,
      teamName: teams.name,
      totalStats: sql<number>`SUM(${statField})`.as('totalStats'),
    })
    .from(playerStats)
    .innerJoin(players, eq(playerStats.playerId, players.id))
    .innerJoin(teams, eq(players.teamId, teams.id))
    .innerJoin(matches, eq(playerStats.matchId, matches.id))
    .where(eq(matches.sport, sport))
    .groupBy(playerStats.playerId, players.name, teams.name)
    .orderBy(desc(sql`totalStats`))
    .limit(limit);
  
  return result;
}

// ============ CHEERLEADING RANKINGS ============
export async function createCheerleadingRanking(ranking: InsertCheerleadingRanking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.insert(cheerleadingRankings).values(ranking);
}

export async function getCheerleadingRankings() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db
    .select({
      id: cheerleadingRankings.id,
      teamId: cheerleadingRankings.teamId,
      teamName: teams.name,
      rank: cheerleadingRankings.rank,
      score: cheerleadingRankings.score,
      notes: cheerleadingRankings.notes,
    })
    .from(cheerleadingRankings)
    .innerJoin(teams, eq(cheerleadingRankings.teamId, teams.id))
    .orderBy(cheerleadingRankings.rank);
}

export async function updateCheerleadingRanking(id: number, ranking: Partial<InsertCheerleadingRanking>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.update(cheerleadingRankings).set(ranking).where(eq(cheerleadingRankings.id, id));
}

export async function deleteCheerleadingRanking(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return await db.delete(cheerleadingRankings).where(eq(cheerleadingRankings.id, id));
}
