import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth/role";
import { SidebarNav } from "./sidebar-nav";
import { LogoutButton } from "./logout-button";
import { IdleTimeout } from "./idle-timeout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users_profile")
    .select("first_name, role")
    .eq("user_id", user.id)
    .single();

  const greeting = profile?.first_name ? `Hi, ${profile.first_name}` : user.email;
  const role = (profile?.role as UserRole) ?? null;

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 flex-col border-r bg-muted/40">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-lg font-semibold">APGL</span>
        </div>
        <SidebarNav role={role} />
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-end border-b px-6">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{greeting}</span>
            <LogoutButton />
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
        <IdleTimeout />
      </div>
    </div>
  );
}
