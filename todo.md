# Tournament Hub - Lista de Tareas

## Fase 1: Esquema de Base de Datos
- [x] Crear tabla de equipos (teams) con categoría deportiva
- [x] Crear tabla de jugadores (players) vinculados a equipos
- [x] Crear tabla de partidos (matches) con fecha, hora y equipos
- [x] Crear tabla de estadísticas de jugadores (player_stats) para goles/puntos
- [x] Crear tabla de rankings de cheerleading (cheerleading_rankings)

## Fase 2: Sistema de Autenticación y Roles
- [x] Configurar sistema de roles (admin/user) en esquema de usuarios
- [x] Implementar middleware de protección para rutas de administrador
- [x] Crear procedimiento tRPC para verificar rol de administrador

## Fase 3: Dashboard de Administrador
- [x] Crear layout de administrador con navegación lateral
- [x] Implementar formulario de creación/edición de equipos
- [x] Implementar formulario de creación/edición de jugadores
- [x] Implementar formulario de programación de partidos
- [x] Implementar formulario de ingreso de resultados y estadísticas
- [x] Implementar sistema de ranking manual para cheerleading

## Fase 4: Lógica de Cálculos Automáticos
- [x] Implementar cálculo de puntos de liga (3-1-0)
- [x] Implementar cálculo de diferencia de goles/puntos
- [x] Implementar ordenamiento automático de tablas de clasificación
- [x] Implementar agregación de estadísticas individuales (goleadores/anotadores)
- [x] Crear procedimientos tRPC para obtener clasificaciones y estadísticas

## Fase 5: Vista Pública de Espectador
- [x] Crear página principal con sistema de pestañas (Fútbol, Baloncesto, Cheerleading)
- [x] Implementar visualización de próximos partidos por categoría
- [x] Implementar visualización de tablas de clasificación por categoría
- [x] Implementar visualización de máximos goleadores (Fútbol)
- [x] Implementar visualización de líderes de anotación (Baloncesto)
- [x] Implementar visualización de ranking de cheerleading
- [x] Implementar filtros por calendario diario

## Fase 6: Diseño Visual Gaming/Deportivo
- [x] Configurar paleta de colores vibrantes (Rojo, Verde, Azul, Amarillo)
- [x] Integrar iconos de balones y trofeos (lucide-react)
- [x] Aplicar estilos dinámicos con tarjetas de alto contraste
- [x] Implementar animaciones y efectos visuales deportivos
- [x] Configurar tipografía y espaciado gaming

## Fase 7: Funcionalidades de Exportación
- [x] Implementar generación de PDF con clasificaciones y logo
- [x] Implementar exportación de tablas/resultados como imágenes JPG
- [x] Agregar botones de exportación en vistas relevantes

## Fase 8: Pruebas y Ajustes Finales
- [x] Probar flujo completo de administrador
- [x] Probar vista de espectador con datos de ejemplo
- [x] Verificar cálculos automáticos de clasificaciones
- [x] Verificar exportaciones PDF/JPG
- [x] Crear checkpoint final

## Fase 9: Cambios de Branding y Colores
- [x] Cambiar nombre de "Tournament Hub" a "Torno Intersalesiano"
- [x] Modificar paleta de colores de morado a azul
- [x] Actualizar gradientes en componentes
- [x] Actualizar colores en iconos y efectos visuales

## Fase 10: Importación de Jugadores desde Excel
- [x] Instalar dependencias para lectura de Excel (xlsx)
- [x] Crear utilidad para parsear archivos Excel
- [x] Agregar componente de carga de archivos Excel
- [x] Implementar validación de datos del Excel
- [x] Procesar y guardar jugadores en lote desde Excel

## Fase 11: Sistema de Login del Administrador
- [x] Crear página de login del administrador con formulario de contraseña
- [x] Implementar procedimiento tRPC para validación de contraseña
- [x] Crear sistema de sesión para administradores
- [x] Proteger rutas del panel de administración
- [x] Crear página de bienvenida con link al panel de admin

## Fase 12: Mejoras Visuales y de Tema
- [x] Cambiar paleta de colores a vibrante (rojo, naranja, verde, amarillo)
- [x] Agregar iconos deportivos (basketball, soccer, pompones)
- [x] Implementar selector de tema claro/oscuro
- [x] Dividir partidos en anteriores y próximos
- [x] Configurar lógica de torneo de tres días

## Fase 13: Implementación de Funcionalidades Faltantes
- [x] Agregar iconos deportivos visibles (balón soccer, basketball, pompones porrista)
- [x] Mejorar paleta de colores a rojo, naranja, amarillo, verde
- [x] Dividir partidos en "Partidos Anteriores" y "Próximos Partidos"
- [x] Crear formulario para registrar marcador de partidos
- [x] Crear formulario para registrar goleadores/anotadores por jugador
- [x] Crear formulario para registrar amonestaciones en soccer
- [ ] Implementar cálculo automático de estadísticas por jugador
- [ ] Validar y guardar estadísticas en base de datos

## Fase 14: Correcciones y Mejoras de Usabilidad
- [x] Agregar filtro de equipo en AdminPlayers (filtrar por deporte y equipo)
- [x] Mejorar tabla de goleadores en AdminMatchStats con campos de entrada visibles
- [x] Mejorar tabla de anotadores en AdminMatchStats con campos de entrada visibles
- [x] Agregar tabla clara para registrar amonestaciones (tarjetas amarillas/rojas con minuto)
- [x] Hacer más visible el registro de estadísticas individuales por jugador

## Fase 15: Guardado de Estadísticas en Base de Datos
- [ ] Crear procedimiento tRPC para guardar marcador del partido
- [ ] Crear procedimiento tRPC para guardar goles/canastas por jugador
- [ ] Conectar botón "Guardar Estadísticas" con procedimientos tRPC
- [ ] Validar datos antes de guardar
- [ ] Actualizar automáticamente clasificaciones después de guardar
