## Context

Ver `proposal.md` para la motivación general del cambio. Este diseño técnico incorpora las decisiones de la fase de clarificación QA para garantizar robustez matemática, consistencia relacional y cumplimiento de la Constitución (`AGENTS.md`).

## Goals / Non-Goals

**Goals:**
- Configurar PostgreSQL v16 en Docker Compose con volumen persistente.
- Modelar en Prisma: `User`, `Session`, `Goal` y la tabla intermedia `SessionGoal` (relación N:M auditada).
- Arquitectura limpia estricta en 3 dominios desacoplados:
  * Dominio Sesiones: `SessionRepository`, `SessionService`, `SessionController`, `session.routes.ts`
  * Dominio Metas: `GoalRepository`, `GoalService`, `GoalController`, `goal.routes.ts`
  * Dominio Estadísticas: `StatsRepository`, `StatsService`, `StatsController`, `stats.routes.ts`
- Validación exhaustiva con Zod para `body`, `params` y `query` en todos los endpoints (Regla 4 de AGENTS.md).
- Detección y rechazo de sesiones solapadas temporalmente (HTTP 409 Conflict).
- Consulta nativa `$queryRaw` con `AT TIME ZONE 'America/Lima'` que suma exclusivamente sesiones `WORK` completadas.
- Algoritmo de cálculo de racha con ventana de gracia que mantiene viva la racha de ayer mientras transcurre el día de hoy.
- Suite completa de pruebas con Vitest y Supertest.

**Non-Goals:**
- Pantallas de autenticación con UI de login/registro (manejado vía seed de usuario y middleware de contexto).
- Manejo de husos horarios dinámicos por sesión (anclado a `America/Lima`).

## Decisions

### 1. Modelo Relacional N:M (`SessionGoal`)
Permite que un objetivo de estudio se trabaje a lo largo de múltiples bloques Pomodoro sin sobreescribir el historial:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String        @id @default(cuid())
  email     String        @unique
  timezone  String        @default("America/Lima")
  sessions  Session[]
  goals     Goal[]
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

model Session {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  type            SessionType   @default(WORK)
  status          SessionStatus @default(COMPLETED)
  targetSeconds   Int
  durationSeconds Int
  startedAt       DateTime
  endedAt         DateTime
  goals           SessionGoal[]
  createdAt       DateTime      @default(now())

  @@index([userId, startedAt])
  @@index([userId, status, type])
}

model Goal {
  id          String        @id @default(cuid())
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  title       String
  isCompleted Boolean       @default(false)
  sessions    SessionGoal[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@index([userId, isCompleted])
}

model SessionGoal {
  id        String   @id @default(cuid())
  sessionId String
  session   Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  goalId    String
  goal      Goal     @relation(fields: [goalId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([sessionId, goalId])
  @@index([sessionId])
  @@index([goalId])
}

enum SessionType {
  WORK
  SHORT_BREAK
  LONG_BREAK
}

enum SessionStatus {
  COMPLETED
  ABANDONED
  CANCELLED
}
```

### 2. Desacoplamiento de Módulo Estadísticas (`Stats`)
En estricto cumplimiento de la Regla 3 de `AGENTS.md`, las estadísticas se separan de las sesiones:
* **`StatsRepository`**: Ejecuta la consulta SQL nativa:
  ```sql
  SELECT 
    TO_CHAR(started_at AT TIME ZONE 'America/Lima', 'YYYY-MM-DD') AS study_day,
    COALESCE(SUM(CASE WHEN type = 'WORK' THEN duration_seconds ELSE 0 END), 0)::int AS total_seconds,
    COALESCE(SUM(CASE WHEN type != 'WORK' THEN duration_seconds ELSE 0 END), 0)::int AS break_seconds,
    COUNT(CASE WHEN type = 'WORK' THEN 1 END)::int AS session_count
  FROM "Session"
  WHERE "userId" = $1
    AND status = 'COMPLETED'
    AND (started_at AT TIME ZONE 'America/Lima')::date >= $2
    AND (started_at AT TIME ZONE 'America/Lima')::date <= $3
  GROUP BY study_day
  ORDER BY study_day DESC
  LIMIT $4;
  ```
* **`StatsService`**:
  * Aplica el algoritmo de racha: ordena los días de estudio y evalúa si el último día fue "hoy" (racha continua) o "ayer" (racha en ventana de gracia, `studiedToday: false`). Si el último día es anterior a ayer, `currentStreak = 0`.

### 3. Validación de Casos Límite con Zod (Regla 4)
* **Marcas temporales:** Valida formato ISO con timezone (`z.string().datetime({ offset: true })`).
* **Incoherencia temporal:** `durationSeconds <= (endedAt.getTime() - startedAt.getTime()) / 1000`.
* **Tiempo futuro:** `endedAt <= new Date(Date.now() + 60000)`.
* **Colisión de sesiones:** `SessionService` consulta si existe alguna sesión con `startedAt < newEndedAt && endedAt > newStartedAt`. Si existe, arroja `AppError(409, "Conflicto de sesión: el horario se superpone con otra sesión registrada")`.
* **Validación de parámetros:** Esquemas para `params.id` con formato CUID y `query` de fechas con formato YYYY-MM-DD.

## Risks / Trade-offs

- **[Riesgo] Atomicidad en la vinculación de metas** -> *Mitigación:* Se ejecuta en una transacción `prisma.$transaction`. Si algún `goalId` no existe o no pertenece al usuario, la transacción hace rollback completo y devuelve HTTP 400.
- **[Riesgo] Rendimiento en consultas de racha** -> *Mitigación:* La consulta SQL filtra por índice relacional `[userId, startedAt]` y solo analiza los días únicos retornados.
