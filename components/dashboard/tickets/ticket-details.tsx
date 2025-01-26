'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { AssigneeSelector } from "@/components/dashboard/tickets/assignee-selector";
import { StatusControl } from "@/components/dashboard/tickets/status-control";
import { PrioritySelector } from "@/components/dashboard/tickets/priority-selector";
import { TicketChat } from "@/components/dashboard/tickets/ticket-chat";
import { User } from '@supabase/supabase-js';

interface TicketDetailsProps {
  initialTicket: any;
  currentUser: User;
  userRole: 'ADMIN' | 'AGENT' | 'CUSTOMER' | '';
  isAdmin: boolean;
  isStaff: boolean;
}

export function TicketDetails({ initialTicket, currentUser, userRole, isAdmin, isStaff }: TicketDetailsProps) {
  const [ticket, setTicket] = useState(initialTicket);
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`ticket_${ticket.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets',
          filter: `id=eq.${ticket.id}`,
        },
        async (payload) => {
          // Fetch the updated ticket with all relations
          const { data: updatedTicket } = await supabase
            .from('tickets')
            .select(`
              *,
              created_by_profile:user_profiles!tickets_created_by_fkey(full_name, email),
              assigned_to_profile:user_profiles!tickets_assigned_to_fkey(full_name, email)
            `)
            .eq('id', ticket.id)
            .single();

          if (updatedTicket) {
            setTicket(updatedTicket);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticket.id]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">{ticket.title}</h1>
        <StatusControl 
          ticketId={ticket.id}
          currentStatus={ticket.status}
          userRole={userRole}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isStaff && (
              <div>
                <div className="text-sm text-muted-foreground">Priority</div>
                <div className="font-medium">
                  <PrioritySelector
                    ticketId={ticket.id}
                    currentPriority={ticket.priority}
                    isStaff={isStaff}
                  />
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-muted-foreground">Created By</div>
              <div className="font-medium">
                {ticket.created_by_profile.full_name}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Assigned To</div>
              <div className="font-medium">
                <AssigneeSelector
                  ticketId={ticket.id}
                  currentAssigneeId={ticket.assigned_to}
                  currentAssigneeName={ticket.assigned_to_profile?.full_name}
                  isAdmin={isAdmin}
                />
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Created</div>
              <div className="font-medium">
                {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Description</div>
              <div className="font-medium whitespace-pre-wrap">{ticket.description}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Updates & Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <TicketChat 
              ticketId={ticket.id} 
              currentUser={currentUser}
              userRole={userRole}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 
