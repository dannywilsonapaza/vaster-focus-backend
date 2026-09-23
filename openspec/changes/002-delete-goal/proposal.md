## Why

En la versión actual del frontend, cuando el usuario intenta eliminar una meta, esta solo desaparece temporalmente del estado visual de la pantalla; al recargar la página, la meta reaparece porque el backend carece de un endpoint `DELETE /api/goals/:id` para persistir la eliminación física en PostgreSQL. Este cambio completa el ciclo CRUD del módulo de metas (Goal Management) permitiendo eliminar metas permanentemente con integridad referencial.

## What Changes

- **Endpoint de Eliminación**: Implementar `DELETE /api/goals/:id` que responda con `HTTP 204 No Content` tras una eliminación física exitosa.
- **Validación de Identificador y Autorización**: Validar el formato del parámetro `id` mediante `goalIdParamSchema` y verificar que la meta exista y pertenezca al usuario autenticado (`userId`), respondiendo con `HTTP 404 Not Found` en caso contrario.
- **Integridad Referencial en Cascada**: Aprovechar la relación `onDelete: Cascade` en `SessionGoal` para remover limpiamente las vinculaciones de la meta sin corromper el historial de sesiones Pomodoro.
- **Flujo en 4 Capas**: Implementar la lógica en `GoalRepository.delete`, `GoalService.deleteGoal`, `GoalController.delete` y registrar la ruta en `goal.routes.ts`.
- **Pruebas Automatizadas (TDD)**: Añadir casos de prueba de integración en `tests/goals.test.ts` verificando eliminación exitosa (204) y rechazo de metas inexistentes (404).

## Capabilities

### New Capabilities
*(Ninguna)*

### Modified Capabilities
- `goal-management`: Se amplía la capacidad con el requerimiento de eliminación física de metas con validación de propiedad y respuesta HTTP 204.

## Impact

- **API REST**: Se añade la ruta `DELETE /api/goals/:id`.
- **Base de Datos**: No requiere migraciones de esquema adicionales; el modelo Prisma ya cuenta con `onDelete: Cascade` configurado en `SessionGoal`.
- **Compatibilidad**: Compatible al 100% con los clientes existentes; no introduce cambios destructivos en endpoints previos.
