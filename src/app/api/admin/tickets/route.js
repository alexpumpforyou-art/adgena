import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getAllTickets, getTicketById, addTicketMessage, updateTicketStatus, isStaff, updateUserRole, updateUserCredits } from '@/lib/db';

// GET — list all tickets (admin/support only)
export async function GET(request) {
  const user = await getCurrentUser(request);
  if (!user || !isStaff(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const tickets = getAllTickets(status || null);

  return NextResponse.json({ tickets });
}

// POST — reply to ticket or update status
export async function POST(request) {
  const user = await getCurrentUser(request);
  if (!user || !isStaff(user.id)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { action, ticketId, message, status, userId, role, credits } = await request.json();

  // Reply to ticket
  if (action === 'reply' && ticketId && message) {
    addTicketMessage(ticketId, user.id, message, true);
    updateTicketStatus(ticketId, 'answered');
    return NextResponse.json({ success: true });
  }

  // Close/reopen ticket
  if (action === 'status' && ticketId && status) {
    updateTicketStatus(ticketId, status);
    return NextResponse.json({ success: true });
  }

  // Set user role (admin only)
  if (action === 'setRole' && userId && role) {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    if (!adminEmails.includes(user.email?.toLowerCase())) {
      return NextResponse.json({ error: 'Only admins can set roles' }, { status: 403 });
    }
    updateUserRole(userId, role);
    return NextResponse.json({ success: true });
  }

  // Add credits
  if (action === 'addCredits' && userId && credits) {
    updateUserCredits(userId, parseInt(credits));
    return NextResponse.json({ success: true });
  }

  // Get ticket details
  if (action === 'details' && ticketId) {
    const ticket = getTicketById(ticketId);
    if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ ticket });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
