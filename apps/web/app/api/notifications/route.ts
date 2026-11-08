import { NextResponse } from 'next/server';
import { serverStore } from '../../../lib/server-store';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id') || 'usr-priya-01';
  const notifications = serverStore.getNotifications(userId);
  return NextResponse.json({ notifications });
}
