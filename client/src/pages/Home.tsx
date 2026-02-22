import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Calendar, Target, Sparkles, Shield, Download, FileText, Image, Clock, CheckCircle, Moon, Sun } from "lucide-react";
import { exportToPDF, exportToImage } from "@/lib/exportUtils";
import { toast } from "sonner";
import { Link } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";
import { SoccerBallIcon, BasketballIcon, PompomsIcon } from "@/components/SportIconsSVG";

export default function Home() {
  const { user } = useAuth();
  const { theme, toggleTheme, switchable } = useTheme();
  const [activeSport, setActiveSport] = useState<"soccer" | "basketball" | "cheerleading">("soccer");

  const handleExportPDF = async () => {
    try {
      await exportToPDF('export-content', `tournament-hub-${activeSport}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF generado exitosamente');
    } catch (error) {
      toast.error('Error al generar PDF');
    }
  };

  const handleExportImage = async () => {
    try {
      await exportToImage('export-content', `tournament-hub-${activeSport}-${new Date().toISOString().split('T')[0]}.jpg`);
      toast.success('Imagen exportada exitosamente');
    } catch (error) {
      toast.error('Error al exportar imagen');
    }
  };

  const { data: soccerStandings } = trpc.standings.calculate.useQuery({ sport: "soccer" });
  const { data: basketballStandings } = trpc.standings.calculate.useQuery({ sport: "basketball" });
  const { data: soccerTopScorers } = trpc.stats.topScorers.useQuery({ sport: "soccer", limit: 10 });
  const { data: basketballTopScorers } = trpc.stats.topScorers.useQuery({ sport: "basketball", limit: 10 });
  const { data: cheerleadingRankings } = trpc.cheerleading.rankings.useQuery();
  const { data: soccerUpcoming } = trpc.matches.upcoming.useQuery({ sport: "soccer" });
  const { data: basketballUpcoming } = trpc.matches.upcoming.useQuery({ sport: "basketball" });
  const { data: cheerleadingUpcoming } = trpc.matches.upcoming.useQuery({ sport: "cheerleading" });

  const getTeamName = (teamId: number, sport: "soccer" | "basketball") => {
    const standings = sport === "soccer" ? soccerStandings : basketballStandings;
    const team = standings?.find(s => s.teamId === teamId);
    return team?.teamName || "N/A";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 dark:from-slate-950 dark:via-red-950 dark:to-orange-950">
      {/* Header */}
      <header className="border-b border-orange-200 dark:border-orange-900 bg-white/80 dark:bg-black/40 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-10 h-10 text-red-600 dark:text-orange-400" />
              <div>
                <h1 className="text-4xl font-bold text-red-700 dark:text-white">Torno Intersalesiano</h1>
                <p className="text-orange-600 dark:text-gray-400">Gestión de Torneos Multideportivos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {switchable && (
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-orange-200 dark:hover:bg-orange-900 transition-colors"
                  title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  )}
                </button>
              )}
              <a href="/admin-login" className="px-6 py-2 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white rounded-lg font-semibold transition-all">
                Panel de Administración
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Export Buttons */}
        <div className="flex justify-end gap-2 mb-6">
          <Button onClick={handleExportPDF} variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            Generar PDF
          </Button>
          <Button onClick={handleExportImage} variant="outline" className="gap-2">
            <Image className="w-4 h-4" />
            Guardar como JPG
          </Button>
        </div>

        <div id="export-content">
        <Tabs value={activeSport} onValueChange={(v: any) => setActiveSport(v)} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-auto p-1 bg-black/40 backdrop-blur-sm">
            <TabsTrigger
              value="soccer"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white py-3 hover:bg-green-100 dark:hover:bg-green-900"
            >
              <div className="flex flex-col items-center gap-1">
                <SoccerBallIcon className="w-7 h-7 text-green-600 dark:text-green-400" />
                <span className="font-bold text-sm">Fútbol</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="basketball"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white py-3 hover:bg-orange-100 dark:hover:bg-orange-900"
            >
              <div className="flex flex-col items-center gap-1">
                <BasketballIcon className="w-7 h-7 text-orange-600 dark:text-orange-400" />
                <span className="font-bold text-sm">Baloncesto</span>
              </div>
            </TabsTrigger>
            <TabsTrigger
              value="cheerleading"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-red-500 data-[state=active]:text-white py-3 hover:bg-pink-100 dark:hover:bg-pink-900"
            >
              <div className="flex flex-col items-center gap-1">
                <PompomsIcon className="w-7 h-7 text-pink-600 dark:text-pink-400" />
                <span className="font-bold text-sm">Cheerleading</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Soccer Tab */}
          <TabsContent value="soccer" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Standings */}
              <Card className="bg-black/40 backdrop-blur-sm border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Trophy className="w-5 h-5 text-green-400" />
                    Tabla de Clasificación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-gray-300">Pos</TableHead>
                          <TableHead className="text-gray-300">Equipo</TableHead>
                          <TableHead className="text-gray-300">PJ</TableHead>
                          <TableHead className="text-gray-300">G</TableHead>
                          <TableHead className="text-gray-300">E</TableHead>
                          <TableHead className="text-gray-300">P</TableHead>
                          <TableHead className="text-gray-300">DG</TableHead>
                          <TableHead className="text-gray-300">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {soccerStandings?.map((team, index) => (
                          <TableRow key={team.teamId} className="border-white/10">
                            <TableCell className="font-bold text-white">{index + 1}</TableCell>
                            <TableCell className="font-medium text-white">{team.teamName}</TableCell>
                            <TableCell className="text-gray-300">{team.played}</TableCell>
                            <TableCell className="text-green-400">{team.won}</TableCell>
                            <TableCell className="text-yellow-400">{team.drawn}</TableCell>
                            <TableCell className="text-red-400">{team.lost}</TableCell>
                            <TableCell className="text-gray-300">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</TableCell>
                            <TableCell className="font-bold text-white">{team.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {(!soccerStandings || soccerStandings.length === 0) && (
                    <p className="text-center py-8 text-gray-400">No hay datos de clasificación disponibles</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Scorers */}
              <Card className="bg-black/40 backdrop-blur-sm border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="w-5 h-5 text-green-400" />
                    Máximos Goleadores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {soccerTopScorers?.map((scorer, index) => (
                      <div
                        key={scorer.playerId}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-green-400">{index + 1}</span>
                          <div>
                            <p className="font-semibold text-white">{scorer.playerName}</p>
                            <p className="text-sm text-gray-400">{scorer.teamName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-green-400">{scorer.totalStats}</p>
                          <p className="text-xs text-gray-400">goles</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(!soccerTopScorers || soccerTopScorers.length === 0) && (
                    <p className="text-center py-8 text-gray-400">No hay estadísticas de goleadores disponibles</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Matches Division */}
            <div className="space-y-6">
              {/* Upcoming Matches */}
              <Card className="bg-white/90 dark:bg-black/40 backdrop-blur-sm border-green-200 dark:border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Clock className="w-5 h-5" />
                    Próximos Partidos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {soccerUpcoming?.filter(m => new Date(m.matchDate) > new Date()).slice(0, 5).map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-300 dark:border-green-500/30"
                      >
                        <div className="flex-1 text-right">
                          <p className="font-semibold text-green-900 dark:text-white">{getTeamName(match.homeTeamId, "soccer")}</p>
                        </div>
                        <div className="px-4">
                          <p className="text-2xl font-bold text-green-600 dark:text-green-400">VS</p>
                          <p className="text-xs text-green-600 dark:text-gray-400">{new Date(match.matchDate).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-green-900 dark:text-white">{getTeamName(match.awayTeamId, "soccer")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(!soccerUpcoming?.filter(m => new Date(m.matchDate) > new Date()) || soccerUpcoming?.filter(m => new Date(m.matchDate) > new Date()).length === 0) && (
                    <p className="text-center py-8 text-green-600 dark:text-gray-400">No hay próximos partidos programados</p>
                  )}
                </CardContent>
              </Card>

              {/* Past Matches */}
              <Card className="bg-white/90 dark:bg-black/40 backdrop-blur-sm border-gray-200 dark:border-gray-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-700 dark:text-gray-400">
                    <CheckCircle className="w-5 h-5" />
                    Partidos Anteriores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {soccerUpcoming?.filter(m => new Date(m.matchDate) <= new Date()).slice(0, 5).map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 border border-gray-300 dark:border-gray-500/30"
                      >
                        <div className="flex-1 text-right">
                          <p className="font-semibold text-gray-900 dark:text-white">{getTeamName(match.homeTeamId, "soccer")}</p>
                        </div>
                        <div className="px-4">
                          <p className="text-2xl font-bold text-gray-600 dark:text-gray-400">VS</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{new Date(match.matchDate).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 dark:text-white">{getTeamName(match.awayTeamId, "soccer")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(!soccerUpcoming?.filter(m => new Date(m.matchDate) <= new Date()) || soccerUpcoming?.filter(m => new Date(m.matchDate) <= new Date()).length === 0) && (
                    <p className="text-center py-8 text-gray-600 dark:text-gray-400">No hay partidos anteriores</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Basketball Tab */}
          <TabsContent value="basketball" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Standings */}
              <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Trophy className="w-5 h-5 text-orange-400" />
                    Tabla de Clasificación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-white/10">
                          <TableHead className="text-gray-300">Pos</TableHead>
                          <TableHead className="text-gray-300">Equipo</TableHead>
                          <TableHead className="text-gray-300">PJ</TableHead>
                          <TableHead className="text-gray-300">G</TableHead>
                          <TableHead className="text-gray-300">P</TableHead>
                          <TableHead className="text-gray-300">Dif</TableHead>
                          <TableHead className="text-gray-300">Pts</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {basketballStandings?.map((team, index) => (
                          <TableRow key={team.teamId} className="border-white/10">
                            <TableCell className="font-bold text-white">{index + 1}</TableCell>
                            <TableCell className="font-medium text-white">{team.teamName}</TableCell>
                            <TableCell className="text-gray-300">{team.played}</TableCell>
                            <TableCell className="text-green-400">{team.won}</TableCell>
                            <TableCell className="text-red-400">{team.lost}</TableCell>
                            <TableCell className="text-gray-300">{team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}</TableCell>
                            <TableCell className="font-bold text-white">{team.points}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {(!basketballStandings || basketballStandings.length === 0) && (
                    <p className="text-center py-8 text-gray-400">No hay datos de clasificación disponibles</p>
                  )}
                </CardContent>
              </Card>

              {/* Top Scorers */}
              <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Target className="w-5 h-5 text-orange-400" />
                    Líderes de Anotación
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {basketballTopScorers?.map((scorer, index) => (
                      <div
                        key={scorer.playerId}
                        className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-orange-400">{index + 1}</span>
                          <div>
                            <p className="font-semibold text-white">{scorer.playerName}</p>
                            <p className="text-sm text-gray-400">{scorer.teamName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-orange-400">{scorer.totalStats}</p>
                          <p className="text-xs text-gray-400">puntos</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {(!basketballTopScorers || basketballTopScorers.length === 0) && (
                    <p className="text-center py-8 text-gray-400">No hay estadísticas de anotadores disponibles</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Upcoming Matches */}
            <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  Próximos Partidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {basketballUpcoming?.slice(0, 5).map((match) => (
                    <div
                      key={match.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30"
                    >
                      <div className="flex-1 text-right">
                        <p className="font-semibold text-white">{getTeamName(match.homeTeamId, "basketball")}</p>
                      </div>
                      <div className="px-4">
                        <p className="text-2xl font-bold text-orange-400">VS</p>
                        <p className="text-xs text-gray-400">{new Date(match.matchDate).toLocaleDateString('es-ES')}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-white">{getTeamName(match.awayTeamId, "basketball")}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {(!basketballUpcoming || basketballUpcoming.length === 0) && (
                  <p className="text-center py-8 text-gray-400">No hay próximos partidos programados</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cheerleading Tab */}
          <TabsContent value="cheerleading" className="space-y-6">
            <Card className="bg-black/40 backdrop-blur-sm border-blue-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5 text-blue-400" />
                  Rankings de Cheerleading
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {cheerleadingRankings?.map((ranking) => (
                    <div
                      key={ranking.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-900/20 to-cyan-900/20 border border-blue-500/30"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-bold text-xl">
                          {ranking.rank}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-white">{ranking.teamName}</p>
                          {ranking.notes && <p className="text-sm text-gray-400">{ranking.notes}</p>}
                        </div>
                      </div>
                      {ranking.score && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-400">{ranking.score}</p>
                          <p className="text-xs text-gray-400">puntos</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {(!cheerleadingRankings || cheerleadingRankings.length === 0) && (
                  <p className="text-center py-8 text-gray-400">No hay rankings disponibles</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/30 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400">
          <p>© 2026 Torno Intersalesiano - Gestión de Torneos Multideportivos</p>
        </div>
      </footer>
    </div>
  );
}
