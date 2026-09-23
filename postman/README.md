# Colección y Entorno de Postman — Vaster Focus API

Archivos listos para importar directamente en **Postman** o **Insomnia / Thunder Client**.

---

## Archivos Incluidos

1. **`Vaster_Focus_API.postman_collection.json`**:
   - **Health**: Endpoint de comprobación del servidor (`GET /health`).
    - **Goals**: Listar metas, crear meta (con script automático que guarda `goal_id`), actualizar estado/título, y eliminar meta permanentemente (`DELETE /api/goals/:id`).
   - **Sessions**: Listar historial, registrar Pomodoro de trabajo (`WORK` de 25 min) vinculado a `goal_id`, y registrar descansos (`SHORT_BREAK` de 5 min).
   - **Stats**: Reporte diario proyectado en `America/Lima`, reporte con filtros por rango de fechas, y resumen general con cálculo de racha y ventana de gracia.

2. **`Vaster_Focus_Local.postman_environment.json`**:
   - Variable `base_url`: `http://localhost:3000`
   - Variable `goal_id`: Se actualiza automáticamente al ejecutar la petición *Crear Meta*.

---

## Cómo Importar en Postman

1. Abre **Postman**.
2. Haz clic en el botón **Import** (esquina superior izquierda).
3. Selecciona o arrastra ambos archivos:
   - `Vaster_Focus_API.postman_collection.json`
   - `Vaster_Focus_Local.postman_environment.json`
4. En el selector de entornos (esquina superior derecha), activa **Vaster Focus - Local**.
5. Asegúrate de tener el servidor backend levantado (`pnpm dev` en `vaster-focus-backend`).
6. ¡Listo! Puedes ejecutar las peticiones de forma interactiva.
