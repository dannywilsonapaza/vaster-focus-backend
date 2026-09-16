## Why

Las aplicaciones de deep work existentes (como Study Together) presentan un defecto arquitectónico crítico: agrupan las métricas de estudio rígidamente en UTC en el servidor, fragmentando las sesiones nocturnas entre dos días distintos para usuarios en zonas horarias como Lima/Bogotá (UTC-5). Este cambio establece la base del backend de Vaster Focus, resolviendo el almacenamiento relacional de datos y proporcionando endpoints REST con agregaciones proyectadas en la zona horaria local real del usuario.

## What Changes

- **Infraestructura de Base de Datos**: Configuración de PostgreSQL v16 en contenedor Docker para desarrollo local y persistencia de datos.
- **Modelado de Datos Relacional**: Modelos Prisma (`User`, `Session`, `Goal`) con marcas de tiempo en UTC (`DateTime`) e índices optimizados.
- **Servicio de Sesiones y Metas**: Endpoints REST para registrar sesiones de estudio (`POST /api/sessions`), consultar sesiones activas (`GET /api/sessions/active`) y administrar metas (`GET`, `POST`, `PATCH /api/goals`).
- **Motor de Métricas Anti-Midnight**: Endpoint (`GET /api/stats/daily` y `GET /api/stats/summary`) que calcula las horas estudiadas por día calendario y la racha activa (*streak*) proyectando las fechas a `America/Lima` mediante `AT TIME ZONE` nativo en PostgreSQL.
- **Middleware de Contexto Monousuario**: Inyección automática del usuario por defecto creado mediante seed para simplificar el MVP sin descuidar la seguridad y futura escalabilidad a JWT.

## Capabilities

### New Capabilities
- `session-tracking`: Registro de sesiones de trabajo y descanso, cálculo de tiempo neto efectivo y vinculación con metas.
- `timezone-metrics`: Agregación de horas diarias y cálculo de rachas continuas proyectadas en `America/Lima` (UTC-5).
- `goal-management`: Gestión de lista de objetivos/metas asociados al usuario y sus bloques de estudio.

### Modified Capabilities
*(Ninguna, es la inicialización del proyecto)*

## Impact

- **Nuevas APIs**: Expone endpoints REST en `/api/sessions`, `/api/goals` y `/api/stats`.
- **Base de Datos**: Requiere PostgreSQL corriendo en el puerto 5432 (gestionado vía Docker Compose).
- **Dependencias**: Incorpora Node.js, Express, TypeScript, Prisma ORM, Zod, Vitest y Supertest con `pnpm`.
