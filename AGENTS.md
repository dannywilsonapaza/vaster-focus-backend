# AGENTS.md — Backend API

## Project Scope
Backend REST API para Vaster Focus (aplicación de deep work y técnica Pomodoro).
- Stack: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL (Docker), Zod, OpenSpec.
- Package Manager: `pnpm`

## Golden Rules
1. STORAGE: Todas las marcas de tiempo (`startedAt`, `endedAt`) DEBEN guardarse en UTC ISO-8601 (`DateTime` en Prisma).
2. METRICS: Toda consulta agregada de días y cálculo de rachas DEBE proyectarse a la zona horaria del usuario (`America/Lima` - UTC-5) usando SQL nativo `AT TIME ZONE`. Nunca agrupar por fechas UTC directamente para evitar la división errónea de sesiones nocturnas.
3. ARCHITECTURE: Respetar la arquitectura en capas estricta: `routes/` -> `controllers/` -> `services/` -> `repositories/`.
4. VALIDATION: Validar todo input HTTP usando esquemas de Zod antes de pasarlo a la capa de servicio.
5. ISOLATION: No invadir ni modificar archivos en `../vaster-focus-frontend`.

## Setup & Dev Commands
- Levantar base de datos: `docker compose up -d`
- Instalar dependencias: `pnpm install`
- Generar cliente Prisma: `pnpm dlx prisma generate`
- Migraciones Prisma: `pnpm dlx prisma migrate dev`
- Servidor de desarrollo: `pnpm dev`
- Tests: `pnpm test`
- Lint / Typecheck: `pnpm typecheck`
