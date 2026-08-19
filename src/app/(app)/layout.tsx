import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-dvh bg-background lg:flex">
      <Sidebar user={user} />
      <div className="min-w-0 flex-1 lg:min-h-dvh lg:overflow-auto">
        <div className="mx-auto max-w-[1140px] px-4 py-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-6 sm:py-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
