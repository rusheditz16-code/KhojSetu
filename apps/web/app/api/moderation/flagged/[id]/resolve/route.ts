import { NextResponse } from 'next/server';
import { serverStore } from '../../../../../../lib/server-store';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const item = serverStore.resolveFlag(params.id, body.action || 'dismiss', body.resolutionNotes);
    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 400 });
  }
}
