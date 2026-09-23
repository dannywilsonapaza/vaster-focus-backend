# Diseño Técnico: Eliminación Física de Metas (DELETE /api/goals/:id)

## 1. Visión General y Contexto

Se incorpora la operación de eliminación física en el módulo de metas (`goal-management`) de Vaster Focus Backend para completar el ciclo CRUD. El diseño respeta la arquitectura en capas estricta del proyecto (`Routes -> Controllers -> Services -> Repositories`), utiliza los contratos de validación existentes en Zod y asegura que ningún usuario pueda eliminar metas ajenas.

---

## 2. Flujo de Ejecución en 4 Capas

```text
[ Cliente HTTP: DELETE /api/goals/:id ]
                   │
                   ▼
       1. CAPA DE ENRUTAMIENTO (goal.routes.ts)
                   │  Middleware: validateRequest(goalIdParamSchema)
                   ▼
      2. CAPA DE CONTROLADORES (goal.controller.ts)
                   │  Extrae userId = req.user.id e id = req.params.id
                   │  Llama a goalService.deleteGoal(id, userId)
                   │  Responde res.status(204).send()
                   ▼
       3. CAPA DE SERVICIOS (goal.service.ts)
                   │  Verifica existencia y propiedad: findByIdAndUserId(id, userId)
                   │  Si no existe -> throw new AppError(404, 'Meta no encontrada')
                   │  Si existe -> repo.delete(id, userId)
                   ▼
     4. CAPA DE REPOSITORIOS (goal.repository.ts)
                   │  Ejecuta prisma.goal.delete({ where: { id, userId } })
                   ▼
        [ Base de Datos PostgreSQL ]
                   │  Elimina el registro Goal
                   │  Cascade automático a SessionGoal vía FK onDelete: Cascade
```

---

## 3. Detalles de Implementación por Componente

### 1. Esquema de Validación (`src/schemas/goal.schema.ts`)
Se reutiliza el esquema ya existente:
```typescript
export const goalIdParamSchema = {
  params: z.object({
    id: z.string().min(1, 'ID de meta inválido'),
  }),
};
```

### 2. Capa de Enrutamiento (`src/routes/goal.routes.ts`)
Se añade la ruta `DELETE /:id` protegida por el middleware de validación:
```typescript
goalRoutes.delete('/:id', validateRequest(goalIdParamSchema), goalController.delete);
```

### 3. Capa de Controladores (`src/controllers/goal.controller.ts`)
Se agrega el método `delete`:
```typescript
delete = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;
    await this.service.deleteGoal(id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
```

### 4. Capa de Servicios (`src/services/goal.service.ts`)
Se añade el método `deleteGoal`:
```typescript
async deleteGoal(id: string, userId: string): Promise<void> {
  const existing = await this.repo.findByIdAndUserId(id, userId);
  if (!existing) {
    throw new AppError(404, 'Meta no encontrada');
  }
  await this.repo.delete(id, userId);
}
```

### 5. Capa de Repositorios (`src/repositories/goal.repository.ts`)
Se añade el método `delete`:
```typescript
async delete(id: string, userId: string): Promise<Goal> {
  return prisma.goal.delete({
    where: { id, userId },
  });
}
```

---

## 4. Consideraciones de Base de Datos y Cascada

En `prisma/schema.prisma`:
```prisma
model SessionGoal {
  ...
  goal Goal @relation(fields: [goalId], references: [id], onDelete: Cascade)
}
```
Al borrar una meta, PostgreSQL elimina automáticamente las filas asociadas en la tabla intermedia `SessionGoal`. Los registros de `Session` permanecen intactos, preservando el historial de bloques de trabajo y el cálculo de métricas de estudio del usuario sin corrupción de datos.
