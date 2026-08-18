# App Aprobaciones

Flujos de aprobación por correo y enlace. El administrador crea cuentas; el solicitante envía solicitudes; quien aprueba entra con el enlace del mail.

Base de datos: **Supabase Postgres** (proyecto `app-aprobaciones`). La app usa Prisma en el servidor; las tablas tienen RLS activo y sin políticas para que la Data API no las exponga.

## Variables en Vercel

En **Settings → Environment Variables** (Production):

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | Pooler transacción (puerto 6543, con `?pgbouncer=true`) |
| `DIRECT_URL` | Pooler sesión (puerto 5432) |
| `AUTH_SECRET` | Texto largo aleatorio |
| `APP_URL` | `https://app-aprobaciones-ei.vercel.app` |

Copia `DATABASE_URL`, `DIRECT_URL` y `AUTH_SECRET` desde el `.env` local (no está en git). Dashboard: https://supabase.com/dashboard/project/zlqzrjrmuntznoknaolk

Tras el primer login se crean:

- Administrador: `admin@eisa.local` / `demo1234`
- Solicitante: `ana.garcia@eisa.local` / `demo1234`

## Local

```bash
npm install
npx prisma generate
npm run dev
```
