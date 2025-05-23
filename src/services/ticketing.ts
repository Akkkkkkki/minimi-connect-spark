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

// Get ticket type availability for an event
export async function getTicketTypeAvailability(eventId: string) {
  // Fetch all ticket types for the event
  const { data: types, error: typeError } = await supabase
    .from('ticket_type')
    .select('*')
    .eq('event_id', eventId);
  if (typeError) return { error: typeError };
  // Fetch all reserved and waitlisted tickets for the event
  const { data: tickets, error: ticketError } = await supabase
    .from('event_ticket')
    .select('ticket_type_id, status')
    .eq('event_id', eventId);
  if (ticketError) return { error: ticketError };
  // Count reserved and waitlisted per type
  const result = types.map(type => {
    const reservedCount = tickets.filter(t => t.ticket_type_id === type.id && t.status === 'reserved').length;
    const waitlistedCount = tickets.filter(t => t.ticket_type_id === type.id && t.status === 'waitlisted').length;
    return {
      ...type,
      reservedCount,
      waitlistedCount,
      available: (type.quantity ?? 0) - reservedCount,
      isFull: (type.quantity ?? 0) - reservedCount <= 0,
    };
  });
  return { data: result };
}

// Get user's ticket status for an event
export async function getUserTicketStatus(eventId: string, profileId: string) {
  const { data, error } = await supabase
    .from('event_ticket')
    .select('*')
    .eq('event_id', eventId)
    .eq('profile_id', profileId)
    .order('reserved_at', { ascending: true });
  if (error) return { error };
  if (!data || data.length === 0) return { status: 'none' };
  // Return the most recent ticket
  return { status: data[0].status, ticket: data[0] };
}

// Reserve a ticket or join waitlist
export async function reserveOrWaitlistTicket({ eventId, ticketTypeId, profileId, allowWaitlist }: { eventId: string; ticketTypeId: string; profileId: string; allowWaitlist: boolean; }) {
  // Get ticket type info
  const { data: typeData, error: typeError } = await supabase
    .from('ticket_type')
    .select('quantity')
    .eq('id', ticketTypeId)
    .single();
  if (typeError) return { error: typeError };
  // Count reserved tickets
  const { data: reservedTickets, error: reservedError } = await supabase
    .from('event_ticket')
    .select('id')
    .eq('event_id', eventId)
    .eq('ticket_type_id', ticketTypeId)
    .eq('status', 'reserved');
  if (reservedError) return { error: reservedError };
  const reservedCount = reservedTickets.length;
  if (reservedCount < (typeData.quantity ?? 0)) {
    // Reserve ticket
    return reserveFreeTicket({ eventId, ticketTypeId, profileId });
  } else if (allowWaitlist) {
    // Add to waitlist
    // Find current max waitlist position
    const { data: waitlist, error: waitlistError } = await supabase
      .from('event_ticket')
      .select('waitlist_position')
      .eq('event_id', eventId)
      .eq('ticket_type_id', ticketTypeId)
      .eq('status', 'waitlisted');
    if (waitlistError) return { error: waitlistError };
    const maxPosition = waitlist.reduce((max, t) => Math.max(max, t.waitlist_position || 0), 0);
    return supabase.from('event_ticket').insert({
      event_id: eventId,
      ticket_type_id: ticketTypeId,
      profile_id: profileId,
      status: 'waitlisted',
      price_paid: 0,
      waitlist_position: maxPosition + 1,
    });
  } else {
    return { error: { message: 'Tickets are full and waitlist is not enabled.' } };
  }
}

// Promote next waitlisted user when a ticket is cancelled
export async function promoteWaitlistedUser(eventId: string, ticketTypeId: string) {
  // Find the next waitlisted ticket
  const { data: waitlist, error } = await supabase
    .from('event_ticket')
    .select('*')
    .eq('event_id', eventId)
    .eq('ticket_type_id', ticketTypeId)
    .eq('status', 'waitlisted')
    .order('waitlist_position', { ascending: true })
    .limit(1);
  if (error || !waitlist || waitlist.length === 0) return;
  const ticketId = waitlist[0].id;
  // Promote to reserved
  await supabase
    .from('event_ticket')
    .update({ status: 'reserved', waitlist_position: null })
    .eq('id', ticketId);
}

// Export ticket holders for an event (returns array of objects)
export async function exportTicketHolders(eventId: string) {
  const { data, error } = await supabase
    .from('event_ticket')
    .select('id, profile:profile_id (first_name, last_name, email), ticket_type:ticket_type_id (name), status, reserved_at')
    .eq('event_id', eventId);
  if (error) return { error };
  return { data };
} 