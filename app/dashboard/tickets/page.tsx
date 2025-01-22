import { createClient } from "@/utils/supabase/server";
import { TicketList } from "@/components/dashboard/tickets/ticket-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function TicketsPage() {
  const supabase = await createClient();

  const { data: tickets } = await supabase
    .from('tickets')
    .select(`
      *,
      created_by:user_profiles!created_by(full_name),
      assigned_to:user_profiles!assigned_to(full_name)
    `)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Tickets</h1>
        <Link href="/dashboard/tickets/new">
          <Button className="bg-[#333333] hover:bg-[#444444]">
            <Plus className="w-4 h-4 mr-2" />
            New Ticket
          </Button>
        </Link>
      </div>

      <TicketList initialTickets={tickets || []} />
    </div>
  );
} 