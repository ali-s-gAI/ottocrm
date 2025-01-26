import { createClient } from "@/utils/supabase/server";
import { NewTicketForm } from "@/components/dashboard/tickets/new-ticket-form";

export default async function NewTicketPage() {
  const supabase = await createClient();

  // First get all agents
  const { data: agents } = await supabase
    .from('user_profiles')
    .select('id, full_name')
    .eq('role', 'AGENT')
    .order('full_name');

  // Then get ticket counts for each agent
  const agentsWithCounts = await Promise.all(
    (agents || []).map(async (agent) => {
      const { count: openCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', agent.id)
        .in('status', ['OPEN', 'IN_PROGRESS']);

      const { count: closedCount } = await supabase
        .from('tickets')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', agent.id)
        .in('status', ['RESOLVED', 'CLOSED']);

      return {
        ...agent,
        open_tickets: openCount || 0,
        closed_tickets: closedCount || 0
      };
    })
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Create New Ticket</h1>
      <NewTicketForm agents={agentsWithCounts} />
    </div>
  );
} 