import { NextResponse } from 'next/server';
import { serverStore } from '../../../../../lib/server-store';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const notif = serverStore.markNotificationRead(params.id);
  return NextResponse.json({ success: true, notification: notif });
}
