import { NextResponse } from 'next/server';
import { serverStore } from '../../../../../lib/server-store';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const userId = request.headers.get('x-user-id') || 'usr-priya-01';
    const user = serverStore.getUserById(userId);
    const isModerator = user?.role === 'MODERATOR' || user?.role === 'ADMIN';

    const claims = serverStore.getClaimsByItem(params.id, userId, isModerator);
    return NextResponse.json({ claims });
  } catch (err: any) {
    const status = err.message.includes('403') ? 403 : 400;
    return NextResponse.json({ message: err.message }, { status });
  }
}
