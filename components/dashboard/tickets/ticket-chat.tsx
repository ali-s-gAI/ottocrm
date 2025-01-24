'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { User } from '@supabase/supabase-js';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: string;
  message_text: string;
  created_at: string;
  sender_id: string;
  is_internal: boolean;
  user_profile?: {
    full_name: string;
  };
}

interface TicketChatProps {
  ticketId: string;
  currentUser: User;
  userRole: string;
}

export function TicketChat({ ticketId, currentUser, userRole }: TicketChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchMessages();
    const channel = supabase
      .channel(`ticket_${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ticket_messages',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ticketId]);

  async function fetchMessages() {
    const { data, error } = await supabase
      .from('ticket_messages')
      .select(`
        *,
        user_profile:user_profiles!sender_id(full_name)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    setMessages(data || []);
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    const { error } = await supabase.from('ticket_messages').insert({
      ticket_id: ticketId,
      message_text: newMessage.trim(),
      sender_id: currentUser.id,
      is_internal: userRole === 'ADMIN' || userRole === 'AGENT' ? true : false
    });

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setNewMessage('');
    }
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.sender_id === currentUser.id ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender_id === currentUser.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted'
              } ${message.is_internal ? 'border-l-4 border-yellow-500' : ''}`}
            >
              <div className="text-sm font-medium mb-1">
                {message.user_profile?.full_name}
                {message.is_internal && ' (Internal)'}
              </div>
              <div className="break-words">{message.message_text}</div>
              <div className="text-xs mt-1 opacity-70">
                {formatDistanceToNow(new Date(message.created_at), {
                  addSuffix: true,
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="mt-auto">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[80px]"
          />
          <Button type="submit" disabled={isLoading || !newMessage.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
