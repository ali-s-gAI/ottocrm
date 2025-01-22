import { createClient } from "@/utils/supabase/server";
import { NewTicketForm } from "@/components/dashboard/tickets/new-ticket-form";

export default async function NewTicketPage() {
  const supabase = await createClient();

  const { data: agents } = await supabase
    .from('user_profiles')
    .select('id, full_name')
    .eq('role', 'AGENT');

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Create New Ticket</h1>
      <NewTicketForm agents={agents || []} />
    </div>
  );
} 