'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";

type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

interface PrioritySelectorProps {
  ticketId: string;
  currentPriority: Priority;
  isStaff: boolean;
  onPriorityChange?: (newPriority: Priority) => void;
}

export function PrioritySelector({ 
  ticketId, 
  currentPriority,
  isStaff,
  onPriorityChange 
}: PrioritySelectorProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const priorityColors = {
    HIGH: 'text-red-500',
    MEDIUM: 'text-orange-500',
    LOW: 'text-yellow-500'
  };

  const handlePriorityChange = async (newPriority: Priority) => {
    setLoading(true);
    
    const { error } = await supabase
      .from('tickets')
      .update({ priority: newPriority })
      .eq('id', ticketId);

    if (!error && onPriorityChange) {
      onPriorityChange(newPriority);
    }

    setLoading(false);
  };

  // If not staff, just show the priority text
  if (!isStaff) {
    return (
      <span className={priorityColors[currentPriority]}>
        {currentPriority}
      </span>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={loading}
          className={`${priorityColors[currentPriority]} hover:bg-muted justify-start gap-2 font-normal`}
        >
          {currentPriority}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handlePriorityChange('LOW')}
          className={`${priorityColors.LOW} focus:text-yellow-500 focus:bg-yellow-500/10 cursor-pointer`}
        >
          LOW
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handlePriorityChange('MEDIUM')}
          className={`${priorityColors.MEDIUM} focus:text-orange-500 focus:bg-orange-500/10 cursor-pointer`}
        >
          MEDIUM
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handlePriorityChange('HIGH')}
          className={`${priorityColors.HIGH} focus:text-red-500 focus:bg-red-500/10 cursor-pointer`}
        >
          HIGH
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 