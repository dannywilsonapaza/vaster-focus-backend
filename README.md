# 🛡️ Vaster Focus — Backend API

API REST para **Vaster Focus** (aplicación de *deep work* y estudio individual con técnica Pomodoro), construida bajo la metodología **Spec-Driven Development (SDD)** con **OpenSpec**.

---

## 🎯 Propósito del Backend y Valor Diferencial
El objetivo fundamental de este backend es **garantizar la precisión de las métricas de estudio sin desfases de zona horaria**:
* **Almacenamiento Estándar:** Todas las marcas temporales (`startedAt`, `endedAt`) se guardan en base de datos en UTC ISO-8601 (`TIMESTAMPTZ`).
* **Proyección Horaria Real (Anti-Midnight Bug):** A diferencia de plataformas como Study Together (que agrupan rígidamente en UTC dividiendo las sesiones nocturnas entre dos días), las consultas agregadas de estadísticas y cálculo de rachas (*streaks*) se proyectan en la zona horaria del usuario (**`America/Lima` - UTC-5**) a nivel de base de datos (`AT TIME ZONE`).

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología | Rol |
| :--- | :--- | :--- |
| **Runtime** | **Node.js (v22+)** | Entorno de ejecución asíncrono. |
| **Lenguaje** | **TypeScript** | Tipado estricto de extremo a extremo. |
| **Framework Web** | **Express.js** | Servidor HTTP ligero y arquitectura desacoplada. |
| **Base de Datos** | **PostgreSQL (v16)** | Motor relacional con soporte nativo de conversiones horarias. |
| **ORM** | **Prisma ORM** | Migraciones declarativas, esquemas y cliente tipado. |
| **Validación** | **Zod** | Validación estricta de esquemas y contratos de entrada/salida. |
| **Contenedores** | **Docker & Docker Compose** | Infraestructura local reproducible y lista para **Dokploy**. |
| **Metodología** | **OpenSpec (`@fission-ai/openspec`)** | Especificación formal previa al código. |

---

## 📂 Arquitectura del Proyecto

Arquitectura limpia en capas orientada al dominio:

```text
vaster-focus-backend/
├── docker-compose.yml     # Contenedor local de PostgreSQL
├── openspec/              # Especificaciones y contratos SDD (@fission-ai/openspec)
├── prisma/
│   ├── schema.prisma      # Modelos de datos (User, Session, Goal)
│   └── migrations/        # Historial de migraciones SQL
├── src/
│   ├── config/            # Variables de entorno y configuración
│   ├── routes/            # Definición de rutas Express
│   ├── controllers/       # Manejadores de petición / respuesta HTTP
│   ├── services/          # Lógica de negocio pura (validación de sesiones, rachas)
│   ├── repositories/      # Acceso a datos con Prisma y consultas nativas SQL
│   ├── schemas/           # Esquemas de validación Zod
│   └── app.ts             # Entrada del servidor Express
├── tests/                 # Pruebas unitarias y de integración
├── package.json
└── tsconfig.json
```

---

## 🚀 Puesta en Marcha (Desarrollo Local)

### 1. Requisitos Previos
* Node.js v20+ o v22+
* Docker Desktop instalado y corriendo

### 2. Iniciar Base de Datos
```bash
docker compose up -d
```

### 3. Instalar Dependencias
```bash
pnpm install
```

### 4. Ejecutar Migraciones de Base de Datos
```bash
pnpm dlx prisma migrate dev --name init
```

### 5. Iniciar Servidor en Modo Desarrollo
```bash
pnpm dev
```
El servidor quedará disponible en `http://localhost:3000`.

---

## 📡 Endpoints Principales (Contrato Base)

* `POST /api/sessions`: Registrar una sesión de estudio completada o abandonada.
* `GET /api/sessions/active`: Consultar o reanudar una sesión en curso.
* `GET /api/stats/daily`: Obtener el historial diario de horas y sesiones agrupadas en `America/Lima`.
* `GET /api/stats/summary`: Racha actual (*streak*), récord histórico y tiempo total acumulado.
* `GET /api/goals`: Listar metas de sesión del usuario.
* `POST /api/goals`: Crear una nueva meta vinculada o independiente.
* `PATCH /api/goals/:id`: Actualizar estado de una meta (Pendiente / Completada).
