import * as XLSX from 'xlsx';

export interface PlayerData {
  name: string;
  number?: number;
  position?: string;
  teamId?: number;
  sport: 'soccer' | 'basketball' | 'cheerleading';
}

export interface ParseResult {
  success: boolean;
  data?: PlayerData[];
  errors: string[];
  warnings: string[];
}

/**
 * Parsea un archivo Excel y extrae datos de jugadores
 * Formato esperado:
 * - Columna A: Nombre del jugador (requerido)
 * - Columna B: Número (opcional)
 * - Columna C: Posición (opcional)
 * - Columna D: ID del equipo (opcional)
 */
export async function parsePlayersFromExcel(
  file: File,
  sport: 'soccer' | 'basketball' | 'cheerleading'
): Promise<ParseResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const players: PlayerData[] = [];

  try {
    // Validar tipo de archivo
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'text/csv',
    ];

    if (!validTypes.includes(file.type)) {
      errors.push('El archivo debe ser un Excel (.xlsx, .xls) o CSV');
      return { success: false, errors, warnings };
    }

    // Leer el archivo
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    // Obtener la primera hoja
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      errors.push('El archivo Excel no contiene hojas');
      return { success: false, errors, warnings };
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    if (data.length === 0) {
      errors.push('El archivo Excel está vacío');
      return { success: false, errors, warnings };
    }

    // Procesar filas (saltando la primera si es encabezado)
    let startRow = 0;

    // Detectar si la primera fila es encabezado
    const firstRow = data[0];
    if (
      firstRow &&
      typeof firstRow[0] === 'string' &&
      (firstRow[0].toLowerCase() === 'nombre' ||
        firstRow[0].toLowerCase() === 'jugador' ||
        firstRow[0].toLowerCase() === 'name')
    ) {
      startRow = 1;
    }

    // Procesar cada fila
    for (let i = startRow; i < data.length; i++) {
      const row = data[i];

      if (!row || row.length === 0) {
        continue; // Saltar filas vacías
      }

      const name = String(row[0] || '').trim();

      // Validar nombre
      if (!name) {
        warnings.push(`Fila ${i + 1}: El nombre del jugador es requerido`);
        continue;
      }

      if (name.length > 100) {
        warnings.push(`Fila ${i + 1}: El nombre es muy largo (máximo 100 caracteres)`);
        continue;
      }

      const player: PlayerData = {
        name,
        sport,
      };

      // Número (opcional)
      if (row[1] !== undefined && row[1] !== null && row[1] !== '') {
        const number = parseInt(String(row[1]), 10);
        if (!isNaN(number) && number > 0 && number < 1000) {
          player.number = number;
        } else if (row[1] !== '') {
          warnings.push(`Fila ${i + 1}: Número de jugador inválido`);
        }
      }

      // Posición (opcional)
      if (row[2] !== undefined && row[2] !== null && row[2] !== '') {
        player.position = String(row[2]).trim();
      }

      // ID del equipo (opcional)
      if (row[3] !== undefined && row[3] !== null && row[3] !== '') {
        const teamId = parseInt(String(row[3]), 10);
        if (!isNaN(teamId) && teamId > 0) {
          player.teamId = teamId;
        } else if (row[3] !== '') {
          warnings.push(`Fila ${i + 1}: ID de equipo inválido`);
        }
      }

      players.push(player);
    }

    if (players.length === 0) {
      errors.push('No se encontraron jugadores válidos en el archivo');
      return { success: false, errors, warnings };
    }

    return {
      success: true,
      data: players,
      errors,
      warnings,
    };
  } catch (error) {
    errors.push(`Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    return { success: false, errors, warnings };
  }
}

/**
 * Genera una plantilla Excel de ejemplo para importar jugadores
 */
export function generatePlayerTemplate(sport: 'soccer' | 'basketball' | 'cheerleading'): Blob {
  const data = [
    ['Nombre', 'Número', 'Posición', 'ID Equipo'],
    ['Juan Pérez', 10, 'Delantero', 1],
    ['Carlos López', 5, 'Defensa', 1],
    ['María García', 7, 'Mediocampista', 2],
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(data);

  // Ajustar ancho de columnas
  worksheet['!cols'] = [
    { wch: 25 },
    { wch: 12 },
    { wch: 20 },
    { wch: 12 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Jugadores');

  // Generar archivo
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

/**
 * Descarga la plantilla de ejemplo
 */
export function downloadPlayerTemplate(sport: 'soccer' | 'basketball' | 'cheerleading') {
  const blob = generatePlayerTemplate(sport);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `plantilla-jugadores-${sport}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
