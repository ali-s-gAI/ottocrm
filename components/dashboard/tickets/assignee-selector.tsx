'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { createClient } from "@/utils/supabase/client";

type Agent = {
  id: string;
  full_name: string;
};

interface AssigneeSelectorProps {
  ticketId: string;
  currentAssigneeId: string | null;
  currentAssigneeName: string | null;
  onAssign?: (agentId: string | null) => void;
  isAdmin: boolean;
}

export function AssigneeSelector({ 
  ticketId, 
  currentAssigneeId,
  currentAssigneeName,
  onAssign,
  isAdmin 
}: AssigneeSelectorProps) {
  const [open, setOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function fetchAgents() {
      const { data } = await supabase
        .from('user_profiles')
        .select('id, full_name')
        .eq('role', 'AGENT')
        .order('full_name');
      
      if (data) {
        setAgents(data);
      }
    }

    fetchAgents();
  }, []);

  const handleSelect = async (agentId: string) => {
    setLoading(true);
    
    // If selecting the same agent, treat as unassignment
    const newAssigneeId = agentId === currentAssigneeId ? null : agentId;
    
    const { error } = await supabase
      .from('tickets')
      .update({ assigned_to: newAssigneeId })
      .eq('id', ticketId);

    if (!error && onAssign) {
      onAssign(newAssigneeId);
    }

    setLoading(false);
    setOpen(false);
  };

  const filteredAgents = agents.filter(agent =>
    agent.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <span className="text-muted-foreground">
        {currentAssigneeName || 'Unassigned'}
      </span>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
          disabled={loading}
        >
          {currentAssigneeName || "Unassigned"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2">
        <div className="space-y-2">
          <div className="flex items-center gap-2 border rounded-md px-2">
            <Search className="h-4 w-4 opacity-50" />
            <Input
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
            />
          </div>
          <div className="max-h-[300px] overflow-auto">
            {filteredAgents.length === 0 ? (
              <div className="text-sm text-muted-foreground py-2 text-center">
                No agents found
              </div>
            ) : (
              filteredAgents.map((agent) => (
                <Button
                  key={agent.id}
                  variant="ghost"
                  className="w-full justify-start gap-2 font-normal"
                  onClick={() => handleSelect(agent.id)}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      currentAssigneeId === agent.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {agent.full_name}
                </Button>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 