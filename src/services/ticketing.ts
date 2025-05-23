import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Fetch ticket settings for an event
export async function getEventTicketSetting(eventId: string) {
  return supabase
    .from('event_ticket_setting')
    .select('*')
    .eq('event_id', eventId)
    .single();
}

// Fetch ticket types for an event
export async function getTicketTypes(eventId: string) {
  return supabase
    .from('ticket_type')
    .select('*')
    .eq('event_id', eventId);
}

// Fetch tickets for a user
export async function getUserTickets(profileId: string) {
  return supabase
    .from('event_ticket')
    .select('*, ticket_type(*), event(*)')
    .eq('profile_id', profileId);
}

// Fetch tickets for an event
export async function getEventTickets(eventId: string) {
  return supabase
    .from('event_ticket')
    .select('*, profile(*)')
    .eq('event_id', eventId);
}

// Reserve a ticket (free)
export async function reserveFreeTicket({
  eventId,
  ticketTypeId,
  profileId,
}: {
  eventId: string;
  ticketTypeId: string;
  profileId: string;
}) {
  return supabase.from('event_ticket').insert({
    event_id: eventId,
    ticket_type_id: ticketTypeId,
    profile_id: profileId,
    status: 'reserved',
    price_paid: 0,
  });
}

// Check if user has reached ticket limit for event/type
export async function checkUserTicketLimit({
  eventId,
  ticketTypeId,
  profileId,
  maxPerUser,
}: {
  eventId: string;
  ticketTypeId: string;
  profileId: string;
  maxPerUser: number;
}) {
  const { data, error } = await supabase
    .from('event_ticket')
    .select('id', { count: 'exact' })
    .eq('event_id', eventId)
    .eq('ticket_type_id', ticketTypeId)
    .eq('profile_id', profileId)
    .eq('status', 'reserved');
  if (error) return { allowed: false, error };
  return { allowed: (data?.length || 0) < maxPerUser, error: null };
} 