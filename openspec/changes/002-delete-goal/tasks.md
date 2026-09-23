# Tareas de Implementación: Eliminación de Metas (002-delete-goal)

## 1. Pruebas Automatizadas (Fase RED - TDD)

- [x] 1.1 Escribir casos de prueba de integración en `tests/goals.test.ts` para `DELETE /api/goals/:id` (caso de éxito con código 204 y caso no encontrado con código 404)
- [x] 1.2 Ejecutar `pnpm test` y verificar que las nuevas pruebas de eliminación fallen en rojo (Fase RED)

## 2. Implementación de la Capa de Persistencia y Lógica

- [x] 2.1 Implementar el método `delete(id, userId)` en `src/repositories/goal.repository.ts` usando `prisma.goal.delete`
- [x] 2.2 Implementar el método `deleteGoal(id, userId)` en `src/services/goal.service.ts` verificando pertenencia mediante `findByIdAndUserId` y lanzando `AppError(404)` si no existe

## 3. Exposición de la API y Enrutamiento

- [x] 3.1 Implementar el método `delete` en `src/controllers/goal.controller.ts` respondiendo con `res.status(204).send()`
- [x] 3.2 Registrar la ruta `DELETE /:id` en `src/routes/goal.routes.ts` protegida con `validateRequest(goalIdParamSchema)`

## 4. Verificación y Calidad (Fase GREEN)

- [x] 4.1 Ejecutar suite completa de tests con `pnpm test` y verificar 100% en verde (Fase GREEN)
- [x] 4.2 Ejecutar `pnpm typecheck` para asegurar tipado estricto sin errores
- [x] 4.3 Reconstruir el contenedor con `docker compose up -d --build` y verificar el endpoint en vivo
