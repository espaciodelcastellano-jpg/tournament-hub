import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminTeams() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    sport: "soccer" as "soccer" | "basketball" | "cheerleading",
    logoUrl: "",
  });

  const { data: teams, isLoading, refetch } = trpc.teams.list.useQuery({});
  const createTeam = trpc.teams.create.useMutation();
  const updateTeam = trpc.teams.update.useMutation();
  const deleteTeam = trpc.teams.delete.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTeam) {
        await updateTeam.mutateAsync({
          id: editingTeam.id,
          name: formData.name,
          logoUrl: formData.logoUrl || undefined,
        });
        toast.success("Equipo actualizado exitosamente");
      } else {
        await createTeam.mutateAsync(formData);
        toast.success("Equipo creado exitosamente");
      }
      
      setIsDialogOpen(false);
      setEditingTeam(null);
      setFormData({ name: "", sport: "soccer", logoUrl: "" });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el equipo");
    }
  };

  const handleEdit = (team: any) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      sport: team.sport,
      logoUrl: team.logoUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este equipo?")) return;
    
    try {
      await deleteTeam.mutateAsync({ id });
      toast.success("Equipo eliminado exitosamente");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el equipo");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTeam(null);
    setFormData({ name: "", sport: "soccer", logoUrl: "" });
  };

  const getSportLabel = (sport: string) => {
    const labels: Record<string, string> = {
      soccer: "Fútbol",
      basketball: "Baloncesto",
      cheerleading: "Cheerleading",
    };
    return labels[sport] || sport;
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
        <h1 className="text-3xl font-bold">Gestión de Equipos</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogClose()}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Equipo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTeam ? "Editar Equipo" : "Crear Nuevo Equipo"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Equipo</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              {!editingTeam && (
                <div>
                  <Label htmlFor="sport">Deporte</Label>
                  <Select
                    value={formData.sport}
                    onValueChange={(value: any) => setFormData({ ...formData, sport: value })}
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
              )}
              
              <div>
                <Label htmlFor="logoUrl">URL del Logo (opcional)</Label>
                <Input
                  id="logoUrl"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://ejemplo.com/logo.png"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createTeam.isPending || updateTeam.isPending}>
                  {(createTeam.isPending || updateTeam.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingTeam ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams?.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{team.name}</span>
                <span className="text-sm font-normal text-muted-foreground">
                  {getSportLabel(team.sport)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(team)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(team.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teams?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No hay equipos registrados. Crea el primer equipo para comenzar.
        </div>
      )}
    </div>
  );
}
