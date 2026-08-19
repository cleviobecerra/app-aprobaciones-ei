export default function AppLoading() {
  return (
    <div className="animate-pulse space-y-4" aria-busy="true" aria-label="Cargando">
      <div className="h-8 w-48 rounded-lg bg-soft" />
      <div className="h-4 w-full max-w-md rounded bg-soft" />
      <div className="ui-card h-40" />
      <div className="ui-card h-28" />
      <div className="ui-card h-28" />
    </div>
  );
}
