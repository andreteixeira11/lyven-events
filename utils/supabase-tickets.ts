import { supabase } from './supabase';
import { DbTicket } from '@/types/database';
import { PurchasedTicket, QRTicket } from '@/types/event';

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

export function mapDbTicketToPurchasedTicket(dbTicket: DbTicket): PurchasedTicket {
  return {
    id: dbTicket.id,
    eventId: dbTicket.event_id,
    ticketTypeId: dbTicket.ticket_type_id,
    quantity: dbTicket.quantity,
    purchaseDate: new Date(dbTicket.purchase_date),
    qrCode: dbTicket.qr_code,
    addedToCalendar: dbTicket.added_to_calendar ?? undefined,
    reminderSet: dbTicket.reminder_set ?? undefined,
  };
}

export function mapDbTicketToQRTicket(dbTicket: DbTicket): QRTicket {
  return {
    id: dbTicket.id,
    eventId: dbTicket.event_id,
    ticketTypeId: dbTicket.ticket_type_id,
    userId: dbTicket.user_id,
    qrCode: dbTicket.qr_code,
    isUsed: dbTicket.is_used,
    purchaseDate: new Date(dbTicket.purchase_date),
    validUntil: new Date(dbTicket.valid_until),
  };
}

export async function fetchTicketsByUser(userId: string): Promise<PurchasedTicket[]> {
  try {
    console.log('📡 Fetching tickets for user:', userId);
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('user_id', userId)
      .order('purchase_date', { ascending: false });

    if (error || !data) {
      console.error('❌ Error fetching tickets:', error);
      return [];
    }

    console.log(`✅ Fetched ${data.length} tickets`);
    return (data as DbTicket[]).map(mapDbTicketToPurchasedTicket);
  } catch (error) {
    console.error('❌ Error in fetchTicketsByUser:', error);
    return [];
  }
}

export async function fetchTicketById(ticketId: string): Promise<QRTicket | null> {
  try {
    console.log('📡 Fetching ticket by ID:', ticketId);
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('id', ticketId)
      .single();

    if (error || !data) {
      console.error('❌ Error fetching ticket:', error);
      return null;
    }

    return mapDbTicketToQRTicket(data as DbTicket);
  } catch (error) {
    console.error('❌ Error in fetchTicketById:', error);
    return null;
  }
}

export async function fetchTicketByQRCode(qrCode: string): Promise<QRTicket | null> {
  try {
    console.log('📡 Fetching ticket by QR code');
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('qr_code', qrCode)
      .single();

    if (error || !data) {
      console.error('❌ Error fetching ticket by QR:', error);
      return null;
    }

    return mapDbTicketToQRTicket(data as DbTicket);
  } catch (error) {
    console.error('❌ Error in fetchTicketByQRCode:', error);
    return null;
  }
}

export async function createTicket(ticket: {
  eventId: string;
  userId: string;
  ticketTypeId: string;
  quantity: number;
  price: number;
  qrCode: string;
  validUntil: string;
}): Promise<DbTicket | null> {
  try {
    console.log('📡 Creating ticket in Supabase');
    const id = generateId();
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        id,
        event_id: ticket.eventId,
        user_id: ticket.userId,
        ticket_type_id: ticket.ticketTypeId,
        quantity: ticket.quantity,
        price: ticket.price,
        qr_code: ticket.qrCode,
        is_used: false,
        valid_until: ticket.validUntil,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating ticket:', error);
      return null;
    }

    console.log('✅ Ticket created:', id);
    return data as DbTicket;
  } catch (error) {
    console.error('❌ Error in createTicket:', error);
    return null;
  }
}

export async function createTicketsBatch(
  tickets: {
    id: string;
    eventId: string;
    userId: string;
    ticketTypeId: string;
    quantity: number;
    price: number;
    qrCode: string;
    validUntil: string;
  }[]
): Promise<boolean> {
  try {
    console.log('📡 Creating batch tickets in Supabase:', tickets.length);
    const rows = tickets.map((t) => ({
      id: t.id,
      event_id: t.eventId,
      user_id: t.userId,
      ticket_type_id: t.ticketTypeId,
      quantity: t.quantity,
      price: t.price,
      qr_code: t.qrCode,
      is_used: false,
      valid_until: t.validUntil,
    }));

    const { error } = await supabase.from('tickets').insert(rows);

    if (error) {
      console.error('❌ Error creating batch tickets:', error);
      return false;
    }

    console.log('✅ Batch tickets created');
    return true;
  } catch (error) {
    console.error('❌ Error in createTicketsBatch:', error);
    return false;
  }
}

export async function validateTicket(
  ticketId: string,
  validatedBy: string
): Promise<boolean> {
  try {
    console.log('📡 Validating ticket:', ticketId);
    const { error } = await supabase
      .from('tickets')
      .update({
        is_used: true,
        validated_at: new Date().toISOString(),
        validated_by: validatedBy,
      })
      .eq('id', ticketId);

    if (error) {
      console.error('❌ Error validating ticket:', error);
      return false;
    }

    console.log('✅ Ticket validated:', ticketId);
    return true;
  } catch (error) {
    console.error('❌ Error in validateTicket:', error);
    return false;
  }
}

export async function fetchTicketsByEvent(eventId: string): Promise<QRTicket[]> {
  try {
    console.log('📡 Fetching tickets for event:', eventId);
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('event_id', eventId)
      .order('purchase_date', { ascending: false });

    if (error || !data) {
      console.error('❌ Error fetching event tickets:', error);
      return [];
    }

    return (data as DbTicket[]).map(mapDbTicketToQRTicket);
  } catch (error) {
    console.error('❌ Error in fetchTicketsByEvent:', error);
    return [];
  }
}

export async function updateTicketCalendarStatus(
  ticketId: string,
  addedToCalendar: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tickets')
      .update({ added_to_calendar: addedToCalendar })
      .eq('id', ticketId);

    if (error) {
      console.error('❌ Error updating calendar status:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('❌ Error in updateTicketCalendarStatus:', error);
    return false;
  }
}

export async function updateTicketReminderStatus(
  ticketId: string,
  reminderSet: boolean
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('tickets')
      .update({ reminder_set: reminderSet })
      .eq('id', ticketId);

    if (error) {
      console.error('❌ Error updating reminder status:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('❌ Error in updateTicketReminderStatus:', error);
    return false;
  }
}

export async function getTicketCountForEvent(eventId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId);

    if (error) {
      console.error('❌ Error counting tickets:', error);
      return 0;
    }

    return count ?? 0;
  } catch (error) {
    console.error('❌ Error in getTicketCountForEvent:', error);
    return 0;
  }
}
