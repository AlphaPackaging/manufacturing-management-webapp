import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserRole, isAdmin } from "@/lib/auth/role";
import { MachineTable } from "./machine-table";
import { PrintButton } from "@/components/shared/print-button";

interface Machine {
  id: string;
  name: string;
  serial_number: string;
  process_type: string;
  status: string;
  created_at: string;
}

export default async function MachineManagerPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  const role = await getUserRole(supabase, user.id);
  if (!isAdmin(role)) {
    redirect("/dashboard");
  }

  const { data } = await supabase
    .from("machines")
    .select("id, name, serial_number, process_type, status, created_at")
    .order("name");

  const machines = (data ?? []) as Machine[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Machine Manager</h2>
        <PrintButton />
      </div>
      <MachineTable machines={machines} />
    </div>
  );
}
