import Hero from "@/components/hero";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  // If user is logged in, redirect to dashboard
  if (user) {
    return redirect('/dashboard');
  }

  return (
    <>
      <Hero />
      <main className="flex-1 flex flex-col gap-6 px-4">
        {/* Empty for now, we'll add content later */}
      </main>
    </>
  );
}
