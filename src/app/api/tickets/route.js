import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createTicket, getTicketsByUser } from '@/lib/db';

// GET — list user's tickets
export async function GET(request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const tickets = getTicketsByUser(user.id);
  return NextResponse.json({ tickets });
}

// POST — create a new ticket
export async function POST(request) {
  const user = await getCurrentUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { subject, message } = await request.json();

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'Укажите тему и описание' }, { status: 400 });
  }

  const ticketId = createTicket(user.id, subject.trim(), message.trim());
  console.log('[Ticket] Created:', ticketId, 'by:', user.email, 'subject:', subject);

  return NextResponse.json({ success: true, ticketId });
}
