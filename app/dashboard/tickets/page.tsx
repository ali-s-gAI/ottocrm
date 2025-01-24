'use client';

import { createClient } from "@/utils/supabase/client";
import { TicketList } from "@/components/dashboard/tickets/ticket-list";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type UserProfile = {
  id: string;
  role: 'ADMIN' | 'AGENT' | 'USER';
};

type Agent = {
  id: string;
  full_name: string;
};

type Ticket = {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  created_at: string;
  created_by: string;
  assigned_to: string | null;
  created_by_profile: { full_name: string };
  assigned_to_profile: { full_name: string } | null;
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState('ALL');
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      // Get current user's role and id
      const { data: { user } } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, id')
        .eq('id', user?.id)
        .single();

      setUserProfile(profile as UserProfile);

      // If user is an agent, set the assignee filter to their ID
      if (profile?.role === 'AGENT') {
        setAssigneeFilter(profile.id);
      }

      // Fetch tickets
      const { data: ticketsData } = await supabase
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

      setTickets(ticketsData?.map(ticket => ({
        ...ticket,
        created_by_profile: Array.isArray(ticket.created_by_profile) 
          ? { full_name: ticket.created_by_profile[0]?.full_name || 'Unknown' }
          : ticket.created_by_profile,
        assigned_to_profile: Array.isArray(ticket.assigned_to_profile)
          ? ticket.assigned_to_profile[0] || null
          : ticket.assigned_to_profile
      })) as Ticket[] || []);

      // Fetch agents for filter
      const { data: agentsData } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .in('role', ['ADMIN', 'AGENT']);

      setAgents(agentsData as Agent[] || []);
    };

    fetchData();
  }, []);

  const isAdmin = userProfile?.role === 'ADMIN';
  const isAgent = userProfile?.role === 'AGENT';
  const isStaff = isAdmin || isAgent;

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

      {isStaff && (
        <div className="flex gap-4 mb-6">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Priority</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Assignees</SelectItem>
              <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
              {agents.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <TicketList 
        initialTickets={tickets} 
        isAdmin={isAdmin}
        isAgent={isAgent}
        statusFilter={isStaff ? statusFilter : 'ALL'}
        priorityFilter={isStaff ? priorityFilter : 'ALL'}
        assigneeFilter={isStaff ? assigneeFilter : 'ALL'}
      />
    </div>
  );
} 