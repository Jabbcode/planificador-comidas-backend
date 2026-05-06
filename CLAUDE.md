# NutriPlan — Backend

API REST para el planificador de comidas semanal. Un solo usuario, sin autenticación.

## Stack

- **Node.js + Express + TypeScript 5**
- **Prisma 5** + **PostgreSQL** (Neon en producción)
- **Zod** para validación de requests
- **@anthropic-ai/sdk** — generación de recetas con Claude Haiku

## Estructura

```
src/
├── ai/              # Integración Anthropic: provider, prompts, types
├── config/
│   └── env.ts       # Variables de entorno validadas
├── http/
│   └── middleware/
│       ├── error.ts     # Manejador global de errores
│       └── validate.ts  # Middleware de validación con zod
├── lib/
│   └── prisma.ts    # Instancia global del cliente Prisma
├── modules/         # Módulos por dominio (MVC)
│   ├── ingredients/ # CRUD ingredientes + bloqueo si está en uso
│   ├── recipes/     # CRUD recetas + generación IA
│   ├── plans/       # Plan semanal (WeekPlan + PlanMeal)
│   └── shopping/    # Lista de compras agregada
├── utils/
│   ├── errors.ts    # AppError(message, statusCode) para errores HTTP controlados
│   └── week.ts      # Helpers de fecha/semana
├── container.ts     # Wiring de dependencias (controller → service → repository)
└── index.ts         # Entry point, Express app
```

Cada módulo sigue la estructura: `routes → controller → service → repository`

## Comandos

```bash
npm run dev            # Desarrollo con hot reload (tsx watch)
npm run build          # Compilar TypeScript → dist/
npm run start          # Ejecutar build compilado
npm run prisma:migrate # Aplicar migraciones
npm run prisma:generate # Regenerar cliente Prisma
npm run prisma:studio  # Abrir Prisma Studio
```

## Variables de entorno

```env
DATABASE_URL=        # PostgreSQL connection string (Neon)
ANTHROPIC_API_KEY=   # Claude API key
PORT=4000
CORS_ORIGIN=http://localhost:3000
```

## Errores HTTP controlados

Usar `AppError` de `src/utils/errors.ts` para errores esperados:

```ts
throw new AppError('Mensaje', 409)  // Conflict, Not Found, etc.
```

El middleware `error.ts` captura y formatea la respuesta automáticamente.

## API base

Todos los endpoints bajo `/api`:
- `GET/POST /api/ingredients`
- `GET/PUT/DELETE /api/ingredients/:id`
- `GET/POST /api/recipes`
- `GET/PUT/DELETE /api/recipes/:id`
- `POST /api/recipes/generate`
- `GET/POST /api/plans`
- `GET /api/plans/:id` · `PUT /api/plans/:id/meals`
- `GET /api/shopping/:weekPlanId`

Colección Postman: `nutriplan-api.postman_collection.json` — mantener actualizada ante cualquier cambio de endpoints.

## Convenciones

- Validación de requests con Zod en `*.schemas.ts` de cada módulo, aplicada vía middleware `validate`.
- Operaciones con dependencias cruzadas (ej: eliminar receta con PlanMeals asociadas) usar `prisma.$transaction`.
- No exponer detalles internos en errores de producción.

## Git workflow

- Rama de integración: `develop`
- Nunca pushear directo a `main` — siempre PR apuntando a `develop`
- Naming de ramas: `FEAT-XXX-nombre` / `FIX-XXX-nombre` (coincide con ID de tarea en Notion)
- Antes de cualquier commit o push, confirmar con el usuario

## Notion

Board: [NutriPlan Development Tasks](https://www.notion.so/259922cafbcc4015b197be7ddbe2e2c4)

Actualizar proactivamente:
- Al empezar → `In Progress`
- Al crear PR → `Review` + URL de la PR
- Al mergear → `Done`
