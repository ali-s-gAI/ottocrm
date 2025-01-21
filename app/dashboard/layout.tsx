import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import DashboardNav from "@/components/dashboard/nav";
import DashboardHeader from "@/components/dashboard/header";

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
    return redirect("/sign-in");
  }

  return (
    <div className="flex h-screen bg-[#1C1C1C]">
      {/* Sidebar */}
      <DashboardNav />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <DashboardHeader user={user} />
        <main className="flex-1 overflow-auto p-6 bg-[#242424]">
          {children}
        </main>
      </div>
    </div>
  );
} 