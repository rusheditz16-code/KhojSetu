import { NextResponse } from 'next/server';
import { serverStore } from '../../../../../lib/server-store';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const item = serverStore.updateItemStatus(params.id, body.status);
    if (!item) {
      return NextResponse.json({ message: 'Item not found' }, { status: 404 });
    }
    return NextResponse.json({ item });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
