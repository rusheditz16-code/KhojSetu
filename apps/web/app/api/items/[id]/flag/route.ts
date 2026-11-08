import { NextResponse } from 'next/server';
import { serverStore } from '../../../../../lib/server-store';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const item = serverStore.flagItem(params.id, body.reason || 'Flagged by student');
    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
