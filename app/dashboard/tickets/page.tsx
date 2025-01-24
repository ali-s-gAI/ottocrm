import { createClient } from "@/utils/supabase/server";
import { TicketList } from "@/components/dashboard/tickets/ticket-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function TicketsPage() {
  const supabase = await createClient();

  // Get current user's role
  const { data: { user } } = await supabase.auth.getUser();
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user?.id)
    .single();

  const isAdmin = userProfile?.role === 'ADMIN';

  const { data: tickets, error } = await supabase
    .from('tickets')
    .select(`
      id,
      title,
      description,
      status,
      priority,
      created_at,
      created_by,
      assigned_to,
      created_by_profile:user_profiles!tickets_created_by_fkey(full_name),
      assigned_to_profile:user_profiles!tickets_assigned_to_fkey(full_name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets:', {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Tickets</h1>
        <Link href="/dashboard/tickets/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </Link>
      </div>

      <TicketList initialTickets={tickets || []} isAdmin={isAdmin} />
    </div>
  );
} 