import { NextResponse } from 'next/server';
import { serverStore } from '../../../../lib/server-store';

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id');
  if (!userId) {
    return NextResponse.json({ user: null });
  }
  const user = serverStore.getUserById(userId) || null;
  return NextResponse.json({ user });
}
