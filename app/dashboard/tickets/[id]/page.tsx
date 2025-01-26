import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import { TicketDetails } from "@/components/dashboard/tickets/ticket-details";

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
    <TicketDetails
      initialTicket={ticket}
      currentUser={user}
      userRole={userProfile?.role || ''}
      isAdmin={isAdmin}
      isStaff={isStaff}
    />
  );
}
