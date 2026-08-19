export function BrandMark({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const box =
    size === "lg"
      ? "size-14 text-lg"
      : size === "sm"
        ? "size-8 text-[11px]"
        : "size-10 text-sm";

  return (
    <span
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-2xl bg-fg font-bold tracking-tight text-white shadow-sm`}
      aria-hidden
    >
      EI
    </span>
  );
}
