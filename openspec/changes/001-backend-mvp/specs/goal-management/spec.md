## Purpose

Gestiona la creación, listado y actualización de metas de concentración asociadas al usuario y a sus bloques de estudio.

## ADDED Requirements

### Requirement: Creación y listado de metas
CUANDO el usuario envíe una petición `POST /api/goals` con un título válido (longitud de 1 a 255 caracteres validado por Zod), EL SISTEMA SHALL crear la meta asociada al usuario con estado `isCompleted: false`.

#### Scenario: Creación exitosa de meta
- **WHEN** el cliente envía `POST /api/goals` con `{ "title": "Terminar módulo de pagos" }`
- **THEN** el sistema persiste la meta y responde con código HTTP 201 y el objeto creado

#### Scenario: Listar metas del usuario
- **WHEN** el cliente envía `GET /api/goals`
- **THEN** el sistema retorna la lista de metas del usuario ordenadas por fecha de creación descendente

### Requirement: Actualización de estado y título de meta
CUANDO el cliente envíe una petición `PATCH /api/goals/:id` con `:id` válido y un payload con `isCompleted` (booleano) y/o `title` (cadena opcional), EL SISTEMA SHALL validar que la meta exista, pertenezca al usuario y actualizar los campos indicados.

#### Scenario: Marcar meta completada o renombrarla
- **WHEN** se envía una actualización válida para una meta existente del usuario
- **THEN** el sistema actualiza el registro y retorna el recurso modificado con código HTTP 200

#### Scenario: Meta no encontrada o ajena
- **WHEN** se envía una actualización con un `:id` inexistente o perteneciente a otro usuario
- **THEN** el sistema responde con código HTTP 404 Not Found
