## 1. Infraestructura y Configuración Base

- [x] 1.1 Configurar `package.json` con scripts (`dev`, `build`, `test`, `prisma`) e instalar dependencias con `pnpm` (express, prisma, @prisma/client, zod, cors, dotenv, vitest, supertest, tsx)
- [x] 1.2 Configurar `tsconfig.json` para TypeScript estricto con Node.js v22
- [x] 1.3 Crear `docker-compose.yml` con PostgreSQL v16 y verificar que el contenedor inicie y acepte conexiones en el puerto 5432
- [x] 1.4 Configurar `.env` y `.env.example` con la variable `DATABASE_URL`

## 2. Modelado de Datos y Migraciones con Prisma

- [x] 2.1 Crear `prisma/schema.prisma` con modelos `User`, `Session`, `Goal`, tabla intermedia `SessionGoal` (N:M) y enums de estado y tipo
- [x] 2.2 Ejecutar `pnpm dlx prisma migrate dev --name init` para aplicar la migración inicial en PostgreSQL
- [x] 2.3 Crear script de seed `prisma/seed.ts` para insertar el usuario monousuario inicial (`wilson@vasterfocus.com`, timezone: `America/Lima`) y verificar con `pnpm dlx prisma db seed`

## 3. Arquitectura Base y Servidor Express

- [x] 3.1 Implementar cliente singleton de base de datos en `src/config/prisma.ts`
- [x] 3.2 Implementar middleware de manejo centralizado de errores (`src/middlewares/errorHandler.ts`) y middleware de contexto de usuario (`src/middlewares/userContext.ts`)
- [x] 3.3 Implementar middleware de validación genérico con Zod para `body`, `params` y `query` (`src/middlewares/validateRequest.ts`)
- [x] 3.4 Configurar `src/app.ts` y entrypoint `src/server.ts` con Express, CORS y endpoint de salud `GET /health`

## 4. Módulo de Metas (Goal Management)

- [x] 4.1 Definir esquemas de validación Zod en `src/schemas/goal.schema.ts` para creación, actualización de título/estado y validación de `params.id`
- [x] 4.2 Implementar `GoalRepository`, `GoalService` y `GoalController` respetando la arquitectura en capas
- [x] 4.3 Configurar rutas en `src/routes/goal.routes.ts` (`GET /api/goals`, `POST /api/goals`, `PATCH /api/goals/:id`)
- [x] 4.4 Escribir tests de integración con Vitest y Supertest en `tests/goals.test.ts` cubriendo creación, actualización, caso 404 y verificación en verde

## 5. Módulo de Sesiones (Session Tracking)

- [x] 5.1 Definir esquemas de validación Zod en `src/schemas/session.schema.ts` (validación de timezone en ISO, `durationSeconds <= endedAt - startedAt`, rechazo de fechas futuras)
- [x] 5.2 Implementar `SessionRepository` con transacciones atómicas para persistir la sesión y vincular `SessionGoal`
- [x] 5.3 Implementar `SessionService` con detección de colisión/solapamiento de horarios (retornando HTTP 409) y validación de pertenencia de `goalIds`
- [x] 5.4 Implementar `SessionController` y rutas en `src/routes/session.routes.ts` (`POST /api/sessions`)
- [x] 5.5 Escribir tests automatizados con Vitest en `tests/sessions.test.ts` verificando sesiones válidas, rechazo por solapamiento (409) y rechazo por fechas futuras (400)

## 6. Módulo de Estadísticas y Zona Horaria (Timezone Metrics)

- [x] 6.1 Definir esquemas de validación Zod en `src/schemas/stats.schema.ts` para query params opcionales (`from`, `to`, `limit`)
- [x] 6.2 Implementar `StatsRepository` con la consulta SQL nativa `$queryRaw` usando `AT TIME ZONE 'America/Lima'` sumando solo `WORK` completado
- [x] 6.3 Implementar `StatsService` con el algoritmo de cálculo de racha (`currentStreak`, `bestStreak`, `studiedToday` con ventana de gracia)
- [x] 6.4 Implementar `StatsController` y rutas en `src/routes/stats.routes.ts` (`GET /api/stats/daily`, `GET /api/stats/summary`)
- [x] 6.5 Escribir tests automatizados en `tests/stats.test.ts` verificando que una sesión completada a las 23:30 (UTC-5) pertenezca al día local correcto y que la racha conserve la ventana de gracia si hoy aún no se ha estudiado

## 7. Verificación Final de la Propuesta

- [x] 7.1 Ejecutar suite completa de tests con `pnpm test` y verificar 100% de tests en verde
- [x] 7.2 Validar la conformidad de la propuesta con `openspec validate 001-backend-mvp`
