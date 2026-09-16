## Purpose

Calcula resúmenes diarios de tiempo de estudio y rachas de días consecutivos proyectados en la zona horaria del usuario (America/Lima UTC-5), asegurando que solo las sesiones de trabajo completadas sumen al tiempo de concentración y gestionando la ventana de gracia de la racha diaria.

## ADDED Requirements

### Requirement: Agregación de estudio en zona horaria local
EL SISTEMA SHALL computar el total de segundos de estudio por día calendario utilizando la función nativa de PostgreSQL `AT TIME ZONE 'America/Lima'`, sumando exclusivamente las sesiones con `type = 'WORK'` y `status = 'COMPLETED'`, asignando las sesiones al día local de su `startedAt`.

#### Scenario: Sesión nocturna pertenece al día local de Lima
- **WHEN** un usuario completa una sesión de estudio de 23:30 a 23:55 hora de Lima (04:30 a 04:55 UTC del día siguiente)
- **THEN** el sistema agrupa los segundos de dicha sesión dentro del día calendario local de Lima y no en la fecha UTC del servidor

#### Scenario: Consulta de historial diario con filtros
- **WHEN** el cliente realiza una petición `GET /api/stats/daily` con parámetros opcionales validados por Zod (`from`, `to`, `limit` con valor por defecto de 30 y máximo 365)
- **THEN** el sistema retorna un listado ordenado descendentemente por `studyDay` (YYYY-MM-DD) con `totalSeconds` (tiempo de trabajo), `breakSeconds` (tiempo de descansos) y `sessionCount`

### Requirement: Cálculo de racha con ventana de gracia del día en curso
EL SISTEMA SHALL calcular la racha actual (`currentStreak`), la racha histórica récord (`bestStreak`) y el estado del día en curso (`studiedToday`), manteniendo la racha del día anterior activa mientras transcurre el día local en Lima.

#### Scenario: Racha mantenida en ventana de gracia
- **WHEN** el usuario completó sesiones de trabajo ayer y anteayer, pero en el día presente aún no ha estudiado
- **THEN** el sistema retorna `currentStreak: 2`, `studiedToday: false` y no reinicia la racha a cero

#### Scenario: Racha incrementada al estudiar hoy
- **WHEN** el usuario con racha activa de 2 días completa su primer bloque de trabajo hoy
- **THEN** el sistema retorna `currentStreak: 3` y `studiedToday: true`

#### Scenario: Racha rota tras un día completo sin estudiar
- **WHEN** el usuario no completó ninguna sesión de trabajo en todo el día de ayer
- **THEN** el sistema reinicia `currentStreak: 0` y `studiedToday: false`
