'use client';

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AssigneeSelector } from "./assignee-selector";
import { PrioritySelector } from "./priority-selector";

type Ticket = {
  id: string;
  title: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  created_at: string;
  created_by_profile: { full_name: string } | null;
  assigned_to: string | null;
  assigned_to_profile: { full_name: string } | null;
};

type SortField = "title" | "status" | "priority" | "created" | "assignee" | "creator";
type SortOrder = "asc" | "desc";

export function TicketList({ 
  initialTickets,
  isAdmin = false,
  isAgent = false,
  statusFilter = 'ALL',
  priorityFilter = 'ALL',
  assigneeFilter = 'ALL'
}: { 
  initialTickets: Ticket[];
  isAdmin?: boolean;
  isAgent?: boolean;
  statusFilter?: string;
  priorityFilter?: string;
  assigneeFilter?: string;
}) {
  const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>(initialTickets);
  const [sortField, setSortField] = useState<SortField>("created");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const supabase = createClient();

  const isStaff = isAdmin || isAgent;

  // Apply filters whenever tickets or filter values change
  useEffect(() => {
    let filtered = [...tickets];

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.status === statusFilter);
    }

    if (priorityFilter !== 'ALL') {
      filtered = filtered.filter(ticket => ticket.priority === priorityFilter);
    }

    if (assigneeFilter !== 'ALL') {
      if (assigneeFilter === 'UNASSIGNED') {
        filtered = filtered.filter(ticket => !ticket.assigned_to);
      } else {
        filtered = filtered.filter(ticket => ticket.assigned_to === assigneeFilter);
      }
    }

    // Apply current sort to filtered results
    const sorted = sortTicketArray(filtered, sortField, sortOrder);
    setFilteredTickets(sorted);
  }, [tickets, statusFilter, priorityFilter, assigneeFilter, sortField, sortOrder]);

  // Helper function to sort ticket arrays
  const sortTicketArray = (ticketsToSort: Ticket[], field: SortField, order: SortOrder) => {
    return [...ticketsToSort].sort((a, b) => {
      const multiplier = order === "asc" ? 1 : -1;
      
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
  };

  const sortTickets = (field: SortField) => {
    const newOrder = field === sortField && sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newOrder);
    setSortField(field);
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

  // Update tickets when initialTickets changes
  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  const handleAssign = (ticketId: string, agentId: string | null) => {
    setTickets(currentTickets => 
      currentTickets.map(ticket => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            assigned_to: agentId,
            assigned_to_profile: null // This will be updated by the real-time subscription
          };
        }
        return ticket;
      })
    );
  };

  const handlePriorityChange = (ticketId: string, newPriority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    setTickets(currentTickets => 
      currentTickets.map(ticket => {
        if (ticket.id === ticketId) {
          return {
            ...ticket,
            priority: newPriority
          };
        }
        return ticket;
      })
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left text-muted-foreground text-sm">
            <th className="pb-4 px-4">
              <Button
                variant="ghost"
                onClick={() => sortTickets("title")}
                className="h-8 text-left font-medium text-muted-foreground"
              >
                Title {getSortIcon("title")}
              </Button>
            </th>
            <th className="pb-4 px-4">
              <Button
                variant="ghost"
                onClick={() => sortTickets("status")}
                className="h-8 text-left font-medium text-muted-foreground"
              >
                Status {getSortIcon("status")}
              </Button>
            </th>
            {isStaff && (
              <th className="pb-4 px-4">
                <Button
                  variant="ghost"
                  onClick={() => sortTickets("priority")}
                  className="h-8 text-left font-medium text-muted-foreground"
                >
                  Priority {getSortIcon("priority")}
                </Button>
              </th>
            )}
            <th className="pb-4 px-4">
              <Button
                variant="ghost"
                onClick={() => sortTickets("creator")}
                className="h-8 text-left font-medium text-muted-foreground"
              >
                Created By {getSortIcon("creator")}
              </Button>
            </th>
            {isStaff && (
              <th className="pb-4 px-4">
                <Button
                  variant="ghost"
                  onClick={() => sortTickets("assignee")}
                  className="h-8 text-left font-medium text-muted-foreground"
                >
                  Assigned To {getSortIcon("assignee")}
                </Button>
              </th>
            )}
            <th className="pb-4 px-4">
              <Button
                variant="ghost"
                onClick={() => sortTickets("created")}
                className="h-8 text-left font-medium text-muted-foreground"
              >
                Created {getSortIcon("created")}
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredTickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="border-t border-border hover:bg-muted/50 cursor-pointer"
            >
              <td className="p-0">
                <Link 
                  href={`/dashboard/tickets/${ticket.id}`}
                  className="block py-4 px-4 text-foreground"
                >
                  {ticket.title}
                </Link>
              </td>
              <td className="py-4 px-4">
                <StatusBadge status={ticket.status} />
              </td>
              {isStaff && (
                <td className="py-4 px-4">
                  <PrioritySelector
                    ticketId={ticket.id}
                    currentPriority={ticket.priority}
                    isStaff={isStaff}
                    onPriorityChange={(newPriority) => handlePriorityChange(ticket.id, newPriority)}
                  />
                </td>
              )}
              <td className="py-4 px-4 text-muted-foreground">
                {ticket.created_by_profile?.full_name || 'Unknown'}
              </td>
              {isStaff && (
                <td className="py-4 px-4">
                  <AssigneeSelector
                    ticketId={ticket.id}
                    currentAssigneeId={ticket.assigned_to}
                    currentAssigneeName={ticket.assigned_to_profile?.full_name || null}
                    onAssign={(agentId) => handleAssign(ticket.id, agentId)}
                    isAdmin={isAdmin}
                  />
                </td>
              )}
              <td className="py-4 px-4 text-muted-foreground text-sm">
                {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
              </td>
            </tr>
          ))}
          {filteredTickets.length === 0 && (
            <tr>
              <td colSpan={isStaff ? 6 : 4} className="py-8 text-center text-muted-foreground">
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