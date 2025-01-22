'use client';

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

type Ticket = {
  id: string;
  title: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  created_at: string;
  created_by: { full_name: string };
  assigned_to: { full_name: string } | null;
};

export function TicketList({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const supabase = createClient();

  useEffect(() => {
    // Set up real-time subscription
    const channel = supabase
      .channel('tickets-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        async (payload) => {
          // Refresh the entire list when any change occurs
          const { data } = await supabase
            .from('tickets')
            .select(`
              *,
              created_by:user_profiles!created_by(full_name),
              assigned_to:user_profiles!assigned_to(full_name)
            `)
            .order('created_at', { ascending: false });
          
          if (data) setTickets(data);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-gray-400 text-sm">
            <th className="pb-4 px-4">Title</th>
            <th className="pb-4 px-4">Status</th>
            <th className="pb-4 px-4">Priority</th>
            <th className="pb-4 px-4">Created By</th>
            <th className="pb-4 px-4">Assigned To</th>
            <th className="pb-4 px-4">Created</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="border-t border-[#333333] hover:bg-[#2A2A2A] cursor-pointer"
              onClick={() => window.location.href = `/dashboard/tickets/${ticket.id}`}
            >
              <td className="py-4 px-4 text-white">{ticket.title}</td>
              <td className="py-4 px-4">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="py-4 px-4">
                <PriorityBadge priority={ticket.priority} />
              </td>
              <td className="py-4 px-4 text-gray-300">{ticket.created_by.full_name}</td>
              <td className="py-4 px-4 text-gray-300">
                {ticket.assigned_to?.full_name || '-'}
              </td>
              <td className="py-4 px-4 text-gray-400 text-sm">
                {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
              </td>
            </tr>
          ))}
          {tickets.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-gray-400">
                No tickets found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: Ticket['status'] }) {
  const colors = {
    OPEN: 'bg-blue-500/10 text-blue-500',
    IN_PROGRESS: 'bg-yellow-500/10 text-yellow-500',
    RESOLVED: 'bg-green-500/10 text-green-500',
    CLOSED: 'bg-gray-500/10 text-gray-500'
  };

  return (
    <Badge className={`${colors[status]} border-0`}>
      {status.replace('_', ' ')}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: Ticket['priority'] }) {
  const colors = {
    HIGH: 'bg-red-500/10 text-red-500',
    MEDIUM: 'bg-yellow-500/10 text-yellow-500',
    LOW: 'bg-green-500/10 text-green-500'
  };

  return (
    <Badge className={`${colors[priority]} border-0`}>
      {priority}
    </Badge>
  );
} 