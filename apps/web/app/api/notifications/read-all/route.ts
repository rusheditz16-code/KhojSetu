import { NextResponse } from 'next/server';
import { serverStore } from '../../../../lib/server-store';

export async function PATCH(request: Request) {
  const userId = request.headers.get('x-user-id') || 'usr-priya-01';
  serverStore.markAllNotificationsRead(userId);
  return NextResponse.json({ success: true });
}
