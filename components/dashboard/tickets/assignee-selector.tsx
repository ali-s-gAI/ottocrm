'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
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
  const supabase = createClient();

  // Create a map of agent names to IDs for easier lookup
  const agentMap = Object.fromEntries(
    agents.map(agent => [agent.full_name.toLowerCase(), agent.id])
  );

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
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search agents..." />
          <CommandEmpty>No agent found.</CommandEmpty>
          <CommandGroup>
            {agents.map((agent) => (
              <CommandItem
                key={agent.id}
                value={agent.full_name}
                onSelect={(currentValue) => {
                  const selectedId = agentMap[currentValue.toLowerCase()];
                  if (selectedId) handleSelect(selectedId);
                }}
                className="w-full select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-default"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    currentAssigneeId === agent.id ? "opacity-100" : "opacity-0"
                  )}
                />
                {agent.full_name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 