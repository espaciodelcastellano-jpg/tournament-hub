import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Pencil, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import { ExcelPlayerImporter } from "@/components/ExcelPlayerImporter";
import type { PlayerData } from "@/lib/excelParser";

export default function AdminPlayers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExcelImporterOpen, setIsExcelImporterOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [selectedSport, setSelectedSport] = useState<"soccer" | "basketball" | "cheerleading">("soccer");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    teamId: "",
    jerseyNumber: "",
    position: "",
  });

  const { data: teams } = trpc.teams.list.useQuery({ sport: selectedSport });
  const { data: players, isLoading, refetch } = trpc.players.list.useQuery({});
  const createPlayer = trpc.players.create.useMutation();
  const updatePlayer = trpc.players.update.useMutation();
  const deletePlayer = trpc.players.delete.useMutation();
  const bulkCreatePlayers = trpc.players.bulkCreate.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPlayer) {
        await updatePlayer.mutateAsync({
          id: editingPlayer.id,
          name: formData.name,
          jerseyNumber: formData.jerseyNumber || undefined,
          position: formData.position || undefined,
        });
        toast.success("Jugador actualizado exitosamente");
      } else {
        await createPlayer.mutateAsync({
          name: formData.name,
          teamId: parseInt(formData.teamId),
          jerseyNumber: formData.jerseyNumber || undefined,
          position: formData.position || undefined,
        });
        toast.success("Jugador creado exitosamente");
      }
      
      setIsDialogOpen(false);
      setEditingPlayer(null);
      setFormData({ name: "", teamId: "", jerseyNumber: "", position: "" });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el jugador");
    }
  };

  const handleEdit = (player: any) => {
    setEditingPlayer(player);
    setFormData({
      name: player.name,
      teamId: player.teamId.toString(),
      jerseyNumber: player.jerseyNumber || "",
      position: player.position || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este jugador?")) return;
    
    try {
      await deletePlayer.mutateAsync({ id });
      toast.success("Jugador eliminado exitosamente");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el jugador");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingPlayer(null);
    setFormData({ name: "", teamId: "", jerseyNumber: "", position: "" });
  };

  const getTeamName = (teamId: number) => {
    const allTeams = teams || [];
    const team = allTeams.find((t: any) => t.id === teamId);
    return team?.name || "N/A";
  };

  const filteredPlayers = players?.filter((player) => {
    const team = teams?.find((t: any) => t.id === player.teamId);
    return team !== undefined;
  });

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
        <h1 className="text-3xl font-bold">Gestión de Jugadores</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogClose()}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Jugador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPlayer ? "Editar Jugador" : "Crear Nuevo Jugador"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Jugador</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              {!editingPlayer && (
                <>
                  <div>
                    <Label htmlFor="sport">Deporte</Label>
                    <Select
                      value={selectedSport}
                      onValueChange={(value: any) => {
                        setSelectedSport(value);
                        setFormData({ ...formData, teamId: "" });
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
                    <Label htmlFor="teamId">Equipo</Label>
                    <Select
                      value={formData.teamId}
                      onValueChange={(value) => setFormData({ ...formData, teamId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar equipo" />
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
                </>
              )}
              
              <div>
                <Label htmlFor="jerseyNumber">Número de Camiseta (opcional)</Label>
                <Input
                  id="jerseyNumber"
                  value={formData.jerseyNumber}
                  onChange={(e) => setFormData({ ...formData, jerseyNumber: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="position">Posición (opcional)</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createPlayer.isPending || updatePlayer.isPending}>
                  {(createPlayer.isPending || updatePlayer.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingPlayer ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-4">
        <div>
          <Label>Filtrar por Deporte</Label>
          <Select
            value={selectedSport}
            onValueChange={(value: any) => {
              setSelectedSport(value);
              setSelectedTeam("");
            }}
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
        
        <div>
          <Label>Filtrar por Equipo</Label>
          <Select
            value={selectedTeam}
            onValueChange={(value: any) => setSelectedTeam(value)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todos los equipos" />
            </SelectTrigger>
            <SelectContent>
              {teams?.map((team) => (
                <SelectItem key={team.id} value={team.id.toString()}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Número</TableHead>
              <TableHead>Posición</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlayers?.map((player) => (
              <TableRow key={player.id}>
                <TableCell className="font-medium">{player.name}</TableCell>
                <TableCell>{getTeamName(player.teamId)}</TableCell>
                <TableCell>{player.jerseyNumber || "-"}</TableCell>
                <TableCell>{player.position || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(player)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(player.id)}
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

      {filteredPlayers?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No hay jugadores registrados para este deporte. Crea el primer jugador para comenzar.
        </div>
      )}
    </div>
  );
}
