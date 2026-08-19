export default function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-4 sm:p-6">
      <div className="ui-card max-w-md p-8 text-center">
        <h1 className="text-xl font-semibold tracking-tight">Enlace no válido</h1>
        <p className="mt-2 text-sm text-subtle">Este enlace de aprobación no existe o ya no está disponible.</p>
      </div>
    </main>
  );
}
