'use client';

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Ticket = {
  id: string;
  title: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  created_at: string;
  created_by_profile: { full_name: string } | null;
  assigned_to_profile: { full_name: string } | null;
};

type SortField = "title" | "status" | "priority" | "created" | "assignee" | "creator";
type SortOrder = "asc" | "desc";

export function TicketList({ initialTickets }: { initialTickets: Ticket[] }) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [sortField, setSortField] = useState<SortField>("created");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const supabase = createClient();

  const sortTickets = (field: SortField) => {
    const newOrder = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    setSortField(field);

    const sorted = [...tickets].sort((a, b) => {
      const multiplier = newOrder === "asc" ? 1 : -1;
      
      switch (field) {
        case "title":
          return multiplier * a.title.localeCompare(b.title);
        case "status":
          return multiplier * a.status.localeCompare(b.status);
        case "priority": {
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return multiplier * (priorityOrder[a.priority] - priorityOrder[b.priority]);
        }
        case "created":
          return multiplier * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        case "assignee":
          const aName = a.assigned_to_profile?.full_name || '';
          const bName = b.assigned_to_profile?.full_name || '';
          return multiplier * aName.localeCompare(bName);
        case "creator":
          const aCreator = a.created_by_profile?.full_name || '';
          const bCreator = b.created_by_profile?.full_name || '';
          return multiplier * aCreator.localeCompare(bCreator);
        default:
          return 0;
      }
    });

    setTickets(sorted);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return "↕️";
    return sortOrder === "asc" ? "↑" : "↓";
  };

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
              created_by_profile:user_profiles!tickets_created_by_fkey(full_name),
              assigned_to_profile:user_profiles!tickets_assigned_to_fkey(full_name)
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
            <th className="pb-4 px-4">
              <Button
                variant="ghost"
                onClick={() => sortTickets("title")}
                className="h-8 text-left font-medium text-gray-400"
              >
                Title {getSortIcon("title")}
              </Button>
            </th>
            <th className="pb-4 px-4">
              <Button
                variant="ghost"
                onClick={() => sortTickets("status")}
                className="h-8 text-left font-medium text-gray-400"
              >
                Status {getSortIcon("status")}
              </Button>
            </th>
            <th className="pb-4 px-4">
              <Button
                variant="ghost"
                onClick={() => sortTickets("priority")}
                className="h-8 text-left font-medium text-gray-400"
              >
                Priority {getSortIcon("priority")}
              </Button>
            </th>
            <th className="pb-4 px-4">
              <Button
                variant="ghost"
                onClick={() => sortTickets("creator")}
                className="h-8 text-left font-medium text-gray-400"
              >
                Created By {getSortIcon("creator")}
              </Button>
            </th>
            <th className="pb-4 px-4">
              <Button
                variant="ghost"
                onClick={() => sortTickets("assignee")}
                className="h-8 text-left font-medium text-gray-400"
              >
                Assigned To {getSortIcon("assignee")}
              </Button>
            </th>
            <th className="pb-4 px-4">
              <Button
                variant="ghost"
                onClick={() => sortTickets("created")}
                className="h-8 text-left font-medium text-gray-400"
              >
                Created {getSortIcon("created")}
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="border-t border-[#333333] hover:bg-[#2A2A2A] cursor-pointer"
            >
              <Link href={`/dashboard/tickets/${ticket.id}`} className="contents">
                <td className="py-4 px-4 text-white">{ticket.title}</td>
                <td className="py-4 px-4">
                  <StatusBadge status={ticket.status} />
                </td>
                <td className="py-4 px-4">
                  <PriorityBadge priority={ticket.priority} />
                </td>
                <td className="py-4 px-4 text-gray-300">{ticket.created_by_profile?.full_name || 'Unknown'}</td>
                <td className="py-4 px-4 text-gray-300">
                  {ticket.assigned_to_profile?.full_name || '-'}
                </td>
                <td className="py-4 px-4 text-gray-400 text-sm">
                  {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
                </td>
              </Link>
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
    IN_PROGRESS: 'bg-purple-500/10 text-purple-500',
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
    MEDIUM: 'bg-orange-500/10 text-orange-500',
    LOW: 'bg-yellow-500/10 text-yellow-500'
  };

  return (
    <Badge className={`${colors[priority]} border-0`}>
      {priority}
    </Badge>
  );
} 