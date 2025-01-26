import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { NewDocForm } from "@/components/dashboard/docs/new-doc-form";

export default async function NewDocPage() {
  const supabase = await createClient();

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'ADMIN') {
    return redirect("/dashboard/docs");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Create New Document</h1>
      <NewDocForm />
    </div>
  );
} 