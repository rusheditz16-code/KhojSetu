import { NextResponse } from 'next/server';
import { serverStore } from '../../../../lib/server-store';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const item = serverStore.getItemById(params.id);
  if (!item) {
    return NextResponse.json({ message: 'Item not found' }, { status: 404 });
  }
  return NextResponse.json({ item });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const deleted = serverStore.deleteItem(params.id);
  if (!deleted) {
    return NextResponse.json({ message: 'Item not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true, message: 'Item deleted' });
}
