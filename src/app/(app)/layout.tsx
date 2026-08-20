import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { AppFooter } from "@/components/app-footer";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-dvh bg-background lg:flex">
      <Sidebar user={user} />
      <div className="flex min-h-dvh min-w-0 flex-1 flex-col lg:overflow-auto">
        <div className="mx-auto w-full max-w-[1140px] flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:p-8">
          {children}
        </div>
        <AppFooter />
      </div>
    </div>
  );
}
