## Purpose

Permite registrar, auditar y persistir sesiones de estudio y descansos bajo la técnica Pomodoro, calculando la duración efectiva neta y vinculando las metas trabajadas a través de una relación muchos a muchos auditada.

## ADDED Requirements

### Requirement: Registro de sesión completada
CUANDO el cliente envíe una petición `POST /api/sessions` con tipo de sesión (`type`), duración objetivo (`targetSeconds`), duración efectiva en segundos (`durationSeconds`) y marcas de tiempo `startedAt` y `endedAt`, EL SISTEMA SHALL validar que las marcas incluyan zona horaria explícita, que no estén en el futuro, que `durationSeconds <= (endedAt - startedAt)` y persistir la sesión en PostgreSQL asociada al usuario en UTC.

#### Scenario: Registro exitoso de sesión de trabajo
- **WHEN** el cliente envía un bloque de trabajo con `durationSeconds: 1500`, `startedAt: "2026-09-12T10:00:00-05:00"` y `endedAt: "2026-09-12T10:25:00-05:00"`
- **THEN** el sistema normaliza las fechas a UTC, guarda el registro con estado `COMPLETED`, tipo `WORK` y retorna código HTTP 201 con la sesión creada

#### Scenario: Rechazo por incoherencia temporal o marcas en el futuro
- **WHEN** el cliente envía una sesión donde `durationSeconds` excede la diferencia entre `endedAt` y `startedAt`, o `endedAt` es posterior a la hora actual
- **THEN** el sistema rechaza la petición con código HTTP 400 y descripción del error de validación

### Requirement: Prevención de sesiones solapadas
SI una nueva sesión enviada se superpone temporalmente en el intervalo `[startedAt, endedAt]` con otra sesión existente de tipo `WORK` del mismo usuario, ENTONCES EL SISTEMA SHALL rechazar la petición con código HTTP 409 Conflict.

#### Scenario: Rechazo por colisión de horarios
- **WHEN** el usuario intenta registrar una sesión de 10:10 a 10:35 pero ya existe una sesión registrada de 10:00 a 10:25
- **THEN** el sistema no almacena la sesión y responde con HTTP 409 y mensaje de colisión temporal

### Requirement: Vinculación atómica con metas (N a M)
DONDE la petición de creación de sesión incluya una lista de IDs de metas (`goalIds`), EL SISTEMA SHALL verificar que todas existan y pertenezcan al usuario, y asociarlas a la sesión a través de la relación intermedia `SessionGoal`.

#### Scenario: Asociación válida de metas
- **WHEN** se envía una sesión con `goalIds: ["goal-1", "goal-2"]` pertenecientes al usuario
- **THEN** el sistema crea los registros de vinculación en `SessionGoal` dentro de una transacción atómica

#### Scenario: Rechazo por metas inexistentes o ajenas
- **WHEN** se envía una sesión con algún ID en `goalIds` que no existe o pertenece a otro usuario
- **THEN** el sistema aborta la transacción, no guarda la sesión y responde con código HTTP 400
