import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SettingsForm } from "@/components/dashboard/settings/settings-form";

export default async function SettingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect("/sign-in");

  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">
          {profile.full_name}
        </h1>
        <div className="flex items-center gap-2">
          <span className="text-lg text-muted-foreground font-medium capitalize">
            {profile.role.toLowerCase()}
          </span>
          <span className="text-xs text-muted-foreground/60 font-mono">
            {user.id}
          </span>
        </div>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        <SettingsForm 
          user={user}
          initialProfile={profile}
        />
      </div>
    </div>
  );
} 