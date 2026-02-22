import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Solo los administradores pueden acceder a esta función' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Admin authentication
  admin: router({
    validatePassword: publicProcedure
      .input(z.object({ password: z.string() }))
      .mutation(async ({ input }) => {
        const correctPassword = process.env.ADMIN_PASSWORD;
        
        if (!correctPassword) {
          throw new TRPCError({ 
            code: 'INTERNAL_SERVER_ERROR', 
            message: 'Admin password not configured' 
          });
        }
        
        if (input.password === correctPassword) {
          // Generar un token simple (en producción usar JWT)
          const token = Buffer.from(input.password + Date.now()).toString('base64');
          return { success: true, token };
        } else {
          return { success: false, token: '' };
        }
      }),
  }),

  // Teams management
  teams: router({
    list: publicProcedure
      .input(z.object({ sport: z.enum(["soccer", "basketball", "cheerleading"]).optional() }))
      .query(async ({ input }) => {
        if (input.sport) {
          return await db.getTeamsBySport(input.sport);
        }
        return await db.getAllTeams();
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        sport: z.enum(["soccer", "basketball", "cheerleading"]),
        logoUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createTeam(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        logoUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateTeam(id, data);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteTeam(input.id);
      }),
  }),

  // Players management
  players: router({
    list: publicProcedure
      .input(z.object({ teamId: z.number().optional() }))
      .query(async ({ input }) => {
        if (input.teamId) {
          return await db.getPlayersByTeam(input.teamId);
        }
        return await db.getAllPlayers();
      }),
    
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        teamId: z.number(),
        jerseyNumber: z.string().optional(),
        position: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createPlayer(input);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        jerseyNumber: z.string().optional(),
        position: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updatePlayer(id, data);
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deletePlayer(input.id);
      }),
    
    bulkCreate: adminProcedure
      .input(z.object({
        players: z.array(z.object({
          name: z.string().min(1),
          number: z.number().optional(),
          position: z.string().optional(),
          teamId: z.number().optional(),
          sport: z.enum(["soccer", "basketball", "cheerleading"]),
        })),
      }))
      .mutation(async ({ input }) => {
        let created = 0;
        let failed = 0;
        
        for (const player of input.players) {
          try {
            await db.createPlayer({
              name: player.name,
              teamId: player.teamId || 0,
              jerseyNumber: player.number?.toString(),
              position: player.position,
            });
            created++;
          } catch (error) {
            failed++;
          }
        }
        
        return { created, failed, total: input.players.length };
      }),
  }),

  // Matches management
  matches: router({
    list: publicProcedure
      .input(z.object({ sport: z.enum(["soccer", "basketball", "cheerleading"]).optional() }))
      .query(async ({ input }) => {
        if (input.sport) {
          return await db.getMatchesBySport(input.sport);
        }
        return await db.getAllMatches();
      }),
    
    upcoming: publicProcedure
      .input(z.object({ sport: z.enum(["soccer", "basketball", "cheerleading"]) }))
      .query(async ({ input }) => {
        return await db.getUpcomingMatches(input.sport);
      }),
    
    create: adminProcedure
      .input(z.object({
        sport: z.enum(["soccer", "basketball", "cheerleading"]),
        homeTeamId: z.number(),
        awayTeamId: z.number(),
        matchDate: z.string(),
        venue: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createMatch({
          ...input,
          matchDate: new Date(input.matchDate),
        });
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        matchDate: z.string().optional(),
        venue: z.string().optional(),
        status: z.enum(["scheduled", "in_progress", "completed", "cancelled"]).optional(),
        homeScore: z.number().optional(),
        awayScore: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, matchDate, ...data } = input;
        return await db.updateMatch(id, {
          ...data,
          ...(matchDate ? { matchDate: new Date(matchDate) } : {}),
        });
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteMatch(input.id);
      }),
  }),

  // Player stats management
  stats: router({
    create: adminProcedure
      .input(z.object({
        playerId: z.number(),
        matchId: z.number(),
        goals: z.number().optional(),
        points: z.number().optional(),
        assists: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createPlayerStat(input);
      }),
    
    byMatch: publicProcedure
      .input(z.object({ matchId: z.number() }))
      .query(async ({ input }) => {
        return await db.getPlayerStatsByMatch(input.matchId);
      }),
    
    topScorers: publicProcedure
      .input(z.object({
        sport: z.enum(["soccer", "basketball"]),
        limit: z.number().default(10),
      }))
      .query(async ({ input }) => {
        return await db.getTopScorers(input.sport, input.limit);
      }),
    
    updateScore: adminProcedure
      .input(z.object({
        matchId: z.number(),
        homeScore: z.number(),
        awayScore: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Actualizar el marcador del partido
        return await db.updateMatch(input.matchId, {
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          status: "completed",
        });
      }),
    
    bulkCreateStats: adminProcedure
      .input(z.object({
        matchId: z.number(),
        stats: z.array(z.object({
          playerId: z.number(),
          goals: z.number().optional(),
          points: z.number().optional(),
          assists: z.number().optional(),
          yellowCards: z.number().optional(),
          redCards: z.number().optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        // Guardar múltiples estadísticas de jugadores en un partido
        const results = [];
        for (const stat of input.stats) {
          if (stat.goals || stat.points || stat.assists || stat.yellowCards || stat.redCards) {
            const result = await db.createPlayerStat({
              playerId: stat.playerId,
              matchId: input.matchId,
              goals: stat.goals || 0,
              points: stat.points || 0,
              assists: stat.assists || 0,
            });
            results.push(result);
          }
        }
        return results;
      }),
  },
    
    updateScore: adminProcedure
      .input(z.object({
        matchId: z.number(),
        homeScore: z.number(),
        awayScore: z.number(),
      }))
      .mutation(async ({ input }) => {
        // Actualizar el marcador del partido
        return await db.updateMatch(input.matchId, {
          homeScore: input.homeScore,
          awayScore: input.awayScore,
          status: "completed",
        });
      }),
    
    bulkCreateStats: adminProcedure
      .input(z.object({
        matchId: z.number(),
        stats: z.array(z.object({
          playerId: z.number(),
          goals: z.number().optional(),
          points: z.number().optional(),
          assists: z.number().optional(),
          yellowCards: z.number().optional(),
          redCards: z.number().optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        // Guardar múltiples estadísticas de jugadores en un partido
        const results = [];
        for (const stat of input.stats) {
          if (stat.goals || stat.points || stat.assists || stat.yellowCards || stat.redCards) {
            const result = await db.createPlayerStat({
              playerId: stat.playerId,
              matchId: input.matchId,
              goals: stat.goals || 0,
              points: stat.points || 0,
              assists: stat.assists || 0,
            });
            results.push(result);
          }
        }
        return results;
      }),
  },

  // Cheerleading rankings
  cheerleading: router({
    rankings: publicProcedure.query(async () => {
      return await db.getCheerleadingRankings();
    }),
    
    createRanking: adminProcedure
      .input(z.object({
        teamId: z.number(),
        rank: z.number(),
        score: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return await db.createCheerleadingRanking(input);
      }),
    
    updateRanking: adminProcedure
      .input(z.object({
        id: z.number(),
        rank: z.number().optional(),
        score: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return await db.updateCheerleadingRanking(id, data);
      }),
    
    deleteRanking: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return await db.deleteCheerleadingRanking(input.id);
      }),
  }),

  // Standings calculation
  standings: router({
    calculate: publicProcedure
      .input(z.object({ sport: z.enum(["soccer", "basketball"]) }))
      .query(async ({ input }) => {
        const matches = await db.getMatchesBySport(input.sport);
        const teams = await db.getTeamsBySport(input.sport);
        
        // Initialize standings
        const standings = teams.map(team => ({
          teamId: team.id,
          teamName: team.name,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
        }));
        
        // Calculate standings from completed matches
        matches
          .filter(m => m.status === 'completed' && m.homeScore !== null && m.awayScore !== null)
          .forEach(match => {
            const homeTeam = standings.find(s => s.teamId === match.homeTeamId);
            const awayTeam = standings.find(s => s.teamId === match.awayTeamId);
            
            if (!homeTeam || !awayTeam) return;
            
            homeTeam.played++;
            awayTeam.played++;
            homeTeam.goalsFor += match.homeScore!;
            homeTeam.goalsAgainst += match.awayScore!;
            awayTeam.goalsFor += match.awayScore!;
            awayTeam.goalsAgainst += match.homeScore!;
            
            if (match.homeScore! > match.awayScore!) {
              homeTeam.won++;
              homeTeam.points += 3;
              awayTeam.lost++;
            } else if (match.homeScore! < match.awayScore!) {
              awayTeam.won++;
              awayTeam.points += 3;
              homeTeam.lost++;
            } else {
              homeTeam.drawn++;
              awayTeam.drawn++;
              homeTeam.points += 1;
              awayTeam.points += 1;
            }
          });
        
        // Calculate goal difference and sort
        standings.forEach(s => {
          s.goalDifference = s.goalsFor - s.goalsAgainst;
        });
        
        standings.sort((a, b) => {
          if (b.points !== a.points) return b.points - a.points;
          if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
          return b.goalsFor - a.goalsFor;
        });
        
        return standings;
      }),
  }),
});

export type AppRouter = typeof appRouter;
