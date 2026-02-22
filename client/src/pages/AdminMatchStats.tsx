import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function AdminMatchStats() {
  const [selectedSport, setSelectedSport] = useState<"soccer" | "basketball">("soccer");
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);
  const [homeScore, setHomeScore] = useState("0");
  const [awayScore, setAwayScore] = useState("0");
  
  // Goleadores/Anotadores
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [goalsPoints, setGoalsPoints] = useState("0");
  const [minute, setMinute] = useState("0");
  const [pointType, setPointType] = useState<"1" | "2" | "3">("2");
  
  // Amonestaciones
  const [cardPlayer, setCardPlayer] = useState<string>("");
  const [cardType, setCardType] = useState<"yellow" | "red">("yellow");
  const [cardMinute, setCardMinute] = useState("0");
  
  // Listas locales de estadísticas
  const [goalsList, setGoalsList] = useState<any[]>([]);
  const [cardsList, setCardsList] = useState<any[]>([]);

  // Queries
  const { data: matches } = trpc.matches.list.useQuery({ sport: selectedSport });
  const { data: players } = trpc.players.list.useQuery({});

  const handleAddGoal = () => {
    if (!selectedPlayer || !selectedMatch) {
      toast.error("Selecciona jugador y partido");
      return;
    }
    
    const player = players?.find(p => p.id === parseInt(selectedPlayer));
    if (!player) return;
    
    const newGoal = {
      id: Date.now(),
      playerId: parseInt(selectedPlayer),
      playerName: player.name,
      goals: parseInt(goalsPoints),
      minute: parseInt(minute),
      sport: selectedSport,
    };
    
    setGoalsList([...goalsList, newGoal]);
    setSelectedPlayer("");
    setGoalsPoints("0");
    setMinute("0");
  };

  const handleRemoveGoal = (id: number) => {
    setGoalsList(goalsList.filter(g => g.id !== id));
  };

  const handleAddCard = () => {
    if (!cardPlayer || !selectedMatch) {
      toast.error("Selecciona jugador y partido");
      return;
    }
    
    const player = players?.find(p => p.id === parseInt(cardPlayer));
    if (!player) return;
    
    const newCard = {
      id: Date.now(),
      playerId: parseInt(cardPlayer),
      playerName: player.name,
      cardType: cardType,
      minute: parseInt(cardMinute),
    };
    
    setCardsList([...cardsList, newCard]);
    setCardPlayer("");
    setCardType("yellow");
    setCardMinute("0");
  };

  const handleRemoveCard = (id: number) => {
    setCardsList(cardsList.filter(c => c.id !== id));
  };

  const handleSaveStats = () => {
    if (!selectedMatch) {
      toast.error("Selecciona un partido");
      return;
    }
    
    toast.success(`Estadísticas guardadas: ${goalsList.length} goles/puntos, ${cardsList.length} amonestaciones`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Trophy className="w-6 h-6 text-yellow-500" />
        <h1 className="text-3xl font-bold text-white">Registrar Estadísticas</h1>
      </div>

      <Tabs value={selectedSport} onValueChange={(v: any) => {
        setSelectedSport(v);
        setSelectedMatch(null);
        setGoalsList([]);
        setCardsList([]);
      }} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="soccer">Fútbol</TabsTrigger>
          <TabsTrigger value="basketball">Baloncesto</TabsTrigger>
        </TabsList>

        {/* Soccer Stats */}
        <TabsContent value="soccer" className="space-y-6">
          {/* Seleccionar Partido */}
          <Card className="bg-black/40 backdrop-blur-sm border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white">1. Seleccionar Partido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Partido</Label>
                <Select value={selectedMatch?.toString() || ""} onValueChange={(v) => setSelectedMatch(parseInt(v))}>
                  <SelectTrigger className="bg-black/40 border-green-500/30 text-white">
                    <SelectValue placeholder="Elige un partido" />
                  </SelectTrigger>
                  <SelectContent>
                    {matches?.filter((m) => m.sport === "soccer").map((match) => (
                      <SelectItem key={match.id} value={match.id.toString()}>
                        {`${match.homeTeamId} vs ${match.awayTeamId}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Goles Local</Label>
                  <Input
                    type="number"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="bg-black/40 border-green-500/30 text-white"
                    min="0"
                  />
                </div>
                <div>
                  <Label className="text-white">Goles Visitante</Label>
                  <Input
                    type="number"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="bg-black/40 border-green-500/30 text-white"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registrar Goleadores */}
          <Card className="bg-black/40 backdrop-blur-sm border-green-500/30">
            <CardHeader>
              <CardTitle className="text-white">2. Registrar Goleadores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label className="text-white text-sm">Jugador</Label>
                  <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                    <SelectTrigger className="bg-black/40 border-green-500/30 text-white text-sm">
                      <SelectValue placeholder="Jugador" />
                    </SelectTrigger>
                    <SelectContent>
                      {players?.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white text-sm">Goles</Label>
                  <Input 
                    type="number" 
                    value={goalsPoints}
                    onChange={(e) => setGoalsPoints(e.target.value)}
                    className="bg-black/40 border-green-500/30 text-white text-sm" 
                    min="0" 
                  />
                </div>
                <div>
                  <Label className="text-white text-sm">Minuto</Label>
                  <Input 
                    type="number" 
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className="bg-black/40 border-green-500/30 text-white text-sm" 
                    min="0" 
                    max="120"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddGoal} className="w-full bg-green-600 hover:bg-green-700 h-10">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tabla de Goleadores */}
              {goalsList.length > 0 && (
                <div className="mt-4">
                  <Label className="text-white text-sm font-semibold">Goleadores Registrados:</Label>
                  <div className="border border-green-500/30 rounded-lg overflow-hidden mt-2">
                    <Table className="text-sm">
                      <TableHeader>
                        <TableRow className="bg-green-900/20">
                          <TableHead className="text-green-400">Jugador</TableHead>
                          <TableHead className="text-green-400">Goles</TableHead>
                          <TableHead className="text-green-400">Minuto</TableHead>
                          <TableHead className="text-right text-green-400">Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {goalsList.map((goal) => (
                          <TableRow key={goal.id} className="border-green-500/20">
                            <TableCell className="text-white">{goal.playerName}</TableCell>
                            <TableCell className="text-white">{goal.goals}</TableCell>
                            <TableCell className="text-white">{goal.minute}'</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                onClick={() => handleRemoveGoal(goal.id)}
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Registrar Amonestaciones */}
          <Card className="bg-black/40 backdrop-blur-sm border-yellow-500/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                3. Registrar Amonestaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label className="text-white text-sm">Jugador</Label>
                  <Select value={cardPlayer} onValueChange={setCardPlayer}>
                    <SelectTrigger className="bg-black/40 border-yellow-500/30 text-white text-sm">
                      <SelectValue placeholder="Jugador" />
                    </SelectTrigger>
                    <SelectContent>
                      {players?.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white text-sm">Tarjeta</Label>
                  <Select value={cardType} onValueChange={(v: any) => setCardType(v)}>
                    <SelectTrigger className="bg-black/40 border-yellow-500/30 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yellow">🟨 Amarilla</SelectItem>
                      <SelectItem value="red">🟥 Roja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white text-sm">Minuto</Label>
                  <Input 
                    type="number" 
                    value={cardMinute}
                    onChange={(e) => setCardMinute(e.target.value)}
                    className="bg-black/40 border-yellow-500/30 text-white text-sm" 
                    min="0" 
                    max="120"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddCard} className="w-full bg-yellow-600 hover:bg-yellow-700 h-10">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tabla de Amonestaciones */}
              {cardsList.length > 0 && (
                <div className="mt-4">
                  <Label className="text-white text-sm font-semibold">Amonestaciones Registradas:</Label>
                  <div className="border border-yellow-500/30 rounded-lg overflow-hidden mt-2">
                    <Table className="text-sm">
                      <TableHeader>
                        <TableRow className="bg-yellow-900/20">
                          <TableHead className="text-yellow-400">Jugador</TableHead>
                          <TableHead className="text-yellow-400">Tarjeta</TableHead>
                          <TableHead className="text-yellow-400">Minuto</TableHead>
                          <TableHead className="text-right text-yellow-400">Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {cardsList.map((card) => (
                          <TableRow key={card.id} className="border-yellow-500/20">
                            <TableCell className="text-white">{card.playerName}</TableCell>
                            <TableCell className="text-white">{card.cardType === "yellow" ? "🟨 Amarilla" : "🟥 Roja"}</TableCell>
                            <TableCell className="text-white">{card.minute}'</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                onClick={() => handleRemoveCard(card.id)}
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleSaveStats} className="w-full bg-green-600 hover:bg-green-700 h-12 text-lg">
            Guardar Todas las Estadísticas
          </Button>
        </TabsContent>

        {/* Basketball Stats */}
        <TabsContent value="basketball" className="space-y-6">
          {/* Seleccionar Partido */}
          <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-white">1. Seleccionar Partido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-white">Partido</Label>
                <Select value={selectedMatch?.toString() || ""} onValueChange={(v) => setSelectedMatch(parseInt(v))}>
                  <SelectTrigger className="bg-black/40 border-orange-500/30 text-white">
                    <SelectValue placeholder="Elige un partido" />
                  </SelectTrigger>
                  <SelectContent>
                    {matches?.filter((m) => m.sport === "basketball").map((match) => (
                      <SelectItem key={match.id} value={match.id.toString()}>
                        {`${match.homeTeamId} vs ${match.awayTeamId}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Puntos Local</Label>
                  <Input
                    type="number"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    className="bg-black/40 border-orange-500/30 text-white"
                    min="0"
                  />
                </div>
                <div>
                  <Label className="text-white">Puntos Visitante</Label>
                  <Input
                    type="number"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    className="bg-black/40 border-orange-500/30 text-white"
                    min="0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registrar Anotadores */}
          <Card className="bg-black/40 backdrop-blur-sm border-orange-500/30">
            <CardHeader>
              <CardTitle className="text-white">2. Registrar Anotadores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <Label className="text-white text-sm">Jugador</Label>
                  <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                    <SelectTrigger className="bg-black/40 border-orange-500/30 text-white text-sm">
                      <SelectValue placeholder="Jugador" />
                    </SelectTrigger>
                    <SelectContent>
                      {players?.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white text-sm">Puntos</Label>
                  <Input 
                    type="number" 
                    value={goalsPoints}
                    onChange={(e) => setGoalsPoints(e.target.value)}
                    className="bg-black/40 border-orange-500/30 text-white text-sm" 
                    min="0" 
                  />
                </div>
                <div>
                  <Label className="text-white text-sm">Tipo</Label>
                  <Select value={pointType} onValueChange={(v: any) => setPointType(v)}>
                    <SelectTrigger className="bg-black/40 border-orange-500/30 text-white text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Punto</SelectItem>
                      <SelectItem value="2">2 Puntos</SelectItem>
                      <SelectItem value="3">3 Puntos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white text-sm">Minuto</Label>
                  <Input 
                    type="number" 
                    value={minute}
                    onChange={(e) => setMinute(e.target.value)}
                    className="bg-black/40 border-orange-500/30 text-white text-sm" 
                    min="0" 
                    max="40"
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddGoal} className="w-full bg-orange-600 hover:bg-orange-700 h-10">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Tabla de Anotadores */}
              {goalsList.length > 0 && (
                <div className="mt-4">
                  <Label className="text-white text-sm font-semibold">Anotadores Registrados:</Label>
                  <div className="border border-orange-500/30 rounded-lg overflow-hidden mt-2">
                    <Table className="text-sm">
                      <TableHeader>
                        <TableRow className="bg-orange-900/20">
                          <TableHead className="text-orange-400">Jugador</TableHead>
                          <TableHead className="text-orange-400">Puntos</TableHead>
                          <TableHead className="text-orange-400">Tipo</TableHead>
                          <TableHead className="text-orange-400">Minuto</TableHead>
                          <TableHead className="text-right text-orange-400">Acción</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {goalsList.map((goal) => (
                          <TableRow key={goal.id} className="border-orange-500/20">
                            <TableCell className="text-white">{goal.playerName}</TableCell>
                            <TableCell className="text-white">{goal.goals}</TableCell>
                            <TableCell className="text-white">{pointType} Punto(s)</TableCell>
                            <TableCell className="text-white">{goal.minute}'</TableCell>
                            <TableCell className="text-right">
                              <Button 
                                onClick={() => handleRemoveGoal(goal.id)}
                                size="sm"
                                variant="ghost"
                                className="text-red-400 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Button onClick={handleSaveStats} className="w-full bg-orange-600 hover:bg-orange-700 h-12 text-lg">
            Guardar Todas las Estadísticas
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
