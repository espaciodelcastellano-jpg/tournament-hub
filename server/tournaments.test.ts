import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

function createPublicContext(): TrpcContext {
  const ctx: TrpcContext = {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("Tournament Management", () => {
  describe("Teams", () => {
    it("should allow public users to list teams", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.teams.list({});
      expect(Array.isArray(result)).toBe(true);
    });

    it("should prevent non-admin users from creating teams", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.teams.create({
          name: "Test Team",
          sport: "soccer",
        })
      ).rejects.toThrow();
    });
  });

  describe("Standings Calculation", () => {
    it("should calculate standings for soccer", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.standings.calculate({ sport: "soccer" });
      expect(Array.isArray(result)).toBe(true);
      
      // Verify standings structure
      if (result.length > 0) {
        const standing = result[0];
        expect(standing).toHaveProperty("teamId");
        expect(standing).toHaveProperty("teamName");
        expect(standing).toHaveProperty("played");
        expect(standing).toHaveProperty("won");
        expect(standing).toHaveProperty("drawn");
        expect(standing).toHaveProperty("lost");
        expect(standing).toHaveProperty("points");
        expect(standing).toHaveProperty("goalDifference");
      }
    });

    it("should calculate standings for basketball", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.standings.calculate({ sport: "basketball" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should sort standings by points descending", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.standings.calculate({ sport: "soccer" });
      
      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i]!.points).toBeGreaterThanOrEqual(result[i + 1]!.points);
        }
      }
    });
  });

  describe("Top Scorers", () => {
    it("should retrieve top scorers for soccer", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.stats.topScorers({ sport: "soccer", limit: 10 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
    });

    it("should retrieve top scorers for basketball", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.stats.topScorers({ sport: "basketball", limit: 10 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe("Cheerleading Rankings", () => {
    it("should retrieve cheerleading rankings", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.cheerleading.rankings();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should prevent non-admin users from creating rankings", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.cheerleading.createRanking({
          teamId: 1,
          rank: 1,
        })
      ).rejects.toThrow();
    });
  });

  describe("Matches", () => {
    it("should allow public users to list matches", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.matches.list({});
      expect(Array.isArray(result)).toBe(true);
    });

    it("should retrieve upcoming matches for a sport", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.matches.upcoming({ sport: "soccer" });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should prevent non-admin users from creating matches", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.matches.create({
          sport: "soccer",
          homeTeamId: 1,
          awayTeamId: 2,
          matchDate: new Date().toISOString(),
        })
      ).rejects.toThrow();
    });
  });
});
