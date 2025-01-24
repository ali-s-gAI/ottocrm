import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { TicketChat } from "@/components/dashboard/tickets/ticket-chat";
import { AssigneeSelector } from "@/components/dashboard/tickets/assignee-selector";
import { StatusControl } from "@/components/dashboard/tickets/status-control";
import { PrioritySelector } from "@/components/dashboard/tickets/priority-selector";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TicketPage({ params }: PageProps) {
  const { id } = await params;
  console.log('Debug: Accessing ticket page with ID:', id);
  
  const supabase = await createClient();

  // Fetch the ticket details
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      *,
      created_by_profile:user_profiles!tickets_created_by_fkey(full_name, email),
      assigned_to_profile:user_profiles!tickets_assigned_to_fkey(full_name, email)
    `)
    .eq('id', id)
    .single();

  console.log('Debug: Ticket fetch result:', { 
    ticket, 
    error: error ? {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    } : null 
  });

  if (error || !ticket) {
    console.log('Debug: No ticket found or error occurred:', { 
      error: error ? {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      } : null 
    });
    notFound();
  }

  // Get current user for access control
  const {
    data: { user },
  } = await supabase.auth.getUser();

  console.log('Debug: Current user:', user?.id);

  if (!user) {
    console.log('Debug: No user found');
    return null;
  }

  // Get user's role
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  console.log('Debug: User profile:', userProfile);

  // Check access permission
  const hasAccess = 
    userProfile?.role === 'ADMIN' || 
    userProfile?.role === 'AGENT' || 
    ticket.created_by === user.id;

  console.log('Debug: Access check:', { 
    role: userProfile?.role,
    isAdmin: userProfile?.role === 'ADMIN',
    isAgent: userProfile?.role === 'AGENT',
    isCreator: ticket.created_by === user.id,
    hasAccess 
  });

  if (!hasAccess) {
    console.log('Debug: Access denied');
    notFound();
  }

  const isAdmin = userProfile?.role === 'ADMIN';
  const isStaff = userProfile?.role === 'ADMIN' || userProfile?.role === 'AGENT';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">{ticket.title}</h1>
        <StatusControl 
          ticketId={ticket.id}
          currentStatus={ticket.status}
          userRole={userProfile?.role}
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
              currentUser={user}
              userRole={userProfile?.role}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
