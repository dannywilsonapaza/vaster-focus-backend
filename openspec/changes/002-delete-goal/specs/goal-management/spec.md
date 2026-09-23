## ADDED Requirements

### Requirement: Eliminación física de metas
CUANDO el usuario envíe una petición `DELETE /api/goals/:id` con un `:id` válido de una meta que le pertenezca, EL SISTEMA SHALL eliminar físicamente la meta de la base de datos (junto con sus asociaciones dependientes en `SessionGoal` vía cascada) y responder con código `HTTP 204 No Content` con cuerpo vacío.

#### Scenario: Eliminación exitosa de una meta
- **WHEN** el cliente envía una petición `DELETE /api/goals/:id` para una meta existente perteneciente al usuario autenticado
- **THEN** el sistema elimina permanentemente el registro de la tabla `Goal`, remueve sus enlaces en `SessionGoal` y responde con código `HTTP 204 No Content`

#### Scenario: Meta no encontrada o perteneciente a otro usuario
- **WHEN** el cliente envía una petición `DELETE /api/goals/:id` con un identificador inexistente o perteneciente a otro usuario
- **THEN** el sistema no elimina ningún registro y responde con código `HTTP 404 Not Found` y mensaje descriptivo de error

#### Scenario: Parámetro de ID vacío o inválido
- **WHEN** el cliente envía una petición a la ruta con un formato de identificador vacío o no conforme
- **THEN** el sistema rechaza la petición en el middleware de validación antes de la capa de servicio con código `HTTP 400 Bad Request`
