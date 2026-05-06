# NutriPlan — Backend

API REST para el planificador de comidas semanal NutriPlan. Genera recetas con IA (Anthropic Claude), gestiona ingredientes con preferencias, y construye planes semanales con soporte de bloqueo y refresco selectivo.

## Requisitos previos

- Node.js 18+
- Cuenta en [Neon](https://neon.tech) (PostgreSQL serverless)
- API Key de [Anthropic](https://console.anthropic.com)

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Variables de entorno

Copia `.env.example` a `.env` y rellena los valores:

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Connection string de PostgreSQL (Neon) |
| `ANTHROPIC_API_KEY` | API key de Anthropic Claude |
| `PORT` | Puerto del servidor (default: `4000`) |
| `CORS_ORIGIN` | Origen permitido por CORS (ej: `http://localhost:3000`) |

### 3. Aplicar migraciones

```bash
npx prisma migrate deploy
```

> Para desarrollo con migraciones nuevas usa `npx prisma migrate dev`.

### 4. Arrancar el servidor

```bash
npm run dev
```

El servidor queda disponible en `http://localhost:4000`.

## Comandos

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor en modo desarrollo con hot-reload (`tsx watch`) |
| `npm run build` | Compila TypeScript a `dist/` |
| `npm start` | Arranca el build de producción |
| `npx prisma migrate dev` | Crea y aplica una nueva migración |
| `npx prisma migrate deploy` | Aplica migraciones pendientes (producción) |
| `npx prisma studio` | Abre Prisma Studio en el navegador |
| `npx tsc --noEmit` | Verificación de tipos sin compilar |

## Arquitectura

```
src/
├── index.ts              # Bootstrap Express
├── container.ts          # Composition root (DI manual)
├── config/env.ts         # Validación de variables de entorno (Zod)
├── lib/prisma.ts         # Singleton PrismaClient
├── http/middleware/      # Error handler + validación de body
├── ai/                   # Puerto IAIProvider + adaptador Anthropic + prompts
├── modules/
│   ├── ingredients/      # CRUD de ingredientes con preferencias
│   ├── recipes/          # CRUD de recetas + generación con IA
│   ├── plans/            # Planes semanales (generar, refrescar, swap, lock)
│   └── shopping/         # Lista de compras agregada por categoría
└── utils/                # Funciones puras (semana actual, etc.)
```

**Capas:** `routes → controllers → services → repositories → Prisma`

Los servicios externos (Claude) están detrás de la interfaz `IAIProvider`, lo que permite cambiar de proveedor sin tocar controladores.

## Documentación de la API

La colección de Postman está disponible en `nutriplan-api.postman_collection.json`. Importa el archivo en Postman y configura la variable `{{baseUrl}}` a `http://localhost:4000/api`.

Para el detalle completo del plan de desarrollo, arquitectura y modelo de datos consulta el [PLAN.md](../PLAN.md).
