import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Pencil, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function AdminMatches() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isScoreDialogOpen, setIsScoreDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [scoringMatch, setScoringMatch] = useState<any>(null);
  const [selectedSport, setSelectedSport] = useState<"soccer" | "basketball" | "cheerleading">("soccer");
  const [formData, setFormData] = useState({
    sport: "soccer" as "soccer" | "basketball" | "cheerleading",
    homeTeamId: "",
    awayTeamId: "",
    matchDate: "",
    venue: "",
  });
  const [scoreData, setScoreData] = useState({
    homeScore: "",
    awayScore: "",
    status: "completed" as "scheduled" | "in_progress" | "completed" | "cancelled",
  });

  const { data: teams } = trpc.teams.list.useQuery({ sport: selectedSport });
  const { data: matches, isLoading, refetch } = trpc.matches.list.useQuery({});
  const createMatch = trpc.matches.create.useMutation();
  const updateMatch = trpc.matches.update.useMutation();
  const deleteMatch = trpc.matches.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMatch) {
        await updateMatch.mutateAsync({
          id: editingMatch.id,
          matchDate: formData.matchDate || undefined,
          venue: formData.venue || undefined,
        });
        toast.success("Partido actualizado exitosamente");
      } else {
        await createMatch.mutateAsync({
          sport: formData.sport,
          homeTeamId: parseInt(formData.homeTeamId),
          awayTeamId: parseInt(formData.awayTeamId),
          matchDate: formData.matchDate,
          venue: formData.venue || undefined,
        });
        toast.success("Partido creado exitosamente");
      }
      
      setIsDialogOpen(false);
      setEditingMatch(null);
      setFormData({ sport: "soccer", homeTeamId: "", awayTeamId: "", matchDate: "", venue: "" });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el partido");
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateMatch.mutateAsync({
        id: scoringMatch.id,
        homeScore: parseInt(scoreData.homeScore),
        awayScore: parseInt(scoreData.awayScore),
        status: scoreData.status,
      });
      toast.success("Resultado registrado exitosamente");
      setIsScoreDialogOpen(false);
      setScoringMatch(null);
      setScoreData({ homeScore: "", awayScore: "", status: "completed" });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al registrar el resultado");
    }
  };

  const handleEdit = (match: any) => {
    setEditingMatch(match);
    setFormData({
      sport: match.sport,
      homeTeamId: match.homeTeamId.toString(),
      awayTeamId: match.awayTeamId.toString(),
      matchDate: match.matchDate ? new Date(match.matchDate).toISOString().slice(0, 16) : "",
      venue: match.venue || "",
    });
    setIsDialogOpen(true);
  };

  const handleScore = (match: any) => {
    setScoringMatch(match);
    setScoreData({
      homeScore: match.homeScore?.toString() || "",
      awayScore: match.awayScore?.toString() || "",
      status: match.status || "completed",
    });
    setIsScoreDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este partido?")) return;
    
    try {
      await deleteMatch.mutateAsync({ id });
      toast.success("Partido eliminado exitosamente");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el partido");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingMatch(null);
    setFormData({ sport: "soccer", homeTeamId: "", awayTeamId: "", matchDate: "", venue: "" });
  };

  const getTeamName = (teamId: number) => {
    const allMatches = matches || [];
    const allTeams: any[] = [];
    
    allMatches.forEach((match: any) => {
      if (!allTeams.find(t => t.id === match.homeTeamId)) {
        allTeams.push({ id: match.homeTeamId, name: `Equipo ${match.homeTeamId}` });
      }
      if (!allTeams.find(t => t.id === match.awayTeamId)) {
        allTeams.push({ id: match.awayTeamId, name: `Equipo ${match.awayTeamId}` });
      }
    });
    
    const team = teams?.find((t: any) => t.id === teamId) || allTeams.find(t => t.id === teamId);
    return team?.name || "N/A";
  };

  const filteredMatches = matches?.filter((match) => match.sport === selectedSport);

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      scheduled: "Programado",
      in_progress: "En Progreso",
      completed: "Completado",
      cancelled: "Cancelado",
    };
    return labels[status] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestión de Partidos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogClose()}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Partido
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingMatch ? "Editar Partido" : "Programar Nuevo Partido"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingMatch && (
                <>
                  <div>
                    <Label htmlFor="sport">Deporte</Label>
                    <Select
                      value={formData.sport}
                      onValueChange={(value: any) => {
                        setFormData({ ...formData, sport: value, homeTeamId: "", awayTeamId: "" });
                        setSelectedSport(value);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="soccer">Fútbol</SelectItem>
                        <SelectItem value="basketball">Baloncesto</SelectItem>
                        <SelectItem value="cheerleading">Cheerleading</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="homeTeamId">Equipo Local</Label>
                    <Select
                      value={formData.homeTeamId}
                      onValueChange={(value) => setFormData({ ...formData, homeTeamId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar equipo local" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams?.map((team: any) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="awayTeamId">Equipo Visitante</Label>
                    <Select
                      value={formData.awayTeamId}
                      onValueChange={(value) => setFormData({ ...formData, awayTeamId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar equipo visitante" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams?.filter((t: any) => t.id.toString() !== formData.homeTeamId).map((team: any) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              <div>
                <Label htmlFor="matchDate">Fecha y Hora del Partido</Label>
                <Input
                  id="matchDate"
                  type="datetime-local"
                  value={formData.matchDate}
                  onChange={(e) => setFormData({ ...formData, matchDate: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="venue">Lugar (opcional)</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  placeholder="Estadio, cancha, etc."
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMatch.isPending || updateMatch.isPending}>
                  {(createMatch.isPending || updateMatch.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingMatch ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isScoreDialogOpen} onOpenChange={setIsScoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Resultado</DialogTitle>
          </DialogHeader>
          {scoringMatch && (
            <form onSubmit={handleScoreSubmit} className="space-y-4">
              <div className="text-center py-2">
                <p className="text-lg font-semibold">
                  {getTeamName(scoringMatch.homeTeamId)} vs {getTeamName(scoringMatch.awayTeamId)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="homeScore">Marcador Local</Label>
                  <Input
                    id="homeScore"
                    type="number"
                    min="0"
                    value={scoreData.homeScore}
                    onChange={(e) => setScoreData({ ...scoreData, homeScore: e.target.value })}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="awayScore">Marcador Visitante</Label>
                  <Input
                    id="awayScore"
                    type="number"
                    min="0"
                    value={scoreData.awayScore}
                    onChange={(e) => setScoreData({ ...scoreData, awayScore: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={scoreData.status}
                  onValueChange={(value: any) => setScoreData({ ...scoreData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Programado</SelectItem>
                    <SelectItem value="in_progress">En Progreso</SelectItem>
                    <SelectItem value="completed">Completado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsScoreDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={updateMatch.isPending}>
                  {updateMatch.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Guardar Resultado
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div>
        <Label>Filtrar por Deporte</Label>
        <Select
          value={selectedSport}
          onValueChange={(value: any) => setSelectedSport(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="soccer">Fútbol</SelectItem>
            <SelectItem value="basketball">Baloncesto</SelectItem>
            <SelectItem value="cheerleading">Cheerleading</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Equipo Local</TableHead>
              <TableHead>Equipo Visitante</TableHead>
              <TableHead>Resultado</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Lugar</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMatches?.map((match) => (
              <TableRow key={match.id}>
                <TableCell>
                  {match.matchDate ? new Date(match.matchDate).toLocaleString('es-ES') : "N/A"}
                </TableCell>
                <TableCell className="font-medium">{getTeamName(match.homeTeamId)}</TableCell>
                <TableCell className="font-medium">{getTeamName(match.awayTeamId)}</TableCell>
                <TableCell>
                  {match.homeScore !== null && match.awayScore !== null
                    ? `${match.homeScore} - ${match.awayScore}`
                    : "-"}
                </TableCell>
                <TableCell>{getStatusLabel(match.status)}</TableCell>
                <TableCell>{match.venue || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleScore(match)}
                    >
                      <Trophy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(match)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(match.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredMatches?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No hay partidos programados para este deporte. Crea el primer partido para comenzar.
        </div>
      )}
    </div>
  );
}
