'use client';

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Agent = {
  id: string;
  full_name: string;
};

export function NewTicketForm({ agents }: { agents: Agent[] }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const supabase = createClient();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as 'HIGH' | 'MEDIUM' | 'LOW';
    const assignedTo = formData.get('assigned_to') as string;

    const { error } = await supabase
      .from('tickets')
      .insert([
        {
          title,
          description,
          priority,
          assigned_to: assignedTo || null,
          status: 'OPEN'
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
          className="bg-[#242424] border-[#333333] text-white"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          className="w-full rounded-md bg-[#242424] border-[#333333] text-white p-2"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <select
          id="priority"
          name="priority"
          required
          className="w-full rounded-md bg-[#242424] border-[#333333] text-white p-2"
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assigned_to">Assign To</Label>
        <select
          id="assigned_to"
          name="assigned_to"
          className="w-full rounded-md bg-[#242424] border-[#333333] text-white p-2"
        >
          <option value="">Unassigned</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.full_name}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#333333] hover:bg-[#444444]"
      >
        {isSubmitting ? 'Creating...' : 'Create Ticket'}
      </Button>
    </form>
  );
} 