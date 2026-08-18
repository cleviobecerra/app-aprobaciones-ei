# App Aprobaciones

Flujos de aprobación por **correo y enlace**, como DocuSign: escribes el email de quien debe aprobar y esa persona entra sin cuenta ni rol.

## Cómo arrancar

```bash
cd app-tmp
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Quién inicia sesión

Solo quien **envía** la solicitud:

- `ana.garcia@eisa.local` / `demo1234`

Los destinatarios **no se registran**. Reciben un enlace `/aprobar/...` y aprueban o rechazan ahí.

## Correo

Si configuras SMTP en `.env` (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`), el enlace se manda al correo.

Sin SMTP, el enlace queda en **Correos** y en la solicitud, para copiarlo o abrirlo como si hubiera llegado el mail.

## Flujo

- Etapas en orden: la 2 solo se activa cuando termina la 1.
- Varios correos en la misma etapa = paralelo.
- Un rechazo cierra la solicitud.
- Cada acción queda en la pista de auditoría.
