import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, Download, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { parsePlayersFromExcel, downloadPlayerTemplate, type PlayerData } from '@/lib/excelParser';
import { toast } from 'sonner';

interface ExcelPlayerImporterProps {
  sport: 'soccer' | 'basketball' | 'cheerleading';
  onImport: (players: PlayerData[]) => Promise<void>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExcelPlayerImporter({
  sport,
  onImport,
  isOpen,
  onOpenChange,
}: ExcelPlayerImporterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<PlayerData[] | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);
    setErrors([]);
    setWarnings([]);
    setParsedData(null);

    try {
      const result = await parsePlayersFromExcel(selectedFile, sport);

      if (result.errors.length > 0) {
        setErrors(result.errors);
      }

      if (result.warnings.length > 0) {
        setWarnings(result.warnings);
      }

      if (result.success && result.data) {
        setParsedData(result.data);
        toast.success(`Se encontraron ${result.data.length} jugadores`);
      }
    } catch (error) {
      setErrors(['Error al procesar el archivo']);
      toast.error('Error al procesar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.length === 0) {
      toast.error('No hay jugadores para importar');
      return;
    }

    setIsImporting(true);
    try {
      await onImport(parsedData);
      toast.success(`${parsedData.length} jugadores importados exitosamente`);
      onOpenChange(false);
      setFile(null);
      setParsedData(null);
      setErrors([]);
      setWarnings([]);
    } catch (error) {
      toast.error('Error al importar jugadores');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    downloadPlayerTemplate(sport);
    toast.success('Plantilla descargada');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Importar Jugadores desde Excel
          </DialogTitle>
          <DialogDescription>
            Carga un archivo Excel con la lista de jugadores para importarlos en lote
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Template Download */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Plantilla de Ejemplo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Descarga la plantilla de ejemplo para ver el formato correcto del archivo Excel.
              </p>
              <Button
                onClick={handleDownloadTemplate}
                variant="outline"
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar Plantilla
              </Button>
            </CardContent>
          </Card>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-8 h-8 text-gray-400" />
              <div className="text-center">
                <label htmlFor="excel-file" className="cursor-pointer">
                  <span className="font-semibold text-blue-600 hover:text-blue-700">
                    Haz clic para seleccionar
                  </span>
                  <span className="text-gray-600"> o arrastra un archivo</span>
                </label>
                <input
                  id="excel-file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </div>
              <p className="text-xs text-gray-500">
                Formatos soportados: .xlsx, .xls, .csv
              </p>
            </div>
          </div>

          {/* File Name */}
          {file && (
            <div className="text-sm text-gray-600">
              Archivo seleccionado: <span className="font-semibold">{file.name}</span>
            </div>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.map((error, idx) => (
                    <div key={idx}>{error}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  <div className="font-semibold">Advertencias:</div>
                  {warnings.map((warning, idx) => (
                    <div key={idx} className="text-sm">
                      {warning}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview */}
          {parsedData && parsedData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Vista Previa ({parsedData.length} jugadores)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Número</TableHead>
                        <TableHead>Posición</TableHead>
                        <TableHead>ID Equipo</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parsedData.slice(0, 10).map((player, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell>{player.number || '-'}</TableCell>
                          <TableCell>{player.position || '-'}</TableCell>
                          <TableCell>{player.teamId || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {parsedData.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2">
                      +{parsedData.length - 10} jugadores más...
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setFile(null);
                setParsedData(null);
                setErrors([]);
                setWarnings([]);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={!parsedData || parsedData.length === 0 || isImporting}
              className="gap-2"
            >
              {isImporting ? 'Importando...' : 'Importar Jugadores'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
