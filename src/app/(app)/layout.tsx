import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar, MobileBottomNav } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar businessName={user.businessName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar user={user} />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">{children}</main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
