import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { setOnboarded } from '@/lib/db';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    setOnboarded(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
