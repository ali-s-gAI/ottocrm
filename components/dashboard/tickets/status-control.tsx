'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { Badge } from "@/components/ui/badge";

interface StatusControlProps {
  ticketId: string;
  currentStatus: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  userRole?: 'ADMIN' | 'AGENT' | 'CUSTOMER' | '';
  onStatusChange?: (newStatus: string) => void;
}

export function StatusControl({ 
  ticketId, 
  currentStatus,
  userRole,
  onStatusChange 
}: StatusControlProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleStatusChange = async (newStatus: string) => {
    setLoading(true);
    
    const { error } = await supabase
      .from('tickets')
      .update({ status: newStatus })
      .eq('id', ticketId);

    if (!error && onStatusChange) {
      onStatusChange(newStatus);
    }

    setLoading(false);
  };

  // Status badge colors
  const colors = {
    OPEN: 'bg-blue-500/10 text-blue-500',
    IN_PROGRESS: 'bg-purple-500/10 text-purple-500',
    RESOLVED: 'bg-green-500/10 text-green-500',
    CLOSED: 'bg-gray-500/10 text-gray-500'
  };

  // If user is a customer, just show the status badge
  if (userRole === 'CUSTOMER') {
    return (
      <Badge className={`${colors[currentStatus]} border-0`}>
        {currentStatus.replace('_', ' ')}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge className={`${colors[currentStatus]} border-0`}>
        {currentStatus.replace('_', ' ')}
      </Badge>
      
      {/* Status control buttons */}
      {currentStatus !== 'RESOLVED' && (userRole === 'ADMIN' || userRole === 'AGENT') && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange('RESOLVED')}
          disabled={loading}
          className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
        >
          Mark Resolved
        </Button>
      )}
      
      {/* Only ADMIN can close tickets */}
      {currentStatus !== 'CLOSED' && userRole === 'ADMIN' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleStatusChange('CLOSED')}
          disabled={loading}
          className="text-gray-500 hover:text-gray-400 hover:bg-gray-500/10"
        >
          Close Ticket
        </Button>
      )}
    </div>
  );
} 