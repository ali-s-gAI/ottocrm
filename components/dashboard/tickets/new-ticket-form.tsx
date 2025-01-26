'use client';

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Agent = {
  id: string;
  full_name: string;
  open_tickets: number;
  closed_tickets: number;
};

export function NewTicketForm({ agents }: { agents: Agent[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAgent, setIsAgent] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedPriority, setSelectedPriority] = useState<'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const supabase = createClient();

  const priorityColors = {
    HIGH: 'text-red-500',
    MEDIUM: 'text-orange-500',
    LOW: 'text-yellow-500'
  };

  useEffect(() => {
    async function checkUserRole() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        setIsAdmin(profile?.role === 'ADMIN');
        setIsAgent(profile?.role === 'AGENT');
      }
    }
    checkUserRole();
  }, [supabase]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const assignedTo = formData.get('assigned_to') as string;

    const { error } = await supabase
      .from('tickets')
      .insert([
        {
          title,
          description,
          priority: isAdmin || isAgent ? selectedPriority : 'MEDIUM', // Default to MEDIUM for customers
          assigned_to: isAdmin ? (assignedTo || null) : null,
          status: 'OPEN',
          created_by: userId
        }
      ]);

    if (error) {
      console.error('Error creating ticket:', error);
      alert('Failed to create ticket. Please try again.');
      setIsSubmitting(false);
      return;
    }

    router.push('/dashboard/tickets');
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          required
          rows={4}
          className="w-full"
        />
      </div>

      {(isAdmin || isAgent) && (
        <div className="space-y-2">
          <Label>Priority</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-between ${priorityColors[selectedPriority]}`}
              >
                {selectedPriority}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-[8rem]">
              <DropdownMenuItem 
                onClick={() => setSelectedPriority('LOW')}
                className={`${priorityColors.LOW} focus:text-yellow-500 focus:bg-yellow-500/10`}
              >
                LOW
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedPriority('MEDIUM')}
                className={`${priorityColors.MEDIUM} focus:text-orange-500 focus:bg-orange-500/10`}
              >
                MEDIUM
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setSelectedPriority('HIGH')}
                className={`${priorityColors.HIGH} focus:text-red-500 focus:bg-red-500/10`}
              >
                HIGH
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      {isAdmin && (
        <div className="space-y-2">
          <Label htmlFor="assigned_to">
            Assign To {agents.length === 0 && "(No agents available)"}
          </Label>
          <select
            id="assigned_to"
            name="assigned_to"
            className="w-full rounded-md bg-background border border-input p-2"
            disabled={agents.length === 0}
          >
            <option value="">Unassigned</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.full_name} ({agent.open_tickets} open, {agent.closed_tickets} closed)
              </option>
            ))}
          </select>
          {agents.length === 0 && (
            <p className="text-sm text-yellow-500 mt-1">
              No support agents are currently available. Add agents in the admin dashboard.
            </p>
          )}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting ? 'Creating...' : 'Create Ticket'}
      </Button>
    </form>
  );
} 