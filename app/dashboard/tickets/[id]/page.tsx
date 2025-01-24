import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { TicketChat } from "@/components/dashboard/tickets/ticket-chat";

export default async function TicketPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // Fetch the ticket details
  const { data: ticket, error } = await supabase
    .from('tickets')
    .select(`
      *,
      created_by_profile:user_profiles!tickets_created_by_fkey(full_name, email),
      assigned_to_profile:user_profiles!tickets_assigned_to_fkey(full_name, email)
    `)
    .eq('id', params.id)
    .single();

  if (error || !ticket) {
    notFound();
  }

  // Get current user for access control
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Get user's role
  const { data: userProfile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Check access permission
  const hasAccess = 
    userProfile?.role === 'ADMIN' || 
    userProfile?.role === 'AGENT' || 
    ticket.created_by === user.id;

  if (!hasAccess) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{ticket.title}</h1>
        <Badge 
          variant={ticket.status === 'OPEN' ? 'default' : 'secondary'}
          className="text-sm"
        >
          {ticket.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Priority</div>
              <div className="font-medium">{ticket.priority}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Created By</div>
              <div className="font-medium">
                {ticket.created_by_profile.full_name}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Assigned To</div>
              <div className="font-medium">
                {ticket.assigned_to_profile?.full_name || 'Unassigned'}
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
