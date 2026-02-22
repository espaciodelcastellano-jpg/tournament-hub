import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCheerleading() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRanking, setEditingRanking] = useState<any>(null);
  const [formData, setFormData] = useState({
    teamId: "",
    rank: "",
    score: "",
    notes: "",
  });

  const { data: teams } = trpc.teams.list.useQuery({ sport: "cheerleading" });
  const { data: rankings, isLoading, refetch } = trpc.cheerleading.rankings.useQuery();
  const createRanking = trpc.cheerleading.createRanking.useMutation();
  const updateRanking = trpc.cheerleading.updateRanking.useMutation();
  const deleteRanking = trpc.cheerleading.deleteRanking.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRanking) {
        await updateRanking.mutateAsync({
          id: editingRanking.id,
          rank: parseInt(formData.rank),
          score: formData.score ? parseInt(formData.score) : undefined,
          notes: formData.notes || undefined,
        });
        toast.success("Ranking actualizado exitosamente");
      } else {
        await createRanking.mutateAsync({
          teamId: parseInt(formData.teamId),
          rank: parseInt(formData.rank),
          score: formData.score ? parseInt(formData.score) : undefined,
          notes: formData.notes || undefined,
        });
        toast.success("Ranking creado exitosamente");
      }
      
      setIsDialogOpen(false);
      setEditingRanking(null);
      setFormData({ teamId: "", rank: "", score: "", notes: "" });
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al guardar el ranking");
    }
  };

  const handleEdit = (ranking: any) => {
    setEditingRanking(ranking);
    setFormData({
      teamId: ranking.teamId.toString(),
      rank: ranking.rank.toString(),
      score: ranking.score?.toString() || "",
      notes: ranking.notes || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de eliminar este ranking?")) return;
    
    try {
      await deleteRanking.mutateAsync({ id });
      toast.success("Ranking eliminado exitosamente");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Error al eliminar el ranking");
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingRanking(null);
    setFormData({ teamId: "", rank: "", score: "", notes: "" });
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
        <h1 className="text-3xl font-bold">Rankings de Cheerleading</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleDialogClose()}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Ranking
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRanking ? "Editar Ranking" : "Crear Nuevo Ranking"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingRanking && (
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
              )}
              
              <div>
                <Label htmlFor="rank">Posición</Label>
                <Input
                  id="rank"
                  type="number"
                  min="1"
                  value={formData.rank}
                  onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="score">Puntuación (opcional)</Label>
                <Input
                  id="score"
                  type="number"
                  min="0"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                />
              </div>
              
              <div>
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Comentarios adicionales sobre la presentación..."
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createRanking.isPending || updateRanking.isPending}>
                  {(createRanking.isPending || updateRanking.isPending) && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {editingRanking ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posición</TableHead>
              <TableHead>Equipo</TableHead>
              <TableHead>Puntuación</TableHead>
              <TableHead>Notas</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings?.map((ranking) => (
              <TableRow key={ranking.id}>
                <TableCell className="font-bold text-lg">{ranking.rank}º</TableCell>
                <TableCell className="font-medium">{ranking.teamName}</TableCell>
                <TableCell>{ranking.score || "-"}</TableCell>
                <TableCell className="max-w-xs truncate">{ranking.notes || "-"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(ranking)}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(ranking.id)}
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

      {rankings?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No hay rankings registrados. Crea el primer ranking para comenzar.
        </div>
      )}
    </div>
  );
}
